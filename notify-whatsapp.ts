// Supabase Edge Function (اختيارية): إشعار واتساب للإدارة عند وصول طلب جديد.
// غير مفعّلة حتى تضيف المتغيرات التالية (supabase secrets set ...) وتربطها بـ Database Webhook على INSERT في part_requests:
//   WHATSAPP_TOKEN, WHATSAPP_PHONE_NUMBER_ID, ADMIN_WHATSAPP_NUMBER (بالصيغة الدولية بدون +), WHATSAPP_TEMPLATE (قالب معتمد من Meta)
// ملاحظة: الرسائل التي تبدأها الشركة تتطلب قالباً معتمداً في WhatsApp Business Cloud API.
Deno.serve(async (req) => {
  const env = (k: string) => Deno.env.get(k);
  const token = env("WHATSAPP_TOKEN"), pid = env("WHATSAPP_PHONE_NUMBER_ID"), to = env("ADMIN_WHATSAPP_NUMBER"), tpl = env("WHATSAPP_TEMPLATE");
  if (!token || !pid || !to || !tpl) return new Response("WhatsApp not configured", { status: 200 });
  const { record } = await req.json();
  const r = await fetch(`https://graph.facebook.com/v20.0/${pid}/messages`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      messaging_product: "whatsapp", to, type: "template",
      template: { name: tpl, language: { code: "ar" }, components: [{ type: "body", parameters: [
        { type: "text", text: record.request_number }, { type: "text", text: `${record.car_make} ${record.car_model}` }, { type: "text", text: record.part_name } ] }] },
    }),
  });
  return new Response(await r.text(), { status: r.status });
});
