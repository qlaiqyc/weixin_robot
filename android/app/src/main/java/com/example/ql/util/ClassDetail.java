package com.example.ql.util;

import android.content.ContentValues;
import android.os.Build;


import java.lang.reflect.Field;
import java.lang.reflect.Method;
import java.util.Set;

public class ClassDetail {

    // 获取指定名称的类声明的类成员变量、类方法、内部类的信息
    public static void dumpClass(Class<?> actions) {

       LongLogUtils.e("detail---","Dump class " + actions.getName());
       LongLogUtils.e("detail---","Methods");

        // 获取到指定名称类声明的所有方法的信息
        Method[] m = actions.getDeclaredMethods();
        // 打印获取到的所有的类方法的信息
        for (int i = 0; i < m.length; i++) {

           LongLogUtils.e("detail---",m[i].toString());
        }
       LongLogUtils.e("detail---","Fields");
        // 获取到指定名称类声明的所有变量的信息
        Field[] f = actions.getDeclaredFields();
        // 打印获取到的所有变量的信息
        for (int j = 0; j < f.length; j++) {

           LongLogUtils.e("detail---",f[j].toString());
        }

       LongLogUtils.e("detail---","Classes");
        // 获取到指定名称类中声明的所有内部类的信息
        Class<?>[] c = actions.getDeclaredClasses();
        // 打印获取到的所有内部类的信息
        for (int k = 0; k < c.length; k++) {

           LongLogUtils.e("detail---",c[k].toString());
        }
    }


}
