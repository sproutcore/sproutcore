// ========================================================================
// SproutCore
// copyright 2006-2008 Sprout Systems, Inc.
// ========================================================================

require('views/view') ;

/** @class

  This is a basic menu item for inclusion in a popup menu.  This is a type
  of button that will automatically close the popup menu when it is
  pressed.
  
  @extends SC.ButtonView
  
*/
SC.MenuItemView = SC.ButtonView.extend({

  emptyElement: [
  '<li class="button menu-item">',
    '<a href="javascript:;">',
      '<span class="sel">&#x2713;</span>',
      '<span class="mixed">-</span>',
      '<span class="inner">',
      '<span class="label"></span>',
      '</span>',
      '<span class="shortcut"></span>',
    '</a>',
  '</li>'].join(''),
  
  // this method returns the computed required width.  This is potentially
  // expensive, so don't call it often.  It is intended to be used with the
  // wrapper MenuView that will decide how wide to make the menu.
  computedRequiredWidth: function() {
    
    var ret = 0;
    
    // first, get the left edge offset for the .inner span.
    // we expect this to make room for any checkboxes that might appear on 
    // the left and required spacing on the right.
    var el = this.$sel('.inner') ;
    if (el) {
      ret = el.offsetLeft ;
      ret += parseInt(Element.getStyle(el, 'padding-left'),0) ;
      ret += parseInt(Element.getStyle(el, 'padding-right'),0) ;
    }
    
    // next, add in the width of any img tag.
    var img = Element.$sel(el,'img') ;
    if (img) {
      ret += Element.getDimensions(img).width ;
    }
    
    // next add in the width of any label.  We assume this includes the width
    // of the label text itself.
    el = Element.$sel(el, '.label') ;
    if (el) {
      ret += Element.getDimensions(el).width ;
    }
    
    // finally, add the width of any shortcut.  We assume this includes any
    // padding required to go between the label and the shortcut.
    el = this.$sel('.shortcut') ;
    if (el) {
      ret += Element.getDimensions(el).width ;
    }
    
    // that should do it...
    return ret ;
  },
  
  mouseMoved: function(evt)
  {
    if (!this.get('isDefault')) this.get('parentNode').set('currentSelectedMenuItem', this);
  },
  mouseOut: function(evt)
  {
    this.set('isDefault', false);
    this.setClassName('active', false);
  },
  
  mouseUp: function(evt)
  {
    sc_super();
    this._closeParentMenu();
  },
  didTriggerAction: function()
  {
    this._closeParentMenu();
  },
  _closeParentMenu: function()
  {
    var menu = this.get('parentNode');
    if (menu) menu.set('isVisible', false);
  }
  
});
