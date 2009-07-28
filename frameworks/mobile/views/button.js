// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2009 Sprout Systems, Inc. and contributors.
//            Portions ©2008-2009 Apple Inc. All rights reserved.
// License:   Licened under MIT license (see license.js)
// ==========================================================================

/** @class

  Implements a push-button-style button.  This class is used to implement 
  both standard push buttons and tab-style controls.  
  
  @extends SC.View
  @extends SC.Control
  @extends SC.Button
  @since SproutCore 1.0  
*/
SC.ButtonView = SC.View.extend(SC.Control, SC.Button,
/** @scope SC.ButtonView.prototype */ {
  
  tagName: 'a',
  classNames: ['sc-button-view'],
  
  /**
    optionally set this to the theme you want this button to have.  
    
    This is used to determine the type of button this is.  You generally 
    should set a class name on the HTML with the same value to allow CSS 
    styling.
    
    The default SproutCore theme supports "regular", "checkbox", and "radio"
  */
  theme: 'square',
  
  /**
    The button href value.  This can be used to create localized button href values.  Setting an empty or null href will set it to javascript:;
  */
  href: '',

  /**
    The name of the action you want triggered when the button is pressed.  
    
    This property is used in conjunction with the target property to execute
    a method when a regular button is pressed.  These properties are not 
    relevant when the button is used in toggle mode.
    
    If you do not set a target, then pressing a button will cause the
    responder chain to search for a view that implements the action you name
    here.  If you set a target, then the button will try to call the method
    on the target itself.
    
    For legacy support, you can also set the action property to a function.  
    Doing so will cause the function itself to be called when the button is
    clicked.  It is generally better to use the target/action approach and 
    to implement your code in a controller of some type.
    
    @type String
  */
  action: null,
  
  /**
    The target object to invoke the action on when the button is pressed.
    
    If you set this target, the action will be called on the target object
    directly when the button is clicked.  If you leave this property set to
    null, then the button will search the responder chain for a view that 
    implements the action when the button is pressed instead.
    
    @type Object
  */
  target: null,
  
  /**
    fakes a click... evt is optional.  
    
    Temporarily highlights the button to show that it is being triggered.  
    Does nothing if the button is disabled. 
    
    @returns {bool} success/failure of the request
  */  
  triggerAction: function(evt) {  
    if (!this.get('isEnabled')) return false;
    this.set('isActive', YES);
    this._action(evt);
    this.invokeLater('set', 200, 'isActive', NO);
    return true;
  },
  
  // ................................................................
  // INTERNAL SUPPORT

  _TEMPORARY_CLASS_HASH: {},
  
  // display properties that should automatically cause a refresh.
  // isCancel and isDefault also cause a refresh but this is implemented as 
  // a separate observer (see below)
  displayProperties: 'href icon title value'.w(),

  render: function(context, firstTime) {
    // add href attr if tagName is anchor...
    if (this.get('tagName') === 'a') {
      var href = this.get('href');
      if (!href || (href.length === 0)) href = "javascript"+":;";
      context.attr('href', href);
    }
    
    // add some standard attributes & classes.
    var classes = this._TEMPORARY_CLASS_HASH, icon = this.get('icon');
    classes.def = this.get('isDefault');
    classes.cancel = this.get('isCancel');
    classes.icon = !!icon;
    context.attr('role', 'button')
      .setClass(classes).addClass(this.get('theme'));
      
    // don't reset the content if the touch is down because we don't want to
    // regenerate the event.
    if (!this._isTouchActive) {
      context = context.begin('span').addClass('sc-button-inner');
      this.renderTitle(context, firstTime) ; // from button mixin
      context = context.end();
    }
   },
  
  _isTouchActive: NO, 

  /** @private 
    On touch start, set active only if enabled.
  */    
  touchStart: function(evt) {
    if (!this.get('isEnabled')) return YES ; // handled event, but do nothing
    this.set('isActive', YES);
    this._isTouchActive = YES;
    return YES ;
  },

  /** @private
    Remove the active class on touchExited if mouse is down.
  */  
  touchExited: function(evt) {
    if (this._isTouchActive) this.set('isActive', NO);
    return YES;
  },

  /** @private
    If mouse was down and we renter the button area, set the active state again.
  */  
  touchEntered: function(evt) {
    this.set('isActive', this._isTouchActive);
    return YES;
  },

  /** @private
    ON mouse up, trigger the action only if we are enabled and the mouse was released inside of the view.
  */  
  touchEnd: function(evt) {
    // track independently in case isEnabled has changed
    if (this._isTouchActive) this.set('isActive', NO); 
    this._isTouchActive = false;
    
    // trigger action if final touch was inside of button frame. 
    // if touch event was cancelled, do not trigger action
    var inside, touchPoint, rect, changed; 
    if (evt.changedTouches.length > 0) {
      changed = evt.changedTouches[0];
      touchPoint = { x: changed.pageX, y: changed.pageY };
      rect = this.convertFrameToView(this.get('frame'), null);
      inside = SC.pointInRect(touchPoint, rect);
    } else inside = YES ;
    if (!evt.cancel && inside && this.get('isEnabled')) this._action(evt) ;
    return true ;
  },

  /** @private  Perform an action based on the behavior of the button.
  
   - toggle behavior: switch to on/off state
   - on behavior: turn on.
   - off behavior: turn off.
   - otherwise: invoke target/action
  */
  _action: function(evt) {
    console.log('action!');
    var action = this.get('action');
    var target = this.get('target') || null;
    var pane   = this.get('pane');
    var responder = pane ? pane.get('rootResponder') : null ;
    if (responder) responder.sendAction(action, target, this, pane);
  }
  
}) ;

