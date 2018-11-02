/**
 * Copyright (c) 2015-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

#import "AppDelegate.h"

#import <React/RCTBundleURLProvider.h>
#import <React/RCTRootView.h>
#import <React/RCTLinkingManager.h>

@implementation AppDelegate

- (BOOL)application:(UIApplication *)application didFinishLaunchingWithOptions:(NSDictionary *)launchOptions
{
  // Init window
  self.window = [[UIWindow alloc] initWithFrame:[UIScreen mainScreen].bounds];
  UIViewController *rootViewController = [UIViewController new];

  // Get launch screen view
  UIStoryboard *storyboard = [UIStoryboard storyboardWithName:@"LaunchScreen" bundle:nil];
  UIViewController *vc = [storyboard instantiateViewControllerWithIdentifier:@"LaunchScreenVC"];

  // Init react native
  NSURL *jsCodeLocation;
  jsCodeLocation = [[RCTBundleURLProvider sharedSettings] jsBundleURLForBundleRoot:@"index" fallbackResource:nil];
  
  // Initialize rootView
  RCTRootView *rootView = [[RCTRootView alloc] initWithBundleURL:jsCodeLocation
                                               moduleName:@"COINiDWallet"
                                               initialProperties:nil
                                               launchOptions:launchOptions];
  
  // Clear background
  rootView.backgroundColor = [UIColor clearColor];
  
  // Set launch screen view as loadingView
  rootView.loadingView = vc.view;
  rootView.loadingViewFadeDelay = 0.5;
  rootView.loadingViewFadeDuration = 0.25;
  
  // Set frames to window
  rootView.frame = self.window.bounds;
  rootView.loadingView.frame = self.window.bounds;

  rootViewController.view = rootView;
  
  self.window.rootViewController = rootViewController;
  [self.window makeKeyAndVisible];
  
  return YES;
}

- (BOOL)application:(UIApplication *)application
   openURL:(NSURL *)url
   options:(NSDictionary<UIApplicationOpenURLOptionsKey,id> *)options
{
  return [RCTLinkingManager application:application openURL:url options:options];
}

@end
