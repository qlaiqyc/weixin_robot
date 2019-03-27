package com.example.ql.xposedemo;

import android.database.Cursor;

import com.alibaba.fastjson.JSON;
import com.alibaba.fastjson.JSONArray;
import com.alibaba.fastjson.JSONObject;
import com.example.ql.util.LongLogUtils;

import java.lang.reflect.Method;
import java.util.Arrays;
import java.util.HashMap;
import java.util.Iterator;
import java.util.List;
import java.util.Map;

import de.robv.android.xposed.XC_MethodHook;
import de.robv.android.xposed.XposedHelpers;

public class wxSql {

    private Object sqlObj = null;
    private static ClassLoader baseLoader = null;
    private  Map<String,Object[]> DBInfo = new HashMap<>();//保存加载的DB 信息

    public void start(ClassLoader sclassLoader,Map<String,Object[]> sDBInfo){
        baseLoader = sclassLoader;
        DBInfo = sDBInfo;
    }



    public JSONArray getAllUser() throws Exception {
        JSONArray list =  execSQL("EnMicroMsg.db","select * from rcontact where verifyFlag=0");
        List filter =  Arrays.asList("weixin,appbrandcustomerservicemsg,medianote,helper_entry,notifymessage,pc_share,shakeapp,voipapp,tmessage,linkedinplugin,blogapp,filehelper,qqsync,voicevoipapp,feedsapp,qqfriend,cardpackage,masssendapp,floatbottle,qqmail,facebookapp,newsapp,officialaccounts,topstoryapp,voiceinputapp,qmessage,fmessage,readerapp,lbsapp,meishiapp,weibo,wxid_dqd4ciogolwv22".split(","));

        JSONArray newList = new JSONArray();
        Iterator iterator = list.iterator();
        while ( iterator.hasNext()){
            JSONObject obj = (JSONObject) iterator.next();
            String username = obj.getString("username");

            if(!(filter.contains(username) || username.endsWith("@app") ||username.endsWith("@chatroom"))) newList.add(obj);
        }

        return  newList;
    };

    public String  getMineWxID() throws Exception {

        JSONArray list =  execSQL("EnMicroMsg.db","select id,value from userinfo order by id");
        JSONArray newList = new JSONArray();
        Iterator iterator = list.iterator();
        while ( iterator.hasNext()){
            JSONObject obj = (JSONObject) iterator.next();
            if(Float.parseFloat(obj.getString("id"))>0) newList.add(obj);

        }

        JSONObject obj = newList.getJSONObject(0);
        return  obj.getString("value");
    }



    public  JSONArray execSQL(String db, String sql)throws Exception{

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

        if (c.moveToFirst()) {
            do {
                JSONObject jo2 = new JSONObject();
                for (int i = 0; i < c.getColumnCount(); i++) {
                    try {
                        jo2.put(c.getColumnName(i),c.getString(i));
                    } catch (Exception e) {
                        jo2.put(c.getColumnName(i),c.getBlob(i));
                    }
                }
                js.add(jo2);
            } while (c.moveToNext());
        }

        return js;
    };

}
