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
Docs.Entity = SC.Record.extend(
/** @scope Docs.Entity.prototype */ {

  childRecordNamespace: Docs,

  type: 'Entity',

  title: SC.Record.attr(String),
  objectType: SC.Record.attr(String, {key: 'type'}),
  name: SC.Record.attr(String),
  isOptional: SC.Record.attr(Boolean, {defaultValue: NO}),
  defaultValue: SC.Record.attr(String),
  desc: SC.Record.attr(String)

}) ;
