// ==========================================================================
// Project:   Greenhouse.ApplicationListItem
// Copyright: ©2010 Mike Ball
// ==========================================================================
/*globals Greenhouse */

/** @class

  This class is here to receive custom editor events
  @extends SC.View
*/
Greenhouse.ApplicationListItem = SC.ListItemView.extend(
/** @scope Greenhouse.ApplicationListItem.prototype */ {
  render: function(context, firstTime) {
    if(this.get('contentIndex') === 0) context.addClass('first')
    sc_super();
  }
  
});
