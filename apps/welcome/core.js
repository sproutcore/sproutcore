// ==========================================================================
// Project:   SproutCore Test Runner
// Copyright: ©2006-2009 Sprout Systems, Inc. and contributors.
//            Portions ©2008-2009 Apple Inc. All rights reserved.
// License:   Licened under MIT license (see license.js)
// ==========================================================================
/*globals Welcome */

/** @namespace
  
  The Welcome app is displayed when you load the root URL and the dev server
  is visible.  It will fetch the list of targets from the server and list 
  them.
  
  @extends SC.Object
*/
Welcome = SC.Object.create(
  /** @scope Welcome.prototype */ {

  NAMESPACE: 'Welcome',
  VERSION: '1.0.0',
  
  store: SC.Store.create().from('CoreTools.DataSource'),
  
  displayTitle: function() {
    var hostname = (window.location.hostname || 'localhost').toString();
    return hostname.match(/sproutcore\.com/) ? "SproutCore Demos".loc() : "SproutCore Developer Tools";
  }.property().cacheable()

}) ;
