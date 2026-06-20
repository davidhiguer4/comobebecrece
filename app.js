'use strict';
var SK='btv5', S={profile:{},logs:[],milestones:[],sleeping:false,sleepStart:null,feeding:false,feedStart:null}, modal=null, pills=[], meal='breakfast';

var DMS=[
  {id:'smile',label:'Primera sonrisa',icon:'\u{1F60A}',cat:'social'},
  {id:'rollover',label:'Se dio vuelta solo',icon:'\u{1F504}',cat:'motor'},
  {id:'situp',label:'Se sent\xF3 solo',icon:'\u{1FA91}',cat:'motor'},
  {id:'crawl',label:'Empez\xF3 a gatear',icon:'\u{1F423}',cat:'motor'},
  {id:'stand',label:'Se par\xF3 con apoyo',icon:'\u{1F9CD}',cat:'motor'},
  {id:'walk',label:'Primeros pasos',icon:'\u{1F463}',cat:'motor'},
  {id:'mama',label:'Dijo mam\xE1',icon:'\u{1F469}',cat:'lenguaje'},
  {id:'papa',label:'Dijo pap\xE1',icon:'\u{1F468}',cat:'lenguaje'},
  {id:'word1',label:'Primera palabra',icon:'\u{1F4AC}',cat:'lenguaje'},
  {id:'wave',label:'Adi\xF3s con la mano',icon:'\u{1F44B}',cat:'social'},
  {id:'clap',label:'Aplaud\xED\xF3 solo',icon:'\u{1F44F}',cat:'social'},
  {id:'byename',label:'Respondi\xF3 a su nombre',icon:'\u{1F3AF}',cat:'social'},
  {id:'pincer',label:'Agarre de pinza',icon:'\u270C\uFE0F',cat:'motor'},
  {id:'solidfood',label:'Prob\xF3 comida s\xF3lida',icon:'\u{1F944}',cat:'alimentacion'},
  {id:'cup',label:'Tom\xF3 de taza',icon:'\u{1F964}',cat:'alimentacion'},
  {id:'selffeed',label:'Se aliment\xF3 solo',icon:'\u{1F37D}\uFE0F',cat:'alimentacion'},
  {id:'tooth1',label:'Primer diente',icon:'\u{1F9B7}',cat:'desarrollo'},
  {id:'haircut',label:'Primer corte de cabello',icon:'\u2702\uFE0F',cat:'desarrollo'},
  {id:'bath1',label:'Primer ba\xF1o en tina',icon:'\u{1F6C1}',cat:'desarrollo'},
];
var CAT={motor:'\u{1F3C3} Motor',lenguaje:'\u{1F4AC} Lenguaje',social:'\u{1F91D} Social',alimentacion:'\u{1F37D}\uFE0F Alimentaci\xF3n',desarrollo:'\u{1F331} Desarrollo',personalizado:'\u2728 Personalizados'};
var MI={breakfast:{l:'Desayuno',i:'\u{1F305}'},lunch:{l:'Almuerzo',i:'\u2600\uFE0F'},dinner:{l:'Cena',i:'\u{1F319}'}};
var EI={bottle:'\u{1F37C}',diaper:'\u{1F9F7}',food:'\u{1F963}',symptom:'\u{1F321}\uFE0F',sleep:'\u{1F634}',exercise:'\u{1F938}'};
var EL={bottle:'Tetero',diaper:'Pa\xF1al',food:'Comida',symptom:'S\xEDntoma',sleep:'Sue\xF1o',exercise:'Ejercicio'};

function save(){try{localStorage.setItem(SK,JSON.stringify(S));}catch(e){}}
function load(){
  try{
    var r=localStorage.getItem(SK);
    if(r){
      S=Object.assign({profile:{},logs:[],milestones:[],sleeping:false,sleepStart:null,feeding:false,feedStart:null},JSON.parse(r));
      if(!S.milestones||!S.milestones.length)S.milestones=JSON.parse(JSON.stringify(DMS));
    } else {
      S.milestones=JSON.parse(JSON.stringify(DMS));
    }
  }catch(e){S.milestones=JSON.parse(JSON.stringify(DMS));}
}

