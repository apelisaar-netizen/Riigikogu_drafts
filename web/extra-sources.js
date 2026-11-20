import {source,extract} from './bill-import.js';
import {normalizeSourceUrl,SOURCE_TYPES} from './source-core.js';
import {fallbackBody} from './content-view.js';
const digest=async text=>Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(text)))).map(n=>n.toString(16).padStart(2,'0')).join('');
export function detectFormat(buffer,name=''){
 const bytes=new Uint8Array(buffer),head=new TextDecoder().decode(bytes.slice(0,1000));
 if(head.startsWith('%PDF-'))return 'pdf';if(bytes[0]===80&&bytes[1]===75){if(/\.docx$/i.test(name)||!name.includes('.'))return 'docx';throw Error('Pakitud fail pole toetatud Wordi dokument.');}
 if(/\.doc$/i.test(name))throw Error('Vana DOC-vorming pole toetatud. Salvesta fail DOCX-i või PDF-ina.');
 if(/<!doctype html|<html|<body|<article/i.test(head))return 'html';
 if(/\.(pdf|docx)$/i.test(name))throw Error('Faili sisu ei vasta valitud vormingule.');
 if(bytes.includes(0))throw Error('Fail pole loetav teksti-, PDF- ega DOCX-dokument.');return 'txt';
}
export async function importExtraSources({bill,type,title,author,date,url,files=[],onProgress=()=>{}}){
 if(!SOURCE_TYPES[type])throw Error('Vali dokumendi liik.');
 if(!/^\d{4}-\d{2}-\d{2}$/.test(date)||Number.isNaN(Date.parse(date)))throw Error('Sisesta dokumendi kuupäev.');
 const origin=normalizeSourceUrl(url);if(files.length>20)throw Error('Korraga saab lisada kuni 20 faili.');
 const inputs=files.length?files:[{name:'',arrayBuffer:()=>source(origin)}],records=[],attachments=[];let bytesTotal=0;
 for(let i=0;i<inputs.length;i++){
  const file=inputs[i];onProgress('Loen allikat '+(i+1)+'/'+inputs.length+'…');if(file.size>12*1024*1024)throw Error('Fail on suurem kui 12 MB.');
  const buffer=await file.arrayBuffer();bytesTotal+=buffer.byteLength;if(buffer.byteLength>12*1024*1024||bytesTotal>64*1024*1024)throw Error('Failide maht ületab lubatud piiri.');
  const format=detectFormat(buffer,file.name),filename=file.name||((title.trim()||SOURCE_TYPES[type])+'.'+format),copy=buffer.slice(0);
  let original=await extract(buffer,'source.'+format),docTitle=title.trim()||file.name||SOURCE_TYPES[type];
  if(format==='html'){
   const html=new DOMParser().parseFromString(new TextDecoder().decode(copy),'text/html');
   docTitle=title.trim()||html.querySelector('h1')?.textContent.trim()||html.title||docTitle;
   html.querySelectorAll('script,style,nav,header,footer,aside,form,button').forEach(n=>n.remove());
   const main=html.querySelector('main,article,[role="main"],.entry-content');if(!main&&!files.length&&!/\/files\/[0-9a-f-]{36}\/download/i.test(origin))throw Error('Lehelt ei leitud eristatavat dokumenditeksti. Lisa protokolli või seletuskirja otselink või laadi fail.');
   const content=main||html.body;content.querySelectorAll('p,br,div,tr,li,h1,h2,h3').forEach(n=>n.append('\n'));original=content.textContent;
  }
  const text=fallbackBody(original).replace(/[ \t]+/g,' ').replace(/\n\s*\n(?:\s*\n)+/g,'\n\n').trim();if(text.length<80)throw Error('Loetavat sisuteksti on liiga vähe. Pildina skannitud fail vajab tekstituvastust.');if(text.length>350000)throw Error('Dokumendi tekst on üle 350 000 tähemärgi.');
  const sha=await digest(text);records.push({id:bill.id+'-source-'+sha.slice(0,32),bill_uuid:bill.id,bill_id:'',title:docTitle.slice(0,500),submitter:author.trim()||SOURCE_TYPES[type],listed_date:date,document_type:type,topics:[],text,text_sha256:sha,source_url:origin,source_filename:filename,provenance:'third_party_source',user_authored:false});
  attachments.push({name:filename,type:{pdf:'application/pdf',docx:'application/vnd.openxmlformats-officedocument.wordprocessingml.document',html:'text/html',txt:'text/plain'}[format],bytes:copy});
 }
 return {records,attachments};
}
export function buildBrowserIndex(records,onProgress){return new Promise((resolve,reject)=>{const worker=new Worker(new URL('./semantic-worker.js',import.meta.url),{type:'module'});worker.onmessage=({data})=>{if(data.type==='progress')onProgress(data.message);if(data.type==='built'){worker.terminate();resolve(data.index)}if(data.type==='error'){worker.terminate();reject(Error(data.message))}};worker.onerror=()=>{worker.terminate();reject(Error('Tähendusindeksi loomine ebaõnnestus.'))};worker.postMessage({type:'build',id:1,records})})}
export async function mergeIndex(base,added,records){
 if(!base||base.dimensions!==added.dimensions||base.model!==added.model||base.revision!==added.revision||base.dtype!==added.dtype)throw Error('Olemasolevat indeksit ei saa täiendada.');
 const expected=new Map(records.map(d=>[d.id,d.text_sha256]));const documents=[...base.documents,...added.documents];if(documents.length!==records.length||documents.some(d=>expected.get(d.id)!==d.text_sha256))throw Error('Indeks ei vasta kogu dokumentidele.');
 const chunks=[...base.chunks,...added.chunks];if(chunks.length>2400)throw Error('Kogus on üle 2400 indekseeritava sisulõigu.');return {...added,documents,chunks,chunk_count:chunks.length,vectors:[...base.vectors,...added.vectors]};
}
export async function defaultIndex(){const [index,encoded]=await Promise.all([fetch('semantic-index.json').then(r=>{if(!r.ok)throw Error('Indeksit ei saanud laadida.');return r.json()}),fetch('embeddings.json').then(r=>{if(!r.ok)throw Error('Indeksit ei saanud laadida.');return r.json()})]);const bytes=Uint8Array.from(atob(encoded.data),c=>c.charCodeAt(0));return {...index,vectors:Array.from(new Float32Array(bytes.buffer))};}
