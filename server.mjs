import { createReadStream, existsSync, statSync } from 'node:fs';
import { createServer } from 'node:http';
import { extname, join, normalize } from 'node:path';
const root = new URL('.', import.meta.url).pathname;
const types = { '.html':'text/html; charset=utf-8','.css':'text/css; charset=utf-8','.js':'application/javascript; charset=utf-8','.json':'application/manifest+json','.png':'image/png','.jpg':'image/jpeg','.jpeg':'image/jpeg','.webp':'image/webp' };
createServer((req,res)=>{let path=decodeURIComponent(req.url.split('?')[0]);if(path==='/'||path==='')path='/index.html';const file=normalize(join(root,path));if(!file.startsWith(root)||!existsSync(file)||statSync(file).isDirectory()){res.writeHead(404);res.end('Not found');return}res.writeHead(200,{'Content-Type':types[extname(file)]||'application/octet-stream','Cache-Control':'no-cache'});createReadStream(file).pipe(res)}).listen(4173,'0.0.0.0',()=>console.log('Rota Europa website ready on 4173'));
