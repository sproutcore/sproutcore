// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2008-2011 Apple Inc. All rights reserved.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================

/*globals Docs */

/** @namespace

  Docs is a documentation viewer for SproutCore-based Apps and for the
  SproutCore framework itself. It runs alongside the sc-docs script (Which
  ships with the same sc-docs.git repository this app is contained within),
  and uses a nodejs-based jsdoc-toolkit engine to parse and generate the 
  fixtures data this app will render.

  Known Issues:
  ----

  - The app currently suffers from some performance problems.
  - The app lacks proper usage of SC.Routes to make symbols bookmarkable
     and shareable.
  - The app lacks an organizational feature (organize by framework)
  - The app lacks a search feature

  If you encounter any other issues, please let me know (majd@sproutcore.com)
  
  @extends SC.Object
*/
Docs = SC.Application.create(
  /** @scope Docs.prototype */ {

  NAMESPACE: 'Docs',
  VERSION: '0.1.0',

  /**
    A hash used to quickly inspect all the data associated with the doc viewer.

    ex. 

    {
      "SC.Set": [
        "add", 
        "edit"
      ],

      "SC.Enumerable": [
        "find", 
        "findProperty"
      ]
    }
  */
  indexHash: null,

  buildIndex: function(/** SC.RecordArray */classes) {
    var hash = {};

    classes.forEach(function(object, index){
      var name = object.get('displayName');

      hash[name] = object.get('storeKey');
    });

    this.set('indexHash',hash);
  },

  /** record array representing all the classes */
  allClassesRecordArray: null,

  wasRouted: NO,

  // This is your application store.  You will use this store to access all
  // of your model data.  You can also set a data source on this store to
  // connect to a backend server.  The default setup below connects the store
  // to any fixtures you define.
  store: SC.Store.create().from(SC.Record.fixtures),

  routeToClass: function(params){ 
    Docs.set('wasRouted',YES);

    var className = params['class'];
    if(!className) {return;}

    query = SC.Query.local(Docs.Class,{
      conditions: 'displayName = "%@"'.fmt(className)
    });
    var items = Docs.store.find(query);
    var firstObject = items.get('firstObject');

    if(Docs.classesController.getPath('selection.firstObject') === firstObject) {
      return;
    }

    var collection = Docs.mainPage.getPath('mainPane.sidebar.classList.contentView');
    var itemView = collection.itemViewForContentObject(firstObject);
    Docs.classesController.selectObject(firstObject);
    collection.scrollToItemView(itemView);

    return items.get('firstObject');
  },

  routeToSymbol: function(params){

    // If no className is provided, assume that the currently selected
    // class contains the symbol
    var className = params['class'];
    var symbolName = params['symbol'];

    var selectedClass = this.routeToClass(params);

    if(!selectedClass || !symbolName) {
      return;
    }
  
    var that = this;
    // We have to wait for the class selection to propagate
    this.invokeLater(function(){

      var symbols = Docs.selectedClassController.get('symbols');
      var matches = symbols.filterProperty('name',symbolName);

      var firstObject = matches.get('firstObject');

      if (!firstObject) {
        return NO;
      }

      if(Docs.selectedClassController.getPath('symbolSelection.firstObject') === firstObject) {
        return NO;
      }

      var sel = SC.SelectionSet.create();
      sel.addObjects([firstObject]).freeze();

      Docs.selectedClassController.set('symbolSelection',sel);
    });

    return YES;
  }

}) ;

Handlebars.registerHelper('debug', function(object) {

  console.log(this.get(object));

  return '';
});
