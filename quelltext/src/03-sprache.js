//@@ modul: 03-sprache
// ===== Sprachdatei: alle Namen und Kartentexte an einer Stelle. Eine weitere Sprache ist ein zweiter Block (z. B. TXT.en). =====
// Godot-Vorbereitung 2c: alle Namen und Kartentexte stehen in daten/texte_de.json (von mache.py eingebaut, inklusive der früheren Korrekturen aus 0.94).
const TXT={de:(({hinweis,...t})=>t)(/*@@DATEN:texte_de@@*/null)};
let LANG='de';
function applyLang(l){const L=TXT[l]||TXT.de,set=(o,t)=>{for(const k in t)if(o[k])Object.assign(o[k],t[k])};LANG=l;set(CARDS,L.card);for(const k in CARDS){const c=CARDS[k];c.fx=((L.card[k]||{}).fx||[]).slice();for(const t of['beute','raubtier','scheu','show'])if(c.tags.includes(t))c.fx.push(L.tagfx[t]);c.text=c.fx.map(x=>x.replace('|',' ')).join(' · ')}try{set(EVENTS,L.event)}catch(e){}try{set(RULES,L.rule)}catch(e){}try{set(SPEC,L.spec)}catch(e){}try{spGrpFx()}catch(e){}try{set(PROGS,L.prog)}catch(e){}try{set(ADS,L.ad)}catch(e){}try{for(const P of[...Object.values(PROGS),...Object.values(ADS)])P.text=(P.fx||[]).map(x=>x.replace('|',' ')).join(' · ')}catch(e){}try{set(INSP,L.insp)}catch(e){}}
applyLang(LANG);
