var Pillar = {

	version: '%VERSION%',

	noConflict: function() {
		Pillar = this.original;
		return this;
	},

	original: Pillar
};