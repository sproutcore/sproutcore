// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2011 Strobe Inc. and contributors.
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

  classNames: ['sc-checkbox-view'],
  tagName: 'label',

  /* Ellipsis is disabled by default to allow multiline text */
  needsEllipsis: NO,

  render: function(context, firstTime) {
    var dt, elem,
        value = this.get('value'),
        ariaValue = value === SC.MIXED_MODE ? 
                'mixed' : (value === this.get('toggleOnValue') ? 
                    'true': 'false');
    
    // add checkbox -- set name to view guid to separate it from others
    if (firstTime) {
      var blank = SC.BLANK_IMAGE_URL,
          disabled = this.get('isEnabled') ? '' : 'disabled="disabled"',
          guid = SC.guidFor(this);
      
      context.attr('role', 'checkbox');
      dt = this._field_currentDisplayTitle = this.get('displayTitle');

      if(SC.browser.msie) context.attr('for', guid);
      context.push('<span class="button" ></span>');
      if(this.get('needsEllipsis')){
        context.push('<span class="label ellipsis">', dt, '</span>');
      }else{
        context.push('<span class="label">', dt, '</span>');  
      }
      context.attr('name', guid);

    // since we don't want to regenerate the contents each time 
    // actually search for and update the displayTitle.
    } else {
      
      dt = this.get('displayTitle');
      if (dt !== this._field_currentDisplayTitle) {
        this._field_currentDisplayTitle = dt;
        this.$('span.label').text(dt);
      }
    }
    context.attr('aria-checked', ariaValue);
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
      this.$().attr('aria-checked', 'false');
      this.set('value', this.get('toggleOffValue'));
    }
    else {
      this.$().attr('aria-checked', 'true');
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
