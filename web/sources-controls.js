import {SOURCE_TYPES,mergeSources} from './source-core.js';
import {importExtraSources,buildBrowserIndex,mergeIndex,defaultIndex} from './extra-sources.js';
import {saveBill} from './bill-store.js';
import {uploadServerCollection} from './server-store.js';
export function initSourcesControls(bar,bill,records,activeBundle){
 const el=(tag,text)=>{const n=document.createElement(tag);if(text!==undefined)n.textContent=text;return n};
 const open=el('button','Lisa allikaid');open.type='button';bar.append(open);
 const dialog=el('dialog');dialog.className='import-dialog';dialog.append(el('h2','Lisa selle eelnõu allikaid'),el('p',bill.title),el('p','Lisa seletuskiri, komisjoni istungi protokoll või muu menetlusdokument. Kontrolli, et dokument käsitleb valitud eelnõu. Allikas osaleb edaspidi otsingus ja kokkuvõtvas vastuses koos arvamustega.'));
 const form=el('form');const field=(labelText,input,id)=>{const label=el('label',labelText);label.htmlFor=id;input.id=id;form.append(label,input);return input};
 const type=field('Dokumendi liik',el('select'),'source-type');for(const [value,label]of Object.entries(SOURCE_TYPES))type.append(new Option(label,value));type.value='explanatory_note';
 const title=field('Dokumendi pealkiri (soovitatav)',el('input'),'source-title');title.maxLength=500;
 const author=field('Koostaja või komisjon (soovitatav)',el('input'),'source-author');author.maxLength=250;
 const date=field('Dokumendi kuupäev',el('input'),'source-date');date.type='date';date.required=true;
 const url=field('Riigikogu dokumendi või selle avaldamislehe link',el('input'),'source-url');url.type='url';url.required=true;url.placeholder='https://www.riigikogu.ee/…';
 form.append(el('p','Sisesta PDF-, DOCX-, teksti- või HTML-dokumendi otselink. Kui lingilt ei saa dokumenti lugeda, vali allpool fail. Faili lisamisel jääb link algallika viiteks.'));
 const files=field('Failid (valikuline, PDF, DOCX, TXT või HTML)',el('input'),'source-files');files.type='file';files.multiple=true;files.accept='.pdf,.docx,.txt,.html,.htm';
 const storage=field('Täiendatud kogu salvestamine',el('select'),'source-storage');storage.append(new Option('Ainult selles brauseris','browser'),new Option('Serverisse — 5 päevaks, uus jagamislink','server'));storage.value=activeBundle?.server?'server':'browser';
 form.append(el('p','Brauserisse salvestamisel jäävad lisatud tekstid ja indeks sellesse seadmesse. Serverisse salvestamisel luuakse täiendatud kogust uus jagamislink, mida saab kolleegidega jagada. Varasem serverikogu säilib oma tähtaja lõpuni. Uue kogu ligipääs lõpeb viie päeva möödudes; failide kustutuskontroll käib kord päevas.'));
 form.append(el('p','Indeks koostatakse praegu brauseris mõlema salvestusvaliku puhul. Serverisse salvestamine võib võtta kauem, sest pärast indekseerimist laaditakse ka kogu ja algfailid serverisse; serverikogu täiendamisel kopeeritakse kaasa varasemad algfailid. Ajakulu sõltub failide mahust, arvuti kiirusest ja üleslaadimisühendusest. Hoia leht töö lõpuni avatuna. Olemasolevaid dokumente uuesti ei indekseerita.'));
 const status=el('p');status.setAttribute('role','status');status.className='import-status';const submit=el('button','Lisa otsingusse');submit.type='submit';const close=el('button','Sulge');close.type='button';form.append(status,submit,close);dialog.append(form);document.body.append(dialog);let busy=false;
 open.onclick=()=>dialog.showModal();close.onclick=()=>dialog.close();dialog.addEventListener('cancel',e=>{if(busy)e.preventDefault()});
 form.onsubmit=async e=>{e.preventDefault();if(busy)return;busy=true;for(const input of form.elements)input.disabled=true;status.classList.remove('error');const progress=text=>{status.textContent=text};
 try{
  const imported=await importExtraSources({bill,type:type.value,title:title.value,author:author.value,date:date.value,url:url.value,files:[...files.files],onProgress:progress});
  const {bundle,accepted}=mergeSources({bill,records,report:activeBundle?.report},imported.records);
  const baseIndex=activeBundle?.index||await defaultIndex();progress('Koostan ainult lisatud allikate tähendusindeksi…');
  const addedIndex=await buildBrowserIndex(accepted,progress);bundle.index=await mergeIndex(baseIndex,addedIndex,bundle.records);
  let oldAttachments=activeBundle?.attachments||[];
  if(storage.value==='server'&&activeBundle?.server?.files?.length){oldAttachments=[];for(const file of activeBundle.server.files){progress('Laadin varasema kogu algfaili: '+file.name);const response=await fetch('/api/collections/'+activeBundle.server.id+'/files/'+file.id,{cache:'no-store'});if(!response.ok)throw Error('Varasema kogu algfaili ei saanud kopeerida. Proovi uuesti.');oldAttachments.push({name:file.name,type:file.type,bytes:await response.arrayBuffer()})}}
  if(storage.value==='browser'&&activeBundle?.server?.files?.length){for(const file of activeBundle.server.files){progress('Salvestan varasema kogu algfaili brauserisse: '+file.name);const response=await fetch('/api/collections/'+activeBundle.server.id+'/files/'+file.id,{cache:'no-store'});if(!response.ok)throw Error('Varasema kogu algfaili ei saanud laadida.');oldAttachments.push({name:file.name,type:file.type,bytes:await response.arrayBuffer()})}}
  const acceptedHashes=new Set(accepted.map(d=>d.text_sha256));bundle.attachments=[...oldAttachments,...imported.attachments.filter((f,i)=>acceptedHashes.has(imported.records[i].text_sha256))];
  if(bundle.attachments.reduce((n,f)=>n+f.bytes.byteLength,0)>64*1024*1024)throw Error('Kogu algfailide maht ületab 64 MB.');
  if(storage.value==='server'){const created=await uploadServerCollection(bundle,progress);location.href=location.pathname+'?collection='+created.id}
  else{await saveBill(bundle);location.href=location.pathname+'?bill='+encodeURIComponent(bill.id)+'&custom=1'}
 }catch(error){status.textContent=error.message;status.classList.add('error')}finally{busy=false;for(const input of form.elements)input.disabled=false}}
}
