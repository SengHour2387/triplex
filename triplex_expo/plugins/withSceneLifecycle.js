// iOS 27 aborts at launch unless the app adopts the UIScene lifecycle. Expo ships the base class
// (ExpoAppSceneDelegate) but the prebuild template doesn't wire it up yet, so we do it here.
// Idempotent. Remove once the Expo template does this itself.
const { withAppDelegate, withInfoPlist } = require('expo/config-plugins');

const SCENE_DELEGATE = `
class SceneDelegate: ExpoAppSceneDelegate {}
`;

function patchAppDelegate(src) {
  let out = src;
  if (!out.includes('ExpoReactNativeFactoryProvider')) {
    out = out.replace(
      /class AppDelegate: ExpoAppDelegate \{/,
      'class AppDelegate: ExpoAppDelegate, ExpoReactNativeFactoryProvider {'
    );
  }
  // The scene delegate creates the window and starts React Native; drop the app-delegate version.
  out = out.replace(
    /\n#if os\(iOS\) \|\| os\(tvOS\)\n\s*window = UIWindow\(frame: UIScreen\.main\.bounds\)\n\s*factory\.startReactNative\(\n[\s\S]*?launchOptions: launchOptions\)\n#endif\n/,
    '\n'
  );
  if (!out.includes('class SceneDelegate')) {
    out = out.trimEnd() + '\n' + SCENE_DELEGATE;
  }
  return out;
}

module.exports = function withSceneLifecycle(config) {
  config = withAppDelegate(config, (c) => {
    if (c.modResults.language !== 'swift') {
      throw new Error('withSceneLifecycle requires a Swift AppDelegate');
    }
    c.modResults.contents = patchAppDelegate(c.modResults.contents);
    return c;
  });
  return withInfoPlist(config, (c) => {
    c.modResults.UIApplicationSceneManifest = {
      UIApplicationSupportsMultipleScenes: false,
      UISceneConfigurations: {
        UIWindowSceneSessionRoleApplication: [
          {
            UISceneConfigurationName: 'Default Configuration',
            UISceneDelegateClassName: '$(PRODUCT_MODULE_NAME).SceneDelegate',
          },
        ],
      },
    };
    return c;
  });
};
