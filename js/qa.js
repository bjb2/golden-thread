"use strict";
/* QA mode: open index.html?qa=1
   1. Graph audit — every scene's t()/choices executed against a rich synthetic state;
      reports render errors, unknown targets, scenes unreachable from "start".
   2. Fuzz — N full random playthroughs through the real UI; reports JS errors,
      endings histogram, scene coverage, step-cap hits (softlock suspects). */
(function(){
 if(new URLSearchParams(location.search).get("qa")!=="1")return;
 const TERMINAL=id=>id.startsWith("end_")||id==="c4_harvested";
 const FUZZ_RUNS=40, STEP_CAP=600;
 const jsErrors=[];
 window.addEventListener("error",e=>jsErrors.push(e.message+" @"+(e.filename||"").split("/").pop()+":"+e.lineno));

 function qaState(){const g=fresh();Object.assign(g,{body:4,mind:4,heart:4,insight:8,realm:3,
  maxthr:8,thr:8,maxhp:28,hp:28,mei:3,sho:3,bao:3,yan:3,tang:3,
  pats:{snare:1,razor:1,mirror:1,mend:1,unravel:1,puppet:1},f:{woke:1,bg:"kata",grasped:1}});return g;}

 function graphAudit(){
  const ids=Object.keys(SC), edges={}, tErrors=[], badTargets=[];
  for(const id of ids){
   const sc=SC[id]; edges[id]=new Set(); G=qaState(); G.scene=id; C=null; CKPT=null;
   try{sc.t();}catch(e){tErrors.push(id+": t() threw: "+e.message);}
   if(sc.combat){edges[id].add(sc.win);edges[id].add(sc.lose);
    if(!ENEMIES[sc.combat])tErrors.push(id+": unknown enemy '"+sc.combat+"'");}
   else{try{for(const c of sc.c()){
     try{if(c.req)c.req();if(c.hide)c.hide();}catch(e){tErrors.push(id+"/"+c.id+": req/hide threw: "+e.message);}
     if(typeof c.go==="string")edges[id].add(c.go);
     else if(typeof c.go==="function"){G=qaState();try{const t=c.go();if(typeof t==="string")edges[id].add(t);}catch(e){tErrors.push(id+"/"+c.id+": go() threw: "+e.message);}}
    }}catch(e){tErrors.push(id+": c() threw: "+e.message);}}
   for(const t of edges[id])if(!SC[t])badTargets.push(id+" -> "+t);
  }
  const seen=new Set(["start"]);const q=["start"];
  while(q.length){const id=q.pop();for(const t of (edges[id]||[]))if(SC[t]&&!seen.has(t)){seen.add(t);q.push(t);}}
  const unreachable=ids.filter(i=>!seen.has(i));
  return{ids,tErrors,badTargets,unreachable};
 }

 function fuzz(){
  const endings={},visited=new Set();let softlocks=0;
  const rnd=a=>a[Math.floor(Math.random()*a.length)];
  for(let run=0;run<FUZZ_RUNS;run++){
   localStorage.removeItem("gthread");G=fresh();C=null;CKPT=null;G.scene="start";render();
   for(let step=0;step<STEP_CAP;step++){
    visited.add(G.scene);
    if(TERMINAL(G.scene)&&!C){endings[G.scene]=(endings[G.scene]||0)+1;break;}
    const btns=[...document.querySelectorAll("button.ch:not(:disabled)")];
    if(!btns.length){softlocks++;endings["SOFTLOCK@"+G.scene]=(endings["SOFTLOCK@"+G.scene]||0)+1;break;}
    let pick;
    if(C&&C.charged){pick=btns.find(b=>/Unravel|Puppet|Mirror/.test(b.textContent))||rnd(btns);}
    else if(C&&G.hp<=8){pick=btns.find(b=>/Mend|Guard/.test(b.textContent))||rnd(btns);}
    else if(C&&Math.random()<0.6){pick=btns.find(b=>/Razor|Strike/.test(b.textContent))||rnd(btns);}
    else pick=rnd(btns);
    pick.click();
    if(step===STEP_CAP-1){softlocks++;endings["STEPCAP@"+G.scene]=(endings["STEPCAP@"+G.scene]||0)+1;}
   }
  }
  return{endings,visited,softlocks};
 }

 window.addEventListener("load",()=>{setTimeout(()=>{
  const ga=graphAudit();
  const fz=fuzz();
  const cov=(100*fz.visited.size/ga.ids.length).toFixed(0);
  const li=a=>a.length?"<li>"+a.join("</li><li>")+"</li>":"<li class='gain'>none</li>";
  const eh=Object.entries(fz.endings).sort((a,b)=>b[1]-a[1])
   .map(([k,v])=>"<li>"+k+" — "+v+"</li>").join("");
  document.getElementById("hud").style.display="none";
  document.getElementById("main").innerHTML=
   "<h1 style='font-size:24px'>QA REPORT</h1>"+
   "<div class='sys'>"+ga.ids.length+" scenes · "+FUZZ_RUNS+" fuzz runs · coverage "+cov+"% ("+fz.visited.size+"/"+ga.ids.length+")</div>"+
   "<p><b>JS errors:</b></p><ul>"+li(jsErrors)+"</ul>"+
   "<p><b>Render/choice errors:</b></p><ul>"+li(ga.tErrors)+"</ul>"+
   "<p><b>Unknown targets:</b></p><ul>"+li(ga.badTargets)+"</ul>"+
   "<p><b>Unreachable from start:</b></p><ul>"+li(ga.unreachable)+"</ul>"+
   "<p><b>Softlocks/step-caps:</b> "+fz.softlocks+"</p>"+
   "<p><b>Endings reached:</b></p><ul>"+eh+"</ul>"+
   "<p class='small'>Scenes never visited by fuzz: "+ga.ids.filter(i=>!fz.visited.has(i)).join(", ")+"</p>";
  window.__QA={ga,fz,jsErrors};
  localStorage.removeItem("gthread");
 },100);});
})();
