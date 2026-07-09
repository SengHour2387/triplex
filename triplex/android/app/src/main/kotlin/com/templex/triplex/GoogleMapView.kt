package com.templex.triplex

import android.Manifest
import android.content.Context
import android.content.pm.PackageManager
import android.view.View
import androidx.core.app.ActivityCompat
import com.google.android.gms.maps.CameraUpdateFactory
import com.google.android.gms.maps.GoogleMap
import com.google.android.gms.maps.MapView
import com.google.android.gms.maps.MapsInitializer
import com.google.android.gms.maps.model.BitmapDescriptorFactory
import com.google.android.gms.maps.model.CameraPosition
import com.google.android.gms.maps.model.LatLng
import com.google.android.gms.maps.model.MapStyleOptions
import com.google.android.gms.maps.model.Marker
import com.google.android.gms.maps.model.MarkerOptions
import io.flutter.plugin.common.BinaryMessenger
import io.flutter.plugin.common.MethodChannel
import io.flutter.plugin.common.StandardMessageCodec
import io.flutter.plugin.platform.PlatformView
import io.flutter.plugin.platform.PlatformViewFactory

// ─── Factory ────────────────────────────────────────────────────────────────

class GoogleMapViewFactory(private val messenger: BinaryMessenger) :
    PlatformViewFactory(StandardMessageCodec.INSTANCE) {

    override fun create(context: Context, viewId: Int, args: Any?): PlatformView {
        val params = args as? Map<*, *>
        val lat = (params?.get("latitude") as? Double) ?: 0.0
        val lng = (params?.get("longitude") as? Double) ?: 0.0
        return GoogleMapPlatformView(context, viewId, lat, lng, messenger)
    }
}

// ─── Dark map style (same JSON as iOS) ──────────────────────────────────────

private val DARK_MAP_STYLE = """
[
  { "elementType": "geometry",            "stylers": [{ "color": "#242f3e" }] },
  { "elementType": "labels.text.fill",   "stylers": [{ "color": "#746855" }] },
  { "elementType": "labels.text.stroke", "stylers": [{ "color": "#242f3e" }] },
  { "featureType": "administrative.locality", "elementType": "labels.text.fill", "stylers": [{ "color": "#d59563" }] },
  { "featureType": "poi",                "elementType": "labels.text.fill",   "stylers": [{ "color": "#d59563" }] },
  { "featureType": "poi.park",           "elementType": "geometry",           "stylers": [{ "color": "#263c3f" }] },
  { "featureType": "poi.park",           "elementType": "labels.text.fill",   "stylers": [{ "color": "#6b9a76" }] },
  { "featureType": "road",               "elementType": "geometry",           "stylers": [{ "color": "#38414e" }] },
  { "featureType": "road",               "elementType": "geometry.stroke",    "stylers": [{ "color": "#212a37" }] },
  { "featureType": "road",               "elementType": "labels.text.fill",   "stylers": [{ "color": "#9ca5b3" }] },
  { "featureType": "road.highway",       "elementType": "geometry",           "stylers": [{ "color": "#746855" }] },
  { "featureType": "road.highway",       "elementType": "geometry.stroke",    "stylers": [{ "color": "#1f2835" }] },
  { "featureType": "road.highway",       "elementType": "labels.text.fill",   "stylers": [{ "color": "#f3d19c" }] },
  { "featureType": "transit",            "elementType": "geometry",           "stylers": [{ "color": "#2f3948" }] },
  { "featureType": "transit.station",    "elementType": "labels.text.fill",   "stylers": [{ "color": "#d59563" }] },
  { "featureType": "water",              "elementType": "geometry",           "stylers": [{ "color": "#17263c" }] },
  { "featureType": "water",              "elementType": "labels.text.fill",   "stylers": [{ "color": "#515c6d" }] },
  { "featureType": "water",              "elementType": "labels.text.stroke", "stylers": [{ "color": "#17263c" }] }
]
""".trimIndent()

// ─── Platform View ───────────────────────────────────────────────────────────

