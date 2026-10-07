// Utilidades compartidas. Los archivos que empiezan por "_" no son endpoints.
const PACKS=[{tokens:60,cents:99},{tokens:200,cents:299},{tokens:350,cents:499},{tokens:750,cents:999},{tokens:1600,cents:1999}];
const env=process.env,find=re=>{const k=Object.keys(env).find(k=>re.test(k));return k?env[k]:undefined};
// Acepta los nombres normales y también los que Vercel crea con prefijo (por ejemplo tlfootball_KV_REST_API_URL)
const RURL=env.UPSTASH_REDIS_REST_URL||env.KV_REST_API_URL||find(/KV_REST_API_URL$/)||find(/REDIS_REST_URL$/),RTOK=env.UPSTASH_REDIS_REST_TOKEN||env.KV_REST_API_TOKEN||find(/KV_REST_API_TOKEN$/)||find(/REDIS_REST_TOKEN$/);
async function redis(cmd){const r=await fetch(RURL,{method:'POST',headers:{Authorization:'Bearer '+RTOK,'Content-Type':'application/json'},body:JSON.stringify(cmd)});const j=await r.json();if(j.error)throw new Error(j.error);return j.result}
const validPid=p=>typeof p==='string'&&/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(p);
function json(res,code,obj){res.setHeader('Cache-Control','no-store');res.status(code).json(obj)}
const site=req=>process.env.SITE_URL||('https://'+req.headers.host);
module.exports={PACKS,redis,validPid,json,site};
