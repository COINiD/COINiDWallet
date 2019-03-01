package org.coinid.wallet.tbtc;

import android.app.Application;

import com.facebook.react.ReactApplication;
import com.corbt.keepawake.KCKeepAwakePackage;
import io.github.airamrguez.RNMeasureTextPackage;
import com.oblador.vectoricons.VectorIconsPackage;
import org.devio.rn.splashscreen.SplashScreenReactPackage;
import org.reactnative.camera.RNCameraPackage;
import org.coinid.rctp2ptransfercentral.RCTP2PTransferBLECentralPackage;
import com.horcrux.svg.SvgPackage;
import com.bitgo.randombytes.RandomBytesPackage;
import com.github.wumke.RNExitApp.RNExitAppPackage;
import com.cmcewen.blurview.BlurViewPackage;
import com.airbnb.android.react.lottie.LottiePackage;
import com.facebook.react.ReactNativeHost;
import com.facebook.react.ReactPackage;
import com.facebook.react.shell.MainReactPackage;
import com.facebook.soloader.SoLoader;

import java.util.Arrays;
import java.util.List;

public class MainApplication extends Application implements ReactApplication {

  private final ReactNativeHost mReactNativeHost = new ReactNativeHost(this) {
    @Override
    public boolean getUseDeveloperSupport() {
      return BuildConfig.DEBUG;
    }

    @Override
    protected List<ReactPackage> getPackages() {
      return Arrays.<ReactPackage>asList(
          new MainReactPackage(),
            new KCKeepAwakePackage(),
            new RNMeasureTextPackage(),
            new VectorIconsPackage(),
            new SplashScreenReactPackage(),
            new RNCameraPackage(),
            new RCTP2PTransferBLECentralPackage(),
            new SvgPackage(),
            new RandomBytesPackage(),
            new RNExitAppPackage(),
            new BlurViewPackage(),
            new LottiePackage()
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
}
