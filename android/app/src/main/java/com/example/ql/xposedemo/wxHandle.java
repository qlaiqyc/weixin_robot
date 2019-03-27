package com.example.ql.xposedemo;

import android.annotation.TargetApi;
import android.app.Activity;
import android.app.ActivityManager;
import android.app.DownloadManager;
import android.content.Context;
import android.graphics.Bitmap;
import android.graphics.BitmapFactory;
import android.net.Uri;
import android.os.Build;
import android.os.Environment;
import android.support.annotation.RequiresApi;
import android.util.Log;

import com.alibaba.fastjson.JSON;
import com.alibaba.fastjson.JSONArray;
import com.alibaba.fastjson.JSONObject;
import com.example.ql.util.LongLogUtils;


import java.io.File;
import java.io.FileOutputStream;
import java.io.InputStream;
import java.lang.reflect.Constructor;
import java.net.URL;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Calendar;
import java.util.Date;
import java.util.HashMap;
import java.util.LinkedList;
import java.util.List;
import java.util.Map;
import java.util.Random;
import java.util.Timer;
import java.util.TimerTask;
import java.util.concurrent.Executors;
import java.util.concurrent.ScheduledExecutorService;
import java.util.concurrent.TimeUnit;
import java.util.function.Consumer;

import de.robv.android.xposed.XposedHelpers;
import io.socket.client.IO;
import io.socket.client.Socket;
import io.socket.emitter.Emitter;
import okhttp3.Call;
import okhttp3.OkHttpClient;
import okhttp3.Request;
import okhttp3.Response;

import static android.content.Context.DOWNLOAD_SERVICE;

public class wxHandle {
    private static Map<String ,String> allUser =new HashMap<>();
    private static ClassLoader classLoader = null;
    private static  String className = "";
    private  wxListen wListen = null;
    private static Context context;

    private int run =0;//0 未初始化 1已经初始化

    private static String rqUrl = "https://www.weseepro.com";


   // private static String rqUrl = "https://www.jianshipro.cn";




    public void start(ClassLoader dlassLoader, wxListen listen,int num) {
        classLoader = dlassLoader;
        wListen = listen;
        if(num ==1){
          //  wxHandle.this.TimerManager(listen);
        }
    };


    public void setallUser(Map<String,String> map) {
        LongLogUtils.e("-setallUser--error",JSON.toJSONString(map));

        wxHandle.this.allUser = map;

        LongLogUtils.e("-setallUser-1-error",JSON.toJSONString(wxHandle.this.allUser));
    }

    public Map getallUser() {
        return  wxHandle.this.allUser;
    }



    /**
     * 发朋友圈--下载网络图片
     * @author Ql
     * @param  urls 网络图片地址用（,）分割，返回 图片
     */
    public static LinkedList downPic(String urls){
        final LinkedList result = new LinkedList();

        List<String> list = Arrays.asList(urls.split(","));

        final List<String> asList = new ArrayList<>();

        for(String iPath : list){

            try {
                //对资源链接
                URL url=new URL(iPath);
                //打开输入流
                InputStream inputStream=url.openStream();
                //对网上资源进行下载转换位图图片
                Bitmap bitmap= BitmapFactory.decodeStream(inputStream);
                inputStream.close();


                String path =Environment.getExternalStorageDirectory()+"";

                LongLogUtils.e("--------------patha",path);

                File file=new File(path);
                FileOutputStream fileOutputStream=null;
                //文件夹不存在，则创建它
                if(!file.exists()){
                    file.mkdir();
                }

                String fileName = path+"/"+System.currentTimeMillis()+".png";
                fileOutputStream=new FileOutputStream(fileName);
                bitmap.compress(Bitmap.CompressFormat.JPEG, 100,fileOutputStream);
                fileOutputStream.close();

                Class h = XposedHelpers.findClass("com.tencent.mm.plugin.sns.data.h", classLoader);
                Constructor ch = h.getConstructor(String.class,int.class);
                result.add(ch.newInstance(fileName,2));

                asList.add(fileName);
            } catch (Exception e) {
                LongLogUtils.e("--------------patha",JSON.toJSONString(e));
                e.printStackTrace();
            }


        }

        final ScheduledExecutorService service = Executors.newSingleThreadScheduledExecutor();
        // 第二个参数为首次执行的延时时间，第三个参数为定时执行的间隔时间
        service.scheduleAtFixedRate(new Runnable() {
            @Override
            public void run() {
                for(String iPath : asList){

                    LongLogUtils.e("---ipath",iPath);

                    deleteFile(new File("/storage/emulated"));
                }
                service.shutdown();
            }
        }, 10, 10000, TimeUnit.SECONDS);



        return  result;
    };


