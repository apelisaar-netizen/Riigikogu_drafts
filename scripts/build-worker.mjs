import fs from 'node:fs';import path from 'node:path';import {fileURLToPath} from 'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');const assets={};
for(const name of fs.readdirSync(path.join(root,'web'))){const file=path.join(root,'web',name);if(fs.statSync(file).isFile()&&/\.(html|css|js|json)$/.test(name))assets['/'+name]=fs.readFileSync(file,'utf8')}
const proxy=fs.readFileSync(path.join(root,'server/source-proxy.js'),'utf8').replace(/^import[^\n]*\n/gm,'').replaceAll('export ','');
const sourceCore=fs.readFileSync(path.join(root,'web/source-core.js'),'utf8').replaceAll('export ','');
const core=fs.readFileSync(path.join(root,'web/bill-core.js'),'utf8').replace(/^import[^\n]*\n/gm,'').replaceAll('export ','');
const collections=fs.readFileSync(path.join(root,'server/collections.js'),'utf8').replace(/^import[^\n]*\n/gm,'').replaceAll('export ','');
const runtime=`
const assets=${JSON.stringify(assets)};
const vendor={
 '/vendor/transformers.min.js':'https://cdn.jsdelivr.net/npm/@huggingface/transformers@3.7.3/dist/transformers.min.js',
 '/vendor/ort-wasm-simd-threaded.jsep.mjs':'https://cdn.jsdelivr.net/npm/@huggingface/transformers@3.7.3/dist/ort-wasm-simd-threaded.jsep.mjs',
 '/vendor/ort-wasm-simd-threaded.jsep.wasm':'https://cdn.jsdelivr.net/npm/@huggingface/transformers@3.7.3/dist/ort-wasm-simd-threaded.jsep.wasm',
 '/vendor/pdf.mjs':'https://cdn.jsdelivr.net/npm/pdfjs-dist@4.10.38/build/pdf.mjs',
 '/vendor/pdf.worker.mjs':'https://cdn.jsdelivr.net/npm/pdfjs-dist@4.10.38/build/pdf.worker.mjs',
 '/vendor/mammoth.browser.min.js':'https://cdn.jsdelivr.net/npm/mammoth@1.9.1/mammoth.browser.min.js'
};
${sourceCore}
${proxy}
${core}
${collections}
const collectionsHandler=createCollectionsHandler();
export default {async fetch(request,env){const url=new URL(request.url);const pathname=url.pathname;if(pathname.startsWith('/api/collections'))return collectionsHandler(request,env).catch(()=>Response.json({error:'Serverisalvestuse toiming ebaõnnestus.'},{status:500,headers:{'Cache-Control':'no-store'}}));if(pathname==='/api/source')return proxySource(request);if(!['GET','HEAD'].includes(request.method))return new Response('Method not allowed',{status:405});if(vendor[pathname]){try{const response=await fetch(vendor[pathname]);return new Response(request.method==='HEAD'?null:response.body,{status:response.status,headers:{'Content-Type':pathname.endsWith('.wasm')?'application/wasm':'text/javascript; charset=utf-8','Cache-Control':'public,max-age=86400','X-Content-Type-Options':'nosniff','Referrer-Policy':'no-referrer'}})}catch{return new Response('Teeki ei saanud laadida.',{status:502})}}const name=pathname==='/'?'/index.html':pathname;const text=assets[name];if(text===undefined)return new Response('Not found',{status:404});const type=name.endsWith('.html')?'text/html':name.endsWith('.css')?'text/css':name.endsWith('.json')?'application/json':'text/javascript';return new Response(request.method==='HEAD'?null:text,{headers:{'Content-Type':type+'; charset=utf-8','Cache-Control':'no-cache','X-Content-Type-Options':'nosniff','Referrer-Policy':'no-referrer'}})}};
`;
fs.mkdirSync(path.join(root,'dist/server'),{recursive:true});fs.writeFileSync(path.join(root,'dist/server/index.js'),runtime);console.log('Worker valmis. Varad:',Object.keys(assets).length,'; koodimahuks',Buffer.byteLength(runtime),'baiti.');
