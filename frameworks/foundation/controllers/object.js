// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2009 Sprout Systems, Inc. and contributors.
//            Portions ©2008-2009 Apple, Inc. All rights reserved.
// License:   Licened under MIT license (see license.js)
// ==========================================================================

require('controllers/controller') ;

/** @class

  An ObjectController gives you a simple way to manage the editing state of
  an object.  You can use an ObjectController instance as a "proxy" for your
  model objects.
  
  Any properties you get or set on the object controller, will be passed 
  through to its content object.  This allows you to setup bindings to your
  object controller one time for all of your views and then swap out the 
  content as needed.
  
  h2. Working with Arrays
  
  An ObjectController can accept both arrays and single objects as content.  
  If the content is an array, the ObjectController will do its best to treat 
  the array as a single object.  For example, if you set the content of an
  ObjectController to an array of Contact records and then call:
  
    contactController.get('name');
    
  The controller will check the name property of each Contact in the array.  
  If the value of the property for each Contact is the same, that value will 
  be returned.  If the any values are different, then an array will be 
  returned with the values from each Contact in them. 
  
  Most SproutCore views can work with both arrays and single content, which 
  means that most of the time, you can simply hook up your views and this will
  work.
  
  If you would prefer to make sure that your ObjectController is always 
  working with a single object and you are using bindings, you can always 
  setup your bindings so that they will convert the content to a single object 
  like so:
  
    contentBinding: SC.Binding.Single('MyApp.listController.selection') ;

  This will ensure that your content property is always a single object 
  instead of an array.
  
  @extends SC.Controller
*/
SC.ObjectController = SC.Controller.extend(
/** @scope SC.ObjectController.prototype */ {
  
  // ...............................
  // PROPERTIES
  //
  
  /**
    set this to some value and the object controller will project 
    its properties.
  */
  content: null,
  contentBindingDefault: SC.Binding.multiple(),

  /**
    This will be set to true if the object currently does not have any
    content.  You might use this to disable any controls attached to the
    controller.
    
    @type Boolean
  */
  hasNoContent: true,
  
  /**
    This will be set to true if the content is a single object or an array 
    with a single item.  You can use this to disabled your UI.
    
    @type Boolean
  */
  hasSingleContent: false, 
  
  /**
    This will be set to true if the content is an array with multiple objects 
    in it.
    
    @type Boolean
  */
  hasMultipleContent: false,

  /**
    Set to true if the controller has any content, even an empty array.
  */
  hasContent: function() {
    return this.get('content') ;
  }.property('content'),

  /**
    Set this property to true and multiple content will be treated like a null 
    value. This will only impact use of get() and set().
    
    @type Boolean
  */
  allowsMultipleContent: true,
  
  /**
    Override this method to destroy the selected object. 
    
    The default just passes this call onto the content object if it supports
    it, and then sets the content to null.
  */
  destroy: function() {
    var content = this.get('content') ;
    if (content && SC.typeOf(content.destroy) === SC.T_FUNCTION) content.destroy();
    this.set('content', null) ;  
  },
  
  // ...............................
  // INTERNAL SUPPORT
  //
  
  /**
    When this controller commits changes, it will copy its changed values
    to the content object and then call "commitChanges" on the content
    object if that object implements the method.
  */
  performCommitChanges: function() {
    
    var content = this.get('content') ;
    var ret = true ;
    var key, loc;

    // empty arrays are treated like null values, arrays.len=1 treated like 
    // single objects.
    var isArray = false ;
    if (SC.isArray(content)) {
      var len = this._lengthFor(content) ;
      if (len === 0) {
        content = null ; 
      } else if (len === 1) {
        content = this._objectAt(0, content) ;
      } else if (this.get('allowsMultipleContent')) {
        isArray = true ;
      } else content = null ;
    }
    
    if (!this._changes) this._changes = {} ;
    
    // cannot commit changes to empty content.  Return an error.
    if (!content) {
      return SC.$error("No Content") ;

    // if content is an array, then loop through each item in the array and
    // get the changed values.
    } else if (isArray) {
      
      loc = this._lengthFor(content) ;
      while(--loc >= 0) {
        var object = this._objectAt(loc, content) ;
        if (!object) continue ;
        
        if (object.beginPropertyChanges) object.beginPropertyChanges(); 
        
        // loop through all the keys in changes and get the values...
        for(key in this._changes) {
          if (!this._changes.hasOwnProperty(key)) continue ;
          var value = this._changes[key];
          
          // if the value is an array, get the idx matching the content
          // object.  Otherwise, just use the value of the item.
          if(SC.isArray(value)) {
            value = this._objectAt(loc, value) ;
          }
          
          if (object.set) {
            object.set(key,value) ;
          } else object[key] = value ;
        }

        if (object.endPropertyChanges) object.endPropertyChanges() ;
        if (object.commitChanges) ret = object.commitChanges() ;
      }
      
    // if the content is not an array, then just loop through each changed
    // value and copy it to the object.
    } else {
      
      if (content.beginPropertyChanges) content.beginPropertyChanges() ;
      
      // save the set of changes to apply them.  Nothing should clear it but
      // just in case.
      var changes = this._changes ;
      for(key in changes) {
        if (!changes.hasOwnProperty(key)) continue;
        
        var oldValue = content.get ? content.get(key) : content[key];
        var newValue = changes[key];
        
        if (SC.none(oldValue) && newValue === '') newValue = null;
        if (newValue != oldValue) {
          if (content.set) {
            content.set('isDirty', YES);
          } else {
            content.isDirty=YES;
          } 
        }
        
        if (content.set) {
          content.set(key, newValue);
        } else {
          content[key] = newValue;
        }
      }
      
      if (content.endPropertyChanges) content.endPropertyChanges() ;
      if (content.commitChanges) ret = content.commitChanges() ;
    }
    
    // if commit was successful, dump changes hash and clear editor.
    if (SC.$ok(ret)) {
      this._changes = {} ;
      //this._valueControllers = {};
      this.editorDidClearChanges() ;
    }
    
    return ret ;
  },
  
  /** @private */
  performDiscardChanges: function() { 
    this._changes = {};
    this._valueControllers = {};
    this.editorDidClearChanges();
    this.allPropertiesDidChange();
    return true ;
  },
  
  /** @private */
  unknownProperty: function(key,value)
  {
    if (key == "content")
    {
      // FOR CONTENT KEY:
      // avoid circular references.  If you try to set content, just save the
      // value. The propertyObserver will be triggered below to do the rest of
      // the setup as needed.
      if (!(value === undefined)) this[key] = value;
      return this[key];
    } 
    else 
    {
      // FOR ALL OTHER KEYS:
      // Save the value in our temporary hash and note the changes in the 
      // editor.

      if (!this._changes) this._changes = {} ; 
      if (!this._valueControllers) this._valueControllers = {}; 
      
      if (value !== undefined)
      {
        // for changes, save in _changes hash and note that a change is required.
        this._changes[key] = value;
        if (this._valueControllers[key])
        {
          this._valueControllers[key] = null;
        }
        // notifying observers regarless if a controller had been created since they're lazy loaded
        this.propertyWillChange(key + "Controller");
        this.propertyDidChange(key + "Controller");
        this.editorDidChange();
      }
      else
      {
        // are we requesting the controller for a value?
        if (key.slice(key.length-10,key.length) == "Controller")
        {
          // the actual value...
          key = key.slice(0,-10);
          if ( !this._valueControllers[key] )
          {
            this._valueControllers[key] = this.controllerForValue(this._getValueForPropertyKey(key));
          }
          value = this._valueControllers[key];
        }
        else
        {
          // otherwise, get the value.
          // first check the _changes hash, then check the content object.
          value = this._getValueForPropertyKey(key);
        }
      }
      return value;
    }
  },
  
  _getValueForPropertyKey: function( key )
  {
    // first check the changes hash for a uncommited value...
    var value = this._changes[key];
    // sweet, no need to proceed.
    if ( value !== undefined ) return value;

    // ok, we'll need to get the value from the content object
    var obj = this.get('content');
    // no content object... return null.
    if (!obj) return null;

    if (SC.isArray(obj))
    {
      value = [];
      var len = this._lengthFor(obj);
      if (len > 1)
      {
        // if content is an array with more than one item, collect
        // content from array.
        if (this.get('allowsMultipleContent')) {
          for(var idx=0; idx < len; idx++) {
            var item = this._objectAt(idx, obj) ;
            value.push(item ? (item.get ? item.get(key) : item[key]) : null) ;
          }
        } else {
          value = null;
        }
      }
      else if (len == 1)
      {
        // if content is array with one item, collect from first obj.
        obj = this._objectAt(0,obj) ;
        value = obj.get ? obj.get(key) : obj[key] ;
      }
      else
      {
        // if content is empty array, act as if null.
        value = null;
      }
    }
    else
    {
      // content is a single item. Just get the property.
      value = obj.get ? obj.get(key) : obj[key] ;
    }
    return value;
  },

  _lastContentPropertyRevision: 0,
  
  /** @private */
  _contentDidChange: function(target,key,value,propertyRevision) {
    
    // handle changes to the content...
    if ((value = this.get('content')) != this._content) {

      if (this.get('hasChanges')) {
        // if we have uncommitted changes, then discard the changes or raise
        // an exception.
        var er = this.discardChanges() ;
        if (!SC.$ok(er)) throw(er) ;
      } else {
        // no changes, but we want to ensure that we flush the cache 
        // of any SC.Controllers we have for the content
        this._valueControllers = {} ;
      }
      
      // get the handler method
      var f = this._contentPropertyDidChange ;
      
      // stop listening to old content.
      if (this._content) {
        if (SC.isArray(this._content)) {
          this._content.invoke('removeObserver', '*', this, f) ;
        } else if (this._content.removeObserver) {
          this._content.removeObserver('*', this, f) ;
        }
      }
      
      // start listening for changes on the new content object.
      this._content = value ;
      if (value) {
        if (SC.isArray(value)) {
          value.invoke('addObserver', '*', this, f) ;
        } else if (value.addObserver) {
          value.addObserver('*', this, f) ;
        }
      }

      // determine the content type.
      var count = !value ? 0 : (SC.isArray(value) ? this._lengthFor(value) : 1) ;
      
      // New content is configured, update controller stats
      this.beginPropertyChanges() ;
      this.set('hasNoContent',count === 0) ;
      this.set('hasSingleContent',count === 1) ;
      this.set('hasMultipleContent',count > 1) ;

      // notify everyone that everything is different now.
      this.allPropertiesDidChange() ;
      this.endPropertyChanges() ;
    }
  }.observes('content'),
  
  // invoked when properties on the content object change.  Just forward
  // to controller.
  _contentPropertyDidChange: function(target,key,value, propertyRevision) {
    this._changeFromContent = true ;
    if (key === '*') {
      this.allPropertiesDidChange() ;
    } else {
      this.propertyWillChange(key) ;
      this.propertyDidChange(key,value) ;
    }
    this._changeFromContent = false ;
  },
  
  _lengthFor: function(obj) {
    return (obj.get ? obj.get('length') : obj.length) || 0;
  },
  
  _objectAt: function(idx, obj) {
    return obj.objectAt ? obj.objectAt(idx) : (obj.get ? obj.get(idx) : obj[idx]) ;
  }
      
}) ;
