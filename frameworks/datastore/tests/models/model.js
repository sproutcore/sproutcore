// ========================================================================
// Model Unit Tests
// ========================================================================
/*globals module test ok isObj equals expects */

var ModelTest, todoList1, todoList2, todo1, todo2, todo3 ; // global variables

//
//  core.js stub
//
ModelTest = SC.Object.create({

  server: SC.Server.create({ prefix: ['ModelTest'] }),

  FIXTURES: []
  
}) ;

//
//  fixtures stub
//
ModelTest.FIXTURES = ModelTest.FIXTURES.concat([
  
  {
    guid: '1', 
    type: 'Todo', 
    name: "Something to do",
    todoList: '1' // the guid of the todo list object todo is related to
  },
  
  {
    guid: '2', 
    type: 'Todo', 
    name: "Something else to do",
    todoList: '1'
  },
  
  {
    guid: '3', 
    type: 'Todo', 
    name: "Gee, I'm busy.",
    todoList: '2'
  }
  
]);

ModelTest.FIXTURES = ModelTest.FIXTURES.concat([
  
  {
    guid: '1',
    type: 'TodoList', 
    name: "My List"
  },
  
  {
    guid: '2',
    type: 'TodoList', 
    name: "My List 2"
  }
  
]);

//
// model classes
//
ModelTest.Todo = SC.Record.extend({
  
  todoListType: 'ModelTest.TodoList'
  
});

ModelTest.TodoList = SC.Record.extend({
  
  todos: SC.Record.hasMany('ModelTest.Todo', 'todoList')
  
});

//
// main.js stub
//
ModelTest.server.preload(ModelTest.FIXTURES) ;

module("Test model comparisons with numeric guids", {
  
  setup: function() {
    todoList1 = ModelTest.TodoList.find('1') ;
    todoList2 = ModelTest.TodoList.find('2') ;
    todo1 = ModelTest.Todo.find('1') ;
    todo2 = ModelTest.Todo.find('2') ;
    todo3 = ModelTest.Todo.find('3') ;
  },
  
  teardown: function() {
    todoList1 = undefined ;
    todoList2 = undefined ;
    todo1 = undefined ;
    todo2 = undefined ;
    todo3 = undefined ;
  }
  
});

test("Records should exist in Store", function() {
  ok(todoList1 !== null) ;
  ok(todoList2 !== null) ;
  ok(todo1 !== null) ;
  ok(todo2 !== null) ;
  ok(todo3 !== null) ;
});

test("Records should have correct guid", function() {
  equals(1, todoList1.get('guid')) ;
  equals(2, todoList2.get('guid')) ;
  equals(1, todo1.get('guid')) ;
  equals(2, todo2.get('guid')) ;
  equals(3, todo3.get('guid')) ;
});

test("Todo 1 and 2 should be related to TodoList 1", function() {
  ok(todoList1 === todo1.get('todoList'));
  ok(todoList1 === todo2.get('todoList'));
});

test("Todo 3 should not be related to TodoList 1", function() {
  ok(todoList1 !== todo3.get('todoList'));
});

test("Todo 3 should be related to TodoList 2", function() {
  ok(todoList2 === todo3.get('todoList'));
});

test("Todo 1 and 2 should not be related to TodoList 2", function() {
  ok(todoList2 !== todo1.get('todoList'));
  ok(todoList2 !== todo2.get('todoList'));
});

test("TodoList 1 should be related to Todo 1 and 2", function() {
  var records = todoList1.get('todos').get('records');
  var todosWeWanted = SC.Set.create([todo1, todo2]);
  var todosWeGot = SC.Set.create();
  var loc = records.length;
  
  while(--loc >= 0) {
    var obj = records[loc];
    
    ok( todosWeGot.add(obj), "should be no duplicates" );
    ok( todosWeWanted.contains(obj), "should be in set of objects we're expecting to get" ); 
  }
});

test("TodoList 2 should be related to Todo 3", function() {
  var records = todoList2.get('todos').get('records');
  var todosWeWanted = SC.Set.create([todo3]);
  var todosWeGot = SC.Set.create();
  var loc = records.length;
  
  while(--loc >= 0) {
    var obj = records[loc];
    
    ok( todosWeGot.add(obj), "should be no duplicates" );
    ok( todosWeWanted.contains(obj), "should be in set of objects we're expecting to get" ); 
  }
});

test("Todos should be collectable using guids", function() {
  var c = SC.Collection.create({ recordType: ModelTest.Todo, conditions: { todoList: 1 } });
  c.refresh();
  var records = c.records();
  var todosWeWanted = SC.Set.create([todo1, todo2]);
  var todosWeGot = SC.Set.create();
  var loc = records.length;
  
  while(--loc >= 0) {
    var obj = records[loc];
    
    ok( todosWeGot.add(obj), "should be no duplicates" );
    ok( todosWeWanted.contains(obj), "should be in set of objects we're expecting to get" ); 
  }
});

