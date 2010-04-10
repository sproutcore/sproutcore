// ==========================================================================
// Greenhouse.DropDown
// ==========================================================================
/*globals Greenhouse*/

sc_require('core');

/** @mixin
  This mixin allows a toggling view to show/hide a drop-down when the view
  is toggled.  The user should set the 'dropDown' property to a SC.PickerPane or descendant
  class.  When the view is toggled on, an instance of the dropDown will be
  created and shown.
  
  NOTE: This mixin must be used in conjunction with the SCUI.SimpleButton mixin or
        on a SC.ButtonView or descendant.  It needs the target and action properties to work.

  @author Jonathan Lewis
  @author Brandon Blatnick
  
  This Mixin comes from SCUI: http://github.com/etgryphon/sproutcore-ui and is 
  avaliable under the MIT license

*/

Greenhouse.DropDown = {  
  
  isShowingDropDown: NO,
  
  /**
    @private
    Reference to the drop down instance that gets created in init().
  */
  _dropDownPane: null,
  
  dropDown: SC.MenuPane.design({ /* an example menu */
    layout: { width: 100, height: 0 },
    contentView: SC.View.design({}),
    items: ["_item".loc('1'), "_item".loc('2')] // Changed to an array for Localization purposes.
  }),
  
  dropDownType: SC.PICKER_MENU,
  
  initMixin: function() {
    // Try to create a new menu instance
    var dropDown = this.get('dropDown');
    if (dropDown && SC.typeOf(dropDown) === SC.T_CLASS) {
      this._dropDownPane = dropDown.create();
      if (this._dropDownPane) {
        this.bind('isShowingDropDown', '._dropDownPane.isPaneAttached');
      }
    }

    // TODO: [BB] Check for existance of target and action
    if (this.target !== undefined && this.action !== undefined) {
      this.set('target', this);
      this.set('action', 'toggle');
    }  
  },
  
  /**  
    Hides the attached drop down if present.  This is called automatically when
    the button gets toggled off.
  */
  hideDropDown: function() {
    if (this._dropDownPane && SC.typeOf(this._dropDownPane.remove) === SC.T_FUNCTION) {
      this._dropDownPane.remove();
      this.set('isShowingDropDown', NO);
    }
  },

  /**
    Shows the menu.  This is called automatically when the button is toggled on.
  */
  showDropDown: function() {
    // If a menu already exists, get rid of it
    this.hideDropDown();

    // Now show the menu
    if (this._dropDownPane && SC.typeOf(this._dropDownPane.popup) === SC.T_FUNCTION) {
      var dropDownType = this.get('dropDownType');
      this._dropDownPane.popup(this, dropDownType); // show the drop down
      this.set('isShowingDropDown', YES);
    }
  },
  
  /**
    Toggles the menu on/off accordingly
  */
  toggle: function() {
    if (this.get('isShowingDropDown')){
      this.hideDropDown();
    }
    else {
      this.showDropDown();
    }
  }
};
