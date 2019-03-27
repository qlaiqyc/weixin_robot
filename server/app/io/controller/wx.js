'use strict';

const Controller = require('egg').Controller;

class wx extends Controller {

    async message() {
        const { ctx, app } = this;
        const nsp = app.io.of('/');
        const socket = ctx.socket;
        const client = socket.id;
        let message = ctx.args[0] || {};

        console.log(message)

        const allRooms = nsp.adapter.rooms;

        try {
            if(typeof  message == "string") message =eval('('+ message+')');

            const { key, room,data } = message;
            if (!key) return

            const sendEmit = (key,sdata)=>{
                const {roomID,client} = room;
                let sendObj ={
                    data:data || {},
                    key:key,
                    room:room
                };
                if(client == 'web'){
                    socket.to(roomID).emit('message',JSON.stringify(sendObj));//{wxid:,text:}
                }else{
                    if(key == 'message')return;
                    //sendObj.room ={}
                //   console.log("--------------",roomID,sendObj,allRooms)
                    socket.to(roomID).emit('message',sendObj);
                }
            };

            const defFun = {
                join(){
                    ctx.service.wx.join(socket,message,ctx)
                },
                getAllUser(){
                    sendEmit("getAllUser",data)
                },
                sendMsg(){
                    sendEmit("sendMsg",data)
                },
                sendAllMsg(){
                    sendEmit("sendAllMsg",data)
                },
                sendFriends(){
                    sendEmit("sendFriends",data)
                },
                execSQL(){
                    sendEmit("execSQL",data)
                },
                message(){
                    //监听 android 发送消息后回调方法
                    if(data.wxid == room.roomID) return;
                    ctx.service.wx.message(socket,message)
                }
            }

            if(key in defFun) defFun[key]();
            // console.log(9999,room,allRooms)

        } catch (error) {
            app.logger.error(error);
        }
    }
}

module.exports = wx;
