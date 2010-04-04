// ==========================================================================
// Project:   Forms.FormTextFieldView
// Copyright: ©2009 Alex Iskander and TPSi.
// ==========================================================================
/*globals Forms */

/** @class

  (Document Your View Here)

  @extends SC.View
*/
Forms.FormTextFieldView = Forms.FormFieldView.extend(
/** @scope Forms.FormTextFieldView.prototype */ {
  
  autoResize: NO,
  
	init: function()
	{
		var self = this;
		this.fieldClass = this.fieldClass.extend({
			_topOffsetForFirefoxCursorFix: 0,
			init: function()
			{
				sc_super();
			},
			keyDown: function(e)
			{
				self.keyDown(e, this.$input()[0]);
				return sc_super();
			},
			
			keyUp: function(e)
			{
			  self.keyUp(e, this.$input()[0]);
			  return sc_super();
			},
			
			beginEditing: function()
			{
				sc_super();
				
				// a small improvement for some use cases (need an autoSelect option, though)
				var layer = this.$input()[0];
				if (layer) {
					SC.Timer.schedule({ // have to do it in a timer for Firefox to be happy.
						interval: 1,
						target: this,
						action: "performAutoSelect"
					});
				}
			},
			
			performAutoSelect: function()
			{
				var layer = this.$input()[0];
				if (layer) layer.select();
			},
			
			didUpdateLayer: function()
			{
				sc_super();
				this._applyFirefoxCursorFix();
			},
			
			_animation_getTextFields: function(start)
			{
				start.next_field = this;
				this.next_field = null;
				return this;
			}
		});
		sc_super();
	},
	
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
		if (this.get("autoResize")) this.measure(null);
	},
	
	keyDown: function(e, input)
	{
		sc_super();
		if (e.metaKey || e.ctrlKey) return; // don't remeasure until keyUp.
		var str = e.getCharString();
		
		// special cases: text area press enter
		if (e.keyCode == 13 && this.get("field").get("isTextArea")) str = "\nx";
		
		// measure!
		if (str) this.measure(input.value + str);
	},
	
	keyUp: function(e, input){
	  if (input) this.measure(input.value);
	},
	
	_animation_getTextFields: function(start)
	{
		return this.get("field")._animation_getTextFields(start);
	},
	
	/**
		Automatically resizes the text field. However, if it is a text area, it only resizes
		the height.
	*/
	measure: function(value)
	{
	  if (!this.get("autoResize")) return;
	  
		var autoResizeWidth = !this.get("field").get("isTextArea");
		
		// get value
		if (typeof value != "string") value = this.get("value");
		
		// get layer... but which?
		var layer = this.get("field").$input()[0];
		
		// if there is no layer, we can't do anything
		if (!layer) return;
		
		// determine what value to measure (hint or real)
		if (!value || value === "")
		{
			value = this.getPath("field.hint");
		}
		else
		{
			// the real value should have a character added to it if it is multiline,
			// so that the extra line may be considered in flowing.
			var lio = value.lastIndexOf("\n");
			if (lio == value.length - 1) value += "x";
		}
		
		var field_metrics = SC.metricsForString(value, layer);
		
		var hPadding = 6, vPadding = 9;
		
		// correct WebKit spacing issue
		if (SC.browser.webkit)
		{
			hPadding += 3;
		}
		
		var our_metrics = {
			width: field_metrics.width + hPadding,
			height: field_metrics.height + vPadding
		};
		
		var layout = this.get("layout");
		if (!layout) layout = {};

    // we used to check to see if it is different than the existing width...
    // however, that is not reliable because sometimes the width is changed artificially (not related to measure())
		if (autoResizeWidth) 
		{
			this.field.adjust("width", our_metrics.width);
			layer.style.width = (3 + field_metrics.width) + "px";
		}
		
		layer.style.height = (3 + field_metrics.height) + "px";
		
		this.field.adjust({
			"height": our_metrics.height
		}).updateLayout();
		this.field._applyFirefoxCursorFix();

	}.observes("value")
});

Forms.FormTextFieldView.registerSpecialization(SC.TextFieldView, Forms.FormTextFieldView);