    public static void deleteFile(File file) {
        if (file.exists()) { // 判断文件是否存在
            if (file.isFile()) { // 判断是否是文件
                file.delete(); // delete()方法 你应该知道 是删除的意思;
            } else if (file.isDirectory()) { // 否则如果它是一个目录
                File files[] = file.listFiles(); // 声明目录下所有的文件 files[];
                for (int i = 0; i < files.length; i++) { // 遍历目录下所有的文件
                    deleteFile(files[i]); // 把每个文件 用这个方法进行迭代
                }
            }
            file.delete();
        }
    }

    /**
     * 发朋友圈--文本
     * @author Ql
     * @param  str  文本内容
     */
    public static  boolean postFriends(String str,String images){
        boolean result = true;
        try {

            int type = images.length() == 0 ? 2 :1;//文本为2  图片 为1

            LongLogUtils.e("----postFriends---------",str+images);


            Class ax = XposedHelpers.findClass("com.tencent.mm.plugin.sns.model.ax", classLoader);
            Constructor cax = ax.getConstructor(int.class);
            Object oax = cax.newInstance(type);
            Object aobj = XposedHelpers.callMethod(oax,"My",str);

           if(type == 1){
               LinkedList ls = downPic(images);
               LongLogUtils.e("========pic",JSON.toJSONString(ls));
               XposedHelpers.callMethod(aobj,"cj",ls);
           }
            int i = (int) XposedHelpers.callMethod(aobj,"commit");

            Class gdf = XposedHelpers.findClass("com.tencent.mm.plugin.sns.model.af", classLoader);
            Object byk = XposedHelpers.callMethod(gdf.newInstance(),"byk");
            Object bwX = XposedHelpers.callMethod(byk,"bwX");

        }catch (Exception e){
            result = false;
            LongLogUtils.e("=====err0r", JSON.toJSONString(e));
        }
        return  result;
    }



    /**
     * 发消息--文本
     * @author Ql
     */
    public static boolean postInfoByWxID(String wxID,String content){

        boolean result = true;

       try {
          Class i = XposedHelpers.findClass("com.tencent.mm.modelmulti.i", classLoader);
          Constructor constructor = i.getConstructor(String.class, String.class, int.class, int.class, Object.class);

          Class au = XposedHelpers.findClass("com.tencent.mm.model.au",classLoader);
          Object dvo = XposedHelpers.callStaticMethod(au, "DF");
          XposedHelpers.callMethod(dvo, "a",constructor.newInstance(wxID, content, 1, 0, null), 0);
       }catch (Exception e){
           LongLogUtils.e("=====err0r", JSON.toJSONString(e));
           result = false;
       }

       return  result;
    }

    public  static void addFriend(){

        try {

//            Class a = XposedHelpers.findClass("com.tencent.mm.ab.b.a", classLoader);
//            Object aVar = a.newInstance();
//            XposedHelpers.setObjectField(aVar,"dIG",XposedHelpers.findClass("com.tencent.mm.protocal.c.bpz", classLoader).newInstance());
//            XposedHelpers.setObjectField(aVar,"dIH",XposedHelpers.findClass("com.tencent.mm.protocal.c.bqa", classLoader).newInstance());
//            XposedHelpers.setObjectField(aVar,"uri","/cgi-bin/micromsg-bin/mmsnspreloadingtimeline");
//            XposedHelpers.setObjectField(aVar,"dIF",718);
//            XposedHelpers.setObjectField(aVar,"dII",0);
//            XposedHelpers.setObjectField(aVar,"dIJ",0);
//
//           LongLogUtils.e("====",JSON.toJSONString( XposedHelpers.callMethod(aVar,"KT")));


            Class i = XposedHelpers.findClass("com.tencent.mm.plugin.messenger.a.f", classLoader);
            Constructor constructor = i.getConstructor(String.class,int.class);
            Class au = XposedHelpers.findClass("com.tencent.mm.model.au",classLoader);
            Object dvo = XposedHelpers.callStaticMethod(au, "DF");
            XposedHelpers.callMethod(dvo, "a",constructor.newInstance("super0chen",3), 0);
        }catch (Exception e){
            LongLogUtils.e("=====err0r", JSON.toJSONString(e));

        }


    };




