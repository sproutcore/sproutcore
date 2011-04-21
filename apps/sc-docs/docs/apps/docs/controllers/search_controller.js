// ==========================================================================
// Project: SproutCore
// Copyright: ©2011 COMPANY.
// ==========================================================================
/*globals SC*/

/** @class

  Manages the search feature

  @author Majd Taby
  @extends SC.Object
  @since SproutCore 1.5
*/
Docs.searchController = SC.Object.create({
  searchQuery: '',

  runQuery: function(sender){
    this._runSearch(sender.get('value'));
  },

  queryDidChange: function(){
    var query = this.get('searchQuery');
    if (!query) {
      this._clearSearch();
    }

    this._runSearch(query);

  }.observes('searchQuery'),

  _clearSearch: function(){
      Docs.classesController.set('content',Docs.allClassesRecordArray);
  },

  _runSearch: function(query){

    var matches = this._findMatchesForQuery(query);

    if (matches) {
      Docs.classesController.set('content',matches);
    }
  },

  _findMatchesForQuery: function(query) {
    var indexHash = Docs.get('indexHash');
    var classMatches = [];
    var symbolMatches = null;

    // Go through every symbol, try to match the name of the class first
    for(var name in indexHash){

      if (name.indexOf(query) !== -1) {
        var storeObject = Docs.store.materializeRecord(indexHash[name]);
        classMatches.push(storeObject);
      }
    };

    return classMatches;
  }
});
