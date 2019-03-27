package com.example.ql.xposedemo;

import android.content.ContentValues;
import android.database.Cursor;
import android.util.Log;

import com.alibaba.fastjson.JSON;
import com.alibaba.fastjson.JSONArray;
import com.alibaba.fastjson.JSONObject;
import com.example.ql.util.LongLogUtils;

import java.util.Arrays;
import java.util.HashMap;
import java.util.Iterator;
import java.util.LinkedList;
import java.util.List;
import java.util.Map;
import java.util.Timer;
import java.util.TimerTask;
import java.util.concurrent.Executors;
import java.util.concurrent.ScheduledExecutorService;
import java.util.concurrent.TimeUnit;

import de.robv.android.xposed.XC_MethodHook;
import de.robv.android.xposed.XposedBridge;
import de.robv.android.xposed.XposedHelpers;

public class wxListen {
    private  ClassLoader baseLoader=null;
    private String loadClassName ="";
    private  Class<?> hookClass=null;

    private int getType = 0;//0正常 1 需要修改
    //====
    private Map<String,String> allContacts =new HashMap();

    public wxHandle wHandle = new wxHandle();
    public SocketUitl socketUitl = new SocketUitl();
    public wxSql wxsql = new wxSql();

    private Object bth = null;//深copy 源对象 ah 初始化 需要加载的对象

    private Map<String,Object[]> DBInfo = new HashMap<>();//保存加载的DB 信息

   // private String loadClassName = "";

    public JSONArray getDBInfo() throws Exception {
        if(this.DBInfo.size() == 0) return  new JSONArray();

      return  this.compGetContacts();
    };

    public boolean hasClass(String name){

        boolean result = false;
        try {
            baseLoader.loadClass(name);
            result = true;
        } catch (Exception e) {
            result = false;
        }
        return  result;
    };


    public void start(final ClassLoader classLoader, int num, String path){
        baseLoader = classLoader;
        loadClassName = path;
        try {getMsg(2);} catch (Exception e) {  }
        try {wxGetSqlInfos();} catch (Exception e) {  }
//        try {wxGetLogs();} catch (Exception e) {  }

        wHandle.start(classLoader,this,num);
        if(num == 1){

            final Timer timer = new Timer();
//            public void schedule(TimerTask task, long delay, long period)
           timer.schedule(new TimerTask() {
               @Override
               public void run() {
                   if(DBInfo.size() > 3){
                       LongLogUtils.e("----------error","////"+DBInfo.size());
                       wxsql.start(classLoader,DBInfo);
                       socketUitl.start(wHandle,wxsql);
                       timer.cancel();
                   }

               }
           },2000,3000);
        }
    };



    //监听-sql 执行

    public void wxGetSqlInfos( )throws Exception{

        final String path4contact5 ="com.tencent.mm.bt.f";

        if(loadClassName.startsWith(path4contact5)){
            XposedHelpers.findAndHookMethod(path4contact5, baseLoader, "s",String.class,String.class,boolean.class,  new XC_MethodHook() {
                @Override
                protected void afterHookedMethod(MethodHookParam param) throws Throwable {
                    LongLogUtils.e("m.bt.f-1--","======"+JSON.toJSONString(param.args));
                    super.afterHookedMethod(param);
                    String[] names =   (param.args[0]+"").split("/");
                    String keys =names[names.length -1];
                    DBInfo.put(keys,param.args);
                }
            });
        }
//
//        final String path4contact777 ="com.tencent.wcdb.database.SQLiteSession";
//        if(loadClassName.startsWith(path4contact777)) {
//
//            LongLogUtils.e("------------------go",loadClassName);
//
//            XposedHelpers.findAndHookMethod(path4contact777, baseLoader, "execute", String.class,Object[].class,int.class,baseLoader.loadClass("com.tencent.wcdb.support.CancellationSignal"),
//                    new XC_MethodHook() {
//                        @Override
//                        protected void afterHookedMethod(MethodHookParam param) throws Throwable {
//                            super.afterHookedMethod(param);
//                            LongLogUtils.e("execute---","======"+JSON.toJSONString(param.args[0]));
//                            LongLogUtils.e("execute---","======"+JSON.toJSONString(param.args[1]));
//                            LongLogUtils.e("execute---","======"+JSON.toJSONString(param.args[2]));
//                        }
//                    });
//        }


        //保存加载的 db 信息  (坑啊，当直接hook 无效的情况下 实际在真实机器配跑的时候一定 要hook 其构造方法 再hook其 方法)
        try{
//            XposedBridge.hookAllConstructors(baseLoader.loadClass(path4contact5), new XC_MethodHook() {
//                @Override
//                protected void afterHookedMethod(MethodHookParam param2) throws Throwable {
//                    super.afterHookedMethod(param2);
//                    XposedHelpers.findAndHookMethod(path4contact5, baseLoader, "s",String.class,String.class,boolean.class,  new XC_MethodHook() {
//                        @Override
//                        protected void afterHookedMethod(MethodHookParam param) throws Throwable {
//                            LongLogUtils.e("m.bt.f-1--","======"+JSON.toJSONString(param.args));
//                            super.afterHookedMethod(param);
//                            String[] names =   (param.args[0]+"").split("/");
//                            String keys =names[names.length -1];
//                            DBInfo.put(keys,param.args);
//                        }
//                    });
//                }
//            });



        }catch(Exception e){

        }

    }

