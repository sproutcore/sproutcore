// ==========================================================================
// Project:   Greenhouse.Design
// Copyright: ©2010 Mike Ball
// ==========================================================================
/*globals Greenhouse */

/** @class

  (Document your Model here)

  @extends SC.Record
  @version 0.1
*/
Greenhouse.Design = SC.Record.extend(
/** @scope Greenhouse.Design.prototype */ {
  primaryKey: 'scClass',
  
  name: SC.Record.attr(String),
  scClass: SC.Record.attr(String),
  defaults: SC.Record.attr(Object),
  
  canEdit: function(){
    return this.getPath('parentRecord.canEdit');
  }.property('parentRecord').cacheable()
  
}) ;
