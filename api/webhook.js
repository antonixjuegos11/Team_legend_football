const crypto=require('crypto');const{PACKS,redis}=require('./_lib');
const CREDIT="if redis.call('SET',KEYS[1],'1','NX') then redis.call('INCRBY',KEYS[2],ARGV[1]) redis.call('SET',KEYS[3],ARGV[2]) return 1 else return 0 end";
const REFUND="if redis.call('SET',KEYS[1],'1','NX') then redis.call('DECRBY',KEYS[2],ARGV[1]) return 1 else return 0 end";
function verify(raw,sig,secret){if(!sig||!secret)return false;const parts=sig.split(',').map(x=>x.split('=')),t=(parts.find(x=>x[0]==='t')||[])[1],v=parts.filter(x=>x[0]==='v1').map(x=>x[1]);if(!t)return false;
 const exp=crypto.createHmac('sha256',secret).update(t+'.'+raw).digest('hex'),a=Buffer.from(exp);
 return Math.abs(Date.now()/1000-Number(t))<600&&v.some(h=>{const b=Buffer.from(h);return a.length===b.length&&crypto.timingSafeEqual(a,b)})}
async function credit(s){if(s.payment_status!=='paid')return;const pid=s.metadata&&s.metadata.pid,p=PACKS[Number(s.metadata&&s.metadata.pack)];
 if(!pid||!p||s.amount_total!==p.cents||s.currency!=='eur')return;
 await redis(['EVAL',CREDIT,3,'done:'+s.id,'bal:'+pid,'pi:'+s.payment_intent,String(p.tokens),JSON.stringify({pid,tokens:p.tokens})])}
async function refund(c){const pi=c.payment_intent;if(!pi)return;const v=await redis(['GET','pi:'+pi]);if(!v)return;const{pid,tokens}=JSON.parse(v);
 await redis(['EVAL',REFUND,2,'refunded:'+pi,'bal:'+pid,String(tokens)])}
async function handler(req,res){if(req.method!=='POST')return res.status(405).end();
 const ch=[];for await(const c of req)ch.push(c);const raw=Buffer.concat(ch).toString('utf8');
 if(!verify(raw,req.headers['stripe-signature'],process.env.STRIPE_WEBHOOK_SECRET))return res.status(400).end('bad signature');
 try{const e=JSON.parse(raw),o=e.data.object;
  if(e.type==='checkout.session.completed'||e.type==='checkout.session.async_payment_succeeded')await credit(o);
  else if(e.type==='charge.refunded')await refund(o);
  res.status(200).json({received:true})}catch(err){res.status(500).end('error')}}
module.exports=handler;module.exports.config={api:{bodyParser:false}};module.exports.verify=verify;