    //监听-被动接收微信发送的消息
    private  void getMsg(int i) throws Exception{


        /**
         * text [41,109,"wxid_1ssluhorpzlk1",1547111785000,"熊操刀设计风格的","wxid_1ssluhorpzlk1"]
         * share-link [43,112,"wxid_1ssluhorpzlk1",1547112401000,"搜狗黑科技亮相CES 2019 AI合成主播现场实时播报","wxid_1ssluhorpzlk1"]
         * link [41,113,"wxid_1ssluhorpzlk1",1547112544000,"https://mp.weixin.qq.com/s/rLQTtJlN6zYhGPSnBT1csQ","wxid_1ssluhorpzlk1"]
         * 图片 语音 不行
         */
        final String path4AddMsg ="com.tencent.mm.plugin.fts.c.c";

        boolean result = (i == 1 ? hasClass(path4AddMsg):loadClassName.startsWith(path4AddMsg));

        if(result) {

            LongLogUtils.e("=============","/////");
            XposedHelpers.findAndHookMethod(path4AddMsg,baseLoader, "a",int.class, long.class, String.class, long.class, String.class, String.class,new XC_MethodHook() {
                @Override
                protected void beforeHookedMethod(MethodHookParam param) throws Throwable {
                    super.beforeHookedMethod(param);

//
//                  //  判断是给自己 还是别人发送
//                    String wx_toUser = (String) param.args[2];
//                    String wx_self = (String) param.args[5];
//                    String wx_content = (String) param.args[4];
//
//
//                    JSONObject jo = new JSONObject();
//                    jo.put("wxid",wx_toUser);
//                    jo.put("content",wx_content);
//                    LongLogUtils.e("===error",JSON.toJSONString(jo));
//                    socketUitl.SendMsg("message",jo);
//
//
//                    String a = "UPDATE rconversation SET content=?,username=?,flag=?,status=?,hasTrunc=?,digestUser=?,digest=?,msgType=?,conversationTime=?,isSend=?,msgCount=? WHERE username=?";
//                    LongLogUtils.e("-----------------gggg====",a.startsWith("UPDATE rconversation SET")+"-----");

                }

            });
        }



        //监听插入
        final String path4contact99 ="com.tencent.wcdb.database.SQLiteProgram";
        if(loadClassName.startsWith(path4contact99)){
            XposedHelpers.findAndHookConstructor(path4contact99, baseLoader, baseLoader.loadClass("com.tencent.wcdb.database.SQLiteDatabase"),String.class,Object[].class, baseLoader.loadClass("com.tencent.wcdb.support.CancellationSignal"), new XC_MethodHook() {
                @Override
                protected void afterHookedMethod(MethodHookParam param) throws Throwable {
                    super.afterHookedMethod(param);

                    String sql = (String) param.args[1];
                    Object[] list = (Object[]) param.args[2];
                    int type = 0;


                    if(sql.startsWith("INSERT INTO rconversation")){
                        type = 1;
                    }else if(sql.startsWith("UPDATE rconversation SET")){
                        type = 2;
                    }else{
                        type = 0;
                    }


                    if(type >0 ){

                        LongLogUtils.e("=============MSG===", "======" + JSON.toJSONString(list));
                       try{
                           String wx_content = (String) (list[0]);
                           String wx_toUser = (String) (list[1]);
                           int wx_type = (int) (list[3]);

                           JSONObject jo = new JSONObject();
                           jo.put("wxid",wx_toUser);
                           jo.put("content",wx_content);
                           jo.put("type",wx_type);//3 接收，5 发送失败，1，自己发送的消息

                           socketUitl.SendMsg("message",jo);
                       }catch(Exception e){

                       }

                    }

                }
            });


        }

    }






//    =========================old=====



