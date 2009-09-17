// ==========================================================================
// Project:   TestRunner.detailController
// Copyright: ©2009 Apple Inc.
// ==========================================================================
/*globals TestRunner */

/** @class

  The currently selected test in detail view.

  @extends SC.ObjectController
*/
TestRunner.detailController = SC.ObjectController.create(
/** @scope TestRunner.detailController.prototype */ {
  
  /**
    Adds a random number onto the end of the URL to force the iframe to 
    reload.
  */
  uncachedUrl: function() {
    var url = this.get('url');
    return url ? [url, Date.now()].join('?') : url ;
  }.property('url')
  
}) ;
