// ========================================================================
// SproutCore
// copyright 2006-2008 Sprout Systems, Inc.
// ========================================================================

require('controllers/controller') ;
require('mixins/array') ;
require('mixins/selection_support') ;
require('foundation/binding') ;

/** @class

An Array Controller provides a way to project the contents of an array
out to a view.  You can use this object any place you might use an
array.  Changes to the array will not propogate to the content array
until you call commitChanges().

@extends SC.Controller
@extends SC.Array
@extends SC.SelectionSupport
@since SproutCore 1.0

*/
SC.ArrayController = SC.Controller.extend(SC.Array, SC.SelectionSupport,
/** @scope SC.ArrayController.prototype */
{
  /**
    If YES the will return controllers for content objects.
    
    If you want to use an array controller to edit an array contents directly
    but you do not want to wrap the values of the array in controller objects
    then you should set this property to NO.
    
    @field
    @type {Boolean}
  */
  useControllersForContent: NO,
  
  /**
    Provides compatibility with CollectionControllers.
    @field
    @type {SC.ArrayController}
  */
  arrangedObjects: function() { return this; }.property('content'),

  /**
    The array content that is being managed by the controller.
    @field
    @type {Array}
  */
  content: null,
  contentBindingDefault: SC.Binding.Multiple,
  
  /**
    Set to true if you want objects removed from the array to also be
    deleted.  This is a convenient way to manage lists of items owned
    by a parent record object.
    
    @field
    @type {Boolean}
  */
  destroyOnRemoval: NO,
    
  /**
    Watches changes to the content property updates the contentClone.
    @private
    @observes content
  */
  _contentObserver: function() {
    var content = this.get('content') ;
    if (SC.isEqual(content, this._content)) return ; // nothing to do

    if (!this._boundContentPropertyObserver) {
      this._boundContentPropertyObserver = this._contentPropertyObserver.bind(this) ;
    }
    var func = this._boundContentPropertyObserver ;

    // remove old observer, add new observer, and trigger content property change
    if (this._content) this._content.removeObserver('[]', func) ;
    if (content) content.addObserver('[]', func) ;
    this._content = content; //cache
    this._contentPropertyRevision = null ;
    this._contentPropertyObserver(this, '[]', content, content.propertyRevision) ; 
  }.observes('content'),

  _contentPropertyObserver: function(target, key, value, rev) {  
      
    if (!this._updatingContent && (!rev || (rev != this._contentPropertyRevision))) {
      this._contentPropertyRevision = rev ;

      this._updatingContent = true ;

      this.beginPropertyChanges();
      this.contentCloneReset();
      this.arrayContentDidChange() ;
      this.notifyPropertyChange('length') ;
      this.updateSelectionAfterContentChange();
      this.endPropertyChanges() ;

      this._updatingContent = false ;

    }
  },
  
  /**
    The array content that (when committed) will be merged back into the 
    content property. All array methods will take place on this object.

    @field
    @type {SC.Array}
  */
  contentClone: null,

  /**
    Clones the content property into the contentClone property.
    @private
  */
  contentCloneReset: function() {
    this._changelog = [];
    this.set('contentClone', null);
  },

  /**
   SC.Array interface implimentation.
   
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
    var sourceObjects = [] ;
    while(--copyIdx >= 0) sourceObjects[copyIdx] = this._sourceObjectFor(objects[copyIdx]) ;
    
    // create clone of content array if needed
    var contentClone = this.get('contentClone') ;
    if (!contentClone) {
      contentClone = this.set('contentClone', content.clone());
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
    this.arrayContentDidChange();
    this.updateSelectionAfterContentChange();
    
    return this;
  },
  /**
  * SC.Array interface implimentation.
  * 
  * @param {Number} idx
  *   The index of the item to return.  If idx exceeds the current length, 
  *   return null.
  */
  objectAt: function(idx) {
    var obj = this._getSourceContent() ;
    obj = (obj && obj.objectAt) ? obj.objectAt(idx) : null;
    return this._objectControllerFor(obj) ;
  },
  /**
  * SC.Array interface implimentation.
  * @field
  * @type {integer}
  */
  length: function( key, value ) {
    var ret = this._getSourceContent() ;
    return (ret && ret.get) ? (ret.get('length') || 0) : 0 ;
  }.property(),

  /**
    Returns the index in the array of the specified object.
    
    This can handle both controller wrapper objects and source content objects.
  */
  indexOf: function( obj ) {
    return this._getSourceContent().indexOf(this._sourceObjectFor(obj)) ;
  },
  
  _getSourceContent: function() {
    return this.get('contentClone') || this.get('content') || [];
  },
  
  /** 
  * @private
  */
  performCommitChanges: function()
  {
    var content = this.get('content');
    var ret     = true;
    
    // cannot commit changes to null content.  Return an error.
    if (!content) {
      return $error("No Content");
    }
    
    if (content.beginPropertyChanges) content.beginPropertyChanges();


    // apply all the changes made to the clone
    var changelog = this._changelog || [] ;
    for(var idx=0;idx<changelog.length;idx++) {
      var change = changelog[idx];
      content.replace(change.idx, change.amt, change.objects) ;
    }
    
    // done, flush the changelog
    this._changelog = [] ;

    // finally, destroy any removed objects if necessary.  Make 
    // sure the objects have not been re-added before doing this.
    if (this.get('destroyOnRemoval') && this._deletions && this._deletions.length>0) {
      var idx = this._deletions.length;
      while(--idx >= 0) {
        var obj = this._deletions[idx] ;
        if (obj && obj.destroy && (content.indexOf(obj) < 0)) {
          obj.destroy() ; 
        }
      }
      this._deletions = [] ; // clear array
    }
    
     // finish commiting changes.
    if (content.endPropertyChanges) content.endPropertyChanges();
    if (content.commitChanges) ret = content.commitChanges();
    
    if ($ok(ret)) {
      this.contentCloneReset();
      this.editorDidClearChanges();
    }
    
    return ret;
  },
  /** 
  * @private
  */
  performDiscardChanges: function()
  {
    this.contentCloneReset();
    this.editorDidClearChanges();
    return true;
  },
  
  /** @private
    Returns the object controller for a source value.
  */
  _objectControllerFor: function(obj) {
    if (!this.useControllersForContent) return obj;
    
    var controllers = this._objControllers = this._objControllers || {} ;
    var guid = SC.getGUID(obj) ;
    var ret = controllers[guid] ;
    if (!ret) {
      ret = controllers[guid] = this.controllerForValue(obj) ;
      if (ret) ret.__isArrayController = true ;
    }
    return ret ;
  },
  
  /** @private
    Returns the source object for the passed value.  If the passed value is a 
    controller, this will map back to the sourceo object.  Otherwise the object itself
    will be returned.
  */
  _sourceObjectFor: function(obj) {
    return (obj && obj.kindOf && obj.kindOf(SC.Controller)) ? obj.get('content') : obj ;
  },
  
  init: function() {
    arguments.callee.base.apply(this, arguments) ;
    if (this.get('content')) this._contentObserver() ;
  }

});
