// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2009 Sprout Systems, Inc. and contributors.
//            Portions ©2008-2009 Apple Inc. All rights reserved.
// License:   Licened under MIT license (see license.js)
// ==========================================================================

sc_require('mixins/string');

/** 
  Indicates a value has a mixed state of both on and off. 
  
  @property {String}
*/
SC.MIXED_STATE = '__MIXED__' ;

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
SC.Control = {
  
  /** @private */
  initMixin: function() {
    this._control_contentDidChange() ; // setup content observing if needed.
  },
  
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
    The value represented by this control.
    
    Most controls represent a value of some type, such as a number, string
    or image URL.  This property should hold that value.  It is bindable
    and observable.  Changing this value will immediately change the
    appearance of the control.  Likewise, editing the control 
    will immediately change this value.
    
    If instead of setting a single value on a control, you would like to 
    set a content object and have the control display a single property
    of that control, then you should use the content property instead.

    @property {Object}
  */
  value: null,
  
  /**
    The content object represented by this control.
    
    Often you need to use a control to display some single aspect of an 
    object, especially if you are using the control as an item view in a
    collection view.
    
    In those cases, you can set the content and contentValueKey for the
    control.  This will cause the control to observe the content object for
    changes to the value property and then set the value of that property 
    on the "value" property of this object.
    
    Note that unless you are using this control as part of a form or 
    collection view, then it would be better to instead bind the value of
    the control directly to a controller property.
    
    @property {SC.Object}
  */
  content: null,
  
  /**
    The property on the content object that would want to represent the 
    value of this control.  This property should only be set before the
    content object is first set.  If you have a displayDelegate, then
    you can also use the contentValueKey of the displayDelegate.
    
    @property {String}
  */
  contentValueKey: null,
  
  /**
    Invoked whenever any property on the content object changes.  
    
    The default implementation will update the value property of the view
    if the contentValueKey property has changed.  You can override this
    method to implement whatever additional changes you would like.
    
    The key will typically contain the name of the property that changed or 
    '*' if the content object itself has changed.  You should generally do
    a total reset of '*' is changed.
    
    @param {Object} target the content object
    @param {String} key the property that changes
    @returns {void}
    @test in content
  */
  contentPropertyDidChange: function(target, key) {
    return this.updatePropertyFromContent('value', key, 'contentValueKey');
  },
  
  /**
    Helper method you can use from your own implementation of 
    contentPropertyDidChange().  This method will look up the content key to
    extract a property and then update the property if needed.  If you do
    not pass the content key or the content object, they will be computed 
    for you.  It is more efficient, however, for you to compute these values
    yourself if you expect this method to be called frequently.
    
    @param {String} prop local property to update
    @param {String} key the contentproperty that changed
    @param {String} contentKey the local property that contains the key
    @param {Object} content
    @returns {SC.Control} receiver
  */
  updatePropertyFromContent: function(prop, key, contentKey, content) {
    var all = key === '*';
    if (contentKey === undefined) {
      contentKey = "content%@Key".fmt(prop.capitalize());
    }
    if (content === undefined) content = this.get('content');
    
    // get actual content key
    contentKey = this[contentKey] ?
      this.get(contentKey) :
      this.getDelegateProperty(contentKey, this.displayDelegate) ;
    
    if (contentKey && (all || key === contentKey)) {
      var v = (content) ?
        (content.get ? content.get(contentKey) : content[contentKey]) :
        null ;
      this.set(prop, v) ;
    }
    return this ;
  },
  
  /**
    Relays changes to the value back to the content object if you are using
    a content object.
    
    This observer is triggered whenever the value changes.  It will only do
    something if it finds you are using the content property and
    contentValueKey and the new value does not match the old value of the
    content object.  
    
    If you are using contentValueKey in some other way than typically
    implemented by this mixin, then you may want to override this method as
    well.
    
    @returns {void}
  */
  updateContentWithValueObserver: function() {
    var key = this.contentValueKey ?
      this.get('contentValueKey') :
      this.getDelegateProperty('contentValueKey', this.displayDelegate) ;
    
    var content = this.get('content') ;
    if (!key || !content) return ; // do nothing if disabled
    
    // get value -- set on content if changed
    var value = this.get('value');
    if (typeof content.setIfChanged === SC.T_FUNCTION) {
      content.setIfChanged(key, value);
    } else {
      // avoid re-writing inherited props
      if (content[key] !== value) content[key] = value ;
    }
  }.observes('value'),
  
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
    return "ErrorLabel.%@".fmt(fk)
      .locWithDefault("FieldKey.%@".fmt(fk).locWithDefault(def)) ;
      
  }.property('fieldLabel','fieldKey').cacheable(),

  /**
    The control size.  This will set a CSS style on the element that can be 
    used by the current theme to vary the appearance of the control.
    
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
    var sel = this.get('isSelected'), disabled = !this.get('isEnabled');
    
    // update the CSS classes for the control.  note we reuse the same hash
    // to avoid consuming more memory
    var names = this._CONTROL_TMP_CLASSNAMES ; // temporary object
    names.mixed = sel === SC.MIXED_STATE;
    names.sel = sel && (sel !== SC.MIXED_STATE) ;
    names.active = this.get('isActive') ;
    context.setClass(names).addClass(this.get('controlSize'));
    
    // if the control implements the $input() helper, then fixup the input
    // tags
    if (!firstTime && this.$input) {
      this.$input().attr('disabled', disabled);
    }
  },
  
  /** @private
    This should be null so that if content is also null, the
    _contentDidChange won't do anything on init.
  */
  _control_content: null,
  
  /** @private
    Observes when a content object has changed and handles notifying 
    changes to the value of the content object.
  */
  _control_contentDidChange: function() {
    var content = this.get('content') ;
    if (this._control_content === content) return; // nothing changed
    
    var f = this.contentPropertyDidChange ;
    
    // remove an observer from the old content if necessary
    var old = this._control_content ;
    if (old && old.removeObserver) old.removeObserver('*', this, f) ;
    
    // add observer to new content if necessary.
    this._control_content = content ;
    if (content && content.addObserver) content.addObserver('*', this, f) ;
    
    // notify that value did change.
    this.contentPropertyDidChange(content, '*') ;
    
  }.observes('content')
  
};
