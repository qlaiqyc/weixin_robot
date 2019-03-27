//发朋友圈

module.exports = {
    schedule: {
         cron: "0 0 0,2,4,6,8,10,12,14,16,18,20,22 * * ?",
       // interval: '120s',
       //  cron: "20 40 11 * * ?",
        type: 'worker', // 指定所有的 worker 都需要执行
    },
    async task(ctx) {
        const {app,helper,socket} = ctx;
        const {redis,memory} = app
        let param = {pic:"",text:""}, allAndroid = [];

        //判断在线用户
        let rooms =  await redis.get('rooms');
        if(String.HasText(rooms)){
            const {android} = JSON.parse(rooms);
            allAndroid = String.HasText(android)?android:[];
        }
        //if(allAndroid.length == 0)return;

        //获取发送数据
        let result ;
        try{
            result= await ctx.curl( helper.memory.url+"/api/v1/message/messages/getOneHourMessage", {  method: 'Get', contentType: 'json',   dataType: 'json',  });
            result= result.data.data;
            if(!String.HasText(result)){  console.log(result) }


            if(result.type == 1){
                param.text+=(String.HasText(result.content) ? (result.content+"\n") :'');
                param.text+=(String.HasText(result.url) ? result.url :'');
                param.pic = (String.HasText(result.circleUrl) ? result.circleUrl :'');
            }else if(result.type == 2){
                param.text+=(String.HasText(result.content) ? ("《"+result.content+"》") :'');
                param.text+=(String.HasText(result.summary) ? result.summary :'');
                param.text+=(String.HasText(result.url) ? ("\n"+result.url) :'');
                param.pic = (String.HasText(result.img_url) ? result.img_url :'');
            }
        }catch(e){
            ctx.logger.warn("====",result);
        }

        if(!(String.HasText(param.text) || String.HasText(param.pic)))return;

        //发送朋友圈
        for(let i =0,len =allAndroid.length;i<len;i++){
            const curr = allAndroid[i];
            app.io.of('/').in(curr).emit('message',JSON.stringify({
                data:param,
                key:"sendFriends",
                room:{}
            }));
        }

    },
};