    private  JSONArray execSQL(String db,String sql)throws Exception{

        Class btf = XposedHelpers.findClass("com.tencent.mm.bt.f", baseLoader);

        Object[] dbs=  null;

        if( DBInfo.containsKey(db)){
            dbs = DBInfo.get(db);
        }else{
            if(db.equals("SnsMicroMsg.db")){
                dbs = DBInfo.get("EnMicroMsg.db");
                dbs[0] = (dbs[0]+"").replace("EnMicroMsg.db",db);
                dbs[1]="";
            }
        }


        Object obtf = XposedHelpers.callMethod(btf.newInstance(),"s",dbs[0],dbs[1],dbs[2]);

        Cursor c= (Cursor) XposedHelpers.callMethod(obtf,"b",sql,null,2);

        JSONArray js = new JSONArray();
        c.moveToFirst();
       // LongLogUtils.e("---er",JSON.toJSONString(dbs)+"=="+JSON.toJSONString(DBInfo)+"==="+db+"===="+sql+"==="+c.getCount());
        while (c.moveToNext()) {
            JSONObject jo = new JSONObject();

            for (int i = 0; i < c.getColumnCount(); i++) {


                try {
                    jo.put(c.getColumnName(i),c.getString(i));

                } catch (Exception e) {
                    jo.put(c.getColumnName(i),c.getBlob(i));
                  //  LongLogUtils.e("resu-2--","#### result:" + c.getColumnName(i));
                }

            }
            js.add(jo);
        };


        return js;
    };

    //查询 当前 用户的所有联系人
    private JSONArray compGetContacts () throws Exception{
        LongLogUtils.e("result----",10000+"");



        Class btf = XposedHelpers.findClass("com.tencent.mm.bt.f", baseLoader);

        Object[] dbs=  DBInfo.get("EnMicroMsg.db");

        Object obtf = XposedHelpers.callMethod(btf.newInstance(),"s",dbs[0],dbs[1],dbs[2]);

        String sql = "select * from rcontact where verifyFlag=0";
        Cursor c= (Cursor) XposedHelpers.callMethod(obtf,"b",sql,null,2);
      //  LongLogUtils.e("sfil===",JSON.toJSONString(c));
        JSONArray js = new JSONArray();
        c.moveToFirst();

       List filter =  Arrays.asList("weixin,appbrandcustomerservicemsg,medianote,helper_entry,notifymessage,pc_share,shakeapp,voipapp,tmessage,linkedinplugin,blogapp,filehelper,qqsync,voicevoipapp,feedsapp,qqfriend,cardpackage,masssendapp,floatbottle,qqmail,facebookapp,newsapp,officialaccounts,topstoryapp,voiceinputapp,qmessage,fmessage,readerapp,lbsapp,meishiapp,weibo,wxid_dqd4ciogolwv22".split(","));

        while (c.moveToNext()) {

            JSONObject json = new JSONObject();

            String username = c.getString(c.getColumnIndex("username"));
            json.fluentPut("username",username);
            json.fluentPut("nickname",c.getString(c.getColumnIndex("nickname")));

           if(!(filter.contains(username) || username.endsWith("@app") ||username.endsWith("@chatroom")))js.add(json);
        }
        c.close();

        return  js;
    }

