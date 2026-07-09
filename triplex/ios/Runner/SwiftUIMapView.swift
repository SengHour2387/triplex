@preconcurrency import Flutter
import UIKit
import GoogleMaps
import CoreLocation

@MainActor
class SwiftUIMapViewFactory: NSObject, @preconcurrency FlutterPlatformViewFactory {
    private let messenger: FlutterBinaryMessenger

    init(messenger: FlutterBinaryMessenger) {
        self.messenger = messenger
        super.init()
    }

    func create(
        withFrame frame: CGRect,
        viewIdentifier viewId: Int64,
        arguments args: Any?
    ) -> FlutterPlatformView {
        SwiftUIMapView(
            frame: frame,
            viewId: viewId,
            args: args as? [String: Any],
            messenger: messenger
        )
    }

    func createArgsCodec() -> FlutterMessageCodec & NSObjectProtocol {
        FlutterStandardMessageCodec.sharedInstance()
    }
}

private let darkMapStyle = """
[
  {
    "elementType": "geometry",
    "stylers": [{ "color": "#242f3e" }]
  },
  {
    "elementType": "labels.text.fill",
    "stylers": [{ "color": "#746855" }]
  },
  {
    "elementType": "labels.text.stroke",
    "stylers": [{ "color": "#242f3e" }]
  },
  {
    "featureType": "administrative.locality",
    "elementType": "labels.text.fill",
    "stylers": [{ "color": "#d59563" }]
  },
  {
    "featureType": "poi",
    "elementType": "labels.text.fill",
    "stylers": [{ "color": "#d59563" }]
  },
  {
    "featureType": "poi.park",
    "elementType": "geometry",
    "stylers": [{ "color": "#263c3f" }]
  },
  {
    "featureType": "poi.park",
    "elementType": "labels.text.fill",
    "stylers": [{ "color": "#6b9a76" }]
  },
  {
    "featureType": "road",
    "elementType": "geometry",
    "stylers": [{ "color": "#38414e" }]
  },
  {
    "featureType": "road",
    "elementType": "geometry.stroke",
    "stylers": [{ "color": "#212a37" }]
  },
  {
    "featureType": "road",
    "elementType": "labels.text.fill",
    "stylers": [{ "color": "#9ca5b3" }]
  },
  {
    "featureType": "road.highway",
    "elementType": "geometry",
    "stylers": [{ "color": "#746855" }]
  },
  {
    "featureType": "road.highway",
    "elementType": "geometry.stroke",
    "stylers": [{ "color": "#1f2835" }]
  },
  {
    "featureType": "road.highway",
    "elementType": "labels.text.fill",
    "stylers": [{ "color": "#f3d19c" }]
  },
  {
    "featureType": "transit",
    "elementType": "geometry",
    "stylers": [{ "color": "#2f3948" }]
  },
  {
    "featureType": "transit.station",
    "elementType": "labels.text.fill",
    "stylers": [{ "color": "#d59563" }]
  },
  {
    "featureType": "water",
    "elementType": "geometry",
    "stylers": [{ "color": "#17263c" }]
  },
  {
    "featureType": "water",
    "elementType": "labels.text.fill",
    "stylers": [{ "color": "#515c6d" }]
  },
  {
    "featureType": "water",
    "elementType": "labels.text.stroke",
    "stylers": [{ "color": "#17263c" }]
  }
]
"""

private let blurGradientHeight: CGFloat = 80

@MainActor
class SwiftUIMapView: UIView, @preconcurrency FlutterPlatformView, @preconcurrency GMSMapViewDelegate {
    private let mapView: GMSMapView
    private let channel: FlutterMethodChannel
    private var marker: GMSMarker?
    private let topBlurView: UIVisualEffectView
    private let bottomBlurView: UIVisualEffectView

