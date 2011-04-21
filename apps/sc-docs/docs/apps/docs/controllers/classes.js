// ==========================================================================
// Project:   Docs.classesController
// Copyright: ©2011 My Company, Inc.
// ==========================================================================
/*globals Docs */

/** @class

  (Document Your Controller Here)

  @extends SC.TreeController
*/
Docs.classesController = SC.ArrayController.create(
/** @scope Docs.classesController.prototype */ {

  _selectionDidChange: function(){

    var content = this.getPath('selection.firstObject');

    if(content) {
      SC.routes.set('location',content.get('displayName'));
    }

  }.observes('selection')

}) ;