function ft(iso){return new Date(iso).toLocaleTimeString('es-ES',{hour:'2-digit',minute:'2-digit'});}
function fd(ds){return new Date(ds+'T12:00:00').toLocaleDateString('es-ES',{day:'numeric',month:'short',year:'numeric'});}
function fdl(iso){return new Date(iso).toLocaleDateString('es-ES',{weekday:'long',day:'numeric',month:'long',year:'numeric'});}
function elapsed(ms){var m=Math.round(ms/60000);return m<60?m+'min':Math.floor(m/60)+'h '+(m%60)+'min';}
function tstr(){return new Date().toDateString();}
function ntv(){return new Date().toTimeString().slice(0,5);}
function getAge(dob){
  if(!dob)return null;
  var b=new Date(dob+'T12:00:00'),n=new Date();
  var mo=(n.getFullYear()-b.getFullYear())*12+(n.getMonth()-b.getMonth());
  if(n.getDate()<b.getDate())mo--;
  if(mo<0)return null;
  if(mo<12)return mo+(mo===1?' mes':' meses');
  var y=Math.floor(mo/12),m=mo%12;
  return y+(y===1?' a\xF1o':' a\xF1os')+(m?' y '+m+' meses':'');
}
function toast(msg){var t=gi('toast');t.textContent=msg;t.classList.add('show');setTimeout(function(){t.classList.remove('show');},2800);}
function gi(id){return document.getElementById(id);}

// ── SCREENS ──
function showScreen(n){
  document.querySelectorAll('.screen').forEach(function(s){s.classList.remove('active');});
  gi('screen-'+n).classList.add('active');
  if(n==='settings')populateSettings();
}
function finishOnboarding(){
  var name=gi('ob-name').value.trim();
  if(!name){gi('ob-name').focus();return;}
  S.profile={name:name,dob:gi('ob-dob').value,parent:gi('ob-parent').value.trim()};
  save();showScreen('main');render();
}
function switchView(v){
  document.querySelectorAll('.view').forEach(function(x){x.classList.remove('active');});
  document.querySelectorAll('.nav-btn').forEach(function(x){x.classList.toggle('active',x.dataset.v===v);});
  gi('view-'+v).classList.add('active');
  render();
}

// ── TETERO: inicio / fin de toma ──
function toggleFeed(){
  if(!S.feeding){
    // Inicia la toma
    S.feeding=true;
    S.feedStart=new Date().toISOString();
    save();
    renderFeedBanner();
    toast('\u{1F37C} Toma iniciada a las '+ft(S.feedStart));
  } else {
    // Termina la toma
    var dur=Date.now()-new Date(S.feedStart).getTime();
    var entry={
      id:Date.now(),
      type:'bottle',
      time:new Date().toISOString(),
      feedStart:S.feedStart,
      duration:dur,
      notes:'',
      btype:'tetero',
      amount:''
    };
    S.logs.unshift(entry);
    S.feeding=false;
    S.feedStart=null;
    save();
    renderFeedBanner();
    renderRecent();
    renderStats();
    toast('\u{1F37C} Toma finalizada: '+elapsed(dur));
  }
}

// ── SUEÑO: inicio / fin ──
function toggleSleep(){
  if(!S.sleeping){
    S.sleeping=true;
    S.sleepStart=new Date().toISOString();
    save();
    renderSleepBanner();
    toast('\u{1F634} Durmiendo desde las '+ft(S.sleepStart));
  } else {
    var dur=Date.now()-new Date(S.sleepStart).getTime();
    S.logs.unshift({
      id:Date.now(),
      type:'sleep',
      time:new Date().toISOString(),
      sleepStart:S.sleepStart,
      duration:dur,
      notes:''
    });
    S.sleeping=false;
    S.sleepStart=null;
    save();
    renderSleepBanner();
    renderRecent();
    renderStats();
    toast('\u{1F634} Sue\xF1o finalizado: '+elapsed(dur));
  }
}

// ── MEAL SELECTOR ──
function selMeal(m){
  meal=m;
  document.querySelectorAll('.m-chip').forEach(function(c){c.classList.toggle('active',c.dataset.m===m);});
  gi('mealIconBig').textContent=MI[m].i;
  gi('mealLabelBig').textContent='Registrar '+MI[m].l.toLowerCase();
}
function toggleTip(id){
  var body=gi('tb-'+id),arrow=gi('ta-'+id);
  body.classList.toggle('open');arrow.classList.toggle('open');
}

