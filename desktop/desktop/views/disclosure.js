// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2011 Strobe Inc. and contributors.
//            Portions ©2008-2010 Apple Inc. All rights reserved.
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
  
  theme: 'disclosure',
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
  
  /** @private */
  render: function(context, firstTime) {
    var title = this.get('displayTitle');
    if(firstTime) {
      context.push('<img src="', SC.BLANK_IMAGE_URL, '" class="button" alt="" />');
      if(this.get('needsEllipsis')) {
        context.push('<span class="ellipsis sc-button-label">',title,'</span>');
      }
      else {
        context.push('<span class="sc-button-label">', title,'</span>');  
      }
    }
    else {
      this.$('label').text(title);
    }
  },
  
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
