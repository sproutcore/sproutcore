// ==========================================================================
// Project:   Greenhouse.viewConfigsController
// Copyright: ©2009 Mike Ball
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
            ret.push(SC.Object.create(item));
          });
        }
      });
    }
    return ret;
  }
}) ;
