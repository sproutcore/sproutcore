// ========================================================================
// SproutCore
// copyright 2006-2008 Sprout Systems, Inc.
// ========================================================================

/*global ViewBuilder */

require('views/view');

/** 
  A Designer class provides the core editing functionality you need to edit
  a view in the UI.  When your app loads in design.mode, a peer Designer 
  instance is created for every view using the class method Designer or
  SC.View.Designer if the view class does not define a Designer class.
  
  Whenever you put your app into design mode, all events will be routed first
  to the peer designer for an object, which will have an opportunity to 
  prosent a design UI.
  
  @class
  @extends SC.Object
  @since SproutCore 1.0
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
    to the attributes hash.  It will also set the same property on 
    the target view.
  */
  designPropertyDidChange: function(target, key) {
    var value = this.get(key) ;
    var attrs = this.attributes, view =this.view;
    
    // save in attributes
    if (attrs) {
      this.propertyWillChange('attributes') ;
      attrs[key] = value ; // save in attributes
      this.propertyDidChange('attributes') ;
    }
    
    // save in view
    if (view) view.set(key, value) ;
  }.observes('layout'),
  
  isSelectedDidChange: function() {
    var isSel = this.get('isSelected');
    this.view.$().css('outline', (isSel) ? '1px red solid' : 'none');  
  }.observes('isSelected'),
  
  tryToPerform: function(methodName, arg1, arg2) {
    console.log('tryToPerform called');
    // only handle event if we are in design mode
    var page = this.view ? this.view.get('page') : null ;
    var isDesignMode = page ? page.get('needsDesigner') || page.get('isDesignMode') : NO ;

    // if we are in design mode, route event handling to the designer
    // otherwise, invoke default method.
    if (isDesignMode) {
      return sc_super();
    } else {
      return SC.Object.prototype.tryToPerform.apply(this.view, arguments);
    }
  },
    
  mouseDown: function(evt) {
    console.log('mouseDown called');
    this.set('isSelected', YES);
    // ViewBuilder.masterController.select([this], (evt.altKey || evt.shiftKey));
  }
  
}) ;
