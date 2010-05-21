// ==========================================================================
// Project:   Greenhouse.Design
// Copyright: ©2010 My Company, Inc.
// ==========================================================================
/*globals Greenhouse */

/** @class

  (Document your Model here)

  @extends SC.Record
  @version 0.1
*/
Greenhouse.Design = SC.Record.extend(
/** @scope Greenhouse.Design.prototype */ {
  primaryKey: 'name',
  
  name: SC.Record.attr(String),
  scClass: SC.Record.attr(String),
  defaults: SC.Record.attr(Object)
  
}) ;
