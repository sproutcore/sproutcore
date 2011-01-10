// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2009 Apple Inc. and contributors.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================
/*globals module ok equals same test MyApp Sample */

var store, fds, storeKey1,storeKey2, Test;

module("SC.FixturesDataSource latency", {
  setup: function() {
    SC.RunLoop.begin();
    
    Test = {};
    Test.FixturesDataSource = SC.FixturesDataSource.extend({
      simulateRemoteResponse: YES,
      latency: 250
    });
    
    var Sample = (window.Sample= SC.Object.create());
    Sample.File = SC.Record.extend({ test:'hello'});

    // files
    Sample.File.FIXTURES = [
    { guid: '10', name: 'Home', url: '/emily_parker', isDirectory: true, parent: null, children: 'Collection'},
    { guid: '11', name: 'Documents', fileType: 'documents', url: '/emily_parker/Documents', isDirectory: true, parent: '10', children: 'Collection', createdAt: 'June 15, 2007', modifiedAt: 'October 21, 2007', filetype: 'directory', isShared: false},
    { guid: '137',name: 'Library', fileType: 'library', url: '/emily_parker/Library', isDirectory: true, parent: '10', children: 'Collection', createdAt: 'June 15, 2007', modifiedAt: 'October 21, 2007', filetype: 'directory', isShared: false},
    { guid: '12', name: 'Movies', fileType: 'movies', url: '/emily_parker/Movies', isDirectory: true, parent: '10', children: 'Collection', createdAt: 'June 15, 2007', modifiedAt: 'June 15, 2007', filetype: 'directory', isShared: true, sharedAt: 'October 15, 2007', sharedUntil: 'March 31, 2008', sharedUrl: '2fhty', isPasswordRequired: true},
    { guid: '134',name: 'Music', fileType: 'music', url: '/emily_parker/Music', isDirectory: true, parent: '10', children: 'Collection', createdAt: 'June 15, 2007', modifiedAt: 'June 15, 2007', filetype: 'directory', isShared: true, sharedAt: 'October 15, 2007', sharedUntil: 'March 31, 2008', sharedUrl: '2fhty', isPasswordRequired: true},
    { guid: '135',name: 'Pictures', fileType: 'pictures', url: '/emily_parker/Pictures', isDirectory: true, parent: '10', children: 'Collection', createdAt: 'June 15, 2007', modifiedAt: 'June 15, 2007', filetype: 'directory', isShared: true, sharedAt: 'October 15, 2007', sharedUntil: 'March 31, 2008', sharedUrl: '2fhty', isPasswordRequired: true},
    { guid: '13', name: 'Auto Insurance', fileType: 'folder', url: '/emily_parker/Documents/Auto%20Insurance', isDirectory: true, parent: '11', children: 'Collection', createdAt: 'June 15, 2007', modifiedAt: 'October 21, 2007', filetype: 'directory', isShared: false},
    { guid: '150', name: 'Birthday Invitation.pdf', fileType: 'file', url: '/emily_parker/Documents/Birthday%20Invitation', isDirectory: false, parent: '11', createdAt: 'October 17, 2007', modifiedAt: 'October 21, 2007', filetype: 'pdf', isShared: false},
    { guid: '136', name: 'Software', fileType: 'software', url: '/emily_parker/Software', isDirectory: true, parent: '10', children: 'Collection', createdAt: 'June 15, 2007', modifiedAt: 'June 15, 2007', filetype: 'directory', isShared: true, sharedAt: 'October 15, 2007', sharedUntil: 'March 31, 2008', sharedUrl: '2fhty', isPasswordRequired: true}
    ];
    
    store = SC.Store.create().from(Test.FixturesDataSource.create());
  },
  
  teardown: function() {
    Test = store = null;
    SC.RunLoop.end();
  }
});

test("Verify find() loads all fixture data", function() {
  SC.RunLoop.begin();
  
  var result = store.find(Sample.File),
      rec, storeKey, dataHash;
  
  result.addObserver('status', function() {
    if (result.get('status') & SC.Record.READY) {
      equals(result.get('length'), Sample.File.FIXTURES.get('length'), 'should return records for each item in FIXTURES');
      
      // verify storeKeys actually return Records
      var idx, len = result.get('length'), expected = [];
      for(idx=0;idx<len;idx++) {
        rec = result.objectAt(idx);
        storeKey = rec ? rec.get('storeKey') : null;
        dataHash = storeKey ? store.readDataHash(storeKey) : null;
        
        ok(!!dataHash, 'storeKey at result[%@] (%@) should return dataHash'.fmt(idx, storeKey));
        
        expected.push(rec); // save record for later test
      }
      
      // verify multiple calls to findAll() returns SAME data
      result = store.find(Sample.File);
      
      equals(result.get('length'), expected.length, 'second result should have same length as first');
      len = result.get('length');
      for(idx=0;idx<len;idx++) {
        rec = result.objectAt(idx);
        equals(rec, expected[idx], 'record returned at index %@ should be same as previous'.fmt(idx));
      }
      
      window.start();
    }
  });
  
  ok(result, 'should return a result');
  ok(result.get('status') & SC.Record.BUSY, 'RecordArray should be busy');
  ok(!(result.get('status') & SC.Record.READY), 'RecordArray should not be ready');
  equals(result.get('length'), 0, "RecordArray should not have any records");
  
  result.notifyPropertyChange('status');
  
  SC.RunLoop.end();
  
  stop();
});

