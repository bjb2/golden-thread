"use strict";
/* ============ STATE ============ */
const REALMS=["Spinner","Knotter","Weaver","Loomheart","Pattern Sage"];
var G=null, C=null, CKPT=null;
function fresh(){return{name:"Eli",body:2,mind:2,heart:2,insight:0,realm:0,hp:20,maxhp:20,thr:2,maxthr:2,
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
 puppet:{n:"Puppet Strings",cost:3,d:"yank the foe\u2019s technique-threads inward"}};
const STANCES={
 iron:{see:"Its qi is braced like temple bronze \u2014 fists will bruise on it, but threads slide between the plates."},
 flow:{see:"Its form runs like meltwater \u2014 edges and knots slip off it, but a plain blow would break the current."}};

/* ============ RENDER ============ */
const $=id=>document.getElementById(id);
function hud(){
 if(G.scene==="start"||!G.f.woke){$("hud").style.display="none";return;}
 $("hud").style.display="block";
 const pl=Object.keys(G.pats).map(k=>PATS[k].n).join(", ")||"none";
 $("hud").innerHTML='<div class="row"><span class="hp">HP '+G.hp+'/'+G.maxhp+'</span>'+
  '<span class="thr">Threads '+G.thr+'/'+G.maxthr+'</span><span><b>'+REALMS[G.realm]+'</b></span>'+
  '<span>Body '+G.body+' · Mind '+G.mind+' · Heart '+G.heart+'</span><span>Insight '+G.insight+'</span></div>'+
  '<div class="row small">Patterns: '+pl+'</div><div class="bar"><i style="width:'+(100*G.hp/G.maxhp)+'%"></i></div>';
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
  G.thr=G.maxthr;if(sc.cstart)sc.cstart();}
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
 acts.push({id:"defend",l:"Guard — halve harm, gather 2 threads <span class='cost'>(free)</span>",ok:true});
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
 else if(a==="defend"){C.guard=true;G.thr=Math.min(G.maxthr,G.thr+2);clog('<span class="you">You guard and gather threads.</span>');}
 else{const p=PATS[a];G.thr-=p.cost;
  if(a==="razor"){let d=4+G.mind;if(C.stance==="flow")d=Math.ceil(d/2);dmgEnemy(d,"Razor Thread slices");}
  if(a==="snare"){if(C.stance==="flow")clog('<span class="foe">The knot closes on flowing qi and slides off \u2014 water takes no knot.</span>');
   else{C.snared=true;dmgEnemy(1,"Snare Knot binds");}}
  if(a==="mirror"){C.mirror=true;clog('<span class="you">A lattice of golden threads hangs before you.</span>');}
  if(a==="mend"){const h=4+G.heart*2;G.hp=Math.min(G.maxhp,G.hp+h);clog('<span class="good">Mend Weave reknits you. +'+h+' HP.</span>');}
  if(a==="unravel"){let d=G.mind+2;if(C.charged){d+=5;C.charged=false;C.i++;clog('<span class="good">You tear the gathering technique apart mid-form!</span>');}
   if(C.stance){d+=3;C.stance=null;clog('<span class="good">You find the stance\u2019s anchor-knot and rip it loose. The form collapses.</span>');}
   dmgEnemy(d,"Unravel rips qi loose");}
  if(a==="puppet"){const nm=C.moves[C.i%C.moves.length];let d=nm.d!=null?nm.d:4;
   if(nm.kind==="release"&&!C.charged)d=Math.ceil(d/3);if(C.stance==="flow")d=Math.ceil(d/2);C.charged=false;C.i++;
   dmgEnemy(d,"Puppet Strings turn "+nm.n+" inward");}}
 if(C.hp<=0)return endCombat(true);
 enemyAct();
 if(!C)return; // combat ended via mirror reflection
 if(G.hp<=0){ // ally saves
  if(C.allies&&G.f.elixir&&!C.elixirUsed){C.elixirUsed=true;G.hp=10;clog('<span class="good">Mei\u2019s Cloudpith Elixir burns down your throat. You stand back up.</span>');}
  else if(C.allies&&G.mei>=3&&!C.meiUsed){C.meiUsed=true;G.hp=8;clog('<span class="good">Mei drags you behind a pillar and slaps a poultice on the wound.</span>');}
  else return endCombat(false);}
 if(C.p2&&C.phase===1&&C.hp<=C.p2at){C.phase=2;C.moves=C.p2.slice();C.i=0;C.stance=null;
  clog('<span class="foe">'+(ENEMIES[C.key].p2text||"The foe sheds restraint.")+'</span>');
  if(C.allies&&G.sho>=2&&!C.shoUsed){C.shoUsed=true;C.snared=true;clog('<span class="good">Granny Sho\u2019s cane cracks the floor — threads erupt and bind him fast.</span>');}}
 G.thr=Math.min(G.maxthr,G.thr+1);
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
 steps:"steps",shrine:"shrine",marsh:"marsh",silk:"silk",cocoon:"cocoon"};

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
