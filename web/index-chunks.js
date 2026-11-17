import {bodyRanges} from './content-view.js';
export const INDEX_MODEL={model:'Xenova/multilingual-e5-small',revision:'761b726dd34fb83930e26aab4e9ac3899aa1fa78',dtype:'q8'};
export function collectionChunks(records){
 const chunks=[],documents=[];
 for(const doc of records){documents.push({id:doc.id,text_sha256:doc.text_sha256});for(const [bodyStart,bodyEnd]of bodyRanges(doc.text)){let start=bodyStart;while(start<bodyEnd){let end=Math.min(start+1200,bodyEnd);if(end<bodyEnd){const boundary=doc.text.lastIndexOf('\n',end);if(boundary>start+700)end=boundary}chunks.push({doc_id:doc.id,start,end,text:doc.text.slice(start,end)});if(end>=bodyEnd)break;start=Math.max(start+1,end-150)}}}
 if(!chunks.length)throw Error('Dokumentides ei leitud indekseeritavat sisuteksti.');
 if(chunks.length>2400)throw Error('Andmekogu on automaatseks indekseerimiseks liiga suur.');
 return {chunks,documents};
}
