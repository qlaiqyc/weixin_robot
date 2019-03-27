const Service = require('egg').Service;

class WXService extends Service {

    /**
     * join
     * 加入时，获取最新的用户列表，add/update 数据库主要数据
     *
     */
    async join(socket,message,ctx){
        const { key, room,data } = message;
        const {client,roomID} =room;
        const {app}= this;
        const {helper} = ctx;
        const {redis,mysql} = app;
        const nsp = app.io.of('/');
        //处理rideis

        let rooms ;

        try{
            rooms = await redis.get('rooms');
        }catch (e) {
            ctx.logger.warn("====="+JSON.stringify(e));
        }
          //设置缓存房间状态
        if(!String.HasText(rooms)) {
            rooms={android:[],web:[]}
        }else{
            rooms = JSON.parse(rooms);
        }
        let {android,web} = rooms;
        if(client == 'android'){
            //加入主房间
            socket.join('android');
            socket.join(roomID)//自己的房间用来server 端口的直接交互

            rooms[roomID] = [];
           // 创建5个子房间
            [1,2,3,4,5].forEach(curr=>{
                socket.join(roomID+'-'+curr)
                rooms[roomID].push({room:curr,num:1,maxNum:2})//房间号 当前数量 最大数量
            });

            if(!String.HasText(android)) android = [];
            if(!android.includes(roomID))android.push(roomID)

            rooms['android']=android;
            await redis.set('rooms',JSON.stringify(rooms));

            //updatae or add user  三类

            const oldUsers = await this.app.mysql.select(helper.table.user,{ where: { parent_wx: roomID }});
            const [insertData,updateData,delData] = [[],[],[]];//新的用户，需要更新的用户，已经被删除的用户

            let map4old = oldUsers.map(curr=>{return curr.username});
            let map4new = data.map(curr=>{return curr.username});
            data.forEach(curr=>{
              if(map4old.includes(curr.username)){
                  updateData.push(curr);
              }else{
                  insertData.push(curr);
              }
            });
            oldUsers.forEach(curr=>{
                if(!map4new.includes(curr.username)) delData.push(curr);
            })


           try {
               const result = await mysql.beginTransactionScope(async conn => {

                   for(let i =0,len =insertData.length;i<len;i++){
                       const curr = insertData[i];
                       await conn.insert(helper.table.user, {
                           username:curr.username,
                           nickname:String.hasEmoji(curr.nickname)?"":curr.nickname,
                           alias:curr.alias,
                           head_image:curr.reserved2,
                           parent_wx:room.roomID,
                           status:1//1,正常，2 被人删除了
                       });
                   }


                   for(let i =0,len =updateData.length;i<len;i++){
                       const curr = updateData[i];
                       await conn.update(helper.table.user, {
                           status:1//1,正常，2 被人删除了
                       },{ where: {  username: curr.username }});
                   }

                   for(let i =0,len =delData.length;i<len;i++){
                       const curr = delData[i];
                       await conn.update(helper.table.user, {
                           status:2//1,正常，2 被人删除了
                       },{ where: {  username: curr.username }});
                   }

                   return { success: true };
               }, ctx);
           }catch (e) {
               ctx.logger.warn("==join==",e);
           }

        }else{
            //加入需要选择房间号同时存入 redis
            console.log("-web---",data,message)
            socket.join('web')
            socket.join(data.roomID)

            nsp.in(data.roomID).emit('message', {  data:"加入成功",  key:"join",  room:data  });
        }
    }

