"use strict";
/* ============ STATE ============ */
const REALMS=["Spinner","Knotter","Weaver","Loomheart","Pattern Sage"];
var G=null, C=null, CKPT=null;
function fresh(){return{name:"Finn",body:2,mind:2,heart:2,insight:0,realm:0,hp:20,maxhp:20,thr:2,maxthr:2,
 pats:{},mei:0,bao:0,sho:0,yan:0,tang:0,f:{},scene:"start",notes:[]};}
const SAVE_VER=3;
function save(){if(G.scene==="start")return;try{G.v=SAVE_VER;localStorage.setItem("gthread",JSON.stringify(G));}catch(e){}}
function load(){try{const s=localStorage.getItem("gthread");if(!s)return null;const g=JSON.parse(s);return g.v===SAVE_VER?g:null;}catch(e){return null;}}
function note(s,cls){G.notes.push('<span class="'+(cls||'gain')+'">'+s+'</span>');}
function addStat(k,n){G[k]+=n;if(k==="body"){G.maxhp=16+G.body*2;G.hp=Math.min(G.hp+n*2,G.maxhp);}note((n>0?"+":"")+n+" "+k[0].toUpperCase()+k.slice(1));}
function addIns(n){G.insight+=n;note("+"+n+" Insight");}
function realmUp(){G.realm++;G.maxthr+=2;G.thr=G.maxthr;G.maxhp+=2;G.hp=G.maxhp;
 note("Breakthrough! You are now a <b>"+REALMS[G.realm]+"</b>. Thread capacity "+G.maxthr+".");}
function learn(p,label){if(!G.pats[p]){G.pats[p]=true;note("Pattern learned: <b>"+label+"</b>");}}
const PATS={razor:{n:"Razor Thread",cost:2,d:"slicing qi-thread"},snare:{n:"Snare Knot",cost:2,d:"binds the foe one turn"},
 mirror:{n:"Mirror Lattice",cost:1,d:"blocks and reflects the next blow"},mend:{n:"Mend Weave",cost:2,d:"reknits flesh"},
 unravel:{n:"Unravel",cost:3,d:"tears apart a gathering technique"},
 puppet:{n:"Puppet Strings",cost:3,d:"yank the foe\u2019s technique-threads inward"},
 counter:{n:"Counterweave",cost:4,d:"the sage\u2019s mending \u2014 harm, heal, and unmake stances"}};
const STANCES={
 iron:{see:"Its qi is braced like temple bronze \u2014 fists will bruise on it, but threads slide between the plates."},
 flow:{see:"Its form runs like meltwater \u2014 edges and knots slip off it, but a plain blow would break the current."}};
/* Combat balance (B-pass, fuzzer-tuned). foe: enemy damage x1.4; Mend = mendBase+heart*mendMul;
   startThr: fraction of max threads at fight start; guardThr: threads banked by Guard;
   roundThr: passive regen/round; revive: ally rescues at 0 HP. Result: pure-strike win ~35%,
   careless ~86%, engaged ~98%. Passive regen is the master switch — keep it at 1 to avoid
   bimodal stance-boss spikes (see difficulty notes). */
const TUNE={mendBase:3,mendMul:1,counterHeal:2,guardThr:1,roundThr:1,startThr:0.75,revive:true,foe:1.4};

