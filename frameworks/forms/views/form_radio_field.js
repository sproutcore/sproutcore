// ==========================================================================
// Project:   Forms.FormRadioField
// Copyright: ©2009 Alex Iskander and TPSi.
// ==========================================================================
/*globals Forms */

/** @class
	A FormFieldView specialization for RadioViews.
	@extends SC.FormFieldView
*/
require("views/form_field");
Forms.FormRadioView = Forms.FormFieldView.extend(
/** @scope Forms.FormRadioFieldView.prototype */ {
	
	/**
		display value is calculated based on the current items array (if any)
	*/
	displayValue: "",
	
	init: function()
	{
		this.fieldClass = this.fieldClass.extend({
			itemHeight: 18,
			autoResize: NO,

			autoResizeDidChange: function()
			{
				this.measure();
			}.observes("autoResize"),
			
			didUpdateLayer: function()
			{
				sc_super();
				this.measure();
			},
      
      layoutChildViews: function(){
        sc_super();
        this.measure();
      },
			
			measure: function()
			{
				if (this.get("autoResize"))
				{
					var layer = this.get("layer");
					if (!layer) return;
					
					var cHeight = layer.offsetHeight, cWidth = layer.offsetWidth;
					layer.style.height = "0px";
					layer.style.width = "0px";
					var targetHeight = layer.scrollHeight;
					var targetWidth = layer.scrollWidth;
					layer.style.height = cHeight + "px";
					layer.style.width = cWidth + "px";
					if (targetHeight != this.get("layout").height) this.adjust("height", targetHeight).updateLayout();
					if (targetWidth != this.get("layout").width) this.adjust("width", targetWidth).updateLayout();
				}
			}
		});
		sc_super();
	},
	
	/**
		Creates the label (idle representation) of the view.
		
		Overriden because we want a different value binding (we calculate a custom one)
	*/
	setupLabelView: function()
	{
		// same with label
		this.labelView = this.createChildView(this.get("labelView"));
		this.labelView.bind("value", [this, "displayValue"]);
		this.labelView.bind("autoResize", [this, "autoResize"]);
		this.appendChild(this.labelView);
	},
	
	valueDidChange: function()
	{
		var items = this.get("items");
		var value = this.get("value");
		if (!items)
		{
			this.set("displayValue", value);
			return;
		}
		
		// loop through
		var i, l = items.length;
		var vk = this.get("itemValueKey"), tk = this.get("itemTitleKey");
		for (i = 0; i < l; i++)
		{
			var item = items.objectAt(i);
			var iv = "", it = "";
			
			// if it is an array, use the parts
			if (SC.typeOf(item) === SC.T_ARRAY)
			{
				it = item[0]; iv = item[1];
			}
			else if (item)
			{
				if (tk)
				{
					it = item.get ? item.get(tk) : item[tk];
				} else it = (item.toString) ? item.toString() : null;
				
				if (vk)
				{
					iv = item.get ? item.get(vk) : item[vk];
				} else iv = item;
			}
			
			if (!it) it = iv;
			
			// see if we found it
			if (value == iv)
			{
				this.set("displayValue", it);
				return;
			}
		}
	}.observes("value", "itemValueKey", "itemTitleKey", "items")
});

Forms.FormFieldView.registerSpecialization(SC.RadioView, Forms.FormRadioView);