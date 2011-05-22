Leaflet Changelog
=================

## 0.2 (master)

 * Added **WMS support** (L.TileLayer.WMS), currently EPSG:3857 only. [#50](https://github.com/CloudMade/Leaflet/issues/50)
 * `L.Circle` is now zoom-dependent (with radius in meters); circle of a permanent size is now called `L.CircleMarker`. [#44](https://github.com/CloudMade/Leaflet/issues/44)
 * Disabled zoom animation on Android by default because it's buggy on some devices (will be enabled back when it's stable enough). [#32](https://github.com/CloudMade/Leaflet/issues/32)
 * Added `maxZoom` argument to `map.locateAndSetView` method.
 * Improved geolocation error handling, explicit timeout. [#61](https://github.com/CloudMade/Leaflet/issues/61)
 * Fixed a bug where zooming is broken if the map contains a polygon and you zoom to an area where it's not visible. [#47](https://github.com/CloudMade/Leaflet/issues/47)
 * Fixed a bug where closed polylines would not appear on the map.
 * Fixed a bug where map isn't displayed in Firefox when there's an `img { max-width: 100% }` rule.

## 0.1 (2011-05-13)

 * Initial Leaflet release.