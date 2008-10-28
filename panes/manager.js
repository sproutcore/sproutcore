// ========================================================================
// SproutCore
// copyright 2006-2008 Sprout Systems, Inc.
// ========================================================================

require('views/view') ;

// The PaneManager is responsible for displaying pane that appear over your
// regular content.  You can register your own pane types by calling 
// PaneManager.registerPane('type',PaneClass) on app load.
//
// One instance of the PaneManager view is created the first time you try
// to show a pane.
SC.PaneManager = SC.View.extend({

  emptyElement: '<div id="panes"></div>',
  
  // this method will show a pane.  Pass the content view and the paneType.
  // if the pane is already visible, it will be hidden first.  The optional
  // event and root element will be set as properties on the wrapper pane
  // before the pane is made visible so that it can position itself.
  showPaneView: function(view, paneType, anchorView, triggerEvent) {

    // if pane is already showing, hide the pane first...
    this.hidePaneView(view) ;
    
    // now get a pane instance for the specified paneType and add view to it.
    var pane = this.getPaneFor(paneType) ;
    pane._managedPaneType = paneType ;
    pane.set('anchorView',anchorView) ;
    pane.set('triggerEvent',triggerEvent) ;
    pane.set('isVisible', false) ;
    this._visiblePanes[view._guid] = pane ;
    
    // look through child views (which are panes).  Insert before first pane
    // with a layer value > this pane.
    var child= this.get('firstChild') ;
    var layer = pane.get('layer');
    while(child && (child.get('layer') <= layer)) {
      child = child.get('nextSibling');
    }

    this.insertBefore(pane, child);

    // if this pane is not visible, make it visible too.
    this.set('isVisible',true) ;
    
    // and make target pane visible, but set visibility hidden.
    // visibility hidden will be turned off when the view is fully configured.
    pane.setStyle({ visibility: 'hidden' }) ;
    pane.set('isVisible',true) ;

    
    this._setApplicationKeyPane();

    // set content on view.
    pane.set('content',view);
  },
  
  // this method will hide a visible pane view.  Pass the content view. If
  // the view is not already visible, this will do nothing.
  hidePaneView: function(view) {
    var pane = this._visiblePanes[view._guid] ;
    if (!pane) return ;
    
    // make pane not visible then do the rest of the cleanup when that
    // finishes.
    pane.addObserver('displayIsVisible', this._boundPaneDidHide) ;
    pane.set('isVisible', false) ;
  },

  // this method will return a pave view for the specified type.  If no panes
  // of the type exist in the pane cache, then a new pane will be created.
  getPaneFor: function(paneType) {
    var panes = this._paneCache[paneType] ;
    var pane = (panes) ? panes.pop() : null ;
    if (pane) return pane ;
    
    // no pane found in cache.  Build one instead.  First look for class in
    // set of registered pane types.  If that doesn't work, build class name.
    var paneClass = this._paneTypes[paneType] ;
    if (!paneClass) paneClass = SC[paneType.classify() + 'PaneView'] ;
    if (!paneClass) {
      throw "no matching class found for pane type '%@'".fmt(paneType);
    }
    
    // now create an instance.
    pane = paneClass.viewFor(null) ;
    return pane ;
  },
  
  // this method will add the pane instance to the pane cache for later use.
  returnToCache: function(pane, paneType) {
    var panes = this._paneCache[paneType] || [] ;
    panes.push(pane) ;
    this._paneCache[paneType] = panes;   
  },
  
  // this method is called by the pane when it finishes hiding itself.
  _paneDidHide: function(pane) {
    var visible = pane.get('displayIsVisible') ;
    if (visible) return ;
    
    // remove this observer and remove pane from parent view.
    pane.removeObserver('displayIsVisible', this._boundPanelDidHide) ;
    pane.removeFromParent() ;

    // now remove content view from pane and return pane to cache.
    pane.set('content', null) ;
    this.returnToCache(pane,pane._managedPaneType) ;
    
    // if there are no more panes left visible, hide pane manager as well.
    if (this.get('firstChild') == null) {
      this.set('isVisible',false) ;
    }
    
    this._setApplicationKeyPane();
  },
  
  /**
  * @todo Need to move this (and all of the pane display/hide interface) into SC.Application
  */
  _setApplicationKeyPane: function()
  {
    // ensure that the frontmost pane is the key pane
    // we're making a lot of assumptions here... need to create a some unit tests that:
    //    lastChild is always a pane view
    //    calling makeKeyPane indiscriminately will have no ill effect (currently it's fine)
    var frontMostPane = this.get('lastChild');
    if (frontMostPane && frontMostPane.get('isVisible')) {
      frontMostPane.makeKeyPane();
    } else {
      var pane = SC.app.get('mainPane');
      if (pane) pane.makeKeyPane();
    }
  },
  
  // on init, add to main HTML page if not already added.
  init: function() {
    sc_super() ;
    var el = this.rootElement ;
    if (!this.parentNode) {
      $tag('body').insertBefore(el, null) ;
      SC.window.insertBefore(this, null) ;
    }
    this.set('isVisible',false) ;
    this._boundPaneDidHide = this._paneDidHide.bind(this) ;
  },
  
  // registered panes.
  _paneTypes: {},
  _paneCache: {}, // unused pane instances stored by paneType.
  _visiblePanes: {} // panes stored by views
}) ;

SC.PaneManager.registerPaneType = function(paneType, paneClass) {
  SC.PaneManager.prototype._paneTypes[paneType] = paneClass ;  
} ;

// This will create the manager instance if it does not already exist.
SC.PaneManager.manager = function() {
   if (!this._manager) this._manager = SC.PaneManager.viewFor('panes') ;
   return this._manager ;
}; 
