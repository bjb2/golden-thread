"use strict";

/* generated from story/scenes/act3_ch17.md — do not edit */

Object.assign(ENEMIES,{
 ruanspar:{name:"Ruan, Sparring",hp:26,
  open:"Ruan salutes \u2014 a full degree deeper than courtesy requires, which from him is a grin. \u201CNo stakes. No masters. Show me what the river taught you.\u201D",
  moves:[{n:"Veil of Iron",kind:"stance",st:"iron",text:"Iron rises over his skin \u2014 lighter than it used to, worn like a coat instead of a cell.",tele:"He is veiling \u2014 iron, but easy, almost playful."},
   {n:"Measured palm",d:4},
   {n:"Veil of Water",kind:"stance",st:"flow",text:"The iron runs to water mid-step. He has been practicing.",tele:"The veil is melting into current."},
   {n:"Water-sleeve tap",d:4},
   {n:"Rooting",kind:"charge",text:"He sinks into the old rooted stance, gathering \u2014 and watches you over it, one eyebrow up.",tele:"The Mountain-Crushing Palm. He wants to see your answer for old times' sake."},
   {n:"Mountain-Crushing Palm (pulled)",d:8,kind:"release"}]}});


SC["a3c17_lamp"]={t:()=>SYS(`CHAPTER SEVENTEEN — RUAN RETURNS`)+P(`The chandler's address in Reedgate Town has a message waiting — but it isn't from Bao. It's a room number at the Inn of the Patient Heron, and a single line in a copybook hand you last saw on tournament rolls: <i>The measuring rod has been doing arithmetic. Come check my work.</i>`)+P(`Ruan has taken the inn's cheapest room and filled it with his inheritance: Elder Kang's private books, the ones the rites office never saw, carried down a thousand steps in a fish-crate. He has been on the river five weeks, working the receipts from the other end — and it shows. The iron veil is gone; what's left is a lean, careful man with ink on his fingers and the particular calm of someone who has decided what his life is for.`)+((G.f.a2_ruan_hand)?(P(`“You knelt with me in the ashes,” he says, by way of greeting, moving ledgers off the room's one stool. “Nobody else thought I was worth an hour of cold floor. So when I found the thing I'm about to show you, there was exactly one person I considered showing.” The warmth in it is quiet and entirely new.`)):(P(`“You beat me with my own palm and then never once collected on it,” he says, by way of greeting, moving ledgers off the room's one stool. “In my experience, men who don't collect are saving the debt for something. Here's my offer: collect it tonight. Help me check this arithmetic.”`)))+P(`The arithmetic, laid out across the bed, the floor, the windowsill: Kang's tribute receipts cross-referenced against forty years of river-trade manifests Ruan has begged, bought, and memorized out of harbor offices. The silkworm seal's collection routes, reconstructed. Eleven halls — <i>eleven</i> — paying the season-tithe along this watershed alone. Clearwater was never the second furnace. It was the second you'd FOUND.`),
 c:()=>[{id:"c0",l:`Work through the night. Two auditors, one lamp, eleven kind and gentle halls.`,do:()=>{addIns(1);note("By dawn you have what neither of you had alone: the network's shape. Every route knots through one point in the lake country — a riverhouse with no trade name, no sect, no tax record. The address from Kang's last page. The Court's counting room.");},go:"a3c17_spar"}]};

SC["a3c17_spar"]={t:()=>P(`Dawn comes up over Reedgate's water-roofs, and Ruan rolls his shoulders and looks at you with the old measuring glint — scrubbed, this time, of anyone else's purpose.`)+P(`“My master had me fight to be weighed,” he says. “I've been wondering for half a year what it's like to fight for nothing at all. Inn yard's empty.” The eyebrow goes up. “Well, weaver?”`),
 c:()=>[{id:"c0",l:`Take the yard. No stakes, no masters, pulled blows — find out what the river taught you both.`,go:"a3c17_match"},
  {id:"c1",l:`Decline — pour the man some tea instead. You've seen his arithmetic; you don't need his bruises.`,do:()=>{G.f.a3_spar="declined";note("Ruan looks briefly, profoundly cheated — then laughs, the second laugh you've ever heard from him, and sits back down to the tea. “The kitchens really do teach a different art,” he says. He means it as the day's highest compliment, and you take it as one.");},go:"a3c17_oath"}]};

SC["a3c17_match"]={combat:"ruanspar",
 win:"a3c17_won",
 lose:"a3c17_lost",
 t:()=>""};

SC["a3c17_won"]={t:()=>P(`It ends with Ruan flat on his back in the inn yard for the second time in his life, laughing up at the morning sky — actually laughing, loose and unguarded, a sound his master spent nineteen years making impossible.`)+P(`“Better,” he announces, to the sky, to the laundry lines, to the innkeeper's appalled rooster. “You were a clever accident at the trials. THAT was an art.” He takes your hand up. “Whatever the kitchens are teaching, the sects should burn their manuals.”`),
 c:()=>[{id:"c0",l:`The yard, the tea, the morning.`,do:()=>{G.f.a3_spar="won";},go:"a3c17_oath"}]};

SC["a3c17_lost"]={t:()=>P(`The pulled Mountain-Crushing Palm taps your collarbone like a creditor's knuckle, and you sit down in the inn yard's dust grinning while the world reorders itself.`)+P(`“The river's made you quicker and the marsh has made you tired,” Ruan diagnoses, hauling you up. “And you guard low on the left since the Cocoon— since the furnace.” He catches the slip, files it, and pours the tea himself. Losing to Ruan, it turns out, is one of the more informative experiences available on this river.`),
 c:()=>[{id:"c0",l:`The yard, the tea, the morning.`,do:()=>{G.f.a3_spar="lost";addIns(1);G.hp=G.maxhp;},go:"a3c17_oath"}]};

SC["a3c17_oath"]={t:()=>P(`Over the third pour, Ruan sets down his cup with ceremony, and you realize the whole morning has been this sentence working up its nerve.`)+P(`“I was a famine orphan weighed like grain,” he says. “Then a measuring rod in another man's hand. I am offering to be a brother in yours — sworn, witnessed, the old way, incense and the river for witnesses. Not because you beat me.” A pause, the old precision. “Because you bowed.”`),
 c:()=>[{id:"c0",l:`Swear it. Incense, the river, the old words — his thread tied into your pattern, knotted and named.`,do:()=>{G.f.a3_ruan_sworn=true;G.f.ruan=3;note("Sworn brothers, witnessed by moving water. When the incense burns down, Ruan pockets the ash. “Bookkeeping,” he says, and for the first time it's a joke.");},go:"a3c18_boat"},
  {id:"c1",l:`“Some knots don't need names. You're already in the weave, Ruan. Ask anyone who's watched my back lately.”`,do:()=>{G.f.ruan=2;note("He considers that for a long moment — then nods, once, the deep tournament nod. “Unworded, then. My master named everything and meant none of it. I can learn the opposite.” He stays. That was never in question.");},go:"a3c18_boat"}]};