    //监听-获取联系人消息
    private void getContact() throws Exception {

        /*
         * 获取没有读取的消息（公众号、）
         *Yg == 获取当前面板 联系人的数据
         * 可以深入研究一下
         *
         * */
        final String path4contact2 ="com.tencent.mm.storage.ah";
        if(loadClassName.startsWith(path4contact2)) {
            XposedHelpers.findAndHookConstructor(path4contact2, baseLoader, baseLoader.loadClass("com.tencent.mm.bt.h"), new XC_MethodHook() {
                @Override
                protected void beforeHookedMethod(MethodHookParam param) throws Throwable {
                    super.beforeHookedMethod(param);
                }

                @Override
                protected void afterHookedMethod(MethodHookParam param) throws Throwable {
                    super.afterHookedMethod(param);
//                    Log.e(path4contact2+"=kkk=1=", "======" + JSON.toJSONString(param.args));
//                    Log.e(path4contact2+"=kkk=2=", "======" + JSON.toJSONString(param.thisObject));
//                    Log.e(path4contact2+"=kkk=3=", "======" + JSON.toJSONString(param.getResult()));
                }
            });

            XposedHelpers.findAndHookMethod(path4contact2,baseLoader, "Yg",String.class ,  new XC_MethodHook() {
                @Override
                protected void beforeHookedMethod(MethodHookParam param) throws Throwable {

                   // if(getType == 1) param.args[0] = searchKey;

                    super.beforeHookedMethod(param);

                }
                @Override
                protected void afterHookedMethod(MethodHookParam param) throws Throwable {

                    Log.e(path4contact2+"=Yg=0=", "======" + JSON.toJSONString(param.args));

                    super.afterHookedMethod(param);

                }
            });


            XposedHelpers.findAndHookMethod(path4contact2,baseLoader, "cli", new XC_MethodHook() {
                @Override
                protected void beforeHookedMethod(MethodHookParam param) throws Throwable {
                    super.beforeHookedMethod(param);
//                    Log.e(path4contact2+"===", "======" + JSON.toJSONString(param.args));
//                   Log.e(path4contact2+"===", "======" + JSON.toJSONString(param.thisObject));
//                    Log.e(path4contact2+"===", "======" + JSON.toJSONString(param.getResult()));
                }
                @Override
                protected void afterHookedMethod(MethodHookParam param) throws Throwable {
                    super.afterHookedMethod(param);
                   // List list = (List) param.getResult();
                    LongLogUtils.e("cli=1==", "======" + JSON.toJSONString(param.args));
                    LongLogUtils.e("cli=2==", "======" + JSON.toJSONString(param.thisObject));
                    LongLogUtils.e("cli=3==", "======" + JSON.toJSONString(param.getResult()));
                  //  LongLogUtils.e(path4contact2+"=1==", "======" + JSON.toJSONString(list));
                }
            });

//            XposedHelpers.findAndHookMethod(path4contact2,baseLoader, "a",String.class , String.class, List.class, List.class, boolean.class, boolean.class, new XC_MethodHook() {
//                @Override
//                protected void beforeHookedMethod(MethodHookParam param) throws Throwable {
//                    super.beforeHookedMethod(param);
////                   Log.e(path4contact2+"===", "======" + JSON.toJSONString(param.args));
////                   Log.e(path4contact2+"===", "======" + JSON.toJSONString(param.thisObject));
////                    Log.e(path4contact2+"===", "======" + JSON.toJSONString(param.getResult()));
//                }
//                @Override
//                protected void afterHookedMethod(MethodHookParam param) throws Throwable {
//                    super.afterHookedMethod(param);
//                    // List list = (List) param.getResult();
//                    //Log.e(path4contact2+"=04==", "======" + JSON.toJSONString(param.args));
//                    LongLogUtils.e(path4contact2+"=05==", "======" + JSON.toJSONString(param.thisObject));
//                  //  Log.e(path4contact2+"=06==", "======" + JSON.toJSONString(param.getResult()));
//                    //  LongLogUtils.e(path4contact2+"=1==", "======" + JSON.toJSONString(list));
//                }
//            });



        }





    }

    //监听=朋友圈加载数据
    private void getFriends()throws Exception {

        final String path4contact ="com.tencent.mm.plugin.sns.ui.aw";
        if(loadClassName.startsWith(path4contact)) {

            XposedHelpers.findAndHookMethod(path4contact, baseLoader, "xC", int.class,   new XC_MethodHook() {
                @Override
                protected void afterHookedMethod(MethodHookParam param) throws Throwable {
                    super.afterHookedMethod(param);

                    LongLogUtils.e("path4contact---","======"+JSON.toJSONString(param.args));
                    LongLogUtils.e("path4contact-3--", "======" + JSON.toJSONString(param.getResult()));
                    //   Log.e("path4contact-2--","======"+JSON.toJSONString(param.thisObject));
                }
            });
        }


        //获取朋友圈信息--item  单个信息
        final String path4contact2 ="com.tencent.mm.modelsns.e";
        if(loadClassName.startsWith(path4contact2)) {

            XposedHelpers.findAndHookMethod(path4contact2, baseLoader, "ng",String.class, new XC_MethodHook() {
                @Override
                protected void afterHookedMethod(MethodHookParam param) throws Throwable {
                    super.afterHookedMethod(param);
                    LongLogUtils.e("wxPostFrients-1--","======"+JSON.toJSONString(param.args));
                    LongLogUtils.e("wxPostFrients-2--","======"+param.thisObject);
                    LongLogUtils.e("wxPostFrients-3--","======"+param.getResult());
                }
            });
        }

    }

