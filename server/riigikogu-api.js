import {draftQuery} from '../web/riigikogu-core.js';
export async function riigikoguApi(request,fetcher=fetch){
 const json=(data,status=200)=>Response.json(data,{status,headers:{'Cache-Control':'no-store','X-Content-Type-Options':'nosniff'}});
 if(request.method!=='GET')return json({error:'Lubatud on ainult andmete lugemine.'},405);
 try{const local=new URL(request.url);const detail=local.pathname.match(/^\/api\/riigikogu\/drafts\/([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})$/i);let target;
 if(detail)target=new URL('https://api.riigikogu.ee/api/volumes/drafts/'+detail[1]);
 else if(local.pathname==='/api/riigikogu/drafts'){const query=draftQuery(local.searchParams.get('q')||'');if(query.id)target=new URL('https://api.riigikogu.ee/api/volumes/drafts/'+query.id);else{target=new URL('https://api.riigikogu.ee/api/volumes/drafts');for(const [key,value]of Object.entries(query))target.searchParams.set(key,value);const page=Number(local.searchParams.get('page')||0);if(!Number.isInteger(page)||page<0||page>100)throw Error('Vigane leheküljenumber.');target.searchParams.set('page',page);target.searchParams.set('size','20')}}
 else return json({error:'API päring ei ole lubatud.'},404);
 target.searchParams.set('lang','ET');const response=await fetcher(target.href,{redirect:'manual',headers:{Accept:'application/json'},signal:AbortSignal.timeout(25000)});
 if(!response.ok)return json({error:'Riigikogu API ei saanud andmeid väljastada ('+response.status+'). Proovi hiljem uuesti.'},response.status===404?404:502);
 const reader=response.body.getReader(),parts=[];let size=0;for(;;){const {done,value}=await reader.read();if(done)break;size+=value.length;if(size>5*1024*1024){await reader.cancel();return json({error:'API vastus on liiga suur.'},502)}parts.push(value)}const bytes=new Uint8Array(size);let at=0;for(const part of parts){bytes.set(part,at);at+=part.length}const data=JSON.parse(new TextDecoder().decode(bytes));return json(data);
 }catch(e){console.error('Riigikogu API päring:',e.message);return json({error:e.name==='TypeError'||e.name==='TimeoutError'?'Riigikogu API ei ole praegu kättesaadav. Proovi uuesti.':e.message},400)}
}
