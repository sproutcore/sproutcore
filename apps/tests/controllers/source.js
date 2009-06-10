// ==========================================================================
// Project:   TestRunner.sourceController
// Copyright: ©2009 My Company, Inc.
// ==========================================================================
/*globals TestRunner */

/** @class

  (Document Your Controller Here)

  @extends SC.Object
*/
TestRunner.sourceController = SC.TreeController.create(
/** @scope TestRunner.sourceController.prototype */ {

  contentBinding: 'TestRunner.targetsController.sourceRoot',
  treeItemChildrenKey: "children",
  treeItemIsExpandedKey: "isExpanded",
  treeItemIsGrouped: YES,
  
  didSelectTarget: function() {
    var sel    = this.get('selection'),
    var target = sel ? sel.firstObject() : null;
    console.log('didSelectTarget(%@)'.fmt(target));
    TestRunner.sendAction('selectTarget', this, target);
  }
  
 
}) ;
