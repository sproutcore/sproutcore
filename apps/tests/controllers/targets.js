// ==========================================================================
// Project:   TestRunner.targetsController
// Copyright: ©2009 My Company, Inc.
// ==========================================================================
/*globals TestRunner */

/** @class

  The full set of targets available in the application.  This is populated 
  automatically when you call loadTargets().

  @extends SC.ArrayController
*/
TestRunner.targetsController = SC.ArrayController.create(
/** @scope TestRunner.targetsController.prototype */ {

  /**
    Call this method whenever you want to relaod the targets from the server.
  */
  reload: function() {
    var targets = TestRunner.store.findAll(TestRunner.Target);
    this.set('content', targets);
    TestRunner.sendAction('targetsDidChange');
  },
  
  /** 
    Generates the root array of children objects whenever the target content
    changes.  Used in a tree node.
  */
  sourceRoot: function() {
    
    // break targets into their respective types.  Items that should not be 
    // visible at the top level will not have a sort kind
    var kinds = {}, kind, targets, ret;
    
    this.forEach(function(target) { 
      if (kind = target.get('sortKind')) {
        targets = kinds[kind];
        if (!targets) kinds[kind] = targets = [];
        targets.push(target);
      }
    }, this);

    // once divided into kinds, create group nodes for each kind
    ret = [];
    for (kind in kinds) {
      if (!kinds.hasOwnProperty(kind)) continue;
      targets = kinds[kind];
      ret.push(SC.Object.create({
        displayName: "Kind.%@".fmt(kind).loc(),
        isExpanded: kind !== 'sproutcore',
        children: targets.sortProperty('kind', 'displayName')
      }));
    }
    
    return SC.Object.create({ children: ret, isExpanded: YES });
    
  }.property('[]').cacheable()

}) ;