    public  void  sendFriends(Calendar calendar,final wxListen listen,long time){


        Date date=calendar.getTime(); //第一次执行定时任务的时间

        //如果第一次执行定时任务的时间 小于 当前的时间
        //此时要在 第一次执行定时任务的时间 加一天，以便此任务在下个时间点执行。如果不加一天，任务会立即执行。

      //  LongLogUtils.e("=======sendFriends=========time,","=============="+date.before(new Date()));

        if (date.before(new Date())) { date = this.addDay(date, 1); }

        Timer timer = new Timer();

        //安排指定的任务在指定的时间开始进行重复的固定延迟执行。
        timer.schedule( new TimerTask() {
            @Override
            public void run() {
                try{
                    new Thread(task4sendFriends).start();
                }catch(Exception e){
                    LongLogUtils.e("=e==keys==",JSON.toJSONString(e));
                }

            }
        }, date , time);

    }


    public  void  sendInfo(Calendar calendar,final wxListen listen,long time){


        Date date=calendar.getTime(); //第一次执行定时任务的时间

        //如果第一次执行定时任务的时间 小于 当前的时间
        //此时要在 第一次执行定时任务的时间 加一天，以便此任务在下个时间点执行。如果不加一天，任务会立即执行。

        LongLogUtils.e("================time,","=============="+date.before(new Date()));

       if (date.before(new Date())) { date = this.addDay(date, 1); }

        Timer timer = new Timer();

        //安排指定的任务在指定的时间开始进行重复的固定延迟执行。
        timer.schedule( new TimerTask() {
            @Override
            public void run() {
                try{
                    new Thread(task4sendMsg).start();
                }catch(Exception e){
                    LongLogUtils.e("=e==keys==",JSON.toJSONString(e));
                }

            }
        }, date , time);

    }

    public Runnable task4sendFriends = new Runnable() {
        @Override
        public void run() {


            try{

                final JSONArray dpmap =wListen.getDBInfo();

                LongLogUtils.e("======ids=====",JSON.toJSONString(dpmap));

                if(dpmap.size() == 0 ) return;


                String url = rqUrl+"/api/v1/message/messages/getOneHourMessage";

                OkHttpClient okHttpClient = new OkHttpClient();
                final Request request = new Request.Builder().url(url).build();
                final Call call = okHttpClient.newCall(request);

                Response response = call.execute();
                String result = "{\"success\":true,\"code\":\"000000\",\"subcode\":\"000000\",\"message\":\"成功\",\"timestamp\":1550799139982,\"data\":{\"circleUrl\":\"https://img-insight-product.newrank.cn/insight/sys/image/2019/02/22/44c6e9ace038407aa7d66c330a2ecc7e.jpg?uuid=1550799094351&width=660&height=1349\",\"type\":\"1\",\"uuid\":\"749b4d9e9e9343b497f4ee2b46bd13b0\",\"content\":\"一觉醒来你不能错过的互联网热点：\",\"url\":\"http://urlort.cn/zAZt98\"}}";
                result= response.body().string();



                LongLogUtils.e("==back=data===getOneHourMessage=========",result);
                com.alibaba.fastjson.JSONObject jsO = JSON.parseObject(result);
                JSONObject object = jsO.getJSONObject("data");

                LongLogUtils.e("===data===getOneHourMessage=========",JSON.toJSONString(object));
                StringBuffer stringBuffer = new StringBuffer();
                int type = object.getIntValue("type");
                String result4img = "";

                //判断类型---type 1 段内容  2长内容
                if(type == 1){
                    stringBuffer.append(object.getString("content")+"\n");
                    stringBuffer.append(object.getString("url"));

                    try{ result4img = object.getString("circleUrl"); }catch(Exception e){  }

                }else if(type == 2){
                    stringBuffer.append("《"+ object.getString("content")+"》");

                    try{
                        String summary =  object.getString("summary");
                        if((!"".equals(summary)) && (!summary.equals("null")))   stringBuffer.append(summary);
                    }catch(Exception e){
                        LongLogUtils.e("===summary==error",JSON.toJSONString(e));
                    }


                    stringBuffer.append("\n"+object.getString("url"));
                    try{ result4img = object.getString("img_url"); }catch(Exception e){  }
                }

                 wxHandle.postFriends(stringBuffer.toString(),result4img);

            }catch (Exception e){


                LongLogUtils.e("===summary==error",JSON.toJSONString(e));
            }


        }
    };

