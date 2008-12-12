// ========================================================================
// SproutCore
// copyright 2006-2008 Sprout Systems, Inc.
// ========================================================================

/*global ViewBuilder */

require('views/view');

/** @class

  A Designer class provides the core editing functionality you need to edit
  a view in the UI.  When your app loads in design.mode, a peer Designer 
  instance is created for every view using the class method Designer or
  SC.ViewDesigner if the view class does not define a Designer class.
  
  Whenever you put your app into design mode, all events will be routed first
  to the peer designer for an object, which will have an opportunity to 
  prosent a design UI.

  Likewise, the designer palettes provided by the view builder will focus on 
  the designer instead of the view itself.

  @extends SC.Object
  @since SproutCore 1.0
*/
SC.ViewDesigner = SC.Object.extend({

  /** The view managed by this designer. */
  view: null,
  
  /** The class for the design.  Set when the view is created. */
  viewClass: null,
  
  /** Set to YES if the view is currently selected for editing. */
  designIsSelected: NO,

  /** 
    If set to NO, the default childView encoding will not run.  You can use
    this option, for example, if your view creates its own childViews.
    
    Alternatively, you can override the encodeChildViewsDesign() and 
    encodeChildViewsLoc() methods.
    
    @property {Boolean}
  */
  encodeChildViews: YES,
  
  concatenatedProperties: ['designProperties', 'localizedProperties'],

  // ..........................................................
  // GENERIC PROPERTIES
  // 
  // Adds support for adding generic properties to a view.  These will
  // overwrite whatever you write out using specifically supported props.
    
  // ..........................................................
  // HANDLE ENCODING OF VIEW DESIGN
  // 

  /**
    Encodes any simple properties that can just be copied from the view onto
    the coder.  This is used by encodeDesignProperties() and 
    encodeLocalizedProperties().
  */
  encodeSimpleProperties: function(props, coder) {
    console.log('encodeSimple: %@'.fmt(props));
    
    var view = this.get('view'), proto = this.get('viewClass').prototype ;
    props.forEach(function(prop) {
      var val = view[prop] ; // avoid get() since we don't want to exec props
      if (val !== undefined && (val !== proto[prop])) {
        coder.encode(prop, val) ;
      }
    }, this);
  },
  

  /** 
    Array of properties that can be encoded directly.  This is an easy way to
    add support for simple properties that need to be written to the design
    without added code.  These properties will be encoded by 
    encodeDesignProperties().
    
    You can add to this array in your subclasses.
  */
  designProperties: 'isVisible isEnabled styleClass'.w(),
  
  /** 
    Invoked by a design coder to encode design properties.  The default 
    implementation invoked encodeDesignProperties() and 
    encodeChildViewsDesign().  You can override this method with your own 
    additional encoding if you like.
  */
  encodeDesign: function(coder) {
    coder.set('className', SC._object_className(this.get('viewClass')));
    this.encodeDesignProperties(coder);
    this.encodeChildViewsDesign(coder);

    // finally, emit the rootElementPath.
    var view = this.get('view'), parentView = view.get('parentView');
    console.log('parentView = %@'.fmt(parentView));
    if (parentView) {
      var el = view.rootElement, parentRoot = parentView.rootElement;
      var path = [], nodes ;
      
      while(el && el !== parentRoot) {
        // find the index of the parentNode
        nodes = SC.$A(el.parentNode.childNodes);
        path.unshift(nodes.indexOf(el)); // get the index...
        
        // go up a level...
        el = el.parentNode ;
      }
      
      coder.array('rootElementPath', path);
      nodes = el = parentRoot = path = null; // avoid memory leaks
    }

    return YES ;
  },

  /**
    Encodes the design properties for the view.  These properties are simply
    copied from the view onto the coder.  As an optimization, the value of 
    each property will be checked against the default value in the class. If
    they match, the property will not be emitted.
  */
  encodeDesignProperties: function(coder) {
    return this.encodeSimpleProperties(this.get('designProperties'), coder);
  },
  
  /**
    Encodes the design for child views.  The default implementation loops 
    through child views.  If you store your child views elsewhere in your 
    config (for example as named properties), then you may want to override
    this method with your own encoding.
  */
  encodeChildViewsDesign: function(coder) {
    if (!this.get('encodeChildViews')) return;
    var view = this.view, childViews = view.childViews;
    if (childViews.length>0) coder.object('childViews', childViews);
  },

  /** 
    Array of localized that can be encoded directly.  This is an easy way to
    add support for simple properties that need to be written to the 
    localization without added code.  These properties will be encoded by 
    encodeLocalizedProperties().
    
    You can add to this array in your subclasses.
  */
  localizedProperties: ['layout'],
  
  /** 
    Invoked by a localization coder to encode design properties.  The default 
    implementation invoked encodeLocalizedProperties() and 
    encodeChildViewsLoc().  You can override this method with your own 
    additional encoding if you like.
  */
  encodeLoc: function(coder) {
    coder.set('className', SC._object_className(this.get('viewClass')));
    this.encodeLocalizedProperties(coder);
    this.encodeChildViewsLoc(coder);
    return YES ;
  },

  /**
    Encodes the localized properties for the view.  These properties are 
    simply copied from the view onto the coder.  As an optimization, the value 
    of  each property will be checked against the default value in the class. 
    If they match, the property will not be emitted.
  */
  encodeLocalizedProperties: function(coder) {
    return this.encodeSimpleProperties(this.get('localizedProperties'),coder);
  },
  
  /**
    Encodes the design for child views.  The default implementation loops 
    through child views.  If you store your child views elsewhere in your 
    config (for example as named properties), then you may want to override
    this method with your own encoding.
  */
  encodeChildViewsLoc: function(coder) {
    if (!this.get('encodeChildViews')) return;
    var view = this.view, childViews = view.childViews;
    if (childViews.length>0) coder.object('childViews', childViews);
  },

  /**
    This method is invoked when the designer is instantiated.  You can use 
    this method to reload any state saved in the view.  This method is called
    before any observers or bindings are setup to give you a chance to 
    configure the initial state of the designer.
  */
  awakeDesign: function() {},
  
  // ..........................................................
  // VIEW RELAYING
  // 
  // View property changes relay automatically...
  
  /**
    Invoked whenever the view changes.  This will observe all property 
    changes on the new view.
  */
  viewDidChange: function() {
    var view = this.get('view'), old = this._designer_view ;
    if (view === old) return; // nothing to do

    var func = this.viewPropertyDidChange ;
    if (old) old.removeObserver('*', this, func);
    this._designer_view = view ;
    if (view) view.addObserver('*', this, func);
    this.viewPropertyDidChange(view, '*', null, null);
  }.observes('view'),
  
  /**
    Invoked whenever a property on the view has changed.  The passed key will
    be '*' when the entire view has changed.  The default implementation here
    will notify the property as changed on the reciever if the 
    property value is undefined on the reciever.
    
    It will notify all properties changed for '*'.  You may override this 
    method with your own behavior if you like.
  */
  viewPropertyDidChange: function(view, key) {
    if (key === '*') {
      this.allPropertiesDidChange();
    } else if (this[key] === undefined) {
      this.notifyPropertyChange(key) ;
    }
  },
  
  /**
    The unknownProperty handler will pass through to the view by default. 
    This will often provide you the support you need without needing to 
    customize the Designer.  Just make sure you don't define a conflicting
    property name on the designer itself!
  */
  unknownProperty: function(key, value) {
    if (value !== undefined) {
      this.view.set(key, value);
      return value ;
    } else return this.view.get(key);
  },
  
  // ......................................
  // PRIVATE METHODS
  //
  
  init: function() {
    
    // setup design from view state...
    this.awakeDesign();
    
    // setup bindings, etc
    sc_super();
    
    // now add observer for property changes on view to relay change out.
    this.viewDidChange();
  },

  destroy: function() {
    sc_super();
    this.set('view', null); // clears the view observer...  
  },
  
  designIsSelectedDidChange: function() {
    var isSel = this.get('designIsSelected');
    this.view.$().css('outline', (isSel) ? '1px red solid' : 'none');  
  }.observes('designIsSelected'),
  
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
    this.set('designIsSelected', YES);
    return YES ;
  }
  
}) ;

