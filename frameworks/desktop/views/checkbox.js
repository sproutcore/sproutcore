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

  render: function(context, firstTime) {
    if (firstTime) {
      this._checkboxRenderer = this.get('theme').renderer('checkbox-control');
    }

    var size = this.get('controlSize'), sel = this.get('isSelected');
    this._checkboxRenderer.attr({
      icon: this.get('icon'),
      formFieldName: SC.guidFor(this),
      title: this.get('displayTitle'),
      escapeHTML: this.get('escapeHTML'),
      needsEllipsis: this.get('needsEllipsis'),

      classNames: {
        'active': this.get('isActive'),
        'sel': sel && (sel !== SC.MIXED_STATE),
        'mixed': sel === SC.MIXED_STATE
      },

      size: size === SC.AUTO_CONTROL_SIZE ? this.get('frame') : size
    });

    if (firstTime) {
      this._checkboxRenderer.render(context);
    } else {
      this._checkboxRenderer.update(context.$());
    }
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
    this.set('isActive', NO);
    this._isMouseDown = NO;
    return YES;
  },
  
  
  touchStart: function(evt) {
    return this.mouseDown(evt);
  },
  
  touchEnd: function(evt) {
    return this.mouseUp(evt);
  }
    
}) ;
