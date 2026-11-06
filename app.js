(function(){
const cfg=window.QT_CONFIG||{};
const ready=!!(cfg.SUPABASE_URL&&cfg.SUPABASE_ANON_KEY&&window.supabase);
const sb=ready?window.supabase.createClient(cfg.SUPABASE_URL,cfg.SUPABASE_ANON_KEY):null;
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
if(!ready)$('#configWarn').hidden=false;

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
  if(n===1&&!imgOk())ok=false;
  if(!ok){const e=$('#formErr');e.textContent=T('fix');e.hidden=false;}return ok;}
$('#nextBtn').onclick=()=>{if(validate(step))show(step+1)};
$('#backBtn').onclick=()=>show(step-1);
$$('input,select,textarea').forEach(el=>el.addEventListener('input',()=>el.classList.remove('invalid')));

/* images */
let files=[];const OKT=['image/jpeg','image/png','image/webp'],MAX=5*1024*1024;
function imgOk(){const e=$('#imgErr');
  if(files.length>6){e.textContent=T('imgs_max');return false}
  for(const f of files){if(!OKT.includes(f.type)){e.textContent=T('img_type');return false}if(f.size>MAX){e.textContent=T('img_size');return false}}
  e.textContent='';return true;}
function drawPrev(){const box=$('#previews');box.innerHTML='';
  files.forEach((f,i)=>{const d=document.createElement('div'),im=document.createElement('img'),b=document.createElement('button');
    im.src=URL.createObjectURL(f);b.type='button';b.textContent='×';b.onclick=()=>{files.splice(i,1);drawPrev();imgOk()};d.append(im,b);box.append(d)});}
$('#images').onchange=e=>{files=files.concat([...e.target.files]);e.target.value='';drawPrev();if(!imgOk())files=files.filter(f=>OKT.includes(f.type)&&f.size<=MAX).slice(0,6),drawPrev();};

/* submit */
$('#reqForm').addEventListener('submit',async ev=>{
  ev.preventDefault();
  for(const n of [0,1,2]){if(!validate(n)){show(n);validate(n);return}}
  const err=$('#formErr');err.hidden=true;
  if($('#website').value)return; // honeypot
  if(!ready){err.textContent=T('no_cfg');err.hidden=false;return}
  const btn=$('#submitBtn');btn.disabled=true;const old=btn.textContent;btn.textContent=T('sending');
  const id=crypto.randomUUID(),paths=[];
  try{
    for(let i=0;i<files.length;i++){
      const ext={'image/jpeg':'jpg','image/png':'png','image/webp':'webp'}[files[i].type];
      const path=`${id}/${i+1}-${Date.now()}.${ext}`;
      const {error}=await sb.storage.from('request-images').upload(path,files[i],{contentType:files[i].type,upsert:false});
      if(error)throw error;paths.push(path);
    }
    const g=s=>$(s).value;
    const payload={id,customer_name:g('#customer_name'),phone:normPhone(g('#phone')),city:g('#city'),car_make:g('#car_make'),car_model:g('#car_model'),
      car_year:+g('#car_year'),car_trim:g('#car_trim'),engine:g('#engine'),vin:g('#vin'),part_name:g('#part_name'),part_number:g('#part_number'),
      part_condition:g('#part_condition'),part_type:g('#part_type'),description:g('#description'),image_paths:paths,contact_method:g('#contact_method')};
    const {data,error}=await sb.rpc('submit_part_request',{p:payload});
    if(error)throw error;
    $('#reqNo').textContent=data;$('#reqForm').hidden=true;$('#successBox').hidden=false;
    $('#request').scrollIntoView({behavior:'smooth'});
  }catch(e){console.error(e);err.textContent=T('fail');err.hidden=false;}
  finally{btn.disabled=false;btn.textContent=old;QT_I18N.apply();}
});
$('#newReq').onclick=()=>{$('#reqForm').reset();files=[];drawPrev();$('#reqForm').hidden=false;$('#successBox').hidden=true;show(0);};
show(0);
})();
