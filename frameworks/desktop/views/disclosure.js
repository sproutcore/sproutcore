// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2009 Sprout Systems, Inc. and contributors.
//            Portions ©2008-2009 Apple Inc. All rights reserved.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================

/**
  @class
  
  Disclosure triangle button. As a subclass of SC.ButtonView, this view
  takes a lot of the same properties as a button:
  
  - isEnabled: whether disclosure triangle is clickable or not
  - value: YES or NO (where YES implies expanded/open)
  
  @extends SC.ButtonView
  @since SproutCore
*/
SC.DisclosureView = SC.ButtonView.extend(
/** @scope SC.DisclosureView.prototype */ {
  
  classNames: ['sc-disclosure-view'],
  
  controlStyle: 'disclosure',
  buttonBehavior: SC.TOGGLE_BEHAVIOR,
  
  /**
    This is the value that will be set when the disclosure triangle is toggled
    open.
  */
  toggleOnValue: YES,
  
  /**
    The value that will be set when the disclosure triangle is toggled closed.
  */
  toggleOffValue: NO,
  
  /** @private */
  valueBindingDefault: SC.Binding.bool() ,
  
  createRenderer: function(theme) {
    var ret = theme.disclosureControl();
    this.updateRenderer(ret);
    return ret;
  },
  
  updateRenderer: function(renderer) {
    renderer.attr({
      icon: this.get('icon'),
      isActive: this.get('isActive'),
      isEnabled: this.get('isEnabled'),
      isSelected: this.get('isSelected'),
      needsEllipsis: this.get('needsEllipsis'),
      state: this.value === this.get('toggleOnValue') ? YES : NO,
      title: this.get('displayTitle')
    });
  },
  
  /** @private */
  // render: function(context, firstTime) {
  //   var title = this.get('displayTitle');
  //   if(firstTime) {
  //     context.push('<img src="', SC.BLANK_IMAGE_URL, '" class="button" alt="" />');
  //     if(this.get('needsEllipsis')) {
  //       context.push('<span class="ellipsis sc-button-label">',title,'</span>');
  //     }
  //     else {
  //       context.push('<span class="sc-button-label">', title,'</span>');  
  //     }
  //   }
  //   else {
  //     this.$('label').text(title);
  //   }
  // },
  
  /**
    Allows toggling of the value with the right and left arrow keys. 
    Extends the behavior inherted from SC.ButtonView.
    
    @param evt
  */
  keyDown: function(evt) {
    if (evt.which === 37 || evt.which === 38) {  
      this.set('value', this.get('toggleOffValue')) ;
      return YES;
    }
    if (evt.which === 39 || evt.which === 40) {  
      this.set('value', this.get('toggleOnValue')) ;
      return YES;
    }
    sc_super();
  }
  
});