test("toString() should show model class name", function() {
  var re = /^ModelTest.Todo/;
  var str = todo1.toString();
  ok( str.match(re), "Todo 1 toString() should start with ModelTest.Todo, actually starts with " + str);
});

var ModelTest2 ; // global variables

//
//  core.js stub
//
ModelTest2 = SC.Object.create({
  
  server: SC.Server.create({ prefix: ['ModelTest2'] }),
  
  FIXTURES: []
  
});

//
//  fixtures stub
//
ModelTest2.FIXTURES = ModelTest2.FIXTURES.concat([
  
  {
    guid: '1', 
    type: 'Todo', 
    name: "Something to do",
    todoList: '1' // the guid of the todo list object todo is related to
  },
  
  {
    guid: '2', 
    type: 'Todo', 
    name: "Something else to do",
    todoList: '1'
  },
  
  {
    guid: '3', 
    type: 'Todo', 
    name: "Gee, I'm busy.",
    todoList: '2'
  }
  
]);

ModelTest2.FIXTURES = ModelTest2.FIXTURES.concat([
  
  { guid: '1',
    type: 'TodoList', 
    name: "My List"
  },
  
  { guid: '2',
    type: 'TodoList', 
    name: "My List 2"
  }
  
]);

//
// model classes
//
ModelTest2.Todo = SC.Record.extend({
  
  todoListType: 'ModelTest2.TodoList'
  
});

ModelTest2.TodoList = SC.Record.extend({
  
  todos: SC.Record.hasMany('ModelTest2.Todo', 'todoList')
  
});

//
// main.js stub
//
ModelTest2.server.preload(ModelTest2.FIXTURES) ;

module("Test model comparisons with string guids", {
  
  setup: function() {
    todoList1 = ModelTest2.TodoList.find('1');
    todoList2 = ModelTest2.TodoList.find('2');
    todo1 = ModelTest2.Todo.find('1');
    todo2 = ModelTest2.Todo.find('2');
    todo3 = ModelTest2.Todo.find('3');
  },
  
  teardown: function() {
    todoList1 = undefined ;
    todoList2 = undefined ;
    todo1 = undefined ;
    todo2 = undefined ;
    todo3 = undefined ;
  }
  
});

test("Objects should exist in Store", function() {
  ok(todoList1 !== null) ;
  ok(todoList2 !== null) ;
  ok(todo1 !== null) ;
  ok(todo2 !== null) ;
  ok(todo3 !== null) ;
});

test("Todo 1 and 2 should be related to TodoList 1", function() {
  ok(todoList1 === todo1.get('todoList'));
  ok(todoList1 === todo2.get('todoList'));
});

test("Todo 3 should not be related to TodoList 1", function() {
  ok(todoList1 !== todo3.get('todoList'));
});

test("Todo 3 should be related to TodoList 2", function() {
  ok(todoList2 === todo3.get('todoList'));
});

test("Todo 1 and 2 should not be related to TodoList 2", function() {
  ok(todoList2 !== todo1.get('todoList'));
  ok(todoList2 !== todo2.get('todoList'));
});

test("TodoList 1 should be related to Todo 1 and 2", function() {
  var records = todoList1.get('todos').get('records');
  var todosWeWanted = SC.Set.create([todo1, todo2]);
  var todosWeGot = SC.Set.create();
  var loc = records.length;
  
  // assert( todosWeWanted.contains(todo1), "verify SC.Set works properly" );
  // assert( todosWeWanted.contains(todo2), "verify SC.Set works properly" );
  
  while(--loc >= 0) {
    var obj = records[loc];
    
    ok( todosWeGot.add(obj), "should be no duplicates" );
    ok( todosWeWanted.contains(obj), "should be in set of objects we're expecting to get" ); 
  }
});

test("TodoList 2 should be related to Todo 3", function() {
  var records = todoList2.get('todos').get('records');
  var todosWeWanted = SC.Set.create([todo3]);
  var todosWeGot = SC.Set.create();
  var loc = records.length;
  
  while(--loc >= 0) {
    var obj = records[loc];
    
    ok( todosWeGot.add(obj), "should be no duplicates" );
    ok( todosWeWanted.contains(obj), "should be in set of objects we're expecting to get" ); 
  }
});

test("Todos should be collectable using guids", function() {
  var c = SC.Collection.create({ recordType: ModelTest2.Todo, conditions: { todoList: '1' } });
  c.refresh();
  var records = c.records();
  var todosWeWanted = SC.Set.create([todo1, todo2]);
  var todosWeGot = SC.Set.create();
  var loc = records.length;
  
  while(--loc >= 0) {
    var obj = records[loc];
    
    ok( todosWeGot.add(obj), "should be no duplicates" );
    ok( todosWeWanted.contains(obj), "should be in set of objects we're expecting to get" ); 
  }
});
