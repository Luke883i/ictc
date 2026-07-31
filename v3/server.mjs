import http from 'node:http';
import { errorResponse, handleApi, handleStatic } from './lib/api.mjs';
const HOST=process.env.ICTC_HOST||'127.0.0.1',PORT=Number(process.env.PORT||process.env.ICTC_PORT||4173);
const server=http.createServer(async(req,res)=>{try{const url=new URL(req.url,`http://${req.headers.host||'localhost'}`);if(url.pathname.startsWith('/api/')){if(await handleApi(req,res,url)!==false)return;res.writeHead(404,{'content-type':'application/json'});return res.end(JSON.stringify({error:'API non trovata'}))}return await handleStatic(req,res,url)}catch(error){return errorResponse(res,error)}});
server.listen(PORT,HOST,()=>console.log(`ICTC v3 ready on http://${HOST}:${PORT}`));
for(const signal of['SIGINT','SIGTERM'])process.on(signal,()=>server.close(()=>process.exit(0)));