/* ============ RENDER ============ */
const $=id=>document.getElementById(id);
function hud(){
 if(G.scene==="start"||!G.f.woke){$("hud").style.display="none";return;}
 $("hud").style.display="block";
 const pl=Object.keys(G.pats).map(k=>PATS[k].n).join(", ")||"none";
 $("hud").innerHTML='<div class="row"><span class="hp">HP '+G.hp+'/'+G.maxhp+'</span>'+
  '<span class="thr">Threads '+G.thr+'/'+G.maxthr+'</span><span><b>'+REALMS[G.realm]+'</b></span>'+
  '<span>Body '+G.body+' · Mind '+G.mind+' · Heart '+G.heart+'</span><span>Insight '+G.insight+'</span>'+
  '<span class="jbtn" id="jbtn">\u2766 the thread so far</span></div>'+
  '<div class="row small">Patterns: '+pl+'</div><div class="bar"><i style="width:'+(100*G.hp/G.maxhp)+'%"></i></div>';
 const jb=$("jbtn");if(jb)jb.onclick=openJournal;
}
function openJournal(){
 const rel=v=>v>=3?"close":v>=2?"firm":v>=1?"known":null;
 const bonds=[[G.mei,"Mei",rel(G.mei)],[G.bao,"Bao",rel(G.bao)],[G.sho,"Granny Sho",rel(G.sho)],
  [G.yan,"Yan Shuo",rel(G.yan)],[G.tang,"Auntie Tang",G.tang>=2?"firm":G.tang>=1?"known":null],
  [(G.f.ruan||0),"Iron Veil Ruan",G.f.a3_ruan_sworn?"sworn brother":rel(G.f.ruan||0)]];
 const pick=(v,m)=>m[v];
 const deeds=[
  {kata:"You met your death mid-kata, body moving before thought.",music:"You died with eight unfinished bars still in your head.",code:"You died chasing a puzzle's last move.",sister:"You died thinking of a porch light left on."}[G.f.bg],
  pick(G.f.a3_route,{sect:"Left the mountain as its itinerant auditor.",road:"Fled down the firewood paths, unsanctioned and unmissed."}),
  pick(G.f.a3_furnace,{freed:"Freed Clearwater's furnace the moment you found it.",waiting:"Documented Clearwater and waited for the inspector \u2014 and did the arithmetic awake at night."}),
  pick(G.f.a3_feral,{calmed:"Calmed the Reed Wife, the other foreigner \u2014 your first true source on the Court.",fled:"The Reed Wife slipped back into the marsh; the remainder is yours to carry.",ended:"Gave the Reed Wife the mercy the Loom never did."}),
  pick(G.f.a3_marked,{sho:"The Court's white-thread claim rides Granny Sho's shoulder.",ruan:"The Court's white-thread claim rides Ruan's shoulder."}),
  pick(G.f.a3_court,{guest:"Accepted the Court's invitation, on its own schedule.",refused:"Refused the Court, tea-bow and all.",defied:"Defied the white boat to its face."}),
  G.f.a4_route?pick(G.f.a4_route,{guest:"Entered the Silkworm Court as an invited guest.",spy:"Infiltrated the Court under forged consignment papers.",prisoner:"Let the Court collect you, to reach its deepest room."}):null,
  G.f.a4_truth?"Learned the Loom runs on willing weavers \u2014 the harvested souls are wasted fuel.":null,
  pick(G.f.a4_audit,{published:"Published the Court's true ledger to the river sects.",held:"Hold the Court's audit sealed, a blade at its throat."}),
  pick(G.f.a4_counter,{clean:"Broke through to Pattern Sage, clean, at the summit of understanding.",paid:"Broke through to Pattern Sage \u2014 and wove part of yourself into the door."}),
  pick(G.f.a4_xian,{turned:"Turned Madam Xian, the Ninth Reel, to the willing rota.",stood:"Madam Xian remained unpersuaded, and unforgiven."}),
  pick(G.f.a4_suyin,{freed:"Wen Suyin tore free to hold the gap as a free woman.",holds:"Wen Suyin holds the gap from inside the dying Loom."}),
  pick(G.f.a5_loom,{woven:"You wove the counter-pattern over the sky.",free:"You unravelled the Grand Loom and trusted the world's own weave.",heir:"You became the heart of heaven."}),
  pick(G.f.a5_door,{home:"You walked your own gold line home through the door between worlds.",open:"You held the door between worlds open for every soul still to come.",shut:"You sewed the door between worlds shut forever."}),
  G.f.a5_threads?G.f.a5_threads+" freely-given threads answered in the final pattern.":null,
 ].filter(Boolean);
 const pats=Object.keys(G.pats).map(k=>PATS[k].n).join(" \u00b7 ")||"none yet";
 let h='<div class="jrnl"><h2>'+G.name+'</h2>'+
  '<div class="sub">'+REALMS[G.realm]+' \u00b7 the thread so far</div>'+
  '<h3>Cultivation</h3><div class="stat"><span>Realm <b>'+REALMS[G.realm]+'</b></span>'+
  '<span>Insight <b>'+G.insight+'</b></span><span>Threads <b>'+G.maxthr+'</b></span>'+
  '<span>Body <b>'+G.body+'</b></span><span>Mind <b>'+G.mind+'</b></span><span>Heart <b>'+G.heart+'</b></span></div>'+
  '<div class="pats">Patterns woven: '+pats+'</div>';
 const shown=bonds.filter(b=>b[2]);
 h+='<h3>Bonds</h3>';
 if(shown.length)for(const b of shown)h+='<div class="bond"><span>'+b[1]+'</span><span class="w">'+b[2]+'</span></div>';
 else h+='<div class="none">No bonds yet. The mountain is a cold place to arrive.</div>';
 h+='<h3>The thread so far</h3>';
 if(deeds.length){h+='<ul class="deeds">';for(const d of deeds)h+='<li>'+d+'</li>';h+='</ul>';}
 else h+='<div class="none">Your story is only beginning.</div>';
 h+='<div class="choices"><button class="ch" id="jback">\u2190 back to the story</button></div></div>';
 $("main").innerHTML=h;window.scrollTo(0,0);
 $("jback").onclick=()=>render();
}
function go(id){G.scene=id;C=null;save();render();}
function art(sc){if(!sc.img||!IMG[sc.img])return"";const b="assets/"+IMG[sc.img];
 return '<img class="scene-art" src="'+b+'.png" alt="" onerror="if(!this.dataset.f){this.dataset.f=1;this.src=\''+b+'.svg\';}else this.style.display=\'none\';">';}
