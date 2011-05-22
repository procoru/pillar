/*
 * L.Marker is used to display clickable/draggable icons on the map.
 */

L.Marker = L.Class.extend({

	includes: L.Mixin.Events,
	
	options: {
		icon: new L.Icon(),
		clickable: true,
		draggable: false
	},
	
	initialize: function(latlng, options) {
		L.Util.setOptions(this, options);
		this._latlng = latlng;
	},
	
	onAdd: function(map) {
		this._map = map;
		
		if (!this._icon) {
			this._icon = this.options.icon.createIcon();
			map._panes.markerPane.appendChild(this._icon);
			this._initInteraction();
		}
		if (!this._shadow) {
			this._shadow = this.options.icon.createShadow();
			map._panes.shadowPane.appendChild(this._shadow);
		}
		
		map.on('viewreset', this._reset, this);
		this._reset();
	},
	
	onRemove: function(map) {
		if (this._icon) {
			map._panes.markerPane.removeChild(this._icon);
		}
		if (this._shadow) {
			map._panes.shadowPane.removeChild(this._shadow);
		}
		map.off('viewreset', this._reset, this);
	},
	
	getLatLng: function() {
		return this._latlng;
	},
	
	_reset: function() {
		var pos = this._map.latLngToLayerPoint(this._latlng).round();
		
		L.DomUtil.setPosition(this._icon, pos);
		L.DomUtil.setPosition(this._shadow, pos);
		
		this._icon.style.zIndex = pos.y;
	},
	
	_initInteraction: function() {
		if (this.options.clickable) {
			this._icon.className += ' leaflet-clickable';
			L.DomEvent.addListener(this._icon, 'mousedown', this._fireMouseEvent, this);
			L.DomEvent.addListener(this._icon, 'click', this._onMouseClick, this);
			L.DomEvent.addListener(this._icon, 'dblclick', this._fireMouseEvent, this);
		}
		
		if (L.Handler.MarkerDrag) {
			this.dragging = new L.Handler.MarkerDrag(this);
			
			if (this.options.draggable) {
				this.dragging.enable();
			}
		}
	},
	
	_onMouseClick: function(e) {
		L.DomEvent.stopPropagation(e);
		if (this.dragging && this.dragging.moved()) { return; }
		this.fire(e.type);
	},
	
	_fireMouseEvent: function(e) {
		this.fire(e.type);
		L.DomEvent.stopPropagation(e);
	}
});