class GoogleMapPlatformView(
    private val context: Context,
    viewId: Int,
    private val initialLat: Double,
    private val initialLng: Double,
    messenger: BinaryMessenger,
) : PlatformView, GoogleMap.OnMapClickListener, GoogleMap.OnPoiClickListener {

    private val mapView: MapView = MapView(context)
    private var googleMap: GoogleMap? = null
    private var marker: Marker? = null

    private val channel = MethodChannel(messenger, "AndroidGoogleMap_$viewId")

    init {
        MapsInitializer.initialize(context, MapsInitializer.Renderer.LATEST) {}

        mapView.onCreate(null)
        mapView.onResume()

        mapView.getMapAsync { map ->
            googleMap = map

            // Initial camera position
            val initial = LatLng(initialLat, initialLng)
            map.moveCamera(CameraUpdateFactory.newLatLngZoom(initial, 15f))

            // Disable rotate gestures (mirror iOS setting)
            map.uiSettings.isRotateGesturesEnabled = false
            // Only enable the blue-dot layer if the permission is already granted.
            // If not yet granted, Dart calls "enableMyLocation" after the user approves.
            applyMyLocation(map)

            // Apply dark style if system dark mode
            applyMapStyle(map)

            map.setOnMapClickListener(this)
            map.setOnPoiClickListener(this)
        }

        // ─── Method Channel handler ──────────────────────────────────────
        channel.setMethodCallHandler { call, result ->
            when (call.method) {
                "centerOn" -> {
                    val args = call.arguments as? Map<*, *>
                    val lat = args?.get("latitude") as? Double
                    val lng = args?.get("longitude") as? Double
                    if (lat != null && lng != null) {
                        centerOn(lat, lng)
                        result.success(null)
                    } else {
                        result.error("INVALID_ARGS", "Expected {latitude, longitude}", null)
                    }
                }
                "animateCameraTo" -> {
                    val args = call.arguments as? Map<*, *>
                    val lat  = args?.get("latitude") as? Double
                    val lng  = args?.get("longitude") as? Double
                    val zoom = args?.get("zoom") as? Double
                    if (lat != null && lng != null && zoom != null) {
                        animateCameraTo(lat, lng, zoom)
                        result.success(null)
                    } else {
                        result.error("INVALID_ARGS", "Expected {latitude, longitude, zoom}", null)
                    }
                }
                "setMarker" -> {
                    val args = call.arguments as? Map<*, *>
                    val lat = args?.get("latitude") as? Double
                    val lng = args?.get("longitude") as? Double
                    if (lat != null && lng != null) {
                        setMarker(lat, lng)
                        result.success(null)
                    } else {
                        result.error("INVALID_ARGS", "Expected {latitude, longitude}", null)
                    }
                }
                "clearMarker" -> {
                    clearMarker()
                    result.success(null)
                }
                "enableMyLocation" -> {
                    googleMap?.let { applyMyLocation(it) }
                    result.success(null)
                }
                else -> result.notImplemented()
            }
        }
    }

    // ─── PlatformView ────────────────────────────────────────────────────────

    override fun getView(): View = mapView

    override fun dispose() {
        mapView.onDestroy()
    }

    // ─── Map actions ─────────────────────────────────────────────────────────

    private fun centerOn(lat: Double, lng: Double) {
        googleMap?.animateCamera(CameraUpdateFactory.newLatLng(LatLng(lat, lng)))
    }

    private fun animateCameraTo(lat: Double, lng: Double, zoom: Double) {
        val pos = CameraPosition.builder()
            .target(LatLng(lat, lng))
            .zoom(zoom.toFloat())
            .build()
        googleMap?.animateCamera(CameraUpdateFactory.newCameraPosition(pos))
    }

    private fun setMarker(lat: Double, lng: Double) {
        val pos = LatLng(lat, lng)
        if (marker != null) {
            marker?.position = pos
        } else {
            marker = googleMap?.addMarker(
                MarkerOptions()
                    .position(pos)
                    .icon(BitmapDescriptorFactory.defaultMarker(BitmapDescriptorFactory.HUE_AZURE))
            )
        }
    }

    private fun clearMarker() {
        marker?.remove()
        marker = null
    }

    /** Safely enables the My Location layer only when permission is granted. */
    private fun applyMyLocation(map: GoogleMap) {
        val fine   = ActivityCompat.checkSelfPermission(context, Manifest.permission.ACCESS_FINE_LOCATION)
        val coarse = ActivityCompat.checkSelfPermission(context, Manifest.permission.ACCESS_COARSE_LOCATION)
        if (fine == PackageManager.PERMISSION_GRANTED || coarse == PackageManager.PERMISSION_GRANTED) {
            map.isMyLocationEnabled = true
        }
    }

    private fun applyMapStyle(map: GoogleMap) {
        val uiMode = context.resources.configuration.uiMode and
                android.content.res.Configuration.UI_MODE_NIGHT_MASK
        if (uiMode == android.content.res.Configuration.UI_MODE_NIGHT_YES) {
            map.setMapStyle(MapStyleOptions(DARK_MAP_STYLE))
        } else {
            map.setMapStyle(null)
        }
    }

    // ─── GoogleMap listeners ─────────────────────────────────────────────────

    override fun onMapClick(latLng: LatLng) {
        channel.invokeMethod(
            "onTap", mapOf(
                "latitude" to latLng.latitude,
                "longitude" to latLng.longitude,
            )
        )
    }

    override fun onPoiClick(poi: com.google.android.gms.maps.model.PointOfInterest) {
        channel.invokeMethod(
            "onPoiTap", mapOf(
                "placeId" to poi.placeId,
                "name" to poi.name,
                "latitude" to poi.latLng.latitude,
                "longitude" to poi.latLng.longitude,
            )
        )
    }
}
