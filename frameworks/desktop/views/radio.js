// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2009 Sprout Systems, Inc. and contributors.
//            Portions ©2008-2009 Apple Inc. All rights reserved.
// License:   Licened under MIT license (see license.js)
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
SC.RadioView = SC.FieldView.extend(
  /** @scope SC.RadioView.prototype */ {

  // HTML design options
  classNames: ['sc-radio-view'],

  /**
    The value of the currently selected item, and which will be checked in the 
    UI. This can be either a string or an array with strings for checking 
    multiple values.
  */
  value: null,
  
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
  
  /** @private - 
    Will iterate the items property to return an array with items that is 
    indexed in the following structure:
      [0] => Title (or label)
      [1] => Value
      [2] => Enabled (YES default)
      [3] => Icon (image URL)
  */
  displayItems: function() {
    var items = this.get('items'), loc = this.get('localize'),
      titleKey = this.get('itemTitleKey'), valueKey = this.get('itemValueKey'),
      isEnabledKey = this.get('itemIsEnabledKey'), 
      iconKey = this.get('itemIconKey');
    var ret = [], max = (items)? items.get('length') : 0 ;
    var item, title, value, idx, isArray, isEnabled, icon;
    
    for(idx=0;idx<max;idx++) {
      item = items.objectAt(idx); 
      
      // if item is an array, just use the items...
      if (SC.typeOf(item) === SC.T_ARRAY) {
        title = item[0];  value = item[1] ;
        
      // otherwise, possibly use titleKey,etc.
      } else if (item) {
        // get title.  either use titleKey or try to convert the value to a 
        // string.
        if (titleKey) {
          title = item.get ? item.get(titleKey) : item[titleKey] ;
        } else title = (item.toString) ? item.toString() : null;
        
        if (valueKey) {
          value = item.get ? item.get(valueKey) : item[valueKey] ;
        } else value = item ;
        
        if (isEnabledKey) {
          isEnabled = item.get ? item.get(isEnabledKey) : item[isEnabledKey];
        } else isEnabled = YES ;
        
        if (iconKey) {
          icon = item.get ? item.get(iconKey) : item[iconKey] ;
        } else icon = null ;
        
      // if item is nil, use somedefaults...
      } else { title = value = icon = null; isEnabled = NO; }

      // localize title if needed
      if (loc) title = title.loc();
      ret.push([title, value, isEnabled, icon]) ;
    }
    
    return ret; // done!
  }.property('items', 'itemTitleKey', 'itemValueKey', 'itemIsEnabledKey', 'localize', 'itemIconKey').cacheable(),
  
  /** If the items array itself changes, add/remove observer on item... */
  itemsDidChange: function() {
    if (this._items) {
      this._items.removeObserver('[]',this,this.itemContentDidChange) ;
    } 
    this._items = this.get('items');
    if (this._items) {
      this._items.addObserver('[]', this, this.itemContentDidChange) ;
    }
    this.itemContentDidChange();
  }.observes('items'),
  
  /** 
    Invoked whenever the item array or an item in the array is changed.
    This method will regenerate the list of items.
  */
  itemContentDidChange: function() {
    this.notifyPropertyChange('displayItems');
  },

  // ..........................................................
  // PRIVATE SUPPORT
  // 
  
  $input: function() { return this.$('input'); },
  
  displayProperties: ['value', 'displayItems'],
  
  render: function(context, firstTime) {
    // if necessary, regenerate the radio buttons
    var item, idx, icon, name, itemsLength, url, className, disabled, 
      labelText, selectionState, selectionStateClassNames, 
      items = this.get('displayItems'), 
      value = this.get('value'), isArray = SC.isArray(value);
    
    context.addClass(this.get('layoutDirection'));
    
    // isArray is set only when there are two active checkboxes 
    // which can only happen with mixed state
    if (isArray && value.length<=0) {
      value = value[0]; isArray = NO;
    }
    
    if (firstTime) {
      // generate tags from this.
      name = SC.guidFor(this); // name for this group
      itemsLength = items.length;
      for(idx=0;idx<itemsLength;idx++) {
        item = items[idx];
        
        // get the icon from the item, if one exists...
        icon = item[3];
        if (icon) {
          url = (icon.indexOf('/')>=0) ? icon : SC.BLANK_IMAGE_URL;
          className = (url === icon) ? '' : icon ;
          icon = '<img src="%@" class="icon %@" alt="" />'.fmt(url, className);
        } else icon = '';
        
        selectionStateClassNames = this._getSelectionState(item, value, isArray, false);
        disabled = (!item[2]) || (!this.get('isEnabled')) ? 'disabled="disabled" ' : '';
        
        labelText = this.escapeHTML ? SC.RenderContext.escapeHTML(item[0]) : item[0];
        
        context.push('<label class="sc-radio-button ', selectionStateClassNames, '">');
        context.push('<input type="radio" value="', idx, '" name="', name, '" ', disabled, '/>');
        context.push('<span class="button"></span>');
        context.push('<span class="sc-button-label">', icon, labelText, '</span></label>');
      }
      
      // first remove listener on existing radio buttons
      this._field_setFieldValue(this.get('value'));
    }
    else {
      // update the selection state on all of the DOM elements.  The options are
      // sel or mixed.  These are used to display the proper setting...
      this.$input().forEach(function(input) {
        
        input = this.$(input);
        idx = parseInt(input.val(),0);
        item = (idx>=0) ? items[idx] : null;

        input.attr('disabled', (!item[2]) ? 'disabled' : null);
        selectionState = this._getSelectionState(item, value, isArray, true);

        // set class of label
        input.parent().setClass(selectionState);
        
        // avoid memory leaks
        input =  idx = selectionState = null;
      }, this);
    
    }
    
  },
  
  /** @private - 
    Will figure out what class names to assign each radio button.
    This method can be invoked either as part of render() either when:
    1. firstTime is set and we need to assign the class names as a string
    2. we already have the DOM rendered but we just need to update class names
       assigned to the the input field parent
  */
  _getSelectionState: function(item, value, isArray, shouldReturnObject) {
      var sel, classNames, key;
      
      // determine if the current item is selected
      if (item) {
        sel = (isArray) ? (value.indexOf(item[1])>=0) : (value===item[1]);
      } else {
        sel = NO;
      }
      
      // now set class names
      classNames = {
        sel: (sel && !isArray), mixed: (sel && isArray), disabled: (!item[2]) 
      };
      
      if(shouldReturnObject) {
        return classNames;
      } else {
        // convert object values to string
        var classNameArray = [];
        for(key in classNames) {
          if(!classNames.hasOwnProperty(key)) continue;
          if(classNames[key]) classNameArray.push(key);
        }
        return classNameArray.join(" ");
      }
      
  },

  getFieldValue: function() {
    var val = this.$input().filter(function() { return this.checked; }).val();
    var items = this.get('displayItems') ;
    val = items[parseInt(val,0)];
    
    // if no items are selected there is a saved mixed value, return that...
    return val ? val[1] : this._mixedValue;
  },
  
  setFieldValue: function(v) {
    // if setting a mixed value, actually clear everything and save mixed
    // value
    if (SC.isArray(v)) {
      if (v.get('length')>1) {
        this._mixedValue = v;
        v = undefined ;
      } else v = v.objectAt(0);
    }

    // v now contains one item only.  find the index in the display items
    // array matching that value.
    var items, idx;
    if (v === undefined) {
      idx = -1;
    } else {
      items = this.get('displayItems');
      idx = items.indexOf(items.find(function(x) { return x[1] === v; }));
    }
    
    // now loop through input elements. set their checked value accordingly
    this.$input().forEach(function(input) {
      input = SC.$(input);
      input.attr('checked', parseInt(input.val(),0) === idx);
      input = null;
    });
    
    return this;
  },
  

  
  didCreateLayer: function() {
     this.setFieldValue(this.get('fieldValue'));
     var inputElems=this.$input();
     for( var i=0, inputLen = inputElems.length; i<inputLen; i++){
       SC.Event.add(inputElems[i], 'click', this, this._field_fieldValueDidChange) ;
     }
   },

  willDestroyLayer: function() {
       var inputElems=this.$input();
        for( var i=0, inputLen = inputElems.length; i<inputLen; i++){
            SC.Event.remove(this.$input()[i], 'click', this, this._field_fieldValueDidChange); 
        }
   
  },
  
  mouseDown: function(evt) {  
    this.set('isActive', YES);
    this._field_isMouseDown = YES;
    return YES;
  }

});