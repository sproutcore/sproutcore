// ========================================================================
// SproutCore -- JavaScript Application Framework
// Copyright ©2006-2008, Sprout Systems, Inc. and contributors.
// Portions copyright ©2008 Apple, Inc.  All rights reserved.
// ========================================================================

require('controllers/controller');
require('mixins/selection_support');

/**
  @class

  An ArrayController provides a way for you to publish an array of objects
  for CollectionView or other controllers to work with.  To work with an 
  ArrayController, set the content property to the array you want the 
  controller to manage.  Then work directly with the controller object as if
  it were the array itself.
  
  When you want to display an array of objects in a CollectionView, bind the
  "arrangedObjects" of the array controller to the CollectionView's "content"
  property.  This will automatically display the array in the collection view.

  h2. Grouping
  
  You can also optionally turn on grouping for your array by setting the 
  groupBy property on the ArrayController to a non-null value.  Note that when
  you turn on grouping, the ArrayController will need to search your entire
  content array to determine the groups.  If you have a large set of content,
  this can cause a performance problem.  Instead you may want to manage your
  groups manually by using a TreeController. 
  
  @extends SC.Controller
  @extends SC.Array
  @extends SC.SelectionSupport
  @author Charles Jolley
  @since SproutCore 1.0
*/
SC.ArrayController = SC.Controller.extend(SC.Array, SC.SelectionSupport,
/** @scope SC.ArrayController.prototype */ {

  // ..........................................................
  // PROPERTIES
  // 
  
  /**
    The content array managed by this controller.  
    
    You can set the content of the ArrayController to any object that 
    implements SC.Array or SC.Enumerable.  If you set the content to an object
    that implements SC.Enumerable only, you must also set the orderBy property
    so that the ArrayController can order the enumerable for you.
    
    If you set the content to a non-enumerable and non-array object, then the
    ArrayController will wrap the item in an array in an attempt to normalize
    the result.
    
    @type SC.Array
  */
  content: null,

  /**
    Makes the array editable or not.  If this is set to NO, then any attempts
    at changing the array content itself will throw an exception.
    
    @property
    @type Boolean
  */
  isEditable: YES,
  
  /**
    Used to sort the array.
    
    If you set this property to a key name, array of key names, or a function,
    then then ArrayController will automatically reorder your content array
    to match the sort order.  (If you set a function, the function will be
    used to sort).

    Normally, you should only use this property if you set the content of the
    controller to an unordered enumerable such as SC.Set or SC.SelectionSet.
    In this case the orderBy property is required in order for the controller
    to property order the content for display.
    
    If you set the content to an array, it is usually best to maintain the 
    array in the proper order that you want to display things rather than 
    using this method to order the array since it requires an extra processing
    step.  You can use this orderBy property, however, for displaying smaller 
    arrays of content.
    
    Note that you can only to use addObject() to insert new objects into an
    array that is ordered.  You cannot manually reorder or insert new objects
    into specific locations because the order is managed by this property 
    instead.
    
    If you pass a function, it should be suitable for use in compare().
    
    @property
    @type String|Array|Function
  */
  orderBy: null,
  
  /**
    Used to group the array. 
    
    If you set this property with a key name, then the ArrayController will
    automatically generate a tree of groups for display in a CollectionView.
    You can get the group tree from the groups property, which will only be
    non-null when this property is set.
    
    @property
    @type String
  */
  groupBy: null,
  
    
  /**
    Set to YES if you want the controller to wrap non-enumerable content    
    in an array and publish it.  Otherwise, it will treat single content like 
    null content.
    
    @property
    @type Boolean
  */
  allowsSingleContent: YES,
  
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
    Returns an SC.Array object suitable for use in a CollectionView.  
    Depending on how you have your ArrayController configured, this property
    may be one of several different values.  
    
    @property
    @type SC.Array
  */
  arrangedObjects: function() {
    
  }.property('content', 'orderBy', 'groupBy').cacheable(),
  
  /**
    Computed property indicates whether or not the array controller can 
    remove content.  You can delete content only if the content is not single
    content and isEditable is YES.
    
    @property
    @type Boolean
  */
  canRemoveContent: function() {
    var content = this.get('content');
    if (!content || !this.get('isEditable') || !this.get('hasContent')) return NO ;
    if (content.isEnumerable && (SC.typeOf(content.removeObject) !== SC.T_FUNCTION)) return NO ;
    return YES;
  }.property('content', 'isEditable', 'hasContent'),
  
  /**
    Computed property indicates whether you can reorder content.  You can
    reorder content as long a the controller isEditable and the content is a
    real SC.Array-like object.  You cannot reorder content when orderBy is
    non-null.
    
    @property
    @type Boolean
  */
  canReorderContent: function() {
    var content = this.get('content');
    return content && this.get('isEditable') && !this.get('orderBy') && content.isSCArray;
  }.property('content', 'isEditable', 'orderBy'),
  
  /**
    Computed property insides whether you can add content.  You can add 
    content as long as the controller isEditable and the content is not a 
    single object.
    
    Note that the only way to simply add object to an ArrayController is to
    use the addObject() or pushObject() methods.  All other methods imply 
    reordering and will fail.
    
    @property
    @type Boolean
  */
  canAddContent: function() {
    var content = this.get('content');
    return content && this.get('isEditable') && content.isEnumerable && (SC.typeOf(content.addObject) === SC.T_FUNCTION);
  }.property('content', 'isEditable'),
  
  /**
    Set to YES if the controller has valid content that can be displayed,
    even an empty array.  Returns NO if the content is null or not enumerable
    and allowsSingleContent is NO.
    
    @property
    @type Boolean
  */
  hasContent: function() {
    var content = this.get('content');
    return content && (content.isEnumerable||this.get('allowSingleContent'));
  }.property('content', 'allowSingleContent'),
  

  /**  
    The actual array this controller is managing.  You should not usually
    access this property directly; it is mostly used internally.  
    
    Most of the time this property is the same as the content property, but 
    it may differ on occasion.  Particularly if you set the content property
    to a single object.  Also, if you set the orderBy property this will 
    represent the ordered array.
    
    @property
    @type SC.Array
  */
  observableContent: function() {
    var content = this.get('content'),
        orderBy = this.get('orderBy'),
        ret, func, t, len;
    
    if (!content) return null ; // nothing to do
    if (!orderBy && content.isSCArray) return content; // no wrap
    if (!orderBy) {
      throw "%@.orderBy is required for unordered content".fmt(this);     
    }
    
    // build array - then sort it
    switch(SC.typeOf(orderBy)) {
    case SC.T_STRING:
      orderBy = [orderBy];
      break;
    case SC.T_FUNCTION:
      func = orderBy ;
      break;
    case SC.T_ARRAY:
      break;
    default:
      throw "%@.orderBy must be Array, String, or Function".fmt(this);
    }
    
    len = orderBy.get('length');
    
    // generate comparison function if needed - use orderBy
    if (!func) {
      func = function(a,b) {
        var idx=0, status=0, key, aValue, bValue;
        for(idx=0;(idx<len)&&(status===0);idx++) {
          key = orderBy.objectAt(key);
        
          if (a) aValue = a ;
          else if (a.isObservable) aValue = a.get(key);
          else aValue = a[key];

          if (b) bValue = b ;
          else if (b.isObservable) bValue = b.get(key);
          else bValue = b[key];
        
          status = SC.compare(aValue, bValue);
        }
        return ret ; 
      };
    }

    ret = [];
    content.forEach(function(o) { ret.push(o); });
    ret.sort(func);
    
    func = null ; // avoid memory leaks
    return ret ;
    
  }.property('content', 'allowsSingleContent', 'orderBy').cacheable(),

  // ..........................................................
  // METHODS
  // 
  
  /**
    Adds an object to the array.  If the content is ordered, this will add the 
    object to the end of the content array.  The content is not ordered, the
    location depends on the implementation of the content.
    
    If the source content does not support adding an object, then this method 
    will throw an exception.
    
    @param {Object} object the object to add
    @returns {SC.ArrayController} receiver
  */
  addObject: function(object) {
    if (!this.get('canAddContent')) throw "%@ cannot add content".fmt(this);
    
    var content = this.get('content');
    if (content.isSCArray) content.pushObject(object);
    else if (content.addObject) content.addObject(obj);
    else throw "%@.content does not support addObject".fmt(this);
    
    return this;
  },
  
  /**
    Removes the passed object from the array.  If the underyling content 
    is a single object, then this simply sets the content to null.  Otherwise
    it will call removeObject() on the content.
    
    Also, if destroyOnRemoval is YES, this will actually destroy the object.
    
    @param {Object} object the object to remove
    @returns {SC.ArrayController} receiver
  */
  removeObject: function(object) {
    if (!this.get('canRemoveContent')) {
      throw "%@ cannot remove content".fmt(this);
    }
    
    var content = this.get('content');
    if (content.isEnumerable) content.removeObject(object);
    else this.set('content', null);
    
    if (this.get('destroyOnRemoval') && object.destroy) object.destroy();
    return this; 
  },
  
  // ..........................................................
  // SC.ARRAY SUPPORT
  // 

  length: function() {
  }.property(),
  
  objectAt: function(idx) {
    
  },
  
  replace: function(start, amt, objects) {
    
  },
  
  // ..........................................................
  // INTERNAL SUPPORT
  // 
  
  init: function() {
    sc_super();
    this._scac_contentDidChange();
  },
  
  _scac_contentDidChange: function() {
    
  }
  
});
