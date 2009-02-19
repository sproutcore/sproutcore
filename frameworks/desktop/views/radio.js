// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2009 Sprout Systems, Inc. and contributors.
//            Portions ©2008-2009 Apple, Inc. All rights reserved.
// License:   Licened under MIT license (see license.js)
// ==========================================================================

/** @class

  A RadioView is used to create a group of radio buttons.  The user can use
  these buttons to pick from a choice of options.
  
  @extends SC.FieldView
  @since SproutCore 1.0
*/
SC.RadioView = SC.FieldView.extend(
  /** @scope SC.RadioView.prototype */ {

  // HTML design options
  emptyElement: '<%@1></%@1>',
  tagName: 'div',
  classNames: ['sc-radio-view'],

  /**
    The value of the currently selected item.
  */
  value: null,
  
  layoutDirection: SC.LAYOUT_VERTICAL,
  
  // ..........................................................
  // ITEMS ARRAY
  // 
  
  items: [],

  itemTitleKey: null,
  
  itemValueKey: null,
  
  itemIsEnabledKey: null,
  
  itemIconKey: null,
  
  displayItems: function() {
    var items = this.get('items'), loc = this.get('localize'),
      titleKey=this.get('itemTitleKey'), valueKey=this.get('itemValueKey'),
      isEnabledKey = this.get('itemIsEnabledKey'),
      iconKey = this.get('itemIconKey');
      
    var ret = [], max = (items)? items.length : 0 ;
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
    this._items = this.get('items') ;
    if (this._items) {
      this._items.addObserver('[]', this, this.itemContentDidChange) ;
    }
    this.itemContentDidChange();
  }.observes('items'),
  
  /** 
    Invoked whenever the item array or an item in the array is changed.  This method will reginerate the list of items.
  */
  itemContentDidChange: function() {
    this.notifyPropertyChange('displayItems');
  },
  
  init: function() {
    sc_super();
    this.itemsDidChange() ;
  },

  // ..........................................................
  // PRIVATE SUPPORT
  // 
  
  $input: function() { return this.$('input'); },
  
  displayProperties: ['value', 'displayItems'],

  prepareDisplay: function() {
    var ret = sc_super() ;
    this.$().addClass(this.get('layoutDirection'));  
  },

  updateDisplay: function() {
    
    // if necessary, regenerate the radio buttons
    var item, idx, items = this.get('displayItems');
    if (items !== this._lastDisplayItems) {
      this._lastDisplayItems = items;
      
      // generate tags from this.
      var name = SC.guidFor(this) ; // name for this group
      var html = items.map(function(item, index) {
        
        // get the icon from the item, if one exists...
        var icon = item[3];
        if (icon) {
          var url = (icon.indexOf('/')>=0) ? icon : static_url('blank');
          var className = (url === icon) ? '' : icon ;
          icon = '<img src="%@" class="icon %@" alt="" />'.fmt(url, className);
        } else icon = '';
        
        return '<label class="sc-radio-button"><img src="'+static_url('blank')+'" class="button" /><input type="radio" value="%@" name="%@" /><span class="sc-button-label">%@%@</span></label>'.fmt(index, name, icon, item[0]) ;
      }).join("");

      // first remove listener on existing radio buttons
      SC.Event.remove(this.$input(), 'change', this, this.fieldValueDidChange); 
      this.$().html(html);
      SC.Event.add(this.$input(), 'change', this, this.fieldValueDidChange) ;
      this._field_setFieldValue(this.get('value'));
    }
    
    var ret = sc_super();

    // update the selection state on all of the DOM elements.  The options are
    // sel or mixed.  These are used to display the proper setting...
    var value = this.get('value'), isArray = SC.isArray(value), sel, val;
    if (isArray && value.length<=0) {
      value = value[0]; isArray = NO; 
    }
    
    this.$input().forEach(function(input) {
      input = SC.$(input); 
      idx = parseInt(input.val(),0);
      val = (idx>=0) ? items[idx] : null;

      // determine if the current item is selected
      if (val) {
        sel = (isArray) ? (value.indexOf(val[1])>=0) : (value===val[1]);
      } else sel = NO;
      
      // now update class...
      input.attr('disabled', (!val[2]) ? 'disabled' : null) ;
      input.parent().setClass({
        sel: (sel && !isArray), mixed: (sel && isArray), disabled: (!val[2]) 
      }) ;
        
      // avoid memory leaks
      input = val = idx = null;
    }) ;
    
    return ret ;
  },

  getFieldValue: function() {
    var val = this.$input().filter(function() { return this.checked; }).val();
    var items = this.get('displayItems') ;
    val = items[parseInt(val,0)];
    
    // if no items are selected there is a saved mixed value, return that...
    return val ? val[1] : this._mixedValue ;
  },
  
  setFieldValue: function(v) {

    // if setting a mixed value, actually clear everything and save mixed
    // value
    if (SC.isArray(v)) {
      if (v.get('length')>1) {
        this._mixedValue = v ;
        v = undefined ;
      } else v = v.objectAt(0);
    }

    // v now contains one item only.  find the index in the display items
    // array matching that value.
    var items, idx;
    if (v === undefined) {
      idx = -1 ;
    } else {
      items = this.get('displayItems');
      idx = items.indexOf(items.find(function(x) { return x[1] === v; }));
    }
    
    // now loop through input elements.  set their checked value accordingly
    this.$input().forEach(function(input) {
      input = SC.$(input);
      input.attr('checked', parseInt(input.val(),0) === idx) ;
      input = null;
    });
    
    return this ;
  }

}) ;
