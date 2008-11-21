// ========================================================================
// SproutCore
// copyright 2006-2008 Sprout Systems, Inc.
// ========================================================================

require('views/view') ;
require('mixins/control') ;

// Constants
SC.TOGGLE_BEHAVIOR = 'toggle';
SC.PUSH_BEHAVIOR =   'push';
SC.TOGGLE_ON_BEHAVIOR = "on";
SC.TOGGLE_OFF_BEHAVIOR = "off" ;  

/** @class

  A button handles simple link functions.  It can be set to a selected,
  enabled or disabled state.
  
  @extends SC.View
  @extends SC.Control
  @since SproutCore 1.0  
*/
SC.ButtonView = SC.View.extend(SC.Control,
/** @scope SC.ButtonView.prototype */ {
  
  emptyElement: '<a href="javascript:;" class="sc-view sc-button-view regular"><span class="sc-button-inner button-inner"><span class="sc-button-label label"></span></span></a>',                                                                                                                                                                                                                                                                                     
  
  // PROPERTIES
  
  /**
    Used to automatically update the state of the button view for toggle style
    buttons.
    
    for toggle style buttons, you can set the value and it will be used to
    automatically update the state of the button view.  The value will also
    change as the user selects to deselects.  The button will make its best
    effort to convert this value into a reasonable selection state:
  
    null, false, 0 -> isSelected = false
    any other single value -> isSelected = true
    array -> if all values are the same state: that state.  otherwise MIXED.
    
    @type Object

  */  
  value: false,
  
  /**
    Value of a selected toggle button.
  
    for a toggle button, set this to any object value you want.  The button
    will be selected if the value property equals the targetValue.  If the
    value is an array of multiple items that contains the targetValue, then
    the button will be set to a mixed state.

    default is false
    
    @type Object
  */
  toggleOnValue: true,

  /**
    Value of an unselected toggle button.
  
    For a toggle button, set this to any object value you want.  When the
    user toggle's the button off, the value of the button will be set to this
    value.
  
    default is false 
  
    @type Object

  */
  toggleOffValue: false,
  
  /**
    optionally set this to the theme you want this button to have.  
    
    This is used to determine the type of button this is.  You generally 
    should set a class name on the HTML with the same value to allow CSS 
    styling.
    
    The default SproutCore theme supports "regular", "checkbox", and "radio"
  */
  theme: 'regular',
  
  /**
    Optionally set the behavioral mode of this button.  
  
    Possible values are:

    {{{
     SC.PUSH_BEHAVIOR: ('push')
       Pressing the button will trigger an action tied to the button. Does
       not change the value of the button.
  
     SC.TOGGLE_BEHAVIOR: ('toggle')
       Pressing the button will invert the current value of the button. If
       the button has a mixed value, it will be set to true.
  
     SC.TOGGLE_ON_BEHAVIOR: ('on')
       Pressing the button will set the current state to true no matter the
       previous value.
  
     SC.TOGGLE_OFF_BEHAVIOR: ('off')
       Pressing the button will set the current state to false no matter the
       previous value.
    }}}
  
  */  
  buttonBehavior: SC.PUSH_BEHAVIOR,
  
  /**
    If NO the button will be disabled. 
    
    @type Bool
  */  
  isEnabled: YES,
  
  /**
    button's selection state.  Returns YES, NO, or SC.MIXED_STATE
  */
  isSelected: NO,

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
    If YES, then the title will be localized.
  */
  localize: NO,
  localizeBindingDefault: SC.Binding.bool(),
  
  /**
    The selector path to the element that contains the button title.   You should only set this property when you first configure the button.  Changing it will not cause the button to redisplay.
  */
  titleSelector: '.sc-button-label',

  displayProperties: ['title', 'href', 'isActive'],

  updateDisplay: function() {
    
    sc_super();
    
    // get the title of the button.  if the display title has changed, then update the HTML.
    var title = this.get('displayTitle') ;
    if (title !== this._display_title) {
      this._display_title = title ;
      this.$(this.get('titleSelector') || 'label').text(title);  
    }
    
    // set the href on the element
    var href = this.get('href');
    if (!href || (href.length === 0)) href = "javascript:;";
    if (this.get('href') !== this._display_href) {
      this._display_href = href ;
      this.$().attr('href', href);
    }

    this.updateControlDisplay();
    this.$().setClass('active',this.get('isActive'))
      .setClass('def', this.get('isDefault'))
      .setClass('cancel', this.get('isCancel'));
  },
   
  /** @private
    When first generating a button, set the href and static values... 
  */
  prepareDisplay: function() {
    var ret = sc_super();
    this.$().addClass(this.get('theme') || 'regular');
    this.updateDisplay() ;
    return ret ;
  },
  
  /**
    The button title.  If localize is YES, then this should be the localization key to display.  Otherwise, this will be the actual string displayed in the title.  This property is observable and bindable.
    
    @property {String}
  */  
  title: '',

  /**
    The computed display title.  This is generated by localizing the title property if necessary.
  */
  displayTitle: function() {
    var ret = this.get('title');
    return (ret && this.get('localize')) ? ret.loc() : (ret || '');
  }.property('title','localize').cacheable(),
  
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
    The key equivalent that should trigger this button on the page.
  */
  keyEquivalent: null,
  
  /** @private {String} used to store a previously defined key equiv */
  _defaultKeyEquivalent: null,
  
  performKeyEquivalent: function( keystring, evt )
  {
    if (!this.get('isEnabled')) return false;
    var keyEquivalent = this.get('keyEquivalent');
    if (keyEquivalent && (keyEquivalent === keystring))
    {
      // button has defined a keyEquivalent and it matches!
      // if triggering succeeded, true will be returned and the operation will be handeled 
      // (i.e performKeyEquivalent will cease crawling the view tree)
      return this.triggerAction(evt);
    }
    return false;
  },

  /**
    Set to YES while the button is currently in the process of executing its own action.  Causes the display to update.
  */
  isActive: NO,
      
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

  // ................................................................
  // INTERNAL SUPPORT
  
  /** @private */
  init: function() {
    sc_super();
    
    //cache the key equivalent
    if(this.get("keyEquivalent")) this._defaultKeyEquivalent = this.get("keyEquivalent"); 
  },

  // determines the target selected state
  _computeSelectedStateFromValue: function(value) {
    var targetValue = this.get('toggleOnValue') ;
    var state ;
    
    if (SC.$type(value) == SC.T_ARRAY) {
      if (value.length == 1) {
        state = (value[0] == targetValue) ;
      } else {
        state = (value.indexOf(targetValue) >= 0) ? SC.MIXED_STATE : false ;
      }
    } else {
      state = (value == targetValue) ;
    }
    return state ;
  },
  
  /** @private
    Whenever the button value changes, update the selected state to match.
  */
  _buttonValueDidChange: function() {
    var value = this.get('value');  
    var state = this._computeSelectedStateFromValue(value);
    this.set('isSelected', state) ; // set new state...
  }.observes('value'),
  
  /** @private
    Whenever the selected state is changed, make sure the button value is also updated.  Note that this may be called because the value has just changed.  In that case this should do nothing.
  */
  _isSelectedDidChange: function() {
    var newState = this.get('isSelected');
    var curState = this._computeSelectedStateFromValue(this.get('value'));
    if (curState !== newState) {
      var valueKey = (newState) ? 'toggleOnValue' : 'toggleOffValue' ;
      this.set('value', this.get(valueKey));
    }
  }.observes('isSelected'),

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
  mouseOut: function(evt) {
    if (this._isMouseDown) this.set('isActive', NO);
    return YES;
  },

  /** @private
    If mouse was down and we renter the button area, set the active state again.
  */  
  mouseOver: function(evt) {
    this.set('isActive', this._isMouseDown);
    return YES;
  },

  /** @private
    ON mouse up, trigger the action only if we are enabled and the mouse was released inside of the view.
  */  
  mouseUp: function(evt) {
    if (this._isMouseDown) this.set('isActive', NO); // track independently in case isEnabled has changed
    this._isMouseDown = false;
    var inside = SC.$().within(evt.target) ;
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
      if (sel == YES) {
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
    if (action && (SC.$type(action) == SC.T_FUNCTION)) return true;
    if (action && (SC.$type(action) == SC.T_STRING) && (action.indexOf('.') != -1)) return true;
    return false;
  },

  /** @private */
  _triggerLegacyActionHandler: function( evt )
  {
    if (!this._hasLegacyActionHandler()) return false;
    
    var action = this.get('action');
    if (SC.$type(action) == SC.T_FUNCTION) this.action(evt);
    if (SC.$type(action) == SC.T_STRING) {
      eval("this.action = function(e) { return "+ action +"(this, e); };");
      this.action(evt);
    }
  }
  
}) ;
