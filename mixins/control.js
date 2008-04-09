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
    content object is first set.  If you have a collectionDelegate, then
    you can also use the contentValueProperty of the collectionDelegate.
  */
  contentValueProperty: null,
  
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
    if (!this._boundContentValueDidChangeObserver) {
      this._boundContentValueDidChangeObserver = this._contentValueDidChangeObserver.bind(this) ;
    }
    var f = this._boundContentValueDidChangeObserver ;

    // remove an observer from the old content if necessary
    if (this._content && this._contentValueProperty) {
      this._content.removeObserver(this._contentValueProperty, f) ;
    }
    
    // add observer to new content if necessary.
    var del = this.collectionDelegate ;
    this._contentValueProperty = this.getDelegateProperty(del, 'contentValueProperty');
    this._content = content ;
    if (this._content && this._contentValueProperty) {
      this._content.addObserver(this._contentValueProperty, f) ;
    }
    
    // notify that value did change.
    this._contentValueDidChangeObserver() ;
    
  }.observes('content'),
  
  // Invoked when the content value changes.  Collect the new value 
  // and invoke contentValueDidChange.
  _contentValueDidChangeObserver: function() {
    var content = this.get('content') ; 
    var value = (content && this._contentValueProperty) ? content.get(this._contentValueProperty) : content ;
    if (value != this._contentValue) {
      this._contentValue = value ;
      this.set('value', value) ;
    }
  }
    
};
