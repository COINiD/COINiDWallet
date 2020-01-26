package org.coinid.wallet.tbtc;

import android.app.Application;

import com.facebook.react.ReactApplication;
import com.reactcommunity.rnlocalize.RNLocalizePackage;
import com.cmcewen.blurview.BlurViewPackage;
import com.reactnativecommunity.webview.RNCWebViewPackage;
import com.airbnb.android.react.lottie.LottiePackage;
import com.reactnativecommunity.asyncstorage.AsyncStoragePackage;
import org.reactnative.camera.RNCameraPackage;
import com.horcrux.svg.SvgPackage;
import com.oblador.vectoricons.VectorIconsPackage;
import fr.greweb.reactnativeviewshot.RNViewShotPackage;
import org.devio.rn.splashscreen.SplashScreenReactPackage;
import cl.json.RNSharePackage;
import com.bitgo.randombytes.RandomBytesPackage;
import org.coinid.rctp2ptransfercentral.RCTP2PTransferBLECentralPackage;
import io.github.airamrguez.RNMeasureTextPackage;
import com.corbt.keepawake.KCKeepAwakePackage;
import com.github.wumke.RNExitApp.RNExitAppPackage;
import com.facebook.react.ReactNativeHost;
import com.facebook.react.ReactPackage;
import com.facebook.react.shell.MainReactPackage;
import com.facebook.soloader.SoLoader;

import cl.json.ShareApplication;
import java.util.Arrays;
import java.util.List;

public class MainApplication extends Application implements ReactApplication, ShareApplication {

  private final ReactNativeHost mReactNativeHost = new ReactNativeHost(this) {
    @Override
    public boolean getUseDeveloperSupport() {
      return BuildConfig.DEBUG;
    }

    @Override
    protected List<ReactPackage> getPackages() {
      return Arrays.<ReactPackage>asList(
          new MainReactPackage(),
            new RNLocalizePackage(),
            new BlurViewPackage(),
            new RNCWebViewPackage(),
            new LottiePackage(),
            new AsyncStoragePackage(),
            new RNCameraPackage(),
            new SvgPackage(),
            new VectorIconsPackage(),
            new RNViewShotPackage(),
            new SplashScreenReactPackage(),
            new RNSharePackage(),
            new RandomBytesPackage(),
            new RCTP2PTransferBLECentralPackage(),
            new RNMeasureTextPackage(),
            new KCKeepAwakePackage(),
            new RNExitAppPackage()
      );
    }

    @Override
    protected String getJSMainModuleName() {
      return "index";
    }
  };

  @Override
  public ReactNativeHost getReactNativeHost() {
    return mReactNativeHost;
  }

  @Override
  public void onCreate() {
    super.onCreate();
    SoLoader.init(this, false);
  }

  @Override
  public String getFileProviderAuthority() {
    return BuildConfig.APPLICATION_ID + ".provider";
  }
}
