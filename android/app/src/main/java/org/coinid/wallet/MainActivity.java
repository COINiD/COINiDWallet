package org.coinid.wallet.tbtc;

import com.facebook.react.ReactActivity;
import android.os.Bundle;
import android.view.WindowManager;
import org.devio.rn.splashscreen.SplashScreen; 
import android.view.View;


public class MainActivity extends ReactActivity {

    /**
     * Returns the name of the main component registered from JavaScript.
     * This is used to schedule rendering of the component.
     */
    @Override
    protected String getMainComponentName() {
        return "COINiDWallet";
    }

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        getWindow().setFlags(WindowManager.LayoutParams.FLAG_SECURE, WindowManager.LayoutParams.FLAG_SECURE);
        getWindow().getDecorView().setSystemUiVisibility(View.SYSTEM_UI_FLAG_LAYOUT_STABLE | View.SYSTEM_UI_FLAG_LAYOUT_FULLSCREEN);
        
        SplashScreen.show(this, true);
        
        super.onCreate(savedInstanceState);
    }
}