test("Verify find() loads data from store", function() {
  SC.RunLoop.begin();
  var record = store.find(Sample.File, "150");

  record.addObserver('status', function() {
    if (record.get('status') & SC.Record.READY) {
      equals(record.get('name'), 'Birthday Invitation.pdf', 'returns record should have name from fixture');
      window.start();
    }
  });
  
  ok(record, 'should return a record');
  ok(record.get('status') & SC.Record.BUSY, 'record should be busy');
  ok(!(record.get('status') & SC.Record.READY), 'record should not be ready');
  
  record.notifyPropertyChange('status');
  
  SC.RunLoop.end();
  
  stop();
});


test("Destroy a record and commit", function() {
  SC.RunLoop.begin();
  
  var record   = store.find(Sample.File, "136"),
      storeKey = record.get('storeKey'),
      fixtures = store.get('dataSource');

  var found = function() {
    if (record.get('status') & SC.Record.READY) {
      record.removeObserver('status', this, found);
      
      // test the deletion
      ok(fixtures.fixtureForStoreKey(store, storeKey), 'precond - fixtures should have data for record');
      
      record.addObserver('status', function() {
        if (record.get('status') & SC.Record.DESTROYED_CLEAN) {
          ok(!fixtures.fixtureForStoreKey(store, storeKey), 'fixtures should no longer have data for record');
          window.start();
        }
      });
      
      store.destroyRecord(Sample.File, "136");
      store.commitRecords();
    }
  };
  record.addObserver('status', this, found);
  
  ok(record, 'precond - must have record in store');
  
  record.notifyPropertyChange('status');
  
  SC.RunLoop.end();
  
  window.stop();
});

test("Create a record and commit it", function() {
  SC.RunLoop.begin();
  
  var fixtures = store.get('dataSource'),
      dataHash = { guid: '200', name: 'Software', fileType: 'software', url: '/emily_parker/Software', isDirectory: true, parent: '10', children: 'Collection', createdAt: 'June 15, 2007', modifiedAt: 'June 15, 2007', filetype: 'directory', isShared: true, sharedAt: 'October 15, 2007', sharedUntil: 'March 31, 2008', sharedUrl: '2fhty', isPasswordRequired: true },
      record = store.createRecord(Sample.File, dataHash),
      storeKey;
  
  ok(record, "record was created");
  ok(record.get('status') & SC.Record.READY_NEW, "record created in memory but not committed to server yet");
  
  record.addObserver("status", function() {
    if (record.get("status") & SC.Record.READY_CLEAN) {
      storeKey = Sample.File.storeKeyFor(dataHash.guid);
      ok(fixtures.fixtureForStoreKey(store, storeKey), 'should have data hash in fixtures');
      
      window.start();
    }
  });
  
  store.commitRecords();
  
  SC.RunLoop.end();
  
  stop();
});


test("Update and commit a record", function() {
  SC.RunLoop.begin();
  
  var record   = store.find(Sample.File, "10"),
      storeKey = Sample.File.storeKeyFor("10"),
      fixtures = store.get('dataSource'), 
      fixture = fixtures.fixtureForStoreKey(store, storeKey);
  
  var found = function() {
    if (record.get("status") & SC.Record.READY) {
      record.removeObserver("status", found);
      
      equals(fixture.name, record.get('name'), 'precond - fixture state should match name');
      
      record.addObserver("status", function() {
        if (record.get('status') & SC.Record.READY) {
          fixture = fixtures.fixtureForStoreKey(store, storeKey);
          equals(fixture.name, record.get('name'), 'fixture state should update to match new name');
          window.start();
        }
      });
      
      record.set('name', 'foo');
      store.commitRecords();
    }
  };

  record.addObserver("status", found);
  record.notifyPropertyChange('status');
  
  SC.RunLoop.end();
  
  stop();  
});
