// ==========================================================================
// Project:   Greenhouse.targetsController
// Copyright: ©2010 Mike Ball
// ==========================================================================
/*globals Greenhouse */

/** @class

  The full set of targets available in the application.  This is populated 
  automatically when you call loadTargets().
  
  
  This Class comes from SproutCore's test runner
  
  
  @extends SC.ArrayController
*/

Greenhouse.targetsController = SC.ArrayController.create(
/** @scope Greenhouse.targetsController.prototype */ {

  /**
    Call this method whenever you want to reload the targets from the server.
  */
  reload: function() {
    var targets = Greenhouse.store.find(Greenhouse.TARGETS_QUERY);
    this.set('content', targets);
  },
  
  /** 
    Generates the Array of Apps in this project
  */
  applications: function() {

    var apps = [];
    this.forEach(function(target) { 
      if(target.get('sortKind') === "app") apps.pushObject(target);
    }, this);

    return apps;
    
  }.property('[]').cacheable()
}) ;