    /*
     *  接受的message 做处理
     */
    async message(socket,message){
        const { key, room,data } = message;
        const {app,ctx}= this;
        const {redis,mysql} = app;
        const {helper} = ctx;
        let {content,wxid,type} = data;
        const dkey = '刚刚把你添加到通讯录，现在可以开始聊天了。';//一定时间范围内频繁删除再加不会触发方法
        let send = true;

        //3 接收，5 发送失败，1，自己发送的消息
        if(type == 1)return;
        if(type == 5){
            content = "别发";//如果发送失败后则默认为别发
            send = false;
        }

        const parent_wx = String.HasText(room.roomID) ?  room.roomID.split("-")[0] : '';//当前parent_wx
        if(!String.HasText(parent_wx)){
            app.io.of('/').in("wxid_dqd4ciogolwv22").emit('message',JSON.stringify({ data:{  wxid:"wxid_1ssluhorpzlk1",  text:"报错了="+JSON.stringify(message)  },  key:"sendMsg",  room:{roomID:"wxid_dqd4ciogolwv22"} }));
            return;
        }

        if(content.endsWith(dkey)){
            //判断数据库是否有该对象 若有 则 发送消息，没有的话，触发 join 方法批量更新数据库
            const users = await mysql.select(helper.table.user,{ where: {  username: wxid,parent_wx: room.roomID}});
            let content = '欢迎你！[呲牙] 我是一个正在进化的小机器人。我会在早上8点半和晚上8点半给你推送朋友圈里最热的三篇正在刷屏或者有刷屏趋势的内容，还会时不时发个朋友圈。希望能在你的朋友圈发光发热，成为你快乐和思考的小源泉'
            if(users.length > 0){
                content = '欢迎你回来！[呲牙] 我是一个正在进化的小机器人。我会在早上8点半和晚上8点半给你推送朋友圈里最热的三篇正在刷屏或者有刷屏趋势的内容，还会时不时发个朋友圈。希望能在你的朋友圈发光发热，成为你快乐和思考的小源泉'
            }

            //欠缺的是---判断房间是否有android

            //回复消息
            app.io.of('/').in(room.roomID).emit('message',JSON.stringify({ data:{  wxid:wxid,  text:content  },  key:"sendMsg",  room:{roomID:room.roomID} }));

            //更新数据
          //  app.io.of('/').in(room.roomID).emit('updateAll','');


        }else if(content == '别发'){

            const conn = await mysql.beginTransaction(); // 初始化事务
            try {
                //判断是update 还是更新
              const user =  await mysql.select(helper.table.handle,{ where: {  wxid: wxid,parent_wx: parent_wx,type:1}});//type=1 是发送消息状态
              if(user.length > 0){
                  if(user.status == 1) return;//1禁用 0 启用
                  await conn.update(helper.table.handle, {  status:1 },{ where: {wxid: wxid,parent_wx: parent_wx  }});
              }else{
                  await conn.insert(helper.table.handle, {  wxid:wxid,  type:1,  status:1,   parent_wx:parent_wx, });
              }
              await conn.commit(); // 提交事务
            } catch (err) {
                await conn.rollback(); // 一定记得捕获异常后回滚事务！！
                throw err;
            }

            if(send)app.io.of('/').in(room.roomID).emit('message',JSON.stringify({ data:{  wxid:wxid,  text:"设置成功"  },  key:"sendMsg",  room:{roomID:room.roomID} }));


        }else if(content == '给我发'){
            if(send)app.io.of('/').in(room.roomID).emit('message',JSON.stringify({ data:{  wxid:wxid,  text:"设置成功"  },  key:"sendMsg",  room:{roomID:room.roomID} }));
            const conn = await mysql.beginTransaction(); // 初始化事务
            try {
                const users =  await mysql.select(helper.table.handle,{ where: {  wxid: wxid,parent_wx: parent_wx,type:1}});//type=1 是发送消息状态
                if(users.length == 0)return;//不在表里
                if(users[0].status == 0) return;//1禁用 0 启用
                await conn.update(helper.table.handle, {  status:0 },{ where: {wxid: wxid,parent_wx:parent_wx  }});
                await conn.commit(); // 提交事务
            } catch (err) {
                await conn.rollback(); // 一定记得捕获异常后回滚事务！！
                throw err;
            }
        }
    }

}

module.exports = WXService;