// Set default Designer for view
if (!SC.View.Designer) SC.View.Designer = SC.ViewDesigner ;

// ..........................................................
// DESIGN NOTIFICATION METHODS
//
// These methods are invoked automatically on the designer class whenever it 
// is loaded.

SC.ViewDesigner.mixin({

  /**
    Invoked whenever a designed view is loaded.  This will save the design
    attributes for later use by a designer.
  */
  didLoadDesign: function(designedView, sourceView, attrs) {
    designedView.isDesign = YES ; // indicates that we need a designer.
  },

  /**
    Invoked whenever a location is applied to a designed view.  Saves the 
    attributes separately for use by the design view.
  */
  didLoadLocalization: function(designedView, attrs) {
    // nothing to do for now.
  },
  
  /**
    Invoked whenver a view is created.  This will create a peer designer if 
    needed.
  */
  didCreateView: function(view, attrs) {
    // add designer if page is in design mode
    var page = view.get('page'), design = view.constructor;
    
    if (design.isDesign && page && page.get('needsDesigner')) {
      
      // find the designer class
      var cur = design;
      while(cur && !cur.Designer) cur = cur.superclass;
      var DesignerClass = (cur) ? cur.Designer : SC.View.Designer;
      
      // next find the first superclass view that is not a design (and a real
      // class).  This is important to make sure that we can determine the 
      // real name of a view's class.
      while (design && design.isDesign) design = design.superclass;
      if (!design) design = SC.View;
      
      view.designer = DesignerClass.create({
        view: view,
        viewClass: design
      });
    }
  }
  
});

// ..........................................................
// FIXUP SC.View
// 

/** 
  If the view has a designer, give it an opportunity to handle an event 
  before passing it on to the main view.
*/
SC.View.prototype.tryToPerform = function(methodName, arg1, arg2) {
  if (this.designer) {
    return this.designer.tryToPerform(methodName, arg1, arg2);
  } else {
    return SC.Object.prototype.tryToPerform.apply(this, arguments);
  }
} ;

