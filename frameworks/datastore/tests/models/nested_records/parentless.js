/**
 * Complex Nested Records (SC.ChildRecord) Unit Test
 *
 * @author Evin Grano
 */

// ..........................................................
// Basic Set up needs to move to the setup and teardown
// 
var NestedRecord, store, storeKeys; 

var initModels = function(){
  NestedRecord.Directory = SC.ChildRecord.extend({
    /** Child Record Namespace */
    childRecordNamespace: NestedRecord,
    primaryKey: 'id',
    id: SC.Record.attr(Number),
    name: SC.Record.attr(String),
    contents: SC.Record.toMany('SC.Record', { nested: true })
  });
  
  NestedRecord.File = SC.ChildRecord.extend({
    primaryKey: 'id',
    id: SC.Record.attr(Number),
    name: SC.Record.attr(String)
  });
  
};

// ..........................................................
// Basic SC.Record Stuff
// 
module("Parentless SC.ChildRecord", {

  setup: function() {
    NestedRecord = SC.Object.create({
      store: SC.Store.create()
    });
    store = NestedRecord.store;
    initModels();
    SC.RunLoop.begin();
    storeKeys = store.loadRecords([NestedRecord.Directory, NestedRecord.File], [
      {
        type: 'Directory',
        name: 'Dir 1',
        id: 1,
        contents: [
          {
            type: 'Directory',
            name: 'Dir 2',
            id: 2,
            contents: [
              {
                type: 'File',
                id: 3,
                name: 'File 1'
              },
              {
                type: 'File',
                id: 4,
                name: 'File 2'
              } 
            ]
          }
        ]
      },
      {
        type: 'File',
        id: 5,
        name: 'File 3'
      }
    ]);
    SC.RunLoop.end();
  },

  teardown: function() {
    delete NestedRecord.Directory;
    delete NestedRecord.File;
    NestedRecord = null;
    store = null;
  }
});

test("Proper Initialization",function() {
  var first, second;
  equals(storeKeys.get('length'), 2, "number of primary store keys should be 2");
  
  // First
  first = store.materializeRecord(storeKeys[0]);
  ok(SC.kindOf(first, SC.ChildRecord), "first record is a kind of a SC.ChildRecord Object");
  ok(SC.instanceOf(first, NestedRecord.Directory), "first record is a instance of a NestedRecord.Directory Object");
  
  // Second
  second = store.materializeRecord(storeKeys[1]);
  ok(SC.kindOf(second, SC.ChildRecord), "second record is a kind of a SC.ChildRecord Object");
  ok(SC.instanceOf(second, NestedRecord.File), "second record is a instance of a NestedRecord.File Object");
});

test("Proper Status",function() {
  var first, second;
  
  // First
  first = store.materializeRecord(storeKeys[0]);
  equals(first.get('status'), SC.Record.READY_CLEAN, 'first record has a READY_CLEAN State');
  
  // Second
  second = store.materializeRecord(storeKeys[1]);
  equals(second.get('status'), SC.Record.READY_CLEAN, 'second record has a READY_CLEAN State');
});

test("Can Push onto child array",function() {
  var first, contents;
  
  // First
  first = store.materializeRecord(storeKeys[0]);
  first = first.get('contents').objectAt(0);
  contents = first.get('contents');
  equals(contents.get('length'), 2, "should have two items");
  contents.forEach(function(f){
    ok(SC.instanceOf(f, NestedRecord.File), "should be a NestedRecord.File");
    ok(f.get('name'), "should have a name property");
  });
  
  contents.pushObject({type: 'File', name: 'File 4', id: 12});
  
  equals(contents.get('length'), 3, "should have three items");
  contents.forEach(function(f){
    ok(SC.instanceOf(f, NestedRecord.File), "should be a NestedRecord.File");
    ok(f.get('name'), "should have a name property");
    equals(f.get('status'), SC.Record.READY_DIRTY, 'second record has a READY_CLEAN State');
    
  });

});
