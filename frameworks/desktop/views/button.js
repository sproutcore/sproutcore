// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2010 Sprout Systems, Inc. and contributors.
//            Portions ©2008-2010 Apple Inc. All rights reserved.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================

/*jslint evil:true */

/** @class

  Implements a push-button-style button.  This class is used to implement 
  both standard push buttons and tab-style controls.  See also SC.CheckboxView
  and SC.RadioView which are implemented as field views, but can also be 
  treated as buttons.
  
  By default, a button uses the SC.Control mixin which will apply CSS 
  classnames when the state of the button changes:
    - active     when button is active
    - sel        when button is toggled to a selected state
  
  @extends SC.View
  @extends SC.Control
  @extends SC.Button
  @since SproutCore 1.0  
*/
SC.ButtonView = SC.View.extend(SC.Control, SC.Button, SC.StaticLayout,
/** @scope SC.ButtonView.prototype */ {
  
  /**
    What type of element this view is represented as
    
    @property {String}
  */
  tagName: 'div',

  /**
    Class names that will be applied to this view
    
    @property {Array}
  */
  classNames: ['sc-button-view'],
  
  /**
    optionally set this to the theme you want this button to have.  
    
    This is used to determine the type of button this is.  You generally 
    should set a class name on the HTML with the same value to allow CSS 
    styling.
    
    The default SproutCore theme supports "regular", "capsule", "checkbox", 
    and "radio"
    
    @property {String}
  */
  theme: 'square',
  
  /**
    Optionally set the behavioral mode of this button.  
  
    Possible values are:
    - *SC.PUSH_BEHAVIOR* Pressing the button will trigger an action tied to the 
      button. Does not change the value of the button.
    - *SC.TOGGLE_BEHAVIOR* Pressing the button will invert the current value of 
      the button. If the button has a mixed value, it will be set to true.
    - *SC.TOGGLE_ON_BEHAVIOR* Pressing the button will set the current state to 
      true no matter the previous value.
    - *SC.TOGGLE_OFF_BEHAVIOR* Pressing the button will set the current state to 
      false no matter the previous value.
      
    @property {String}
  */
  buttonBehavior: SC.PUSH_BEHAVIOR,

  /*
    If buttonBehavior is SC.HOLD_BEHAVIOR, this specifies, in miliseconds, how 
    often to trigger the action. Ignored for other behaviors.
    
    @property {Number}
  */
  holdInterval: 100,

  /**
    If YES, then this button will be triggered when you hit return.
    
    This is the same as setting the keyEquivalent to 'return'.  This will also
    apply the "def" classname to the button.
    
    @property {Boolean}
  */
  isDefault: NO,
  isDefaultBindingDefault: SC.Binding.oneWay().bool(),
  
  /**
    If YES, then this button will be triggered when you hit escape.
    This is the same as setting the keyEquivalent to 'escape'.
    
    @property {Boolean}
  */  
  isCancel: NO,
  isCancelBindingDefault: SC.Binding.oneWay().bool(),

  /**
    The button href value.  This can be used to create localized button href 
    values.  Setting an empty or null href will set it to javascript:;
    
    @property {String}
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
    
    @property {String}
  */
  action: null,
  
  /**
    The target object to invoke the action on when the button is pressed.
    
    If you set this target, the action will be called on the target object
    directly when the button is clicked.  If you leave this property set to
    null, then the button will search the responder chain for a view that 
    implements the action when the button is pressed instead.
    
    @property {Object}
  */
  target: null,
  
  /** 
    If YES, use a focus ring.
    
    @property {Boolean}
  */
  supportFocusRing: NO,
  
  _labelMinWidthIE7: 0,

  /**
    Called when the user presses a shortcut key, such as return or cancel,
    associated with this button.

    Highlights the button to show that it is being triggered, then, after a
    delay, performs the button's action.

    Does nothing if the button is disabled.

    @param {Event} evt
    @returns {Boolean} success/failure of the request
  */
  triggerAction: function(evt) {
    // If this button is disabled, we have nothing to do
    if (!this.get('isEnabled')) return NO;

    // Set active state of the button so it appears highlighted
    this.set('isActive', YES);

    // Invoke the actual action method after a small delay to give the user a
    // chance to see the highlight. This is especially important if the button
    // closes a pane, for example.
    this.invokeLater('_triggerActionAfterDelay', 200, evt);
    return YES;
  },

  /** @private
    Called by triggerAction after a delay; this method actually
    performs the action and restores the button's state.

    @param {Event} evt
  */
  _triggerActionAfterDelay: function(evt) {
    this._action(evt, YES);
    this.didTriggerAction();
    this.set('isActive', NO);
  },

  /**
    This method is called anytime the button's action is triggered.  You can 
    implement this method in your own subclass to perform any cleanup needed 
    after an action is performed.
    
    @property {function}
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
    
    @property {Number}
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
  
  
  /**
    This property is used to call the right render style for the button.
    * This might be a future way to start implementing the render method
    as part of the theme
  */ 
  
  renderStyle: 'renderDefault', //SUPPORTED DEFAULT, IMAGE

  render: function(context, firstTime) {
    // add href attr if tagName is anchor...
    var href, toolTip, classes, theme;
    if (this.get('tagName') === 'a') {
      href = this.get('href');
      if (!href || (href.length === 0)) href = "javascript:;";
      context.attr('href', href);
    }

    // If there is a toolTip set, grab it and localize if necessary.
    toolTip = this.get('toolTip') ;
    if (SC.typeOf(toolTip) === SC.T_STRING) {
      if (this.get('localize')) toolTip = toolTip.loc() ;
      context.attr('title', toolTip) ;
      context.attr('alt', toolTip) ;
    }
    
    // add some standard attributes & classes.
    classes = this._TEMPORARY_CLASS_HASH;
    classes.def = this.get('isDefault');
    classes.cancel = this.get('isCancel');
    classes.icon = !!this.get('icon');
    context.attr('role', 'button').setClass(classes);
    theme = this.get('theme');
    if (theme && !context.hasClass(theme)) context.addClass(theme);
    
    // render inner html 
    this[this.get('renderStyle')](context, firstTime);
  },
   
   
  /**
    Render the button with the default render style.
  */
  renderDefault: function(context, firstTime){
    if(firstTime) {
      context = context.push("<span class='sc-button-inner' style = 'min-width:"
        ,this.get('titleMinWidth'),
        "px'>");
    
      this.renderTitle(context, firstTime) ; // from button mixin
      context.push("</span>") ;
    
      if(this.get('supportFocusRing')) {
        context.push('<div class="focus-ring">',
                      '<div class="focus-left"></div>',
                      '<div class="focus-middle"></div>',
                      '<div class="focus-right"></div></div>');
      }
    }
    else {
      this.renderTitle(context, firstTime) ;
    }
  },
  
  /**
    Render the button with the image render style. To set image 
    set the icon property with the classname that has the style with the image
  */
  renderImage: function(context, firstTime){
    var icon = this.get('icon');
    context.addClass('no-min-width');
    if(icon) context.push("<div class='img "+icon+"'></div>");
    else context.push("<div class='img'></div>");
  },
  
  /** @private {String} used to store a previously defined key equiv */
  _defaultKeyEquivalent: null,
  
  /** @private
    Whenever the isDefault or isCancel property changes, update the display and change the keyEquivalent.
  */  
  _isDefaultOrCancelDidChange: function() {
    var isDef = !!this.get('isDefault'),
        isCancel = !isDef && this.get('isCancel') ;
    
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
    var buttonBehavior = this.get('buttonBehavior');

    if (!this.get('isEnabled')) return YES ; // handled event, but do nothing
    this.set('isActive', YES);
    this._isMouseDown = YES;

    if (buttonBehavior === SC.HOLD_BEHAVIOR) {
      this._action(evt);
    } else if (!this._isFocused && (buttonBehavior!==SC.PUSH_BEHAVIOR)) {
      this._isFocused = YES ;
      this.becomeFirstResponder();
      if (this.get('isVisibleInWindow')) {
        this.$()[0].focus();
      }
    }

    return YES ;
  },

  /** @private
    Remove the active class on mouseExited if mouse is down.
  */
  mouseExited: function(evt) {
    if (this._isMouseDown) {
      this.set('isActive', NO);
    }
    return YES;
  },

  /** @private
    If mouse was down and we renter the button area, set the active state again.
  */  
  mouseEntered: function(evt) {
    if (this._isMouseDown) {
      this.set('isActive', YES);
    }
    return YES;
  },

  /** @private
    ON mouse up, trigger the action only if we are enabled and the mouse was released inside of the view.
  */  
  mouseUp: function(evt) {
    if (this._isMouseDown) this.set('isActive', NO); // track independently in case isEnabled has changed
    this._isMouseDown = false;

    if (this.get('buttonBehavior') !== SC.HOLD_BEHAVIOR) {
      var inside = this.$().within(evt.target) ;
      if (inside && this.get('isEnabled')) this._action(evt) ;
    }

    return YES ;
  },
  
  touchStart: function(touch){
    var buttonBehavior = this.get('buttonBehavior');

    if (!this.get('isEnabled')) return YES ; // handled event, but do nothing
    this.set('isActive', YES);

    if (buttonBehavior === SC.HOLD_BEHAVIOR) {
      this._action(touch);
    } else if (!this._isFocused && (buttonBehavior!==SC.PUSH_BEHAVIOR)) {
      this._isFocused = YES ;
      this.becomeFirstResponder();
      if (this.get('isVisibleInWindow')) {
        this.$()[0].focus();
      }
    }

    // don't want to do whatever default is...
    touch.preventDefault();

    return YES;
  },
  
  touchesDragged: function(evt, touches) {
    if (!this.touchIsInBoundary(evt)) {
      if (!this._touch_exited) this.set('isActive', NO);
      this._touch_exited = YES;
    } else {
      if (this._touch_exited) this.set('isActive', YES);
      this._touch_exited = NO;
    }
    
    evt.preventDefault();
    return YES;
  },
  
  touchEnd: function(touch){
    this._touch_exited = NO;
    this.set('isActive', NO); // track independently in case isEnabled has changed

    if (this.get('buttonBehavior') !== SC.HOLD_BEHAVIOR) {
      if (this.touchIsInBoundary(touch)) this._action();
    }
    
    touch.preventDefault();
    return YES ;
  },
  
  
  /** @private */
  keyDown: function(evt) {
    // handle tab key
    if (evt.which === 9) {
      var view = evt.shiftKey ? this.get('previousValidKeyView') : this.get('nextValidKeyView');
      if(view) view.becomeFirstResponder();
      else evt.allowDefault();
      return YES ; // handled
    }    
    if (evt.which === 13) {
      this.triggerAction(evt);
      return YES ; // handled
    }
    return NO; 
  },

  /** @private  Perform an action based on the behavior of the button.
  
   - toggle behavior: switch to on/off state
   - on behavior: turn on.
   - off behavior: turn off.
   - otherwise: invoke target/action
  */
  _action: function(evt, skipHoldRepeat) {
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

    case SC.HOLD_BEHAVIOR:
      this._runHoldAction(evt, skipHoldRepeat);
      break ;

    // otherwise, just trigger an action if there is one.
    default:
      //if (this.action) this.action(evt);
      this._runAction(evt);
    }
  },

  /** @private */
  _runAction: function(evt) {
    var action = this.get('action'),
        target = this.get('target') || null,
        rootResponder = this.getPath('pane.rootResponder');

    if (action) {
      if (this._hasLegacyActionHandler()) {
        // old school... V
        this._triggerLegacyActionHandler(evt);
      } else {
        if (rootResponder) {
          // newer action method + optional target syntax...
          rootResponder.sendAction(action, target, this, this.get('pane'));
        }
      }
    }
  },

  /** @private */
  _runHoldAction: function(evt, skipRepeat) {
    if (this.get('isActive')) {
      this._runAction();

      if (!skipRepeat) {
        // This run loop appears to only be necessary for testing
        SC.RunLoop.begin();
        this.invokeLater('_runHoldAction', this.get('holdInterval'), evt);
        SC.RunLoop.end();
      }
    }
  },
  
  /** @private */
  _hasLegacyActionHandler: function()
  {
    var action = this.get('action');
    if (action && (SC.typeOf(action) === SC.T_FUNCTION)) return true;
    if (action && (SC.typeOf(action) === SC.T_STRING) && (action.indexOf('.') != -1)) return true;
    return false;
  },

  /** @private */
  _triggerLegacyActionHandler: function( evt )
  {
    if (!this._hasLegacyActionHandler()) return false;
    
    var action = this.get('action');
    if (SC.typeOf(action) === SC.T_FUNCTION) this.action(evt);
    if (SC.typeOf(action) === SC.T_STRING) {
      eval("this.action = function(e) { return "+ action +"(this, e); };");
      this.action(evt);
    }
  },
  
  /** tied to the isEnabled state */
  acceptsFirstResponder: function() {
    if(!SC.SAFARI_FOCUS_BEHAVIOR) return this.get('isEnabled');
    else return NO;
  }.property('isEnabled'),
  
  willBecomeKeyResponderFrom: function(keyView) {
    // focus the text field.
    if (!this._isFocused) {
      this._isFocused = YES ;
      this.becomeFirstResponder();
      if (this.get('isVisibleInWindow')) {
        var elem=this.$()[0];
        if (elem) elem.focus();
      }
    }
  },
  
  willLoseKeyResponderTo: function(responder) {
    if (this._isFocused) this._isFocused = NO ;
  },
  
  didAppendToDocument: function() {
    if(parseInt(SC.browser.msie, 0)===7 && this.get('useStaticLayout')){
      var layout = this.get('layout'),
          elem = this.$(), w=0;
      if(elem && elem[0] && (w=elem[0].clientWidth) && w!==0 && this._labelMinWidthIE7===0){
        var label = this.$('.sc-button-label'),
            paddingRight = parseInt(label.css('paddingRight'),0),
            paddingLeft = parseInt(label.css('paddingLeft'),0),
            marginRight = parseInt(label.css('marginRight'),0),
            marginLeft = parseInt(label.css('marginLeft'),0);
        if(marginRight=='auto') console.log(marginRight+","+marginLeft+","+paddingRight+","+paddingLeft);
        if(!paddingRight && isNaN(paddingRight)) paddingRight = 0;
        if(!paddingLeft && isNaN(paddingLeft)) paddingLeft = 0;
        if(!marginRight && isNaN(marginRight)) marginRight = 0;
        if(!marginLeft && isNaN(marginLeft)) marginLeft = 0;
        
        this._labelMinWidthIE7 = w-(paddingRight + paddingLeft)-(marginRight + marginLeft);
        label.css('minWidth', this._labelMinWidthIE7+'px');
      }else{
        this.invokeLater(this.didAppendToDocument, 1);
      }
    }
  }
  
}) ;

// ..........................................................
// CONSTANTS
//
SC.TOGGLE_BEHAVIOR = 'toggle';
SC.PUSH_BEHAVIOR =   'push';
SC.TOGGLE_ON_BEHAVIOR = 'on';
SC.TOGGLE_OFF_BEHAVIOR = 'off';
SC.HOLD_BEHAVIOR = 'hold';

/**
  The delay after which "click" behavior should transition to "click and hold"
  behavior. This is used by subclasses such as PopupButtonView and
  SelectButtonView.

  @constant
  @type Number
*/
SC.ButtonView.CLICK_AND_HOLD_DELAY = SC.browser.msie ? 600 : 300;

SC.REGULAR_BUTTON_HEIGHT=24;

