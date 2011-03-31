// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2011 Strobe Inc. and contributors.
//            Portions ©2008-2011 Apple Inc. All rights reserved.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================

sc_require('mixins/string');
sc_require('mixins/content_value_support');

/**
  Option for controls to automatically calculate their size (should be default 
  on controls that use renderers).
*/
SC.AUTO_CONTROL_SIZE = '__AUTO__';

/** 
  Option for HUGE control size.
  
  @property {String}
*/
SC.JUMBO_CONTROL_SIZE = 'sc-jumbo-size' ;

/** 
  Option for HUGE control size.
  
  @property {String}
*/
SC.HUGE_CONTROL_SIZE = 'sc-huge-size' ;

/** 
  Option for large control size.
  
  @property {String}
*/
SC.LARGE_CONTROL_SIZE = 'sc-large-size' ;

/** 
  Option for standard control size.
  
  @property {String}
*/
SC.REGULAR_CONTROL_SIZE = 'sc-regular-size' ;

/** 
  Option for small control size.
  
  @property {String}
*/
SC.SMALL_CONTROL_SIZE = 'sc-small-size' ;

/** 
  Option for tiny control size
  
  @property {String}
*/
SC.TINY_CONTROL_SIZE = 'sc-tiny-size' ;

/**
  @namespace
  
  A Control is a view that also implements some basic state functionality.
  Apply this mixin to any view that you want to have standard control
  functionality including showing a selected state, enabled state, focus
  state, etc.
  
  h2. About Values and Content
  
  Controls typically are used to represent a single value, such as a number,
  boolean or string.  The value a control is managing is typically stored in
  a "value" property.  You will typically use the value property when working
  with controls such as buttons and text fields in a form.
  
  An alternative way of working with a control is to use it to manage some
  specific aspect of a content object.  For example, you might use a label
  view control to display the "name" property of a Contact record.  This 
  approach is often necessary when using the control as part of a collection
  view.
  
  You can use the content-approach to work with a control by setting the 
  "content" and "contentValueKey" properties of the control.  The 
  "content" property is the content object you want to manage, while the 
  "contentValueKey" is the name of the property on the content object 
  you want the control to display.
  
  The default implementation of the Control mixin will essentially map the
  contentValueKey of a content object to the value property of the 
  control.  Thus if you are writing a custom control yourself, you can simply
  work with the value property and the content object support will come for
  free.  Just write an observer for the value property and update your 
  view accordingly.
  
  If you are working with a control that needs to display multiple aspects
  of a single content object (for example showing an icon and label), then
  you can override the contentValueDidChange() method instead of observing
  the value property.  This method will be called anytime _any_ property 
  on the content object changes.  You should use this method to check the
  properties you care about on the content object and update your view if 
  anything you care about has changed.
  
  h2. Delegate Support
  
  Controls can optionally get the contentDisplayProperty from a 
  displayDelegate, if it is set.  The displayDelegate is often used to 
  delegate common display-related configurations such as which content value
  to show.  Anytime your control is shown as part of a collection view, the
  collection view will be automatically set as its displayDelegate.
  
  @since SproutCore 1.0
*/
SC.Control = SC.mixin(SC.clone(SC.ContentValueSupport), {
  
  isControl: YES,
  
  /** 
    The selected state of this control.  Possible options are YES, NO or 
    SC.MIXED_STATE.
    
    @property {Boolean}
  */
  isSelected: NO,
  
  /** @private */
  isSelectedBindingDefault: SC.Binding.oneWay().bool(),
  
  /**
    Set to YES when the item is currently active.  Usually this means the 
    mouse is current pressed and hovering over the control, however the 
    specific implementation my vary depending on the control.
    
    Changing this property value by default will cause the Control mixin to
    add/remove an 'active' class name to the root element.
    
    @property {Boolean}
  */
  isActive: NO,
  
  /** @private */
  isActiveBindingDefault: SC.Binding.oneWay().bool(),
  
  /**
    The name of the property this control should display if it is part of an
    SC.FormView.
    
    If you add a control as part of an SC.FormView, then the form view will 
    automatically bind the value to the property key you name here on the 
    content object.
    
    @property {String}
  */
  fieldKey: null,
  
  /**
    The human readable label you want shown for errors.  May be a loc string.
    
    If your field fails validation, then this is the name that will be shown
    in the error explanation.  If you do not set this property, then the 
    fieldKey or the class name will be used to generate a human readable name.
    
    @property {String}
  */
  fieldLabel: null,
  
  /**
    The human readable label for this control for use in error strings.  This
    property is computed dynamically using the following rules:
    
    If the fieldLabel is defined, that property is localized and returned.
    Otherwise, if the keyField is defined, try to localize using the string 
    "ErrorLabel.{fieldKeyName}".  If a localized name cannot be found, use a
    humanized form of the fieldKey.
    
    Try to localize using the string "ErrorLabel.{ClassName}". Return a 
    humanized form of the class name.
    
    @property {String}
  */
  errorLabel: function() {
    var ret, fk, def ;
    if (ret = this.get('fieldLabel')) return ret ;
    
    // if field label is not provided, compute something...
    fk = this.get('fieldKey') || this.constructor.toString() ;
    def = (fk || '').humanize().capitalize() ;
    return "ErrorLabel."+fk
      .locWithDefault(("FieldKey."+fk).locWithDefault(def)) ;
      
  }.property('fieldLabel','fieldKey').cacheable(),

  /**
    The control size.  This will set a CSS style on the element that can be 
    used by the current theme to vary the appearance of the control.
    
    Some controls will default to SC.AUTO_CONTROL_SIZE, which will allow you
    to simply size the control, and the most appropriate control size will
    automatically be picked; be warned, though, that if you don't specify
    a height, performance will be impacted as it must be calculated; if you do
    this, a warning will be issued. If you don't care, use SC.CALCULATED_CONTROL_SIZE.
    
    @property {String}
  */
  controlSize: SC.REGULAR_CONTROL_SIZE,
  
  /** @private */
  displayProperties: 'isEnabled isSelected isActive controlSize'.w(),
  
  /** @private */
  _CONTROL_TMP_CLASSNAMES: {},
  
  /** @private
    Invoke this method in your updateDisplay() method to update any basic 
    control CSS classes.
  */
  renderMixin: function(context, firstTime) {
    var sel = this.get('isSelected'), disabled = !this.get('isEnabled'),
    // update the CSS classes for the control.  note we reuse the same hash
    // to avoid consuming more memory
    names = this._CONTROL_TMP_CLASSNAMES ; // temporary object
    names.mixed = sel === SC.MIXED_STATE;
    names.sel = sel && (sel !== SC.MIXED_STATE) ;
    names.active = this.get('isActive') ;

    var controlSize = this.get("controlSize");
    if (!controlSize) {
      controlSize = SC.REGULAR_CONTROL_SIZE;
    }

    if (firstTime) {
      context.setClass(names);

      // delegates handle adding 'controlSize' on their own. We only support it
      // here for backwards-compatibility.
      if (!this.get('renderDelegate')) {
        context.addClass(controlSize);
      }
    } else {
      context.$().setClass(names);
      if (!this.get('renderDelegate')) {
        context.$().addClass(controlSize);
      }
    }

    // if the control implements the $input() helper, then fixup the input
    // tags
    if (!firstTime && this.$input) {
      var inps = this.$input();
      if(inps.attr('type')!=="radio"){
        this.$input().attr('disabled', disabled);
      }
    }
  },
});

