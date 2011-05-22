Pillar.Map = Pillar.Class.extend({

	includes: Pillar.Events,

	options: {
	},

	/**
	 * @constructor
	 * @param {DOMElement|String} id
	 * @param {Object} options
	 */
	initialize: function(/*DOMElement or String*/ id, /*Object*/ options) {
		this._container = Pillar.DomUtil.get(id);
		this._container.innerHTML = 'Hello, World!';
	}
});
