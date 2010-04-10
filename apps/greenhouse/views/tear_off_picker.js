// ==========================================================================
// Project:   Greenhouse.TearOffPicker
// Copyright: ©2009 My Company, Inc.
// ==========================================================================
/*globals Greenhouse */
/** @class

  @extends SC.PickerPane
*/
Greenhouse.TearOffPicker = SC.PickerPane.extend(
/** @scope Greenhouse.TearOffPicker.prototype */ {
  
  mouseDragged: function(evt){
    this.set('isModal', NO);
    this.set('isAnchored', NO);
    
    return sc_super();
  }
});