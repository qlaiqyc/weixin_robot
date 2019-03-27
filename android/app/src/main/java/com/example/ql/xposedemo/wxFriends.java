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
import java.util.function.Consumer;

import de.robv.android.xposed.XposedHelpers;
import okhttp3.Call;
import okhttp3.OkHttpClient;
import okhttp3.Request;
import okhttp3.Response;

import static android.content.Context.DOWNLOAD_SERVICE;

public class wxFriends {

    private static ClassLoader classLoader = null;

    wxFriends(ClassLoader dclassLoader){
        classLoader = dclassLoader;
    };



    /**
     * 发朋友圈--下载网络图片
     * @author Ql
     * @param  urls 网络图片地址用（,）分割，返回 图片
     */
    public static LinkedList downPic(String urls){
        LinkedList result = new LinkedList();

        List<String> list = Arrays.asList(urls.split(","));

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
            } catch (Exception e) {
                LongLogUtils.e("--------------patha",JSON.toJSONString(e));
                e.printStackTrace();
            }


        }



        return  result;
    };

    /**
     * 发朋友圈--文本
     * @author Ql
     * @param  str  文本内容
     */
    public static  void postFriends(String str,String images){
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
            LongLogUtils.e("=====err0r", JSON.toJSONString(e));
        }
    }



    public  synchronized void  sendFriends(Calendar calendar,long time){


        Date date=calendar.getTime(); //第一次执行定时任务的时间

        //如果第一次执行定时任务的时间 小于 当前的时间
        //此时要在 第一次执行定时任务的时间 加一天，以便此任务在下个时间点执行。如果不加一天，任务会立即执行。

        LongLogUtils.e("=======sendFriends=========time,","=============="+date.before(new Date()));

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



    public Runnable task4sendFriends = new Runnable() {
        @Override
        public void run() {


            try{
                String url = "https://www.weseepro.com/api/v1/message/messages/getOneHourMessage";
                //String url = "https://www.jianshipro.cn/api/v1/message/messages/getOneHourMessage";

                OkHttpClient okHttpClient = new OkHttpClient();
                final Request request = new Request.Builder().url(url).build();
                final Call call = okHttpClient.newCall(request);

                Response response = call.execute();
                com.alibaba.fastjson.JSONObject jsO = JSON.parseObject(response.body().string());
                JSONObject object = jsO.getJSONObject("data");
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



    public synchronized void TimerManager(){

        LongLogUtils.e("cr","===start");

        long PERIOD_DAY =24 * 60 * 60 * 1000;

        Calendar calendar = Calendar.getInstance();
        int year = calendar.get(Calendar.YEAR);
        int month = calendar.get(Calendar.MONTH);
        int day = calendar.get(Calendar.DAY_OF_MONTH);//每天


        Calendar calendar3 = Calendar.getInstance();
        calendar3.set(year, month, day,16, 56, 30);
        sendFriends(calendar3,PERIOD_DAY);

    }

    // 增加或减少天数
    public Date addDay(Date date, int num) {
        Calendar startDT = Calendar.getInstance();
        startDT.setTime(date);
        startDT.add(Calendar.DAY_OF_MONTH, num);
        return startDT.getTime();
    }






}
