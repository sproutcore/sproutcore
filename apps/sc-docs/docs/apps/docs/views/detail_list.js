// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2008-2011 Apple Inc. All rights reserved.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================

Docs.DetailListView = SC.ListView.extend({

  masterPropertyPath: 'mainPage.mainPane.classList.contentView',

  keyDown: function(evt){

    if(evt.keyCode === 37) {
      var propPath = this.get('masterPropertyPath');
      var masterView = Docs.getPath(propPath);

      masterView.becomeFirstResponder();

      //return YES;
    }

    return sc_super();
  }
});
