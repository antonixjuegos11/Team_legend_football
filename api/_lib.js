// Utilidades compartidas. Los archivos que empiezan por "_" no son endpoints.
const PACKS=[{tokens:60,cents:99},{tokens:200,cents:299},{tokens:350,cents:499},{tokens:750,cents:999},{tokens:1600,cents:1999}];
const RURL=process.env.UPSTASH_REDIS_REST_URL||process.env.KV_REST_API_URL,RTOK=process.env.UPSTASH_REDIS_REST_TOKEN||process.env.KV_REST_API_TOKEN;
async function redis(cmd){const r=await fetch(RURL,{method:'POST',headers:{Authorization:'Bearer '+RTOK,'Content-Type':'application/json'},body:JSON.stringify(cmd)});const j=await r.json();if(j.error)throw new Error(j.error);return j.result}
const validPid=p=>typeof p==='string'&&/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(p);
function json(res,code,obj){res.setHeader('Cache-Control','no-store');res.status(code).json(obj)}
const site=req=>process.env.SITE_URL||('https://'+req.headers.host);
module.exports={PACKS,redis,validPid,json,site};
