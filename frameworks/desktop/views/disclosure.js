// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2009 Sprout Systems, Inc. and contributors.
//            Portions ©2008-2009 Apple Inc. All rights reserved.
// License:   Licened under MIT license (see license.js)
// ==========================================================================

/**
  @class
  
  Disclosure triangle button.
  
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
    if(firstTime){
      context.push('<img src="', SC.BLANK_IMAGE_URL, '" class="button" alt="" />');
      if(this.get('needsEllipsis')){
        context.push('<label class="ellipsis">',this.get('displayTitle'),'</label>');
      }else{
        context.push('<label>',this.get('displayTitle'),'</label>');  
      }
    }else{
      this.$('label')[0].text = this.get('displayTitle');
    }
  },
  
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
