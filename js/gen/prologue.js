"use strict";

/* generated from story/scenes/prologue.md — do not edit */

SC["start"]={img:"title",t:()=>'<h1>THE GOLDEN THREAD</h1><h2>a transmigration wuxia</h2>'+
 P("Somewhere above a mountain on no map of your world, ten thousand lantern-bearers climb a thousand steps in the dark — and not one of them can see that the whole mountain is strung like a loom.")+
 P("You will. You will be the only living soul who can.")+
 P("But the mountain keeps a furnace fed on souls like yours, an old woman went blind listening for what you'll see, and the only door home is woven shut. Bring good knots.")+
 P("First, though — you will die at a bus stop in the rain. This is the beginning.")+
 '<p class="small">A story of knots, debts, and the space between worlds. Choices persist. Progress saves itself.</p>'+
 '<p class="small"><b>Book One</b> — Acts I &amp; II, complete. Act III: The Rivers and Lakes — in production.</p>',
 c:()=>{const sv=load();const out=[{id:"n",l:sv?"Begin anew (overwrites your saved thread)":"Begin",go:"pro1",do:()=>{G=fresh();}}];
  if(sv)out.unshift({id:"c",l:"Continue from where the thread left off",do:()=>{G=load();},go:()=>G.scene==="start"?"pro1":G.scene});
  return out;}};


SC["pro1"]={t:()=>P(`Rain hammers the bus shelter's plastic roof. You are fourteen, hood down anyway, because your hair — pale gold, almost white under the sodium lights — draws enough comments without the wet-dog look.`)+P(`Across the street, a transformer on a power pole begins to sing. A thin, rising note, like a wire drawn too tight.`)+P(`You have half a second. What rises in your mind?`),
 c:()=>[{id:"c0",l:`The kata you drilled a thousand times at the dojo. Your body moves before thought.`,do:()=>{G.f.bg="kata";addStat("body",2);},go:"pro2"},
  {id:"c1",l:`The melody you never finished writing. Eight bars, missing its resolution.`,do:()=>{G.f.bg="music";addStat("heart",1);addStat("mind",1);},go:"pro2"},
  {id:"c2",l:`The solving sequence of the puzzle cube in your pocket. Algorithms all the way down.`,do:()=>{G.f.bg="code";addStat("mind",2);},go:"pro2"},
  {id:"c3",l:`Your little sister, waiting at home with the porch light on.`,do:()=>{G.f.bg="sister";addStat("heart",2);},go:"pro2"}]};

SC["pro2"]={t:()=>P(`The wire snaps. White light eats the world.`)+DIV+P(`There is no pain. There is a place that is not a place: a darkness strung with threads beyond counting, each one a life, a river, a storm, a word. They hum. You drift among them, a loose stitch, and you understand with the calm of the dead that you have come off the Loom of one world and not yet been worked into another.`)+P(`One thread hangs nearest. It is gold. It is the exact color of your hair, and it is humming your name.`)+P(`First — what is your name?`)+`<p><input id="nm" maxlength="14" placeholder="Eli" value="${G.name||"Eli"}"></p>`,
 c:()=>[{id:"c0",l:`Reach out and GRASP the golden thread.`,do:()=>{G.name=($("nm").value.trim()||"Eli");G.f.grasped=true;addIns(1);},go:"pro3"},
  {id:"c1",l:`Go still, and let the thread come to you.`,do:()=>{G.name=($("nm").value.trim()||"Eli");addStat("heart",1);},go:"pro3"}]};

SC["pro3"]={t:()=>((G.f.grasped)?(P(`You seize it. The thread does not pull you so much as <i>sew</i> you — down, through, a needle through eternity, and for one impossible instant you see the pattern it is making: a mountain, a sect, a furnace, a door.`)):(P(`You open like a palm. The thread settles across you gently, the way a weaver lays the weft, and the darkness folds you under.`)))+P(`Then: cold water. Reeds. A grey riverbank under an alien moon, and lungs that have decided, emphatically, to keep breathing.`),
 c:()=>[{id:"c0",l:`Wake.`,do:()=>{G.f.woke=true;},go:"a1c1_ferry"}]};