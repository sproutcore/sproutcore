// ========================================================================
// SproutCore
// copyright 2006-2007 Sprout Systems, Inc.
// ========================================================================

require('views/view') ;
require('views/label') ;

SC.BENCHMARK_UPDATE_CHILDREN = YES ;
SC.VALIDATE_COLLECTION_CONSISTANCY = NO ;

/** Indicates that selection points should be selected using horizontal 
  orientation.
*/
SC.HORIZONTAL_ORIENTATION = 'horizontal';

/** Selection points should be selected using vertical orientation. */
SC.VERTICAL_ORIENTATION = 'vertical' ;


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
*/
SC.CollectionView = SC.View.extend(
/** @scope SC.CollectionView.prototype */
{
  
  // ......................................
  // PROPERTIES
  //
  
  /**
    An array of content objects

    This array should contain the content objects you want the collection view 
    to display.  An item view (based on the exampleView view class) will be 
    created for each content object, in the order the content objects appear in
    this array.
    
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

    This array should contain the currently selected content objects.  
    It is modified automatically by the collection view when the user 
    changes the selection on the collection.

    Any item views representing content objects in this array will
    have their isSelected property set to YES automatically.
    
    The CollectionView can deal with selection arrays that contain content
    objects that do not belong to the content array itself.  Sometimes this
    will happen if you share the same selection across multiple collection
    views.
    
    Usually you will want to bind this property to a controller property
    that actually manages the selection for your display.
    
    @type Array
  */
  selection: [],
  
  /** @private */
  selectionBindingDefault: SC.Binding.Multiple,

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
    reflect the same value of this property.  Whenever isEditable is false, the
    user will not be able to reorder, add, or delete items regardless of the
    canReorderContent and canDeleteContent and isDropTarget properties.
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
  canDeleteContent: false,
  
  /** @private */
  canDeleteContentBindingDefault: SC.Binding.Bool,
  
  /**
    Accept drops for data other than reordering.
    
    Setting this property to return true when the view is instantiated will cause
    it to be registered as a drop target, activating the other drop machinery.
  */
  isDropTarget: false,
  
  /**
    Use toggle selection instead of normal click behavior.
    
    If set to true, then selection will use a toggle instead of the normal
    click behavior.  Command modifiers will be ignored and instead clicking
    once will enable an item and clicking on it again will disable it.
    
    @type Boolean
  */
  useToggleSelection: false,

  /**
    Delete views when the content object is removed from the content array.

    Whenever you remove a content object from the content array, the collection view
    will automatically remove the corresponding item view from the display.  If this
    property is set to true, that view will be subsequently deleted as well.
  
    If you set this property to false, then the collection view will store these
    unused views in a cache and reuse them later should the content object they 
    represent reappear in the content array.
  
    In general, you want to leave this property to true in order to keep your 
    memory usage under control.  However, if you are rendering a collection of 
    views that will change often, adding and removing the same content objects,
    then your collection view will be much faster if you set this to false.
  
    Most of the time, you will set this to false if you are rendering a collection
    of objects that may be filtered based on search criteria and you want to update
    the display very quickly.
  
    @type Boolean
  */
  flushUnusedViews: true,

  /**
    Trigger the action method on a single click.
  
    Normally, clicking on an item view in a collection will select the content 
    object and double clicking will trigger the action method on the collection
    view.  
  
    If you set this property to true, then clicking on a view will both select it
    (if isSelected is true) and trigger the action method.  
  
    Use this if you are using the collection view as a menu of items.
  
    @type {Boolean}
  */  
  actOnSelect: false,  

  /**
    Property key to use to group objects.
  
    If groupBy is set to a non-null value, then the collection view will
    automatically display item views in groups based on the value of the 
    passed property key.  The exampleGroupView will be used to display the 
    items in groups.
  
    If this property is set, you MUST ensure the items in the content array are
    already sorted by the group key.  Otherwise item view groups might appear more
    than once.
  
    @type {String}
  */
  groupBy: null,
  
  /**
    The view class to use when creating new item views.
  
    The collection view will automatically create an instance of the view class
    you set here for each item in its content array.  You should provide your own
    subclass for this property to display the type of content you want. 
  
    For best results, the view you set here should understand the following 
    properties:
  
    {{{
      content: The content object from the content array your view should display
      isEnabled: True if the view should appear enabled
      isSelected: True if the view should appear selected
    }}}
  
    In general you do not want your child views to actually respond to mouse and
    keyboard events themselves.  It is better to let the collection view do that.

    If you do implement your own event handlers such as mouseDown or mouseUp, you
    should be sure to actually call the same method on the collection view to
    give it the chance to perform its own selection housekeeping.
  
    @type {SC.View}
  */
  exampleView: SC.View,

  /**
    The view class to use when displaying item views in groups.
  
    If the groupBy property is not null, then the collection view will create
    an instance of this view class with the item views that belong to the group
    as child nodes for each distinct group value it encounters.
  
    Your groupView should have two outlets:
  
    {{{
      labelView: The view to display the group label.  The group value will be set 
      as the content property of this view.
    
      itemView: This is the view the item views will be added to as children to 
      this view.
    }}}
  
    If groupBy is null, then this property will not be used.  The default class
    provided here simply displays the group value in an H1 tag.
  
    @type {SC.View}
  */
  exampleGroupView: SC.View.extend({
    emptyElement: '<div><h1></h1><div class="well"></div></div>',
    outlets: ['labelView','itemView'],
    labelView: SC.LabelView.outletFor('h1?'),
    itemView: SC.View.outletFor('.well?')
  }),
  
  /**
    Invoked when the user double clicks on an item (or single clicks of actOnSelect is true)

    Set this to the name of the action you want to send down the
    responder chain when the user double clicks on an item (or single clicks if 
    actOnSelect is true).  You can optionally specify a specific target as well 
    using the target property.

    If you do not specify an action, then the collection view will also try to 
    invoke the action named on the target item view.
    
    Older versions of SproutCore expected the action property to contain an actual
    function that would be run.  This format is still supported but is deprecated 
    for future use.  You should generally use the responder chain to handle your
    action for you.
    
    @type {String}
  */  
  action: null,

  /**
    Optional target to send the action to when the user double clicks.
    
    If you set the action property to the name of an action, you can optionally
    specify the target object you want the action to be sent to.  This can be
    either an actual object or a property path that will resolve to an object at
    the time that the action is invoked.  
    
    This property is ignored if you use the deprecated approach of making the
    action property a function.
    
    @type {String|Object}
  */
  target: null,
  
  /**
    Set to true whenever the content changes and remains true until
    the content has been rerendered.  
    
    You can also set this to true yourself to be notified when it is completed.
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
    The property on content objects item views should display.
    
    Most built-in item views will respect this property.  You can also use it when writing 
    you own item views.
  */
  displayProperty: null,

  /**
    Enables keyboard-based navigate if set to true.
  */
  acceptsFirstResponder: false,

  /**
    If your layout uses a grid or horizontal-based layout, then make sure this 
    property is always up to date with the current number of items per row.  
    
    The CollectionView will use this property to support keyboard navigation 
    using the arrow keys.
    
    If your collection view is simply a vertical list of items then you do not need
    to edit this property.
  */
  itemsPerRow: 1,

  /**  
    Property returns all of the item views, regardless of group view.

    @property
    @returns {Array} the item views.
  */
  itemViews: function() {
    if (!this._itemViews) {
      var ret = [] ;
      var itemView = this._itemViewRoot ;
      while(itemView) {
        ret.push(itemView) ;
        itemView = itemView.__nextItemView ;
      }
      this._itemViews = ret ;
    }
    return this._itemViews;
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
    return !!this._itemViewsByGuid[SC.getGUID(view)] ;
  },

  /** 
    Find the item view underneath the passed mouse location.
    
    The default implementation of this method simply searches each item view's
    frame to find one that includes the location.  If you are doing your own
    layout, you may be able to perform this calculation more quickly.  If so,
    consider overriding this method for better performance during drag operations.
    
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
    
    This method will go up the view chain, starting with the view that was the target
    of the passed event, looking for a child item.  This will become the view that 
    is selected by the mouse event.
    
    This method only works for mouseDown & mouseUp events.  mouseMoved events do
    not have a target.
    
    @param {Event} evt An event
    
  */
  itemViewForEvent: function(evt)
  {
    var view = SC.window.firstViewForEvent( evt );
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
    
    @param {Object} obj The content object.  Should be a member of the content array.
    @returns {SC.View} The item view for this object or null if no match could be found.
  */
  itemViewForContent: function(obj) {
    return this._itemViewsByContent[SC.getGUID(obj)];
  },


  /**
    Debug returns the chain of item views.
  */
  _inspectItemViewChain: function() {
    var ret = [] ;
    var view = this._itemViewRoot ;
    while(view) {
      ret.push(view.get('content').get('guid')) ;
      view = view.__nextItemView ;
    }  
    return ret ;
  },
  
  // ......................................
  // GENERATING CHILDREN
  //
  
  /**
    Ensure that the displayed item views match the current set of content objects.
  
    This is the main entry point to the collection view layout system.  It is called
    anytime the collection view is scrolled, resized, or anytime its content changes.
    If you ever think the your child views might need to be relaidout for some reason.
    
    h3. How Updating Works
    
    Updates take place in three steps:
    
    Step 1: contentRangeInFrame() is called to determine the range of items to display.
    The default returns the entire range of content items.
    
    Step 2: updateChildren will make sure that itemViews exist for each child in the
    range.  It will also make sure each itemView belongs to the correct group view.
    
    Step 3: layoutItemViewsFor() will be called for each group.  You can use this 
    method to position your item views.
    
    You can override contentRangeInFrame() and layoutItemViewsFor() to provide support
    for incremental rendering.  See the documentation for those methods for info on how
    they should function.

    This method is called automatically whenever the content array changes.  You will
    not usually need to call it yourself.  If you want to refresh the item views,
    called rebuildChildren() instead.
    
    @param {Bool} quick (Optional) if set to true, assumes content has not changed and will update faster.
    
  */
  updateChildren: function(quick) {
    if (SC.BENCHMARK_UPDATE_CHILDREN) SC.Benchmark.start('%@.updateChildren()'.fmt(this));

    // if the collection is not presently visible in the window, then there is really 
    // nothing to do here.  Just mark the view as dirty and return.
    if (!this.get('isVisibleInWindow')) {
      this.set('isDirty', true) ;
      return; 
    }

    //console.log('updateChildren') ;
    
    // Save the current clipping frame.  If the frame methods are called again
    // later but the frame has not actually changed, we don't want to run
    // updateChildren again.
    if (this.get('hasCustomLayout')) this._lastClippingFrame = this.get('clippingFrame') ;
    
    this.beginPropertyChanges() ; // avoid sending notifications
    
    // STEP 0: Update frame size if needed.  Required to compute the clippingFrame.
    if (this.computeFrame !== SC.CollectionView.prototype.computeFrame) {
      var f = this.computeFrame() ;
      if (f && !SC.rectsEqual(f, this.get('frame'))) this.set('frame', f) ;
    }
    
    // STEP 1: Determine the range to display for clippingFrame
    var range = this.contentRangeInFrame(this.get('clippingFrame')) ;
    var lastRange = (quick) ? this._lastRange : { start: 0, end: 0 } ;
    this._lastRange = range ;
    
    var groupBy = this.get('groupBy') ;
    var hasGrouping = groupBy != null ;
    var didChange = false ;
    
    // STEP 2: Iterate through the content and itemViews to make sure they line up.
    
    // if the visible range has shifted downard, then remove any views that 
    didChange = this._updateItemViewChainWithContentRange(range, hasGrouping) ;

    // STEP 3: If grouping is enabled, iterate through the content and itemViews to 
    // make sure the itemViews belong to the correct group/parentNode.  This 
    // theoretically be integrated into the loop above but the cost of doing a second 
    // pass is less than 0.01msec and it significantly simplifies this code.
    if (hasGrouping) this._updateGroupViews(groupBy) ;
    if (didChange) this.updateSelectionStates() ;

    // Replace DOM if needed - this will unset any calles to removeRootElementFromDom()
    // in Steps 2 & 3.
    this._restoreRootElementInDom() ;

    // STEP 4: Incremental rendering stuff.  If any of these methods are implemented,
    // call them.   Set the computeFrameSize first.  Be sure to maintain the scroll offset
    // if possible.
    if (this.layoutItemViewsFor !== SC.CollectionView.prototype.layoutItemViewsFor) {
      var didChangeLayout = false ;
      
      if (hasGrouping) {
        var groupView = this.get('firstChild') ;
        while(groupView) {
          var ret = this.layoutItemViewsFor(groupView, groupView.get('firstChild')) ;
          if (!(ret === NO)) didChangeLayout = true ;
          groupView = groupView.get('nextSibling') ;
        }
      } else didChangeLayout = this.layoutItemViewsFor(this, this.get('firstChild')) ;
    } 

    // Recache frames just in case this changed the scroll height.
    this.recacheFrames() ;
    
    
    // Set this to true once children have been rendered.  Whenever the content
    // changes, we don't want resize or clipping frame changes to cause a refresh
    // until the content has been rendered for the first time.
    this._hasChildren = !!this._itemViewRoot ;
    
    this.set('isDirty',false); 
    this.endPropertyChanges() ;
    if (SC.BENCHMARK_UPDATE_CHILDREN) SC.Benchmark.end('%@.updateChildren()'.fmt(this)) ;
  },

  /**
    Rebuild all the child item views in the collection view.
    
    This will remove all the child views from the collection view and rebuild them
    from scratch.  This method is generally expensive, but if you have made a
    substantial number of changes to the content array, this may be the most efficient
    way to perform the update.
    
    In general the collection view will automatically keep the item views in sync
    with the content objects for you.  You should not need to call this method
    very often.
    
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
    Update the selection state for the item views to reflect the selection array.
    
    This will update the isSelected property of all item views so that only those
    representing content objects found in the selection array are selected.
    
    This method is called automatically whenever your content or selection properties
    changed.  You should not need to call or override it often.
  */
  updateSelectionStates: function() {
    if (!this._itemViews) return ;
    var selection = this.get('selection') || [];

    // First, for efficiency, turn the selection into a hash by GUID.  This 
    // way, we'll only have to perform a linear search over the children.
    // This hash is cached and flushed each time the selection changes.
    var selectionHash = this._selectionHash ;
    if (!selectionHash) {
      selectionHash = {} ;
      var idx = selection.get('length') ;
      while(--idx >= 0) selectionHash[SC.getGUID(selection.objectAt(idx))] = true ;
      this._selectionHash = selectionHash ;
    }

    // Iterate over the item views and set their selection property.
    var itemView = this._itemViewRoot ;
    while(itemView) {
      var content = itemView.get('content') ;
      var guid = (content) ? SC.getGUID(content) : null ;
      var isSelected = (guid) ? selectionHash[guid] : false ;
      if (itemView.get('isSelected') != isSelected) itemView.set('isSelected', isSelected) ;
      itemView = itemView.__nextItemView; 
    }
  },
    
  
  /**
    Calls updateChildren whenever the view is resized, unless you have not 
    implemented custom layout or incremental rendering.
  */
  resizeChildrenWithOldSize: function(oldSize) {
    if (this.get('hasCustomLayout')) {
      if (!SC.rectsEqual(this._lastClippingFrame, this.get('clippingFrame'))) {
        if (this._hasChildren) this.updateChildren() ;
      }
    } else {
      arguments.callee.base.apply(this, arguments) ;
    }
  },

  /**
    Whenever your clipping frame changes, determine new range to display.  If 
    new range is a change, then it will update the children and relayout.
  */
  clippingFrameDidChange: function() {
    if (this.get('hasCustomLayout')) {
      if (!SC.rectsEqual(this._lastClippingFrame, this.get('clippingFrame'))) {
        if (this._hasChildren) this.updateChildren() ;
      }
    }
  },
  
  /**
    Returns true if you implement any kind of custom layout or incremental 
    rendering.  This property is set once when your view is instantiated.
  */
  hasCustomLayout: function() {
    if (this._hasCustomLayout == null) {
      this._hasCustomLayout = 
        (this.contentRangeInFrame != SC.CollectionView.prototype.contentRangeInFrame) || 
        (this.layoutItemViewsFor != SC.CollectionView.prototype.layoutItemViewsFor) ||  
        (this.layoutChildViewsFor != SC.CollectionView.prototype.layoutChildViewsFor) ;
    }  
    return this._hasCustomLayout ;
  }.property(),
  
  /**
    Override to return the range of items to render for a given frame.

    You can override this method to implement support for incremenetal rendering.  The range
    you return here will be used to limit the number of actual item views that are created
    by the collection view.
    
    @param {Rect} frame The frame you should use to determine the range.
    
    @returns {Range} A hash that indicates the range of content objects to render.  ({ start: X, length: Y }) 
  */  
  contentRangeInFrame: function(frame) {
    var content = this.get('content') ;
    var len = ((content && content.get) ? content.get('length') : 0) || 0 ;
    return { start: 0, length: len };
  },
  
  /**
    Override to layout itemViews once they have been created.
    
    You can override this method to implement support for manually laying out 
    items in your collection.  Manually positioned collections are generally
    faster and often are also the only way you can support incremental rendering.

    In this method, you should position every view belonging to the parent view, beginning
    with the startingItemView.  startingItemView will always be a child of parentView.
    
    If you have grouping enabled, parentView will be the groupView the itemViews belongs to.
    Otherwise, the parentView will be the collection view itself.
    
    @param parentView {SC.View} the group view to layout or null
    @param startingItemView {SC.View} the first itemView to layout. 
  */
  layoutItemViewsFor: function(parentView, startingItemView) {},
  
  /**
    Override to return the computed frame dimensions of the collection view.
    
    These dimensions are automatically applied at the end of a call to updateChildren()
    if they change at all.  This method is critical for support of incremental rendering.
  
    @returns {Rect} width and/or height you want this collection view to have.
  */
  computeFrame: function() { return null; },

  // Ordered array of item views currently on display.  This array 
  // is reset whenever the content items is regenerated.
  _itemViews: null,

  // Hash of itemViews to the content guids they current represent.  This
  // only matches views in currently in the _itemViews array.
  _itemViewsByContent: null,
  
  // Hash of itemViews by their own guid.
  _itemViewsByGuid: null,

  // Root element in the chain of item view records.
  _itemViewRoot: null,
  _itemViewTail: null,

  // Pool of unused item views
  _itemViewPoolRoot: null,
  
  // Pool of unused group views.
  _groupViewPoolRoot: null,
  
  /** @private
    Finds or creates the itemView for the named content and inserts it into the
    view chain before the named view (or at the end of the chain if beforeView is 
    null)
    
    If an itemView matching the content is already found in the chain, then that
    itemView will simply be moved.  Note that this does not update the actual
    DOM membership.
    
    Returns the new itemView.
  */
  _insertItemViewInChainFor: function(content, beforeView) {
    
    //console.log('_insertItemViewInChainFor(%@,%@)'.fmt(content, beforeView));
    
    // first look for a matching record.
    var key = (content && content._guid) ? content._guid : '0' ;
    var ret = (content) ? this._itemViewsByContent[key] : null;

    // if no record was found, pull an item view from the pool or create one.
    // set the content.
    if (!ret) {
      
      // first try to get a view from the pool.  Note that the pool is a single
      // linked list.  the __prevItemView property is always null.
      if (this._itemViewPoolRoot) {
        ret = this._itemViewPoolRoot;
        this._itemViewPoolRoot = ret.__nextItemView ;
        ret.__nextItemView = null ;

      // if not found in pool, then create the record instead
      } else ret = this.get('exampleView').create({ owner: this }) ;
      
      // set content and add to content hash
      ret.set('content', content) ;
      this._itemViewsByContent[key] = ret ;
    }

    // OK, now add to itemView list.  If itemView is already in the right
    // place, do nothing.
    if (!ret) throw "Could not create itemView for content: %@".fmt(content);
    if (!beforeView || (ret.__nextItemView != beforeView)) {

      // remove from old location if needed
      if (this._itemViewRoot == ret) this._itemViewRoot = ret.__nextItemView ;
      if (this._itemViewTail == ret) this._itemViewTail = ret.__prevItemView ;
      if (ret.__nextItemView) ret.__nextItemView.__prevItemView = ret.__prevItemView ;
      if (ret.__prevItemView) ret.__prevItemView.__nextItemView = ret.__nextItemView ;

      // Insert at appropriate location.
      if (beforeView) {
        ret.__nextItemView = beforeView ;
        ret.__prevItemView = beforeView.__prevItemView ;
        if (beforeView.__prevItemView) beforeView.__prevItemView.__nextItemView = ret ;
        beforeView.__prevItemView = ret ;
      } else {
        ret.__prevItemView = this._itemViewTail;
        if (this._itemViewTail) this._itemViewTail.__nextItemView = ret ;
        this._itemViewTail = ret ;
      }
      if (this._itemViewRoot == beforeView) this._itemViewRoot = ret ;
      
    }
    
    this._itemViews = null ; // clear cached array.
    this.notifyPropertyChange('itemViews') ;
    
    if (!this._itemViewsByGuid) this._itemViewsByGuid = {} ;
    this._itemViewsByGuid[SC.getGUID(ret)] = ret ;
    return ret ;
  },

  // Removes the itemView from the chain, clearing its content and returning it to the 
  // pool for later use.  Returns the next item view that replaces it.
  _removeItemViewFromChain: function(itemView) {
    if (!itemView) return null ;

    //console.log('_removeItemViewFromChain(%@)'.fmt(itemView));

    // delete from guid hash
    if (!this._itemViewsByGuid) this._itemViewsByGuid = {} ;
    delete this._itemViewsByGuid[SC.getGUID(itemView)] ;
    
    // delete from content hash
    var content = itemView.get('content') ;
    var key = (content && content._guid) ? content._guid : '0' ;
    if (!this._itemViewsByContent) this._itemViewsByContent = {} ;
    delete this._itemViewsByContent[key] ;
    
    var ret = itemView.__nextItemView ;
    
    // remove itemView from current chain.
    if (this._itemViewRoot === itemView) this._itemViewRoot = itemView.__nextItemView ;
    if (this._itemViewTail === itemView) this._itemViewTail = itemView.__prevItemView ;
    if (itemView.__nextItemView) itemView.__nextItemView.__prevItemView = itemView.__prevItemView ;
    if (itemView.__prevItemView) itemView.__prevItemView.__nextItemView = itemView.__nextItemView ;
    
    // clear content of itemView, remove from parent view.
    itemView.removeFromParent() ;
    itemView.set('content', null) ;
    
    // now add itemView to the pool.
    itemView.__prevItemView = null ; // ignored for pool
    itemView.__nextItemView = this._itemViewPoolRoot ;
    this._itemViewPoolRoot = itemView ;
    
    // clear cached array
    this._itemViews = null ;
    this.notifyPropertyChange('itemViews') ;
    
    // return the next itemView in the chain
    return ret ;
  },

  /** @private
    Returns the groupValue for the current groupView.  If groupView is null, returns
    null.
  */
  _groupValueForGroupView: function(groupView) {
    if (groupView == null) return null ;
    if (groupView.groupValue !== undefined) return groupView.get('groupValue') ;
    return (groupView.labelView) ? groupView.labelView.get('content') : null ;
  },
  
  /** @private
    Creates a new groupView for the specified groupValue and inserts it into the receiver
    before the passed groupView.  This will pull from the groupView pool if possible.
  */
  _insertGroupViewFor: function(groupValue, beforeGroup) {
    
    // try to get a groupView from the pool
    var ret = this._groupViewPoolRoot ;
    if (ret) {
      this._groupViewPoolRoot = ret.__nextGroupView ;
      ret.__nextGroupView = null ;
      
    // otherwise, create a new group view
    } else ret = this.get('exampleGroupView').create({ owner: this }) ;
    if (!ret) throw "Could not create a groupView for value: %@".fmt(groupValue) ;
    
    // set the groupValue on the groupView.  Older groupViews expect us to set 
    // this directly on the labelView.  Newer groupViews should have a groupValue property.
    if (ret.groupValue !== undefined) {
      ret.set('groupValue', groupValue) ;
    } else if (ret.labelView) ret.labelView.set('content', groupValue) ;
    
    // now add groupView to receiver as a child
    this.insertBefore(ret, beforeGroup) ;
    
    // done!
    return ret ;
  },
  
  /** @private
    Removes an unneeded groupView from the receiver and (places it back in the pool. 
    This will not actually remove any itemViews from the group.  We assume those have
    been cleaned out already.
  */
  _removeGroupView: function(groupView) {
    
    var ret = groupView.get('nextSibling') ;
    groupView.removeFromParent() ;

    // clear the groupValue.  see _insertGroupView() for info on why this is complicated.
    if (groupView.groupValue !== undefined) {
      groupView.set('groupValue', null) ;
    } else if (groupView.labelView) groupView.labelView.set('content', null) ;
    
    // add groupView to the pool for later use.
    groupView.__nextGroupView = this._groupViewPoolRoot ;
    this._groupViewPoolRoot = groupView ;
    
    // return the next sibling
    return ret ;
  },
  
  /** @private
    Removes the rootElement from the DOM temporarily if needed to optimize performance.
  */
  _removeRootElementFromDom: function() {
    // if (this._cachedRootElementParent === undefined) {
    //   var parent = this._cachedRootElementParent = this.rootElement.parentNode ;
    //   this._cachedRootElementNextSibling = this.rootElement.nextSibling ;
    //   if (parent) parent.removeChild(this.rootElement) ;
    // }
  },
  
  /** @private
    Re-adds root element into DOM if necessary.  Inverts _removeRootElementFromDom().
  */
  _restoreRootElementInDom: function() {
    // if (this._cachedRootElementParent) {
    //   this._cachedRootElementParent.insertBefore(this.rootElement, this._cachedRootElementNextSibling);
    // }
    // this._cachedRootElementParent = this._cachedRootElementNextSibling = null ;
  },
  
  _updateItemViewChainWithContentRange: function(range, hasGrouping) {
    var content = Array.from(this.get('content'));
    var contentIdx = range.start ;  
    var maxContentIdx = Math.min(range.start + range.length, content.get('length'));
    var cur = null ; // the current content object
    var itemView = this._itemViewRoot ;
    var didChange = false ;
  
    while(itemView || (contentIdx < maxContentIdx)) {
    
      // if we should have content, get the content and make sure it matches up
      // if they do not match or there is no itemView, insert one.
      if (contentIdx < maxContentIdx) {
        cur = content.objectAt(contentIdx++) ;
        if (!itemView || (cur !== itemView.get('content'))) {
          itemView = this._insertItemViewInChainFor(cur, itemView);
          didChange = true ;
          
          // if grouping is turned off, go ahead and add the itemView to the parent so
          // we can avoid STEP 3 altogether.
          if (!hasGrouping) {
            var nextSibling = (itemView.__beforeItemView) ? itemView.__beforeItemView.get('nextSibling') : this.get('firstChild') ;
            if ((itemView.get('parentNode') != this) || ((nextSibling != itemView) && (itemView.get('nextSibling') != nextSibling))) {
              this._removeRootElementFromDom() ;
              this.insertBefore(itemView, itemView.__nextItemView) ;
            }
          }
        }

        // get the next itemView.
        itemView = (itemView) ? itemView.__nextItemView : null ;
        
      // if we are out of content but there are itemViews left, remove them.
      } else if (itemView) {
        this._removeRootElementFromDom() ;
        itemView = this._removeItemViewFromChain(itemView) ;
        didChange = true ;
      } 
      
    }
    
    if (SC.VALIDATE_COLLECTION_CONSISTANCY) {
      console.log('validate') ;
      var contentIdx = range.start ;  
      var maxContentIdx = Math.min(range.start + range.length, content.get('length'));
      var itemView = this._itemViewRoot ;
      while(contentIdx < maxContentIdx) {
        if (!itemView || (itemView.get('content') != content.objectAt(contentIdx++))) {
          console.log('collection inconsistancy at %@'.fmt(contentIdx-1)) ;
          debugger ;
        }
        itemView = itemView.__nextItemView ;
      }
      
      if (this._itemViewRoot.__prevItemView != null) {
        console.log('collection rootItemView inconsistancy') ;
        debugger ;
      }
      
      if (this._itemViewTail.__nextItemView != null) {
        console.log('collection tailItemView inconsistancy') ;
        debugger ;
      }
    }
    
    return didChange ;
  },
  
  _updateGroupViews: function(groupBy) {
    var curGroupView = null ;
    var curGroupValue = null ;
    var groupValue, groupView ;

    var cur = null ; // the current content object
    var itemView = this._itemViewRoot ;
    while(itemView) {
      
      // find the group value for this item.
      cur = itemView.get('content') ;
      groupValue = (cur && cur.get) ? cur.get(groupBy) : null ; 

      // if the groupValue does not match the current group value, then 
      // try to get the next group view.  If the next group view does not match
      // either, then get a new groupView.
      if (!curGroupView || (groupValue != curGroupValue)) {
        groupView = (curGroupView) ? curGroupView.get('nextSibling') : this.get('firstChild') ;
        if (this._groupValueForGroupView(groupView) !== groupValue) {
          this._removeRootElementFromDom() ;
          groupView = this._insertGroupViewFor(groupValue, groupView) ;
        }
      } else groupView = curGroupView ;
      
      // now make sure that the itemView actually belongs to the groupView and comes after
      // the previous view.  If groupView is changing from last groupView then the itemView 
      // belongs at the top of the group.
      //
      // We look at the prevSibling because it has always been processed.
      //
      var container = groupView.itemView || groupView ;
      var prevSibling = (groupView == curGroupView) ? itemView.__prevItemView : null ;
      if ((itemView.parentNode !== container) || (itemView.get('previousSibling') !== prevSibling)) {
        // no match, add itemView to the proper location.
        var nextSibling = (prevSibling) ? prevSibling.get('nextSibling') : container.get('firstChild');
        this._removeRootElementFromDom() ;
        container.insertBefore(itemView, nextSibling) ;  
      }
      
      // save groupView and groupValue, get next itemView
      curGroupView = groupView ;
      curGroupValue = curGroupValue ;
      itemView = itemView.__nextItemView ;
    }
    
    // if there are extra groupViews still in the receiver, then remove them.
    groupView = (curGroupView) ? curGroupView.get('nextSibling') : this.get('firstChild') ;
    while(groupView) groupView = this._removeGroupView(groupView) ;
  },
    
  // ......................................
  // SELECTION
  //

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
    extending the current selection.  Also scrolls the selected item into view.
    
    Selection does not wrap around.
    
    @param extend {Boolean} (Optional) If true, the selection will be extended instead of replaced.  Defaults to false.
    @param numberOfItems {Integer} (Optional) The number of previous to be selected.  Defaults to 1
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
        selBottom-- ;
        
      // otherwise, select the previous item from the top 
      } else {
        selTop-- ;
      }
      
      // Ensure we are not out of bounds
      if (selTop < 0) selTop = 0 ;
      if (selBottom < selTop) selBottom = selTop ;
      
    // if not extending, just select the item previous to the selTop
    } else {
      selTop = this._indexOfSelectionTop() - 1;
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
      this.scrollToItemRecord(items.first());
      this.selectItems(items);
    }
    
    this._selectionAnchor = anchor ;
  },
  
  /**
    Select one or more items folling the current selection, optionally
    extending the current selection.  Also scrolls to selected item.

    Selection does not wrap around.
    
    @param extend {Boolean} (Optional) If true, the selection will be extended instead of replaced.  Defaults to false.
    @param numberOfItems {Integer} (Optional) The number of items to be selected.  Defaults to 1.
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
        selTop++ ;
        
      // otherwise, select the next item after the top 
      } else {
        selBottom++ ;
      }
      
      // Ensure we are not out of bounds
      if (selBottom >= contentLength) selBottom = contentLength-1;
      if (selTop > selBottom) selTop = selBottom ;
      
    // if not extending, just select the item next to the selBottom
    } else {
      selBottom = this._indexOfSelectionBottom() + 1;
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
      this.scrollToItemRecord(items.first());
      this.selectItems(items);
    }
    
    this._selectionAnchor = anchor ;
  },
  
  /**
  * Scroll the rootElement (if needed) to ensure that the item is visible.
  * @param {SC.Record} record The record to scroll to
  * @returns {void}
  */
  scrollToItemRecord: function( record )
  {
    this.scrollToItemView( this.itemViewForContent(record) );
  },
  /**
  * Scroll the rootElement (if needed) to ensure that the item is visible.
  * @param {SC.View} view The item view to scroll to
  * @returns {void}
  */
  scrollToItemView: function( view )
  {
    var visible       = Element.extend(this.get('rootElement'));
    var visibleTop    = visible.scrollTop;
    var visibleBottom = visibleTop + visible.getHeight();
    
    visible.makePositioned();
    
    var item       = Element.extend(view.get('rootElement'));
    var itemTop    = item.positionedOffset().top;
    var itemBottom = itemTop + item.getHeight();

    visible.undoPositioned();
    
    if (itemTop < visibleTop) {
      visible.scrollTop = itemTop;
    }
    if (itemBottom > visibleBottom) {
      visible.scrollTop += (itemBottom - visibleBottom);
    }
  },

  /** 
    Selects the passed array of items, optionally extending the
    current selection.
    
    @param items {Array} The item or items to select.
    @param extendSelection {Boolean} If true, extends the selection instead of replacing it.
  */
  selectItems: function(items, extendSelection) {
    var base = (extendSelection) ? this.get('selection') : [] ;
    var sel = [items].concat(base).flatten().uniq() ;
    
    // if you are not extending the selection, then clear the selection anchor.
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
  
  // ......................................
  // EVENT HANDLING
  //

  keyDown: function(evt) {
    return this.interpretKeyEvents(evt) ;
  },
  
  keyUp: function() { return true; },

  /** @private
    Selects the same item on the next row.  Or moves down one if 
    itemsPerRow = 1
  */
  moveDown: function(sender, evt) {
    this.selectNextItem(false, this.get('itemsPerRow') || 1) ;
    return true ;
  },
  
  /** @private
    Selects the same item on the next row.  Or moves up one if 
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
    if ((this.get('itemsPerRow') || 1) > 1) this.selectNextItem(false, 1) ;
    return true ;
  },

  /** @private
    Selects the next item if itemsPerRow > 1.  Otherwise does nothing.
  */
  moveRight: function(sender, evt) {
    if ((this.get('itemsPerRow') || 1) > 1) this.selectPreviousItem(false, 1) ;
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
    if ((this.get('itemsPerRow') || 1) > 1) this.selectNextItem(true, 1) ;
    return true ;
  },

  /** @private
    Selects the next item if itemsPerRow > 1.  Otherwise does nothing.
  */
  moveRightAndModifySelection: function(sender, evt) {
    if ((this.get('itemsPerRow') || 1) > 1) this.selectPreviousItem(true, 1) ;
    return true ;
  },

  mouseDown: function(ev) {

    // save for drag opt
    this._mouseDownEvent = ev ;

    // Toggle selection only triggers on mouse up.  Do nothing.
    if (this.useToggleSelection) return true;

    // Make sure that saved mouseDown state is always reset in case we do
    // not get a paired mouseUp. (Only happens if subclass does not call us like it should)
    this._mouseDownAt = this._shouldDeselect = 
      this._shouldReselect = this._refreshSelection = false;

    var mouseDownView    = this._mouseDownView = this.itemViewForEvent(ev);
    var mouseDownContent = 
      this._mouseDownContent = (mouseDownView) ? mouseDownView.get('content') : null;

    // become first responder if possible.
    this.becomeFirstResponder() ;
    
    // recieved a mouseDown on the collection element, but not on one of the childItems... bail
    if (!mouseDownView) {
      if (this.get('allowDeselectAll')) this.selectItems([], false);
      return true ;
    }

    // collection some basic setup info
    var selection  = this.get('selection') || [];
    var isSelected = selection.include(mouseDownContent);
    var modifierKeyPressed = ev.ctrlKey || ev.altKey || ev.metaKey;
    if (mouseDownView.checkboxView && (Event.element(ev) == el.checkboxView.rootElement)) {
      modifierKeyPressed = true ;
    } 

    this._mouseDownAt = Date.now();

    // holding down a modifier key while clicking a selected item should deselect that item...
    // deselect and bail.
    if (modifierKeyPressed && isSelected) {
      this._shouldDeselect = mouseDownContent;
    
    // if the shiftKey was pressed, then we want to extend the selection
    // from the last selected item
    } else if (ev.shiftKey && selection.get('length') > 0) {
      selection = this._findSelectionExtendedByShift(selection, mouseDownContent) ;
      this.selectItems(selection) ;
      
    // If no modifier key was pressed, then clicking on the selected item should clear
    // the selection and reselect only the clicked on item.
    } else if (!modifierKeyPressed && isSelected) {
      this._shouldReselect = mouseDownContent;
      
    // Otherwise, simply select the clicked on item, adding it to the current
    // selection if a modifier key was pressed.
    } else {
      this.selectItems(mouseDownContent, modifierKeyPressed);
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
      if (this._shouldDeselect) this.deselectItems(this._shouldDeselect);
      if (this._shouldReselect) this.selectItems(this._shouldReselect,false) ;

      // this is invoked if the user clicked on a checkbox.  If this is not 
      // done then the checkbox might not update properly.
      if (this._refreshSelection) {
      }
      this._cleanupMouseDown() ;
    }

    this._mouseDownEvent = null ;
    if (canAct) this._action(ev, view) ;
    
    return false;  // bubble event to allow didDoubleClick to be called...
  },
  
  _cleanupMouseDown: function() {
    this._mouseDownAt = this._shouldDeselect = this._shouldReselect = this._refreshSelection = false;
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
  
  // invoked when the user double clicks on an item.
  didDoubleClick: function(ev) {
    console.warn("didDoubleClick will be removed from CollectionView in the near future. Use mouseOut instead");
    return this._doubleClick(ev) ;
  },
  
  doubleClick: function(ev) {
    if (this.didDoubleClick != SC.CollectionView.prototype.didDoubleClick) {
      return this.didDoubleClick(ev) ;
    } else return this._doubleClick(ev) ;
  },
  
  _doubleClick: function(ev) {
    console.info('_doubleClick!') ;
    var view = this.itemViewForEvent(ev) ;
    if (view) {
      this._action(view, ev) ;
      return true ;
    } else return false ;
  },

  _findSelectionExtendedByShift: function(selection, mouseDownContent) {
    var collection = this.get('content');

    // bounds of the collection...
    var collectionLowerBounds = 0;
    var collectionUpperBounds = (collection.get('length') - 1);

    var selectionBeginIndex = collection.indexOf(selection.first());
    var selectionEndIndex   = collection.indexOf(selection.last());

    var previousMouseDownIndex = collection.indexOf(this._previousMouseDownContent);
    // _previousMouseDownContent couldn't be found... either it hasn't been set yet or the record has been deleted by the user
    // fall back to the first selected item.
    if (previousMouseDownIndex == -1) previousMouseDownIndex = selectionBeginIndex;


    var currentMouseDownIndex = collection.indexOf(mouseDownContent);
    // sanity check...
    if (currentMouseDownIndex == -1) throw "Unable to extend selection to an item that's not in the collection!";

    // clicked before the current selection set... extend it's beginning...
    if (currentMouseDownIndex < selectionBeginIndex) selectionBeginIndex = currentMouseDownIndex;
    // clicked after the current selection set... extend it's ending...
    if (currentMouseDownIndex > selectionEndIndex) selectionEndIndex = currentMouseDownIndex;
    // clicked inside the selection set... need to determine where the las
    if ((currentMouseDownIndex > selectionBeginIndex) && (currentMouseDownIndex < selectionEndIndex))
    {
      if (currentMouseDownIndex == previousMouseDownIndex) {
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

    // shouldn't need to sanity check that the selection is in bounds due to the indexOf checks above...
    // I'll have faith that indexOf hasn't lied to me...
    return collection.slice(selectionBeginIndex, selectionEndIndex);
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
    
    The default implementation will loop through the item views looking for 
    the first view to "switch sides" in the orientation you specify.
  */
  insertionIndexForLocation: function(loc) {  
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
    
    @param {SC.View} itemView view the insertion point should appear directly before. If null, show insertion point at end.
    
    @returns {void}
  */
  showInsertionPointBefore: function(itemView) {},
  
  /**
    Override to hide the insertion point when a drag ends.
    
    Called during a drag to hide the insertion point.  This will be called when the
    user exits the view, cancels the drag or completes the drag.  It will not be 
    called when the insertion point changes during a drag.
    
    You should expect to receive one or more calls to showInsertionPointBefore()
    during a drag followed by at least one call to this method at the end.  Your
    method should not raise an error if it is called more than once.
    
    @returns {void}
  */
  hideInsertionPoint: function() {},

  /**
    Override this method to provide your own ghost image for a drag.  
    
    Note that the only purpose of this view is to render a visible drag element.  It is
    not critical that you make this element bindable, etc.
    
    @param dragContent {Array} Array of content objects that will be used in the drag.
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
      var dom = itemView.rootElement ;
      if (!dom) continue ;
      
      // save the maxX & maxY.  This will be used to trim the size 
      // of the ghost view later.
      if (SC.maxX(f) > maxX) maxX = SC.maxX(f) ;
      if (SC.maxY(f) > maxY) maxY = SC.maxY(f) ;
      if (SC.minX(f) < minX) minX = SC.minX(f) ;
      if (SC.minY(f) < minY) minY = SC.minY(f) ;

      // Clone the contents of this node.  We should probably apply the 
      // computed style to the cloned nodes in order to make sure they match even if the 
      // CSS styles do not match.  Make sure the items are properly 
      // positioned.
      dom = dom.cloneNode(true) ;
      Element.setStyle(dom, { position: "absolute", left: "%@px".fmt(f.x), top: "%@px".fmt(f.y), width: "%@px".fmt(f.width), height: "%@px".fmt(f.height) }) ;
      view.rootElement.appendChild(dom) ;
    }

    // Now we have a view, create another view that will wrap the other view and position it 
    // inside.
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
  
  mouseDragged: function(ev) {
    // Don't do anything unless the user has been dragging for 123msec
    if ((Date.now() - this._mouseDownAt) < 123) return true ;
    
    // OK, they must be serious, start a drag if possible. 
    if (this.get('canReorderContent')) {

      // First, get the selection to drag.  Drag an array of selected
      // items appearing in this collection, in the order of the 
      // collection.
      var content = this.get('content') || [] ;
      var dragContent = this.get('selection').sort(function(a,b) {
        a = content.indexOf(a) ; b = content.indexOf(b) ;
        return (a<b) ? -1 : ((a>b) ? 1 : 0) ;
      });

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
        data: { "_mouseDownContent": dragContent }
      }) ; 
      
      // Also use this opportunity to clean up since mouseUp won't 
      // get called.
      this._cleanupMouseDown() ;
      this._lastInsertionIndex = null ;
    }
  },
  
  // Drop Source. 
  dragEntered: function(drag, evt) {
    if ((drag.get('source') == this) && this.get('canReorderContent')) {
      return SC.DRAG_MOVE ;
    } else {
      return SC.DRAG_NONE ;
    }
  },
  
  // If reordering is allowed, then show insertion point
  dragUpdated: function(drag, evt) {
    if (this.get('canReorderContent')) {
      var loc = drag.get('location') ;
      loc = this.convertFrameFromView(loc, null) ;
      
      // get the insertion index for this location.  This can be computed
      // by a subclass using whatever method.  This method is not expected to
      // do any data valdidation, just to map the location to an insertion index.
      var ret = this.insertionIndexForLocation(loc) ;

      // now that we have an index, find the nearest index that we can actually
      // insert at, or do not allow.
      var objects = (drag.source == this) ? (drag.dataForType('_mouseDownContent') || []) : [];
      var content = this.get('content') || [] ;

      // if the insertion index is in between two items in the drag itself, then this is
      // not allowed.  Either use the last insertion index or find the first index that is not 
      // in between selections.
      var isPreviousInDrag = (ret > 0) ? objects.indexOf(content.objectAt(ret-1)) : -1 ;
      var isNextInDrag = (ret < content.get('length')-1) ? objects.indexOf(content.objectAt(ret)) : -1 ;
      if (isPreviousInDrag>=0 && isNextInDrag>=0) {
        if (this._lastInsertionIndex == null) {
          while((ret > 0) && (objects.indexOf(content.objectAt(ret)) >= 0)) ret-- ;
        } else ret = this._lastInsertionIndex ;
      }
      
      // Now that we have verified that, check to see if a drop is allowed in the 
      // insertion index with the delegate.
      // TODO

      if (this._lastInsertionIndex != ret) {
        var itemView = this.itemViewForContent(this.get('content').objectAt(ret));
        this.showInsertionPointBefore(itemView) ;
      }
      this._lastInsertionIndex = ret ;
      
    }
    return SC.DRAG_MOVE;  
  },

  dragExited: function() {
    this.hideInsertionPoint() ;
    this._lastInsertionIndex = null ;
  },
  
  dragEnded: function() {
    this.hideInsertionPoint() ;
    this._lastInsertionIndex = null ;
  },
  
  prepareForDragOperation: function(op, drag) { 
    return SC.DRAG_ANY; 
  },
  
  performDragOperation: function(op, drag) { 
    
    SC.Benchmark.start('%@ performDragOperation'.fmt(this._guid)) ;
    
    var loc = drag.get('location') ;
    loc = this.convertFrameFromView(loc, null) ;
    
    // if op is MOVE or COPY, add item to view.
    var objects = drag.dataForType('_mouseDownContent') ;
    if (objects && (op == SC.DRAG_MOVE)) {

      // find the index to for the new insertion 
      var idx = this.insertionIndexForLocation(loc) ;

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
    }
    
    SC.Benchmark.end('%@ performDragOperation'.fmt(this._guid)) ;
    console.log(SC.Benchmark.report()) ;
    
    return SC.DRAG_MOVE; 
  },
  
  concludeDragOperation: function(op, drag) {
    this.hideInsertionPoint() ;
    this._lastInsertionIndex = null ;
  },
    


  // ......................................
  // INTERNAL
  //
  
  init: function() {
    this._itemViewsByContent = {} ;
    arguments.callee.base.apply(this, arguments) ;
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
    this._contentPropertyObserver(this, '[]', content, content.propertyRevision) ; 
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
    this._selectionPropertyObserver(this, '[]', sel, sel.propertyRevision) ;
  }.observes('selection'),
  
  // called on content change *and* content.[] change...
  // update children if this is a new propertyRevision
  _contentPropertyObserver: function(target, key, value, rev) {
    if (!this._updatingContent && (!rev || (rev != this._contentPropertyRevision))) {
      this._contentPropertyRevision = rev ;
      this._updatingContent = true ;
      this._hasChildren = false ;
      this.updateChildren() ;
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


