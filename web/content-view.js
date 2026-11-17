// Ranges always refer to original source offsets; originals remain unchanged.
const closing=/^\s*(?:Lugupidamisega|Heade soovidega|Parimate soovidega|Austusega|Lugupidamise avaldusega)(?:[!,.:]|\s*$)/i;
const metadata=/^\s*(?:(?:From|Sent|To|Cc|Subject|Saatja|Saadetud|Adressaat|Koostaja|Teema|Registrikood|Registreerimisnumber|Telefon|E-post|Epost|Tel|Faks|Meie|Teie)\s*[:.\d]|(?:\(allkirjastatud digitaalselt\)|allkirjastatud digitaalselt|digitaalselt allkirjastatud)\s*$|(?:https?:\/\/|www\.)\S+\s*$|[\w.+-]+@[\w.-]+\s*$|(?:lk\.?\s*)?\d+\s*(?:\/\s*\d+)?\s*$)/i;
const greeting=/^\s*(?:Lugupeetud|Austatud|Head Riigikogu|Tere(?:[!,]|$))/i;
// Only administrative introductions are omitted; mixed paragraphs retain substantive claims.
const introduction=/^\s*(?:(?:Täname|Tänan)\b[^.!?]*[.!?]?|(?:Saadame|Edastame|Esitame)\s+(?:Teile\s+)?(?:oma\s+)?(?:arvamuse|seisukoha|ettepanekud)\b[^.!?]*[.!?]?|(?:Olete|Olete meile)\s+[^.!?]*palunud\s+[^.!?]*[.!?]?)\s*$/i;
export function bodyRanges(text){
 const lines=[...text.matchAll(/[^\n]+(?:\n|$)/g)];let begin=0,end=text.length;
 const salutation=lines.find(l=>greeting.test(l[0]));if(salutation)begin=salutation.index+salutation[0].length;
 const signoff=lines.find(l=>l.index>=begin&&closing.test(l[0].trim()));if(signoff)end=signoff.index;
 const ranges=[];
 for(const line of lines){const a=line.index,b=a+line[0].length,t=line[0].trim();if(a<begin||a>=end||!t||metadata.test(t)||greeting.test(t)||introduction.test(t))continue;
 // Footer contact lines commonly combine addresses, mail and phone numbers.
 if(t.length<220&&(/@/.test(t)||/\b(?:tel|telefon|e-post|registrikood)\s*[:+]/i.test(t))&&!/\b(?:ettepanek|eelnõu|toet|kohustus|õigus|paragrahv|muudatus)/i.test(t))continue;
 if(ranges.length&&ranges.at(-1)[1]===a)ranges.at(-1)[1]=Math.min(b,end);else ranges.push([a,Math.min(b,end)]);
 }
 return ranges;
}
export function fallbackBody(text){return projectContent({text,contentRanges:bodyRanges(text)})}
export function projectContent(doc,start=0,end=doc.text.length){
 if(!doc.contentRanges)return projectContent({...doc,contentRanges:bodyRanges(doc.text)},start,end);
 return doc.contentRanges.map(([a,b])=>doc.text.slice(Math.max(a,start),Math.max(Math.max(a,start),Math.min(b,end)))).filter(s=>s.trim()).join('\n').replace(/\n\s*\n(?:\s*\n)+/g,'\n\n').trim();
}
export function attachContent(doc,entry,hash){const ranges=entry?.text_sha256===hash?entry.ranges:bodyRanges(doc.text);const result={...doc,contentRanges:ranges};result.contentText=projectContent(result);return result}
export function contentSnippet(doc,match,query,makeExcerpt){
 if(match){const text=projectContent(doc,match.start,match.end??(match.start+match.text.length));if(text.length>=60)return makeExcerpt(text,query)}
 return makeExcerpt(doc.contentText??fallbackBody(doc.text),query);
}
// Prefer the sentence with the greatest query coverage, within the semantic match.
export function focusedExcerpt(text,query,limit=600){
 const words=[...new Set((query.toLocaleLowerCase('et').match(/[\p{L}\p{N}]{3,}/gu)||[]))];
 const sentences=[...text.matchAll(/[^.!?\n]+(?:[.!?]+(?=\s|$)|\n|$)/g)];
 let best=0,score=0;
 for(const sentence of sentences){const lower=sentence[0].toLocaleLowerCase('et');const n=words.reduce((sum,w)=>sum+(lower.includes(w)?1:0),0);if(n>score){score=n;best=sentence.index}}
 let start=best;while(start>0&&/\s/.test(text[start]))start++;
 let end=Math.min(text.length,start+limit);if(end<text.length){const boundary=text.lastIndexOf(' ',end);if(boundary>start+limit/2)end=boundary}
 return (start?'… ':'')+text.slice(start,end).replace(/\s+/g,' ').trim()+(end<text.length?' …':'');
}