function renderFoot(){
 const f=$("foot");if(!f)return;
 if(G.scene==="start"||!G.f.woke){f.innerHTML="";return;}
 f.innerHTML='<button class="rst" id="rst0">\u21BA restart from the beginning</button>';
 $("rst0").onclick=()=>{
  f.innerHTML='<span class="rstwarn">Erase all progress and start over?</span>'+
   '<button class="rst danger" id="rst1">Yes \u2014 erase everything</button>'+
   '<button class="rst" id="rst2">No, keep playing</button>';
  $("rst1").onclick=()=>{localStorage.removeItem("gthread");G=fresh();C=null;CKPT=null;render();};
  $("rst2").onclick=()=>renderFoot();
 };
}
function render(){
 hud();const sc=SC[G.scene];const m=$("main");
 if(sc.combat){renderCombat(sc);return;}
 let h=art(sc)+sc.t();
 if(G.notes.length){h+="<p>"+G.notes.join("<br>")+"</p>";G.notes=[];}
 h+='<div class="choices">';
 for(const c of (sc.c?sc.c():[])){
  if(c.hide&&c.hide())continue;
  const ok=!c.req||c.req();
  h+='<button class="ch" '+(ok?"":"disabled")+' data-i="'+c.id+'">'+c.l+(ok?"":' <span class="req">'+(c.rq||"(locked)")+'</span>')+'</button>';
 }
 h+="</div>";m.innerHTML=h;window.scrollTo(0,0);
 m.querySelectorAll("button.ch").forEach(b=>{b.onclick=()=>{
  const c=sc.c().find(x=>x.id===b.dataset.i);
  if(c.do)c.do();
  if(c.go)go(typeof c.go==="function"?c.go():c.go);else render();
 };});
 renderFoot();
}

