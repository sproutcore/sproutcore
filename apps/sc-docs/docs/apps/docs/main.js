// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2008-2011 Apple Inc. All rights reserved.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================

/*globals Docs */

// This is the function that will start your app running.  The default
// implementation will load any fixtures you have created then instantiate
// your controllers and awake the elements on your page.
//
// As you develop your application you will probably want to override this.
// See comments for some pointers on what to do next.
//
Docs.main = function main() {

  Docs.getPath('mainPage.mainPane').append() ;

  var query  = SC.Query.local(Docs.Class);
  var output = Docs.store.find(query);

  Docs.buildIndex(output);

  Docs.allClassesRecordArray = output = output.sortProperty('displayName');
  Docs.classesController.set('content',output);

  SC.routes.add(':class/:symbol',Docs,'routeToSymbol');
  SC.routes.add(':class',Docs,'routeToClass');

  if(!window.location.hash){
    Docs.classesController.selectObject(output.firstObject());
  }

  var view = Docs.getPath('mainPage.mainPane.sidebar.classList.contentView');
  view.becomeFirstResponder();


} ;

function main() { Docs.main(); }