// ── MODAL BODIES ──
function makeBodyDiaper(){return '<label>Hora</label><input type="time" id="m-time" value="'+ntv()+'"><label>Tipo</label><select id="m-dtype"><option value="mojado">Mojado (pip\xED)</option><option value="sucio">Sucio (pop\xF3)</option><option value="ambos">Ambos</option></select><label>Notas</label><textarea id="m-notes" placeholder="Color, consistencia..."></textarea>';}
function makeBodyFood(){
  var mm=Object.entries(MI).map(function(kv){var k=kv[0],v=kv[1];return '<button type="button" class="mm-btn'+(k===meal?' active':'')+'" id="mm-'+k+'" onclick="setMM(\''+k+'\')">'+v.i+' '+v.l+'</button>';}).join('');
  return '<label>Tiempo</label><div class="meal-mini">'+mm+'</div><label>Hora</label><input type="time" id="m-time" value="'+ntv()+'"><label>\xBFQu\xE9 comi\xF3?</label><input type="text" id="m-food" placeholder="ej. pur\xE9 de papa, avena..."><label>Notas</label><textarea id="m-notes" placeholder="Reacci\xF3n, cantidad, le gust\xF3..."></textarea>';
}
function makeBodySymptom(){
  var ps=['Eructo','C\xF3lico','Salpullido','V\xF3mito','Fiebre','Llanto excesivo','Diarrea','Gases','Congestionado','Otro'].map(function(s){return '<span class="pill" onclick="togglePill(this,\''+s+'\')">'+s+'</span>';}).join('');
  return '<label>Hora</label><input type="time" id="m-time" value="'+ntv()+'"><label>S\xEDntomas</label><div class="pills">'+ps+'</div><label>Temperatura (\xB0C)</label><input type="number" id="m-temp" placeholder="37.5" step="0.1" inputmode="decimal"><label>Notas</label><textarea id="m-notes" placeholder="Descripci\xF3n, qu\xE9 se hizo..."></textarea>';
}
function makeBodyExercise(){
  var ps=['Tummy time','Sensorial t\xE1ctil','Sensorial visual','Sensorial auditivo','Estimulaci\xF3n motora','Juego libre','Ba\xF1o sensorial','Lectura','M\xFAsica y canto','Masajes','Caminata al aire libre','Imitaci\xF3n','Otro'].map(function(s){return '<span class="pill" onclick="togglePill(this,\''+s+'\')">'+s+'</span>';}).join('');
  return '<label>Hora</label><input type="time" id="m-time" value="'+ntv()+'"><label>Actividad</label><div class="pills">'+ps+'</div><label>Duraci\xF3n (min)</label><input type="number" id="m-duration" placeholder="15" inputmode="numeric"><label>Notas</label><textarea id="m-notes" placeholder="Reacciones, observaciones..."></textarea>';
}
function makeBodyMilestone(){return '<label>Nombre del hito</label><input type="text" id="m-ms-label" placeholder="ej. Dijo hola..."><label>Emoji del momento</label><input type="text" id="m-ms-icon" placeholder="\u{1F389}" maxlength="4"><label>Fecha</label><input type="date" id="m-ms-date" value="'+new Date().toISOString().slice(0,10)+'"><label>An\xE9cdota</label><textarea id="m-notes" placeholder="Cu\xE9ntame c\xF3mo pas\xF3..."></textarea>';}

var TITLES={diaper:'\u{1F9F7} Pa\xF1al',food:'\u{1F963} Comida',symptom:'\u{1F321}\uFE0F S\xEDntoma',exercise:'\u{1F938} Ejercicio',milestone:'\u2728 Hito'};
function openModal(type){
  modal=type;pills=[];
  gi('modalTitle').textContent=TITLES[type]||'Registrar';
  var b='';
  if(type==='diaper')b=makeBodyDiaper();
  else if(type==='food')b=makeBodyFood();
  else if(type==='symptom')b=makeBodySymptom();
  else if(type==='exercise')b=makeBodyExercise();
  else if(type==='milestone')b=makeBodyMilestone();
  gi('modalBody').innerHTML=b;
  gi('modalOverlay').classList.add('open');
}
function closeModal(){gi('modalOverlay').classList.remove('open');modal=null;}
function closeModalOutside(e){if(e.target===gi('modalOverlay'))closeModal();}
function setMM(k){meal=k;document.querySelectorAll('.mm-btn').forEach(function(b){b.classList.toggle('active',b.id==='mm-'+k);});}
function togglePill(el,s){el.classList.toggle('active');var i=pills.indexOf(s);if(i>=0)pills.splice(i,1);else pills.push(s);}

