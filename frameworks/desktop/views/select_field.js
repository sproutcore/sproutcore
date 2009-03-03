// ========================================================================
// SproutCore -- JavaScript Application Framework
// Copyright ©2006-2008, Sprout Systems, Inc. and contributors.
// Portions copyright ©2008 Apple, Inc.  All rights reserved.
// ========================================================================

/**
  @class

  SelectFieldView displays browser-native popup menu.  To use this view,
  you should either bake into the HTML the preset list of options, or 
  you can set the -objects property to an array of items to show.  The
  value is current value of the select.
  
  @extends SC.FieldView
  @author Charles Jolley
  @author Mike Ball
  @since SproutCore 1.0
*/
SC.SelectFieldView = SC.FieldView.extend(
/** @scope SC.SelectFieldView.prototype */ {

  tagName: 'select',
  classNames: ['sc-select-field-view'],
 
  /**
    An array of items that will form the menu you want to show.
  */ 
  objects: [],

  /**
    If you set this to a non-null value, then the name shown for each 
    menu item will be pulled from the object using the named property.
    if this is null, the collection objects themselves will be used.
  */
  nameKey: null,

  /**
   If you set this to a non-null value, then the value of this key will
   be used to sort the objects.  If this is not set, then nameKey will
   be used.
  */ 
  sortKey: null,

  /**
     Set this to a non-null value to use a key from the passed set of objects
     as the value for the options popup.  If you don't set this, then the
     objects themselves will be used as the value.
  */ 
  valueKey: null,

  /**
    set this to non-null to place an empty option at the top of the menu.   
  */
  emptyName: null,

  /**
    if true, the empty name will be localized.
  */
  localize: false,

  /**
    override this to change the enabled/disabled state of menu items as they
    are built.  Return false if you want the menu item to be disabled.
    
    @param itemValue the value for the item to validate
    @param itemName the name of the menu item to validate
    @returns YES if the item should be enabled, NO otherwise
  */  
  validateMenuItem: function(itemValue, itemName) {
    return true ;
  },

  /**
    override this method to implement your own sorting of the menu. By
    default, menu items are sorted using the value shown or the sortKey
    
    @param objects the unsorted array of objects to display.
    @returns sorted array of objects
  */
  sortObjects: function(objects) {
    var nameKey = this.get('sortKey') || this.get('nameKey') ;
    objects = objects.sort(function(a,b) {
      if (nameKey) {
        a = a.get ? a.get(nameKey) : a[nameKey] ;
        b = b.get ? b.get(nameKey) : b[nameKey] ;
      }
      return (a<b) ? -1 : ((a>b) ? 1 : 0) ;
    }) ;

    return objects ;
  },

  /**
    call this method to rebuild the menu manually.  Normally you should not
    need to do this since the menu will be rebuilt as its data changes.
  */
  rebuildMenu: function(context) {

    // get list of objects.
    var nameKey = this.get('nameKey') ;
    var valueKey = this.get('valueKey') ;
    var objects = this.get('objects') ;
    var fieldValue = this.get('value') ;
   
    // get the localization flag.
    var shouldLocalize = this.get('localize'); 
   
    // convert fieldValue to guid, if it is an object.
    if (!valueKey && fieldValue) fieldValue = SC.guidFor(fieldValue) ;
    if ((fieldValue === null) || (fieldValue === '')) fieldValue = '***' ;
   
    if (objects) {
      objects = this.sortObjects(objects) ; // sort'em.
      // var html = [] ;       
   
      var emptyName = this.get('emptyName') ;
      if (emptyName) {
        if (shouldLocalize) emptyName = emptyName.loc() ;
        context.push('<option value="***">%@</option>'.fmt(emptyName)) ;
        context.push('<option disabled="disabled"></option>') ;
      }
   
      // generate option elements.
      objects.forEach(function(object) {
        if (object) {
   
          // either get the name from the object or convert object to string.
          var name = nameKey ? (object.get ? object.get(nameKey) : object[nameKey]) : object.toString() ;
   
          // localize name if specified.
          if(shouldLocalize)
          {
            name = name.loc();
          }
   
          // get the value using the valueKey or the object if no valueKey.
          // then convert to a string or use _guid if one of available.
          var value = (valueKey) ? (object.get ? object.get(valueKey) : object[valueKey]) : object ;
          if (value) value = (SC.guidFor(value)) ? SC.guidFor(value) : value.toString() ;
   
          // render HTML
          var disable = (this.validateMenuItem && this.validateMenuItem(value, name)) ? '' : 'disabled="disabled" ' ;
          context.push('<option %@value="%@">%@</option>'.fmt(disable,value,name)) ;
   
        // null value means separator.
        } else {
          context.push('<option disabled="disabled"></option>') ;
        }
      }, this );
   
      // replace the contents of this HTML element.
      // this.$input().html(context.join(""));//this.update(html.join("")); //TODO: this won't work
      this.setFieldValue(fieldValue);
   
    } else {
      this.set('value',null);
    }
  },
   
  // .......................................
  // PRIVATE
  //
   
  $input: function() { return this.$(); },
   
  /* @private */
  mouseDown: function(evt) {
    if (!this.get('isEnabled')) {
      evt.stop();
      return YES;
    } else return sc_super();
  },
   
  // when fetching the raw value, convert back to an object if needed...
  /** @private */
  getFieldValue: function() {
    var value = sc_super(); // get raw value... 
    var valueKey = this.get('valueKey') ;
    var objects = this.get('objects') ;
    
    // Handle empty selection.
    if (value == '***') {
      value = null ;
    
    // If no value key was set and there are objects then match back to an
    // object.
    } else if (value && objects) {
      // objects = Array.from(objects) ;
      var loc = objects.length ;
      var found = null ; // matching object goes here.
      while(!found && (--loc >= 0)) {
        var object = objects[loc] ;
      
        // get value using valueKey if there is one or use object
        // map to _guid or toString.
        if (valueKey) object = (object.get) ? object.get(valueKey) : object[valueKey] ;
        var ov = (object) ? (SC.guidFor(object) ? SC.guidFor(object) : object.toString()) : null ;
      
        // use this object value if it matches.
        if (value == ov) found = object ;
      }
    }
    
    return valueKey ? value : found ;
  },
  
  // object changes to the objects array of objects if possible.
  render: function(context, firstTime) {
    // if (this.didChangeFor('_objO','objects','nameKey','valueKey')) {
      var loc ;
      var objects = this.get('objects') ;
      var func = this._objectsItemObserver ;
    
      // stop observing old objects.
      if (this._objects) {
        loc = this._objects.length ;
        while(--loc >= 0) {
          var object = this._objects[loc] ;
          if (object && object.removeObserver) {
            if (this._nameKey && this._valueKey) {
              object.removeObserver(this._nameKey, this, func) ;
              object.removeObserver(this._valueKey, this, func) ;
            } else {
              object.removeObserver('*', this, func) ;
            } // if (this._nameKey)
          } // if (object &&...)
        } // while(--loc)
      } // if (this._objects)
    
      // start observing new objects.
      this._objects = objects ;
      this._nameKey = this.get('nameKey') ;
      this._valueKey = this.get('valueKey') ;
    
      if (this._objects) {
        loc = this._objects.length ;
        while(--loc >= 0) {
          object = this._objects[loc] ;
          if (object && object.addObserver) {
            if (this._nameKey && this._valueKey) {
              object.addObserver(this._nameKey, this, func) ;
              object.addObserver(this._valueKey, this, func) ;
            } else {
              object.addObserver('*', this, func) ;
            } // if (this._nameKey)
          } // if (object &&...)
        } // while(--loc)
      } // if (this._objects)
     this.rebuildMenu(context) ;
    // } // if (this.didChangeFor...)
  },

displayProperties: ['objects','nameKey','valueKey'],

  // this is invoked anytime an item we are interested in in the menu changes
  // rebuild the menu when this happens, but only one time.
  _objectsItemObserver: function(item, key, value) {
    if (item.didChangeFor(SC.guidFor(this), key)) {
      this.rebuildMenu() ;
    }
  },

  fieldDidFocus: function() {
    var isFocused = this.get('isFocused');
    if (!isFocused) this.set('isFocused', true);
  },

  fieldDidBlur: function() {
    var isFocused = this.get('isFocused');
    if (isFocused) this.set('isFocused', false);
  },

  _isFocusedObserver: function() {
    this.$().setClass('focus', this.get('isFocused'));
  }.observes('isFocused'),

  didCreateLayer: function() {
    var input = this.$();
    SC.Event.add(input, 'blur', this, this.fieldDidBlur);
    SC.Event.add(input, 'focus',this, this.fieldDidFocus);
    return sc_super();
  },
  
  willDestroyLayer: function() {
    var input = this.$input();
    SC.Event.remove(input, 'focus', this, this.fieldDidFocus);
    SC.Event.remove(input, 'blur', this, this.fieldDidBlur);
    return sc_super();
  }
 
});
