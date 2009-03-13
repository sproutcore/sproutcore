// ==========================================================================
// Project:   TestRunner.targetController
// Copyright: ©2009 My Company, Inc.
// ==========================================================================
/*globals TestRunner */

/** @class

  Manages the targets.  The targets will be displayed and selected in the 
  source list.

  @extends SC.ArrayController
*/
TestRunner.targetsController = SC.ArrayController.create(
/** @scope TestRunner.targetController.prototype */ {

  allowsEmptySelection: NO,
  allowsMultipleSelection: NO,
  
  /**
    Loads the targets from the server.  When the targets have loaded, adds 
    them to the store and then sets the local content.
  */
  refresh: function() {
    SC.Request.getUrl('/sc/targets.json')
      .notify(this, 'targetsDidRefresh').set('isJSON', YES).send();
  },
  
  targetsDidRefresh: function(request) {
    var json = request.get('response'), len = json.length, idx;
    for(idx=0;idx<len;idx++) json[idx].guid = json[idx].name ; // patch
    var targets = SC.Store.updateRecords(json, SC.Store, TestRunner.Target);
    targets = targets.sort(function(a,b) { 
      var kindA = a.get('kind'), kindB = b.get('kind');
      if (kindA < kindB) return -1 ;
      if (kindA > kindB) return 1 ;
      if (kindA === kindB) {
        a = a.get('name'); 
        b = b.get('name');
        return (a<b) ? -1 : (a>b) ? 1 : 0;
      }
    });
    
    this.set('content', targets);
  }

}) ;
