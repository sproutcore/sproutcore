// ========================================================================
// SproutCore
// copyright 2006-2008 Sprout Systems, Inc.
// ========================================================================

require('views/view') ;
require('views/label') ;
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
  @author Charles Jolley
  @version 1.0
  
*/
SC.ButtonView = SC.View.extend(SC.Control,
/** @scope SC.ButtonView.prototype */ {
  
  emptyElement: '<a href="javascript:;" class="sc-button-view regular"><span class="button-inner"><span class="label"></span></span></a>',
  
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
  isDefaultBindingDefault: SC.Binding.OneWayBool,
  
  /**
    If YES, then this button will be triggered when you hit escape.
    
    This is the same as setting the keyEquivalent to 'escape'.
  */  
  isCancel: NO,
  isCancelBindingDefault: SC.Binding.OneWayBool,
  
  /**
    If YES, then the title will be localized.
  */
  localize: NO,
  
  /**
    The selector path to the element that contains the button title. 
    
    This property is only used if you try to get or set the title property.
  */
  titleSelector: '.label',
  
  /**
    The button title.
    
    This property is observable and bindable.
    
    @field {String}
  */
  title: function(key, value) {
    
    // set the value of the label text.  Possibly localize and set innerHTML.
    if (value !== undefined) {
      if (this._title != value) {
        var text = this._title = value ;
        var lsel = this.get('titleSelector') ;
        var el = (lsel) ? this.$sel(lsel) : this.rootElement ;

        if (this.get('localize')) text = text.loc() ;
        el.innerHTML = text ;
      }
    }

    // lazily fetch the label text.
    if (!this._title) {
      var el = this.$sel(this.get('titleSelector')) ;
      this._title = (el) ? el.innerHTML : '' ;
    }
    return this._title ;
  }.property(),
  
  /**
    The button href value.
      
    This property is observable and bindable. Can be used to create localized button href values.
  */
  href: function(key, value) {
    var el = this.rootElement;
    if (value !== undefined) {
      if (el) {
        el.setAttribute('href', value);
      }
    }
    return (el) ? el.getAttribute('href') : null;
  }.property(),

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
    if (keyEquivalent && (keyEquivalent == keystring))
    {
      // button has defined a keyEquivalent and it matches!
      // if triggering succeeded, true will be returned and the operation will be handeled 
      // (i.e performKeyEquivalent will cease crawling the view tree)
      return this.triggerAction(evt);
    }
    return false;
  },
  
  /**
    fakes a click... evt is optional.  
    
    Temporarily highlights the button to show that it is being triggered.  
    Does nothing if the button is disabled. 
    
    @returns {bool} success/failure of the request
  */  
  triggerAction: function(evt) {  
    if (!this.get('isEnabled')) return false;
    this.setClassName('active', true);
    this.didTriggerAction();
    this._action(evt);
    this.invokeLater('setClassName', 200, 'active', false) ;
    return true;
  },
  
  didTriggerAction: function() {},

  // ................................................................
  // INTERNAL SUPPORT
  
  /** @private */
  init: function() {
    arguments.callee.base.call(this) ;
    
    //cache the key equivalent
    if(this.get("keyEquivalent")) this._defaultKeyEquivalent = this.get("keyEquivalent"); 
    // setup initial CSS clases
    this._isDefaultOrCancelObserver() ;
    
    // If we need to localze, handle it...
    var el ;
    var sel = this.get('titleSelector') ;
    if (this.get('localize') && sel && (el = this.$sel(sel))) {
      this._title = (el.innerHTML || '').strip() ;
      el.innerHTML = this._title.loc() ;
    }
  },

  // determines the target selected state
  _selectedStateFromValue: function(value) {
    var targetValue = this.get('toggleOnValue') ;
    var state ;
    
    if ($type(value) == T_ARRAY) {
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
  
  /** @private */
  propertyObserver: function(observing,target,key,value) {
    if (target != this) return ;

    // handle changes to the value
    switch(key) {

      // determine the new selection state.
      case 'value':
        value = this.get('value') ;
        if (value == this._value) return ; // process value one time.
        this._value = value ;
      
        // set the new selected state if it does not match
        var state = this._selectedStateFromValue(value) ;
        this.setIfChanged('isSelected', state) ;
        break ;

      // forward to value if needed.
      case 'isSelected':
        var newState = this.get('isSelected') ;
        var curState = this._selectedStateFromValue(this.get('value')) ;
        if (curState != newState) {
          var valueKey = (newState) ? 'toggleOnValue' : 'toggleOffValue' ;
          this.set('value', this.get(valueKey)) ;
        }
        break ;
        
      // otherwise do nothing
      default:
        break ;
    }
  },
  
  _isDefaultOrCancelObserver: function() {
    var isDef = !!this.get('isDefault') ;
    var isCancel = !isDef && this.get('isCancel') ;
    
    if(this.didChangeFor('defaultCancelChanged','isDefault','isCancel')) {
      this.setClassName('def', isDef) ;
      if (isDef) {
        this.setIfChanged('keyEquivalent', 'return');
      } 
      else if (isCancel)
      {
        this.setIfChanged('keyEquivalent', 'escape') ;
      }
      else
      {
        //restore the default key equivalent
        this.set("keyEquivalent",this._defaultKeyEquivalent);
      }
    }
      
  }.observes('isDefault', 'isCancel'),
    
    
  isMouseDown: false, 
    
  // on mouse down, set active only if enabled.  
  /** @private */
  mouseDown: function(evt) {
    this.setClassName('active',this.get('isEnabled')) ;
    this._isMouseDown = true;
    return true ;
  },
  
  // remove the active class on mouse down as well
  /** @private */
  
  mouseOut: function(evt)
  {
    this.setClassName('active', false);
    return true;
  },
  
  // add the active class name if the mouse is down
  // this covers a scenario where the user drags out and back on to a button
  mouseOver: function(evt)
  {
    this.setClassName('active', this._isMouseDown) ;
    return true;
  },
  
  // on mouse up, trigger the action only if we are enabled and the mouse
  // was released inside the view.
  /** @private */
  mouseUp: function(evt) {
    this.setClassName('active', false) ;
    this._isMouseDown = false;
    var tgt = Event.element(evt) ;
    var inside = false ;
    while(tgt && (tgt != this.rootElement)) tgt = tgt.parentNode;
    if (tgt == this.rootElement) inside = true ;
    
    if (inside && this.get('isEnabled')) this._action(evt) ;
    return true ;
  },

  // perform action depending on the behavior of the button.
  _action: function(evt) {
    switch(this.get('buttonBehavior')) {
      
    // When toggling, try to invert like values. i.e. 1 => 0, etc.
    case SC.TOGGLE_BEHAVIOR:
      var sel = this.get('isSelected') ;
      if (sel == true) {
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
      if (action)
      {
        if (this._hasLegacyActionHandler()) {
          // old school... 
          this._triggerLegacyActionHandler(evt);
        } else {
          // newer action method + optional target syntax...
          SC.app.sendAction(action, target, this);
        }
      }
    }
  },
  
  /** @private */
  _hasLegacyActionHandler: function()
  {
    var action = this.get('action');
    if (action && ($type(action) == T_FUNCTION)) return true;
    if (action && ($type(action) == T_STRING) && (action.indexOf('.') != -1)) return true;
    return false;
  },

  /** @private */
  _triggerLegacyActionHandler: function( evt )
  {
    if (!this._hasLegacyActionHandler()) return false;
    
    var action = this.get('action');
    if ($type(action) == T_FUNCTION) this.action(evt);
    if ($type(action) == T_STRING)
    {
      eval("this.action = function(e) { return "+ action +"(this, e); };");
      this.action(evt);
    }
  }
  
}) ;
