package com.example.ql.xposedemo;

import android.app.Application;
import android.arch.core.util.Function;
import android.content.ContentValues;
import android.content.Context;
import android.database.Cursor;
import android.os.Bundle;
import android.os.Handler;
import android.os.Message;
import android.util.JsonReader;
import android.util.Log;
import android.view.View;
import android.view.ViewGroup;
import android.widget.ListAdapter;

import com.alibaba.fastjson.JSON;
import com.alibaba.fastjson.JSONObject;
import com.example.ql.util.ClassDetail;
import com.example.ql.util.LongLogUtils;


import java.lang.reflect.Constructor;
import java.lang.reflect.Field;
import java.lang.reflect.Method;
import java.net.URISyntaxException;
import java.util.ArrayList;
import java.util.LinkedList;
import java.util.List;
import java.util.WeakHashMap;
import java.util.logging.SocketHandler;

import de.robv.android.xposed.IXposedHookLoadPackage;
import de.robv.android.xposed.XC_MethodHook;
import de.robv.android.xposed.XC_MethodReplacement;
import de.robv.android.xposed.XposedBridge;
import de.robv.android.xposed.XposedHelpers;
import de.robv.android.xposed.callbacks.XC_LoadPackage;
import io.socket.client.IO;
import io.socket.client.Socket;
import io.socket.emitter.Emitter;


public class XposedHookUtil implements IXposedHookLoadPackage {

    private wxListen wlisten = new wxListen();




    private  XC_LoadPackage.LoadPackageParam s2lpparam = null;
    private  int num = 0;


    @Override
    public void handleLoadPackage(XC_LoadPackage.LoadPackageParam lpparam) throws Throwable {
        s2lpparam = lpparam;


        final String packageName = lpparam.packageName;


        if (packageName.equals("com.example.ql.dd")) {

            Class clazz = lpparam.classLoader.loadClass("com.example.ql.dd.MainActivity");
            XposedHelpers.findAndHookMethod(clazz, "getTTAd", new XC_MethodReplacement() {
                @Override
                protected Object replaceHookedMethod(MethodHookParam param) throws Throwable {
                    return "99999999";
                }
            });
        }

//        XposedHelpers.findAndHookMethod(Application.class, "attach", Context.class, new XC_MethodHook() {
//            @Override
//            protected void afterHookedMethod(MethodHookParam param) throws Throwable {
//                super.afterHookedMethod(param);
//                num = (s2lpparam.processName.endsWith("com.tencent.mm")) ? 1 : 0;//保证定时器只执行一次
//                wlisten.start(((Context) param.args[0]).getClassLoader(), num);
//            }
//
//        });


        XposedHelpers.findAndHookMethod(ClassLoader.class, "loadClass", String.class, new XC_MethodHook() {
            @Override
            protected void afterHookedMethod(MethodHookParam param) throws Throwable {
                if (param.hasThrowable()) return;


                try{
                    Class<?> cls = (Class<?>) param.getResult();
                    String name = cls.getName();

                    if(!name.startsWith("com.tencent")) return;

                    String oneKey = "com.tencent.mm.app.Application";
                    num = 99;

                    if(name.startsWith("com.tencent.mm.app.Application")){
                        if(s2lpparam.processName.endsWith("com.tencent.mm")){
                            LongLogUtils.e("--gg---",s2lpparam.processName+""+name);
                            num = 1;
                        }else{
                            num = 99;
                        }
                    }else {
                        num=99;
                    }
                    wlisten.start(s2lpparam.classLoader,num,name);

                }catch(Exception e){}
            }
        });



    }





}

