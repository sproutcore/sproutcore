// ==========================================================================
// Project:   Greenhouse.ViewConfig
// Copyright: ©2010 Mike Ball
// ==========================================================================
/*globals Greenhouse js_beautify*/

/** @class

  (Document your Model here)

  @extends SC.Record
  @version 0.1
*/
Greenhouse.ViewConfig = SC.Record.extend(
/** @scope Greenhouse.ViewConfig.prototype */ {
  
  primaryKey: 'path',
  
  views: SC.Record.toMany('Greenhouse.Design', {nested: YES}),
  panes: SC.Record.toMany('Greenhouse.Design', {nested: YES}),
  controllers: SC.Record.toMany('Greenhouse.Design', {nested: YES}),
  canEdit: SC.Record.attr(Boolean),
  name: SC.Record.attr(String),
  path: SC.Record.attr(String),
  
  body: function(){
    var ret = {name: this.get('name'), path: this.get('path'), views: [], controllers: [], panes: []},
        views = this.get('views'),
        controllers = this.get('controllers'),
        panes = this.get('panes');
    
    
    views.forEach(function(i){
      ret.views.push(i.get('attributes'));
    });
    
    controllers.forEach(function(i){
      ret.controllers.push(i.get('attributes'));
    });
    
    panes.forEach(function(i){
      ret.panes.push(i.get('attributes'));
    });
    
    return js_beautify(SC.json.encode(ret));
  }.property('views', 'panes', 'controllers')
  
}) ;
Greenhouse.CONFIG_QUERY = SC.Query.remote(Greenhouse.ViewConfig);
