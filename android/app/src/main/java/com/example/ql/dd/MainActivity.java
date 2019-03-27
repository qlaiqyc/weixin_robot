package com.example.ql.dd;

import android.os.Bundle;
import android.support.v7.app.AppCompatActivity;
import android.view.View;
import android.widget.Button;
import android.widget.TextView;
import android.widget.Toast;

import java.io.DataOutputStream;

public class MainActivity extends AppCompatActivity {
    private TextView tv_ad;
    private Button btn_load_ad;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_main);

        //当前应用的代码执行目录
        upgradeRootPermission(getPackageCodePath());

        btn_load_ad = findViewById(R.id.btn_load_ad);
//
//        btn_load_ad.setOnClickListener(new View.OnClickListener() {
//            @Override
//            public void onClick(View v) {
//
//                Toast.makeText(MainActivity.this, getTTAd(), Toast.LENGTH_SHORT).show();
//
//            }
//        });


    }
    public void onClickBtn(View view){
        Toast.makeText(MainActivity.this, getTTAd(),Toast.LENGTH_SHORT).show();
    }

    public String getTTAd() {


        return "abaa";
    }


    public static boolean upgradeRootPermission(String pkgCodePath) {
        Process process = null;
        DataOutputStream os = null;
        try {
            String cmd="chmod 777 " + pkgCodePath;
            process = Runtime.getRuntime().exec("su"); //切换到root帐号
            os = new DataOutputStream(process.getOutputStream());
            os.writeBytes(cmd + "\n");
            os.writeBytes("exit\n");
            os.flush();
            process.waitFor();
        } catch (Exception e) {
            return false;
        } finally {
            try {
                if (os != null) {
                    os.close();
                }
                process.destroy();
            } catch (Exception e) {
            }
        }
        return true;
    }
}
