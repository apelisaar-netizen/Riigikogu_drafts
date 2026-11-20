export function sourceType(value){return value==='explanatory_note_correction'?'explanatory_note':value}
export const SOURCE_TYPES={opinion:'Arvamus / pöördumine',explanatory_note:'Seletuskiri',committee_minutes:'Komisjoni istungi protokoll',bill_text:'Eelnõu tekst',amendment:'Muudatusettepanek',other_source:'Muu menetlusdokument',ministry_amendment:'Ministeeriumi ettepanek',committee_reply:'Komisjoni vastus'};
export function normalizeSourceUrl(value){
 let url;try{url=new URL(value)}catch{throw Error('Sisesta Riigikogu dokumendi või lehe täielik link.');}
 if(url.protocol!=='https:'||!['www.riigikogu.ee','riigikogu.ee'].includes(url.hostname)||url.username||url.password||url.port)throw Error('Lubatud on ainult Riigikogu avalikud HTTPS-lingid.');
 const allowed=/^\/wp-json\/riigikogu\/v1\/files\/[0-9a-f-]{36}\/download\/?$/i.test(url.pathname)||/^\/tegevus\/(?:eelnoud\/[0-9a-f-]{36}\/|komisjonid\/|dokumendiregister\/)/i.test(url.pathname);
 if(!allowed)throw Error('Link peab viitama Riigikogu eelnõule, komisjoni lehele või avalikule menetlusdokumendile.');
 url.hostname='www.riigikogu.ee';url.hash='';url.search='';return url.href;
}
export function mergeSources(base,additional){
 const records=base.records.map(({contentText,contentRanges,...d})=>d),ids=new Set(records.map(d=>d.id)),hashes=new Set(records.map(d=>d.text_sha256));const accepted=[];
 for(const d of additional){if(d.bill_uuid!==base.bill.id)throw Error('Allikas kuulub teise eelnõu juurde.');if(hashes.has(d.text_sha256)||ids.has(d.id))continue;records.push(d);accepted.push(d);hashes.add(d.text_sha256);ids.add(d.id)}
 if(!accepted.length)throw Error('Need allikad on selles kogus juba olemas.');
 if(records.length>100||records.reduce((n,d)=>n+d.text.length,0)>6e6)throw Error('Täiendatud kogu ületab 100 dokumendi või 6 miljoni tähemärgi piiri.');
 return {bundle:{format:'riigikogu-opinions-v1',bill:base.bill,records,report:base.report},accepted};
}
