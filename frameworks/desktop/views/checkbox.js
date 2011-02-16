// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2010 Sprout Systems, Inc. and contributors.
//            Portions ©2008-2010 Apple Inc. All rights reserved.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================

/** @class

  Represents a Checkbox Button.
  
  The view is an SC.ButtonView put into toggle mode and with the 'theme' property
  set to "checkbox".
  
  Rendering
  ----------------------------
  SC.ButtonView delegates its rendering to its theme. As the theme is set
  to "checkbox", the way the checkbox renders (including DOM) will actually
  be different than SC.ButtonView's.
  
  @extends SC.FieldView
  @since SproutCore 1.0
*/
SC.CheckboxView = SC.ButtonView.extend(SC.StaticLayout, SC.Button,
  /** @scope SC.CheckboxView.prototype */ {

  classNames: ['sc-checkbox-view', 'sc-checkbox-control'],
  tagName: 'label',

  /**
    The WAI-ARIA role of checkbox. This property's value should not be
    changed.

    @property {String}
  */
  ariaRole: 'checkbox',

  /**
    The WAI-ARIA attribute for the checkbox. This property is assigned to
    'aria-labelledby' attribute, which defines a string value that labels the
    checkbox element. Used to support voiceover.It should be assigned a non-empty
    string, if the 'aria-labelledby' attribute has to be set for the element.

    @property {String}
  */
  ariaLabeledBy: null,

  /**
    The WAI-ARIA attribute for the checkbox. This property is assigned to
    'aria-label' attribute, which defines a string value that labels the
    checkbox element. Used to support voiceover. It is used when it is not
    possible to have a visible label on the screen. It should be assigned a non-empty
    string, if the 'aria-label' attribute has to be set for the element.

    @property {String}
  */
  ariaLabel: null,

  // no special theme for Checkbox; button defaults to 'square', so we have to stop that.
  themeName: null,
  renderDelegateName: 'checkboxRenderDelegate',

  /* Ellipsis is disabled by default to allow multiline text */
  needsEllipsis: NO,
  
  acceptsFirstResponder: function() {
    if(!SC.SAFARI_FOCUS_BEHAVIOR) return this.get('isEnabled');
    else return NO;
  }.property('isEnabled'),
  
  
  mouseDown: function(evt) {
    if(!this.get('isEnabled')) return YES;
    this.set('isActive', YES);
    this._isMouseDown = YES;
    // even if radiobuttons are not set to get firstResponder, allow default 
    // action, that way textfields loose focus as expected.
    if (evt) evt.allowDefault();
    return YES;
  },
  
  mouseUp: function(evt) {
    this.set('isActive', NO);
    this._isMouseDown = NO;

    if(!this.get('isEnabled') || 
      (evt && evt.target && !this.$().within(evt.target))) {
      return YES;
    }
    var val = this.get('value');
    if (val === this.get('toggleOnValue')) {

      this.set('value', this.get('toggleOffValue'));
    }
    else {
      this.set('value', this.get('toggleOnValue'));
    }
    return YES;
  },
  
  
  touchStart: function(evt) {
    return this.mouseDown(evt);
  },
  
  touchEnd: function(evt) {
    return this.mouseUp(evt);
  }
    
}) ;
