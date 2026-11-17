// Original documents and source hashes stay unchanged. Ranges refer to original offsets.
export function fallbackBody(text){
 let body=text;const greeting=body.match(/(?:^|\n)\s*(?:Lugupeetud|Austatud|Head Riigikogu)[^\n]*\n/);
 if(greeting)body=body.slice(greeting.index+greeting[0].length);
 else if(/^\s*(?:From:|Saatja:)/i.test(body)){const start=body.search(/\n\s*(?:Tere\s*\n|Toetame\b|Eelnõu\b)/);body=start>=0?body.slice(start).replace(/^\s*Tere\s*\n/,''):''}
 body=body.split(/(?:^|\n)\s*(?:Lugupidamisega|Heade soovidega)/i)[0];
 return body.split('\n').filter(line=>!/^\s*(?:From:|Sent:|To:|Cc:|Subject:|Saatja:|Saadetud:|Adressaat:|Koostaja:|Registrikood|Tel\b|Telefon\b)/i.test(line)&&!/^\s*[\w.+-]+@[\w.-]+\s*$/.test(line)).join('\n').trim();
}
export function projectContent(doc,start=0,end=doc.text.length){
 if(!doc.contentRanges)return fallbackBody(doc.text.slice(start,end));
 return doc.contentRanges.map(([a,b])=>doc.text.slice(Math.max(a,start),Math.max(Math.max(a,start),Math.min(b,end)))).filter(s=>s.trim()).join('\n').replace(/\n\s*\n(?:\s*\n)+/g,'\n\n').trim();
}
export function attachContent(doc,entry,hash){const ranges=entry?.text_sha256===hash?entry.ranges:null;const result={...doc,contentRanges:ranges};result.contentText=projectContent(result);return result}
export function contentSnippet(doc,match,query,makeExcerpt){
 if(match){const text=projectContent(doc,match.start,match.start+match.text.length);if(text.length>=60)return text.replace(/\s+/g,' ')}
 return makeExcerpt(doc.contentText??fallbackBody(doc.text),query);
}
