// ==========================================================================
// Project:   Forms.FormFieldView
// Copyright: ©2009 Alex Iskander and TPSi
// ==========================================================================
/*globals Forms */
require("views/form_label");

/** @class
	Encapsulates a field. Usually, it is specialized for a specific field.
	
	The default implementation takes the fieldClass property and creates
	an instance.
	
	h2. Special Features of FormFieldView
	FormFieldView addresses a few primary things:
	
	- <strong>Beginning/ending editing</strong>. This allows the fields to
	automatically enter and exit editing mode when the form does. FieldView
	specializations don't really have to do much special here (though they can
	if they want)—the default handling of this is to hide and show the label and
	field. The functions hideField, hideLabel, showField, and showLabel handle this,
	and can be overriden for purposes such as animation.
	
	- <strong>Automatic resizing</strong>. The FormFieldView is <em>always</em> sized
	to the size of its active child (either field or label). When autoResize is enabled,
	if the field and label support it, the FormFieldView will therefore automatically
	support it as well, shrinking and growing as necessary.
	@extends SC.View
*/
Forms.FormFieldView = SC.View.extend(SC.Editable, SC.Control,
/** @scope Forms.FormFieldView.prototype */ {
	concatenatedProperties: ["applyMixins"],
	/**
		If YES, the field is automatically hidden when empty and not editing.
		
		Note that this has <storng>nothing</strong> to do with rows auto-hiding.
		When a field auto-hides, it just sets its isHidden to YES as a hint to
		parents (which are the ones that have the resonsibility of updating flowing)
		and sets isVisible (which, if you are lucky, the animate layer overrides).
		
		You <strong>do not</strong> usually need to make <em>fields</em> autoHide. 
		Usually, you would instead make the <em>rows</em> autoHide.
		
		The parent objects handle flowing, skipping hidden items, because we don't
		actually want to change the object's size to 0x0; rather, we want the
		object to disappear and not be counted in the flowing. The distinction
		is subtle, but necessary for animation—which, of course, we love.
	*/
	autoHide: NO,
	
	/**
		Whether or not to automatically resize.
		
		This will only work if the field or label (whichever is active) auto resizes
		itself. The field and label's autoResize parameter is bound to this one; nothing
		else occurs through autoResize.
		
		Disabling should increase performance.
		
		@default YES
	*/
	autoResize: YES,
	
	/**
		Values to consider empty.
		
		Empty <strong>does</strong> have something to do with row auto-hiding. FormRowViews
		check this. If there are no non-empty fields, then if they are set to auto-hide, they will.
		
		If you need more control over what to consider empty and what not to consider empty,
		override the isEmpty computed property.
	*/
	emptyValues: [undefined, null, ""],
	
	/**
		@property
		YES if it is empty.
	*/
	isEmpty: function()
	{
		if (this.get("isEditing")) return NO;
		
		var ev = this.get("emptyValues");
		if (ev.indexOf(this.get("value")) >= 0) return YES;
		return NO;
	}.property("emptyValues", "value", "isEditing").cacheable(),
	
	/**
		YES if it is hidden.
		
		It is changed when the calculateHiddenness method is called—the most
		obvious caller of this being the isEmptyDidChange observer.
	*/
	isHidden: NO,
	
	/**
		If YES, the field steals focus when it is begins editing.
	*/
	stealsFocus: NO,
	
	/**
		Some class names for the field.
	*/
	classNames: ["sc-form-field-view"],
	
	/**
		The type of field to automatically create and encapsulate.
	*/
	fieldClass: SC.TextFieldView,
	
	/**
		The field that was automatically created.
	*/
	field: null,
	
	/**
		The currently active item (label or field)
	*/
	activeView: null,
	
	/**
		The label to show when not editing (during design time, just the class).
	*/
	labelView: Forms.FormLabelView.design({
		layout: { top: 0, left: 0 },
		autoResize: YES
	}),
	
	
	/**
		A set of functions which may be overriden by mixins (it is a concatenated property).
	*/
	preInitMixin: function()
	{
		
	},
	
	init: function()
	{
		var mixins = SC.$A(this.preInitMixin);
		var i = 0, l = mixins.length;
		for (i = 0; i < l; i++)
		{
			mixins[i].call(this);
		}
		
		sc_super();
	},
	
	/**
		Controls the initialization of the field and label.
	*/
	createChildViews: function()
	{
		sc_super();
		
		// setup the things
		this.setupLabelView();
		this.setupFieldView();
		this.updateEditingState();
		
		// for now, just make edit. And when I test, I'll toggle this.
		this.set("activeView", this.get("labelView"));
		
		this.set("firstKeyView", this.field);
		this.set("lastKeyView", this.field);
	},
	
	/**
		Creates the label (idle representation) of the view.
		
		You know, not all fields want to use a label for their idle representations. So,
		you can override this function to handle that.
	*/
	setupLabelView: function()
	{
		// same with label
		this.labelView = this.createChildView(this.get("labelView"));
		this.labelView.bind("value", [this, "value"]);
		this.labelView.bind("autoResize", [this, "autoResize"]);
		this.appendChild(this.labelView);
	},
	
	/**
		Creates the field (editing representation).
		
		You usually don't need to override this, but you can.
	*/
	setupFieldView: function()
	{
		// basically just pass on our own bindings
		this.field = this.createChildView(this.get("fieldClass"));
		this.field.bind("value", [this, "value"]);
		this.field.bind("autoResize", [this, "autoResize"]);
		this.appendChild(this.field);
	},
	
	/**
		Updates the size when the size of the contained object (the field or label)
		changes.
	*/
	layoutDidChangeFor: function(child)
	{
		sc_super();
		if (child == this.get("activeView"))
		{
			this._updateActiveLayout();
		}
	},
	
	/**
		Called when the active view (field or label) changes or when
		its layout changes.
	*/
	_updateActiveLayout: function()
	{
		var active = this.get("activeView");
		if (!active) return;
		
		// we must recompute becaues we may be more modern than the last calculation.
		var frame = active.computeFrameWithParentFrame(null);
		
		// now we need to add our own padding, which we have to get from computed style
		var layer = this.get("layer");
		if (layer)
		{
			var computed = null;
			if (document.defaultView && document.defaultView.getComputedStyle) {
				computed = document.defaultView.getComputedStyle(layer, null);
			} else {
				computed = layer.currentStyle;
			}
			
			// i really don't like this...
			if (computed.paddingLeft) frame.width += parseInt(computed.paddingLeft);
			if (computed.paddingTop) frame.height += parseInt(computed.paddingTop);
			if (computed.paddingRight) frame.width += parseInt(computed.paddingRight);
			if (computed.paddingBottom) frame.height += parseInt(computed.paddingBottom);
		}
		
		this.adjust({
			width: frame.width,
			height: frame.height
		});
		this.layoutDidChange();
	}.observes("activeView"),
	
	/**
		If the parent view has an emptinessDidChangeFor methdod, this calls that.
		
		This does not calculate hiddennes (that is in another observer that observes
		both isEmpty and autoHide).
	*/
	isEmptyDidChange: function() { 
		// call parent's emptinessDidChangeFor if available.
		var parent = this.get("parentView");
		if (!parent) return;
		
		if (parent.emptinessDidChangeFor) parent.emptinessDidChangeFor(this);
		
	}.observes("isEmpty"),
	
	
	/**
		Calculates whether the view should be hidden, and does what needs to be
		done accordingly.
		
		Sets isHidden, isVisible, and alerts a layout change for the parent—because
		whether invisible or visible, layout must have changed.
	*/
	calculateHiddenness: function()
	{
		var currentHidden = this.get("isHidden");
		
		var newHidden = NO;
		if (this.get("isEmpty") && this.get("autoHide")) newHidden = YES;
		if (this.get("isEditing")) newHidden = NO;
		
		if (currentHidden !== newHidden)
		{
			this.setIfChanged("isHidden", newHidden);
			this.setIfChanged("isVisible", !newHidden);
			this.layoutDidChange();
		}
	}.observes("autoHide", "isEmpty"),
	
	/**
	Does not do precisely what you expect :).
	
	What does it do? It begins editing, but does not take first responder status,
	because this field is not supposed to take views. This is just state-related stuff.
	If the field this contains wants to take focus, fine for it!
	*/
	beginEditing: function()
	{
		if (this.get('isEditing')) return YES;
		this.set("activeView", this.get("field"));
		this.set("isEditing", YES);
		this.calculateHiddenness();
		
		// if it steals focus, handle that
		if (this.stealsFocus)
		{
			// delay so it will trigger after we set display.
			SC.Timer.schedule({
				interval: 1,
				target: this,
				action: "stealFocus"
			});
		}
	},
	
	stealFocus: function()
	{
		try {
			this.get("field").beginEditing();
		} catch (e) {
			// don't need to do anything. We tried our best.
		}
	},

	discardEditing: function()
	{
		// if we are not editing, return YES, otherwise NO.
		return !this.get('isEditing');
	},

	commitEditing: function()
	{
		if (!this.get("isEditing")) return YES;
		this.set("activeView", this.get("labelView"));
		this.set("isEditing", NO);
		this.calculateHiddenness();
	},
	
	isEditingDidChange: function()
	{
		this.updateEditingState();
	}.observes("isEditing"),
	
	updateEditingState: function()
	{
		var editing = this.get("isEditing");
		if (!editing) { this.hideField(); this.showLabel(); }
		else { this.showField(); this.hideLabel(); }
	},
	
	/**
		Shows the field.
		
		The default version just sets isVisible to YES.
	*/
	showField: function()
	{
		this.get("field").set("isVisible", YES);
	},
	
	/**
		Hides the field.
		
		The default version just sets isVisible to NO.
	*/
	hideField: function()
	{
		this.get("field").set("isVisible", NO);
	},
	
	/**
		Shows the label.
		
		The default version just sets isVisible to YES.
	*/
	showLabel: function()
	{
		this.get("labelView").set("isVisible", YES);
	},
	
	/**
		Hides the label.
		
		The default version just sets isVisible to NO.
	*/
	hideLabel: function()
	{
		this.get("labelView").set("isVisible", NO);
	}
});

