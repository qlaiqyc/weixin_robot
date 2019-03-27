package com.example.ql.xposedemo;

import com.alibaba.fastjson.JSON;
import com.alibaba.fastjson.JSONArray;
import com.alibaba.fastjson.JSONObject;
import com.example.ql.util.LongLogUtils;

import java.io.File;
import java.util.concurrent.Executors;
import java.util.concurrent.ScheduledExecutorService;
import java.util.concurrent.TimeUnit;

import io.socket.client.Ack;
import io.socket.client.IO;
import io.socket.client.Socket;
import io.socket.emitter.Emitter;

public class SocketUitl {
    private static String socketUrl = "http://192.168.0.108:3000";//"http://47.97.226.48:9000";//
    public wxHandle wHandle ;
    public wxSql wxsql ;
    public static Socket socket ;
    public static String roomID ="";
    public static JSONObject defParam;
   // public static String sql4alluser = "select a.alias,a.nickname,a.username,b.reserved2,c.unReadCount,c.digest from rcontact a INNER JOIN img_flag b  on a.username=b.username left join rconversation c on c.username=a.username where a.username not like '%@app%' and a.verifyFlag=0 and a.username not in(select d.username from DeletedConversationInfo d)";
    public static String sql4alluser ="select a.alias,a.nickname,a.username,b.reserved2,c.unReadCount,c.digest from rcontact a INNER JOIN img_flag b  on a.username=b.username left join rconversation c on c.username=a.username where a.username not like '%@app%'and a.username not like '%@chatroom%' and a.verifyFlag=0";

    public  void start(wxHandle handle,wxSql wxdql){
        wHandle =handle;
        wxsql = wxdql;
        addEvent();
        //监听判断是否是有数据
    };


    public void SendMsg(String key, Object sobj){
        JSONObject obj = new JSONObject();
//        String rommId = (String).getString("roomID") ||roomID ;
//        defParam.put("roomID",roomID);
//        String rommId = (String)defParam.getString("roomID") ;
//        if(rommId != null || rommId !="null"){
//            defParam.put("roomID",rommId);
//        }else{
//
//        }

        obj.put("key",key);
        obj.put("data",sobj);
        obj.put("room",defParam);


        LongLogUtils.e("--2--rooomID",JSON.toJSONString(defParam));

        socket.emit("message",obj);
    }




    public  void addEvent()  {

        LongLogUtils.e("-=-------connection","====addEvent");
        String key = "java-";
        try{
            socket = IO.socket(socketUrl);

            socket.on(Socket.EVENT_CONNECT, new Emitter.Listener() {
                @Override
                public void call(Object... args) {
                    LongLogUtils.e("-=---join----connection", JSON.toJSONString(args));

                    try {
                        roomID = wxsql.getMineWxID();

                        JSONObject obj = new JSONObject();
                        obj.put("roomID",roomID);
                        obj.put("client","android");
                        defParam = obj;

                        SendMsg("join",wxsql.execSQL("EnMicroMsg.db",sql4alluser));

                    } catch (Exception e) {
                        e.printStackTrace();
                    }
                }
            }).on("updateAll", new Emitter.Listener() {
                @Override
                public void call(Object... args) {
                    try {
                        roomID = wxsql.getMineWxID();

                        JSONObject obj = new JSONObject();
                        obj.put("roomID",roomID);
                        obj.put("client","android");
                        defParam = obj;

                        SendMsg("join",wxsql.execSQL("EnMicroMsg.db",sql4alluser));

                    } catch (Exception e) {
                        e.printStackTrace();
                    }
                }
            }).on("message", new Emitter.Listener() {
                @Override
                public void call(Object... args) {
                    try{
                        LongLogUtils.e("------asdads",JSON.toJSONString(args));

                        JSONObject data = (JSONObject) JSON.parse((String) args[0]);

                        final JSONObject obj = (JSONObject) data.getObject("data",JSONObject.class);
                        String key = data.getString("key");

                       try{

                           JSONObject room = ((JSONObject)data.getObject("room",JSONObject.class));

                           JSONObject sobj = new JSONObject();
                           sobj.put("roomID", room.getString("roomID"));
                           sobj.put("client","android");
                           defParam = sobj;

                           LongLogUtils.e("--0--rooomID",JSON.toJSONString(room)+"="+room.getString("roomID")+"="+JSON.toJSONString(defParam));
                       }catch (Exception e){
                           LongLogUtils.e("----rooomID",JSON.toJSONString(defParam));
                       }
                        LongLogUtils.e("----key",key);


                        if(key.equals("sendFriends")){
                            LongLogUtils.e("----sendFriends",JSON.toJSONString(obj));
                            try {   SendMsg("sendFriends", wxHandle.postFriends(obj.getString("text"),obj.getString("pic")));} catch (Exception e) {  e.printStackTrace();   }

                        }else if(key.equals("getAllUser")){
                            try {   SendMsg("getAllUser",wxsql.getAllUser());  } catch (Exception e) {   e.printStackTrace();  }
                        }else if(key.equals("sendMsg")){
                            try {   SendMsg("sendMsg",wHandle.postInfoByWxID(obj.getString("wxid"),obj.getString("text")));  } catch (Exception e) {  e.printStackTrace();   }
                        }else if(key.equals("sendAllMsg")){

                                new Thread(new Runnable() {
                                    @Override
                                    public void run() {
                                        try {
                                            String content = obj.getString("content");
                                            JSONArray js  = wxsql.execSQL("EnMicroMsg.db",sql4alluser);

                                            LongLogUtils.e("----",JSON.toJSONString(js));
                                            for(int i=0,len =js.size(); i<len;i++){
                                                // 遍历 jsonarray 数组，把每一个对象转成 json 对象
                                                com.alibaba.fastjson.JSONObject job = js.getJSONObject(i);
                                                String username = job.getString("username");
                                                Thread.sleep(2000);
                                                wxHandle.postInfoByWxID(username,content);
                                            }
                                        } catch (Exception e) {
                                            LongLogUtils.e("--sendAllMsg--",JSON.toJSONString(e));
                                        }

                                    }
                                }).start();

                           // try {   SendMsg("sendAllMsg",true);  } catch (Exception e) {  e.printStackTrace();   }
                        }else if(key.equals("execSQL")){
                            try {   SendMsg("execSQL",wxsql.execSQL(obj.getString("db"),obj.getString("sql")));  } catch (Exception e) {  e.printStackTrace();   }

                        }
                    }catch(Exception e){}
                }
            }).on("delPic", new Emitter.Listener() {
                @Override
                public void call(Object... args) {
                    //删除图片
                    new Thread(new Runnable() {
                        @Override
                        public void run() {
                            try {
                                wxHandle.deleteFile(new File("/storage/emulated"));
                            }catch (Exception e){

                            }
                        }
                    }).start();


                }
            });

            socket.connect();

        }catch (Exception e){
            LongLogUtils.e("============err==","-======asdasd");
            LongLogUtils.e("==err==",JSON.toJSONString(e));
        }

    };

}
