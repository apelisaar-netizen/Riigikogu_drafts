export const IMPORT_METHODS={
 api:{label:'Riigikogu API (vaikimisi)',hint:'Leia eelnõu ja vali selle avalikud dokumendid. Algfailid jäävad Riigikogusse; neid ei ole vaja käsitsi lisada.'},
 document:{label:'Fail või dokumendi otselink',hint:'Lisa avatud eelnõu kogusse dokument, mida API-st ei leia. Lisa PDF-, DOCX-, TXT- või HTML-fail või Riigikogu dokumendi otselink.'},
 backup:{label:'JSON-varukoopia',hint:'Taasta varem eksporditud allikakogu. See kajastab eksportimise aegset seisu ega too Riigikogust uusi dokumente.'},
 webpage:{label:'Arvamuste lehe link',hint:'Varuvariant API asemel: loe arvamusfaile Riigikogu eelnõu arvamuste lehelt. Seletuskirju ja protokolle see viis automaatselt ei leia.'}
};
export function methodNavigation(dialog,initial,onChange,isBusy=()=>false){
 const fieldset=document.createElement('fieldset');fieldset.className='method-navigation';const legend=document.createElement('legend');legend.textContent='Allikate lisamise viis';const select=document.createElement('select');select.setAttribute('aria-label','Allikate lisamise viis');for(const [value,{label}]of Object.entries(IMPORT_METHODS))select.append(new Option(label,value));const hint=document.createElement('p');hint.className='method-hint';fieldset.append(legend,select,hint);const heading=dialog.querySelector('h2');heading.after(fieldset);let current=initial;
 const update=mode=>{current=mode;select.value=mode;hint.textContent=IMPORT_METHODS[mode].hint};update(initial);
 select.onchange=()=>{if(isBusy()){select.value=current;return}onChange(select.value)};
 return {update};
}
