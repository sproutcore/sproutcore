// ==========================================================================
// Project:   Docs.Method
// Copyright: ©2011 My Company, Inc.
// ==========================================================================
/*globals Docs */

/** @class

  (Document your Model here)

  @extends SC.Record
  @version 0.1
*/
Docs.Method = SC.Record.extend(
/** @scope Docs.Method.prototype */ {

  childRecordNamespace: Docs,
  type: 'Method',

  name: SC.Record.attr(String),
  displayName: SC.Record.attr(String),
  objectType: SC.Record.attr(String),
  isPrivate: SC.Record.attr(Boolean, {defaultValue: NO}),
  isStatic: SC.Record.attr(Boolean, {defaultValue: NO}),
  author: SC.Record.attr(String),
  see: SC.Record.attr(Array, {defaultValue: []}),
  since: SC.Record.attr(String),
  version: SC.Record.attr(String),
  deprecated: SC.Record.attr(String),
  augments: SC.Record.toMany(Docs.Entity, {isMaster: YES}),
  overview: SC.Record.attr(String),
  exceptions: SC.Record.toMany(Docs.Entity, {isMaster: YES}),
  returns: SC.Record.toMany(Docs.Entity, {isMaster: YES}),
  icon: sc_static('images/method_icon.png'),

  returnType: function() {
    return this.getPath('returns.lastObject.objectType');
  }.property('returns').cacheable(),

  returnText: function() {
    console.log('returnText',this.getPath('returns'));
    return this.getPath('returns.lastObject.desc');
  }.property('returns').cacheable(),

  signature: function() {
    return 'signature';
  }.property('name','params').cacheable(),

  params: function() {
    var dataHash = Docs.store.readDataHash(this.get('storeKey'));
    var params = dataHash.params || [];

    var simpleParams = params.map(function(item,index){
      return {type: item.type, name: item.name};
    });

    return simpleParams;
  }.property().cacheable(),

  returns: function() {
    var dataHash = Docs.store.readDataHash(this.get('storeKey'));
    var returns = dataHash.returns || [];

    var returnObj = returns[returns.length-1];

    return returnObj;
  }.property().cacheable(),

  formattedOverview: function() {
    var overview = this.get('overview');

    var converter = new Showdown.converter();
    var html = converter.makeHtml(overview);

    return html;
  }.property('overview').cacheable()

}) ;
