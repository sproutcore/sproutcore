// ========================================================================
// SproutCore
// copyright 2006-2008 Sprout Systems, Inc.
// ========================================================================

require('views/view') ;
require('views/container') ;

SC.TAB_VIEW_TAB_REGEXP = /Tab$/ ;

/** @class

  To use a TabView, just declare the views and buttons you want to manage
  as outlets.  Then set the "nowShowing" property to the name of view.

  View names comes from either the name of the view property or from the
  view's 'tabId' property, if it has one.  Declare tabs by adding properties 
  ending in 'Tab' and buttons ending in 'Button'
  
  @extends SC.ContainerView
*/
SC.TabView = SC.ContainerView.extend(
  /** @scope SC.TabView.prototype */
  {

  /** 
    set the tabId here that you to display minus the "Tab".  
    
    @type String
  */  
  nowShowing: '',
  
  /**
    instantiate tabs lazily as they are accessed.
    
    If set to true, tabs will be instanted from the SC.page object when they
    are first accessed.  If your tabs have complex content, using lazy tabs 
    can dramatically improve page load performance.
  
    @type Boolean
  */
  lazyTabs: false,
  
  
  // ...................................
  // INTERNAL
  //
  
  /** @private */
  init: function() {
    arguments.callee.base.call(this) ;
    
    // find outlets and build list of tabs and buttons.
    var tabs = {} ;
    var buttons = {} ;
    var view = this ;
    var loc = (this.outlets) ? this.outlets.length : 0 ;
    while(--loc >= 0) {
      var outlet = this.outlets[loc] ;
      // look for outlets ending in 'Tab'
      if (outlet.match(SC.TAB_VIEW_TAB_REGEXP)) { 
        var key = outlet.slice(0,-3) ; // remove 'Tab' 
        var tab = view.get(outlet) ; // find tab view
        var button = view.get(key + 'Button') ; // find button view (opt)
        if (tab) {
          // the key is either computed from the property name or from tabId.
          var tabId = tab.get('tabId') || key ;
          tabs[tabId] = tab ;
          if (button) buttons[tabId] = button ;          
          
          // also remove the tab from its parent view.
          if (tab.removeFromParent) tab.removeFromParent() ;
          
        } // if (tab)
      } // if (outlet.slice)
    } // while
    
    this._tabs = tabs; this._buttons = buttons ;
    this.nowShowingObserver() ; // swap in/out the appropriate views.
  },

  /** @private
      swaps the views in and out. 
  */
  nowShowingObserver: function() {
    var nowShowing = this.get('nowShowing') ;
    if (nowShowing == this._oldNowShowing) return ; // nothing to do.
    this._oldNowShowing = nowShowing ;
    for(var tabId in this._tabs) {
      var tab = this._tabs[tabId] ;
      var button = this._buttons[tabId] ;
      if (tabId == nowShowing) {
        if (button) button.set('isSelected',true) ;
      } else { 
        if (tab) tab.set('isVisible',false) ;
        if (button) button.set('isSelected',false) ;
      }      
    }
    
    var visibleTab = this._tabs[nowShowing] ;
    
    if (!visibleTab && this.get('lazyTabs')) {
      this._tabs[nowShowing] = visibleTab = SC.page.get('%@Tab'.fmt(nowShowing)) ;
    }
    
    this.set('content',visibleTab) ;
    if (visibleTab) { visibleTab.set('isVisible',true); }
    
  }.observes('nowShowing'),
  
  /**
    Used by SC.FormView to find child fields.
    
    The TabView removes its child views from the hierarchy on startup, which 
    can prevent a view such as SC.FormView, that search their children for 
    configuration information from working properly.  To work around this 
    problem, SC.FormView and other views will use this method to get the child
    views they should search instead of looking at childNodes directly.
  
    Note that if you use lazy tabs, form fields will not work because the tabs
    are not instantiated until they are accessed.
  */  
  childNodesForFormField: function() {
    return Object.values(this._tabs || {}) ;
  }
  
}) ;

