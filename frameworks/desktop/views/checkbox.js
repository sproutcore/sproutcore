// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2011 Strobe Inc. and contributors.
//            Portions ©2008-2011 Apple Inc. All rights reserved.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================

/** @class

  Represents a Checkbox Button.
  
  The view is an `SC.ButtonView` put into toggle mode and with the 'theme' property
  set to "checkbox".
  
  Rendering
  ----------------------------
  SC.ButtonView delegates its rendering to its theme. As the theme is set
  to "checkbox", the way the checkbox renders (including DOM) will actually
  be different than SC.ButtonView's.
  
  @extends SC.ButtonView
  @since SproutCore 1.0
*/
SC.CheckboxView = SC.ButtonView.extend(SC.StaticLayout,
/** @scope SC.CheckboxView.prototype */ {

  /**
    @type Array
    @default ['sc-checkbox-view', 'sc-checkbox-control']
    @see SC.View#classNames
  */
  classNames: ['sc-checkbox-view', 'sc-checkbox-control'],

  /**
    @type String
    @default 'label'
    @see SC.View#tagName
  */
  tagName: 'label',

  /**
    The WAI-ARIA role of checkbox.

    @type String
    @readOnly
  */
  ariaRole: 'checkbox',

  // no special theme for Checkbox; button defaults to 'square', so we have to stop that.
  themeName: null,
  
  /**
    @type String
    @default 'checkboxRenderDelegate'
  */
  renderDelegateName: 'checkboxRenderDelegate',

  /**
    Ellipsis is disabled by default to allow multiline text
    
    @type Boolean
    @default NO
  */
  needsEllipsis: NO,
  
  /**
    `YES` if `isEnabled` is `YES`, `NO` otherwise
    
    @type Boolean
    @default NO
    @observes isEnabled
  */
  acceptsFirstResponder: function() {
    if(!SC.SAFARI_FOCUS_BEHAVIOR) return this.get('isEnabled');
    else return NO;
  }.property('isEnabled'),
  
  
  /** @private */
  mouseDown: function(evt) {
    if(!this.get('isEnabled')) return YES;
    this.set('isActive', YES);
    this._isMouseDown = YES;
    // even if radiobuttons are not set to get firstResponder, allow default 
    // action, that way textfields loose focus as expected.
    if (evt) evt.allowDefault();
    return YES;
  },
  
  /** @private */
  mouseUp: function(evt) {
    this.set('isActive', NO);
    this._isMouseDown = NO;

    if(!this.get('isEnabled')) {
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
  
  
  /** @private */
  touchStart: function(evt) {
    return this.mouseDown(evt);
  },
  
  /** @private */
  touchEnd: function(evt) {
    return this.mouseUp(evt);
  }
    
}) ;