    //监听-发布朋友圈数据
    private void postFriends()throws Exception{

            final String path4contact ="com.tencent.mm.plugin.sns.ui.SnsUploadUI$5$1";
            if(loadClassName.startsWith(path4contact)) {

                XposedHelpers.findAndHookConstructor(path4contact, baseLoader, baseLoader.loadClass("com.tencent.mm.plugin.sns.ui.SnsUploadUI$5"), new XC_MethodHook() {
                    @Override
                    protected void beforeHookedMethod(MethodHookParam param) throws Throwable {
                        super.beforeHookedMethod(param);

                        LongLogUtils.e("wxPostFrients-99-1-","======"+ JSON.toJSONString(param.args));
                        LongLogUtils.e("wxPostFrients-99-2-","======"+JSON.toJSONString(param.thisObject));
                        LongLogUtils.e("wxPostFrients-99-3-","======"+param.getResult());
                    }

                    @Override
                    protected void afterHookedMethod(MethodHookParam param) throws Throwable {
                        super.afterHookedMethod(param);
                    }
                });
                XposedHelpers.findAndHookMethod(path4contact, baseLoader, "pO", String.class,   new XC_MethodHook() {
                    @Override
                    protected void afterHookedMethod(MethodHookParam param) throws Throwable {
                        super.afterHookedMethod(param);

                        LongLogUtils.e("wxPostFrients---","======"+JSON.toJSONString(param.args));
                    }
                });
            }


            final String path4contact1 ="com.tencent.mm.plugin.sns.storage.n";
            if(loadClassName.startsWith(path4contact1)) {

                XposedHelpers.findAndHookMethod(path4contact1, baseLoader, "Nj",String.class, new XC_MethodHook() {
                    @Override
                    protected void afterHookedMethod(MethodHookParam param) throws Throwable {
                        super.afterHookedMethod(param);
                        LongLogUtils.e("wxPostFrients-11--","======"+JSON.toJSONString(param.args));
                        LongLogUtils.e("wxPostFrients-21--","======"+param.thisObject);
                        LongLogUtils.e("wxPostFrients-31--","======"+param.getResult());
                    }
                });
            }

            final String path4contact4 ="com.tencent.mm.plugin.sns.model.s";
            if(loadClassName.startsWith(path4contact4)) {

                XposedHelpers.findAndHookMethod(path4contact4, baseLoader, "a",

                        int.class,int.class,int.class, String.class,
                        baseLoader.loadClass("com.tencent.mm.network.q"),
                        byte[].class
                        ,new XC_MethodHook() {
                            @Override
                            protected void afterHookedMethod(MethodHookParam param) throws Throwable {
                                super.afterHookedMethod(param);
                                LongLogUtils.e("path4contact4-11--","======"+JSON.toJSONString(param.args));
                                LongLogUtils.e("path4contact4-21--","======"+param.thisObject);
                                LongLogUtils.e("path4contact4-31--","======"+param.getResult());
                            }
                        });
            }



            final String path4contact5 ="com.tencent.mm.plugin.sns.model.aw$4";
            if(loadClassName.startsWith(path4contact5)) {

                XposedHelpers.findAndHookConstructor(path4contact5, baseLoader,

                        baseLoader.loadClass("com.tencent.mm.plugin.sns.ui.aw"), String.class, baseLoader.loadClass("com.tencent.mm.protocal.c.atf"), List.class,
                        baseLoader.loadClass("com.tencent.mm.protocal.c.bsu"), int.class, boolean.class, LinkedList.class, baseLoader.loadClass("com.tencent.mm.bk.b"),
                        String.class

                        // baseLoader.loadClass("com.tencent.mm.plugin.sns.ui.aw")
                        , new XC_MethodHook() {
                            @Override
                            protected void afterHookedMethod(MethodHookParam param) throws Throwable {
                                super.afterHookedMethod(param);
                                LongLogUtils.e("platformtools==-11--", "======" + JSON.toJSONString(param.args));
                                LongLogUtils.e("platformtools-21--", "======" + param.thisObject);
                                LongLogUtils.e("platformtools-31--", "======" + param.getResult());
                            }
                        });
            };





        final String path4contact12 ="com.tencent.mm.plugin.sns.storage.o";
        if(loadClassName.startsWith(path4contact12)) {
            XposedHelpers.findAndHookMethod(path4contact12, baseLoader, "b", int.class,baseLoader.loadClass("com.tencent.mm.plugin.sns.storage.n"),new XC_MethodHook() {
                @Override
                protected void afterHookedMethod(MethodHookParam param) throws Throwable {

                    super.afterHookedMethod(param);
                    try{
                        LongLogUtils.e("o-b-1--","======"+JSON.toJSONString(param.args));
                        LongLogUtils.e("o-b-2--","======"+JSON.toJSONString(param.thisObject));
                        LongLogUtils.e("o-b-3--","======"+JSON.toJSONString(param.getResult()));
                    }catch(Exception e){}
                }
            });

            XposedHelpers.findAndHookMethod(path4contact12, baseLoader, "y", baseLoader.loadClass("com.tencent.mm.plugin.sns.storage.n"),new XC_MethodHook() {
                @Override
                protected void afterHookedMethod(MethodHookParam param) throws Throwable {

                    super.afterHookedMethod(param);
                    LongLogUtils.e("o-y-1--","======"+JSON.toJSONString(param.args));
                    //  LongLogUtils.e("o-y-2--","======"+JSON.toJSONString(param.thisObject));
                    LongLogUtils.e("o-y-3--","======"+JSON.toJSONString(param.getResult()));
                }
            });

            XposedHelpers.findAndHookMethod(path4contact12, baseLoader, "xd", int.class,new XC_MethodHook() {
                @Override
                protected void afterHookedMethod(MethodHookParam param) throws Throwable {

                    super.afterHookedMethod(param);
                    LongLogUtils.e("readString-21--","======"+JSON.toJSONString(param.args));
                    //       LongLogUtils.e("readString-21--","======"+JSON.toJSONString(param.thisObject));
                    LongLogUtils.e("readString-31--","======"+JSON.toJSONString(param.getResult()));
                }
            });

        }


        final String path4contact10 ="com.tencent.mm.modelsns.e";
        if(loadClassName.startsWith(path4contact10)) {
            XposedHelpers.findAndHookMethod(path4contact10, baseLoader, "ng", String.class,   new XC_MethodHook() {
                @Override
                protected void afterHookedMethod(MethodHookParam param) throws Throwable {

                    super.afterHookedMethod(param);
//                                LongLogUtils.e("modelsns-11--","======"+JSON.toJSONString(param.args));
//                                LongLogUtils.e("modelsns-21--","======"+JSON.toJSONString(param.thisObject));
//                                LongLogUtils.e("modelsns-31--","======"+JSON.toJSONString(param.getResult()));
                }
            });

        }



        final String path4contact74 ="com.tencent.mm.plugin.sns.aw";
        if(loadClassName.startsWith(path4contact74)) {
            XposedHelpers.findAndHookConstructor(path4contact74, baseLoader,

                    String.class, int.class, int.class, List.class, baseLoader.loadClass("com.tencent.mm.protocal.c.bsu"),
                    int.class, String.class, int.class,
                    LinkedList.class,int.class,baseLoader.loadClass("com.tencent.mm.protocal.c.atf") ,
                    boolean.class, LinkedList.class,baseLoader.loadClass("com.tencent.mm.protocal.c.bpi"),
                    baseLoader.loadClass("com.tencent.mm.bk.b") , String.class
                    , new XC_MethodHook() {

                        @Override
                        protected void afterHookedMethod(MethodHookParam param) throws Throwable {
                            super.afterHookedMethod(param);
//                                LongLogUtils.e("b-11--","======"+JSON.toJSONString(param.args));
//                                LongLogUtils.e("b-21--","======"+JSON.toJSONString(param.thisObject));
//                                LongLogUtils.e("b-31--","======"+JSON.toJSONString(param.getResult()));
                        }
                    });
        }

        final String path4contact56 ="com.tencent.mm.plugin.sns.model.s";
        if(loadClassName.startsWith(path4contact56)) {
            XposedHelpers.findAndHookConstructor(path4contact56, baseLoader,

                    String.class, int.class, int.class, List.class, baseLoader.loadClass("com.tencent.mm.protocal.c.bsu"),
                    int.class, String.class, int.class,
                    LinkedList.class,int.class,baseLoader.loadClass("com.tencent.mm.protocal.c.atf") ,
                    boolean.class, LinkedList.class,baseLoader.loadClass("com.tencent.mm.protocal.c.bpi"),
                    baseLoader.loadClass("com.tencent.mm.bk.b") , String.class
                    , new XC_MethodHook() {

                        @Override
                        protected void afterHookedMethod(MethodHookParam param) throws Throwable {
                            super.afterHookedMethod(param);
//                        LongLogUtils.e("b-11--","======"+JSON.toJSONString(param.args));
//                        LongLogUtils.e("b-21--","======"+param.thisObject);
//                        LongLogUtils.e("b-31--","======"+param.getResult());
                        }
                    });



            XposedHelpers.findAndHookMethod(path4contact56, baseLoader, "a", baseLoader.loadClass("com.tencent.mm.protocal.c.bsu"),baseLoader.loadClass("com.tencent.mm.protocal.c.bsu"),   new XC_MethodHook() {
                @Override
                protected void afterHookedMethod(MethodHookParam param) throws Throwable {

                    super.afterHookedMethod(param);
//                            LongLogUtils.e("a-11--","======"+JSON.toJSONString(param.args));
//                            LongLogUtils.e("a-21--","======"+JSON.toJSONString(param.thisObject));
//                            LongLogUtils.e("a-31--","======"+JSON.toJSONString(param.getResult()));
                }
            });


        }




    }



