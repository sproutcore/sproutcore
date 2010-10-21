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
  
    this.notifyPropertyChange('_displayItems');
  },

  // ..........................................................
  // PRIVATE SUPPORT
  // 
  /** 
    The display properties for radio buttons are the value and _displayItems.
  */
  displayProperties: ['value', '_displayItems'],

  render: function(context, firstTime) {
    var items = this.get('_displayItems'),
        value = this.get('value'),
        isArray = SC.isArray(value),
        item, idx, icon, name, width, itemsLength, url,
        className, disabled, sel, labelText,
        selectionState, selectionStateClassNames;

    context.addClass(this.get('layoutDirection'));

    // isArray is set only when there are two active checkboxes 
    // which can only happen with mixed state
    if (isArray && value.length <= 0) {
      value = value[0];
      isArray = NO;
    }

    // if necessary, regenerate the radio buttons
    if (this._renderAsFirstTime) {
      firstTime = YES;
      this._renderAsFirstTime = NO;
    }

    if (firstTime) {
      context.attr('role', 'radiogroup');
      // generate tags from this.
      name = SC.guidFor(this); // name for this group
      itemsLength = items.length;
      for (idx = 0; idx < itemsLength; idx++) {
        item = items[idx];

        // get the icon from the item, if one exists...
        icon = item[3];
        if (icon) {
          url = (icon.indexOf('/') >= 0) ? icon: SC.BLANK_IMAGE_URL;
          className = (url === icon) ? '': icon;
          icon = '<img src="' + url + '" class="icon ' + className + '" alt="" />';
        } else icon = '';

        if (item) {
          sel = (isArray) ? (value.indexOf(item[1]) >= 0) : (value === item[1]);
        } else {
          sel = NO;
        }
        selectionStateClassNames = this._getSelectionStateClassNames(item, sel, value, isArray, false);

        labelText = this.escapeHTML ? SC.RenderContext.escapeHTML(item[0]) : item[0];
        
        width = item[4];
        
        context.push('<div class="sc-radio-button ',
                    selectionStateClassNames, '" ',
                    width ? 'style="width: ' + width + 'px;" ' : '',
                    'aria-checked="', sel ? 'true':'false','" ',
                    'role="radio"' , ' index="', idx,'">',
                    '<span class="button"></span>',
                    '<span class="sc-button-label">', 
                    icon, labelText, '</span></div>');
      }

    } else {
      // update the selection state on all of the DOM elements.  The options are
      // sel or mixed.  These are used to display the proper setting...
      this.$('.sc-radio-button').forEach(function(button) {

        button = this.$(button);
        idx = parseInt(button.attr('index'), 0);
        item = (idx >= 0) ? items[idx] : null;

        if (item) {
          sel = (isArray) ? (value.indexOf(item[1]) >= 0) : (value === item[1]);
        } else {
          sel = NO;
        }
        
        width = item[4];
        if (width) button.width(width);
        
        selectionState = this._getSelectionStateClassNames(item, sel, value, isArray, true);
        button.attr('aria-checked', sel ? 'true': 'false');
        // set class of label
        button.setClass(selectionState);

        // avoid memory leaks
        idx = selectionState = null;
      },
      this);
    }
  },

  /** @private - 
    Will iterate the items property to return an array with items that is 
    indexed in the following structure:
      [0] => Title (or label)
      [1] => Value
      [2] => Enabled (YES default)
      [3] => Icon (image URL)
  */
  _displayItems: function() {
    var items = this.get('items'), 
        loc = this.get('localize'),
        titleKey = this.get('itemTitleKey'),
        valueKey = this.get('itemValueKey'),
        widthKey = this.get('itemWidthKey'),
        isHorizontal = this.get('layoutDirection') === SC.LAYOUT_HORIZONTAL,
        isEnabledKey = this.get('itemIsEnabledKey'), 
        iconKey = this.get('itemIconKey'),
        ret = [], max = (items)? items.get('length') : 0,
        item, title, width, value, idx, isArray, isEnabled, icon;
    
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

        // if item is nil, use somedefaults...
      } else {
        title = value = icon = null;
        isEnabled = NO;
      }

      // localize title if needed
      if (loc) title = title.loc();
      ret.push([title, value, isEnabled, icon, width]);
    }

    return ret; // done!
  }.property('items', 'itemTitleKey', 'itemWidthKey', 'itemValueKey', 'itemIsEnabledKey', 'localize', 'itemIconKey').cacheable(),

  /** @private - 
    Will figure out what class names to assign each radio button.
    This method can be invoked either as part of render() either when:
    1. firstTime is set and we need to assign the class names as a string
    2. we already have the DOM rendered but we just need to update class names
       assigned to the the input field parent
  */
  _getSelectionStateClassNames: function(item, sel, value, isArray, shouldReturnObject) {
    var classNames, key;

    // now set class names
    classNames = {
      sel: (sel && !isArray),
      mixed: (sel && isArray),
      disabled: (!item[2])
    };

    if (shouldReturnObject) {
      return classNames;
    } else {
      // convert object values to string
      var classNameArray = [];
      for (key in classNames) {
        if (!classNames.hasOwnProperty(key)) continue;
        if (classNames[key]) classNameArray.push(key);
      }
      return classNameArray.join(" ");
    }
  },

  /**
    If the user clicks on of the items mark it as active on mouseDown unless
    is disabled.

    Save the element that was clicked on so we can remove the active state on
    mouseUp.
  */
  mouseDown: function(evt) {
    if (!this.get('isEnabled')) return YES;
    var target = evt.target;
    while (target) {
      if (target.className && target.className.indexOf('sc-radio-button') > -1) break;
      target = target.parentNode;
    }
    if (!target) return NO;

    target = this.$(target);
    if (target.hasClass('disabled')) return YES;
    target.addClass('active');
    this._activeRadioButton = target;
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
    var active = this._activeRadioButton,
    target = evt.target,
    items = this.get('_displayItems'),
    index,
    item;

    if (active) {
      active.removeClass('active');
      this._activeRadioButton = null;
    } else return YES;

    while (target) {
      if (target.className && target.className.indexOf('sc-radio-button') > -1) break;
      target = target.parentNode;
    }
    target = this.$(target);
    if (target[0] !== active[0] || target.hasClass('disabled')) return YES;

    index = parseInt(target.attr('index'), 0);
    item = items[index];
    this.set('value', item[1]);
  },

  touchStart: function(evt) {
    return this.mouseDown(evt);
  },

  touchEnd: function(evt) {
    return this.mouseUp(evt);
  }
});