Forms.FormFieldView.mixin({
	/**
		@private
		The set of specialized FormFieldViews.
	*/
	_specializations: {},
	
	/**
		Creates a field.
		
		Properties are passed on to the field itself, except for autoResize, fieldKey, and
		classNames, which are applied to the field container.
	*/
	field: function(fieldClass, properties)
	{
		// we'll put properties for the field itself here:
		var fieldProperties = {};
		
		// get the form field view to use
		var formFieldView = this._specializations[SC.guidFor(fieldClass)];
		if (!formFieldView) 
		{
			// no specialization, so get default.
			formFieldView = Forms.FormFieldView;
			
			// mixin default field properties for unknown field types
			// specializations have their own, naturally.
			SC.mixin(fieldProperties, {
				layout: { left: 0, width: 200, height: 22, top: 0 }
			});
		}
		
		// mix in settings
		SC.mixin(fieldProperties, properties);
		
		// prepare settings for form field (it gets all settings, just in case)
		var formFieldProperties = SC.clone(fieldProperties);
		
		// stolen properties are used ONLY one place.
		var stealProperties = ["autoResize", "fieldKey", "classNames", "emptyValue", "autoHide", "stealsFocus"];
		
		for (var i = 0; i < stealProperties.length; i++)
		{
			if (!SC.none(fieldProperties[stealProperties[i]]))
			{
				delete fieldProperties[stealProperties[i]];
			}
		}
		
		formFieldProperties.fieldClass = fieldClass.design(fieldProperties);
		
		return formFieldView.design({mixinDesign: formFieldProperties });
	},
	
	/**
		Specializes <strong>and</strong> registers a FormFieldView.
		
		You can specialize without registering by just calling extend.
	*/
	specialize: function(fieldClass, special)
	{
		var result = this.extend(special);
		this.registerSpecialization(fieldClass, result);
		return result;
	},
	
	/**
		Registers an existing specialization.
	*/
	registerSpecialization: function(fieldClass, specialization)
	{
		this._specializations[SC.guidFor(fieldClass)] = specialization;
	}
});
