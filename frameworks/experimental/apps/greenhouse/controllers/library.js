// ==========================================================================
// Project:   Greenhouse.libraryController
// Copyright: ©2010 Mike Ball
// ==========================================================================
/*globals Greenhouse */

/** @class
  Based on SCUI.SearchableTreeController
  http://github.com/etgryphon/sproutcore-ui/blob/master/frameworks/foundation/controllers/searchable_tree.js  
  Thanks to Evin Grano and Brandon Blatnick!
  
  @extends SC.ArrayController
*/

Greenhouse.libraryController = SC.TreeController.create( SC.CollectionViewDelegate,
/** @scope Greenhouse.libraryController.prototype */ {
  /**
    Call this method whenever you want to reload the library from hte server
  */
  reload: function() {
    var configQuery = Greenhouse.CONFIG_QUERY, target = Greenhouse.targetController.get('content');
    configQuery.set('app', target.get('name'));
    var files = Greenhouse.store.find(configQuery), root = SC.Object.create({treeItemIsExpanded: YES});
    root.set('contents', files);
    this.set('content', root);
  },
  
  views: SC.outlet('content.treeItemChildren.0.treeItemChildren'),
  // ..........................................................
  // Collection View delegate drag methods
  //    
  collectionViewShouldBeginDrag: function(view) { 
    return YES; 
  },

  /**
    Called by the collection view just before it starts a drag so that 
    you can provide the data types you would like to support in the data.

    You can implement this method to return an array of the data types you
    will provide for the drag data.

    If you return null or an empty array, can you have set canReorderContent
    to YES on the CollectionView, then the drag will go ahead but only 
    reordering will be allowed.  If canReorderContent is NO, then the drag
    will not be allowed to start.

    If you simply want to control whether a drag is allowed or not, you
    should instead implement collectionViewShouldBeginDrag().

    The default returns an empty array.

    @param view {SC.CollectionView} the collection view to begin dragging.
    @returns {Array} array of supported data types.
  */
  collectionViewDragDataTypes: function(view) { return ['SC.Object']; },

  /**
    Called by a collection view when a drag concludes to give you the option
    to provide the drag data for the drop.

    This method should be implemented essentially as you would implement the
    dragDataForType() if you were a drag data source.  You will never be asked
    to provide drag data for a reorder event, only for other types of data.

    The default implementation returns null.

    @param view {SC.CollectionView} 
      the collection view that initiated the drag

    @param dataType {String} the data type to provide
    @param drag {SC.Drag} the drag object
    @returns {Object} the data object or null if the data could not be provided.
  */
  collectionViewDragDataForType: function(view, drag, dataType) {
    var ret = (dataType === 'SC.Object') ? this.get('selection').firstObject() : null;
    return ret ;
  },
  
  ghostActsLikeCursor: YES,
  
  /**
    Renders a drag view for the passed content indexes. If you return null
    from this, then a default drag view will be generated for you.

    @param {SC.CollectionView} view
    @param {SC.IndexSet} dragContent
    @returns {SC.View} view or null
  */
  collectionViewDragViewFor: function(view, dragContent) {
    var selectedItemIndex = dragContent.firstObject();
    var itemView = view.itemViewForContentIndex(selectedItemIndex);
    return itemView;
  },

  /**
    Allows the ghost view created in collectionViewDragViewFor to be displayed
    like a cursor instead of the default implementation. This sets the view 
    origin to be the location of the mouse cursor.

    @property {Boolean} ghost view acts like a cursor
  */
  ghostActsLikeCursor: YES,


  // ..........................................................
  // type ahead search code
  // 
  search: null,
  searchResults: [],
  searchKey: 'name',
  iconKey: 'icon',
  nameKey: 'name',

  init: function(){
    sc_super();
    this.set('searchResults', []);
    this._runSearch();
  },

  _searchDidChange: function(){
    this._runSearch();
  }.observes('search', 'content'),

 _sanitizeSearchString: function(str){
   var specials = [
       '/', '.', '*', '+', '?', '|',
       '(', ')', '[', ']', '{', '}', '\\'
   ];
   var s = new RegExp('(\\' + specials.join('|\\') + ')', 'g');
   return str.replace(s, '\\$1');
 },

 _runSearch: function(){
   var searchResults = [];
   var search = this.get('search');
   var c = this.get('content');
   if(search === null || search === '' || search === undefined){ 
     this.set('searchResults', c);
   }
   else {
     search = this._sanitizeSearchString(search).toLowerCase();
     var searchRegex = new RegExp(search,'i');
     var searchKey = this.get('searchKey');
     this._iconKey = this.get('iconKey');
     this._nameKey = this.get('nameKey');
     searchResults = this._runSearchOnItem(c, search, searchRegex, searchKey);

     // create the root search tree
     var searchedTree = SC.Object.create({
       treeItemIsExpanded: YES,
       treeItemChildren: searchResults
     });
     this.set('searchResults', searchedTree);
   }
 },

 /** 
   @private
   Returns a flat list of matches for the foldered tree item.
 */
 _runSearchOnItem: function(treeItem, search, searchRegex, searchKey) {
   var searchMatches = [], iconKey = this.get('iconKey'),
       searchedList, key, searchLen, 
       children, nameKey = this._nameKey, that;

   if (SC.none(treeItem)) return searchMatches;

   children = treeItem.get('treeItemChildren');
   if (!children) children = treeItem.get('children');
   that = this;
   children.forEach( function(child){      
     if (child.treeItemChildren) {
       var searchedList = that._runSearchOnItem(child, search, searchRegex, searchKey);
       searchedList.forEach( function(m){ searchMatches.push(m); });
     }

     if (searchKey && child.get(searchKey)) {
       key = child.get(searchKey).toLowerCase();
       if(key.match(searchRegex)){
         var match = SC.Object.create({});
         match[searchKey]  = child.get(searchKey);
         match[nameKey]    = child.get(nameKey);
         match.treeItem    = child;
         match.icon        = child.get(this._iconKey);
         searchMatches.push(match);
       } 
     }
   });

   return searchMatches;
 }
  
}) ;