function saveEntry(){
  var type=modal;
  if(type==='milestone'){
    var lbl=gi('m-ms-label')&&gi('m-ms-label').value.trim();
    if(!lbl){gi('m-ms-label').focus();return;}
    S.milestones.push({id:'c_'+Date.now(),label:lbl,icon:(gi('m-ms-icon')&&gi('m-ms-icon').value)||'\u2728',cat:'personalizado',achieved:true,date:(gi('m-ms-date')&&gi('m-ms-date').value)||new Date().toISOString().slice(0,10),notes:(gi('m-notes')&&gi('m-notes').value)||''});
    save();closeModal();renderMilestones();toast('Hito guardado \u2713');return;
  }
  var tEl=gi('m-time'),notes=(gi('m-notes')&&gi('m-notes').value.trim())||'',base=new Date();
  if(tEl){var parts=tEl.value.split(':');base.setHours(+parts[0],+parts[1],0,0);}
  var e={id:Date.now(),type:type,time:base.toISOString(),notes:notes};
  if(type==='diaper')e.dtype=(gi('m-dtype')&&gi('m-dtype').value)||'';
  if(type==='food'){e.food=(gi('m-food')&&gi('m-food').value.trim())||'';e.meal=meal;}
  if(type==='symptom'){e.symptoms=pills.slice();e.temp=(gi('m-temp')&&gi('m-temp').value)||'';}
  if(type==='exercise'){e.activities=pills.slice();e.duration=(gi('m-duration')&&gi('m-duration').value)||'';}
  S.logs.unshift(e);save();closeModal();render();toast('Registrado \u2713');
}

// ── MILESTONES ──
function toggleMs(id){
  var m=S.milestones.find(function(x){return x.id===id;});if(!m)return;
  if(m.achieved){m.achieved=false;delete m.date;}
  else{m.achieved=true;m.date=new Date().toISOString().slice(0,10);toast('\u{1F389} \xA1Hito logrado!');}
  save();renderMilestones();renderStats();
}
function delMs(id){if(!confirm('\xBFEliminar este hito?'))return;S.milestones=S.milestones.filter(function(x){return x.id!==id;});save();renderMilestones();}
function delEntry(id){S.logs=S.logs.filter(function(x){return x.id!==id;});save();render();}

// ── DETAIL ──
function detail(e){
  var dt={mojado:'Mojado',sucio:'Sucio',ambos:'Mojado y sucio'};
  if(e.type==='bottle'){
    var parts=[];
    if(e.duration)parts.push('Duraci\xF3n: '+elapsed(e.duration));
    if(e.feedStart)parts.push('Inici\xF3: '+ft(e.feedStart));
    if(e.notes)parts.push(e.notes);
    return parts.length?parts.join(' \xB7 '):'Toma registrada';
  }
  if(e.type==='diaper')return [dt[e.dtype]||'',e.notes].filter(Boolean).join(' \xB7 ');
  if(e.type==='food')return [MI[e.meal]?MI[e.meal].i+' '+MI[e.meal].l:'',e.food,e.notes].filter(Boolean).join(' \xB7 ');
  if(e.type==='symptom')return (e.symptoms||[]).concat(e.temp?[e.temp+'\xB0C']:[]).concat(e.notes?[e.notes]:[]).join(' \xB7 ');
  if(e.type==='exercise')return (e.activities||[]).concat(e.duration?[e.duration+' min']:[]).concat(e.notes?[e.notes]:[]).join(' \xB7 ');
  if(e.type==='sleep'){
    var sp=[];
    if(e.duration)sp.push('Duraci\xF3n: '+elapsed(e.duration));
    if(e.sleepStart)sp.push('Inici\xF3: '+ft(e.sleepStart));
    return sp.join(' \xB7 ');
  }
  return e.notes||'';
}
function logHTML(e){
  return '<div class="log-item">'
    +'<span class="li-ic">'+(EI[e.type]||'\u{1F4DD}')+'</span>'
    +'<div class="li-in"><div class="li-tt">'+(EL[e.type]||e.type)+'</div>'
    +'<div class="li-sb">'+detail(e)+'</div></div>'
    +'<span class="li-tm">'+ft(e.time)+'</span>'
    +'<button class="li-dl" onclick="delEntry('+e.id+')" aria-label="Eliminar">\u{1F5D1}</button>'
    +'</div>';
}

