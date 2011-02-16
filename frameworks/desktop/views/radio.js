// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2010 Sprout Systems, Inc. and contributors.
//            Portions ©2008-2010 Apple Inc. All rights reserved.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================
/** @class

  A RadioView is used to create a group of radio buttons.  The user can use
  these buttons to pick from a choice of options.
  
  This view renders simulated radio buttons that can display a mixed state and 
  has other features not found in platform-native controls.
  
  The radio buttons themselves are designed to be styled using CSS classes with
  the following structure:
  
  <label class="sc-radio-button">
  <img class="button" src="some_image.gif"/>
  <input type="radio" name="<sc-guid>" value=""/>
  <span class="sc-button-label">Label for button1</span>
  </label>
  
  Setting up a RadioView accepts a number of properties, for example:
  {
    items: [{ title: "Red", 
              value: "red", 
              enabled: YES, 
              icon: "button_red" },
            { title: "Green", 
              value: "green", 
              enabled: YES, 
              icon: 'button_green' }],
    value: 'red',
    itemTitleKey: 'title',
    itemValueKey: 'value',
    itemIconKey: 'icon',
    itemIsEnabledKey: 'enabled',
    isEnabled: YES,
    layoutDirection: SC.LAYOUT_HORIZONTAL
  }
  
  Default layoutDirection is vertical. 
  Default isEnabled is YES.
  
  The value property can be either a string, as above, or an array of strings
  for pre-checking multiple values.
  
  The items array can contain either strings, or as in the example above a 
  hash. When using a hash, make sure to also specify the itemTitleKey
  and itemValueKey you are using. Similarly, you will have to provide 
  itemIconKey if you are using icons radio buttons. The individual items 
  enabled property is YES by default, and the icon is optional.
  
  @extends SC.FieldView
  @since SproutCore 1.0
*/
SC.RadioView = SC.View.extend(SC.Control,
/** @scope SC.RadioView.prototype */
{

  // HTML design options
  classNames: ['sc-radio-view'],

  /**
    The WAI-ARIA role for a group of radio buttons. This property's value
    should not be changed.

    @property {String}
  */
  ariaRole: 'radiogroup',

  /**
  If items property is a hash, specify which property will function as
  the ariaLabeledBy with this itemAriaLabeledByKey property.ariaLabeledBy is used
  as the WAI-ARIA attribute for the radio view. This property is assigned to
  'aria-labelledby' attribute, which defines a string value that labels the
  element. Used to support voiceover.  It should be assigned a non-empty string,
  if the 'aria-labelledby' attribute has to be set for the element.

    @property {String}
  */
  itemAriaLabeledByKey: null,

  /**
    If items property is a hash, specify which property will function as
    the ariaLabeled with this itemAriaLabelKey property.ariaLabel is used
    as the WAI-ARIA attribute for the radio view. This property is assigned to
    'aria-label' attribute, which defines a string value that labels the
    element. Used to support voiceover.  It should be assigned a non-empty string,
    if the 'aria-label' attribute has to be set for the element.

    @property {String}
  */
  itemAriaLabelKey: null,

  /**
    The value of the currently selected item, and which will be checked in the 
    UI. This can be either a string or an array with strings for checking 
    multiple values.
  */
  value: null,

  /**
    This property indicates how the radio buttons are arranged.
  */
  layoutDirection: SC.LAYOUT_VERTICAL,

  // escape the HTML in label text
  escapeHTML: YES,

  /** 
    The items property can be either an array with strings, or a
    hash. When using a hash, make sure to also specify the appropriate
    itemTitleKey, itemValueKey, itemIsEnabledKey and itemIconKey.
  */
  items: [],

  /** 
    If items property is a hash, specify which property will function as
    the title with this itemTitleKey property.
  */
  itemTitleKey: null,
  
  /**
    If items property is a hash, specify which property will function as
    the item width with this itemWidthKey property. This is only used when
    layoutDirection is set to SC.LAYOUT_HORIONZTAL and can be used to override
    the default value provided by the framework or theme CSS.
    
    @property {String}
    @default null
  */
  itemWidthKey: null,

  /** 
    If items property is a hash, specify which property will function as
    the value with this itemValueKey property.
  */
  itemValueKey: null,

  /** 
    If items property is a hash, specify which property will function as
    the value with this itemIsEnabledKey property.
  */
  itemIsEnabledKey: null,

  /** 
    If items property is a hash, specify which property will function as
    the value with this itemIconKey property.
  */
  itemIconKey: null,

  /** 
    If the items array itself changes, add/remove observer on item... 
  */
  itemsDidChange: function() {
    if (this._items) {
      this._items.removeObserver('[]', this, this.itemContentDidChange);
    }
    this._items = this.get('items');
    if (this._items) {
      this._items.addObserver('[]', this, this.itemContentDidChange);
    }
    this.itemContentDidChange();
  }.observes('items'),

  /** 
    Invoked whenever the item array or an item in the array is changed.
    This method will regenerate the list of items.
  */
  itemContentDidChange: function() {
    // Force regeneration of buttons
    this._renderAsFirstTime = YES;
  
    this.notifyPropertyChange('displayItems');
  },

  // ..........................................................
  // PRIVATE SUPPORT
  // 
  /** 
    The display properties for radio buttons are the value and _displayItems.
  */
  displayProperties: ['displayItems', 'isEnabled', 'layoutDirection'],
  renderDelegateName: 'radioGroupRenderDelegate',

  /** @private
    Data Sources for radioRenderDelegates, as required by radioGroupRenderDelegate.
  */
  displayItems: function() {
    var items = this.get('items'),
        viewValue = this.get('value'),
        isArray = SC.isArray(viewValue),
        loc = this.get('localize'),
        titleKey = this.get('itemTitleKey'),
        valueKey = this.get('itemValueKey'),
        widthKey = this.get('itemWidthKey'),
        isHorizontal = this.get('layoutDirection') === SC.LAYOUT_HORIZONTAL,
        isEnabledKey = this.get('itemIsEnabledKey'), 
        iconKey = this.get('itemIconKey'),
        ariaLabeledByKey = this.get('itemAriaLabeledByKey'),
        ariaLabelKey = this.get('itemAriaLabelKey'),
        ret = this._displayItems || [], max = (items)? items.get('length') : 0,
        item, title, width, value, idx, isEnabled, icon, sel, active,
        ariaLabeledBy, ariaLabel;
    
    for(idx=0;idx<max;idx++) {
      item = items.objectAt(idx); 
      
      // if item is an array, just use the items...
      if (SC.typeOf(item) === SC.T_ARRAY) {
        title = item[0];
        value = item[1];

        // otherwise, possibly use titleKey,etc.
      } else if (item) {
        // get title.  either use titleKey or try to convert the value to a 
        // string.
        if (titleKey) {
          title = item.get ? item.get(titleKey) : item[titleKey];
        } else title = (item.toString) ? item.toString() : null;
        
        if (widthKey && isHorizontal) {
          width = item.get ? item.get(widthKey) : item[widthKey];
        }
        
        if (valueKey) {
          value = item.get ? item.get(valueKey) : item[valueKey];
        } else value = item;

        if (isEnabledKey) {
          isEnabled = item.get ? item.get(isEnabledKey) : item[isEnabledKey];
        } else isEnabled = YES;

        if (iconKey) {
          icon = item.get ? item.get(iconKey) : item[iconKey];
        } else icon = null;

        if (ariaLabeledByKey) {
          ariaLabeledBy = item.get ? item.get(ariaLabeledByKey) : item[ariaLabeledByKey];
        } else ariaLabeledBy = null;

        if (ariaLabelKey) {
          ariaLabel = item.get ? item.get(ariaLabelKey) : item[ariaLabelKey];
        } else ariaLabel = null;

        // if item is nil, use somedefaults...
      } else {
        title = value = icon = null;
        isEnabled = NO;
      }
      
      if (item) {
        sel = (isArray) ? (viewValue.indexOf(value) >= 0) : (viewValue === value);
      } else {
        sel = NO;
      }

      // localize title if needed
      if (loc) title = title.loc();
      ret.push(SC.Object.create({
        title: title,
        icon: icon,
        width: width,
        value: value,
        
        isEnabled: isEnabled,
        isSelected: (isArray && viewValue.indexOf(value) >= 0 && viewValue.length === 1) || (viewValue === value),
        isMixed: (isArray && viewValue.indexOf(value) >= 0),
        isActive: this._activeRadioButton === idx,
        ariaLabeledBy: ariaLabeledBy,
        ariaLabel: ariaLabel,
        theme: this.get('theme'),
        renderState: {}
      }));
    }

    return ret; // done!
  }.property('value', 'items', 'itemTitleKey', 'itemWidthKey', 'itemValueKey', 'itemIsEnabledKey', 'localize', 'itemIconKey','itemAriaLabeledByKey', 'itemAriaLabelKey').cacheable(),

  /**
    If the user clicks on of the items mark it as active on mouseDown unless
    is disabled.

    Save the element that was clicked on so we can remove the active state on
    mouseUp.
  */
  mouseDown: function(evt) {
    if (!this.get('isEnabled')) return YES;
    
    var delegate = this.get('renderDelegate'), proxy = this.get('renderDelegateProxy');
    var index = delegate.indexForEvent(proxy, this.$(), evt);
    
    this._activeRadioButton = index;
    
    if (index !== undefined) {
      this.get('displayItems')[index].set('isActive', YES);
      delegate.updateRadioAtIndex(proxy, this.$(), index);
    }
    
    // even if radiobuttons are not set to get firstResponder, allow default 
    // action, that way textfields loose focus as expected.
    evt.allowDefault();
    return YES;
  },

  /**
    If we have a radio element that was clicked on previously, make sure we
    remove the active state. Then update the value if the item clicked is 
    enabled.
  */
  mouseUp: function(evt) {
    if (!this.get('isEnabled')) return YES;

    var delegate = this.get('renderDelegate'), proxy = this.get('renderDelegateProxy'),
        displayItems = this.get('displayItems');
    var index = delegate.indexForEvent(proxy, this.$(), evt);
    
    if (this._activeRadioButton !== undefined && index !== this._activeRadioButton) {
      displayItems[this._activeRadioButton].set('isActive', NO);
      delegate.updateRadioAtIndex(proxy, this.$(), this._activeRadioButton);
    }
    
    this._activeRadioButton = undefined;
    
    if (index !== undefined) {
      displayItems[index].set('isActive', NO);
      delegate.updateRadioAtIndex(proxy, this.$(), index);
      this.set('value', displayItems[index].value);
    }
  },

  touchStart: function(evt) {
    return this.mouseDown(evt);
  },

  touchEnd: function(evt) {
    return this.mouseUp(evt);
  }
});
