// ==========================================================================
// Project:   Forms.FormLabelView
// Copyright: ©2009 My Company, Inc.
// ==========================================================================
/*globals Forms */

/** @class
	A subclass of LabelView that adds automatic resizing to the label.
  	@extends SC.LabelView
*/
Forms.FormLabelView = SC.LabelView.extend(
/** @scope Forms.FormLabelView.prototype */ {
	// someone creating their own... they can bind on their own too.
	classNames: ["forms-label"],
	measuredWidth: 0,
	measuredHeight: 0,
	
	autoResize: YES,
	sizeMayChange: function()
	{
		if (this.get("autoResize") && this.get("isVisible")) this.measure();
	}.observes("isVisible", "autoResize"),
	
	/**
		When the layer updates, this checks the actual width and height, and
		if necessary, changes the layout's width and height.
	
		The automatic change means that a rendering can cause another rendering—the
		updating of the layer causes didUpdateLayer to be called, which calls
		layoutDidChange (if layout did indeed change), which causes another layer
		update.
	*/
	didUpdateLayer: function()
	{
		sc_super();
		if (this.get("autoResize")) this.measure();
	},
	
	measure: function()
	{
		// get layer (obviously...)
		var layer = this.get("layer");
		if (!layer) return;
		var metrics = SC.metricsForString(this.get("value"), layer);
		var layout = this.get("layout");
		if (!layout) layout = {};
		if (layout.width != metrics.width || layout.height != metrics.height)
		{
			this.adjust({
				width: metrics.width + 1, // add tolerance because no one cares about 1px (yet) and Firefox
				// sometimes needs it.
				
				height: metrics.height
			}).updateLayout();
		}
	}
});