// ── RENDER BANNERS ──
function renderFeedBanner(){
  var banner=gi('feedBanner'),btn=gi('feedBtn'),title=gi('feedTitle'),detail2=gi('feedDetail');
  if(S.feeding){
    banner.classList.add('active');
    title.textContent='Tomando ahora...';
    var dur=Date.now()-new Date(S.feedStart).getTime();
    detail2.textContent='Inici\xF3 a las '+ft(S.feedStart)+' \xB7 '+elapsed(dur);
    btn.textContent='Fin de toma';
    btn.classList.add('end');
  } else {
    banner.classList.remove('active');
    title.textContent='Tetero / Toma';
    var last=S.logs.find(function(x){return x.type==='bottle';});
    if(last){
      var ago=elapsed(Date.now()-new Date(last.time).getTime());
      detail2.textContent='Hace '+ago+' \xB7 '+(last.duration?'Dur\xF3 '+elapsed(last.duration):'');
    } else {
      detail2.textContent='Sin registros hoy';
    }
    btn.textContent='Iniciar toma';
    btn.classList.remove('end');
  }
}

function renderSleepBanner(){
  var banner=gi('sleepCard'),dot=gi('sDot'),btn=gi('sBtn'),status=gi('sStatus'),det=gi('sDetail');
  if(S.sleeping){
    banner.classList.add('sleeping');dot.classList.add('on');btn.classList.add('wake');
    status.textContent='Durmiendo...';
    var dur=Date.now()-new Date(S.sleepStart).getTime();
    det.textContent='Inici\xF3 a las '+ft(S.sleepStart)+' \xB7 '+elapsed(dur);
    btn.textContent='Se despert\xF3';
  } else {
    banner.classList.remove('sleeping');dot.classList.remove('on');btn.classList.remove('wake');
    status.textContent='Despierto';
    var ls=S.logs.find(function(x){return x.type==='sleep';});
    det.textContent=ls?'\xDAltimo sue\xF1o: '+elapsed(ls.duration)+' \xB7 Finaliz\xF3 '+ft(ls.time):'Toca para registrar que se durmi\xF3';
    btn.textContent='Durmi\xF3';
  }
}

