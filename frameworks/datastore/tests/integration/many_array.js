// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2011 Strobe Inc. and contributors.
//            Portions ©2008-2011 Apple Inc. All rights reserved.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================

var MyDataSource = SC.DataSource.extend({
  retrieveRecordsArguments: [],

  retrieveRecords: function(store, storeKeys) {
    this.get('retrieveRecordsArguments').push(storeKeys);
    sc_super();
  }
});

var MyApp = {};

MyApp.Todo = SC.Record.extend({
  title: SC.Record.attr(String),
  project: SC.Record.toOne("MyApp.Project", {
    inverse: "todos", isMaster: NO
  })
});

MyApp.Project = SC.Record.extend({
  name: SC.Record.attr(String),
  todos: SC.Record.toMany("MyApp.Todo", {
    inverse: "project", isMaster: YES
  })
});

module("SC.Record.toMany array with data source", {
  setup: function() {
    window.MyApp = MyApp;
    window.MyDataSource = MyDataSource;
  },
  teardown: function() {
    window.MyApp = null;
    window.MyDataSource = null;
  }
});

test("when retrieving records with toMany association, it should call retrieveRecords once instead of calling retrieveRecord multiple times", function() {
  var store = SC.Store.create().from("MyDataSource");
  SC.RunLoop.begin();
  store.loadRecords(MyApp.Project, [
    {
      guid: 1,
      name: 'SproutCore',
      todos: [1, 2, 3]
    }
  ]);
  SC.RunLoop.end();

  SC.RunLoop.begin();
  var todos = store.find(MyApp.Project, 1).get('todos').toArray();
  SC.RunLoop.end();

  same(todos.length, 3);
  // retrieveRecords should be called only once
  same(store.get('dataSource').get('retrieveRecordsArguments').length, 1);
});
