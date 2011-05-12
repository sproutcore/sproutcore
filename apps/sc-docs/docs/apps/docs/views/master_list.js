// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2008-2011 Apple Inc. All rights reserved.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================

Docs.MasterListView = SC.ListView.extend({

  detailPropertyPath: 'mainPage.mainPane.detailView.workspace.symbolList.contentView',

  keyDown: function(evt){

    if(evt.keyCode === 39) {
      var propPath = this.get('detailPropertyPath');
      var detailView = Docs.getPath(propPath);

      detailView.becomeFirstResponder();

      var sel = Docs.selectedClassController.get('symbolSelection');
      if (!sel || !sel.get('length')) {
        console.log('getting content');
        var firstObject = Docs.selectedClassController.getPath('symbols.firstObject');

        var sel = SC.SelectionSet.create();
        sel.addObjects([firstObject]).freeze();

        Docs.selectedClassController.set('symbolSelection',sel);
      }

      //return YES;
    }

    return sc_super();
  }
});
