// ========================================================================
// SproutCore
// copyright 2006-2008 Sprout Systems, Inc.
// ========================================================================

require('views/text_field') ;

/**
  FormView provides a simple way for you to focus a group of views onto a 
  single content object or set of content objects.  It can also be used to
  "stage" input by buffering data from your views into the form before it is 
  set on your actual content object.  This approach is generally deprecated 
  however as the Controller objects now provide this same buffering feature
  in a more robust way.

  h2. How It Works

  On startup, FormView will walk any child views looking for any views 
  with the property "fieldKey".  Any views with this key will be saved as
  fields on the form.  You can access their value directly on the form by
  getting the value of fieldKey.

  Used this way, you can easily combine multiple views into a single,
  bindable object.  To gain the full functionality however, you should use
  the content commit capability.

  IMPORTANT:  FormView defines some properties of its own.  If you try to
  name your fields with properties already declared in FormView, they will
  be ignored and a warning will be logged to the console.

  h2. Content Commit

  If you set the content object on a form view, then the form fields will
  automatically be bound to the same named keys on the content object.  When
  the content object value's change, the fields on the form will update
  automatically.  Likewise, if you change the value of the field, the value
  of the content object will generally be changed as wel.
  
  If you prefer, you can also turn on buffered commits by setting the 
  commitChangesImmediately property to NO.  This will cause the form to 
  buffer any changes to the field values and only forwards them to the content
  when you call commitChanges() on the form.  This method of buffering is
  still supported for some simple cases, however it is better to use the newer
  Controller objects that provide this same buffering in a more robust way.

*/
SC.FormView = SC.View.extend({

  // PROPERTIES
  
  // set this to point to an object and the value of the object will be used
  // to auto-populate the form.  When the form is committed, its values will
  // applied to this content object.
  content: null,
  contentBindingDefault: SC.Binding.Single,

  // this is set to true when the values of the field have changed since the
  // last commit or reset.
  isDirty: false,

  // this is set to true while a form is in the process of committing changes
  // from the form.  This is useful when your content is an object controller
  // that actually commits the form to the server.
  isCommitting: true,
  
  // set to false to disable form input.  this will set the isEnabled property
  // of all fields to false.
  isEnabled: true,
  
  passThroughToContent: false,
  
  // computed property returns true if you have no errors.
  isValid: function() {
    return this.get('errors').length == 0;
  }.property('errors'),
  
  // RO - computed property returns true if the form can current be committed.
  // The default version returns true if the form is enabled, valid, and 
  // dirty.  You can override this with your own changes if you prefer some
  // other behavior.
  canCommit: function() {
    return this.get('isValid') && this.get('isEnabled');
  }.property('isValid','isEnabled'),
  
  // Set this to an error or array of errors to be included in the
  // overall errors property. 
  generalErrors: null,
  
  // RO - this property returns any current errors on the form.  Note that if
  // you are implementing your own view, you should set your own value to
  // an insteand of SC.FieldError and it will be displayed.
  errors: function() {
    if (!this._fields) return [] ;
    
    // compute cached errors.
    if (!this._errors) {
      var fview =this ;
      this._errors = [] ;
      this.get('fieldKeys').each(function(k) {
        var value = fview.get(k) ;
        if ($type(value) == T_ERROR) fview._errors.push(value) ;
      }) ;
    }
    
    // return set of errors.
    return this._errors.concat(this.get('generalErrors') || []) ;
  }.property('generalErrors'),

  
  fieldKeys: function() {
    if (!this._fieldKeys && this._fields) {
      var keys = [];
      for(var key in this._fields) {
        if (!this._fields.hasOwnProperty(key)) continue ;
        keys.push(key) ;
      }
      this._fieldKeys = keys ;
    } 
    return this._fieldKeys ;
  }.property(),
  
  // SUPPORT METHODS  
  
  // Call this method to perform a full validation on the form fields.
  // Returns true if the form is valid, false if it is not.  If validation
  // fails, the errors property will be set to the approrpiate value.
  validate: function() {
    if (!this._fields) return true; // ok if now fields.
    
    // validate all fields.
    for(var key in this._fields) {
      if (this._fields.hasOwnProperty(key)) {
        var field = this._fields[key] ;
        if (field.validateSubmit) field.validateSubmit() ;
      }
    } 
    
    // check for errors
    return this.get('isValid') ;
  },
  
  // This action can be called by a button to commit change to the form.
  commit: function() {


    // validate the form.  Return false if validation fails.
    if (!this.validate()) return false ;

    var ret = true ;
    var content = this.get('content') ;
    if (!content || !this._fields) return ;
    
    // disable form during commit.
    var wasEnabled = this.get('isEnabled') ;
    this.beginPropertyChanges() ;
    this.set('isEnabled', false) ;
    this.set('isCommitting',true) ;
    this.endPropertyChanges() ;
    
    ret = this.get('passThroughToContent') ? this._commitChanges() : this._copyContentAndCommitChanges();

    // clean up property settings.
    this.beginPropertyChanges() ;
    this.set('isCommitting',false) ;
    this.set('isEnabled',wasEnabled) ;
    this.endPropertyChanges() ;
    
    return ret ;
  },

  _copyContentAndCommitChanges: function()
  {
    var ret = true ;
    var content = this.get('content');
    if (!content || !this._fields) return false;

    // copy all the properties back to the content object.
    // if the content object throws an error for some reason, catch it
    // and log it.  Also add it to the list of errors.
    try {
      content.beginPropertyChanges();
      for (var key in this._fields)
      {
        if (key.match(/Button$/)) continue; // ignore buttons.
        
        if (this._fields.hasOwnProperty(key)) {
          var newValue = this.get(key);
          content.set(key,newValue);
        }
      }
      content.endPropertyChanges();

      // attempt to save changes...
      ret = this._commitChanges();
      
      // once a commit is complete, set isDirty to false.  If the commit
      // fails or an exception occurs, then don't set to false.
      this.set('isDirty', !ret) ;
    }
    catch(e) {
      console.log("commit() exception: " + e) ;
      ret = false ;
    }
    
    return ret;
  },
  _commitChanges: function()
  {
    var content = this.get('content');
    var success = false;
    
    // If the content object supports a commit method, call it so it can
    // commit changes to the server.
    if (content && content.commit) {
      success = content.commit(this);
    } else if (content && content.commitChanges) {
      success = content.commitChanges();
    }
    
    return success;
  },
  
  
  // This action will reset the form, copying the current values from the
  // content object onto the field values.
  reset: function()
  {
    if (!this._fields) return; // EXIT POINT
    
    var content = this.get('content');
    
    if (content && content.discardChanges) content.discardChanges();

    this.beginPropertyChanges();
    for(var key in this._fields) {
      if (this._fields.hasOwnProperty(key)) {
        var value = (content) ? content.get(key) : null;
        this.set(key, value);
      }
    }
    this.set('isDirty',false);
    this.endPropertyChanges();
    
    //if (content && content.discardChanges) content.discardChanges();
  },
  
  // This method will crawl through its child views looking for any view
  // with the fieldKey property set.  This does not go inside of other
  // FormViews.
  rebuildFields: function() {
    this.beginPropertyChanges(); 
    
    // if fields are already registered, remove them.  Do it this way so
    // that we can remove observer from the target object as well.
    if (this._fields) {
      for (var key in this._fields) {
        if (this._fields.hasOwnProperty(key)) this.removeField(key) ;
      }
    }
    
    // reset the fields hash.
    this._fields = {} ;
    this._buttons = {} ;
    this._values = {} ;
    
    // now rebuild field nodes for children.
    this._rebuildFieldsForNode(this, true) ;
    this.endPropertyChanges() ;
  },
  
  // You can add a field manually by calling this method. 
  // key - the key to respond to.  
  // field - the view to map to the key.  This should be a child view of the
  //         form, but it is not required.
  addField: function(key, field) {
    
    // if the key is already defined on the form view, then we can't use it
    // as a field.  Throw an exception.
    if (this[key] !== undefined) {
      throw "FormView cannot add the field '%@' because that property already exists.  Try using another name.".fmt(key);
    }
    
    // if this field is a submitButton or resetButton and the actio is
    // not set, set it...
    var form = this ;
    if (key == 'submitButton' && (field.action == SC.ButtonView.prototype.action)) {
      field.action = function() { form.commit(); } ;
    }
    
    if (key =="resetButton" && (field.action == SC.ButtonView.prototype.action)) {
      field.action = function() { form.reset(); } ;    
    }
    
    // save this field in the key.
    this._fields[key] = field ;
    if (key.substr(-6,6) == "Button") {
      this._buttons[key] = field ; 
    };
    
    // also add property of field to cache and notify of change.
    this.propertyWillChange(key) ;
    this.setValueForField(key, field.get('value'));
    this.propertyDidChange(key,this.getValueForField(key)) ;    
    
    // and add us as an observer.
    field.addObserver('value', this._fieldValueObserver_b()) ;
    field.set('ownerForm',this) ;
    
    this.propertyWillChange('fieldKeys') ;
    this._fieldKeys = null ;
    this.propertyDidChange('fieldKeys', null) ;
  },
  
  // This will remove the field with the named key from the list of fields.
  removeField: function(key) {
    // first remove the form as an observer to this field.
    var field = this._fields[key] ;
    if (field) {
      field.removeObserver('value', this._fieldValueObserver_b());
      field.set('ownerForm',null) ;
    }
    
    // now delete the field from our hash and cache and notify.
    this.propertyWillChange(key) ;
    delete this._fields[key] ;  
    delete this._values[key] ;
    delete this._buttons[key] ;
    this.propertyDidChange(key, null) ;

    
    this.propertyWillChange('fieldKeys') ;
    this._fieldKeys = null ;
    this.propertyDidChange('fieldKeys', null) ;
  },
  
  // public accessor for retrieving the field View object
  getField: function(key) {
    return this._fields[key];
  },
  
  
  // KEYBOARD SUPPORT METHODS
  
  // Process keyboard events...
  keyDown: function(evt) {
    return this.interpretKeyEvents(evt) ; // start bubbling key events...
  },
  keyUp: function() {},

  // Handle default button.
  insertNewline: function(sender, evt) {
    
    // find the default button to use by scanning for the isDefault button.
    var button = this._findDefaultButton(this) ;
    
    // if not isDefault-button was found, look for the submitButton:
    if (!button && this._fields && this._fields.submitButton) {
      button = this._fields.submitButton ;
    }

    if (button && button.triggerAction) button.triggerAction(evt) ;
    return true ;
  },
  
  // search child views looking for the default button view.
  _findDefaultButton: function(view) {
    if (view.triggerAction && view.get('isDefault')) return view;
    view = view.firstChild;
    while(view) {
      var ret = this._findDefaultButton(view) ;
      if (ret) return ret ;
      view = view.nextSibling ;
    }   
    
    return null ;
  },
  
  // INTERNAL SUPPORT METHODS
  
  // This is called anytime you try to get or set an unknown property.  When
  // you get a property, this will look in the fields as well.
  unknownProperty: function(key, value) {

    var field = (this._fields) ? this._fields[key] : null ;
    
    // setter
    if (value !== undefined) {
      if (field) {
        
        var oldValue = this.getValueForField(key);
        
        // save in our own cache first.  This way when we get notified of
        // the new value by the field, we won't renotify everyone else.
        this.setValueForField(key, value);
        
        // set the value on the field itself as well...
        field.set('value',value) ;
        
        // notify errors if the newValue changed to or from an error.
        var isOldError = $type(oldValue) == T_ERROR ;
        var isNewError = $type(value) == T_ERROR ;

        if (isOldError != isNewError) {
          this.propertyWillChange('errors') ;
          this._errors = null ;
          this.propertyDidChange('errors', null) ;
        } 
        
        
      // if this is not on a field, just do the normal thing if no field fnd.
      } else this[key] = value ; 
      
    // getter
    } else {
      
      // return the cached value if there is one.
      if (field) {
        if (this.getValueForField(key) === undefined) {
          this.setValueForField(key, field.get('value'));
        }
        return this.getValueForField(key);
      }
      
    }
    
    return value ;
  },
  
  getValueForField: function( key )
  {
    if (this.get('passThroughToContent')) {
      var content = this.get('content');
      return (content && content.get) ? content.get(key) : undefined;
    } else {
      return this._values[key];
    }
  },
  setValueForField: function( key, value )
  {
    if (this.get('passThroughToContent')) {
      var content = this.get('content');
      if (content && content.get && content.set && (content.get(key) !== value)) 
      {
        content.set(key, value);
      }
    } else {
      this._values[key] = value;
    }
    return value;
  },
  
  // When the form is first created, go find all the fields and save them.
  init: function() {
    sc_super() ;
    
    // disable the normal submission system so we can take over.
    if (this.rootElement && this.rootElement.tagName.toLowerCase() == "form") {
      this.rootElement.onsubmit = function() { return false; } ;
      
    }
    this.rebuildFields() ;
  },
  
  _rebuildFieldsForNode: function(node, _force) {
    if (node.fieldKey) this.addField(node.fieldKey, node) ;

    // other form views may be fields in your current form, but we do not 
    // examine the children of the other form views because the form views own
    // those fields.
    if ((_force != true) && (node instanceof SC.FormView)) return ;
    
    // examine children.
    var nodes = (node.childNodesForFormField) ? node.childNodesForFormField() : node.get('childNodes');
    var loc = nodes.length ;
    while(--loc >= 0) {
      node = nodes[loc] ;
      this._rebuildFieldsForNode(node, false);
    }
  },
  
  // this observer is added to all field's value property.  This simply
  // notifies any observers of the form that the field's property has changed.
  _fieldValueObserver: function(field, key, value) { 
    if (!(key = field.fieldKey)) return ; // only notifiy fields with keys...

    // return if the new value is the same as the old value.  This avoids
    // infinite loops when the value is changed by our own setter.
    var oldValue = this.getValueForField(key);
    if (oldValue == value) return ;

    // value did change so...
    
    this.beginPropertyChanges() ;

    // notify changes to field.
    this.propertyWillChange(key) ;
    this.setValueForField(key, value); // save the changed value.
    this.propertyDidChange(key, value) ;

    // notify errors if the newValue changed to or from an error.
    var isOldError = $type(oldValue) == T_ERROR ;
    var isNewError = $type(value) == T_ERROR ;
    
    if (isOldError != isNewError) {
      this.propertyWillChange('errors') ;
      this._errors = null ;
      this.propertyDidChange('errors', null) ;
    } 

    // make form dirty.
    if (!this.get('isDirty')) this.set('isDirty',true) ;

    this.endPropertyChanges() ;
  },

  // returns a bound observer function...
  _fieldValueObserver_b: function() {
    return this._bound_fieldValueObserver = (this._bound_fieldValueObserver || this._fieldValueObserver.bind(this)) ;
  },

  // this observer gets called anytime any property changes on the content
  // object, even those that are not mapped to fields on the form.  This
  // code simply checks for a change and then updates.
  _contentPropertyObserver: function(content, key, value) {
    if (!this._fields || !content) return ;
    var fields = this._fields ;
    
    // if the key changed is one we match, just update with the new value...
    // NOTE: it is important to call didChangeFor() everytime this is called.
    // otherwise this might not notify changes property.
    if (fields[key] && content.didChangeFor(this,key)) {
      this.set(key, value) ;
      
    // otherwise, if the key changes is "*", then check all fields.
    } else if (key == "*") {
      for(var key in fields) {
        if (fields.hasOwnProperty(key) && content.didChangeFor(this,key)) {
          this.set(key,content.get(key)) ;
        } // if (fields)
      } // for(var key)
    } // else if...
  },

  // returns the bound observer function...
  _contentPropertyObserver_b: function() {
    return this._bound_contentPropertyObserver = (this._bound_contentPropertyObserver || this._contentPropertyObserver.bind(this)) ;
  },
  
  _isEnabledObserver: function() {
    var fields = this._fields ;
    if (!fields) return ;
    var enabled = this.get('isEnabled') ;
    var canCommit = this.get('canCommit') ;
    
    for(var key in fields) {
      if (fields.hasOwnProperty(key)) {
        var field = fields[key] ;
        if (field.set) if (key == 'submitButton') {
          field.set('isEnabled', canCommit) ;
        } else field.set('isEnabled',enabled) ;
      }
    }      
  }.observes('isEnabled'),
  
  // Automatically observe the content properties and add/remove form as 
  // observer.
  _contentObserver: function() {
    var content = this.get('content') ;
    if (content == this._content) return ; // bail if content is same.
    
    var func = this._contentPropertyObserver_b() ;
    
    // if there was an older content, remove our observer.
    if (this._content) this._content.removeObserver('*',func) ;
    
    // now, add observer to new content
    this._content = content ;
    if (!content) return ; // EXIT POINT
    content.addObserver('*', func) ; 

    // reset the form to the content values
    this.reset() ;

  }.observes('content'),
  
  _canCommitObserver: function() {
    var buttons = this._buttons ;
    var canCommit = this.get('canCommit') ;
    if (buttons && buttons.submitButton) {
      var button = buttons.submitButton ;
      if (button.set) button.set('isEnabled',canCommit) ;
    }
  }.observes('canCommit') 
  
});
