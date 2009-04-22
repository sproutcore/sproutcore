// ========================================================================
// SproutCore -- JavaScript Application Framework
// Copyright ©2006-2008, Sprout Systems, Inc. and contributors.
// Portions copyright ©2008 Apple, Inc.  All rights reserved.
// ========================================================================

require('controllers/controller');
require('mixins/selection_support');

/**
  @class
  
  An Array Controller provides a way to project the contents of an array
  out to a view.  You can use this object any place you might use an
  array.  Changes to the array will not propogate to the content array
  until you call commitChanges().
  
  @extends SC.Controller
  @extends SC.Array
  @extends SC.SelectionSupport
  @author Charles Jolley
  @author Erich Ocean
  @version 1.0
  @since SproutCore 1.0
*/
SC.ArrayController = SC.Controller.extend(SC.Array, SC.SelectionSupport,
/** @scope SC.ArrayController.prototype */ {
  
  /**
    If YES the will return controllers for content objects.
    
    If you want to use an array controller to edit an array contents directly
    but you do not want to wrap the values of the array in controller objects
    then you should set this property to NO.
    
    @type Boolean
  */
  useControllersForContent: NO,
  
  /**
    Provides compatibility with collection controllers.
    
    @property
    @type SC.ArrayController
  */
  arrangedObjects: function() { return this; }.property('content'),
  
  /**
    The content array managed by this controller.  
    
    In general you can treat an instance of ArrayController as if it were 
    the array held in this property.  Any changes you make to the controller
    that are not specifically implemented in the controller will pass through
    to the Array.
    
    Also if you set commitsChangesImmediately to NO, the controller will
    buffer changes against this.
    
    @type SC.Array
  */
  content: null,
  
  /** @private */
  contentBindingDefault: SC.Binding.multiple(),
  
  /**
    Set to YES if the controller has any content, even an empty array.
    
    @property
    @type Boolean
  */
  hasContent: function() {
    return !SC.none(this.get('content')) ;
  }.property('content'),
  
  /**
    Property key to use to group objects.
    
    If groupBy is set to a non-null value, then the array controller will
    automatically partion the content array into groups based on the value of 
    the passed property key.  The exampleGroup will be used to create the
    objects in the groups array.
    
    If this property is set, you MUST ensure the items in the content array 
    are already sorted by the group key.  Otherwise groups might appear more 
    than once.
    
    @type String
  */
  groupByKey: null,
  
  /**
    When grouping, create objects using this class. SC.ArrayController will 
    set 'value' to the value of the groupByKey, and 'itemRange' to an 
    SC.Range of the item indexes in the group, and 'owner' to this array
    controller.
    
    @type Class
  */
  exampleGroup: SC.Object,
  
  /**
    The groups, if any, for the current content array.
    
    @readOnly
    @property
    @type SC.Array
  */
  groups: function(key, val) {
    if (val) throw "The SC.ArrayController groups property is read-only." ;
    
    var groupByKey = this.get('groupByKey') ;
    if (!groupByKey) return SC.EMPTY_ARRAY ; // no groups
    
    var content = this.get('content') ;
    if (!content || content.get('length') === 0) {
      return SC.EMPTY_ARRAY ; // no groups...
    }
    
    // okay, calculate the groups...
    var previousGroup, currentGroup, groupStart = 0 ;
    var obj, groups = [], GroupClass = this.get('exampleGroup') ;
    
    // initialize the discover groups loop
    previousGroup = content.objectAt(0).get(groupByKey) ;
    
    // discover groups...
    for (var idx=0, len=content.get('length'); idx<len; ++idx) {
      obj = content.objectAt(idx) ;
      currentGroup = obj.get(groupByKey) ;
      
      // did our group change?
      if (previousGroup !== currentGroup) {
        // save the current group
        groups.push(GroupClass.create({
          value: previousGroup,
          itemRange: { start: groupStart, length: idx - groupStart },
          owner: this
        }));
        
        // and move on to the next group
        previousGroup = currentGroup ;
        groupStart = idx ;
      }
    }
    
    // close the last and final group
    groups.push(GroupClass.create({
      value: previousGroup,
      itemRange: { start: groupStart, length: idx - groupStart },
      owner: this
    }));
    
    return groups ;
  }.property('content', 'groupByKey').cacheable(),
  
  /**
    Set to YES if you want objects removed from the array to also be
    deleted.  This is a convenient way to manage lists of items owned
    by a parent record object.
    
    Note that even if this is set to NO, calling destroyObject() instead of
    removeObject() will still destroy the object in question as well as 
    removing it from the parent array.
    
    @type {Boolean}
  */
  destroyOnRemoval: NO,
  
  /**
    Defines the default class to use when creating new content. 
    
    This property should either contains a class or a string that resolves
    to a class that responds to the newRecord() method.
    
    @type {Class}
  */
  exampleContentObject: null,
  
  /**
    Creates a new record instance and adds it to the end of the current array.
    
    This method works just like insertNewObjectAt() but always appends.
    
    @param attributes {Hash} optional hash of attributes to pass to the new obejct.
    @param objectType {Class} optional class of object to create.
    @returns {Object} the newly created object (also added to the array)
  */
  newObject: function(attributes, objectType) {
    return this.insertNewObjectAt(null, attributes, objectType) ;
  },
  
  /**
    Creates a new content object and inserts it at the passed index or appends
    it at the end of the array if you pass null.
    
    This method takes an optional hash of attributes which will be set on
    the new record.  You can also pass an optional objectType.  If you do 
    not pass the objectType, you must instead set the exampleContentObject to 
    the class of the object you want to use.  The object can be of any type 
    but it must respond to the newRecord() method.
    
    Objects created using this method will be destroyed automatically if you
    have set commitsChangesImmediately to false and call discardChanges().
    
    @param index {Number} the index to insert at or null to append.
    @param attributes {Hash} optional hash of attributes to pass to the new obejct.
    @param objectType {Class} optional class of object to create.
    @returns {Object} the newly created object (also added to the array)
  */
  insertNewObjectAt: function(index, attributes, objectType) {
    
    // compute the objectType
    if (!objectType) objectType = this.get('exampleContentObject') ;
    if (SC.typeOf(objectType) === SC.T_STRING) {
      objectType = SC.objectForPropertyPath(objectType) ;
    }
    if (SC.none(objectType)) {
      throw "Invalid object type was provided" ;
    }
    
    if (SC.typeOf(objectType.newObject) !== SC.T_FUNCTION) {
      throw "content object type does not support newRecord()" ;
    }
    
    // Create a new object...
    var obj = objectType.newObject(attributes) ;
    if (!this._createdObjects) this._createdObjects = [] ;
    this._createdObjects.push(obj) ; // save for discard...
    
    // Add to array.
    if (index) {
      this.insertAt(index, obj) ;
    } else this.pushObject(obj) ;
    
    return obj ;
  },
  
  /** @private
    Watches changes to the content property updates the contentClone.
    
    @observes content
  */
  _contentDidChange: function() {
    // console.log('%@._contentDidChange()'.fmt(this));
    var content = this.get('content') ;
    if (content === this._content) return ; // nothing to do
    
    var func = this._contentPropertyDidChange ;
    
    // remove old observer, add new observer, and trigger content property change
    if (this._content && this._content.removeObserver) {
      this._content.removeObserver('[]', this, func) ;
    } 
    
    if (content && content.addObserver) {
      content.addObserver('[]', this, func) ;
    }
    
    this._content = content; //cache
    this._contentPropertyRevision = null ;
    
    var rev = (content) ? content.propertyRevision : -1 ;
    this._contentPropertyDidChange(content, '[]', content, rev) ; 
  }.observes('content'),
  
  _contentPropertyDidChange: function(target, key, value, rev) {  
    // console.log('%@._contentPropertyDidChange(target=%@, key=%@, value=%@, rev=%@)'.fmt(this, target, key, value, rev));
    if (!this._updatingContent && (!rev || (rev != this._contentPropertyRevision))) {
      this._contentPropertyRevision = rev ;
      
      this._updatingContent = true ;
      
      this.beginPropertyChanges();
      this.contentCloneReset();
      this.enumerableContentDidChange() ;
      this.notifyPropertyChange('length') ;
      this.updateSelectionAfterContentChange();
      this.endPropertyChanges() ;
      
      this._updatingContent = false ;
    }
  },
  
  /**
    The array content that (when committed) will be merged back into the 
    content property. All array methods will take place on this object.
    
    @property
    @type SC.Array
  */
  contentClone: null,
  
  /** @private
    Clones the content property into the contentClone property.
  */
  contentCloneReset: function() {
    this._changelog = [];
    this.set('contentClone', null);
  },

  /**
   SC.Array interface implementation.
   
   @param idx {Number} Starting index in the array to replace.  If idx >= 
     length, then append to the end of the array.
   
   @param amt {Number} Number of elements that should be removed from the 
     array, starting at *idx*.
   
   @param objects {Array} An array of zero or more objects that should be 
     inserted into the array at *idx* 
  */
  replace: function(idx, amt, objects) {
    var content = this.get('content') ;
    
    // in case the passed objects are controllers, convert to source objects.
    var copyIdx = objects.length ;
    var sourceObjects = objects ;
    if (copyIdx > 0) {
      sourceObjects = [] ;
      while(--copyIdx >= 0) {
        sourceObjects[copyIdx] = this._sourceObjectFor(objects[copyIdx]) ;
      }
    }
    
    // create clone of content array if needed
    var contentClone = this.get('contentClone') ;
    if (!contentClone) {
      this.set('contentClone', contentClone = SC.$A(content)) ;
    }
    
    // now, record the removed objects.  This may be used later.
    if (this.get('destroyOnRemoval')) {
      if (!this._deletions) this._deletions = [] ;
      for (var i=0; i < amt; i++) {
        this._deletions.push(content.objectAt(idx + i));
      }
    }
    
    // and record additions
    if (!this._changelog) this._changelog = []; 
    this._changelog.push({ idx: idx, amt: amt, objects: sourceObjects });
    
    // then actually perform the edit on the contentClone
    contentClone.replace(idx, amt, sourceObjects);
    
    this.editorDidChange() ;
    this.enumerableContentDidChange();
    this.updateSelectionAfterContentChange();
    
    return this;
  },
  
  /**
    SC.Array interface implimentation.
    @param idx {Number} The index of the item to return.  If idx exceeds the 
      current length, return null.
  */
  objectAt: function(idx) {
    var obj = this._getSourceContent() ;
    obj = (obj && obj.objectAt) ? obj.objectAt(idx) : null;
    return this._objectControllerFor(obj) ;
  },
  /**
    SC.Array interface implimentation.
    @property
    @type {integer}
  */
  length: function( key, value ) {
    var ret = this._getSourceContent() ;
    return (ret && ret.get) ? (ret.get('length') || 0) : 0 ;
  }.property(),
  
  /**
    Returns the index in the array of the specified object.
    
    This can handle both controller wrapper objects and source content objects.
  */
  indexOf: function(obj) {
    return this._getSourceContent().indexOf(this._sourceObjectFor(obj)) ;
  },
  
  _getSourceContent: function() {
    return this.get('contentClone') || this.get('content') || [];
  },
  
  /** @private */
  performCommitChanges: function() {
    var content = this.get('content');
    var ret     = true;
    var idx ;
    
    // cannot commit changes to null content.  Return an error.
    if (!content) {
      return SC.$error("No Content");
    }
    
    if (content.beginPropertyChanges) content.beginPropertyChanges();
    
    // apply all the changes made to the clone
    if (this._changelog) {
      var changelog = this._changelog ;
      var max = changelog.length;
      for(idx=0;idx<max;idx++) {
        var change = changelog[idx];
        content.replace(change.idx, change.amt, change.objects) ;
      }
      this._changelog.length = 0 ; // reset changelog
    }
    
    // finally, destroy any removed objects if necessary.  Make 
    // sure the objects have not been re-added before doing this.
    if (this.get('destroyOnRemoval') && this._deletions && this._deletions.length>0) {
      idx = this._deletions.length;
      while(--idx >= 0) {
        var obj = this._deletions[idx] ;
        if (obj && obj.destroy && (content.indexOf(obj) < 0)) {
          obj.destroy() ; 
        }
      }
      this._deletions.length = 0; // clear array
    }
    
    // changes commited, clear any created objects from the internal array
    if (this._createdObjects) this._createdObjects.length = 0 ;
    
     // finish commiting changes.
    if (content.endPropertyChanges) content.endPropertyChanges();
    if (content.commitChanges) ret = content.commitChanges();
    
    if (SC.$ok(ret)) {
      this.contentCloneReset();
      this.editorDidClearChanges();
    }
    
    return ret;
  },
  
  /** @private */
  performDiscardChanges: function() {
    this.contentCloneReset();
    this.editorDidClearChanges();
    
    // if any objects were created before the commit, destroy the objects 
    // and reset the array.
    if (this._createdObjects && this._createdObjects.length > 0) {
      var idx = this._createdObjects.length ;
      while(--idx >= 0) {
        var obj = this._createdObjects[idx] ;
        if (SC.typeOf(obj.destroy) === SC.T_FUNCTION) obj.destroy() ;
      }
      this._createdObjects.length = 0 ;
    }
    
    return true;
  },
  
  /** @private
    Returns the object controller for a source value.
  */
  _objectControllerFor: function(obj) {
    if (!this.useControllersForContent) return obj;
    
    var controllers = (this._objControllers = this._objControllers || {}) ;
    var guid = SC.guidFor(obj) ;
    var ret = controllers[guid] ;
    if (!ret) {
      ret = controllers[guid] = this.controllerForValue(obj) ;
      if (ret) ret.__isArrayController = true ;
    }
    return ret ;
  },
  
  /** @private
    Returns the source object for the passed value.  If the passed value is a 
    controller, this will map back to the sourceo object.  Otherwise the 
    object itself will be returned.
  */
  _sourceObjectFor: function(obj) {
    return (obj && obj.kindOf && obj.kindOf(SC.Controller)) ?
      obj.get('content') :
      obj ;
  },
  
  /** @private */
  init: function() {
    sc_super() ;
    if (this.get('content')) this._contentDidChange() ;
  },
  
  sort: function(callback) {
    var content = this.get('content') ;
    if (content && content.sort) content.sort(callback) ;
    return this ; // we're still the content...
  },
  
  forEach: function(callback, target) {
    if (typeof callback !== "function") throw new TypeError() ;
    var content = this.get('content') ;
    if (!content) return this ;
    
    var len = (content.get) ? content.get('length') : content.length ;
    if (target === undefined) target = null;
    
    var last = null ;
    var context = SC.Enumerator._popContext();
    for(var idx=0;idx<len;idx++) {
      var next = content.nextObject(idx, last, context) ;
      callback.call(target, next, idx, this);
      last = next ;
    }
    last = null ;
    context = SC.Enumerator._pushContext(context);
    return this ;
  }
  
});
