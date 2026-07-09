import Flutter
import UIKit
import GoogleMaps

@main
@MainActor
@objc class AppDelegate: FlutterAppDelegate {
  override func application(
      _ application: UIApplication,
      didFinishLaunchingWithOptions launchOptions: [UIApplication.LaunchOptionsKey: Any]?
  ) -> Bool {
    GMSServices.provideAPIKey("AIzaSyAhZ02B1nilwdU7g4BCZRPrMITpTEhk4_c")
    GeneratedPluginRegistrant.register(with: self)  // ← back here, with self

    if let mapRegistrar = self.registrar(forPlugin: "SwiftUIMap") {
        let factory = SwiftUIMapViewFactory(messenger: mapRegistrar.messenger())
        mapRegistrar.register(factory, withId: "SwiftUIMap")
    }

    return super.application(application, didFinishLaunchingWithOptions: launchOptions)
  }
}
