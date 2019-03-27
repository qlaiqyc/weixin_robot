/**
 * 群发消息
 * ==redis 获取当前在线Android 有的话 定时发送消息，没有的话，不处理
 * ==判断mysql 中允许发送的消息
 * */

module.exports = {
    schedule: {
        cron: "0 30 8,20 * * ?",
        //  interval: '120s',
        type: 'worker',
    },
    async task(ctx) {
        const {app,helper,socket} = ctx;
        const {redis,memory,mysql} = app

        //判断在线用户
        let rooms =  await redis.get('rooms'), allAndroid = [];
        if(String.HasText(rooms)){
            const {android} = JSON.parse(rooms);
            allAndroid = String.HasText(android)?android:[];
        }
         if(allAndroid.length == 0)return;

        //判断允许用户
        const sql = "select a.nickname,a.username,a.parent_wx,a.addtime FROM "+helper.table.user+" a where a.username not in (SELECT b.wxid from "+helper.table.handle+" b where b.type =1 and b.status=1 and  a.parent_wx=b.parent_wx)";
        let users =  await mysql.query(sql);
        let content = "";

        const nowTime = (new Date((new Date()).Format("yyyy/MM/dd"))).getTime();
        const oneDay = 24*60*60*1000;
        const sendMsg = [
            {time:3*oneDay,text:"如果觉得每天接收两次对话感到烦躁，给我发送“别发”，我就不发了。[闭嘴]如果又希望得到发送，您发送“给我发”，我就又发了。[發]"},
            {time:5*oneDay,text:"如果您觉得我还不错，请把我推荐给其他朋友吧[玫瑰]"},
            {time:7*oneDay,text:"如果你对我们的产品有什么建议，留言告诉我，我们会努力改进。"},
        ];

        users = users.map(curr=>{
            //add 属性判断是否发送二次消息

           const addTime = (new Date((new Date(curr.addtime)).Format("yyyy/MM/dd"))).getTime();
           const cha = nowTime -addTime;
           curr.send = false;
           curr.sendMsg = "";

           sendMsg.forEach(obj=>{
               if(!curr.send){
                   if(cha == obj.time){
                       curr.sendMsg = obj.text;
                       curr.send = true;
                   }
               }
           })
            return curr
        })
        //获取发送数据
        let result;
        try{
            result = await ctx.curl( helper.memory.url+"/api/v1/message/messages/get12HourMessage", {  method: 'Get', contentType: 'json',   dataType: 'json',  });
            content =result.data.data
        }catch(e){
            console.log("error")
            ctx.logger.warn("====",result);
        }
        if(!String.HasText(content))return;

        const hours = (new Date()).getHours();

        //发送消息
        for (let curr of users) {
            if(allAndroid.includes(curr.parent_wx) && curr.parent_wx !=curr.username){
                await new Promise(resolve => {setTimeout(()=>{resolve()},2000)})
                app.io.of('/').in(curr.parent_wx).emit('message',JSON.stringify({  data:{ wxid:curr.username,  text:content },  key:"sendMsg",  room:{roomID:curr.parent_wx} }));
                // //判断是上午还是下午
                if(hours > 12){
                    //根据 入库的时间和状态来判断 是否发送消息
                    if(curr.send){
                        await new Promise(resolve => {setTimeout(()=>{resolve()},2000)})
                        app.io.of('/').in(curr.parent_wx).emit('message',JSON.stringify({  data:{  wxid:curr.username, text:curr.sendMsg  },  key:"sendMsg",  room:{roomID:curr.parent_wx}   }));
                    }
                }
            }
        }
    },
};
