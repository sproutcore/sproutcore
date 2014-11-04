// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2011 Strobe Inc. and contributors.
//            Portions ©2008-2011 Apple Inc. All rights reserved.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================

sc_require('views/segmented');

/**
  @static
  @type String
  @constant
*/
SC.TOP_LOCATION = 'top';

/**
  @static
  @type String
  @constant
*/
SC.TOP_TOOLBAR_LOCATION = 'top-toolbar';

/**
  @static
  @type String
  @constant
*/
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

  /** @private
    @type Array
    @default ['sc-tab-view']
    @see SC.View#classNames
  */
  classNames: ['sc-tab-view'],

  /** @private
    @type Array
    @default ['nowShowing']
    @see SC.View#displayProperties
  */
  displayProperties: ['nowShowing'],

  // ..........................................................
  // PROPERTIES
  //

 /**
    Set nowShowing with the view you want to display. (You may specify globally-accessible views
    like `MyApp.tabsPage.myTabView`, local views defined on the TabView itself like `myLocalTabView`,
    or deep local views like `.myLocalPage.myTabView`.)

    @type String
    @default null
  */
  nowShowing: null,

  /**
    The list of items for the SegmentedView, and specifying the associated view to display. For example:

        items: [
          { title: "Tab 1", value: "MyApp.tabsPage.view1" },
          { title: "Tab 2", value: "MyApp.tabsPage.view2" }
        ]

    (Note that if needed you can specify the item keys by specifying `itemTitleKey`, `itemValueKey`, et
    cetera, on your TabView.)

    @type Array
    @default []
  */
  items: [],

  /**
    @type String
    @default null
  */
  itemTitleKey: null,

  /**
    @type String
    @default null
  */
  itemValueKey: null,

  /**
    @type String
    @default null
  */
  itemIsEnabledKey: null,

  /**
    @type String
    @default null
  */
  itemIconKey: null,

  /**
    @type String
    @default null
  */
  itemWidthKey: null,

  /**
    @type String
    @default null
  */
  itemToolTipKey: null,

  /**
    @type Number
    @default SC.REGULAR_BUTTON_HEIGHT
  */
  tabHeight: SC.REGULAR_BUTTON_HEIGHT,

  /**
    Possible values:

      - SC.TOP_LOCATION
      - SC.TOP_TOOLBAR_LOCATION
      - SC.BOTTOM_LOCATION

    @type String
    @default SC.TOP_LOCATION
  */
  tabLocation: SC.TOP_LOCATION,

  /**
    If set, then the tab location will be automatically saved in the user
    defaults.  Browsers that support localStorage will automatically store
    this information locally.

    @type String
    @default null
  */
  userDefaultKey: null,


  // ..........................................................
  // FORWARDING PROPERTIES
  //

  /** @private Sync important changes with the child views. */
  _tab_nowShowingDidChange: function() {
    var content = this.get('nowShowing');

    // Sync the segmented view.
    this.get('segmentedView').set('value', content);

    // If the user default is set, save it.
    var defaultKey = this.get('userDefaultKey');
    if (defaultKey) {
      SC.userDefaults.set([defaultKey,'nowShowing'].join(':'), content);
    }

    // If it's a string, try to turn it into the object it references...
    if (SC.typeOf(content) === SC.T_STRING && content.length > 0) {
      var dotspot = content.indexOf('.');
      // No dot means a local property, either to this view or this view's page.
      if (dotspot === -1) {
        var tempContent = this.get(content);
        content = SC.kindOf(tempContent, SC.CoreView) ? tempContent : SC.objectForPropertyPath(content, this.get('page'));
      }
      // Dot at beginning means local property path.
      else if (dotspot === 0) {
        content = this.getPath(content.slice(1));
      }
      // Dot after the beginning
      else {
        content = SC.objectForPropertyPath(content);
      }
    }

    // Sync the container view.
    this.get('containerView').set('nowShowing', content);

    return this;
  }.observes('nowShowing'),

  /** @private */
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
    // Wake up the userDefaults support, if in use.
    var defaultKey = this.get('userDefaultKey');
    if (defaultKey) {
      defaultKey = [defaultKey,'nowShowing'].join(':');
      var nowShowing = SC.userDefaults.get(defaultKey);
      if (!SC.none(nowShowing)) this.set('nowShowing', nowShowing);
    }
  },

  /** @private */
  createChildViews: function() {
    var childViews  = [], containerView, layout,
        tabLocation = this.get('tabLocation'),
        tabHeight   = this.get('tabHeight'),
        controlSize = this.get('controlSize');

    if (tabLocation === SC.TOP_LOCATION) {
      layout = { top: tabHeight/2+1, left: 0, right: 0, bottom: 0, border: 1 };
    } else if (tabLocation === SC.TOP_TOOLBAR_LOCATION) {
      layout = { top: tabHeight+1, left: 0, right: 0, bottom: 0, border: 1 };
    } else {
      layout = { top: 0, left: 0, right: 0, bottom: (tabHeight/2) - 1, border: 1 };
    }

    containerView = this.containerView.extend({
      layout: layout,
      //adding the role
      ariaRole: 'tabpanel'
    });

    this.containerView = this.createChildView(containerView) ;

    //  The segmentedView managed by this tab view.  Note that this TabView uses
    //  a custom segmented view.  You can access this view but you cannot change
    // it.
    layout = (tabLocation === SC.TOP_LOCATION ||
              tabLocation === SC.TOP_TOOLBAR_LOCATION) ?
             { height: tabHeight, left: 0, right: 0, top: 0 } :
             { height: tabHeight, left: 0, right: 0, bottom: 0 } ;

    this.segmentedView = this.get('segmentedView').extend({
      layout: layout,

      controlSize: controlSize,

      /** @private
        When the value changes, update the parentView's value as well.
      */
      _sc_tab_segmented_valueDidChange: function() {
        var pv = this.get('parentView');
        if (pv) pv.set('nowShowing', this.get('value'));
      }.observes('value'),

      /** @private */
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

    this.segmentedView = this.createChildView(this.segmentedView);

    childViews.push(this.containerView);
    childViews.push(this.segmentedView);

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

    @type SC.View
    @default SC.ContainerView
    @readOnly
  */
  containerView: SC.ContainerView.extend({ renderDelegateName: 'wellRenderDelegate' }),

  /**
    @type SC.View
    @default SC.SegmentedView
  */
  segmentedView: SC.SegmentedView

}) ;

SC._TAB_ITEM_KEYS = ['itemTitleKey', 'itemValueKey', 'itemIsEnabledKey', 'itemIconKey', 'itemWidthKey', 'itemToolTipKey', 'itemActionKey', 'itemTargetKey'];
