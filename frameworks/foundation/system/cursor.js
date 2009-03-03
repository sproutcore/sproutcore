// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2009 Sprout Systems, Inc. and contributors.
//            Portions ©2008-2009 Apple, Inc. All rights reserved.
// License:   Licened under MIT license (see license.js)
// ==========================================================================

sc_require('system/style_sheet') ;

/**
  @class SC.Cursor

  A Cursor object is used to sychronize the cursor used by multiple views at 
  the same time. For example, thumb views within a split view acquire a cursor
  instance from the split view and set it as their cursor. The split view is 
  able to update its cursor objects to reflect the state of the split view.
  Because cursor objects are implemented internally with CSS, this is a very 
  efficient way to update the cursor for a group of view objects.
  
  Note: This object creates an anonymous CSS class to represent the cursor. 
  The anonymoust CSS class is automatically added by SproutCore to views that
  have the cursor object set as "their" cursor.
  
  @extends SC.Object
*/
SC.Cursor = SC.Object.extend(
/** @scope SC.Cursor.prototype */ {
  
}) ;

// ..........................................................
// SUPPORT FOR LOADING PAGE DESIGNS
// 

/** Calling design() on a page is the same as calling create() */
SC.Cursor.sharedStyleSheet = function() {
  var ss = this._styleSheet ;
  if (!ss) ss = this._styleSheet = SC.StyleSheet.create() ;
  console.log(ss) ;
  return ss ;
}