function renderQuick(){
  ['diaper','exercise','symptom'].forEach(function(t){
    var last=S.logs.find(function(x){return x.type===t;}),el=gi('ql-'+t);
    if(el)el.textContent=last?'Hace '+elapsed(Date.now()-new Date(last.time).getTime()):'Sin registros';
  });
}
function renderRecent(){
  var today=S.logs.filter(function(x){return new Date(x.time).toDateString()===tstr();}).slice(0,6);
  gi('recentLog').innerHTML=today.length?today.map(logHTML).join(''):'<div class="empty">\u{1F44B} Nada registrado hoy.<br>\xA1Toca un bot\xF3n para empezar!</div>';
}
function renderFood(){
  var today=S.logs.filter(function(x){return x.type==='food'&&new Date(x.time).toDateString()===tstr();});
  var el=gi('foodLog');if(el)el.innerHTML=today.length?today.map(logHTML).join(''):'<div class="empty">Sin comidas hoy.</div>';
}
function renderMilestones(){
  var el=gi('msList');if(!el)return;
  var ach=S.milestones.filter(function(m){return m.achieved;}).length,tot=S.milestones.length,pct=tot?Math.round(ach/tot*100):0;
  gi('msProgLbl').textContent=ach+' de '+tot+' hitos logrados';
  gi('msFill').style.width=pct+'%';gi('msPct').textContent=pct+'%';
  var grp={};
  S.milestones.forEach(function(m){var c=m.cat||'personalizado';if(!grp[c])grp[c]=[];grp[c].push(m);});
  var html='';
  Object.keys(CAT).forEach(function(c){
    if(!grp[c])return;
    html+='<div class="ms-cat-lbl">'+CAT[c]+'</div>';
    grp[c].forEach(function(m){
      html+='<div class="ms-item'+(m.achieved?' done':'')+'" onclick="toggleMs(\''+m.id+'\')">';
      html+='<span class="ms-em">'+m.icon+'</span>';
      html+='<div style="flex:1"><div class="ms-name">'+m.label+'</div>';
      html+='<div class="ms-date">'+(m.achieved&&m.date?'\u2713 '+fd(m.date)+(m.notes?' \xB7 '+m.notes:''):'Toca para marcar como logrado')+'</div></div>';
      if(m.achieved)html+='<span class="ms-tick">\u2713</span>';
      if(m.cat==='personalizado')html+='<button class="li-dl" onclick="event.stopPropagation();delMs(\''+m.id+'\')" aria-label="Eliminar">\u{1F5D1}</button>';
      html+='</div>';
    });
  });
  el.innerHTML=html;
}
function renderStats(){
  var td=S.logs.filter(function(x){return new Date(x.time).toDateString()===tstr();});
  function sv(id,v){var e=gi(id);if(e)e.textContent=v;}
  sv('st-bottle',td.filter(function(x){return x.type==='bottle';}).length);
  sv('st-diaper',td.filter(function(x){return x.type==='diaper';}).length);
  sv('st-food',td.filter(function(x){return x.type==='food';}).length);
  sv('st-exercise',td.filter(function(x){return x.type==='exercise';}).length);
  var sm=Math.round(td.filter(function(x){return x.type==='sleep';}).reduce(function(a,x){return a+(x.duration||0);},0)/60000);
  sv('st-sleep',Math.floor(sm/60)+'h '+(sm%60)+'min');
  // Tiempo total de tomas hoy
  var tm=Math.round(td.filter(function(x){return x.type==='bottle';}).reduce(function(a,x){return a+(x.duration||0);},0)/60000);
  sv('st-feed-time',tm?tm+' min total':'—');
  sv('st-ms',S.milestones.filter(function(m){return m.achieved;}).length);
  var sd=gi('statsDate');if(sd)sd.textContent=fdl(new Date().toISOString());
}
function renderHeader(){
  var p=S.profile,a=p.dob?getAge(p.dob):null;
  gi('hName').textContent=p.name||'Baby Tracker';
  gi('hAge').textContent=a||'Configura el perfil';
  gi('hAv').textContent=p.name?p.name[0].toUpperCase():'\u{1F476}';
}
function render(){
  renderHeader();
  renderFeedBanner();
  renderSleepBanner();
  renderQuick();
  renderRecent();
  renderFood();
  renderMilestones();
  renderStats();
}

// ── SETTINGS ──
function populateSettings(){
  var p=S.profile;
  function sv(id,v){var e=gi(id);if(e)e.value=v||'';}
  sv('s-name',p.name);sv('s-dob',p.dob);sv('s-weight',p.weight);sv('s-height',p.height);
  sv('s-blood',p.blood);sv('s-doctor',p.doctor);sv('s-doctorphone',p.doctorphone);sv('s-parents',p.parent);
  var av=gi('settingsAvatar');if(av)av.textContent=p.name?p.name[0].toUpperCase():'\u{1F476}';
}
function saveSettings(){
  function g(id){return(gi(id)&&gi(id).value.trim())||'';}
  S.profile=Object.assign({},S.profile,{name:g('s-name'),dob:g('s-dob'),weight:g('s-weight'),height:g('s-height'),blood:g('s-blood'),doctor:g('s-doctor'),doctorphone:g('s-doctorphone'),parent:g('s-parents')});
  save();showScreen('main');render();toast('Perfil guardado \u2713');
}
function confirmReset(){if(confirm('\xBFBorrar TODOS los datos? No se puede deshacer.')){localStorage.removeItem(SK);location.reload();}}

