// ==========================================================================
// Project:   Greenhouse.File
// Copyright: ©2010 Mike Ball
// ==========================================================================
/*jslint evil: true*/
/*globals Greenhouse*/

require('core');
/** @class

  file properties
  @property dir
  @property name
  
  @extends SC.ChildRecord
  @version 0.1
*/
Greenhouse.File = SC.Record.extend(
/** @scope Greenhouse.File.prototype */ {
  type: 'File',
  nestedRecordNamespace: Greenhouse,
  name: SC.Record.attr(String),
  dir: SC.Record.attr(String),
  body: SC.Record.attr(String),
  primaryKey: 'id',
  
  isFile: YES,

  path: function(){
    return this.get('dir') + this.get('name');
  }.property('name', 'dir').cacheable(),
  
  pageRegex: function(){
    var b = this.get('body'), re =/(\w+)\.(\w+)\s*=\s*SC\.Page\.(design|create)/;
    return b ? b.match(re): b;
  }.property('body').cacheable(),
  
  isPage: function(){
    return this.get('pageRegex') !== null;
  }.property('pageRegex').cacheable(),
  
  pageName: function(){
    var r = this.get('pageRegex') || [];
    return "%@.%@".fmt(r[1],r[2]);
  }.property('pageRegex').cacheable()

}) ;
Greenhouse.FILES_QUERY = SC.Query.remote(Greenhouse.File);
Greenhouse.File.mixin({

});
