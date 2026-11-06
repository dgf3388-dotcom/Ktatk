// الترجمة: العربية هي النص الأصلي داخل HTML، وهنا الإنجليزية + رسائل JS.
(function(){
const EN={
brand:"Qat'atuk",nav_home:"Home",nav_request:"Request a part",nav_how:"How it works",nav_about:"About us",nav_contact:"Contact us",
cta_request:"Request a part",tagline:"We search for it, we source it for you.",
hero_title:"Looking for a spare part? Let us find it for you.",
hero_desc:"Whatever your car or the part you need, we search multiple sources and source it for you — new or used, genuine or aftermarket.",
why_title:"Why choose Qat'atuk?",why_sub:"We do the searching on your behalf until the right part reaches you.",
f1_t:"Rare parts search",f1_d:"We reach parts that are hard to find in usual stores.",
f2_t:"Genuine & aftermarket options",f2_d:"Choose what fits your budget and your car.",
f3_t:"New & used parts",f3_d:"We source both, depending on your request and availability.",
f4_t:"Multiple suppliers",f4_d:"Inside and outside Saudi Arabia, so we can compare options for you.",
f5_t:"Shipping across Saudi Arabia",f5_d:"We deliver the part to your city after agreement.",
how_title:"How does it work?",how_sub:"Four simple steps.",
s1:"Send your request.",s2:"We search for the part.",s3:"We contact you with options and prices.",s4:"After agreement, we buy the part and ship it to you.",
req_title:"Request a spare part",req_sub:"Fill in your car and part details and we will get back to you with the available options.",
cfg_warn:"Request intake is not active yet (Supabase is not configured in config.js).",
p1:"Car details",p2:"Part details",p3:"Your details",
l_make:"Car make",l_model:"Model",l_year:"Year",l_trim:"Trim",l_engine:"Engine type",l_vin:"VIN",opt:"(optional)",ph_engine:"e.g. 2.5L petrol",
l_part:"Part name",l_partno:"Part number",l_cond:"Part condition",c_new:"New",c_used:"Used",any:"Doesn't matter",
l_type:"Part type",t_orig:"Genuine",t_after:"Aftermarket",l_desc:"Detailed description",l_imgs:"Photos of the part or damaged area",l_imgs_h:"(up to 6, 5MB each)",
l_name:"Name",l_phone:"Mobile number",l_city:"City",l_contact:"Preferred contact method",m_wa:"WhatsApp",m_call:"Phone call",m_sms:"SMS",
back:"Back",next:"Next",submit:"Submit part request",
ok_title:"Your request is ready to send",ok_msg:"Tap Send inside WhatsApp so your request reaches the Qat'atuk team. The request is not received until you send the message.",new_req:"New request",wa_send:"Open WhatsApp and send the request",wa_note:"If WhatsApp did not open automatically, tap the button. Keep your request number.",img_note:"To attach part photos: after WhatsApp opens, send them in the same chat before or after the message.",
about_title:"About us",about_txt:"Qat'atuk is a Saudi platform specialized in receiving requests to find car spare parts and source them on demand. We are not a traditional store and hold no fixed stock; we search suppliers inside and outside Saudi Arabia, then present you with the available options and prices. Agreement, payment, purchase and shipping all happen outside the site through direct contact with you.",
band_t:"Ready to find your part?",band_d:"Send your request now and let us do the searching.",
ct_phone:"Call us",ct_wa:"WhatsApp",ct_wa_btn:"Start a chat"};
const JS={
ar:{required:"هذا الحقل مطلوب",phone:"أدخل رقم جوال سعودي صحيحاً (05xxxxxxxx)",vin:"رقم الهيكل يجب أن يكون 17 خانة (بدون I وO وQ)",
imgs_max:"الحد الأقصى 6 صور",img_type:"الصور المسموحة: JPG أو PNG أو WEBP",img_size:"حجم الصورة يجب ألا يتجاوز 5MB",
fix:"يرجى تصحيح الحقول المظللة.",sending:"جارٍ الإرسال...",fail:"تعذر إرسال الطلب. حاول مرة أخرى بعد قليل.",
no_cfg:"خدمة الطلبات غير مفعّلة حالياً. يرجى التواصل معنا مباشرة.",pick:"اختر",other:"أخرى"},
en:{required:"This field is required",phone:"Enter a valid Saudi mobile number (05xxxxxxxx)",vin:"VIN must be 17 characters (no I, O or Q)",
imgs_max:"Maximum 6 images",img_type:"Allowed images: JPG, PNG or WEBP",img_size:"Each image must be 5MB or less",
fix:"Please correct the highlighted fields.",sending:"Sending...",fail:"Could not submit the request. Please try again shortly.",
no_cfg:"Request service is not active right now. Please contact us directly.",pick:"Select",other:"Other"}};
const AR={};
document.querySelectorAll('[data-i18n]').forEach(e=>AR[e.dataset.i18n]=AR[e.dataset.i18n]||e.textContent);
const ARPH={};document.querySelectorAll('[data-i18n-ph]').forEach(e=>ARPH[e.dataset.i18nPh]=e.getAttribute('placeholder'));
const ENPH={ph_engine:EN.ph_engine};
let lang=localStorage.getItem('qt_lang')||'ar';
window.QT_I18N={get lang(){return lang},t:k=>JS[lang][k]||k,onChange:[],
 set(l){lang=l;try{localStorage.setItem('qt_lang',l)}catch(e){}apply()}};
function apply(){
 document.documentElement.lang=lang;document.documentElement.dir=lang==='ar'?'rtl':'ltr';
 document.body.style.fontFamily=lang==='ar'?"'Cairo','IBM Plex Sans Arabic',system-ui,sans-serif":"'Cairo',system-ui,sans-serif";
 document.querySelectorAll('[data-i18n]').forEach(e=>{const k=e.dataset.i18n;e.textContent=lang==='ar'?AR[k]:(EN[k]||AR[k])});
 document.querySelectorAll('[data-i18n-ph]').forEach(e=>e.setAttribute('placeholder',(lang==='ar'?ARPH:ENPH)[e.dataset.i18nPh]));
 document.title=lang==='ar'?'قطعتك | نبحث عنها، نوفرها لك':"Qat'atuk | We search for it, we source it for you";
 const b=document.getElementById('langBtn');if(b)b.textContent=lang==='ar'?'English':'العربية';
 QT_I18N.onChange.forEach(f=>f());
}
document.addEventListener('DOMContentLoaded',()=>{});
window.QT_I18N.apply=apply;
})();
