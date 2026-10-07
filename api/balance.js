const{redis,validPid,json}=require('./_lib');
module.exports=async(req,res)=>{try{const pid=req.query&&req.query.pid;if(!validPid(pid))return json(res,400,{error:'pid'});
 const b=Number(await redis(['GET','bal:'+pid.toLowerCase()])||0);json(res,200,{balance:b})}catch(e){json(res,500,{error:'server'})}};