    init(
        frame: CGRect,
        viewId: Int64,
        args: [String: Any]?,
        messenger: FlutterBinaryMessenger
    ) {
        var initialLat = 0.0
        var initialLng = 0.0
        if let args = args,
           let lat = args["latitude"] as? Double,
           let lng = args["longitude"] as? Double {
            initialLat = lat
            initialLng = lng
        }

        let camera = GMSCameraPosition.camera(withLatitude: initialLat, longitude: initialLng, zoom: 15.0)
        let mapFrame = frame.isEmpty ? CGRect(x: 0, y: 0, width: 1, height: 1) : frame

        mapView = GMSMapView.map(withFrame: mapFrame, camera: camera)
        mapView.translatesAutoresizingMaskIntoConstraints = false

        let blurEffect = UIBlurEffect(style: .systemUltraThinMaterial)
        topBlurView = UIVisualEffectView(effect: blurEffect)
        topBlurView.translatesAutoresizingMaskIntoConstraints = false
        topBlurView.isUserInteractionEnabled = false

        bottomBlurView = UIVisualEffectView(effect: blurEffect)
        bottomBlurView.translatesAutoresizingMaskIntoConstraints = false
        bottomBlurView.isUserInteractionEnabled = false

        channel = FlutterMethodChannel(
            name: "SwiftUIMap_\(viewId)",
            binaryMessenger: messenger
        )

        super.init(frame: mapFrame)

        addSubview(mapView)
        addSubview(topBlurView)
        addSubview(bottomBlurView)

        NSLayoutConstraint.activate([
            mapView.topAnchor.constraint(equalTo: topAnchor),
            mapView.bottomAnchor.constraint(equalTo: bottomAnchor),
            mapView.leadingAnchor.constraint(equalTo: leadingAnchor),
            mapView.trailingAnchor.constraint(equalTo: trailingAnchor),

            topBlurView.topAnchor.constraint(equalTo: topAnchor),
            topBlurView.leadingAnchor.constraint(equalTo: leadingAnchor),
            topBlurView.trailingAnchor.constraint(equalTo: trailingAnchor),
            topBlurView.heightAnchor.constraint(equalToConstant: blurGradientHeight),

            bottomBlurView.bottomAnchor.constraint(equalTo: bottomAnchor),
            bottomBlurView.leadingAnchor.constraint(equalTo: leadingAnchor),
            bottomBlurView.trailingAnchor.constraint(equalTo: trailingAnchor),
            bottomBlurView.heightAnchor.constraint(equalToConstant: blurGradientHeight),
        ])

        mapView.delegate = self
        mapView.settings.rotateGestures = false
        mapView.isMyLocationEnabled = true
        applyMapStyle()

        channel.setMethodCallHandler { [weak self] call, result in
            switch call.method {
            case "centerOn":
                if let args = call.arguments as? [String: Double],
                   let lat = args["latitude"],
                   let lng = args["longitude"] {
                    self?.centerOn(latitude: lat, longitude: lng)
                    result(nil)
                } else {
                    result(FlutterError(code: "INVALID_ARGS",
                                        message: "Expected {latitude, longitude}",
                                        details: nil))
                }
            case "animateCameraTo":
                if let args = call.arguments as? [String: Double],
                   let lat = args["latitude"],
                   let lng = args["longitude"],
                   let zoom = args["zoom"] {
                    self?.animateCameraTo(latitude: lat, longitude: lng, zoom: zoom)
                    result(nil)
                } else {
                    result(FlutterError(code: "INVALID_ARGS",
                                        message: "Expected {latitude, longitude, zoom}",
                                        details: nil))
                }
            case "setMarker":
                if let args = call.arguments as? [String: Double],
                   let lat = args["latitude"],
                   let lng = args["longitude"] {
                    self?.setMarker(latitude: lat, longitude: lng)
                    result(nil)
                } else {
                    result(FlutterError(code: "INVALID_ARGS",
                                        message: "Expected {latitude, longitude}",
                                        details: nil))
                }
            case "clearMarker":
                self?.clearMarker()
                result(nil)
            default:
                result(FlutterMethodNotImplemented)
            }
        }
    }

    required init?(coder: NSCoder) { nil }

    func view() -> UIView { self }

    override func layoutSubviews() {
        super.layoutSubviews()
        updateBlurGradients()
    }

    override func traitCollectionDidChange(_ previousTraitCollection: UITraitCollection?) {
        super.traitCollectionDidChange(previousTraitCollection)
        if traitCollection.hasDifferentColorAppearance(comparedTo: previousTraitCollection) {
            applyMapStyle()
        }
    }

    private func applyMapStyle() {
        if traitCollection.userInterfaceStyle == .dark {
            mapView.mapStyle = try? GMSMapStyle(jsonString: darkMapStyle)
        } else {
            mapView.mapStyle = nil
        }
    }

    private func updateBlurGradients() {
        let topGradient = CAGradientLayer()
        topGradient.colors = [UIColor.white.cgColor, UIColor.clear.cgColor]
        topGradient.locations = [0.0, 1.0]
        topGradient.frame = topBlurView.bounds
        topBlurView.layer.mask = topGradient

        let bottomGradient = CAGradientLayer()
        bottomGradient.colors = [UIColor.clear.cgColor, UIColor.white.cgColor]
        bottomGradient.locations = [0.0, 1.0]
        bottomGradient.frame = bottomBlurView.bounds
        bottomBlurView.layer.mask = bottomGradient
    }

    func centerOn(latitude: Double, longitude: Double) {
        let update = GMSCameraUpdate.setTarget(CLLocationCoordinate2D(latitude: latitude, longitude: longitude))
        mapView.animate(with: update)
    }

    func animateCameraTo(latitude: Double, longitude: Double, zoom: Double) {
        let camera = GMSCameraPosition.camera(withLatitude: latitude, longitude: longitude, zoom: Float(zoom))
        mapView.animate(to: camera)
    }

    func setMarker(latitude: Double, longitude: Double) {
        if let existingMarker = marker {
            existingMarker.position = CLLocationCoordinate2D(latitude: latitude, longitude: longitude)
        } else {
            marker = GMSMarker(position: CLLocationCoordinate2D(latitude: latitude, longitude: longitude))
            marker?.map = mapView
        }
    }

    func clearMarker() {
        marker?.map = nil
        marker = nil
    }

    func mapView(_ mapView: GMSMapView, didTapAt coordinate: CLLocationCoordinate2D) {
        channel.invokeMethod("onTap", arguments: [
            "latitude": coordinate.latitude,
            "longitude": coordinate.longitude
        ])
    }

    func mapView(_ mapView: GMSMapView, didTapPOIWithPlaceID placeID: String, name: String, location: CLLocationCoordinate2D) {
        channel.invokeMethod("onPoiTap", arguments: [
            "placeId": placeID,
            "name": name,
            "latitude": location.latitude,
            "longitude": location.longitude
        ])
    }
}
