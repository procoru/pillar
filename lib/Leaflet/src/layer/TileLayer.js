/*
 * L.TileLayer is used for standard xyz-numbered tile layers.
 */

L.TileLayer = L.Class.extend({
	includes: L.Mixin.Events,
	
	options: {
		minZoom: 0,
		maxZoom: 18,
		tileSize: 256,
		subdomains: 'abc',
		errorTileUrl: '',
		attribution: '',
		
		unloadInvisibleTiles: L.Browser.mobileWebkit,
		updateWhenIdle: L.Browser.mobileWebkit
	},
	
	initialize: function(url, options) {
		L.Util.setOptions(this, options);
		
		this._url = url;
		
		if (typeof this.options.subdomains == 'string') {
			this.options.subdomains = this.options.subdomains.split('');
		}
	},
	
	onAdd: function(map) {
		this._map = map;
		
		// create a container div for tiles
		this._initContainer();
		
		// create an image to clone for tiles
		this._tileImg = L.DomUtil.create('img', 'leaflet-tile');
		this._tileImg.galleryimg = 'no';
		
		var tileSize = this.options.tileSize;
		this._tileImg.style.width = tileSize + 'px';
		this._tileImg.style.height = tileSize + 'px';
		
		// set up events
		map.on('viewreset', this._reset, this);
		
		if (this.options.updateWhenIdle) {
			map.on('moveend', this._update, this);
		} else {
			this._limitedUpdate = L.Util.limitExecByInterval(this._update, 100, this);
			map.on('move', this._limitedUpdate, this);
		}
		
		this._reset();
		this._update();
	},
	
	onRemove: function(map) {
		this._map.getPanes().tilePane.removeChild(this._container);
		
		this._map.off('viewreset', this._reset);
		
		if (this.options.updateWhenIdle) {
			this._map.off('moveend', this._update);
		} else {
			this._map.off('move', this._limitedUpdate);
		}
	},
	
	getAttribution: function() {
		return this.options.attribution;
	},
	
	_initContainer: function() {
		var tilePane = this._map.getPanes().tilePane;
		if (!this._container || tilePane.empty) {
			this._container = L.DomUtil.create('div', 'leaflet-layer', tilePane);
		}
	},
	
	_reset: function() {
		this._tiles = {};
		this._initContainer();
		this._container.innerHTML = '';
	},
	
	_update: function() {
		var bounds = this._map.getPixelBounds(),
			tileSize = this.options.tileSize;
		
		var nwTilePoint = new L.Point(
				Math.floor(bounds.min.x / tileSize),
				Math.floor(bounds.min.y / tileSize)),
			seTilePoint = new L.Point(
				Math.floor(bounds.max.x / tileSize),
				Math.floor(bounds.max.y / tileSize)),
			tileBounds = new L.Bounds(nwTilePoint, seTilePoint);
		
		this._loadTilesFromCenterOut(tileBounds);
		
		if (this.options.unloadInvisibleTiles) {
			this._unloadOtherTiles(tileBounds);
		}
	},
	
	getTileUrl: function(tilePoint, zoom) {
		var subdomains = this.options.subdomains,
			s = this.options.subdomains[(tilePoint.x + tilePoint.y) % subdomains.length];

		return this._url
				.replace('{s}', s)
				.replace('{z}', zoom)
				.replace('{x}', tilePoint.x)
				.replace('{y}', tilePoint.y);
	},
	
	_loadTilesFromCenterOut: function(bounds) {
		var queue = [],
			center = bounds.getCenter();
		
		for (var j = bounds.min.y; j <= bounds.max.y; j++) {
			for (var i = bounds.min.x; i <= bounds.max.x; i++) {				
				if ((i + ':' + j) in this._tiles) { continue; }
				queue.push(new L.Point(i, j));
			}
		}
		
		// load tiles in order of their distance to center
		queue.sort(function(a, b) {
			return a.distanceTo(center) - b.distanceTo(center);
		});
		
		this._tilesToLoad = queue.length;
		for (var k = 0, len = this._tilesToLoad; k < len; k++) {
			this._loadTile(queue[k]);
		}
	},
	
	_unloadOtherTiles: function(bounds) {
		var kArr, x, y, key;
		
		for (key in this._tiles) {
			if (this._tiles.hasOwnProperty(key)) {
				kArr = key.split(':');
				x = parseInt(kArr[0], 10);
				y = parseInt(kArr[1], 10);
				
				// remove tile if it's out of bounds
				if (x < bounds.min.x || x > bounds.max.x || y < bounds.min.y || y > bounds.max.y) {
					if (this._tiles[key].parentNode == this._container) {
						this._container.removeChild(this._tiles[key]);
					}
					delete this._tiles[key];
				}
			}
		}		
	},
	
	_loadTile: function(tilePoint) {
		var origin = this._map.getPixelOrigin(),
			tileSize = this.options.tileSize,
			tilePos = tilePoint.multiplyBy(tileSize).subtract(origin),
			zoom = this._map.getZoom();
			
		// wrap tile coordinates
		var tileLimit = (1 << zoom);
		tilePoint.x = ((tilePoint.x % tileLimit) + tileLimit) % tileLimit;
		if (tilePoint.y < 0 || tilePoint.y >= tileLimit) { return; }
		
		// create tile
		var tile = this._tileImg.cloneNode(false);
		
		L.DomUtil.setPosition(tile, tilePos);
		
		this._tiles[tilePoint.x + ':' + tilePoint.y] = tile;

		tile._leaflet_layer = this;
		tile.onload = this._tileOnLoad;
		tile.onerror = this._tileOnError;
		tile.onselectstart = tile.onmousemove = L.Util.falseFn;
		
		tile.src = this.getTileUrl(tilePoint, zoom);
		
		this._container.appendChild(tile);
	},
	
	_tileOnLoad: function() {
		this.className += ' leaflet-tile-loaded'; //TODO DomEvent#addListener target 

		var layer = this._leaflet_layer;
		
		layer.fire('tileload', {tile: this, url: this.src});
		
		layer._tilesToLoad--;
		if (!layer._tilesToLoad) {
			layer.fire('load');
		}
	},
	
	_tileOnError: function() {
		this._leaflet_layer.fire('tileerror', {tile: this, url: this.src});
		
		var newUrl = this._leaflet_layer.options.errorTileUrl;
		if (newUrl) {
			this.src = newUrl;
		}
			
	}
});