// ── EXPORT ──
function showDriveInfo(){
  if(confirm('Para sincronizar con Google Drive:\n\n1. Toca "Descargar respaldo (.json)"\n2. Abre Google Drive en tu tel\xE9fono\n3. Sube el archivo a una carpeta "BabyTracker"\n\nPara restaurar: descarga el archivo de Drive y usa "Restaurar respaldo".\n\n\xBFDescargar respaldo ahora?'))exportJSON();
}
function exportJSON(){
  var b=new Blob([JSON.stringify(S,null,2)],{type:'application/json'});
  var a=document.createElement('a');a.href=URL.createObjectURL(b);
  a.download=((S.profile.name||'bebe').replace(/\s/g,'_'))+'_backup_'+new Date().toISOString().slice(0,10)+'.json';
  a.click();toast('Respaldo descargado \u2713');
}
function importJSON(ev){
  var f=ev.target.files[0];if(!f)return;
  var r=new FileReader();
  r.onload=function(e){
    try{var d=JSON.parse(e.target.result);if(!d.logs)throw new Error();if(!confirm('\xBFRestaurar datos? Se reemplazar\xE1n los actuales.'))return;S=d;save();render();toast('Datos restaurados \u2713');}
    catch(err){alert('Archivo inv\xE1lido.');}
  };
  r.readAsText(f);
}
function exportPDF(){
  var p=S.profile,td=S.logs.filter(function(x){return new Date(x.time).toDateString()===tstr();}),ach=S.milestones.filter(function(m){return m.achieved;});
  var a=getAge(p.dob);
  var rows=td.map(function(e){return '<tr><td>'+ft(e.time)+'</td><td>'+(EI[e.type]||'')+' '+(EL[e.type]||e.type)+'</td><td>'+detail(e)+'</td></tr>';}).join('');
  var msrows=ach.map(function(m){return '<tr><td>'+m.icon+' '+m.label+'</td><td>'+(m.date?fd(m.date):'')+'</td><td>'+(m.notes||'')+'</td></tr>';}).join('');
  var html='<!DOCTYPE html><html lang="es"><head><meta charset="UTF-8"><title>Reporte</title>'
    +'<style>body{font-family:Arial,sans-serif;max-width:680px;margin:40px auto;color:#1A1A2E;font-size:14px}h1{font-size:22px}h2{font-size:14px;border-bottom:2px solid #7C6FE0;padding-bottom:5px;margin:20px 0 10px;color:#534AB7}.sub{color:#666;margin-bottom:24px;font-size:12px}table{width:100%;border-collapse:collapse}th{text-align:left;font-size:12px;color:#888;padding:5px 7px;border-bottom:1px solid #eee}td{padding:7px;border-bottom:1px solid #f5f5f5;font-size:13px}.done{color:#1D9E75;font-weight:500}@media print{body{margin:20px}}</style>'
    +'</head><body>';
  html+='<h1>\u{1F476} Reporte de cuidado</h1>';
  html+='<div class="sub">'+(p.name||'Beb\xE9')+(a?' \xB7 '+a:'')+' \xB7 '+fdl(new Date().toISOString())+(p.doctor?' \xB7 Pediatra: '+p.doctor:'')+'</div>';
  if(p.weight||p.height)html+='<p style="margin-bottom:16px;font-size:13px;color:#555">'+(p.weight?'Peso: '+p.weight+' kg  ':'')+( p.height?'Talla: '+p.height+' cm  ':'')+( p.blood?'Sangre: '+p.blood:'')+'</p>';
  html+='<h2>Registros del d\xEDa</h2>'+(td.length?'<table><tr><th>Hora</th><th>Tipo</th><th>Detalle</th></tr>'+rows+'</table>':'<p style="color:#999">Sin registros hoy.</p>');
  html+='<h2>Hitos logrados ('+ach.length+')</h2>'+(ach.length?'<table><tr><th>Hito</th><th>Fecha</th><th>Notas</th></tr>'+msrows+'</table>':'<p style="color:#999">Sin hitos a\xFAn.</p>');
  html+='<p style="margin-top:36px;color:#ccc;font-size:11px">Generado con Baby Tracker \xB7 '+new Date().toLocaleString('es-ES')+'</p></body></html>';
  var w=window.open('','_blank');
  if(w){w.document.write(html);w.document.close();setTimeout(function(){w.print();},500);}
  else{var b2=new Blob([html],{type:'text/html'});var a2=document.createElement('a');a2.href=URL.createObjectURL(b2);a2.download='reporte_'+new Date().toISOString().slice(0,10)+'.html';a2.click();}
}

// ── SERVICE WORKER ──
if('serviceWorker' in navigator){
  navigator.serviceWorker.register('/sw.js').catch(function(){});
}

// ── INIT ──
load();
if(S.profile&&S.profile.name){showScreen('main');render();}
else showScreen('onboarding');

// Actualiza los timers cada 30 segundos
setInterval(function(){
  if(S.feeding)renderFeedBanner();
  if(S.sleeping)renderSleepBanner();
  renderQuick();
}, 30000);
