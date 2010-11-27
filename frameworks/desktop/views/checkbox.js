// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2010 Sprout Systems, Inc. and contributors.
//            Portions ©2008-2010 Apple Inc. All rights reserved.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================

/** @class

  Renders a checkbox button view specifically.
  
  This view is basically a button view preconfigured to generate the correct
  HTML and to set to use a TOGGLE_BEHAVIOR for its buttons.
  
  This view renders a simulated checkbox that can display a mixed state and 
  has other features not found in platform-native controls.  
  
  @extends SC.FieldView
  @since SproutCore 1.0
*/
SC.CheckboxView = SC.ButtonView.extend(SC.StaticLayout, SC.Button,
  /** @scope SC.CheckboxView.prototype */ {

  classNames: ['sc-checkbox-view', 'sc-checkbox-control'],
  tagName: 'label',
  ariaRole: 'checkbox',
  theme: '', 

  /* Ellipsis is disabled by default to allow multiline text */
  needsEllipsis: NO,
  
  /** 
    This is temporary , while we reimplement radio buttons without input 
    tags.
  */
  routeTouch: NO,
  
  createRenderer: function(t) {
    return t.checkboxControl();
  },
  
  updateRenderer: function(r) {
    // get value; we're gonna need it.
    var value = this.get('value');
    
    // set settings
    r.attr({
      title: this.get("displayTitle"),
      name: SC.guidFor(this),
      ariaValue: value === SC.MIXED_MODE ? 'mixed' : (value === this.get('toggleOnValue') ? 'true' : 'false'),
      needsEllipsis: this.get('needsEllipsis'),
      escapeHTML: this.get('escapeHTML'),
      icon: this.get('icon')
    });
  },
  
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
      this.renderer.attr('ariaValue', 'false');
      this.renderer.update();
      this.set('value', this.get('toggleOffValue'));
    }
    else {
      this.renderer.attr('ariaValue', 'true');
      this.renderer.update();
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
