// ==========================================================================
// Project:   Greenhouse.viewConfigsController
// Copyright: ©2010 Mike Ball
// ==========================================================================
/*globals Greenhouse */

/** @class
  
  
  @extends SC.ArrayController
*/

Greenhouse.viewConfigsController = SC.ArrayController.create(
/** @scope Greenhouse.viewConfigsController.prototype */ {

  /**
    Call this method whenever you want to relaod the view configs from the server.
  */
  reload: function() {
    var configQuery = Greenhouse.CONFIG_QUERY, target = Greenhouse.targetController.get('content');
    configQuery.set('app', target.get('name'));
    var files = Greenhouse.store.find(configQuery);
    this.set('content', files);
  },
  
  _content_status_changed: function(){
    var c = this.get('content'), that = this;    
    if(c && c.get && c.get('status') && c.get('status') === SC.Record.READY_CLEAN){
      Greenhouse.libraryController.set('content', SC.Object.create({
        treeItemIsExpanded: YES,
        treeItemChildren: [
          SC.Object.create({
            name: 'Views',
            treeItemIsExpanded: YES,
            treeItemChildren: that.get('views')
          }),
          SC.Object.create({
            name: 'Controllers',
            treeItemIsExpanded: YES,
            treeItemChildren: that.get('controllers')
          }),
          SC.Object.create({
            name: 'Panes',
            treeItemIsExpanded: YES,
            treeItemChildren: that.get('panes')
          })
        ]
      }));
    }
  }.observes('*content.status'),
  
  refreshContent: function(){
   this._content_status_changed(); 
  },
  
  /** 
    Generates the arrays of views, panes and controllers that can be dropped into this app
  */
  views: function() {
    return this._collect_all_the_elements('views');
  }.property('[]').cacheable(),
  
  panes: function() {
    return this._collect_all_the_elements('panes');
    
  }.property('[]').cacheable(),
  
  controllers: function() {
    return this._collect_all_the_elements('controllers');
    
  }.property('[]').cacheable(),
  
  
  _collect_all_the_elements: function(key){
    var c = this.get('content'), ret = [], subItem;
    if(c && c.get('length') > 0){
      c.forEach(function(vc){
        subItem = vc.get(key);
        if(subItem){
          subItem.forEach(function(item){
            ret.pushObject(item);
          });
        }
      });
    }
    return ret;
  },
  /*
    lists the editable views
  */
  editable: function(){
    var ret = [], c =this.get('content');
    if(c){
      c.forEach(function(item){
        if(item.get('canEdit') === YES) ret.pushObject(item);
      });
    }
    return ret;
  }.property('content').cacheable()
}) ;