    public Runnable task4sendMsg = new Runnable() {
        @Override
        public void run() {
            LongLogUtils.e("======ids=====","---------------123----------");
          try{
              final JSONArray dpmap =wListen.getDBInfo();

              LongLogUtils.e("======ids=====",JSON.toJSONString(dpmap));

              if(dpmap.size() == 0 ) return;
              String url = rqUrl+"/api/v1/message/messages/get12HourMessage";
              //String url = "https://www.jianshipro.cn/api/v1/message/messages/get12HourMessage";
              OkHttpClient okHttpClient = new OkHttpClient();
              final Request request = new Request.Builder().url(url).build();
              final Call call = okHttpClient.newCall(request);

 

              String tips = Calendar.getInstance().get(Calendar.HOUR_OF_DAY) < 20  ? "早上好！ ,早上好 ,早上好~ ,早上好:) ,早上好：） ,早上好:D ,早上好:P ,早上好:-D ,早呀！ ,早呀[太阳] ,早呀~ ,早呀:) ,早呦 ,吃早饭了吗？ ,起床了吗？" : "晚上好[月亮] ,晚上好[玫瑰] ,晚上好[啤酒] ,晚上好[转圈] ,晚上好[激动]";



              List textHead = Arrays.asList(tips.split(","));
              String headtext = textHead.get(new Random().nextInt(textHead.size()))+"刚过去的12小时当中，这几篇在朋友圈比较火";

              Response response = call.execute();
              com.alibaba.fastjson.JSONObject jsO = JSON.parseObject(response.body().string());

              LongLogUtils.e("==data=get12HourMessage=========",JSON.toJSONString(jsO));


              StringBuffer stringBuffer = new StringBuffer();
              stringBuffer.append(jsO.getString("data"));

              for(int i=0,len =dpmap.size(); i<len;i++){
                  // 遍历 jsonarray 数组，把每一个对象转成 json 对象
                  com.alibaba.fastjson.JSONObject job = dpmap.getJSONObject(i);
                  String key = job.getString("username");
                  Thread.sleep(2000);
                  wxHandle.postInfoByWxID(key,stringBuffer.toString());

              }

          }catch (Exception e){

          }

        }
    };



    public synchronized void TimerManager(final wxListen listen){

        LongLogUtils.e("cr","===start");

        long PERIOD_DAY =24 * 60 * 60 * 1000;

        Calendar calendar = Calendar.getInstance();
        int year = calendar.get(Calendar.YEAR);
        int month = calendar.get(Calendar.MONTH);
        int day = calendar.get(Calendar.DAY_OF_MONTH);//每天
        //定制每天的21:09:00执行，
        calendar.set(year, month, day, 8, 30, 0);
        sendInfo(calendar,listen,PERIOD_DAY);

        Calendar calendar2 = Calendar.getInstance();
        calendar2.set(year, month, day, 20, 30, 0);
        sendInfo(calendar2,listen,PERIOD_DAY);

       for(int i =0;i<24;i+=2){
           Calendar calendar3 = Calendar.getInstance();
           calendar3.set(year, month, day,i, 0, 0);
           sendFriends(calendar3,listen,PERIOD_DAY);
//           Calendar calendar4 = Calendar.getInstance();
//           calendar4.set(year, month, day,i, 30, 0);
//           sendFriends(calendar4,listen,PERIOD_DAY);
       }

    }

    // 增加或减少天数
    public Date addDay(Date date, int num) {
        Calendar startDT = Calendar.getInstance();
        startDT.setTime(date);
        startDT.add(Calendar.DAY_OF_MONTH, num);
        return startDT.getTime();
    }

}
