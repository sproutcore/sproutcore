// ========================================================================
// SproutCore
// copyright 2006-2008 Sprout Systems, Inc.
// ========================================================================

/*global ViewBuilder */

require('views/view');

/** 
  A Designer class provides the core editing functionality you need to edit
  a view in the UI.  When your app loads in design.mode, a peer Designer 
  instance is created for every view for which the class method hasDesigner
  is YES.
  
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
  
  /**
    Generates the JavaScript to rebuild a view.
  */
  encode: function() {
    var attrs = SC.clone(this.attributes), view =this.view ;
    var childViews = [];
    view.childViews.forEach(function(view) {
      if (view.designer) childViews.push(view.designer.encode());
    },this);
    if (childViews.length>0) attrs.childViews = childViews ;
    attrs = this.encodeAttributes(attrs) ;
    return "%@.build(%@)".fmt(this.viewClass.toString(), attrs);
  },
  
  encodeAttributes: function(attrs) {
    var ret = null ;
    switch(SC.typeOf(attrs)) {
    case SC.T_STRING:
      ret = attrs;
      break ;
    case SC.T_ARRAY:
      ret = '[%@]'.fmt(attrs.map(function(x) { 
        return this.encodeAttributes(x); 
      },this).join(','));
      break ;
    case SC.T_HASH:
      ret = [];
      for(var key in attrs) {
        if (!attrs.hasOwnProperty(key)) continue ;
        if (key === 'rootElement') continue ;
        if (key === 'childViews') continue ;
        ret.push([key, this.encodeAttributes(attrs[key])].join(':')) ;
      }
      ret = "{%@}".fmt(ret.join(','));
      break ;
    case SC.T_NULL:
      ret = 'null';
      break;
    case SC.T_UNDEFINED:
      ret = 'undefined';
      break ;
    default:
      ret = attrs.toString();
    }
    return ret ;
  },
  
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
  
  isSelectedDidChange: function() {
    var isSel = this.get('isSelected');
    this.view.$().css('outline', (isSel) ? '1px red solid' : 'none');  
  }.observes('isSelected'),
  
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
    ViewBuilder.masterController.select([this], (evt.altKey || evt.shiftKey));
  }
  
}) ;
