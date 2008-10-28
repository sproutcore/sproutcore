// ========================================================================
// SproutCore
// copyright 2006-2008 Sprout Systems, Inc.
// ========================================================================

require('views/view') ;
require('views/container') ;

/**
  @class Manages the panels on a page.
  
  To make a view into a panel, just set the isPanel property on it.  To 
  customize how panels are shown in your application, override the showPanel()
  and hidePanel() methods.

  @extends SC.View
*/
SC.PanelView = SC.View.extend(
  /** @scope SC.PanelView.prototype */
  {
  
  emptyElement: '<div id="panels" class="panels"><div class="overlay"></div></div>',

  // Override this property to incldue an example view all panels
  // will be wrapped in.  The view must have a 'content' property that will
  // be set to the view to show.
  wrapperView: SC.ContainerView.extend({
    emptyElement: '<div class="panel"><div class="root"></div><div class="top-left-edge"></div><div class="top-edge"></div><div class="top-right-edge"></div><div class="right-edge"></div><div class="bottom-right-edge"></div><div class="bottom-edge"></div><div class="bottom-left-edge"></div><div class="left-edge"></div></div>',
    
    outlets: ['rootView'],
    rootView: SC.View.outletFor('.root?')
  }),
  
  // this is filled with instances of the the wrapperView so we don't have
  // to recreate them all the time.
  _wrapperPool: null,

  // this is used to get a new wrapper.
  _getWrapperView: function() {
    var ret = this._wrapperPool.pop() ;
    if (ret) return ret ;
    ret = this.wrapperView.viewFor() ;

    if (ret.visibleAnimation) {
      var va = Object.clone(ret.visibleAnimation) ;
      va.onComplete = this.hidePanelDidComplete.bind(this) ;
      ret.visibleAnimation = va ;
    }

    return ret ;
  },
  
  // ...................................
  // SHOWING AND HIDING VIEWS
  //

  locationFor: function(view,evt) {
    return { top: '50px', left: 'auto' } ;
  },
  
  // this is the method called by the view to show itself as a popup.
  showPanel: function(view,evt) {
    var wrapperView = this._getWrapperView() ;
    
    // setup popupView.
    wrapperView.set('animateVisible',false) ;
    wrapperView.set('isVisible',false) ;
    wrapperView.set('content',view) ; // set the popup view.
    wrapperView.setClassName('standard-panel', !(view.get('hasCustomPanelWrapper') || false));
    view._wrapperView = wrapperView ;

    // The dimensions of the panel cannot be computed until it is actually
    // added to the document.  Turn off animation and add view with visiblity
    // set to hidden so we can get dimensions.
    this.nowShowing.push(view) ;
    this.appendChild(wrapperView) ;
    this.set('isVisible',true) ; // show panels
    
    wrapperView.setStyle({ visibility: 'hidden' }) ;
    wrapperView.set('isVisible',true) ; // show the panel
    
    var dim = Element.getDimensions(view.rootElement) ;
    wrapperView.setStyle(this.locationFor(view,evt)) ;

    wrapperView.set('isVisible',false) ;
    wrapperView.setStyle({ width: dim.width+'px', visibility: 'visible' });
    
    wrapperView.set('animateVisible',true);
    wrapperView.set('isVisible',true) ;
  },
  
  hidePanel: function(view) {
    var didHideWrapperView = null ;

    // clear view
    if (view._wrapperView) {
      if (view._wrapperView.visibleAnimation) {
      } else {
        didHideWrapperView = view._wrapperView ;
      }
      view._wrapperView.set('isVisible',false) ;
      view._wrapperView = null ;
    }
    
    // now remove from list of popups and hide pane (maybe)
    this.nowShowing = this.nowShowing.without(view) ;
    if (didHideWrapperView) this.hidePanelDidComplete(didHideWrapperView) ;
  },

  hidePanelDidComplete: function(wrapperView) {
    if (wrapperView.get('isVisible') != false) return ;
    if (wrapperView) {
      wrapperView.set('content',null) ;
      this._wrapperPool.push(wrapperView) ;
    }
    if (this.nowShowing.length <= 0) this.set('isVisible',false);
  },
  
  init: function() {
    arguments.callee.base.call(this) ;
    this.nowShowing = [] ;
    this._wrapperPool = [] ;
  },
  
  // ...................................
  // SHOWING AND HIDING THE POPUP PANEL
  //  
  
  panelStyle: { 
    zIndex: '10000', 
    visibility: 'visible', 
    position: 'absolute', 
    top: '0', 
    left: '0', 
    width: '100%', 
    height: '100%', 
    overflow: 'hidden' 
  },
  
  showView: function() {
    
    // add panel to body node if it has not been added already.
    var bodyNode = $tag('body');
    if (this.rootElement.parentNode != bodyNode) bodyNode.appendChild(this.rootElement) ;
    this.setStyle(this.panelStyle) ;
    if (!SC.isIE7() && bodyNode) Element.addClassName(bodyNode, 'under-panel') ;
  },
  
  hideView: function() {
    var bodyNode = $tag('body');
    this.setStyle({ zIndex: '-10000', visibility: 'hidden' }) ;
    if (!SC.isIE7() && bodyNode) Element.removeClassName(bodyNode, 'under-panel') ;
  },
  
  // if the user clicks outside the top popup, then dismiss the popup unless
  // it is modal.
  didClick: function(ev) {
    if (this.nowShowing.length == 0) return ; // nothing to do.
    
    // find the top-most popup
    var topPanel = this.nowShowing[this.nowShowing.length-1] ;
    var tgt = Event.element(ev) ;
    var tgtView = $view(tgt) ;
    
    var view = topPanel._wrapperView ;
    while(tgt && (tgt != this.rootElement) && (tgtView != view)) {
      tgt = tgt.parentNode ;
      tgtView = (tgt) ? $view(tgt) : null ;
    }
    
    // may dismiss if clicked outside of topPopup and isModal == false
    if ((tgtView != view) && (!topPanel.get('isModal'))) {
      topPanel.set('isVisible',false) ;
    }
  }
    
}) ;

SC.callOnLoad(function() { 
  if (!SC.page) SC.page = SC.Page.create() ;
  SC.page.panels = SC.PanelView.outletFor(null); 
}) ;
