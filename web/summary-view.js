export function selectSummary(topics,records,filters={}) {
 const byId=new Map(records.map(d=>[d.id,d]));const primary=topics?.[0];
 if(!primary||primary.score<0.80)return null;
 const paragraphs=primary.paragraphs.filter(p=>p.source_ids.every(id=>{const d=byId.get(id);return d&&(!filters.submitter||d.submitter===filters.submitter)&&(!filters.topic||d.topics.includes(filters.topic))&&(!filters.type||d.document_type===filters.type)}));
 if(!paragraphs.length)return null;
 const ids=[...new Set(paragraphs.flatMap(p=>p.source_ids))];
 return {title:primary.title,paragraphs,sources:ids.map(id=>byId.get(id))};
}
export function renderSummary(root,topics,records,state) {
 root.replaceChildren();root.hidden=state.mode!=='semantic'||!state.query.trim();if(root.hidden)return;
 const element=(tag,text)=>{const el=document.createElement(tag);el.textContent=text;return el};
 root.append(element('h2','Kokkuvõttev vastus'));if(topics===null){root.append(element('p','Teemakokkuvõtteid ei saanud laadida. Proovi otsingut uuesti; algtekstide vasteid saad endiselt vaadata.'));return}
 const answer=selectSummary(topics,records,state);
 if(!answer){root.append(element('p','Selle küsimuse ja valitud filtrite jaoks ei leitud sobivat teemakokkuvõtet. Vaata allpool algtekstide vasteid või täpsusta küsimust.'));return}
 const label=element('p',answer.title);label.className='answer-topic';root.append(label);
 for(const item of answer.paragraphs){const p=element('p',item.text);for(const id of item.source_ids){const d=answer.sources.find(s=>s.id===id);const ref=element('a',' ['+(answer.sources.indexOf(d)+1)+']');ref.href=d.source_url;ref.target='_blank';ref.rel='noopener';ref.title=d.submitter+' · '+d.listed_date;p.append(ref)}root.append(p)}
 const details=element('details','');details.append(element('summary','Vastuse allikad ('+answer.sources.length+')'));const list=element('ol','');for(const d of answer.sources){const li=element('li',''),a=element('a',d.submitter+' · '+new Date(d.listed_date+'T12:00:00').toLocaleDateString('et-EE'));a.href=d.source_url;a.target='_blank';a.rel='noopener';li.append(a);list.append(li)}details.append(list);root.append(details);
 const note=element('p','Vastus on valitud ette koostatud, allikaviidetega teemakokkuvõtetest. Uusi väiteid jooksvalt ei genereerita.');note.className='answer-note';root.append(note);
}
