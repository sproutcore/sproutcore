// ==========================================================================
// Project:   Forms.FormAnimation
// Copyright: ©2009 TPSi
// ==========================================================================
/*globals Forms*/
/** @namespace
	This mixin adds animation support to forms. It propagates itself by
	mixing in some of its attributes (which may be overriden):
	- rows
	- fields
	- forms
	
	The defaults are present only for reference; they are always mixed in to
	a clone of Forms.FormRowAnimation, Forms.FormFieldAnimation, etc.
	
	FormAnimation mixes in and overrides show() and hide() methods, amongst
	other things.
	
	They all work the same way–in fact, just like how row inherits from form,
	FormRowAnimation is a mixin that sits on top of FormAnimation mixin 
	(which is why you see them in an array).
*/

// there is no use in adding this if there is no Animate instance.
if (SC.Animatable) {

Forms._DefaultAnimation = {
	visibleState: { opacity: 1, display: "block" },
	hiddenState: { opacity: 0, display: "none" },
	
	// for labels
	labelVisibleState: { opacity: 1, display: "block" },
	labelHiddenState: { opacity: 0, display: "none" },
	fieldVisibleState: { opacity: 1, display: "block" },
	fieldHiddenState: { opacity: 0, display: "none" },
	
	fieldTransitions: { opacity: 0.125, display: 0.5 },
	labelTransitions:  { opacity: 0.125, display: 0.5 },
	
	transitions: { 
	  opacity: { duration: 0.125, timing: SC.Animatable.TIMING_EASE_IN_OUT }, 
	  top: { duration: 0.25, timing: SC.Animatable.TIMING_EASE_IN_OUT }, 
	  left: 0.25, display: 0.5 
	},
	
	show: function()
	{
		this.resetAnimation();
		this.set("isHidden", NO);
		this.set("needsDisplay", YES);
		this.layoutDidChange();
	},
	
	display: function()
	{
		this.adjust(this.visibleState);
	},
	
	hide: function()
	{
		this.adjust(this.hiddenState);
		this.set("isHidden", YES);
		this.layoutDidChange();
	},
	
	showLabel: function()
	{
		var label = this.get("labelView");
		label.adjust(this.labelVisibleState);
		if (label.sizeMayChange) label.sizeMayChange();
	},
	
	hideLabel: function()
	{
		this.get("labelView").adjust(this.labelHiddenState);
	},
	
	showField: function()
	{
		var field = this.get("field");
		field.adjust(this.fieldVisibleState);
		if (field.sizeMayChange) field.sizeMayChange();
	},
	
	hideField: function()
	{
		this.get("field").adjust(this.fieldHiddenState);
	}
};

Forms.FormAnimation = {
};

Forms.FormAnimationHacks = {
	
};

if (SC.browser.mozilla)
{
	// we have to add some hacks to get Firefox to work right with input fields.
	SC.mixin(Forms.FormAnimationHacks, {
		initMixin: function()
		{
			// we need to add stuff, unfortunately.
			if (SC.browser.mozilla)
			{
				this._cssTransitionFor["top"] = NO;
				this._cssTransitionFor["left"] = NO;
				this._original_animateTickPixel = this._animateTickPixel;
				this._animateTickPixel = this._replace_animateTickPixel;
			}
		},
		/**
			Used to form a linked list of text fields in a form view.
			Each text field has a previous, next, and "stop". The stop field
			defines what object it should stop at during an update.
			
			Keep in mind that we DON'T LIKE THIS! It is possible the function would be
			called more than once for any text field during any frame—but it is kind of difficult
			to get around that.
		*/
		_animation_getTextFields: function(start)
		{
			if (!start) start = {};
			
			var fields = this.get("_displayFields"), l = fields.length, i;
			var our_start = null;
			for (i = 0; i < l; i++)
			{
				var field = fields[i];
				if (field._animation_getTextFields)
				{
					var new_start = field._animation_getTextFields(start);
					
					// if we don't have a starting field, set it.
					if (!our_start) our_start = start.next_field;
					
					// as you were, gents.
					start = new_start;
				}
			}
			
			this.start_field = our_start; // could be null.
			this.last_field = start;
			return start;
		},
		
		_replace_animateTickPixel: function()
		{
			this.holder._original_animateTickPixel.apply(this, arguments);
			
			var f = this.holder.start_field;
			while (f)
			{
				f._applyFirefoxCursorFix();
				
				// stop short of setting non-children.
				if (f == this.last_field) break;
				f = f.next_field;
			}
		},
		
		/**
			Relayout functions should look for this and call it after they have re-laid-out.
		*/
		_relayout_hacks: function()
		{
			this._animation_getTextFields();
		}
	});
}

Forms._FormFieldAnimation = {
	// an optional function we are filling in...
	preInitMixin: function()
	{
		this.fieldClass = this.fieldClass.extend(SC.Animatable, { transitions: this.fieldTransitions });
		this.labelView = this.labelView.extend(SC.Animatable, { transitions: this.labelTransitions });
	},
	transitions: { left: null, top: null, opacity: 0.25, display: 0.5 }
};

SC.mixin(Forms.FormAnimation, {
	formMixin: [SC.Animatable, Forms._DefaultAnimation, Forms.FormAnimationHacks],
	rowMixin: [SC.Animatable, Forms._DefaultAnimation, Forms.FormAnimationHacks]
//	fieldMixin: [SC.Animatable, Forms._DefaultAnimation, Forms._FormFieldAnimation] <- has problems and I don't like anyway.
});

Forms.DemoTransitions = {
	transitions: { opacity: 0.75, top: 0.75, left: 0.75, display: 1.25 }
};

Forms.FormAnimation.DemoMode = {
	formMixin: [ Forms.DemoTransitions ],
	rowMixin: [ Forms.DemoTransitions ]
};

}