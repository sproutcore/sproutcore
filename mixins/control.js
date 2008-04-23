// ========================================================================
// SproutCore
// copyright 2006-2008 Sprout Systems, Inc.
// ========================================================================

/**
  Indicates a value has a mixed state of both on and off.
*/
SC.MIXED_STATE = '__MIXED__' ;

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
  
*/
SC.Control = {
  
  initMixin: function() {
    this._contentObserver(); // setup content observing if needed.
    this.isSelectedObserver() ;
    this.isEnabledObserver() ;
    this.isFocusedObserver(); 
  },
  
  /** 
    Set to true when the item is selected. 
    
    This property is observable and bindable.
  */
  isSelected: false,
  isSelectedBindingDefault: SC.Binding.OneWayBool,

  /** 
    Set to true when the item is enabled. 
    
    This property is observable and bindable.
  */
  isEnabled: true,
  isEnabledBindingDefault: SC.Binding.OneWayBool,
  
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
    
    In those cases, you can set the content and contentValueKey for the
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
    you can also use the contentValueKey of the displayDelegate.
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
  */
  contentPropertyDidChange: function(target, key) {
    if (!!this._contentValueKey && ((key == this._contentValueKey) || (key == '*'))) {
      var content = this.get('content') ;
      var value = (content) ? content.get(this._contentValueKey) : null;
      if (value != this._contentValue) {
        this._contentValue = value ;
        this.set('value', value) ;
      }
    }
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
  */
  updateContentWithValueObserver: function() {
    if (!this._contentValueKey) return; // do nothing if disabled

    // get value.  return if value matches current content value.
    // this avoids infinite loops where setting the value from the content
    // in turns sets the content and so on.
    var value = this.get('value') ;
    if (value == this._contentValue) return ; 

    var content = this.get('content') ;
    if (!content) return; // do nothing if no content.
    
    // passed all of our checks, update the content (and the _contentValue
    // to avoid infinite loops)
    this._contentValue = value ;
    content.set(this._contentValueKey, value) ;
    
  }.observes('value'),
  
  /**
    Default observer for selected state changes
    
    The default will simply add either a "mixed" or "sel" class name to the
    root element of your view based on the state. You can override this with
    your own behavior if you prefer.
  */
  isSelectedObserver: function() {
    var sel = this.get('isSelected') ;
    this.setClassName('mixed', sel == SC.MIXED_STATE) ;
    this.setClassName('sel', sel && (sel != SC.MIXED_STATE)) ;
  }.observes('isSelected'),
  
  /**
    Default observer for the isEnabled state.
    
    The default will simply add or remove a "disabled" class name to the root 
    element of your view based on the state.  You can override this with your
    own behavior if you prefer.
  */
  isEnabledObserver: function() {
    var disabled = !this.get('isEnabled') ;
    this.setClassName('disabled', disabled);

    // set disabled attr as well if relevant
    if (this.rootElement && (this.rootElement.disabled !== undefined) && (this.rootElement.disabled != disabled)) {
      this.rootElement.disabled = disabled ;
    }
  }.observes('isEnabled'),

  /**
    Default observer for the isFirstResponder state.
    
    The default will add or remove a "focus" class name ot the root element
    of your view based on the state.  You can override this with your own
    behavior if you prefer.
  */
  isFocusedObserver: function() {
    this.setClassName('focus', !!this.get('isFirstResponder')) ;
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
    if (this._content && this._content.removeObserver) {
      this._content.removeObserver('*', f) ;
    }

    // cache for future use
    var del = this.displayDelegate ;
    this._contentValueKey = this.getDelegateProperty(del, 'contentValueKey');

    
    // add observer to new content if necessary.
    this._content = content ;
    if (this._content && this._content.addObserver) {
      this._content.addObserver('*', f) ;
    }
    
    // notify that value did change.
    this.contentPropertyDidChange(this._content, '*') ;
    
  }.observes('content')
      
};
