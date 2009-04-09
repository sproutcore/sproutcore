// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2009 Sprout Systems, Inc. and contributors.
//            Portions ©2008-2009 Apple, Inc. All rights reserved.
// License:   Licened under MIT license (see license.js)
// ==========================================================================

/*jslint evil:true */

// Constants
SC.TOGGLE_BEHAVIOR = 'toggle';
SC.PUSH_BEHAVIOR =   'push';
SC.TOGGLE_ON_BEHAVIOR = "on";
SC.TOGGLE_OFF_BEHAVIOR = "off" ;  

/** @class

  Implements a push-button-style button.  This class is used to implement 
  both standard push buttons and tab-style controls.  See also SC.CheckboxView
  and SC.RadioView which are implemented as field views, but can also be 
  treated as buttons.
  
  @extends SC.View
  @extends SC.Control
  @extends SC.Button
  @since SproutCore 1.0  
*/
SC.ButtonView = SC.View.extend(SC.Control, SC.Button, SC.StaticLayout,
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
    Optionally set the behavioral mode of this button.  
  
    Possible values are:

    - *SC.PUSH_BEHAVIOR* Pressing the button will trigger an action tied to the button. Does not change the value of the button.
    - *SC.TOGGLE_BEHAVIOR* Pressing the button will invert the current value of the button. If the button has a mixed value, it will be set to true.
    - *SC.TOGGLE_ON_BEHAVIOR* Pressing the button will set the current state to true no matter the previous value.
    - *SC.TOGGLE_OFF_BEHAVIOR* Pressing the button will set the current state to false no matter the previous value.
  
  */  
  buttonBehavior: SC.PUSH_BEHAVIOR,

  /**
    If YES, then this button will be triggered when you hit return.
    
    This is the same as setting the keyEquivalent to 'return'.  This will also
    apply the "def" classname to the button.
  */
  isDefault: NO,
  isDefaultBindingDefault: SC.Binding.oneWay().bool(),
  
  /**
    If YES, then this button will be triggered when you hit escape.
    
    This is the same as setting the keyEquivalent to 'escape'.
  */  
  isCancel: NO,
  isCancelBindingDefault: SC.Binding.oneWay().bool(),

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
    this.didTriggerAction();
    this.invokeLater('set', 200, 'isActive', NO);
    return true;
  },
  
  /**
    This method is called anytime the button's action is triggered.  You can implement this method in your own subclass to perform any cleanup needed after an action is performed.
  */
  didTriggerAction: function() {},

  /**
    The minimum width the button title should consume.  This property is used
    when generating the HTML styling for the title itself.  The default 
    width of 80 usually provides a nice looking style, but you can set it to 0
    if you want to disable minimum title width.
    
    Note that the title width does not exactly match the width of the button
    itself.  Extra padding added by the theme can impact the final total
    size.
  */
  titleMinWidth: 80,
  
  // ................................................................
  // INTERNAL SUPPORT

  /** @private - save keyEquivalent for later use */
  init: function() {
    sc_super();
    
    //cache the key equivalent
    if(this.get("keyEquivalent")) this._defaultKeyEquivalent = this.get("keyEquivalent"); 
  },

  _TEMPORARY_CLASS_HASH: {},
  
  // display properties that should automatically cause a refresh.
  // isCancel and isDefault also cause a refresh but this is implemented as 
  // a separate observer (see below)
  displayProperties: ['href', 'icon', 'title', 'value', 'toolTip'],

  render: function(context, firstTime) {
    // add href attr if tagName is anchor...
    if (this.get('tagName') === 'a') {
      var href = this.get('href');
      if (!href || (href.length === 0)) href = "javascript"+":;";
      context.attr('href', href);
    }

    // If there is a toolTip set, grab it and localize if necessary.
    var toolTip = this.get('toolTip') ;
    if(SC.typeOf(toolTip) === SC.T_STRING) {
        context.attr('title', this.get('localize') ? toolTip.loc() : toolTip) ;
    }
    
    // add some standard attributes & classes.
    var classes = this._TEMPORARY_CLASS_HASH;
    classes.def = this.get('isDefault');
    classes.cancel = this.get('isCancel');
    classes.icon = !!this.get('icon');
    context.attr('role', 'button')
      .setClass(classes).addClass(this.get('theme'));
    // render inner html 
    context = context.begin('span')
      .addClass('sc-button-inner').addStyle('minWidth', this.get('titleMinWidth'));
      this.renderTitle(context, firstTime) ; // from button mixin
    context = context.end();
   },
  
  /** @private {String} used to store a previously defined key equiv */
  _defaultKeyEquivalent: null,
  
  /** @private
    Whenever the isDefault or isCancel property changes, update the display and change the keyEquivalent.
  */  
  _isDefaultOrCancelDidChange: function() {
    var isDef = !!this.get('isDefault') ;
    var isCancel = !isDef && this.get('isCancel') ;
    
    if(this.didChangeFor('defaultCancelChanged','isDefault','isCancel')) {
      this.displayDidChange() ; // make sure to update the UI
      if (isDef) {
        this.set('keyEquivalent', 'return'); // change the key equivalent
      } else if (isCancel) {
        this.setIfChanged('keyEquivalent', 'escape') ;
      } else {
        //restore the default key equivalent
        this.set("keyEquivalent",this._defaultKeyEquivalent);
      }
    }
      
  }.observes('isDefault', 'isCancel'),
    
  isMouseDown: false, 

  /** @private 
    On mouse down, set active only if enabled.
  */    
  mouseDown: function(evt) {
    if (!this.get('isEnabled')) return YES ; // handled event, but do nothing
    this.set('isActive', YES);
    this._isMouseDown = YES;
    return YES ;
  },

  /** @private
    Remove the active class on mouseOut if mouse is down.
  */  
  mouseExited: function(evt) {
    if (this._isMouseDown) this.set('isActive', NO);
    return YES;
  },

  /** @private
    If mouse was down and we renter the button area, set the active state again.
  */  
  mouseEntered: function(evt) {
    this.set('isActive', this._isMouseDown);
    return YES;
  },

  /** @private
    ON mouse up, trigger the action only if we are enabled and the mouse was released inside of the view.
  */  
  mouseUp: function(evt) {
    if (this._isMouseDown) this.set('isActive', NO); // track independently in case isEnabled has changed
    this._isMouseDown = false;
    var inside = this.$().within(evt.target) ;
    if (inside && this.get('isEnabled')) this._action(evt) ;
    return true ;
  },

  /** @private  Perform an action based on the behavior of the button.
  
   - toggle behavior: switch to on/off state
   - on behavior: turn on.
   - off behavior: turn off.
   - otherwise: invoke target/action
  */
  _action: function(evt) {
    switch(this.get('buttonBehavior')) {
      
    // When toggling, try to invert like values. i.e. 1 => 0, etc.
    case SC.TOGGLE_BEHAVIOR:
      var sel = this.get('isSelected') ;
      if (sel) {
        this.set('value', this.get('toggleOffValue')) ;
      } else {
        this.set('value', this.get('toggleOnValue')) ;
      }
      break ;
      
    // set value to on.  change 0 => 1.
    case SC.TOGGLE_ON_BEHAVIOR:
      this.set('value', this.get('toggleOnValue')) ;
      break ;
      
    // set the value to false. change 1 => 0
    case SC.TOGGLE_OFF_BEHAVIOR:
      this.set('value', this.get('toggleOffValue')) ;
      break ;
      
    // otherwise, just trigger an action if there is one.
    default:
      //if (this.action) this.action(evt);
      var action = this.get('action');
      var target = this.get('target') || null;
      if (action) {
        if (this._hasLegacyActionHandler()) {
          // old school... 
          this._triggerLegacyActionHandler(evt);
        } else {
          // newer action method + optional target syntax...
          this.getPath('pane.rootResponder').sendAction(action, target, this, this.get('pane'));
        }
      }
    }
  },
  
  /** @private */
  _hasLegacyActionHandler: function()
  {
    var action = this.get('action');
    if (action && (SC.typeOf(action) == SC.T_FUNCTION)) return true;
    if (action && (SC.typeOf(action) == SC.T_STRING) && (action.indexOf('.') != -1)) return true;
    return false;
  },

  /** @private */
  _triggerLegacyActionHandler: function( evt )
  {
    if (!this._hasLegacyActionHandler()) return false;
    
    var action = this.get('action');
    if (SC.typeOf(action) == SC.T_FUNCTION) this.action(evt);
    if (SC.typeOf(action) == SC.T_STRING) {
      eval("this.action = function(e) { return "+ action +"(this, e); };");
      this.action(evt);
    }
  }
  
}) ;

