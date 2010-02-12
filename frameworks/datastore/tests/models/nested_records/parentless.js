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
    
    name: SC.Record.attr(String),
    contents: SC.Record.toMany('SC.Record', { nested: true })
  });
  
  NestedRecord.File = SC.ChildRecord.extend({
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
        contents: [
          {
            type: 'Directory',
            name: 'Dir 2',
            contents: [
              {
                type: 'File',
                name: 'File 1'
              },
              {
                type: 'File',
                name: 'File 2'
              } 
            ]
          }
        ]
      },
      {
        type: 'File',
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

test("Proper Initialization",
function() {
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

test("Proper Status",
function() {
  var first, second;
  
  // First
  first = store.materializeRecord(storeKeys[0]);
  equals(first.get('status'), SC.Record.READY_CLEAN, 'first record has a READY_CLEAN State');
  
  // Second
  second = store.materializeRecord(storeKeys[1]);
  equals(second.get('status'), SC.Record.READY_CLEAN, 'second record has a READY_CLEAN State');
});
