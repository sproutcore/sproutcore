// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2009 Apple, Inc. and contributors.
// License:   Licened under MIT license (see license.js)
// ==========================================================================
/*globals module ok equals same test MyApp Sample */

var store, Application;

module("SC.Store Core Methods", {
  setup: function() {
    var dataSource = SC.DataSource.create({});
    
    Application = {};
    
    Application.File = SC.Record.extend({ });
    Application.FileDisk = SC.Record.extend({ });
    
    Application.Data = {
      
      "FileDisk": [
        { guid: '14', name: 'Main Drive', parent: null, children: null }
      ],
    
      "File": [
        { guid: '10', name: 'Home', url: '/emily_parker', isDirectory: true, parent: null, children: 'Collection'},
        { guid: '11', name: 'Documents', fileType: 'documents', url: '/emily_parker/Documents', isDirectory: true, parent: '10', children: 'Collection', createdAt: 'June 15, 2007', modifiedAt: 'October 21, 2007', filetype: 'directory', isShared: false},
        { guid: '137',name: 'Library', fileType: 'library', url: '/emily_parker/Library', isDirectory: true, parent: '10', children: 'Collection', createdAt: 'June 15, 2007', modifiedAt: 'October 21, 2007', filetype: 'directory', isShared: false},
        { guid: '12', name: 'Movies', fileType: 'movies', url: '/emily_parker/Movies', isDirectory: true, parent: '10', children: 'Collection', createdAt: 'June 15, 2007', modifiedAt: 'June 15, 2007', filetype: 'directory', isShared: true, sharedAt: 'October 15, 2007', sharedUntil: 'March 31, 2008', sharedUrl: '2fhty', isPasswordRequired: true},
        { guid: '134',name: 'Music', fileType: 'music', url: '/emily_parker/Music', isDirectory: true, parent: '10', children: 'Collection', createdAt: 'June 15, 2007', modifiedAt: 'June 15, 2007', filetype: 'directory', isShared: true, sharedAt: 'October 15, 2007', sharedUntil: 'March 31, 2008', sharedUrl: '2fhty', isPasswordRequired: true},
        { guid: '135',name: 'Pictures', fileType: 'pictures', url: '/emily_parker/Pictures', isDirectory: true, parent: '10', children: 'Collection', createdAt: 'June 15, 2007', modifiedAt: 'June 15, 2007', filetype: 'directory', isShared: true, sharedAt: 'October 15, 2007', sharedUntil: 'March 31, 2008', sharedUrl: '2fhty', isPasswordRequired: true},
        { guid: '13', name: 'Auto Insurance', fileType: 'folder', url: '/emily_parker/Documents/Auto%20Insurance', isDirectory: true, parent: '11', children: 'Collection', createdAt: 'June 15, 2007', modifiedAt: 'October 21, 2007', filetype: 'directory', isShared: false},
        { guid: '14', name: 'Birthday Invitation.pdf', fileType: 'file', url: '/emily_parker/Documents/Birthday%20Invitation', isDirectory: false, parent: '11', createdAt: 'October 17, 2007', modifiedAt: 'October 21, 2007', filetype: 'pdf', isShared: false},
        { guid: '136', name: 'Software', fileType: 'software', url: '/emily_parker/Software', isDirectory: true, parent: '10', children: 'Collection', createdAt: 'June 15, 2007', modifiedAt: 'June 15, 2007', filetype: 'directory', isShared: true, sharedAt: 'October 15, 2007', sharedUntil: 'March 31, 2008', sharedUrl: '2fhty', isPasswordRequired: true}
      ]
    };
    
    store = SC.Store.create().from(dataSource);
    for(var i in Application.Data) {
      store.loadRecords(Application[i], Application.Data[i]);
    }
    
    // make sure RecordType by String can map
    window.Application = Application;
  }    
});

test("Verify loadRecords() loads data", function() {
  
  equals(store.find(Application.File, '14').get('name'), 'Birthday Invitation.pdf', 'should return File 14');
  equals(store.find(Application.FileDisk, '14').get('name'), 'Main Drive', 'should return FileDisk 14');
  
});

test("Verify storeKeys() gets all store keys", function() {
  
  var storeKey;
  
  equals(store.storeKeys().length, 10, 'Length should be 10');
  
  storeKey = store.storeKeyFor(Application.File, '10');
  store.writeStatus(storeKey, SC.Record.EMPTY);
  equals(store.storeKeys().length, 9, 'Length should be one less now');
  
});

test("find() should take both SC.Record object and SC.Record string as recordtype argument", function() {
  
  equals(store.find('Application.File', '14').get('name'), 'Birthday Invitation.pdf', 'should return File 14');
  equals(store.find(Application.File, '14').get('name'), 'Birthday Invitation.pdf', 'should return FileDisk 14');
  
});

