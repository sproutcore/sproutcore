// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2010 Sprout Systems, Inc. and contributors.
//            Portions ©2008-2010 Apple Inc. All rights reserved.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================

sc_require('views/segmented');

SC.TOP_LOCATION = 'top';
SC.TOP_TOOLBAR_LOCATION = 'top-toolbar';
SC.BOTTOM_LOCATION = 'bottom';

/** 
  @class

  Incorporates a segmented view and a container view to display the selected
  tab.  Provide an array of items, which will be passed onto the segmented
  view.
  
  @extends SC.View
  @since SproutCore 1.0
*/
SC.TabView = SC.View.extend(
/** @scope SC.TabView.prototype */ {

  classNames: ['sc-tab-view'],
  
  displayProperties: ['nowShowing'],

  // ..........................................................
  // PROPERTIES
  // 

 /** 
    Set nowShowing with the page you want to display.
  */
  nowShowing: null,
  
  items: [],
  
  isEnabled: YES,
  
  itemTitleKey: null,
  itemValueKey: null,
  itemIsEnabledKey: null,
  itemIconKey: null,
  itemWidthKey: null,
  itemToolTipKey: null,
  tabHeight: SC.REGULAR_BUTTON_HEIGHT,
  
  tabLocation: SC.TOP_LOCATION,
  
  /** 
    If set, then the tab location will be automatically saved in the user
    defaults.  Browsers that support localStorage will automatically store
    this information locally.
  */
  userDefaultKey: null,
  
  
  // ..........................................................
  // FORWARDING PROPERTIES
  // 
  
  // forward important changes on to child views
  _tab_nowShowingDidChange: function() {
    var v = this.get('nowShowing');
    this.get('containerView').set('nowShowing',v);
    this.get('segmentedView').set('value',v);
    return this ;
  }.observes('nowShowing'),

  _tab_saveUserDefault: function() {
    // if user default is set, save also
    var v = this.get('nowShowing');
    var defaultKey = this.get('userDefaultKey');
    if (defaultKey) {
      SC.userDefaults.set([defaultKey,'nowShowing'].join(':'), v);
    }
  }.observes('nowShowing'),
  
  _tab_itemsDidChange: function() {
    this.get('segmentedView').set('items', this.get('items'));
    return this ;    
  }.observes('items'),

  /** @private
    Restore userDefault key if set.
  */
  init: function() {
    sc_super();
    this._tab_nowShowingDidChange()._tab_itemsDidChange();
  },

  awake: function() {
    sc_super();  
    var defaultKey = this.get('userDefaultKey');
    if (defaultKey) {
      defaultKey = [defaultKey,'nowShowing'].join(':');
      var nowShowing = SC.userDefaults.get(defaultKey);
      if (!SC.none(nowShowing)) this.set('nowShowing', nowShowing);
    }

  },
  
  createChildViews: function() {
    var childViews  = [], view, containerView, layout,
        tabLocation = this.get('tabLocation'),
        tabHeight   = this.get('tabHeight');
    
    layout = (tabLocation === SC.TOP_LOCATION) ?
             { top: tabHeight/2+1, left: 0, right: 0, bottom: 0 } :
             (tabLocation === SC.TOP_TOOLBAR_LOCATION) ?
             { top: tabHeight+1, left: 0, right: 0, bottom: 0 } :
             { top: 0, left: 0, right: 0, bottom: tabHeight-1 } ;
    
    containerView = this.containerView.extend(SC.Border, {
      layout: layout,
      borderStyle: SC.BORDER_BLACK
    });

    view = this.containerView = this.createChildView(containerView) ;
    childViews.push(view);
    
    //  The segmentedView managed by this tab view.  Note that this TabView uses
    //  a custom segmented view.  You can access this view but you cannot change
    // it.
    layout = (tabLocation === SC.TOP_LOCATION || 
              tabLocation === SC.TOP_TOOLBAR_LOCATION) ?
             { height: tabHeight, left: 0, right: 0, top: 0 } :
             { height: tabHeight, left: 0, right: 0, bottom: 0 } ;

    this.segmentedView = this.get('segmentedView').extend({
      layout: layout,

      /** @private
        When the value changes, update the parentView's value as well.
      */
      _sc_tab_segmented_valueDidChange: function() {
        var pv = this.get('parentView');
        if (pv) pv.set('nowShowing', this.get('value'));

        // FIXME: why is this necessary? 'value' is a displayProperty and should
        // automatically cause displayDidChange() to fire, which should cause 
        // the two lines below to execute in the normal course of things...
        this.set('layerNeedsUpdate', YES) ;
        this.invokeOnce(this.updateLayerIfNeeded) ;
      }.observes('value'),

      init: function() {
        // before we setup the rest of the view, copy key config properties 
        // from the owner view...
        var pv = this.get('parentView');
        if (pv) {
          SC._TAB_ITEM_KEYS.forEach(function(k) { this[k] = pv.get(k); }, this);
        }
        return sc_super();
      }
    });
    
    view = this.segmentedView = this.createChildView(this.segmentedView) ;
    childViews.push(view);
    
    this.set('childViews', childViews);
    return this; 
  },
  
  // ..........................................................
  // COMPONENT VIEWS
  // 

  /**
    The containerView managed by this tab view.  Note that TabView uses a 
    custom container view.  You can access this view but you cannot change 
    it.
  */
  containerView: SC.ContainerView.extend({ renderDelegateName: 'wellRenderDelegate' }),
  
  segmentedView: SC.SegmentedView
  
}) ;

SC._TAB_ITEM_KEYS = 'itemTitleKey itemValueKey itemIsEnabledKey itemIconKey itemWidthKey itemToolTipKey itemActionKey itemTargetKey'.w();
