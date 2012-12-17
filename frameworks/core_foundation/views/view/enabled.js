sc_require("views/view");

SC.View.reopen(
  /** @scope SC.View.prototype */ {
  // ..........................................................
  // IS ENABLED SUPPORT
  //

  /**
    Set to true when the item is enabled.   Note that changing this value
    will alter the isVisibleInWindow property for this view and any
    child views as well as to automatically add or remove a 'disabled' CSS
    class name.

    This property is observable and bindable.

    @property {Boolean}
  */
  isEnabled: YES,
  isEnabledBindingDefault: SC.Binding.oneWay().bool(),

  /**
    Computed property returns YES if the view and all of its parent views
    are enabled in the pane.  You should use this property when deciding
    whether to respond to an incoming event or not.

    This property is not observable.

    @property {Boolean}
  */
  isEnabledInPane: function() {
    var ret = this.get('isEnabled'), pv ;
    if (ret && (pv = this.get('parentView'))) { ret = pv.get('isEnabledInPane'); }
    return ret ;
  }.property('parentView', 'isEnabled'),

  /** @private
    Observes the isEnabled property and resigns first responder if set to NO.
    This will avoid cases where, for example, a disabled text field retains
    its focus rings.

    @observes isEnabled
  */
  _sc_view_isEnabledDidChange: function(){
    if(!this.get('isEnabled') && this.get('isFirstResponder')){
      this.resignFirstResponder();
    }
  }.observes('isEnabled'),

  applyAttributesToContext: function(original, context) {
    var isEnabled = this.get('isEnabled');

    original(context);

    context.setClass('disabled', !isEnabled);
    context.setAttr('aria-disabled', !isEnabled ? YES : null);
  }.enhance()
});