/* ============ COMBAT ============ */
function renderCombat(sc){
 if(!C){CKPT=JSON.stringify(G);const e=ENEMIES[sc.combat];
  C={key:sc.combat,name:e.name,hp:e.hp,max:e.hp,moves:e.moves.slice(),p2:e.p2,p2at:e.p2at,i:0,
   snared:false,mirror:false,guard:false,charged:false,stance:null,phase:1,meiUsed:false,shoUsed:false,elixirUsed:false,
   allies:!!e.allies,log:['<span class="foe">'+e.open+'</span>'],win:sc.win,lose:sc.lose,intro:sc.t()};
  G.thr=Math.round(G.maxthr*TUNE.startThr);if(sc.cstart)sc.cstart();}
 hud();
 const mv=C.moves[C.i%C.moves.length];
 let intent=C.snared?"It strains against your threads.":(mv.tele||("Prepares: "+mv.n));
 if(C.stance)intent='<span class="stq">'+STANCES[C.stance].see+'</span><br>'+intent;
 let h=art(sc)+(C.intro?C.intro:"");C.intro=C.intro?"":"";
 h+='<div class="combat"><span class="ename">'+C.name+'</span> — '+C.hp+'/'+C.max+
  '<div class="ebar"><i style="width:'+(100*Math.max(0,C.hp)/C.max)+'%"></i></div>'+
  '<div class="intent">'+intent+'</div><div class="clog">'+C.log.slice(-4).join("<br>")+'</div></div>';
 h+='<div class="choices">';
 const acts=[{id:"strike",l:"Strike — fists and footwork <span class='cost'>(free)</span>",ok:true}];
 for(const k of Object.keys(G.pats)){const p=PATS[k];
  acts.push({id:k,l:"Weave: "+p.n+" — "+p.d+" <span class='cost'>("+p.cost+" thr)</span>",ok:G.thr>=p.cost});}
 acts.push({id:"defend",l:"Guard — halve harm, gather "+TUNE.guardThr+" thread"+(TUNE.guardThr===1?"":"s")+" <span class='cost'>(free)</span>",ok:true});
 for(const a of acts)h+='<button class="ch" '+(a.ok?"":"disabled")+' data-a="'+a.id+'">'+a.l+'</button>';
 h+="</div>";$("main").innerHTML=h;
 $("main").querySelectorAll("button.ch").forEach(b=>{b.onclick=()=>round(b.dataset.a);});
 renderFoot();
}
function clog(s){C.log.push(s);}
function dmgEnemy(n,src){C.hp-=n;clog('<span class="you">'+src+" — "+n+" harm.</span>");}
function round(a){
 C.guard=false;
 if(a==="strike"){let d=2+G.body,src="You strike";
  if(C.stance==="iron"){d=1;src="Your blow rings off the iron-braced qi";}
  else if(C.stance==="flow"){d+=2;src="Your blow breaks the flowing form";}
  dmgEnemy(d,src);}
 else if(a==="defend"){C.guard=true;G.thr=Math.min(G.maxthr,G.thr+TUNE.guardThr);clog('<span class="you">You guard and gather threads.</span>');}
 else{const p=PATS[a];G.thr-=p.cost;
  if(a==="razor"){let d=4+G.mind;if(C.stance==="flow")d=Math.ceil(d/2);dmgEnemy(d,"Razor Thread slices");}
  if(a==="snare"){if(C.stance==="flow")clog('<span class="foe">The knot closes on flowing qi and slides off \u2014 water takes no knot.</span>');
   else{C.snared=true;dmgEnemy(1,"Snare Knot binds");}}
  if(a==="mirror"){C.mirror=true;clog('<span class="you">A lattice of golden threads hangs before you.</span>');}
  if(a==="mend"){const h=TUNE.mendBase+G.heart*TUNE.mendMul;G.hp=Math.min(G.maxhp,G.hp+h);clog('<span class="good">Mend Weave reknits you. +'+h+' HP.</span>');}
  if(a==="unravel"){let d=G.mind+2;if(C.charged){d+=5;C.charged=false;C.i++;clog('<span class="good">You tear the gathering technique apart mid-form!</span>');}
   if(C.stance){d+=3;C.stance=null;clog('<span class="good">You find the stance\u2019s anchor-knot and rip it loose. The form collapses.</span>');}
   dmgEnemy(d,"Unravel rips qi loose");}
  if(a==="puppet"){const nm=C.moves[C.i%C.moves.length];let d=nm.d!=null?nm.d:4;
   if(nm.kind==="release"&&!C.charged)d=Math.ceil(d/3);if(C.stance==="flow")d=Math.ceil(d/2);C.charged=false;C.i++;
   dmgEnemy(d,"Puppet Strings turn "+nm.n+" inward");}
  if(a==="counter"){let d=3+G.mind;
   if(C.stance){C.stance=null;clog('<span class="good">The Counterweave does not break the stance \u2014 it mends the qi past needing one. The form simply isn\u2019t there anymore.</span>');}
   G.hp=Math.min(G.maxhp,G.hp+TUNE.counterHeal);dmgEnemy(d,"Counterweave runs gold through the foe\u2019s fray");}}
 if(C.hp<=0)return endCombat(true);
 enemyAct();
 if(!C)return; // combat ended via mirror reflection
 if(G.hp<=0){ // ally saves
  if(TUNE.revive&&C.allies&&G.f.elixir&&!C.elixirUsed){C.elixirUsed=true;G.hp=10;clog('<span class="good">Mei\u2019s Cloudpith Elixir burns down your throat. You stand back up.</span>');}
  else if(TUNE.revive&&C.allies&&G.mei>=3&&!C.meiUsed){C.meiUsed=true;G.hp=8;clog('<span class="good">Mei drags you behind a pillar and slaps a poultice on the wound.</span>');}
  else return endCombat(false);}
 if(C.p2&&C.phase===1&&C.hp<=C.p2at){C.phase=2;C.moves=C.p2.slice();C.i=0;C.stance=null;
  clog('<span class="foe">'+(ENEMIES[C.key].p2text||"The foe sheds restraint.")+'</span>');
  if(C.allies&&G.sho>=2&&!C.shoUsed){C.shoUsed=true;C.snared=true;clog('<span class="good">Granny Sho\u2019s cane cracks the floor — threads erupt and bind him fast.</span>');}}
 G.thr=Math.min(G.maxthr,G.thr+TUNE.roundThr);
 save();renderCombat(SC[G.scene]);
}
function enemyAct(){
 if(C.snared){C.snared=false;clog('<span class="foe">'+C.name+' thrashes uselessly in your snare.</span>');return;}
 const mv=C.moves[C.i%C.moves.length];C.i++;
 if(mv.kind==="stance"){C.stance=mv.st;clog('<span class="foe">'+mv.text+'</span>');return;}
 if(mv.kind==="heal"){C.hp=Math.min(C.max,C.hp+mv.h);clog('<span class="foe">'+mv.text+'</span>');return;}
 if(mv.kind==="charge"){C.charged=true;clog('<span class="foe">'+mv.text+'</span>');return;}
 let d=mv.d;
 if(mv.kind==="release"){if(!C.charged){d=Math.ceil(d/3);clog('<span class="foe">The broken technique sputters.</span>');}C.charged=false;}
 if(C.mirror){C.mirror=false;const r=d;C.hp-=r;
  clog('<span class="good">Mirror Lattice catches the blow and hurls it back — '+r+' harm reflected.</span>');
  if(C.hp<=0)endCombat(true);return;}
 if(C.guard)d=Math.ceil(d/2);
 d=Math.max(1,Math.round(d*TUNE.foe));
 G.hp-=d;clog('<span class="foe">'+mv.n+" — "+d+" harm to you.</span>");
 if(mv.drain){G.thr=Math.max(0,G.thr-mv.drain);clog('<span class="foe">It drinks '+mv.drain+' of your threads.</span>');}
}
function endCombat(won){const sc=C;C=null;G.hp=Math.max(G.hp,won?Math.max(G.hp,4):0);go(won?sc.win:sc.lose);}
function retry(combatScene){G=JSON.parse(CKPT);C=null;go(combatScene);}


