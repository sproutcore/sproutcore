// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2008-2011 Apple Inc. All rights reserved.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================
/*globals Docs */

/** @class

  (Document your Model here)

  @extends SC.Record
  @version 0.1
*/
Docs.Class = SC.Record.extend(
/** @scope Docs.Class.prototype */ {

  //childRecordNamespace: Docs,

  name: SC.Record.attr(String),
  displayName: SC.Record.attr(String),
  objectType: SC.Record.attr(String),
  filePath: SC.Record.attr(String),

  isNamespace: SC.Record.attr(Boolean, {defaultValue: NO}),
  isPrivate: SC.Record.attr(Boolean, {defaultValue: NO}),
  isStatic: SC.Record.attr(Boolean, {defaultValue: NO}),

  author: SC.Record.attr(String),
  see: SC.Record.attr(Array, {defaultValue: []}),
  since: SC.Record.attr(String),
  version: SC.Record.attr(String),
  deprecated: SC.Record.attr(String),

  overview: SC.Record.attr(String),
  augments: SC.Record.toMany('Docs.Entity',{isMaster: YES, nested: YES}),
  methods: SC.Record.toMany('Docs.Method',{isMaster: YES, nested: YES}),
  properties: SC.Record.toMany('Docs.Property',{isMaster: YES, nested: YES}),

  hasProperties: function() {
    return this.getPath('properties.length');
  }.property('properties').cacheable(),

  hasMethods: function() {
    return this.getPath('methods.length');
  }.property('methods').cacheable(),

  extendsFrom: function(){
    var augments = this.get('augments');

    return augments.getEach('desc');
  }.property('augments').cacheable(),

  formattedOverview: function() {
    var overview = this.get('overview');

    var trimmedOverview = Docs.trimCommonLeadingWhitespace(overview);

    var converter = new Showdown.converter();
    var html = converter.makeHtml(trimmedOverview);

    return html;
  }.property('overview').cacheable()

}) ;
