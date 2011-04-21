// ==========================================================================
// Project:   Docs.Property
// Copyright: ©2011 My Company, Inc.
// ==========================================================================
/*globals Docs */

/** @class

  (Document your Model here)

  @extends SC.Record
  @version 0.1
*/
Docs.Property = SC.Record.extend(
/** @scope Docs.Property.prototype */ {

  childRecordNamespace: Docs,

  type: 'Property',

  icon: sc_static('images/property_icon.png'),

  name: SC.Record.attr(String),
  displayName: SC.Record.attr(String),
  objectType: SC.Record.attr(String),
  propertyType: SC.Record.attr(String),
  author: SC.Record.attr(String),
  see: SC.Record.attr(Array, {defaultValue: []}),
  since: SC.Record.attr(String),
  version: SC.Record.attr(String),
  deprecated: SC.Record.attr(String),
  memberOf: SC.Record.attr(String),
  overview: SC.Record.attr(String),
  defaultValue: SC.Record.attr(String),
  isConstant: SC.Record.attr(Boolean, {defaultValue: NO}),
  isPrivate: SC.Record.attr(Boolean, {defaultValue: NO}),

  formattedOverview: function() {
    var overview = this.get('overview');

    var converter = new Showdown.converter();
    var html = converter.makeHtml(overview);

    return html;
  }.property('overview').cacheable()

}) ;
