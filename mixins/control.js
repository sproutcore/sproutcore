// ========================================================================
// SproutCore
// copyright 2006-2007 Sprout Systems, Inc.
// ========================================================================

/**
  A Control is a view that also implements some basic state functionality.
  Apply this mixin to any view that you want to have standard control
  functionality including showing a selected state, enabled state, focus
  state, etc.
  
  To use this mixin, apply it to your view and invoke initControl() from 
  your init method.
  
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
  "content" and "contentValueProperty" properties of the control.  The 
  "content" property is the content object you want to manage, while the 
  "contentValueProperty" is the name of the property on the content object 
  you want the control to display.  
  
  The default implementation of the Control mixin will essentially map the
  contentValueProperty of a content object to the value property of the 
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
  
  @namespace
*/
SC.Control = {
  
  /**
    Performs necessary setup on your view for use as a control.  Always
    call this method from your init() method.
  */
  initControl: function() {
    this._contentObserver(); // setup content observing if needed.
  },
  
  /** 
    Set to true when the item is selected. 
    
    This property is observable and bindable.
  */
  isSelected: false,

  /** 
    Set to true when the item is enabled. 
    
    This property is observable and bindable.
  */
  isEnabled: true,
  
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
  */
  value: null,
  
  /**
    The content object represented by this control.
    
    Often you need to use a control to display some single aspect of an 
    object, especially if you are using the control as an item view in a
    collection view.
    
    In those cases, you can set the content and contentValueProperty for the
    control.  This will cause the control to observe the content object for
    changes to the value property and then set the value of that property 
    on the "value" property of this object.
    
    Note that unless you are using this control as part of a form or 
    collection view, then it would be better to instead bind the value of
    the control directly to a controller property.
  */
  content: null,
  
  /**
    The property on the content object that would want to represent the 
    value of this control.  This property should only be set before the
    content object is first set.  If you have a displayDelegate, then
    you can also use the contentValueProperty of the displayDelegate.
  */
  contentValueProperty: null,

  /**
    Invoked whenever any property on the content object changes.  
    
    The default implementation will update the value property of the view
    if the contentValueProperty property has changed.  You can override this
    method to implement whatever additional changes you would like.
    
    @param {Object} target the content object
    @param {String} key the property that changes
  */
  contentPropertyDidChange: function(target, key) {
    if (!!this._contentValueProperty && ((key == this._contentValueProperty) || (key == '*'))) {
      var content = this.get('content') ;
      var value = (content) ? content.get(this._contentValueProperty) : null;
      if (value != this._contentValue) {
        this._contentValue = value ;
        this.set('value', value) ;
      }
    }
  },
  
  /** @private
    By default, adds the 'sel' CSS class if selected. 
  */
  _isSelectedObserver: function() {
    this.setClassName('sel', this.get('isSelected')) ;
  }.observes('isSelected'),
  
  /** @private
    By default, adds the disabled CSS class if disabled. 
  */
  _isEnabledObserver: function() {
    this.setClassName('disabled', !this.get('isEnabled'));
  }.observes('isEnabled'),
  
  /** @private
    Add a focus CSS class whenever the view has first responder status. 
  */
  _isFocusedObserver: function() {
    this.setClassName('focus', this.get('isFirstResponder')) ;
  }.observes('isFirstResponder'),
  
  // This should be null so that if content is also null, the
  // _contentObserver won't do anything on init.
  _content: null,
  
  /** @private
    Observes when a content object has changed and handles notifying 
    changes to the value of the content object.
  */
  _contentObserver: function() {
    var content = this.get('content') ;
    if (this._content == content) return; // nothing changed
    
    // create bound observer function
    if (!this._boundContentPropertyDidChangeObserver) {
      this._boundContentPropertyDidChangeObserver = this.contentPropertyDidChange.bind(this) ;
    }
    var f = this._boundContentPropertyDidChangeObserver ;

    // remove an observer from the old content if necessary
    if (this._content) {
      this._content.removeObserver('*', f) ;
    }

    // cache for future use
    var del = this.displayDelegate ;
    this._contentValueProperty = this.getDelegateProperty(del, 'contentValueProperty');

    
    // add observer to new content if necessary.
    this._content = content ;
    if (this._content) {
      this._content.addObserver('*', f) ;
    }
    
    // notify that value did change.
    this.contentPropertyDidChange(this._content, '*') ;
    
  }.observes('content')
      
};
