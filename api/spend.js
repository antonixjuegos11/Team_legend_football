const{redis,validPid,json}=require('./_lib');
const LUA="local b=tonumber(redis.call('GET',KEYS[1]) or '0') local a=tonumber(ARGV[1]) if b>=a then return redis.call('DECRBY',KEYS[1],a) else return -1 end";
module.exports=async(req,res)=>{try{if(req.method!=='POST')return json(res,405,{error:'method'});
 const{pid,amount}=req.body||{};if(!validPid(pid)||!Number.isInteger(amount)||amount<1||amount>100000)return json(res,400,{error:'bad request'});
 const k='bal:'+pid.toLowerCase(),r=Number(await redis(['EVAL',LUA,1,k,String(amount)]));
 if(r<0){const b=Number(await redis(['GET',k])||0);return json(res,200,{ok:false,balance:b})}json(res,200,{ok:true,balance:r})}catch(e){json(res,500,{error:'server'})}};
