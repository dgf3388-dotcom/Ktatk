(function(){
const cfg=window.QT_CONFIG||{};
const $=s=>document.querySelector(s);
const ST={new:'طلب جديد',searching:'قيد البحث',found:'تم العثور على القطعة',quote_sent:'تم إرسال عرض السعر',awaiting_customer:'بانتظار موافقة العميل',agreed:'تم الاتفاق',purchased:'تم شراء القطعة',shipped:'تم الشحن',completed:'مكتمل',unavailable:'تعذر التوفير'};
const COND={new:'جديدة',used:'مستعملة',any:'لا يهم'},TYPE={original:'أصلية',aftermarket:'تجارية',any:'لا يهم'},CM={whatsapp:'واتساب',call:'اتصال',sms:'رسالة نصية'};
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
if(!cfg.SUPABASE_URL||!cfg.SUPABASE_ANON_KEY||!window.supabase){
  $('#loginView').hidden=false;$('#loginView').innerHTML='<h2>غير مُعدّ</h2><p>أضف بيانات Supabase في config.js أولاً.</p>';return;}
const sb=window.supabase.createClient(cfg.SUPABASE_URL,cfg.SUPABASE_ANON_KEY);
let all=[];

async function boot(){
  const {data:{session}}=await sb.auth.getSession();
  if(!session){$('#loginView').hidden=false;$('#appView').hidden=true;return}
  const {data:isAdmin,error}=await sb.rpc('is_admin');
  if(error||!isAdmin){await sb.auth.signOut();$('#loginView').hidden=false;$('#appView').hidden=true;
    const e=$('#loginErr');e.textContent='هذا الحساب غير مصرّح له بدخول لوحة الإدارة.';e.hidden=false;return}
  $('#loginView').hidden=true;$('#appView').hidden=false;load();
}
$('#loginBtn').onclick=async()=>{
  const e=$('#loginErr');e.hidden=true;
  const {error}=await sb.auth.signInWithPassword({email:$('#em').value.trim(),password:$('#pw').value});
  if(error){e.textContent='بيانات الدخول غير صحيحة.';e.hidden=false;return}
  boot();};
$('#logout').onclick=async()=>{await sb.auth.signOut();location.reload()};
$('#reload').onclick=load;
$('#fs').innerHTML='<option value="">كل الحالات</option>'+Object.entries(ST).map(([k,v])=>`<option value="${k}">${v}</option>`).join('');
['q','fs','arch'].forEach(i=>$('#'+i).addEventListener('input',render));

async function load(){
  const {data,error}=await sb.from('part_requests').select('*').order('created_at',{ascending:false});
  if(error){alert('تعذر تحميل الطلبات: '+error.message);return}
  all=data;render();
}
function render(){
  const act=all.filter(r=>!r.archived);
  const c=s=>act.filter(r=>r.status===s).length;
  $('#stats').innerHTML=[['إجمالي الطلبات',act.length],['الطلبات الجديدة',c('new')],['قيد البحث',c('searching')],['تم العثور على قطعها',c('found')],['المكتملة',c('completed')],['المتعذرة',c('unavailable')]]
    .map(([l,n])=>`<div class="stat"><b>${n}</b><span>${l}</span></div>`).join('');
  const q=$('#q').value.trim().toLowerCase(),fs=$('#fs').value,sa=$('#arch').checked;
  const list=all.filter(r=>(sa?true:!r.archived)&&(!fs||r.status===fs)&&(!q||[r.customer_name,r.phone,r.request_number].some(x=>String(x).toLowerCase().includes(q))));
  $('#empty').hidden=list.length>0;
  $('#rows').innerHTML=list.map(r=>`<tr class="row" data-id="${r.id}"><td dir="ltr">${esc(r.request_number)}</td><td>${esc(r.customer_name)}</td><td dir="ltr">${esc(r.phone)}</td><td>${esc(r.car_make)} ${esc(r.car_model)} ${esc(r.car_year)}</td><td>${esc(r.part_name)}</td><td><span class="badge ${r.status}">${ST[r.status]}</span>${r.archived?' 🗄':''}</td><td>${new Date(r.created_at).toLocaleDateString('ar-SA')}</td></tr>`).join('');
  document.querySelectorAll('tr.row').forEach(tr=>tr.onclick=()=>open(tr.dataset.id));
}
function waLink(r){
  const n='966'+r.phone.replace(/^0/,'');
  const m=`مرحباً ${r.customer_name}، معك فريق قطعتك بخصوص طلبك رقم ${r.request_number} (${r.part_name}).`;
  return `https://wa.me/${n}?text=${encodeURIComponent(m)}`;}
async function open(id){
  const r=all.find(x=>x.id===id);if(!r)return;
  let imgs='';
  if(r.image_paths&&r.image_paths.length){
    const {data}=await sb.storage.from('request-images').createSignedUrls(r.image_paths,3600);
    imgs='<div class="imgs">'+(data||[]).filter(d=>d.signedUrl).map(d=>`<a href="${esc(d.signedUrl)}" target="_blank" rel="noopener"><img src="${esc(d.signedUrl)}" alt=""></a>`).join('')+'</div>';
  }
  const kv=(k,v)=>`<div><b>${k}</b>${esc(v||'—')}</div>`;
  $('#panel').innerHTML=`<h3 style="color:var(--navy)">طلب <span dir="ltr">${esc(r.request_number)}</span></h3>
  <div class="kv">${kv('العميل',r.customer_name)}${kv('الجوال',r.phone)}${kv('المدينة',r.city)}${kv('وسيلة التواصل',CM[r.contact_method])}
  ${kv('السيارة',`${r.car_make} ${r.car_model} ${r.car_year}`)}${kv('الفئة',r.car_trim)}${kv('المحرك',r.engine)}${kv('رقم الهيكل',r.vin)}
  ${kv('القطعة',r.part_name)}${kv('رقم القطعة',r.part_number)}${kv('الحالة المطلوبة',COND[r.part_condition])}${kv('النوع المطلوب',TYPE[r.part_type])}
  <div style="grid-column:1/-1"><b>الوصف</b>${esc(r.description||'—')}</div>
  ${kv('تاريخ الطلب',new Date(r.created_at).toLocaleString('ar-SA'))}</div>${imgs}
  <label>حالة الطلب</label><select id="m_st">${Object.entries(ST).map(([k,v])=>`<option value="${k}" ${k===r.status?'selected':''}>${v}</option>`).join('')}</select>
  <label style="margin-top:10px">السعر المقترح (ريال)</label><input id="m_pr" type="number" min="0" step="0.01" value="${r.suggested_price??''}">
  <label style="margin-top:10px">ملاحظات داخلية</label><textarea id="m_nt" rows="3">${esc(r.internal_notes||'')}</textarea>
  <div class="row2"><button class="btn btn-primary" id="m_save">حفظ</button>
  <a class="btn btn-outline" target="_blank" rel="noopener" href="${waLink(r)}">تواصل عبر واتساب</a>
  <button class="btn btn-outline" id="m_arch">${r.archived?'إلغاء الأرشفة':'أرشفة'}</button>
  <button class="btn btn-outline" id="m_close">إغلاق</button></div><div id="m_msg" class="err" style="margin-top:8px"></div>`;
  $('#modal').classList.add('open');
  $('#m_close').onclick=()=>$('#modal').classList.remove('open');
  const upd=async f=>{const {error}=await sb.from('part_requests').update(f).eq('id',id);
    if(error){$('#m_msg').textContent='تعذر الحفظ: '+error.message;return false}await load();return true};
  $('#m_save').onclick=async()=>{const p=$('#m_pr').value;
    if(await upd({status:$('#m_st').value,internal_notes:$('#m_nt').value||null,suggested_price:p===''?null:+p}))$('#m_msg').textContent='✔ تم الحفظ';};
  $('#m_arch').onclick=async()=>{if(await upd({archived:!r.archived}))$('#modal').classList.remove('open')};
}
$('#modal').onclick=e=>{if(e.target.id==='modal')$('#modal').classList.remove('open')};
boot();
})();
