// ========================================================================
// SproutCore
// copyright 2006-2008 Sprout Systems, Inc.
// ========================================================================

require('views/view') ;
require('views/label') ;
require('mixins/collection_view_delegate') ;

SC.BENCHMARK_UPDATE_CHILDREN = NO ;
SC.VALIDATE_COLLECTION_CONSISTANCY = NO ;

/**
  Special drag operation passed to delegate if the collection view proposes
  to perform a reorder event.
*/
SC.DRAG_REORDER = 0xfff0001 ;

/** Indicates that selection points should be selected using horizontal 
  orientation.
*/
SC.HORIZONTAL_ORIENTATION = 'horizontal';

/** Selection points should be selected using vertical orientation. */
SC.VERTICAL_ORIENTATION = 'vertical' ;

/** Enables an optimization using zombie group views.  This option is configurable for perf testing purposes.  You should not change it. */
SC.ZOMBIE_GROUPS_ENABLED = YES ;

/** Enables an optimization that removes the root element from the DOM during 
a render and then readds it when complete.  This option is configurable for 
perf testing purposes.  You should not change it. */
SC.REMOVE_COLLECTION_ROOT_ELEMENT_DURING_RENDER = NO ;

/**
  @class 
  
  Renders a collection of views from a source array of model objects.
   
  The CollectionView is the root view class for rendering collections of 
  views based on a source array of objects.  It can automatically create the
  and layout the views, including displaying them in groups.  It also 
  handles event input for the entire collection.

  To use CollectionView, just create the view and set the 'content' property
  to an array of objects.  (Note that if you setup a binding, it will 
  always transform content to an array.)  The view will create instances of
  exampleView to render the array.  You can also bind to the selection 
  property if you want to monitor selection. (be sure to set the isEnabled
  property to allow selection.)
  
  @extends SC.View
  @extends SC.CollectionViewDelegate
  
*/
SC.CollectionView = SC.View.extend(SC.CollectionViewDelegate,
/** @scope SC.CollectionView.prototype */
{
  
  // ......................................
  // PROPERTIES
  //
  
  /**
    An array of content objects

    This array should contain the content objects you want the collection view 
    to display.  An item view (based on the exampleView view class) will be 
    created for each content object, in the order the content objects appear 
    in this array.
    
    If you make the collection editable, the collection view will also modify 
    this array using the observable array methods of SC.Array.
    
    Usually you will want to bind this property to a controller property 
    that actually contains the array of objects you to display.
    
    @type Array
  */
  content: [],
  
  /** @private */
  contentBindingDefault: SC.Binding.MultipleNotEmpty,
  
  /**  
    The array of currently selected objects.  

    This array should contain the currently selected content objects.  It is 
    modified automatically by the collection view when the user changes the 
    selection on the collection.

    Any item views representing content objects in this array will have their 
    isSelected property set to YES automatically.
    
    The CollectionView can deal with selection arrays that contain content 
    objects that do not belong to the content array itself.  Sometimes this 
    will happen if you share the same selection across multiple collection 
    views.
    
    Usually you will want to bind this property to a controller property that 
    actually manages the selection for your display.
    
    @type Array
  */
  selection: [],
  
  /** @private */
  selectionBindingDefault: SC.Binding.Multiple,

  /**
    Delegate used to implement fine-grained control over collection view 
    behaviors.
    
    You can assign a delegate object to this property that will be consulted
    for various decisions regarding drag and drop, selection behavior, and
    even rendering.  The object you place here must implement some or all of
    the SC.CollectionViewDelegate mixin.
  */
  delegate: null,
  
  /** 
    Allow user to select content using the mouse and keyboard 
  
    Set this property to NO to disallow the user from selecting items.
    If you have items in your selection property, they will still be reflected
    visually.
    
    @type {Bool}
  */
  isSelectable: true,
  
  /** @private */
  isSelectableBindingDefault: SC.Binding.Bool,
  
  /**
    Enable or disable the view.  
    
    The collection view will set the isEnabled property of its item views to
    reflect the same view of this property.  Whenever isEnabled is false,
    the collection view will also be not selectable or editable, regardless of the  
    settings for isEditable & isSelectable.
    
    @type {Bool}
  */
  isEnabled: true,
  
  /** @private */
  isEnabledBindingDefault: SC.Binding.Bool,

  /**
    Allow user to edit content views.
    
    The collection view will set the isEditable property on its item views to
    reflect the same value of this property.  Whenever isEditable is false, 
    the user will not be able to reorder, add, or delete items regardless of 
    the canReorderContent and canDeleteContent and isDropTarget properties.
  */
  isEditable: true,
  
  /** @private */
  isEditableBindingDefault: SC.Binding.Bool,
  
  /**
    Allow user to reorder items using drag and drop.
    
    If true, the user will can use drag and drop to reorder items in the list.
    If you also accept drops, this will allow the user to drop items into 
    specific points in the list.  Otherwise items will be added to the end.
  */
  canReorderContent: false,
  
  /** @private */
  canReorderContentBindingDefault: SC.Binding.Bool,

  /**
    Allow the user to delete items using the delete key
    
    If true the user will be allowed to delete selected items using the delete
    key.  Otherwise deletes will not be permitted.
  */
  canDeleteContent: NO,
  
  /** @private */
  canDeleteContentBindingDefault: SC.Binding.Bool,
  
  /**
    Accept drops for data other than reordering.
    
    Setting this property to return true when the view is instantiated will 
    cause it to be registered as a drop target, activating the other drop 
    machinery.
  */
  isDropTarget: NO,
  
  /**
    Use toggle selection instead of normal click behavior.
    
    If set to true, then selection will use a toggle instead of the normal
    click behavior.  Command modifiers will be ignored and instead clicking
    once will enable an item and clicking on it again will disable it.
    
    @type Boolean
  */
  useToggleSelection: NO,

  /**
    Trigger the action method on a single click.
  
    Normally, clicking on an item view in a collection will select the content 
    object and double clicking will trigger the action method on the 
    collection view.  
  
    If you set this property to true, then clicking on a view will both select 
    it (if isSelected is true) and trigger the action method.  
  
    Use this if you are using the collection view as a menu of items.
  
    @type {Boolean}
  */  
  actOnSelect: false,  
  
  
  /**
    Select an item immediately on mouse down
  
    Normally as soon as you begin a click the item will be selected.
    
    In some UI scenarios, you might want to prevent selection until
    the mouse is released, so you can perform, for instance, a drag operation
    without actually selecting the target item.  
    
    @type {Boolean}
  */  
  selectOnMouseDown: true,

  /**
    Property key to use to group objects.
  
    If groupBy is set to a non-null value, then the collection view will
    automatically display item views in groups based on the value of the 
    passed property key.  The exampleGroupView will be used to display the 
    items in groups.
  
    If this property is set, you MUST ensure the items in the content array 
    are already sorted by the group key.  Otherwise item view groups might 
    appear more than once.
  
    @type {String}
  */
  groupBy: null,
  
  /**
    The view class to use when creating new item views.
  
    The collection view will automatically create an instance of the view 
    class you set here for each item in its content array.  You should provide 
    your own subclass for this property to display the type of content you 
    want. 
  
    For best results, the view you set here should understand the following 
    properties:
  
    - *content* The content object from the content array your view should display
    - *isEnabled* True if the view should appear enabled
    - *isSelected* True if the view should appear selected
  
    In general you do not want your child views to actually respond to mouse 
    and keyboard events themselves.  It is better to let the collection view 
    do that.

    If you do implement your own event handlers such as mouseDown or mouseUp, 
    you should be sure to actually call the same method on the collection view 
    to give it the chance to perform its own selection housekeeping.
  
    @type {SC.View}
  */
  exampleView: SC.View,

  /**
    The view class to use when displaying item views in groups.
  
    If the groupBy property is not null, then the collection view will create
    an instance of this view class with the item views that belong to the 
    group as child nodes for each distinct group value it encounters.
  
    Your groupView should have two outlets:
  
    {{{
      labelView: The view to display the group label.  The group value will be 
      set as the content property of this view.
    
      itemView: This is the view the item views will be added to as children 
      to this view.
    }}}
  
    If groupBy is null, then this property will not be used.  The default 
    class provided here simply displays the group value in an H1 tag.
  
    @type {SC.View}
  */
  exampleGroupView: SC.View.extend({
    emptyElement: '<div><h1></h1><div class="well"></div></div>',
    outlets: ['labelView','itemView'],
    labelView: SC.LabelView.outletFor('h1?'),
    itemView: SC.View.outletFor('.well?')
  }),
  
  /**
    Invoked when the user double clicks on an item (or single clicks of 
    actOnSelect is true)

    Set this to the name of the action you want to send down the
    responder chain when the user double clicks on an item (or single clicks 
    if actOnSelect is true).  You can optionally specify a specific target as 
    well using the target property.

    If you do not specify an action, then the collection view will also try to 
    invoke the action named on the target item view.
    
    Older versions of SproutCore expected the action property to contain an 
    actual function that would be run.  This format is still supported but is 
    deprecated for future use.  You should generally use the responder chain 
    to handle your action for you.
    
    @type {String}
  */  
  action: null,

  /**
    Optional target to send the action to when the user double clicks.
    
    If you set the action property to the name of an action, you can 
    optionally specify the target object you want the action to be sent to.  
    This can be either an actual object or a property path that will resolve 
    to an object at the time that the action is invoked.  
    
    This property is ignored if you use the deprecated approach of making the
    action property a function.
    
    @type {String|Object}
  */
  target: null,
  
  /**
    Set to true whenever the content changes and remains true until
    the content has been rerendered.  
    
    You can also set this to true yourself to be notified when it is 
    completed.
  */
  isDirty: false,
  
  /**
    The maximum time the collection view will spend updating its
    views before it takes a break from the update.  
  
    This keeps your browser from freezing or displaying a slow script 
    warning while the render code works. Number is in msec.
  
    Future versions of CollectionView may ignore this property as newer
    rendering techniques make it no longer necessary.
  */
  maxRenderTime: 0,

  /** 
    Property to on content items to use for display.

    Built-in item views such as the LabelViews and ImageViews will use the
    value of this property as a key on the content object to determine the
    value they should display.
    
    For example, if you set contentValueKey to 'name' and set the 
    exampleView to an SC.LabelView, then the label views created by the 
    colleciton view will display the value of the content.name.
    
    If you are writing your own custom item view for a collection, you can
    get this behavior automatically by including the SC.Control mixin on your
    view.  You can also ignore this property if you like.  The collection view
    itself does not use this property to impact rendering.
  */
  contentValueKey: null,

  /**
    Enables keyboard-based navigate if set to true.
  */
  acceptsFirstResponder: false,

  /**
    If your layout uses a grid or horizontal-based layout, then make sure this 
    property is always up to date with the current number of items per row.  
    
    The CollectionView will use this property to support keyboard navigation 
    using the arrow keys.
    
    If your collection view is simply a vertical list of items then you do not 
    need to edit this property.
  */
  itemsPerRow: 1,

  /**  
    Property returns all of the item views, regardless of group view.

    @field
    @returns {Array} the item views.
  */
  itemViews: function() {
    if (!this._itemViews) {
      

      var range = this.get('nowShowingRange') ;
      var content = this.get('content') || [] ;
      this._itemViews = [] ;
      for(var idx=0;idx<range.length;idx++) {
        var cur = content.objectAt(idx) ;
        this._itemViews.push(this.itemViewForContent(cur)) ;
      }
    }
    return this._itemViews;
  }.property(),

  /**
    Property returns all of the rendered group views in order of their 
    appearance with the content.
  */
  groupViews: function() {
    if (!this._groupViews) {
      var groupBy = this.get('groupBy') ;
      if (groupBy) {
        var range = this.get('nowShowingRange') ;
        var content = this.get('content') || [] ;
        var groupValue = undefined ;
        this._groupViews = [] ;

        for(var idx=0;idx<range.length;idx++) {
          var cur = content.objectAt(idx) ;
          var curGroupValue = (cur) ? cur.get(groupBy) : null ;
          if (curGroupValue != groupValue) {
            groupValue = curGroupValue ;
            this._groupViews.push(this.groupViewForGroupValue(groupValue)) ;
          }
        }
        
      }
    }
    return this._groupViews; 
  }.property(),
  
  /**
    Returns true if the passed view belongs to the collection.
    
    This method uses the internal hash of item views and works even if 
    your items are stored in group views.  This is faster than searching
    the child view hierarchy yourself.
    
    @param {SC.View} view The view to search for.

    @returns {Boolean} True if the view is an item view in the receiver.
  */
  hasItemView: function(view) {
    if (!this._itemViewsByGuid) this._itemViewsByGuid = {} ;
    return !!this._itemViewsByGuid[SC.guidFor(view)] ;
  },

  /** 
    Find the item view underneath the passed mouse location.
    
    The default implementation of this method simply searches each item view's
    frame to find one that includes the location.  If you are doing your own
    layout, you may be able to perform this calculation more quickly.  If so,
    consider overriding this method for better performance during drag 
    operations.
    
    @param {Point} loc   The current mouse location in the coordinate of the 
      collection view
      
    @returns {SC.View} The item view under the collection
  */
  itemViewAtLocation: function(loc) {
    var itemView = this._itemViewRoot ;
    while(itemView) {
      var frame = itemView.get('frame');
      if (SC.pointInRect(loc, frame)) return itemView ;
    }
    return null; // not in an itemView right now.
  },
  

  
  /** 
    Find the first content item view for the passed event.
    
    This method will go up the view chain, starting with the view that was the 
    target of the passed event, looking for a child item.  This will become 
    the view that is selected by the mouse event.
    
    This method only works for mouseDown & mouseUp events.  mouseMoved events 
    do not have a target.
    
    @param {Event} evt An event
    
  */
  itemViewForEvent: function(evt)
  {
    var view = SC.window.firstViewForEvent( evt );
    
    if (!view) return null; // workaround for error on IE8, see Ticket #169
    
    // work up the view hierarchy to find a match...
    do {
      // item clicked was the ContainerView itself... i.e. the user clicked outside the child items
      // nothing to return...
      if ( view == this ) return null;
      
      // sweet!... the view is not only in the collection, but it says we can hit it.
      // hit it and quit it... 
      if ( this.hasItemView(view) && (!view.hitTest || view.hitTest(evt)) ) return view;
    } while ( view = view.get('parentNode') );
    
    // nothing was found... 
    return null;
  },


  /**
    Returns the itemView that represents the passed content object.  
    
    If no item view is currently rendered for the object, this method will
    return null.
    
    @param {Object} obj The content object. 
    @returns {SC.View} The item view or null
  */
  itemViewForContent: function(obj) {
    var key = (obj) ? SC.guidFor(obj) : '0';
    return this._itemViewsByContent[key];
  },

  /**
    Returns the groupView that represents the passed group value.
    
    If no group view is currently rendered for the gorup value, this method
    will return null.  If grouping is disabled, this method will also return
    null.
    
    @param {Object} value The group value.
    @param {SC.View} The group view or null
  */
  groupViewForGroupValue: function(groupValue) {
    return this._groupViewsByValue[groupValue] ;
  },

  /**
    Returns the groupValue for the passed group view.
    
    Older-style groupViews expect the group value to be set directly on 
    their labelView while newer groupViews expect their groupValue to be set.
    This method takes into account both approaches.
    
    @param {SC.View} groupView the group view.
    @returns {Object} the value of the group view or null.
  */
  groupValueForGroupView: function(groupView) {
    if (!groupView) return null ;
    var ret ;
    if (groupView.groupValue === undefined) {
      ret = groupView.get('content') ;
    } else ret = groupView.get('groupValue') ;
    return ret ;
  },
  
  /**
    Expands the index into a range of content objects that have the same
    group value.
    
    This method searches backward and forward through your content array for  
    objects that have the same group value as the object at the index you 
    pass in.  You can use this method when implementing layoutGroupView to 
    determine the range of the content that belongs to the group.  
    
    Since this method simply searches through the content array, it is really
    only suitable for content arrays of a few hundred items or less.  If you
    expect to have a larger size of content array, then you may need to do
    something custom in your data model to calculate this range in less time.
    
    @param {Number} contentIndex index of a content object
    @returns {Range} a range of objects
  */
  groupRangeForContentIndex: function(contentIndex) {
    var content = Array.from(this.get('content')) ;
    var len = content.get('length') ;
    var groupBy = this.get('groupBy') ;
    if (!groupBy) return { start: 0, length: len } ;

    var min = contentIndex, max = contentIndex ;
    var cur = content.objectAt(contentIndex) ;
    var groupValue = (cur) ? cur.get(groupBy) : null ;
    
    // find first item at bottom that does not match.  add one to get start
    while(--min >= 0) {
      var cur = content.objectAt(min) ;
      var curGroupValue = (cur) ? cur.get(groupBy) : null ;
      if (curGroupValue !== groupValue) break ;
    }
    min++ ;
    
    // find first item at top that does not match.  keep value to calc range
    while(++max < len) {
      var cur = content.objectAt(max) ;
      var curGroupValue = (cur) ? cur.get(groupBy) : null ;
      if (curGroupValue !== groupValue) break ;
    }
    
    return { start: min, length: max-min } ;
  },

  // Determines the group value at a specified index.
  groupValueAtContentIndex: function(contentIndex) {
    var groupBy = this.get('groupBy') ;
    var content = Array.from(this.get('content')).objectAt(contentIndex) ;
    return (groupBy && content && content.get) ? content.get(groupBy) : null;
  },
    
  // ......................................
  // GENERATING CHILDREN
  //
  
  /**
    Update the itemViews in the receiver to match the currently visible 
    content objects.  Normally this method assumes the content objects 
    themselves have not changed and only updates the views if the range of 
    visible content has changed.  If you pass true to the fullUpdate property, 
    then the entire set of itemViews will be revalidated in case any content 
    objects have changed.
    
    @param {Bool} fullUpdate (Optional) if set to true, assumes content has
      changed and will perform a full update.
    
  */
  updateChildren: function(fullUpdate) {
    var f ;

    // if the collection is not presently visible in the window, then there is 
    // really nothing to do here.  Just mark the view as dirty and return.
    if (!this.get('isVisibleInWindow')) {
      this.set('isDirty', true) ;
      this._needsFullUpdate = this._needsFullUpdate || fullUpdate ;
      return; 
    }

    if (SC.BENCHMARK_UPDATE_CHILDREN) {
      var bkey = '%@.updateChildren(%@)'.fmt(this, (fullUpdate) ? 'FULL' : 'FAST') ;
      SC.Benchmark.start(bkey);
    }

    this.beginPropertyChanges() ; // avoid sending notifications
    
    // STEP 1: Update frame size if needed.  Required to compute the 
    // clippingFrame.
    var f ;
    if ((f = this.computeFrame()) && !SC.rectsEqual(f, this.get('frame'))) {
      var parent = this.get('parentNode') ;
      if (parent) parent.viewFrameWillChange() ;
      this.set('frame', f) ;
      if (parent) parent.viewFrameDidChange() ;
      
      if ((f = this.computeFrame()) && !SC.rectsEqual(f, this.get('frame'))) {
        this.set('frame', f) ;
      } 
    } 

    // Save the current clipping frame.  If the frame methods are called again
    // later but the frame has not actually changed, we don't want to run
    // updateChildren again.
    var clippingFrame = this._lastClippingFrame = this.get('clippingFrame') ;
	
    // STEP 2: Calculate the new range of content to display in 
    // the clipping frame.  Determine if we need to do a full update or
    // not.
   
    var range = this.contentRangeInFrame(clippingFrame) ;
    var content = Array.from(this.get('content'));
     
    //make sure the range isn't greater than the content length 
    //this will prevent trying to render items that aren't really there.
    range.length = Math.min(SC.maxRange(range), content.get('length')) - range.start ;

    var nowShowingRange = this.get('nowShowingRange') ;
    fullUpdate = fullUpdate || (this.get('isDirty') && this._needsFullUpdate) || (SC.intersectRanges(range, nowShowingRange).length <= 0) ;
    this.set('nowShowingRange', range) ;

    // STEP 3: Update item views.
    var groupBy = this.get('groupBy') ;
    var didChange = false ;
    
    // If this is a fullUpdate, then rebuild the itemViewsByContent hash
    // from scratch.  This is necessary if the content or the visible range
    // might have changed.
    if (fullUpdate) {
     
      var itemViewsByContent = {} ; // this will replace the current hash.
      
      // iterate through all of the views and insert them.  If the view 
      // already exists, it will simply be reused.
      var idx = SC.maxRange(range) ;
      while(--idx >= range.start) {
        var c = content.objectAt(idx) ;
        var key = SC.guidFor(c) ;
        var itemView = this._insertItemViewFor(c, groupBy, idx) ;

        if(itemView)
        {
          // add item view to new hash and remove from old hash.
          itemViewsByContent[key] = itemView;

          delete this._itemViewsByContent[key];
        }
      }
      
      // Now iterate through the old hash.  Any left over item views should
      // be removed.
      for(var key in this._itemViewsByContent) {
        if (!this._itemViewsByContent.hasOwnProperty(key)) continue ;
        var itemView = this._itemViewsByContent[key] ;
        this._removeItemView(itemView, groupBy) ;
      } ;
      
      // Swap out remaining content items.
      this._itemViewsByContent = itemViewsByContent ;
      didChange = true;
      
    // If a fullUpdate is not required, then we assume no content has changed
    // and we just need to add or remove some views to bring the ranges up
    // to date.
    } else {
      // Find changed range at the top.  Note that the length here may be 
      // negative.  Negative means views should be removed.
      var start = range.start ;
      var length = (nowShowingRange.start - start) ;
      if (length != 0) {
        this._insertOrRemoveItemViewsInRange(start, length, groupBy) ;
        didChange = true ;
      }
      
      // Find the changed range at the bottom.  Note that the length here may
      // also be negative. Negative means views should be removed.
      var start = SC.maxRange(nowShowingRange) ;
      var length = SC.maxRange(range) - start ;
      if (length != 0) {
        this._insertOrRemoveItemViewsInRange(start, length, groupBy) ;
        didChange = true ;
      }
    }

    // Recache frames just in case this changed the scroll height.
    this.recacheFrames() ;

    // Set this to true once children have been rendered.  Whenever the 
    // content changes, we don't want resize or clipping frame changes to 
    // cause a refresh until the content has been rendered for the first time.
    this._hasChildren = range.length>0 ;
    this.set('isDirty',false); 

    // Clean out some cached items and notify their changes.
    // NOTE: This must be called after _hasChildren has been set or 
    // updateSelectionStates() may not run.
    if (didChange) {
      this._flushZombieGroupViews() ;
      this.updateSelectionStates() ;
      
      this._itemViews = null ;
      this.notifyPropertyChange('itemViews') ;
      
      this._groupViews = null ;
      this.notifyPropertyChange('groupViews') ;
    }

    this.endPropertyChanges() ;
    if (SC.BENCHMARK_UPDATE_CHILDREN) SC.Benchmark.end(bkey);    
  },

  /**
    Rebuild all the child item views in the collection view.
    
    This will remove all the child views from the collection view and rebuild 
    them from scratch.  This method is generally expensive, but if you have 
    made a substantial number of changes to the content array, this may be the 
    most efficient way to perform the update.
    
    In general the collection view will automatically keep the item views in 
    sync with the content objects for you.  You should not need to call this 
    method very often.
    
    @returns {void}
  */
  rebuildChildren: function() {
    
    this.beginPropertyChanges() ;
    
    // iterate through itemViews and remove them
    while(this._itemViewRoot) this._removeItemViewFromChain(this._itemViewRoot) ;
    
    // iterate through groupViews and remove them .. if grouping is disabled,
    // _groupViewRoot will be null anyway.
    while(this._groupViewRoot) this._removeGroupView(this._groupViewRoot) ;
    
    // now updateChildren.
    this._hasChildren = false ;
    this.updateChildren() ;
    
    this.endPropertyChanges() ;
  },
  
  /**
    Update the selection state for the item views to reflect the selection 
    array.
    
    This will update the isSelected property of all item views so that only 
    those representing content objects found in the selection array are 
    selected.
    
    This method is called automatically whenever your content or selection 
    properties changed.  You should not need to call or override it often.
  */
  updateSelectionStates: function() {
    if (!this._hasChildren) return ;
    var selection = this.get('selection') || [];

    // First, for efficiency, turn the selection into a hash by GUID.  This 
    // way, we'll only have to perform a linear search over the children.
    // This hash is cached and flushed each time the selection changes.
    var selectionHash = this._selectionHash ;
    if (!selectionHash) {
      selectionHash = {} ;
      var idx = selection.get('length') ;
      while(--idx >= 0) {
        var cur = selection.objectAt(idx) ;
        var key = SC.guidFor(cur) ;
        selectionHash[key] = true ;
      }
      this._selectionHash = selectionHash ;
    }

    // Iterate over the item views and set their selection property.
    for(var key in this._itemViewsByContent) {
      if (!this._itemViewsByContent.hasOwnProperty(key)) continue ;
      var itemView = this._itemViewsByContent[key] ;
      var isSelected = (key) ? selectionHash[key] : false ;
      if (itemView.get('isSelected') != isSelected) {
        itemView.set('isSelected', isSelected) ;
      }
    }
  },
    
  
  /**
    Calls updateChildren whenever the view is resized, unless you have not 
    implemented custom layout or incremental rendering.
    
    UPDATE:
    -- add/remove any children as needed
    -- update layout on all itemViews unless you have a more efficient
  */
  resizeChildrenWithOldSize: function(oldSize) {
    if (!this._hasChildren) return ;
    this.updateChildren() ; // add/remove any new views.
    this.layoutResize() ; // perform layout on all of the views if needed.
  },

  /**
    Whenever your clipping frame changes, determine new range to display.  If 
    new range is a change, then it will update the children and relayout.
    
    UPDATE:
    -- add/remove any children as needed
    -- update layout on added children only
  */
  clippingFrameDidChange: function() {
    if (!this._hasChildren) return ;
    SC.Benchmark.start('%@.clippingFrameDidChange'.fmt(this.toString())) ;
    if (!SC.rectsEqual(this._lastClippingFrame, this.get('clippingFrame'))) {
          if (this._hasChildren) this.updateChildren() ;
        }
    SC.Benchmark.end('%@.clippingFrameDidChange'.fmt(this.toString())) ;
  },

  /**
    Override to return the computed frame dimensions of the collection view.
    
    These dimensions are automatically applied at the end of a call to  
    updateChildren() if they change at all.  This method is critical for 
    support of incremental rendering.
  
    @returns {Rect} width and/or height you want this collection view to have.
  */
  computeFrame: function() { return null; },
  
  /**
    Override to return the range of items to render for a given frame.

    You can override this method to implement support for incremenetal 
    rendering.  The range you return here will be used to limit the number of 
    actual item views that are created by the collection view.
    
    @param {Rect} frame The frame you should use to determine the range.
    
    @returns {Range} A hash that indicates the range of content objects to 
      render.  ({ start: X, length: Y }) 
  */  
  contentRangeInFrame: function(frame) {
    var content = this.get('content') ;
    var len = ((content && content.get) ? content.get('length') : 0) || 0 ;
    return { start: 0, length: len };
  },


  /**
    This method is called whenever a group view is added or during the 
    layoutResize() method.  You should use this method to size and position 
    the group view.
    
    The included contentIndexHint can be used to help you determine the range
    of content that should be included in the group.  If you are renderings a
    list of items 100 or less, you can get the range of content belonging to
    the group using the contentRangeForGroup() method.  If you are managing
    a much larger set of content, you should probably implement your own 
    data model.
    
    Your layout method should can optionally also use the firstLayout to 
    further optimize itself.  Normally, you will want to only change a view's
    actual frame if it does not match your calculated size.  However, if 
    firstLayout is true, you can simply set the new layout without checking
    first.
    
    @param {SC.View} groupView the view to size and position.
    @param {Object} groupValue the value the groupView represents.
    @param {Number} contentIndexHint the index of a content object.
    @param {Bool} firstLayout True if this is the first the view has been laid out. 
    
  */
  layoutGroupView: function(groupView, groupValue, contentIndexHint, firstLayout) {
    
  },
  
  /**
    This method is called whenever an itemView is added or during the 
    layoutResize() method.  You should use this method to size and position
    the itemView.
    
    @param {SC.View} itemViewthe item view to layout
    @param {Number} contentIndex the index of the content this layout represents.
    @param {Bool} firstLayout true if this is the first time it has been laid out.
  */
  layoutItemView: function(itemView, contentIndex, firstLayout) {
    
  },
  
  /**
    This method is called whenever the view is resized.  The default
    implementation will simply iterate through the visible content range and
    call layoutItemView() and layoutGroupView() on all the views.
    
    If you would like to provide a more efficient method for updating the
    layout on a resize, you could override this method and do the iterating 
    yourself.
  */
  layoutResize: function() {
    if (!this._hasChildren) return ; // ignore calls before first render
    var nowShowingRange = this.get('nowShowingRange') ;
    var groupBy = this.get('groupBy') ;
    var groupValue = undefined ;
    var content = this.get('content') || [] ;
    
    var idx = SC.maxRange(nowShowingRange) ;
    while(--idx >= nowShowingRange.start) {
      var cur = content.objectAt(idx) ;
      var itemView = this.itemViewForContent(cur) ;

      // should never happen, but recover just in case.
      if (!itemView) continue ; 
      
      // if grouping is enabled, get the group value and layout based on that.
      if (groupBy && ((curGroupValue = (cur) ? cur.get(groupBy) : null) !== groupValue)) {
        groupValue = curGroupValue ;
        var groupView = this.groupViewForGroupValue(groupValue) ;
        if (groupView) {
          this.layoutGroupView(groupView, groupValue, idx, false) ;
        }
      }
      
      // now layout the itemView itself.
      this.layoutItemView(itemView, idx, false) ;
    }
  },
    
  
  // Ordered array of item views currently on display.  This array 
  // is reset whenever the item views are regenerated.
  _itemViews: null,

  // Ordered array of group views currently in the display.  This array is
  // reset whenever the group views are regenerated.
  _groupViews: null,
  
  // Most recent content range on display.
  _visibleContentRange: null,
  
  // Hash of itemViews to the content guids they current represent.  This
  // only matches views in currently in the _visibleContentRange.
  _itemViewsByContent: null,

  // Hash of groupViews to the group key they currently represent.
  _groupViewsByValue: null,
  
  // Hash of counts of item views contained in a group view.  When the count
  // of a group reaches zero, it will be removed.
  _groupViewCounts: null,

  // Array of unused itemViews.  Push/pop only.
  _itemViewPool: null,
  
  // Array of unused groupViews.  Push/pop only.
  _groupViewPool: null,
  
  // When a group view's item view count reaches zero, it is moved to this
  // hash until updateChildren() completes.  During that time, if the group 
  // is needed again, it can be reused.  At the end of updateChildren() this
  // hash will be flushed and its members returned to the groupView pool.
  //
  _zombieGroupViews: null,
  
  /** @private
    Finds or creates the itemView for the named content and inserts it into 
    view under the correct group if needed.  Note that this method does not 
    take into account the actual ORDER of item views in the hierarchy.  It 
    assumes that manual layout will ensure the items appear visually in the 
    proper order anyway.

    @param {SC.View} itemView The item view to remove
    @param {String} groupBy the value used for grouping or null if grouping is 
      disabled.
    
    @returns {SC.View} the new itemView.
  */
  _insertItemViewFor: function(content, groupBy, contentIndex) {

    // first look for a matching record.
    var key = SC.guidFor(content) ;
    var ret = this._itemViewsByContent[key];
    var firstLayout = false ;

    // if no record was found, pull an item view from the pool or create one.
    // set the content.
    if (!ret) {
      ret = this._itemViewPool.pop() || this.get('exampleView').create({ 
        owner: this, displayDelegate: this 
      }) ;
      ret.addClassName('sc-collection-item') ; // add class name for display
      
      // set content and add to content hash
      ret.set('content', content) ;
      this._itemViewsByContent[key] = ret ;
      this._itemViewsByGuid[SC.guidFor(ret)] = ret ;
      firstLayout = true ;
    }
    if (!ret) throw "Could not create itemView for content: %@".fmt(content);

    // Determine proper parent view and insert itemView if needed.
    // Also update count of itemViews.
    var canGroup = !!(groupBy && content) ;
    var groupValue = (canGroup) ? content.get(groupBy) : null;  
    var parentView = (canGroup) ? this._insertGroupViewFor(groupValue, contentIndex) : this ;
    var curParentView = ret.get('parentNode') ;
    
    if (curParentView != parentView) {
      
      // if the item is already inside of another group, then it is probably
      // just being moved, so remove it from its parent group first...
      if (groupBy && curParentView) {
        
        // reduce the group view count.  If this it the last item in the 
        // group view, the count will be <= 0 and we will need to remove t
        // the group view itself.
        if (--this._groupViewCounts[SC.guidFor(curParentView)] <= 0) {
          this._removeGroupView(curParentView, groupValue) ;
        }
        
      }
      
      parentView.appendChild(ret) ;
      if (groupBy) this._groupViewCounts[SC.guidFor(parentView)]++ ;
    }

    // Layout itemView.
    this.layoutItemView(ret, contentIndex, firstLayout) ;
    return ret ;
  },

  /** @private
    Removes the itemView from the receiver and returns it to the itemView pool 
    for later reuse.  
    
    If the itemView belongs to a groupView and this leaves the groupView empty 
    as well, then the groupView will be moved to the zombieGroupViews hash.
    
    @param {SC.View} itemView The item view to remove
    @param {String} groupBy the value used for grouping or null if grouping is 
      disabled.
    
    @returns {SC.View} The itemView that was removed.
  */
  _removeItemView: function(itemView, groupBy) {
    
    // If we are grouping, then decrement the groupViewCount.  If the new 
    // count is zero, save groupView for later removal.
    var groupView = null ; var groupValue ;
    if (groupBy && (groupView = itemView.get('parentNode'))) {
      if (--this._groupViewCounts[SC.guidFor(groupView)] > 0) groupView = null ; 
      if (groupView) {
        var content = itemView.get('content') ;
        groupValue = (content) ? content.get(groupBy) : null ;
      }
    }
    
    // Remove itemView from parent and remove from content hash.
    var content = itemView.get('content') ;
    var key = SC.guidFor(content) ;
    delete this._itemViewsByContent[key] ;
    delete this._itemViewsByGuid[SC.guidFor(itemView)] ;
    itemView.removeFromParent() ;
    
    // Clear content and return itemView to pool
    itemView.set('content', null) ;
    this._itemViewPool.push(itemView) ;
    
    // if a groupView is set, then it also needs to be returned to the pool
    if (groupView) this._removeGroupView(groupView, groupValue) ;
    
    return itemView;
  },
  
  /** @private
    Adds or removes itemViews for the content in the specified range.
    Note that this is not passed as a formal range because the length 
    could be negative.  
    
    A negative length means views should be removed.
  */
  _insertOrRemoveItemViewsInRange: function(start, length, groupBy) {
    // zero length means do nothing.
    if (length == 0) return ;

    var content = this.get('content') || [] ;
    
    // negative length == remove item views
    if (length < 0) {
      // TEMPORARY OPTIMIZATION:  Do not remove views when they go out of
      // range.  This way they don't need to be created/addred later on.
      //
      // while(++length < 0) {
      //   var c = content.objectAt(start + length) ;
      //   var itemView = this.itemViewForContent(c) ;
      //   if (itemView) this._removeItemView(itemView, groupBy) ;
      // }
      
    // positive length == add item views.
    } else if (length > 0) {
      while(--length >= 0) {
        var idx = start + length ;
        var c = content.objectAt(idx) ;
        this._insertItemViewFor(c, groupBy, idx) ;
      }  
    }
  },

  /** @private
    Finds or creates a groupView for the named group value and inserts it into
    the receiver.  This method does not take into account the actual ORDER of
    the groupViews in the hierarchy.  It assumes that manual layout will 
    ensure the items appear visually in the proper order anyway.
    
    @returns {SC.View} the new groupView.
  */
  _insertGroupViewFor: function(groupValue, contentIndex) {
    var ret =  this._groupViewsByValue[groupValue] ; 
    // if (ret) return ret ; // nothing to do
    
    var firstLayout = false ;
    
    // if the group was not found, check the zombie pool.  If found in zombie
    // pool, restore it to the regular group view hash.
    if (!ret && this._zombieGroupViews) {
      ret = this._zombieGroupViews[groupValue] ;
      if (ret) {
        delete this._zombieGroupViews[groupValue] ;
        this._groupViewsByValue[groupValue] = ret ;
        this._groupViewCounts[SC.guidFor(ret)] = 0 ;
      }
    }

    // If groupValue still not found, create one.
    if (!ret) {
      ret = this._groupViewPool.pop() || this.get('exampleGroupView').create({
         owner: this, displayDelegate: this 
      });
      ret.addClassName('sc-collection-group') ;

      // set the groupValue on the groupView.  Older groupViews expect us to 
      // set this directly on the labelView.  Newer groupViews should have a 
      // groupValue property.
      if (ret.groupValue !== undefined) {
        ret.set('groupValue', groupValue) ;
      } else ret.set('content', groupValue) ;
      
      // save in cache
      this._groupViewsByValue[groupValue] = ret ;
      this._groupViewCounts[SC.guidFor(ret)] = 0 ;
      firstLayout = true; 
    }
    
    // If the group view does not already belong to the receiver, add it.
    if (!ret) throw "Could not create a groupView for value: %@".fmt(groupValue) ;
    if (ret.get('parentNode') != this) this.appendChild(ret) ;
    
    // Layout the group View
    this.layoutGroupView(ret, groupValue, contentIndex, firstLayout) ;
    
    return ret ;
  },

  /** @private
    Called whenever a groupView is no longer being used.
    
    Theoretically, this method removes a group view from the receiver and 
    stores it in the pool for later use.  In actuality, this will just moved 
    the view to the zombieGroupView pool.  You must call 
    _flushZombieGroupViews() to actually remove them from the receiver.
  */
  _removeGroupView: function(groupView, groupValue) {
    if (SC.ZOMBIE_GROUPS_ENABLED) {
      this._zombieGroupViews[groupValue] = groupView ;
    } else {
      this._finalRemoveGroupView(groupView) ;
    }
    
    delete this._groupViewsByValue[groupValue] ;
    delete this._groupViewCounts[SC.guidFor(groupView)] ;
    return groupView ;
  },
  
  /** @private
    Flushes any zombie group views, removing them from their parent view and 
    returning them to the groupView pool for later consumption.
  */
  _flushZombieGroupViews: function() {
    if (!SC.ZOMBIE_GROUPS_ENABLED) return ; // nothing to do
    
    for(var key in this._zombieGroupViews) {
      if (!this._zombieGroupViews.hasOwnProperty(key)) continue ;
      var groupView = this._zombieGroupViews[key] ;
      this._finalRemoveGroupView(groupView) ;
    } 
    this._zombieGroupViews = {} ; // reset
  },
  
  /** @private
    Final method to actually remove a groupView from its parent view and
    return it to the groupView pool.
  */
  _finalRemoveGroupView: function(groupView) {
    groupView.removeFromParent() ;

    // set the groupValue on the groupView.  Older groupViews expect us to set 
    // this directly on the labelView.  Newer groupViews should have a 
    // groupValue property.
    if (groupView.groupValue !== undefined) {
      groupView.set('groupValue', null) ;
    } else groupView.set('content', null) ;
    
    this._groupViewPool.push(groupView) ;
    return groupView ;
  },
  
  /** @private
    Removes the rootElement from the DOM temporarily if needed to optimize performance.
  */
  _removeRootElementFromDom: function() {
    if (!SC.REMOVE_COLLECTION_ROOT_ELEMENT_DURING_RENDER) return ;
    if (this._cachedRootElementParent === undefined) {
      var parent = this._cachedRootElementParent = this.rootElement.parentNode ;
      this._cachedRootElementNextSibling = this.rootElement.nextSibling ;
      if (parent) parent.removeChild(this.rootElement) ;
    }
  },
  
  /** @private
    Re-adds root element into DOM if necessary.  Inverts _removeRootElementFromDom().
  */
  _restoreRootElementInDom: function() {
    if (!SC.REMOVE_COLLECTION_ROOT_ELEMENT_DURING_RENDER) return ;
    if (this._cachedRootElementParent) {
      this._cachedRootElementParent.insertBefore(this.rootElement, this._cachedRootElementNextSibling);
    }
    this._cachedRootElementParent = this._cachedRootElementNextSibling = null ;
  },
  
    
  // ......................................
  // SELECTION
  //

  /** @private
    Finds the smallest index of a content object in the selected array.
  */
  _indexOfSelectionTop: function() {
    var content = this.get('content');
    var sel = this.get('selection');
    if (!content || !sel) return - 1;

    // find the first item in the selection
    var contentLength = content.get('length') ;
    var indexOfSelected = contentLength ; var idx = sel.length ;
    while(--idx >= 0) {
      var curIndex = content.indexOf(sel[idx]) ;
      if ((curIndex >= 0) && (curIndex < indexOfSelected)) indexOfSelected = curIndex ;
    }
    
    return (indexOfSelected >= contentLength) ? -1 : indexOfSelected ;
  },

  /**
    Finds the largest index of a content object in the selection array.
  */
  _indexOfSelectionBottom: function() {
    var content = this.get('content');
    var sel = this.get('selection');
    if (!content || !sel) return - 1;

    var indexOfSelected = -1 ; var idx = sel.length ;
    while(--idx >= 0) {
      var curIndex = content.indexOf(sel[idx]) ;
      if (curIndex > indexOfSelected) indexOfSelected = curIndex ;
    }
    
    return (indexOfSelected < 0) ? -1 : indexOfSelected ;
  },
  
  /**
    Select one or more items before the current selection, optionally
    extending the current selection.  Also scrolls the selected item into 
    view.
    
    Selection does not wrap around.
    
    @param extend {Boolean} (Optional) If true, the selection will be extended 
      instead of replaced.  Defaults to false.
    @param numberOfItems {Integer} (Optional) The number of previous to be 
      selected.  Defaults to 1
    @returns {void}
  */
  selectPreviousItem: function(extend, numberOfItems)
  {
    if (numberOfItems == null) numberOfItems = 1 ;
    if (extend == null) extend = false ;

    var content  = this.get('content');
    var contentLength = content.get('length') ;

    // if extending, then we need to do some fun stuff to build the array
    var selTop, selBottom, anchor ;
    if (extend) {
      selTop = this._indexOfSelectionTop() ;
      selBottom = this._indexOfSelectionBottom() ;
      anchor = (this._selectionAnchor == null) ? selTop : this._selectionAnchor ;
      this._selectionAnchor = anchor ;

      // If the selBottom is after the anchor, then reduce the selection
      if (selBottom > anchor) {
        selBottom = selBottom - numberOfItems ;
        
      // otherwise, select the previous item from the top 
      } else {
        selTop = this._findPreviousSelectableItemFromIndex(selTop - numberOfItems);
      }
      
      // Ensure we are not out of bounds
      if (selTop < 0) selTop = 0 ;
      if (selBottom < selTop) selBottom = selTop ;
      
    // if not extending, just select the item previous to the selTop
    } else {
      selTop = this._findPreviousSelectableItemFromIndex(this._indexOfSelectionTop() - numberOfItems);
      if (selTop < 0) selTop = 0 ;
      selBottom = selTop ;
      anchor = null ;
    }
    
    // now build array of new items to select
    var items = [] ;
    while(selTop <= selBottom) {
      items[items.length] = content.objectAt(selTop++) ;
    }

    // ensure that the item is visible and set the selection
    if (items.length > 0) {
      this.scrollToContent(items.first());
      this.selectItems(items);
    }
    
    this._selectionAnchor = anchor ;
  },
  
  /**
    Select one or more items folling the current selection, optionally
    extending the current selection.  Also scrolls to selected item.

    Selection does not wrap around.
    
    @param extend {Boolean} (Optional) If true, the selection will be extended 
      instead of replaced.  Defaults to false.
    @param numberOfItems {Integer} (Optional) The number of items to be 
      selected.  Defaults to 1.
    @returns {void}
  */
  selectNextItem: function(extend, numberOfItems)
  {
    if (numberOfItems == null) numberOfItems = 1 ;
    if (extend == null) extend = false ;

    var content  = this.get('content');
    var contentLength = content.get('length') ;

    // if extending, then we need to do some fun stuff to build the array
    var selTop, selBottom, anchor ;
    if (extend) {
      selTop = this._indexOfSelectionTop() ;
      selBottom = this._indexOfSelectionBottom() ;
      anchor = (this._selectionAnchor == null) ? selTop : this._selectionAnchor ;
      this._selectionAnchor = anchor ;

      // If the selTop is before the anchor, then reduce the selection
      if (selTop < anchor) {
        selTop = selTop + numberOfItems ;
        
      // otherwise, select the next item after the top 
      } else {
        selBottom = this._findNextSelectableItemFromIndex(selBottom + numberOfItems);
      }
      
      // Ensure we are not out of bounds
      if (selBottom >= contentLength) selBottom = contentLength-1;
      if (selTop > selBottom) selTop = selBottom ;
      
    // if not extending, just select the item next to the selBottom
    } else {
      selBottom = this._findNextSelectableItemFromIndex(this._indexOfSelectionBottom() + numberOfItems);

      if (selBottom >= contentLength) selBottom = contentLength-1;
      selTop = selBottom ;
      anchor = null ;
    }
    
    // now build array of new items to select
    var items = [] ;
    while(selTop <= selBottom) {
      items[items.length] = content.objectAt(selTop++) ;
    }

    // ensure that the item is visible and set the selection
    if (items.length > 0) {
      this.scrollToContent(items.first());
      this.selectItems(items);
    }
    
    this._selectionAnchor = anchor ;
  },
  
  /**
    Scroll the rootElement (if needed) to ensure that the item is visible.
    @param {SC.Record} record The record to scroll to
    @returns {void}
  */
  scrollToContent: function(record) {
    // find the itemView.  if not present, add one.
    var content = Array.from(this.get('content'));
    if (content.indexOf(record) < 0) return ; // do nothing if not in content.
    
    var itemView = this.itemViewForContent(record) ;
    if (!itemView) {
      var content = Array.from(this.get('content')) ;
      var contentIndex = content.indexOf(record) ;
      var groupBy = this.get('groupBy');
      itemView = this._insertItemViewFor(record, groupBy, contentIndex); 
    }
    if (itemView) this.scrollToItemView(itemView);
  },
  
  /**
    Scroll the rootElement (if needed) to ensure that the item is visible.
    @param {SC.View} view The item view to scroll to
    @returns {void}
  */
  scrollToItemView: function( view )
  {
    // find first scrollable view.
    var scrollable = this ;
    while(scrollable && (scrollable != SC.window) && (!scrollable.get('isScrollable'))) {
      scrollable = scrollable.get('parentNode') ;
    }
    if (!scrollable || (scrollable == SC.window)) return ; // no scrollable!
    scrollable.scrollToVisible(view) ;
  },

  /** 
    Selects the passed array of items, optionally extending the
    current selection.
    
    @param items {Array} The item or items to select.
    @param extendSelection {Boolean} If true, extends the selection instead of 
      replacing it.
  */
  selectItems: function(items, extendSelection) {
    var base = (extendSelection) ? this.get('selection') : [] ;
    var sel = [];

    items = [items].flatten();
    for (var i = 0, len = items.length; i < len; i++) {
      if (this.invokeDelegateMethod(this.delegate, 'collectionViewShouldSelectItem', this, items[i])) {
        sel.push(items[i]);
      }
    }
    sel = sel.concat(base).uniq() ;

    // if you are not extending the selection, then clear the selection 
    // anchor.
    this._selectionAnchor = null ;
    this.set('selection',sel) ;  
  },

  /** 
    Removes the items from the selection.
  */
  deselectItems: function(items) {
    items = [items].flatten() ;
    var base = this.get('selection') || [] ; 
    var sel = base.map(function(i) { return (items.include(i)) ? null : i; });
    sel = sel.compact() ;
    this.set('selection',sel) ;
  },
  
  /**
    Deletes the selected content if canDeleteContent is YES.  
    
    This will invoke delegate methods to provide fine-grained control.
    
    @returns {Boolean} YES if deletion is possible, even if none actually occurred.
  */
  deleteSelection: function() {
    
    // perform some basic checks...
    if (!this.get('canDeleteContent')) return NO;  
    var sel = Array.from(this.get('selection'));
    if (!sel || sel.get('length') === 0) return NO ;

    // let the delegate decide what to actually delete.  If this returns an
    // empty array or null, just do nothing.
    sel = this.invokeDelegateMethod(this.delegate, 'collectionViewShouldDeleteContent', this, sel) ;
    sel = Array.from(sel) ; // ensure this is an array
    if (!sel || sel.get('length') === 0) return YES ;

    // now have the delegate (or us) perform the deletion.  The collection
    // view implements a default version of this method.
    this.invokeDelegateMethod(this.delegate, 'collectionViewDeleteContent', this, sel) ;
    return YES ;
  },

  /**
    Default implementation of the delegate method.
    
    This method will delete the passed items from the content array using 
    standard array methods.  This is often suitable if you are using an
    array controller or a real array for your content.
    
    @param view {SC.CollectionView} this
    @param sel {Array} the items to delete
    @returns {Boolean} YES if the deletion was a success.
  */
  collectionViewDeleteContent: function(view, sel) {
    
    // get the content.  Bail if this cannot be used as an array.
    var content = this.get('content') ; 
    if (!content) return NO;  // nothing to do
    
    // determine the method to use
    var hasDestroyObject = $type(content.destroyObject) === T_FUNCTION ;
    var hasRemoveObject = $type(content.removeObject) === T_FUNCTION ;
    if (!hasDestroyObject && !hasRemoveObject) return NO; // nothing to do
    
    // suspend property notifications and remove the objects...
    if (content.beginPropertyChanges) content.beginPropertyChanges();
    var idx = sel.get('length') ;
    while(--idx >= 0) {
      var item = sel.objectAt(idx) ;
      (hasDestroyObject) ? content.destroyObject(item) : content.removeObject(item);
    }
    // begin notifying again...
    if (content.endPropertyChanges) content.endPropertyChanges() ;
    
    return YES ; // done!
  },
  
  // ......................................
  // EVENT HANDLING
  //

  keyDown: function(evt) {
    return this.interpretKeyEvents(evt) ;
  },
  
  keyUp: function() { return true; },

  /** @private
    Handle select all keyboard event.
  */
  selectAll: function(evt) {
    var content = (this.get('content') || []).slice() ;
    this.selectItems(content, NO) ;
    return YES ;
  },
  
  /** @private
    Handle delete keyboard event.
  */
  deleteBackward: function(evt) {
    return this.deleteSelection() ;
  },
  
  /** @private
    Handle delete keyboard event.
  */
  deleteForward: function(evt) {
    return this.deleteSelection() ;
  },
  
  /** @private
    Selects the same item on the next row or moves down one if 
    itemsPerRow = 1
  */
  moveDown: function(sender, evt) {
    this.selectNextItem(false, this.get('itemsPerRow') || 1) ;
    return true ;
  },
  
  /** @private
    Selects the same item on the next row or moves up one if 
    itemsPerRow = 1
  */
  moveUp: function(sender, evt) {
    this.selectPreviousItem(false, this.get('itemsPerRow') || 1) ;
    return true ;
  },

  /** @private
    Selects the previous item if itemsPerRow > 1.  Otherwise does nothing.
  */
  moveLeft: function(sender, evt) {
    if ((this.get('itemsPerRow') || 1) > 1) this.selectPreviousItem(false, 1) ;
    return true ;
  },

  /** @private
    Selects the next item if itemsPerRow > 1.  Otherwise does nothing.
  */
  moveRight: function(sender, evt) {
    if ((this.get('itemsPerRow') || 1) > 1) this.selectNextItem(false, 1) ;
    return true ;
  },

  moveDownAndModifySelection: function(sender, evt) {
    this.selectNextItem(true, this.get('itemsPerRow') || 1) ;
    return true ;
  },
  
  moveUpAndModifySelection: function(sender, evt) {
    this.selectPreviousItem(true, this.get('itemsPerRow') || 1) ;
    return true ;
  },

  /** @private
    Selects the previous item if itemsPerRow > 1.  Otherwise does nothing.
  */
  moveLeftAndModifySelection: function(sender, evt) {
    if ((this.get('itemsPerRow') || 1) > 1) this.selectPreviousItem(true, 1) ;
    return true ;
  },

  /** @private
    Selects the next item if itemsPerRow > 1.  Otherwise does nothing.
  */
  moveRightAndModifySelection: function(sender, evt) {
    if ((this.get('itemsPerRow') || 1) > 1) this.selectNextItem(true, 1) ;
    return true ;
  },

  /**
    Handles mouse down events on the collection view or on any of its 
    children.
    
    The default implementation of this method can handle a wide variety
    of user behaviors depending on how you have configured the various
    options for the collection view.
    
    @param ev {Event} the mouse down event
    @returns {Boolean} Usually YES.
  */
  mouseDown: function(ev) {

    // When the user presses the mouse down, we don't do much just yet.
    // Instead, we just need to save a bunch of state about the mouse down
    // so we can choose the right thing to do later.

    // save the original mouse down event for use in dragging.
    this._mouseDownEvent = ev ;

    // Toggle selection only triggers on mouse up.  Do nothing.
    if (this.useToggleSelection) return true;

    // Make sure that saved mouseDown state is always reset in case we do
    // not get a paired mouseUp. (Only happens if subclass does not call us 
    // like it should)
    this._mouseDownAt = this._shouldSelect = this._shouldDeselect =
      this._shouldReselect = this._refreshSelection = false;

    // find the actual view the mouse was pressed down on.  This will call
    // hitTest() on item views so they can implement non-square detection
    // modes. -- once we have an item view, get its content object as well.
    var mouseDownView    = this._mouseDownView = this.itemViewForEvent(ev);
    var mouseDownContent = 
      this._mouseDownContent = (mouseDownView) ? mouseDownView.get('content') : null;

    // become first responder if possible.
    this.becomeFirstResponder() ;
    
    // recieved a mouseDown on the collection element, but not on one of the 
    // childItems... unless we do not allow empty selections, set it to empty.
    if (!mouseDownView) {
      if (this.get('allowDeselectAll')) this.selectItems([], false);
      return true ;
    }
    
    // collection some basic setup info
    var selection  = this.get('selection') || [];
    var isSelected = selection.include(mouseDownContent);
    var modifierKeyPressed = ev.ctrlKey || ev.metaKey ;
    if (mouseDownView.checkboxView && (Event.element(ev) == el.checkboxView.rootElement)) {
      modifierKeyPressed = true ;
    }
    this._modifierKeyPressed = modifierKeyPressed ;  

    this._mouseDownAt = Date.now();

    // holding down a modifier key while clicking a selected item should 
    // deselect that item...deselect and bail.
    if (modifierKeyPressed && isSelected) {
      this._shouldDeselect = mouseDownContent;
    // if the shiftKey was pressed, then we want to extend the selection
    // from the last selected item
    } else if (ev.shiftKey && selection.get('length') > 0) {
      selection = this._findSelectionExtendedByShift(selection, mouseDownContent) ;
      this.selectItems(selection) ;
      
    // If no modifier key was pressed, then clicking on the selected item 
    // should clear the selection and reselect only the clicked on item.
    } else if (!modifierKeyPressed && isSelected) {
      this._shouldReselect = mouseDownContent;
      
    // Otherwise, if selecting on mouse down,  simply select the clicked on 
    // item, adding it to the current selection if a modifier key was pressed.
    } else {
      if (this.get("selectOnMouseDown")){
         this.selectItems(mouseDownContent, modifierKeyPressed);
      } else this._shouldSelect = mouseDownContent ;
    }
    
    // saved for extend by shift ops.
    this._previousMouseDownContent = mouseDownContent;
    
    return true;
  },
  
  mouseUp: function(ev) {
    
    var canAct = this.get('actOnSelect') ;
    var view = this.itemViewForEvent(ev) ;
    
    if (this.useToggleSelection) {
      if (!view) return ; // do nothing when clicked outside of elements
      
      // determine if item is selected. If so, then go on.
      var selection = this.get('selection') || [] ;
      var content = (view) ? view.get('content') : null ;
      var isSelected = selection.include(content) ;
      if (isSelected) {
        this.deselectItems([content]) ;
      } else this.selectItems([content],true) ;
      
    } else {
      var content = (view) ? view.get('content') : null ;

      // this will be set if the user simply clicked on an unselected item and 
      // selectOnMouseDown was NO.
      if (this._shouldSelect) this.selectItems(this._shouldSelect, this._modifierKeyPressed);
      
      // This is true if the user clicked on a selected item with a modifier
      // key pressed.
      if (this._shouldDeselect) this.deselectItems(this._shouldDeselect);

      // This is true if the user clicked on a selected item without a 
      // modifier-key pressed.  When this happens we try to begin editing 
      // on the content.  If that is not allowed, then simply clear the 
      // selection and reselect the clicked on item.
      if (this._shouldReselect) {

        // - contentValueIsEditable is true
        var canEdit = this.get('contentValueIsEditable') ;
        
        // - the user clicked on an item that was already selected
        // - is the only item selected
        if (canEdit) {
          var sel = this.get('selection') ;
          canEdit = sel && (sel.get('length') === 1) && (sel.objectAt(0) === this._shouldReselect) ;
        }

        // - the item view responds to contentHitTest() and returns YES.
        // - the item view responds to beginEditing and returns YES.
        if (canEdit) {
          var itemView = this.itemViewForContent(this._shouldReselect) ;
          canEdit = itemView && (!itemView.contentHitTest || itemView.contentHitTest(ev)) ;
          canEdit = (canEdit && itemView.beginEditing) ? itemView.beginEditing() : NO ;
        }
        
        // if cannot edit, just reselect
        if (!canEdit) this.selectItems(this._shouldReselect,false) ;
      }

      this._cleanupMouseDown() ;
    }

    this._mouseDownEvent = null ;
    if (canAct) this._action(ev, view) ;
    
    return false;  // bubble event to allow didDoubleClick to be called...
  },
  
  _cleanupMouseDown: function() {
    this._mouseDownAt = this._shouldDeselect = this._shouldReselect = this._refreshSelection = this._shouldSelect = false;
    this._mouseDownEvent = this._mouseDownContent = this._mouseDownView = null ;
  },
  
  mouseMoved: function(ev) {
    var view = this.itemViewForEvent(ev) ;
    // handle hover events.
    if(this._lastHoveredItem && ((view === null) || (view != this._lastHoveredItem)) && this._lastHoveredItem.mouseOut) {
      this._lastHoveredItem.mouseOut(ev); 
    }
    this._lastHoveredItem = view ;
    if (view && view.mouseOver) view.mouseOver(ev) ;
  },

  mouseOut: function(ev) {
  
    var view = this._lastHoveredItem ;
    this._lastHoveredItem = null ;
    if (view && view.didMouseOut) view.didMouseOut(ev) ;
  },
  
  doubleClick: function(ev) {
    var view = this.itemViewForEvent(ev) ;
    if (view) {
      this._action(view, ev) ;
      return true ;
    } else return false ;
  },

  _findSelectionExtendedByShift: function(selection, mouseDownContent) {
    var content = this.get('content');

    // bounds of the collection...
    var contentLowerBounds = 0;
    var contentUpperBounds = (content.get('length') - 1);

    var selectionBeginIndex = content.indexOf(selection.first());
    var selectionEndIndex   = content.indexOf(selection.last());

    var previousMouseDownIndex = content.indexOf(this._previousMouseDownContent);
    // _previousMouseDownContent couldn't be found... either it hasn't been set yet or the record has been deleted by the user
    // fall back to the first selected item.
    if (previousMouseDownIndex == -1) previousMouseDownIndex = selectionBeginIndex;


    var currentMouseDownIndex = content.indexOf(mouseDownContent);
    // sanity check...
    if (currentMouseDownIndex == -1) throw "Unable to extend selection to an item that's not in the content array!";

    // clicked before the current selection set... extend it's beginning...
    if (currentMouseDownIndex < selectionBeginIndex) {
      selectionBeginIndex = currentMouseDownIndex;
    }
    
    // clicked after the current selection set... extend it's ending...
    if (currentMouseDownIndex > selectionEndIndex) {
      selectionEndIndex = currentMouseDownIndex;
    }
    
    // clicked inside the selection set... need to determine where the last
    // selection was and use that as an anchor.
    if ((currentMouseDownIndex > selectionBeginIndex) && (currentMouseDownIndex < selectionEndIndex)) {
      if (currentMouseDownIndex === previousMouseDownIndex) {
        selectionBeginIndex = currentMouseDownIndex;
        selectionEndIndex   = currentMouseDownIndex;
      } else if (currentMouseDownIndex > previousMouseDownIndex) {
        selectionBeginIndex = previousMouseDownIndex;
        selectionEndIndex   = currentMouseDownIndex;
      } else if (currentMouseDownIndex < previousMouseDownIndex){
        selectionBeginIndex = currentMouseDownIndex;
        selectionEndIndex   = previousMouseDownIndex;
      }
    }
    
    // slice doesn't include the last index passed... silly..
    selectionEndIndex++;

    // shouldn't need to sanity check that the selection is in bounds due to 
    // the indexOf checks above...I'll have faith that indexOf hasn't lied to 
    // me...
    return content.slice(selectionBeginIndex, selectionEndIndex);
  },

  /*
   Finds the next selectable item, up to content length, by asking the
   delegate. If a non-selectable item is found, the index is skipped. If
   no item is found, selection index is returned unmodified.

   @param {Integer} proposedIndex the desired index to select
   @returns {Integer} the next selectable index. This will always be in the range of the bottom of the current selection index and the proposed index.
   @private
  */
  _findNextSelectableItemFromIndex: function (proposedIndex) {
    var content = this.get('content');
    var contentLength = content.get('length');
    var bottom = this._indexOfSelectionTop();

    while (proposedIndex < contentLength &&
      this.invokeDelegateMethod(this.delegate, 'collectionViewShouldSelectItem', this, content.objectAt(proposedIndex)) === NO) {
      proposedIndex++;
    }
    return (proposedIndex < contentLength) ? proposedIndex : bottom;
  },

  /*
   Finds the previous selectable item, up to the first item, by asking the
   delegate. If a non-selectable item is found, the index is skipped. If
   no item is found, selection index is returned unmodified.

   @param {Integer} proposedIndex the desired index to select
   @returns {Integer} the previous selectable index. This will always be in the range of the top of the current selection index and the proposed index.
   @private
  */
  _findPreviousSelectableItemFromIndex: function (proposedIndex) {
    var content = this.get('content');
    var contentLength = content.get('length');
    var top = this._indexOfSelectionTop();

    while (proposedIndex > 0 &&
           this.invokeDelegateMethod(this.delegate, 'collectionViewShouldSelectItem', this, content.objectAt(proposedIndex)) === NO) {
      proposedIndex--;
    }
    return (proposedIndex > 0) ? proposedIndex : top;
  },

  // if content value is editable and we have one item selected, then edit.
  // otherwise, invoke action.
  insertNewline: function() {
    if (this.get('contentValueIsEditable')) {
      var sel = this.get('selection') ;
      if (sel && sel.get('length') === 1) {
        var itemView = this.itemViewForContent(sel.objectAt(0)) ;
        if (itemView && itemView.beginEditing) {
          this.scrollToItemView(itemView) ;
          itemView.beginEditing() ;
        }
      }
      
    // invoke action!
    } else {
      var sel = this.get('selection') ;
      var itemView = (sel && sel.get('length') === 1) ? this.itemViewForContent(sel.objectAt(0)) : null ;
      this._action(itemView, null) ;
    }
    
    return YES ; // always handle
  },
  
  // ......................................
  // FIRST RESPONDER
  //

  /**
    Called whenever the collection becomes first responder. 
    Adds the focused class to the element.
  */
  didBecomeFirstResponder: function() {
    this.addClassName('focus') ;
  },
  
  willLoseFirstResponder: function() {
    this.removeClassName('focus');
  },
  
  // ......................................
  // DRAG AND DROP SUPPORT
  //

  /**
    When reordering its content, the collection view will store its reorder
    data using this special data type.  The data type is unique to each 
    collection view instance.  You can use this data type to detect reorders
    if necessary.
    
    @field
    @type {String}
  */
  reorderDataType: function() {
    if (!this._reorderDataTypeKey) {
      this._reorderDataTypeKey = "SC.CollectionView.Reorder.%@".fmt(SC.guidFor(this)) ;
    }
    return this._reorderDataTypeKey ;
  }.property(),
  
  _reorderDataType: function() {
    return this.get('reorderDataType') ;
  },
  
  /**
    This property is set to the array of content objects that are the subject
    of a drag whenever a drag is initiated on the collection view.  You can
    consult this property when implementing your collection view delegate 
    methods, but otherwise you should not use this property in your code.
    
    Note that drag content will always appear in the same order the content
    appears in the source content array.
    
    @field
    @type {Array}
  */
  dragContent: null,
  
  /**
    This property is set to the proposed insertion index during a call to
    collectionViewValidateDrop().  Your delegate implementations can change
    the value of this property to enforce a drop some in some other location.
    
    @type {Number}
    @field
  */
  proposedInsertionIndex: null,
  
  /**
    This property is set to the proposed drop operation during a call to
    collectionViewValidateDrop().  Your delegate implementations can change
    the value of this property to enforce a different type of drop operation.
    
    @type {Number}
    @field
  */
  proposedDropOperation: null,
  
  /**  @private
    mouseDragged event handler.  Initiates a drag if the following conditions
    are met:
    
    - collectionViewShouldBeginDrag() returns YES *OR*
    - the above method is not implemented and canReorderContent is true.
    - the dragDataTypes property returns a non-empty array
    - a mouse down event was saved by the mouseDown method.
  */
  mouseDragged: function(ev) {
    // if the mouse down event was cleared, there is nothing to do; return.
    if (this._mouseDownEvent === null) return YES ;

    // Don't do anything unless the user has been dragging for 123msec
    if ((Date.now() - this._mouseDownAt) < 123) return YES ;
    
    // OK, they must be serious, decide if a drag will be allowed.
    if (this.invokeDelegateMethod(this.delegate, 'collectionViewShouldBeginDrag', this)) {

      // First, get the selection to drag.  Drag an array of selected
      // items appearing in this collection, in the order of the 
      // collection.
      //
      // Set this to the dragContent property.
      var content = this.get('content') || [] ;
      var dragContent;
      
      // if we don't select on mouse down, then the selection has not been 
      // updated to whatever the user clicked.  Instead use
      // mouse down content.
      if (!this.get("selectOnMouseDown")) {
        dragContent = [this._mouseDownContent];
      } else {
        dragContent = this.get('selection').sort(function(a,b) {
          a = content.indexOf(a) ;
          b = content.indexOf(b) ;
          return (a<b) ? -1 : ((a>b) ? 1 : 0) ;
        });
      }
      
      this.set('dragContent', dragContent) ;

      // Get the set of data types supported by the delegate.  If this returns
      // a null or empty array and reordering content is not also supported
      // then do not start the drag.
      if (this.get('dragDataTypes').get('length') > 0) {
        // Build the drag view to use for the ghost drag.  This 
        // should essentially contain any visible drag items.
        var view = this.ghostViewFor(dragContent) ;

        // Initiate the drag
        SC.Drag.start({
          event: this._mouseDownEvent,
          source: this,
          dragView: view,
          ghost: NO,
          slideBack: YES,
          dataSource: this
        }) ; 

        // Also use this opportunity to clean up since mouseUp won't 
        // get called.
        this._cleanupMouseDown() ;
        this._lastInsertionIndex = null ;
        
      // Drag was not allowed by the delegate, so bail.
      } else {
        this.set('dragContent', null) ;
      }
      
      return YES ;
    }
  },

  /**
    Implements the drag data source protocol for the collection view.  This
    property will consult the collection view delegate if one is provided. It
    will also do the right thing if you have set canReorderContent to YES.
    
    @field 
    @type {Array}
  */
  dragDataTypes: function() {
    
    // consult delegate.
    var ret = this.invokeDelegateMethod(this.delegate, 'collectionViewDragDataTypes', this) ;
    var canReorderContent = this.get('canReorderContent') ;
    
    // bail if ret returned null or empty array and cannot reorder.
    if ((!ret || ret.get('length')===0) && !canReorderContent) return [];
    
    // add reorder type if needed.
    if (canReorderContent) {
      ret = (ret) ? ret.slice() : [] ;
      
      var key = this.get('reorderDataType') ;
      if (ret.indexOf(key) < 0) ret.push(key) ;
    }
    return ret ;
    
    //data: { "_mouseDownContent": dragContent }
      
  }.property(),

  /**
    Implements the drag data source protocol method.  The implementation of
    this method will consult the collection view delegate if one has been
    provided.  It also respects the canReoderContent method.
  */
  dragDataForType: function(dataType, drag) {
    
    // if this is a reorder, then return drag content.
    if (this.get('canReorderContent')) {
      if (dataType === this.get('reorderDataType')) return this.get('dragContent') ;
    }
    
    // otherwise, just pass along to the delegate.
    return this.invokeDelegateMethod(this.delegate, 'collectionViewDragDataForType', this, dataType, drag) ;
  },

  /**
    Implements the SC.DropTarget interface.  The default implementation will
    consult the collection view delegate, if you implement those methods.
  */
  dragEntered: function(drag, evt) {

    // the proposed drag operation is DRAG_REORDER only if we can reorder
    // content and the drag contains reorder content.
    var op = SC.DRAG_NONE ;
    if (this.get('canReorderContent')) {
      var types = drag.get('dataTypes') ;
      if (types.indexOf(this.get('reorderDataType')) >= 0) {
        op = SC.DRAG_REORDER ;
      }
    }
    
    // Now pass this onto the delegate.
    op = this.invokeDelegateMethod(this.delegate, 'collectionViewValidateDrop', this, drag, SC.DROP_ANY, -1, op) ;
    
    if (op === SC.DRAG_REORDER) op = SC.DRAG_MOVE ;
    
    // return
    return op ;
  },

  // Determines the allowed drop operation insertion point, operation type,
  // and the drag operation to be performed.  Used by dragUpdated() and 
  // performDragOperation().
  _computeDropOperationState: function(drag, evt) {
    
    // get the insertion index for this location.  This can be computed
    // by a subclass using whatever method.  This method is not expected to
    // do any data valdidation, just to map the location to an insertion 
    // index.
    var loc = drag.get('location') ;
    loc = this.convertFrameFromView(loc, null) ;
    var dropOp = SC.DROP_BEFORE ;
    var dragOp = SC.DRAG_NONE ;
    
    // STEP 1: Try with a DROP_ON option -- send straight to delegate if 
    // supported by view.
    
    // get the computed insertion index and possibly drop operation.
    // prefer to drop ON.
    var idx = this.insertionIndexForLocation(loc, SC.DROP_ON) ;
    if ($type(idx) === T_ARRAY) {
      dropOp = idx[1] ;
      idx = idx[0] ;
    }

    // if the return drop operation is DROP_ON, then just check it with the
    // delegate method.  If the delegate method does not support dropping on,
    // then it will return DRAG_NONE, in which case we will try again with
    // drop before.
    if (dropOp === SC.DROP_ON) {
      
      // Now save the insertion index and the dropOp.  This may be changed by
      // the collection delegate.
      this.set('proposedInsertionIndex', idx) ;
      this.set('proposedDropOperation', dropOp) ;
      dragOp = this.invokeDelegateMethod(this.delegate, 'collectionViewValidateDrop', this, drag, dropOp, idx, dragOp) ;
      idx = this.get('proposedInsertionIndex') ;
      dropOp = this.get('proposedDropOperation') ;
      this._dropInsertionIndex = this._dropOperation = null ;

      // The delegate is OK with a drop on also, so just return.
      if (dragOp !== SC.DRAG_NONE) {
        return [idx, dropOp, dragOp] ;
        
      // The delegate is NOT OK with a drop on, try to get the insertion
      // index again, but this time prefer SC.DROP_BEFORE, then let the 
      // rest of the method run...
      } else {
        dropOp = SC.DROP_BEFORE ;
        idx = this.insertionIndexForLocation(loc, SC.DROP_BEFORE) ;
        if ($type(idx) === T_ARRAY) {
          dropOp = idx[1] ;
          idx = idx[0] ;
        }
      }
    }

    // if this is a reorder drag, set the proposed op to SC.DRAG_REORDER and
    // validate the insertion point.  This only works if the insertion point
    // is DROP_BEFORE.  DROP_ON is not handled by reordering content.
    if ((idx >= 0) && this.get('canReorderContent') && (dropOp === SC.DROP_BEFORE)) {

      var objects = drag.dataForType(this.get('reorderDataType')) ;
      if (objects) {
        var content = this.get('content') || [] ;

        // if the insertion index is in between two items in the drag itself, 
        // then this is not allowed.  Either use the last insertion index or 
        // find the first index that is not in between selections.  Stop when
        // we get to the beginning.
        var previousContent = (idx > 0) ? content.objectAt(idx-1) : null ;
        var nextContent = (idx < content.get('length')) ? content.objectAt(idx) : null;

        var isPreviousInDrag = (previousContent) ? objects.indexOf(previousContent)>=0 : NO;
        var isNextInDrag = (nextContent) ? objects.indexOf(nextContent)>=0 : NO;

        if (isPreviousInDrag && isNextInDrag) {
          if (this._lastInsertionIndex == null) {
            while((idx >= 0) && (objects.indexOf(content.objectAt(idx)) >= 0)) {
              idx-- ;
            } 
          } else idx = this._lastInsertionIndex ;
        }

        // If we found a valid insertion point to reorder at, then set the op
        // to custom DRAG_REORDER.
        if (idx >= 0) dragOp = SC.DRAG_REORDER ;
      }
    }

    // Now save the insertion index and the dropOp.  This may be changed by
    // the collection delegate.
    this.set('proposedInsertionIndex', idx) ;
    this.set('proposedDropOperation', dropOp) ;
    dragOp = this.invokeDelegateMethod(this.delegate, 'collectionViewValidateDrop', this, drag, dropOp, idx, dragOp) ;
    idx = this.get('proposedInsertionIndex') ;
    dropOp = this.get('proposedDropOperation') ;
    this._dropInsertionIndex = this._dropOperation = null ;
    
    // return generated state
    return [idx, dropOp, dragOp] ;
  },
  
  /** 
    Implements the SC.DropTarget interface.  The default implementation will
    determine the drop location and then consult the collection view delegate
    if you implement those methods.  Otherwise it will handle reordering
    content on its own.
  */
  dragUpdated: function(drag, evt) {

    var state = this._computeDropOperationState(drag, evt) ;
    var idx = state[0], dropOp = state[1], dragOp = state[2] ;
    
    // if the insertion index or dropOp have changed, update the insertion
    // point
    if (dragOp !== SC.DRAG_NONE) {
      if ((this._lastInsertionIndex !== idx) || (this._lastDropOperation !== dropOp)) {
        var itemView = this.itemViewForContent(this.get('content').objectAt(idx));
        this.showInsertionPoint(itemView, dropOp) ;
      }

      this._lastInsertionIndex = idx ;
      this._lastDropOperation = dropOp ;

    } else {
      this.hideInsertionPoint() ;
      this._lastInsertionIndex = this._lastDropOperation = null ;
    }

    // Normalize drag operation to the standard kinds accepted by the drag
    // system.
    return (dragOp === SC.DRAG_REORDER) ? SC.DRAG_MOVE : dragOp;  
  },

  /**
    Implements the SC.DropTarget protocol.  Hides any visible insertion 
    point and clears some cached values.
  */
  dragExited: function() {
    this.hideInsertionPoint() ;
    this._lastInsertionIndex = this._lastDropOperation = null ;
  },

  /**
    Implements the SC.DropTarget protocol.  Hides any visible insertion 
    point and clears some cached values.
  */
  dragEnded: function() {
    this.hideInsertionPoint() ;
    this._lastInsertionIndex = this._lastDropOperation = null ;
  },

  /**
    Implements the SC.DropTarget protocol.
  */
  prepareForDragOperation: function(op, drag) { return YES; },
  
  /**
    Implements the SC.DropTarget protocol.  Consults the collection view
    delegate to actually perform the operation unless the operation is 
    reordering content.
  */
  performDragOperation: function(op, drag) { 
    
    // Get the correct insertion point, drop operation, etc.
    var state = this._computeDropOperationState(drag, null, op) ;
    var idx = state[0], dropOp = state[1], dragOp = state[2] ;

    // The dragOp is the kinds of ops allowed.  The drag operation must 
    // be included in that set.
    if (dragOp === SC.DRAG_REORDER) {
      op = (op & SC.DRAG_MOVE) ? SC.DRAG_REORDER : SC.DRAG_NONE ;
    } else {
      op = op & dragOp ;
    }
    
    // If no allowed drag operation could be found, just return.
    if (op === SC.DRAG_NONE) return op;
    
    // Some operation is allowed through, give the delegate a chance to
    // handle it.
    var performed = this.invokeDelegateMethod(this.delegate, 'collectionViewAcceptDrop', this, drag, dropOp, idx, op) ;

    // If the delegate did not handle the drag (i.e. returned SC.DRAG_NONE),
    // and the op type is REORDER, then do the reorder here.
    if ((performed === SC.DRAG_NONE) && (op === SC.DRAG_REORDER)) {
      var objects = drag.dataForType(this.get('reorderDataType')) ;
      if (!objects) return SC.DRAG_NONE ;

      var content = this.get('content') ;
      content.beginPropertyChanges(); // suspend notifications

      // find the old index and remove it.
      var objectsIdx = objects.get('length') ;
      while(--objectsIdx >= 0) {
        var obj = objects.objectAt(objectsIdx) ;
        var old = content.indexOf(obj) ;
        if (old >= 0) content.removeAt(old) ;
        if ((old >= 0) && (old < idx)) idx--; //adjust idx
      }
    
      // now insert objects at new location
      content.replace(idx, 0, objects) ;
      content.endPropertyChanges(); // restart notifications
      
      // make the op into its actual value
      op = SC.DRAG_MOVE ;
    }

    return op; 
  },
  
  /**
    Default delegate method implementation, returns YES if canReorderContent
    is also true.
  */
  collectionViewShouldBeginDrag: function(view) {
    return this.get('canReorderContent') ;
  },
  
  concludeDragOperation: function(op, drag) {
    this.hideInsertionPoint() ;
    this._lastInsertionIndex = null ;
  },

  /** 
    The insertion orientation.  This is used to determine which
    dimension we should pay attention to when determining insertion point for
    a mouse click.
    
    {{{
      SC.HORIZONTAL_ORIENTATION: look at the X dimension only
      SC.VERTICAL_ORIENTATION: look at the Y dimension only
    }}}
  */
  insertionOrientation: SC.HORIZONTAL_ORIENTATION,
  
  /**
    Get the preferred insertion point for the given location, including 
    an insertion preference of before or after the named index.
    
    You can implement this method in a subclass if you like to perform a 
    more efficient check.  The default implementation will loop through the 
    item views looking for the first view to "switch sides" in the orientation 
    you specify.

    This method should return an array with two values.  The first value is
    the insertion point index and the second value is the drop operation,
    which should be one of SC.DROP_BEFORE or SC.DROP_ON. 
    
    The preferred drop operation passed in should be used as a hint as to 
    the type of operation the drag and drop could would prefer to receive.
    If the dropOperaiton is SC.DROP_ON, then you should return a DROP_ON
    mode if possible.  Otherwise, you should never return DROP_ON.
    
    For compatibility, you can also return just the insertion index.  If you
    do this, then the collction view will assume the drop operation is 
    SC.DROP_BEFORE.
    
    If an insertion is NOT allowed, you should return -1 as the insertion 
    point.  In this case, the drop operation will be ignored.
    
    @param loc {Point} the mouse location.
    @param dropOperation {DropOp} the preferred drop operation.
    @returns {Array} [proposed drop index, drop operation] 
  */
  insertionIndexForLocation: function(loc, dropOperation) {  
    var content = this.get('content') ;
    var f, itemView, curSide, lastSide = null ;
    var orient = this.get('insertionOrientation') ;
    var ret=  null ;
    for(var idx=0; ((ret == null) && (idx<content.length)); idx++) {
      itemView = this.itemViewForContent(content.objectAt(idx));
      f = this.convertFrameFromView(itemView.get('frame'), itemView) ;
      
      // if we are a horizontal orientation, look for the first item that 
      // will "switch sides" on the x path an the maxY is greater than Y.
      // This assumes you will flow top to bottom, but it should work if you
      // flow LTR or RTL.
      if (orient == SC.HORIZONTAL_ORIENTATION) {
        if (SC.maxY(f) > loc.y) {
          curSide = (SC.maxX(f) < loc.x) ? -1 : 1 ;
        } else curSide = null ;
        
      // if we are a vertical orientation, look for the first item that
      // will "swithc sides" on the y path and the maxX is greater than X.
      // This assumes you will flow LTR, but it should work if you flow
      // bottom to top or top to bottom.
      } else {
        if (SC.minX(f) < loc.x) {
          curSide = (SC.maxY(f) < loc.y) ? -1 : 1 ;
        } else curSide = null ;
      } 
      
      // if we "switched" sides then return this item view.
      if (curSide !== null) {
        
        // OK, we found an item view, while we have this data, decide if
        // we should insert before or after the view
        if ((lastSide !== null) && (curSide != lastSide)) {
          ret = idx ;
          if (orient == SC.HORIZONTAL_ORIENTATION) {
            if (SC.midX(f) < loc.x) ret++ ;
          } else {
            if (SC.midY(f) < loc.y) ret++ ;
          }
        }
        lastSide =curSide ;
      }
    }
    
    // Handle some edge cases
    if ((ret == null) || (ret < 0)) ret = 0 ;
    if (ret > content.length) ret = content.length ;
    
    // Done. Phew.  Return.
    return ret;
  },
  
  /** 
    Override to show the insertion point during a drag.
    
    Called during a drag to show the insertion point.  Passed value is the
    item view that you should display the insertion point before.  If the
    passed value is null, then you should show the insertion point AFTER that
    last item view returned by the itemViews property.
    
    Once this method is called, you are guaranteed to also recieve a call to
    hideInsertionPoint() at some point in the future.
    
    The default implementation of this method does nothing.
    
    @param itemView {SC.View} view the insertion point should appear directly before. If null, show insertion point at end.
    @param dropOperation {Number} the drop operation.  will be SC.DROP_BEFORE or SC.DROP_ON
    
    @returns {void}
  */
  showInsertionPoint: function(itemView, dropOperation) {
    return (dropOperation === SC.DROP_BEFORE) ? this.showInsertionPointBefore(itemView) : this.hideInsertionPoint() ;
  },
  
  /**
    @deprecated
    
    Show the insertion point during a drag before the named item view.
    
    This method has been deprecated in favor of the more generic 
    showInsertionPoint() which can be used to show drops occurring both on
    and before an itemView.  If you do not implement showInsertionPoint() 
    yourself, the default implementation will call this method whenever the
    drop operation is SC.DROP_BEFORE.
    
    @param itemView {SC.View} the item view to show before.
    @returns {void}
  */
  showInsertionPointBefore: function(itemView) {},
  
  /**
    Override to hide the insertion point when a drag ends.
    
    Called during a drag to hide the insertion point.  This will be called 
    when the user exits the view, cancels the drag or completes the drag.  It 
    will not be called when the insertion point changes during a drag.
    
    You should expect to receive one or more calls to 
    showInsertionPointBefore() during a drag followed by at least one call to 
    this method at the end.  Your method should not raise an error if it is 
    called more than once.
    
    @returns {void}
  */
  hideInsertionPoint: function() {},

  /**
    Override this method to provide your own ghost image for a drag.  
    
    Note that the only purpose of this view is to render a visible drag 
    element.  It is not critical that you make this element bindable, etc.
    
    @param dragContent {Array} Array of content objects that will be used in 
     the drag.
  */
  ghostViewFor: function(dragContent) {
    var view = SC.View.create() ;
    view.setStyle({ position: 'absolute', overflow: 'hidden' });
    
    var viewFrame = this.convertFrameToView(this.get('frame'), null) ;
    view.set('frame', viewFrame) ;
    
    var idx = dragContent.length ;
    var maxX = 0; var maxY = 0 ; var minX =100000; var minY = 100000 ;
    
    while(--idx >= 0) {
      var itemView = this.itemViewForContent(dragContent[idx]) ;
      if (!itemView) continue ;

      var f = itemView.get('frame') ;
      f = this.convertFrameFromView(f, itemView) ;
      
      var dom = itemView.rootElement ;
      if (!dom) continue ;
      
      // save the maxX & maxY.  This will be used to trim the size 
      // of the ghost view later.
      if (SC.maxX(f) > maxX) maxX = SC.maxX(f) ;
      if (SC.maxY(f) > maxY) maxY = SC.maxY(f) ;
      if (SC.minX(f) < minX) minX = SC.minX(f) ;
      if (SC.minY(f) < minY) minY = SC.minY(f) ;

      // Clone the contents of this node.  We should probably apply the 
      // computed style to the cloned nodes in order to make sure they match 
      // even if the CSS styles do not match.  Make sure the items are 
      // properly positioned.
      dom = dom.cloneNode(true) ;

      Element.setStyle(dom, { position: "absolute", left: "%@px".fmt(f.x), top: "%@px".fmt(f.y), width: "%@px".fmt(f.width), height: "%@px".fmt(f.height) }) ;
      view.rootElement.appendChild(dom) ;
    }

    // Now we have a view, create another view that will wrap the other view 
    // and position it inside.
    var wrapper = SC.View.create() ;
    wrapper.setStyle({ position: 'absolute', overflow: 'hidden' }) ;
    wrapper.set('frame', { 
      x: viewFrame.x+minX, y: viewFrame.y+minY, 
      width: (maxX-minX+1), height: (maxY-minY+1) 
    }) ;
    wrapper.appendChild(view) ;
    view.set('frame', { x: 0-minX, y: 0-minY }) ;
    return wrapper ;
  },
  
  /**
    Default delegate method implementation, returns YES if isSelectable
    is also true.
  */
  collectionViewShouldSelectItem: function(view, item) {
    return this.get('isSelectable') ;
  },

  // ......................................
  // INTERNAL
  //
  
  init: function() {

    // Initialize internal hashes and arrays.  Normally the best approach to this 
    // is to initialize a property only when it is used.  However, these properties
    // are critical to layout and therefore will always be needed so it is faster
    // to do it once here.
    this._itemViewsByContent= {};
    this._groupViewsByValue= {};
    this._groupViewCounts= {};
    this._zombieGroupViews= {};
    this._itemViewsByGuid = {} ;

    this._itemViewPool= [];
    this._groupViewPool= [];

    sc_super() ;
    this._dropTargetObserver();
  },

  // Perform the action.  Supports legacy behavior as well as newer style
  // action dispatch.
  _action: function(view, evt) {
    
    var action = this.get('action');
    var target = this.get('target') || null;
    if (action) {
      // if the action is a function, just call it
      if ($type(action) == T_FUNCTION) return this.action(view, evt) ;
      
      // otherwise, use the new sendAction style
      SC.app.sendAction(action, target, this) ;
      
    // if no action is specified, then trigger the support action,
    // if supported.
    } else if (!view) {
      return ; // nothing to do
      
    // if the target view has its own internal action handler,
    // trigger that.
    } else if ($type(view._action) == T_FUNCTION) {
      return view._action(evt) ;
      
    // otherwise call the action method to support older styles.
    } else if ($type(view.action) == T_FUNCTION) {
      return view.action(evt) ;
    }
  },

  /** Add/remove from drop targets as needed. */
  _dropTargetObserver: function() {
    var canDrop = this.get('canReorderContent') || this.get('isDropTarget') ;
    if (canDrop) {
      SC.Drag.addDropTarget(this) ;
    } else {
      SC.Drag.removeDropTarget(this) ;
    }
  }.observes('canReorderContent', 'isDropTarget'),

  /** @private
    Whenever content changes, update children and also start observing
    new [] property.
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
    
    var rev = (content) ? content.propertyRevision : -1 ;
    this._contentPropertyObserver(this, '[]', content, rev) ; 
  }.observes('content'),
  
  /** @private
    Whenever the selection changes, update the itemViews.
  */
  _selectionObserver: function() {
    var sel = this.get('selection') ;
    if (SC.isEqual(sel, this._selection)) return ; // nothing to do

    if (!this._boundSelectionPropertyObserver) {
      this._boundSelectionPropertyObserver = this._selectionPropertyObserver.bind(this) ;
    }
    var func = this._boundSelectionPropertyObserver ;
    
    if (this._selection) this._selection.removeObserver('[]', func) ;
    if (sel) sel.addObserver('[]', func) ;
    this._selection = sel ;
    this._selectionPropertyRevision = null ;
    var propertyRevision = (sel) ? sel.propertyRevision : null;
    this._selectionPropertyObserver(this, '[]', sel, propertyRevision) ;
  }.observes('selection'),
  
  // called on content change *and* content.[] change...
  // update children if this is a new propertyRevision
  //
  // UPDATE:
  // -- recheck all item views, add/remove children as needed
  // -- update layout on all item views.
  // -- optional: determine the first item view that does not match.
  //
  _contentPropertyObserver: function(target, key, value, rev) {    
    if (!this._updatingContent && (!rev || (rev != this._contentPropertyRevision))) {
      this._contentPropertyRevision = rev ;
      this._updatingContent = true ;
      this._hasChildren = false ;
      this.updateChildren(true) ;
      this._updatingContent = false ;
    }
  },
  
  // called on selection change and selection.[] change...
  // update selection states if this is a new propertyRevision
  _selectionPropertyObserver: function(target, key, value, rev) {
    if (!this._updatingSel && (!rev || (rev != this._selectionPropertyRevision))) {
      this._selectionPropertyRevision = rev ;
      this._updatingSel = true ;
      this._selectionHash = null ; // flush cache
      this.updateSelectionStates() ;
      this._updatingSel = false ;
    }
  },

  // If isVisibleInWindow status changes, updateChildren if we are dirty.
  _isVisibleInWindowObserver: function() {
    if (this.get('isDirty')) this.updateChildren() ;
  }.observes('isVisibleInWindow'),
  
  // ======================================================================
  // DEPRECATED APIS (Still available for compatibility)
  
  /** @private 
    If set to false, this method will prevent you from deselecting all of
    the items in your view.  This is better implemented using a controller
    that prohibits empty selection.
  */
  allowDeselectAll: true,

  /** @private */
  itemExistsInCollection: function( view ) { return this.hasItemView(view); },
  
  /** @private */
  viewForContentRecord: function(rec) { return this.itemViewForContent(rec); }
  
  
}) ;


