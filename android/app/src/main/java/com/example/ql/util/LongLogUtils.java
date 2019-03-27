package com.example.ql.util;

import android.util.Log;

import de.robv.android.xposed.XposedBridge;

public class LongLogUtils {

    /**
     * 截断输出日志
     * @param msg
     */
    public static void e(String tag, String msg) {
        tag="====000==="+tag;
        XposedBridge.log("tag===="+tag+"====="+msg);

        if (tag == null || tag.length() == 0
                || msg == null || msg.length() == 0)
            return;

        int segmentSize = 3 * 1024;
        long length = msg.length();
        if (length <= segmentSize ) {// 长度小于等于限制直接打印
           Log.e(tag, msg);
            XposedBridge.log(msg);
        }else {
            while (msg.length() > segmentSize ) {// 循环分段打印日志
                String logContent = msg.substring(0, segmentSize );
                msg = msg.replace(logContent, "");
               Log.e(tag, logContent);
                XposedBridge.log(logContent);
            }
            Log.e(tag, msg);// 打印剩余日志
            XposedBridge.log(msg);
        }
    }
}
