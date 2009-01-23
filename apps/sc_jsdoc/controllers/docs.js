// ==========================================================================
// JsDoc.docsController
// ==========================================================================

JsDoc.docsController = SC.Object.create({
  
  // This is used in the client warning dialog.
  windowLocation: window.location.href.toString(),
  
  // This is the current client name.
  clientName: '',
  
  clientRoot: '',
  
  isRebuilding: false,
  
  canRebuild: NO,
  
  nowShowingContainer: function() {
    return (this.get('isRebuilding')) ? 'rebuilding' : (this.get('selectedDoc')) ? 'runner' : 'empty' ;
  }.property('isRebuilding', 'selectedDoc'),
  
  // This is displayed as the main UI label.
  displayClientName: function() {
    var clientName = (this.get('clientName') || '').humanize().capitalize() ;
    if (clientName.toLowerCase() == 'sproutcore') clientName = 'SproutCore';
    return "%@ Reference".fmt(clientName) ;
  }.property('clientName'),
  
  nowShowingLabel: function() {
    var sel = this.get('selection') ;  
    var rec = (sel && sel.get('length') > 0) ? sel.objectAt(0) : null ;
    return (rec) ? rec.get('title') : '' ;
  }.property('selection'),
  
  arrangedObjects: [],
  selection: [],
  
  selectedDoc: function() {
    var sel = this.get('selection') ;
    return (sel && sel.length > 0) ? sel[0] : null ;
  }.property('selection'),
  
  reloadJsDoc: function() {
    
    // Use Ajax to ask the server for the latest set of tests for the 
    // current client.
    var clientName = this.get('clientName') ;
    var clientRoot = this.get('clientRoot') ;
    // clientRoot = clientRoot.replace(new RegExp("^%@/?".fmt(window.indexPrefix)), window.urlPrefix + '/');
    clientRoot = 'static/%@'.fmt(clientRoot) ;
    console.log('clientName: '+ clientRoot) ; 
    JsDoc.server.request(clientRoot, ['data',('classes.js?'+ Math.random())].join('/'), null, {
      onSuccess: this._reloadSuccess.bind(this),
      onFailure: this._reloadFailure.bind(this)
    }) ;
  },
  
  _reloadSuccess: function(status, transport) {
    var json = transport.responseText ;
    var records = eval(json) ;
    if (SC.typeOf(records) != T_ARRAY) {
      return this._reloadFailure(status, transport) ;
    }
    
    // update the list of tests from the server.  The return value will be
    // the records included in the list.  This is what will become our new
    // list.
    var recs = SC.Store.updateRecords(records, this, JsDoc.Doc, true);
    console.log('recs: %@'.fmt(recs)) ;
    
    // show warning panel if the records are empty.  Also reload tests
    // periodically so that when the user resolves the problem, we can start
    // working away immediately.
    if (recs.length == 0) {
      // SC.page.get('noJsDocPanel').set('isVisible',true) ;
      this.invokeLater(this.reloadJsDoc,2000) ; 
    } else {
      // SC.page.get('noJsDocPanel').set('isVisible',false) ;
    }
    
    this.set('allRecords', recs) ;
  },
  
  rebuildArrangedJsDoc: function() {
    
    var search = this.get('search') ;
    var recs = this.get('allRecords') ;
    
    // filter out search
    if (search && search.length > 0) {
      search = search.toLowerCase() ;
      var filtered =[];
      var idx = recs.get('length') ;
      while(--idx >= 0) {
        var rec = recs.objectAt(idx) ;
        var symbols = (rec.get('symbols') || '') ;
        if (symbols.indexOf(search) >= 0) filtered.push(rec) ;
      }
      recs = filtered ;
    }
    
    // sort the records by name and set as the new arrangedObjects.
    recs = recs.sort(function(a,b) {
      
      var g_a = a.get('group') || '';
      var g_b = b.get('group') || '';
      var groupCompare = g_a.localeCompare(g_b) ;
      
      if (groupCompare == 0) {
        a = a.get('guid') || '' ;
        b = b.get('guid') || '' ;
        return a.localeCompare(b) ;
      } else return groupCompare ;
    }) ;
    
    var hadArrangedObjects = this.get('arrangedObjects').length > 0 ;
    this.set('arrangedObjects', recs) ;
    
    // if the current selection is not in the list, clear the selection.
    var doc = this.get('selectedDoc') ;
    if (doc && !(recs.include(doc))) this.set('selection', []) ;
  }.observes('allRecords', 'search'),
  
  _reloadFailure: function(status, transport) {
    console.log('DOC RELOAD FAILED!') ;
  },
  
  rebuildJsDoc: function() {
    var clientName = this.get('clientName') ;
    var clientRoot = this.get('clientRoot') ;
    JsDoc.server.request(clientRoot, 'index.html', null, {
      nonce: Date.now().toString(),
      onSuccess: this._rebuildSuccess.bind(this),
      onFailure: this._rebuildFailure.bind(this)
    }, 'post') ;
    this.set('isRebuilding', true) ;
  },
  
  _rebuildSuccess: function() {
    this.reloadJsDoc() ;
    this.set('isRebuilding', false) ;
  },

  _rebuildFailure: function() {
    this.set('isRebuilding', false) ;
  }
  
});
