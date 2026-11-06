(function(){
const cfg=window.QT_CONFIG||{};
const $=s=>document.querySelector(s),$$=s=>[...document.querySelectorAll(s)];
const T=k=>QT_I18N.t(k);

const MAKES=[["تويوتا","Toyota"],["هيونداي","Hyundai"],["كيا","Kia"],["نيسان","Nissan"],["فورد","Ford"],["شيفروليه","Chevrolet"],["جي إم سي","GMC"],["دودج","Dodge"],["جيب","Jeep"],["لكزس","Lexus"],["هوندا","Honda"],["مازدا","Mazda"],["ميتسوبيشي","Mitsubishi"],["سوزوكي","Suzuki"],["إيسوزو","Isuzu"],["مرسيدس","Mercedes-Benz"],["بي إم دبليو","BMW"],["أودي","Audi"],["فولكسفاجن","Volkswagen"],["لاند روفر","Land Rover"],["بورشه","Porsche"],["جيلي","Geely"],["شانجان","Changan"],["هافال","Haval"],["إم جي","MG"],["كاديلاك","Cadillac"],["إنفينيتي","Infiniti"],["أخرى","Other"]];
const CITIES=[["الرياض","Riyadh"],["جدة","Jeddah"],["مكة المكرمة","Makkah"],["المدينة المنورة","Madinah"],["الدمام","Dammam"],["الخبر","Khobar"],["الظهران","Dhahran"],["الأحساء","Al-Ahsa"],["الجبيل","Jubail"],["القطيف","Qatif"],["الطائف","Taif"],["بريدة","Buraydah"],["عنيزة","Unaizah"],["حائل","Hail"],["تبوك","Tabuk"],["أبها","Abha"],["خميس مشيط","Khamis Mushait"],["جازان","Jazan"],["نجران","Najran"],["الباحة","Al-Baha"],["سكاكا","Sakaka"],["عرعر","Arar"],["ينبع","Yanbu"],["حفر الباطن","Hafar Al-Batin"],["الخرج","Al-Kharj"],["أخرى","Other"]];

function fill(){
  const fillSel=(id,list)=>{const s=$(id),cur=s.value;s.innerHTML='';
    const p=new Option(T('pick')+' ...','');s.add(p);
    list.forEach(([a,e])=>s.add(new Option(QT_I18N.lang==='ar'?a:e,a)));s.value=cur;};
  fillSel('#car_make',MAKES);fillSel('#city',CITIES);
  const y=$('#car_year'),cur=y.value;y.innerHTML='';y.add(new Option(T('pick')+' ...',''));
  for(let i=new Date().getFullYear()+1;i>=1980;i--)y.add(new Option(i,i));y.value=cur;
}
QT_I18N.onChange.push(fill);
QT_I18N.apply();
$('#langBtn').onclick=()=>QT_I18N.set(QT_I18N.lang==='ar'?'en':'ar');
$('#burger').onclick=()=>$('#menu').classList.toggle('open');
$$('#menu a').forEach(a=>a.onclick=()=>$('#menu').classList.remove('open'));
$('#yr').textContent=new Date().getFullYear();
$('#phoneLink').textContent=cfg.CONTACT_PHONE_DISPLAY||'';$('#phoneLink').href='tel:'+(cfg.CONTACT_PHONE_DISPLAY||'');
$('#waLink').href='https://wa.me/'+(cfg.WHATSAPP_NUMBER||'');

/* steps */
let step=0;const panes=$$('.step-pane'),bars=$$('#progress div');
function show(n){step=n;panes.forEach((p,i)=>p.classList.toggle('show',i===n));
  bars.forEach((b,i)=>{b.classList.toggle('active',i===n);b.classList.toggle('done',i<n)});
  $('#backBtn').style.visibility=n?'visible':'hidden';$('#nextBtn').hidden=n===2;$('#submitBtn').hidden=n!==2;$('#formErr').hidden=true;}
function setErr(el,msg){el.classList.toggle('invalid',!!msg);const e=el.parentElement.querySelector('.err');if(e)e.textContent=msg||'';return !msg;}
function normPhone(v){v=v.replace(/[\s\-()]/g,'').replace(/[٠-٩]/g,d=>'٠١٢٣٤٥٦٧٨٩'.indexOf(d));
  if(/^(\+?966|00966)5\d{8}$/.test(v))return '0'+v.replace(/^(\+?966|00966)/,'');return v;}
const rules={
  0:[['#car_make',v=>v?'':T('required')],['#car_model',v=>v.trim()?'':T('required')],['#car_year',v=>v?'':T('required')],
     ['#vin',v=>!v||/^[A-HJ-NPR-Za-hj-npr-z0-9]{17}$/.test(v.trim())?'':T('vin')]],
  1:[['#part_name',v=>v.trim().length>=2?'':T('required')]],
  2:[['#customer_name',v=>v.trim().length>=2?'':T('required')],['#phone',v=>/^05\d{8}$/.test(normPhone(v))?'':T('phone')],['#city',v=>v?'':T('required')]]};
function validate(n){let ok=true;rules[n].forEach(([s,f])=>{const el=$(s);if(!setErr(el,f(el.value)))ok=false;});
  if(!ok){const e=$('#formErr');e.textContent=T('fix');e.hidden=false;}return ok;}
$('#nextBtn').onclick=()=>{if(validate(step))show(step+1)};
$('#backBtn').onclick=()=>show(step-1);
$$('input,select,textarea').forEach(el=>el.addEventListener('input',()=>el.classList.remove('invalid')));


/* واتساب */
function genNo(){const r=crypto.getRandomValues(new Uint32Array(1))[0].toString(36).toUpperCase().padStart(6,'0').slice(-6);return 'QT-'+String(new Date().getFullYear()).slice(2)+'-'+r;}
function buildWa(no,p){
  const L=QT_I18N.lang==='ar',sel=s=>$(s).selectedOptions[0].textContent;
  const lines=[L?'طلب توفير قطعة غيار جديد':'New spare part request',
    (L?'رقم الطلب: ':'Request no: ')+no,'',
    (L?'الاسم: ':'Name: ')+p.name,(L?'الجوال: ':'Mobile: ')+p.phone,(L?'المدينة: ':'City: ')+sel('#city'),(L?'وسيلة التواصل: ':'Contact: ')+sel('#contact_method'),'',
    (L?'السيارة: ':'Car: ')+[sel('#car_make'),p.model,p.year,p.trim].filter(Boolean).join(' '),
    p.engine?(L?'المحرك: ':'Engine: ')+p.engine:'',p.vin?'VIN: '+p.vin:'','',
    (L?'القطعة: ':'Part: ')+p.part+(p.partno?' ('+p.partno+')':''),
    (L?'الحالة: ':'Condition: ')+sel('#part_condition')+' / '+sel('#part_type'),
    p.desc?(L?'الوصف: ':'Details: ')+p.desc:''].filter((x,i,arr)=>x!==''||arr[i-1]!=='');
  return 'https://wa.me/'+(cfg.WHATSAPP_NUMBER||'')+'?text='+encodeURIComponent(lines.join('\n'));
}
$('#reqForm').addEventListener('submit',ev=>{
  ev.preventDefault();
  for(const n of [0,1,2]){if(!validate(n)){show(n);validate(n);return}}
  if($('#website').value)return; // honeypot
  const g=s=>$(s).value.trim();
  const no=genNo();
  const wa=buildWa(no,{name:g('#customer_name'),phone:normPhone(g('#phone')),model:g('#car_model'),year:g('#car_year'),trim:g('#car_trim'),engine:g('#engine'),vin:g('#vin').toUpperCase(),part:g('#part_name'),partno:g('#part_number'),desc:g('#description')});
  $('#reqNo').textContent=no;$('#waSend').href=wa;$('#reqForm').hidden=true;$('#successBox').hidden=false;
  $('#request').scrollIntoView({behavior:'smooth'});
  try{window.open(wa,'_blank','noopener')}catch(_){}
});
$('#newReq').onclick=()=>{$('#reqForm').reset();$('#reqForm').hidden=false;$('#successBox').hidden=true;show(0);};
show(0);
})();
