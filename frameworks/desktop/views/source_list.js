// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2009 Sprout Systems, Inc. and contributors.
//            Portions ©2008-2009 Apple Inc. All rights reserved.
// License:   Licened under MIT license (see license.js)
// ==========================================================================

sc_require('views/list') ;
sc_require('views/source_list_group');

SC.BENCHMARK_SOURCE_LIST_VIEW = YES ;

/** @class
  
  Displays a source list like the source list in iTunes.  SourceList views
  are very similar to ListView's but come preconfigured with the correct
  appearance and default behaviors of a source list.
  
  @extends SC.ListView
  @since SproutCore 1.0
*/
SC.SourceListView = SC.ListView.extend(
/** @scope SC.SourceListView.prototype */ {

  /**
    Add class name to HTML for styling.
  */
  classNames: ['sc-source-list'],
  
  /**
    Default row height for source list items is larger.
  */
  rowHeight: 32,

  /**
    By default source lists should not select on mouse down since you will
    often want to drag an item instead of selecting it.
  */
  selectOnMouseDown: NO,
  
  /**
    By default, SourceListView's trigger any action you set whenever the user
    clicks on an item.  This gives the SourceList a "menu" like behavior.
  */
  actOnSelect: YES

});