    //监听-主动发送消息 拦截
    private void  getSelfMsg() throws Exception {

        String path4sendMessageAtTime = "com.tencent.mm.modelmulti.i";//发消息 类

        if(loadClassName.startsWith(path4sendMessageAtTime)){

            XposedHelpers.findAndHookConstructor(path4sendMessageAtTime, baseLoader, String.class, String.class, int.class, int.class, Object.class, new XC_MethodHook() {
                @Override
                protected void beforeHookedMethod(MethodHookParam param) throws Throwable {
                    //  param.args[1] = "nihaoha";
                    super.beforeHookedMethod(param);
                    Log.e("sendMessageAtTime---","======"+JSON.toJSONString(param.args));
                    Log.e("sendMessageAtTime-2--","======"+JSON.toJSONString(param.thisObject));
                }
                @Override
                protected void afterHookedMethod(MethodHookParam param) throws Throwable {
                    super.afterHookedMethod(param);
                }
            });


        }

    }

    //监听-全局日志拦截
    public void wxGetLogs() throws Exception {



        final String path4contact ="com.tencent.mm.sdk.platformtools.x";//全局系统日志  方法  很有用
        if(loadClassName.startsWith(path4contact)) {
            XposedHelpers.findAndHookMethod(path4contact,baseLoader, "i", String.class,String.class,new XC_MethodHook() {
                @Override
                protected void beforeHookedMethod(MethodHookParam param) throws Throwable {
                    super.beforeHookedMethod(param);
                    Log.e(path4contact+"===", "======" + JSON.toJSONString(param.args));
                    Log.e(path4contact+"===", "======" + JSON.toJSONString(param.thisObject));
                    Log.e(path4contact+"===", "======" + JSON.toJSONString(param.getResult()));
                }
                @Override
                protected void afterHookedMethod(MethodHookParam param) throws Throwable {
                    super.afterHookedMethod(param);
                }
            });
        }


        final String path4contact3 ="com.tencent.mm.sdk.platformtools.aa";
        if(loadClassName.startsWith(path4contact3)) {
            XposedHelpers.findAndHookMethod(path4contact3,baseLoader, "get",Object.class, new XC_MethodHook() {
                @Override
                protected void beforeHookedMethod(MethodHookParam param) throws Throwable {
                    super.beforeHookedMethod(param);
                    LongLogUtils.e(path4contact3+"=3=1=", "======" + JSON.toJSONString(param.args));
                    //  LongLogUtils.e(path4contact3+"=3=2=", "======" + JSON.toJSONString(param.thisObject));
                 //   LongLogUtils.e(path4contact3+"=3=3=", "======" + JSON.toJSONString(param.getResult()));
                }
                @Override
                protected void afterHookedMethod(MethodHookParam param) throws Throwable {
                    super.afterHookedMethod(param);

                }
            });


        }
    }
















}
