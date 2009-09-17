// ==========================================================================
// Project:   Welcome.targetsController
// Copyright: ©2009 Apple Inc.
// ==========================================================================
/*globals CoreTools Welcome */

/** @class
  
  Manages the list of targets

  @extends SC.ArrayController
*/
Welcome.targetsController = SC.ArrayController.create(
/** @scope Welcome.targetsController.prototype */ {

  /**
    Call this method whenever you want to relaod the targets from the server.
  */
  reload: function() {
    var targets = Welcome.store.find(CoreTools.TARGETS_QUERY);
    this.set('content', targets);
  },
  
  appsOnly: function() {
    return this.filter(function(t) { 
      return (t.get('kind') === 'app') && 
             (t.get('name') !== '/sproutcore/welcome'); 
    });
  }.property('[]').cacheable(),
  
  loadApplication: function() {
    var app = this.get('selection').firstObject(),
        url = app ? app.get('appUrl') : null;
        
    if (url) {
      this.set('canLoadApp', NO);
      this.invokeLater(function() { 
        window.location.href = url; // load new app
      });
    }
  },

  // used to disable all controls
  canLoadApp: YES,
  
  allowsEmptySelection: NO,
  allowsMultipleSelection: NO

}) ;