const ENEMIES={};

/* ============ ASSETS ============ */
const IMG={title:"title",weasel:"weasel",trials:"trials",furnace:"furnace",
 throne:"throne",home:"home",jianghu:"jianghu",heaven:"heaven",harvested:"harvested",
 brackets:"brackets",rite:"rite",ash:"ash",seal:"seal",
 steps:"steps",shrine:"shrine",marsh:"marsh",silk:"silk",cocoon:"cocoon",
 court:"court",suyin:"suyin",loom:"loom",door:"door",threads:"threads",dawn:"dawn"};

/* ============ SCENES ============ */
const P=t=>"<p>"+t+"</p>";const SYS=t=>'<div class="sys">'+t+'</div>';const DIV='<div class="divider">\u2042</div>';
const SC={};

/* ============ BOOT ============ */
function boot(){
 G=fresh();const sv=load();if(sv)G=sv;
 const q=new URLSearchParams(location.search),dj=q.get("scene");
 if(dj&&SC[dj]){G=fresh();Object.assign(G,{scene:dj,body:4,mind:4,heart:4,insight:5,realm:2,maxthr:6,thr:6,maxhp:26,hp:26,
  pats:{snare:true,razor:true,mirror:true},f:{woke:true},mei:3,sho:2,bao:2});}
 if(!SC[G.scene])G.scene="start";
 render();
}
