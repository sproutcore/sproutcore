// ========================================================================
// SproutCore -- JavaScript Application Framework
// Copyright ©2006-2008, Sprout Systems, Inc. and contributors.
// Portions copyright ©2008 Apple, Inc.  All rights reserved.
// ========================================================================

/**
  @class
  
  A select field that takes data from an Array controller.
  
  @extends SC.FieldView
  @author Erich Ocean
  @since SproutCore 1.0
*/
SC.StatechartSelectFieldView = SC.FieldView.extend(
/** @scope SC.SelectFieldView.prototype */ {
  
  tagName: 'select',
  classNames: ['sc-select-field-view'],
  
  displayProperties: 'content contentNameKey contentValueKey'.w(),
  
  /**
    An array of content objects.
    
    This array should contain the content objects you want the select field 
    view to display.
    
    Usually you will want to bind this property to a controller property 
    that actually contains the array of objects you want to display.
    
    @type SC.Array
  */
  content: [],
  
  /** @private */
  contentBindingDefault: SC.Binding.multiple(),
  
  /**
    If you set this to a non-null value, then the name shown for each 
    menu item will be pulled from the object using the named property.
    if this is null, the collection objects themselves will be used.
  */
  contentNameKey: null,
  
  /**
     Set this to a non-null value to use a key from the passed set of objects
     as the value for the options popup.  If you don't set this, then the
     objects themselves will be used as the value.
  */ 
  contentValueKey: null,
  
  /**
    set this to non-null to place an empty option at the top of the menu.   
  */
  emptyName: null,
  
  /**
    if true, the empty name will be localized.
  */
  localize: NO,
  
  /**
    Override this to change the enabled/disabled state of menu items as they
    are built.  Return false if you want the menu item to be disabled.
    
    @param itemValue the value for the item to validate
    @param itemName the name of the menu item to validate
    @returns YES if the item should be enabled, NO otherwise
  */  
  validateMenuItem: function(itemValue, itemName) {
    return YES ;
  },
  
  // .......................................
  // PRIVATE
  //
  
  /** @private */
  $input: function() { return this.$(); },
   
  /* @private */
  mouseDown: function(evt) {
    if (!this.get('isEnabled')) {
      evt.stop() ;
      return YES ;
    } else return sc_super() ;
  },
  
  /** @private */
  setFieldValue: function() {}, // suppress
   
  /** @private
    When fetching the raw value, convert back to an object if needed.
  */
  getFieldValue: function() {
    var value = sc_super() ; // get raw value... 
    var valueKey = this.get('valueKey') ;
    var objects = this.get('content') ;
    
    // handle empty selection
    if (value == '***') {
      value = null ;
    
    // if no value key was set and there are objects then match back to an
    // object
    } else if (value && objects) {
      // objects = Array.from(objects) ;
      var loc = objects.get ? objects.get('length') : objects.length ;
      var found = null ; // matching object goes here.
      while(!found && (--loc >= 0)) {
        var object = objects.objectAt ? objects.objectAt(loc) : objects[loc] ;
        
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
  
  fieldValueDidChange: function(partialChange) {
    var fieldValue = this.getFieldValue() ;
  },
  
  _field_fieldValueDidChange: function(evt) {
    console.log('%@._field_fieldValueDidChange(evt=%@)'.fmt(this, evt));
    console.log(this.getFieldValue());
    this.set('value', this.getFieldValue());
  },
  
  // object changes to the objects array of objects if possible.
  render: function(context, firstTime) {
    console.log('%@.render(context=%@, firstTime=%@)'.fmt(this, context, firstTime?'YES':'NO'));
    
    if (firstTime || this.get('isDirty')) {
      console.log('actually rendering new select field elements');
      
      // get list of objects.
      var nameKey = this.get('contentNameKey') ;
      var valueKey = this.get('contentValueKey') ;
      var objects = this.get('content') ;
      var fieldValue = this.get('value') ;
    
      // get the localization flag.
      var shouldLocalize = this.get('localize') ; 
    
      // convert fieldValue to guid, if it is an object.
      if (!valueKey && fieldValue) fieldValue = SC.guidFor(fieldValue) ;
      if ((fieldValue === null) || (fieldValue === '')) fieldValue = '***' ;
    
      if (objects) {
        var emptyName = this.get('emptyName') ;
        if (emptyName) {
          if (shouldLocalize) emptyName = emptyName.loc() ;
          context.push('<option value="***">%@</option>'.fmt(emptyName)) ;
          context.push('<option disabled="disabled"></option>') ;
        }
      
        // generate option elements.
        objects.forEach( function(object) {
          if (object) {
          
            // either get the name from the object or convert object to string.
            var name = nameKey ?
              (object.get ? object.get(nameKey) : object[nameKey]) :
              object.toString() ;
          
            if (shouldLocalize) name = name.loc() ;
          
            // get the value using the valueKey or the object if no valueKey.
            // then convert to a string or use _guid if one of available.
            var value = (valueKey) ?
              (object.get ? object.get(valueKey) : object[valueKey]) :
              object ;
          
            // console.log(SC.guidFor(object));
            // console.log(fieldValue);
          
            var selected = '' ;
            if (SC.guidFor(object) === fieldValue) {
              selected = 'selected' ;
            }
          
            if (value) {
              value = (SC.guidFor(value)) ?
                SC.guidFor(value) :
                value.toString() ;
            }
          
            // render HTML
            var disable = '' ;
            // if (this.validateMenuItem && this.validateMenuItem(value, name)) {
            //   disable = 'disabled="disabled"' ;
            // }
            context.push(
              '<option %@ %@ value="%@">'.fmt(selected, disable, value),
              name,
              '</option>'
            );
          
          // null value means separator.
          } else {
            context.push('<option disabled="disabled"></option>') ;
          }
        }, this );
      }
    }
    this.set('isDirty', NO) ;
  },
  
  // ..........................................................
  // CONTENT CHANGES
  // 
  
  /** @private
    Whenever content array changes, start observing the [] property.  Also 
    call the contentPropertyDidChange handler.
  */
  _sc_sf_contentDidChange: function() {
    console.log('%@._sc_sf_contentDidChange()'.fmt(this));
    var content = this.get('content') ;
    if (content === this._content) return this; // nothing to do
    
    var func = this._sc_sf_contentPropertyDidChange ;
    
    // remove old observer, add new observer
    if (this._content) this._content.removeObserver('[]', this, func) ;
    if (content) content.addObserver('[]', this, func) ;
    
    // cache
    this._content = content;
    this._contentPropertyRevision = null ;
    
    // trigger property change handler...
    var rev = (content) ? content.propertyRevision : -1 ;
    this._sc_sf_contentPropertyDidChange(this, '[]', content, rev) ; 
  }.observes('content'),
  
  /** @private
    Called whenever the content array or any items in the content array 
    changes. Mark view as dirty.
  */
  _sc_sf_contentPropertyDidChange: function(target, key, value, rev) {
    console.log('%@._sc_sf_contentPropertyDidChange(target=%@, key=%@, value=%@, rev=%@)'.fmt(this, target, key, value, rev));
    if (!this._updatingContent && (!rev || (rev != this._contentPropertyRevision))) {
      this._contentPropertyRevision = rev ;
      this._updatingContent = true ;
      this.contentPropertyDidChange(target, key);
      this._updatingContent = false ;
    }
  },
  
  /**
    Invoked whenever a the content array changes.
  */
  contentPropertyDidChange: function(target, key) {
    console.log('%@.contentPropertyDidChange(target=%@, key=%@)'.fmt(this, target, key));
    this.set('isDirty', YES) ;
    return this ;
  },
  
  /** @private
    Anytime isDirty changes to YES or our visibility in window changes,
    schedule a full update.
  */
  _sc_sf_isDirtyDidChange: function() {
    console.log('%@._sc_sf_isDirtyDidChange()'.fmt(this));
    console.log(this.get('isDirty'));
    // don't test isVisibleInWindow here for a 10% perf gain
    if (this.get('isDirty')) {
      // using invokeOnce here doubles rendering speed!
      console.log('%@.invokeOnce(this.displayDidChange) ;'.fmt(this));
      this.invokeOnce(this.displayDidChange) ;
    }
  }.observes('isDirty', 'isVisibleInWindow'),
  
  fieldDidFocus: function() {
    var isFocused = this.get('isFocused') ;
    if (!isFocused) this.set('isFocused', YES) ;
  },
  
  fieldDidBlur: function() {
    var isFocused = this.get('isFocused') ;
    if (isFocused) this.set('isFocused', NO) ;
  },
  
  _isFocusedObserver: function() {
    this.$().setClass('focus', this.get('isFocused')) ;
  }.observes('isFocused'),
  
  didCreateLayer: function() {
    var input = this.$input() ;
    SC.Event.add(input, 'blur', this, this.fieldDidBlur) ;
    SC.Event.add(input, 'focus', this, this.fieldDidFocus) ;
    return sc_super() ;
  },
  
  willDestroyLayer: function() {
    var input = this.$input() ;
    SC.Event.remove(input, 'focus', this, this.fieldDidFocus) ;
    SC.Event.remove(input, 'blur', this, this.fieldDidBlur) ;
    return sc_super() ;
  }
 
});
