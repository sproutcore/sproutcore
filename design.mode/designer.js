// ========================================================================
// SproutCore
// copyright 2006-2008 Sprout Systems, Inc.
// ========================================================================

require('views/view');

/** 
  A Designer instance is created for each view that is setup in design mode.
  The designer is given the opportunity to handle all incoming mouse or 
  keyboard events before it is passed onto the view itself.  This gives you
  the ability to show custom handles, etc.
*/
SC.View.Designer = SC.Object.extend({

  /** The view managed by this designer. */
  view: null,
  
  /** Set to YES if the view is currently selected for editing. */
  isSelected: NO,

  /** Attributes that should be saved when the view is saved. */
  attributes: {},

  /** 
    Array of properties that map directly to the designAttributes hash. 
    These proeperties can be bound automatically.
  */
  designProperties: ['layout'],
  
  concatenatedProperties: ['designProperties'],
  
  // ......................................
  // PRIVATE METHODS
  //
  
  init: function() {

    // set initial value from designProperties.  Do this BEFORE observers and
    // bindings are configured.
    var keys = this.designProperties, attrs = this.attributes ;
    if (keys) {
      keys.forEach(function(key) { this[key] = attrs[key]; }, this);
    }

    // setup bindings, etc
    sc_super();
    
    // now add observer
    if (keys) {
      keys.forEach(function(key) { 
        this.addObserver(key, this, this.designPropertyDidChange); 
      }, this) ;
    }
  },

  /** 
    Invoked whenever a design property changes.  This will copy the property
    to the designAttributes method.  It will also set the same property on 
    the target view.
  */
  designPropertyDidChange: function(target, key) {
    var value = this.get(key) ;
    var attrs = this.attributes, view =this.view;
    
    // save in designAttributes
    if (attrs) {
      this.propertyWillChange('attributes') ;
      attrs[key] = value ; // save in designAttributes
      this.propertyDidChange('attributes') ;
    }
    
    // save in view
    if (view) view.set(key, value) ;
  }.observes('layout'),
  
  tryToPerform: function(methodName, arg1, arg2) {
    // only handle event if we are in design mode
    var page = this.view ? this.view.get('page') : null ;
    var isDesignMode = page ? page.get('isDesignMode') : NO ;

    // if we are in design mode, route event handling to the designer
    // otherwise, invoke default method.
    if (isDesignMode) {
      return sc_super();
    } else {
      return SC.Object.prototype.tryToPerform.apply(this.view, arguments);
    }
  },
    
  mouseDown: function(evt) {
    
  }
  
}) ;
