// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2009 Sprout Systems, Inc. and contributors.
//            Portions ©2008-2009 Apple, Inc. All rights reserved.
// License:   Licened under MIT license (see license.js)
// ==========================================================================

sc_require('mixins/collection_view_delegate') ;
sc_require('views/list_item');

SC.BENCHMARK_UPDATE_CHILDREN = YES ;
SC.BENCHMARK_RENDER = YES ;
SC.ENABLE_COLLECTION_PARTIAL_RENDER = YES ;
SC.DEBUG_PARTIAL_RENDER = NO ;
SC.SANITY_CHECK_PARTIAL_RENDER = YES ;
SC.VALIDATE_COLLECTION_CONSISTANCY = NO ;

/**
  Special drag operation passed to delegate if the collection view proposes
  to perform a reorder event.
*/
SC.DRAG_REORDER = 0x0010 ;

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
  
  @extends SC.ClassicView
  @extends SC.CollectionViewDelegate
  
*/
SC.CollectionView = SC.View.extend(SC.CollectionViewDelegate,
/** @scope SC.CollectionView.prototype */ 
{
  
  classNames: ['sc-collection-view'],
  
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
    
    @type SC.Array
  */
  content: [],
  
  /** @private */
  contentBindingDefault: SC.Binding.multiple(),
  
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
  selectionBindingDefault: SC.Binding.multiple(),
  
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
    Allow user to select content using the mouse and keyboard.
    
    Set this property to NO to disallow the user from selecting items. If you 
    have items in your selection property, they will still be reflected
    visually.
    
    @type Boolean
  */
  isSelectable: YES,
  
  /** @private */
  isSelectableBindingDefault: SC.Binding.bool(),
  
  /**
    Enable or disable the view.  
    
    The collection view will set the isEnabled property of its item views to
    reflect the same view of this property.  Whenever isEnabled is false,
    the collection view will also be not selectable or editable, regardless of 
    the settings for isEditable & isSelectable.
    
    @type Boolean
  */
  isEnabled: YES,
  
  /** @private */
  isEnabledBindingDefault: SC.Binding.bool(),
  
  /**
    Allow user to edit content views.
    
    The collection view will set the isEditable property on its item views to
    reflect the same value of this property.  Whenever isEditable is false, 
    the user will not be able to reorder, add, or delete items regardless of 
    the canReorderContent and canDeleteContent and isDropTarget properties.
    
    @type Boolean
  */
  isEditable: YES,
  
  /** @private */
  isEditableBindingDefault: SC.Binding.bool(),
  
  /**
    Allow user to reorder items using drag and drop.
    
    If true, the user will can use drag and drop to reorder items in the list.
    If you also accept drops, this will allow the user to drop items into 
    specific points in the list.  Otherwise items will be added to the end.
    
    @type Boolean
  */
  canReorderContent: NO,
  
  /** @private */
  canReorderContentBindingDefault: SC.Binding.bool(),
  
  /**
    Allow the user to delete items using the delete key
    
    If true the user will be allowed to delete selected items using the delete
    key.  Otherwise deletes will not be permitted.
    
    @type Boolean
  */
  canDeleteContent: NO,
  
  /** @private */
  canDeleteContentBindingDefault: SC.Binding.bool(),
  
  /**
    Accept drops for data other than reordering.
    
    Setting this property to return true when the view is instantiated will 
    cause it to be registered as a drop target, activating the other drop 
    machinery.
    
    @type Boolean
  */
  isDropTarget: NO,
  
  /**
    Use toggle selection instead of normal click behavior.
    
    If set to true, then selection will use a toggle instead of the normal
    click behavior.  Command modifiers will be ignored and instead clicking
    once will select an item and clicking on it again will deselect it.
    
    @type Boolean
  */
  useToggleSelection: NO,
  
  /**
    Trigger the action method on a single click.
    
    Normally, clicking on an item view in a collection will select the content 
    object and double clicking will trigger the action method on the 
    collection view.
    
    If you set this property to YES, then clicking on a view will both select 
    it (if isSelected is true) and trigger the action method.  
    
    Use this if you are using the collection view as a menu of items.
    
    @property {Boolean}
  */  
  actOnSelect: NO,
  
  
  /**
    Select an item immediately on mouse down
    
    Normally as soon as you begin a click the item will be selected.
    
    In some UI scenarios, you might want to prevent selection until
    the mouse is released, so you can perform, for instance, a drag operation
    without actually selecting the target item.  
    
    @property {Boolean}
  */  
  selectOnMouseDown: YES,
  
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
    
    @property {SC.View}
  */
  exampleView: SC.ListItemView,
  
  /**
    If set, this key will be used to get the example view for a given
    content object.  The exampleView property will be ignored.
    
    @property {String}
  */
  contentExampleViewKey: null,
  
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
    
    @property {String}
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
    
    @property {String|Object}
  */
  target: null,
  
  /**
    Set to YES whenever the content needs to update its children.  If you 
    set this property, it will cause the view to update its children at the
    end of the runloop or the next time it becomes visible.
    
    Generally you will not need to change this property.  Instead you should
    call methods such as contentPropertyDidChange() or updateChildren()
    directly instead.
    
    @property {Boolean}
  */
  isDirty: NO,
  
  /** 
    Property on content items to use for display.
    
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
    
    @property {String}
  */
  contentValueKey: null,
  
  /**
    Enables keyboard-based navigate, deletion, etc. if set to true.
  */
  acceptsFirstResponder: NO,
  
  /**
    If your layout uses a grid or horizontal-based layout, then make sure this 
    property is always up to date with the current number of items per row.  
    
    The CollectionView will use this property to support keyboard navigation 
    using the arrow keys.
    
    If your collection view is simply a vertical list of items then you do not 
    need to change this property.
    
    @property {Number}
  */
  itemsPerRow: 1,
  
  // ..........................................................
  // SUBCLASS METHODS
  // 
  
  /**
    Override to return the computed layout dimensions of the collection view.
    You can omit any dimensions you don't care about setting in your 
    computed value.
    
    This layout is automatically applied whenever the content changes.
    
    If you don't care about computing the layout at all, you can return null.
    
    @returns {Hash} layout properties
  */
  computeLayout: function() { return null; },
  
  /**
    Override to return the range of items to render for a given frame.
    
    You can override this method to implement support for incremenetal 
    rendering.  The range you return here will be used to limit the number of 
    actual item views that are created by the collection view.
    
    If you do not want to support incremental rendering, just return null.
    
    @param {Rect} frame The frame you should use to determine the range.
    @returns {Range} A hash that indicates the range of content objects to 
      render.  ({ start: X, length: Y }) 
  */  
  contentRangeInFrame: function(frame) { return null; },
  
  /**
    Override to compute the layout of the itemView for the content at the 
    specified index.  This layout will be applied to the view just before it
    is rendered.
    
    @param {Number} contentIndex the index of content beind rendered by
      itemView
    @returns {Hash} a view layout
  */
  itemViewLayoutAtContentIndex: function(contentIndex) {
    throw "itemViewLayoutAtContentIndex must be implemented";
  },
  
  // ..........................................................
  // CONTENT CHANGES
  // 
  
  /** @private
    Whenever content array changes, start observing the [] property.  Also 
    call the contentPropertyDidChange handler.
  */
  _collection_contentDidChange: function() {
    var content = this.get('content') ;
    if (content === this._content) return this; // nothing to do
    
    var func = this._collection_contentPropertyDidChange ;
    
    // remove old observer, add new observer
    if (this._content) this._content.removeObserver('[]', this, func) ;
    if (content) content.addObserver('[]', this, func) ;
    
    // cache
    this._content = content;
    this._contentPropertyRevision = null ;
    
    // trigger property change handler...
    var rev = (content) ? content.propertyRevision : -1 ;
    this._collection_contentPropertyDidChange(this, '[]', content, rev) ; 
  }.observes('content'),
  
  /** @private
    Called whenever the content array or any items in the content array 
    changes. mark view as dirty.
  */
  _collection_contentPropertyDidChange: function(target, key, value, rev) {    
    if (!this._updatingContent && (!rev || (rev != this._contentPropertyRevision))) {
      this._contentPropertyRevision = rev ;
      this._updatingContent = true ;
      this.contentPropertyDidChange(target, key);
      this._updatingContent = false ;
    }
  },
  
  /**
    Invoked whenever a the content array changes.  The default implementation
    will possibly recompute the view's layout size and the marks it as dirty
    so that it can update its children.
  */
  contentPropertyDidChange: function(target, key) {
    this.adjust(this.computeLayout()) ;
    this.set('isDirty', YES) ;
    this.invalidateNowShowingRange() ;
    return this ;
  },
  
  /** @private
    Anytime isDirty changes to YES or our visibility in window changes,
    schedule a full update.
  */
  _collection_isDirtyDidChange: function() {
    // don't test isVisibleInWindow here for a 10% perf gain
    if (this.get('isDirty')) {
      // using invokeOnce here doubles rendering speed!
      this.invokeOnce(this.displayDidChange) ;
    }
  }.observes('isDirty', 'isVisibleInWindow'),
  
  // ..........................................................
  // SELECTION CHANGES
  // 
  
  /** @private
    Whenever selection array changes, start observing the [] property.  Also 
    set childrenNeedFullUpdate to YES, which will trigger an update.
  */
  _collection_selectionDidChange: function() {
    var selection = this.get('selection') ;
    if (selection === this._selection) return this; // nothing to do
    
    var func = this._collection_selectionPropertyDidChange ;
    
    // remove old observer, add new observer
    if (this._selection) this._selection.removeObserver('[]', this, func) ;
    if (selection) selection.addObserver('[]', this, func) ;
    
    // cache
    this._selection = selection;
    this._selectionPropertyRevision = null ;
    
    // trigger property change handler...
    var rev = (selection) ? selection.propertyRevision : -1 ;
    this._collection_selectionPropertyDidChange(this, '[]', selection, rev) ; 
  }.observes('selection'),
  
  /** @private
    Called whenever the content array or any items in the selection array 
    changes.  update children if this is a new property revision.
  */
  _collection_selectionPropertyDidChange: function(target, key, value, rev) {    
    if (!this._updatingSelection && (!rev || (rev != this._selectionPropertyRevision))) {
      this._selectionPropertyRevision = rev ;
      this._updatingSelection = true ;
      this.selectionPropertyDidChange(target, key);
      this._updatingSelection = false ;
    }
  },
  
  /**
    Invoked whenever a the selection array changes.  The default 
    implementation will possibly recompute the view's layout size and the 
    marks it as dirty so that it can update its children.
  */
  selectionPropertyDidChange: function(target, key) {
    this.adjust(this.computeLayout()) ;
    this.set('isDirty', YES) ;
    this.invalidateNowShowingRange() ;
    return this ;
  },
  
  // ..........................................................
  // NOW SHOWING RANGE
  // 
  
  /**
    The currently visible range.  This is invalidated anytime the clipping
    frame changes or anytime the view is resized.  This in turn may cause
    the collection view to do a 'fast' revalidation of its content.
    
    @property {Range}
  */
  nowShowingRange: function() {
    // console.log(this.get('clippingFrame'));
    var r = this.contentRangeInFrame(this.get('clippingFrame')),
        content = SC.makeArray(this.get('content')),
        len     = content.get('length');
         
    if (!r) r = { start: 0, length: len } ; // default - show all
     
    // make sure the range isn't greater than the content length 
    r.length = Math.min(SC.maxRange(r), len) - r.start ;
    return r ;
  }.property('content', 'clippingFrame').cacheable(),
  
  /**
    Call this method if the nowShowingRange should be recalculated for some
    reason.  Usually the nowShowingRange will invalidate and recalculate on 
    its own but you can force the property to need an update if you 
    prefer.
    
    @returns {SC.CollectionView} receiver
  */
  invalidateNowShowingRange: function() {
    this.notifyPropertyChange('nowShowingRange') ;
    return this ;
  },
  
  /** @private
    Observer triggers whenever the nowShowingRange changes.  If the range has
    actually changed and we are on screen, then schedule fast update. 
    Otherwise, just mark as dirty.
  */
  nowShowingRangeDidChange: function() {
    var range = this.get('nowShowingRange') ;
    var old = this._collection_nowShowingRange ;
    if (!old || !SC.rangesEqual(range, old)) {
      this._collection_nowShowingRange = range ;
      if (this.get('isVisibleInWindow')) this.displayDidChange() ;
      else this.set('isDirty', YES);
    }
  }.observes('nowShowingRange'),
  
  // ..........................................................
  // ITEM VIEWS
  // 
  
  itemViewAtContentIndex: function(contentIndex) {
    var range = this.get('nowShowingRange') ;
    var itemView = this.createExampleView() ;
    var key, content = SC.makeArray(this.get('content')) ;
    var selection = SC.makeArray(this.get('selection')) ;
    content = content.objectAt(contentIndex) ;
    if (!content) return null ;
    
    var guids = this._itemViewGuids, guid;
    if (!guids) this._itemViewGuids = guids = {};
    
    // use cache of item view guids to avoid creating temporary objects
    guid = SC.guidFor(content);
    if (!(key = guids[guid])) {
      key = guids[guid] = SC.guidFor(this)+'_'+guid;
    }
    
    itemView.set('content', content) ;
    itemView.layerId = key ; // NOTE: cannot use .set here, layerId is RO
    itemView.set('isVisible', SC.valueInRange(contentIndex, range)) ;
    itemView.set('isSelected', (selection.indexOf(content) == -1) ? NO : YES) ;
    
    // NOTE: *must* set the layout silently...
    itemView.layout = this.itemViewLayoutAtContentIndex(contentIndex) ;
    itemView.set('parentView', this) ;
    return itemView ;
  },
  
  /** 
    Find the first content item view for the passed event.
    
    This method will go up the view chain, starting with the view that was the 
    target of the passed event, looking for a child item.  This will become 
    the view that is selected by the mouse event.
    
    This method only works for mouseDown & mouseUp events.  mouseMoved events 
    do not have a target.
    
    @param {SC.Event} evt An event
    @returns {SC.View} the item view or null
  */
  itemViewForEvent: function(evt) {
    var responder = this.getPath('pane.rootResponder') ;
    
    if (!responder) return null ; // fast path
    
    // need to materialize an itemView under the mouse if possible
    var baseGuid = SC.guidFor(this) ;
    var baseGuidLen = baseGuid.length ;
    var element = evt.target ;
    var elementId = element.id.slice(0, baseGuidLen) ;
    while (elementId !== baseGuid) {
      element = element.parentNode ;
      if (!element) return null ; // didn't find it!
      elementId = element.id.slice(0, baseGuidLen) ;
    }
    
    if (element.id.length === baseGuidLen) {
      return null ; // we found ourself, so we're not over a child view
    }
    
    // okay, found the DOM node for the view, go ahead and create it
    // first, find the content...
    var contentGuid = element.id.slice(baseGuidLen+1) ;
    var nowShowingRange = this.get('nowShowingRange') ;
    var content = SC.makeArray(this.get('content')) ;
    var idx = SC.minRange(nowShowingRange) ;
    var max = SC.maxRange(nowShowingRange) ;
    var c = content.objectAt(idx) ;
    while (SC.guidFor(c) !== contentGuid) {
      idx++ ;
      if (idx > max) return null ; // couldn't find the content...
      c = content.objectAt(idx) ;
    }
    
    // then create the view for that content
    var itemView = this.createExampleView() ;
    var selection = SC.makeArray(this.get('selection')) ;
    itemView.set('content', c) ;
    itemView.layerId = element.id ; // cannot use .set here, layerId is RO
    SC.View.views[itemView.layerId] = itemView ; // register for event handling
    itemView.set('isVisible', SC.valueInRange(idx, nowShowingRange)) ;
    itemView.set('isSelected', (selection.indexOf(c) == -1) ? NO : YES) ;
    
    // NOTE: *must* set the layout silently...
    itemView.layout = this.itemViewLayoutAtContentIndex(idx) ;
    itemView.set('parentView', this) ;
    
    // prevent normal, non-materialized view behavior
    // TODO: isMaterialized should do this automatically in SC.View
    itemView.layerLocationNeedsUpdate = NO ;
    itemView.childViewsNeedLayout = NO ;
    itemView.layerNeedsUpdate = NO ;
    
    // NOTE: still have to search for view, because itemView could contain
    // nested views, and the mouseDown should go to them first...
    var view = responder.targetViewForEvent(evt) ;
    if (!view) return null ; // workaround for error on IE8, see Ticket #169
    
    // work up the view hierarchy to find a match...
    do {
      // item clicked was the ContainerView itself... i.e. the user clicked 
      // outside the child items nothing to return...
      if (view == this) return null ;
      
      // sweet!... the view is not only in the collection, but it says we can 
      // hit it. hit it and quit it... 
      if (!view.hitTest || view.hitTest(evt)) return view ;
    } while (view = view.get('parentView')) ;
    
    // nothing was found... 
    return null ;
  },
  
  createExampleView: function(content) {
    var exampleViewKey = this.get('contentExampleViewKey') ;
    var ExampleView = (exampleViewKey) ?
      content.get(exampleViewKey) :
      this.get('exampleView') ;
    
    if (ExampleView) {
      return ExampleView.create({
        classNames: ['sc-collection-item'],
        owner: this,
        displayDelegate: this,
        parentView: this,
        isVisible: YES,
        isMaterialized: YES
      });
    } else throw "You must define an exampleView class to render collection items with" ;
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
  
  /** @private
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
  selectPreviousItem: function(extend, numberOfItems) {
    if (SC.none(numberOfItems)) numberOfItems = 1 ;
    if (SC.none(extend)) extend = false ;
    
    var content  = this.get('content');
    var contentLength = content.get('length') ;
    
    // if extending, then we need to do some fun stuff to build the array
    var selTop, selBottom, anchor ;
    if (extend) {
      selTop = this._indexOfSelectionTop() ;
      selBottom = this._indexOfSelectionBottom() ;
      anchor = SC.none(this._selectionAnchor) ? selTop : this._selectionAnchor ;
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
    
    var scrollToIndex = selTop ;
    
    // now build array of new items to select
    var items = [] ;
    while(selTop <= selBottom) {
      items[items.length] = content.objectAt(selTop++) ;
    }
    
    // ensure that the item is visible and set the selection
    if (items.length > 0) {
      this.scrollToItemViewAtContentIndex(scrollToIndex) ;
      this.selectItems(items) ;
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
  selectNextItem: function(extend, numberOfItems) {
    if (SC.none(numberOfItems)) numberOfItems = 1 ;
    if (SC.none(extend)) extend = false ;
    
    var content  = this.get('content');
    var contentLength = content.get('length') ;
    
    // if extending, then we need to do some fun stuff to build the array
    var selTop, selBottom, anchor ;
    if (extend) {
      selTop = this._indexOfSelectionTop() ;
      selBottom = this._indexOfSelectionBottom() ;
      anchor = SC.none(this._selectionAnchor) ? selTop : this._selectionAnchor ;
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
    
    var scrollToIndex = selBottom ;
    
    // now build array of new items to select
    var items = [] ;
    while(selTop <= selBottom) {
      items[items.length] = content.objectAt(selTop++) ;
    }
    
    // ensure that the item is visible and set the selection
    if (items.length > 0) {
      this.scrollToItemViewAtContentIndex(scrollToIndex) ;
      this.selectItems(items) ;
    }
    
    this._selectionAnchor = anchor ;
  },
  
  /**
    Scroll the rootElement (if needed) to ensure that the item is visible.
    @param {Integer} contentIndex The index of the item to scroll to
    @returns {void}
  */
  scrollToItemViewAtContentIndex: function(contentIndex) {
    var itemView = this.itemViewAtContentIndex(contentIndex) ;
    if (itemView) this.scrollToItemView(itemView) ;
  },
  
  /**
    Scroll the rootElement (if needed) to ensure that the item is visible.
    @param {SC.ClassicView} view The item view to scroll to
    @returns {void}
  */
  scrollToItemView: function(view) {
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
    var sel = [] ;
    
    items = SC.makeArray(items) ;
    for (var i = 0, len = items.length; i < len; i++) {
      if (this.invokeDelegateMethod(this.delegate, 'collectionViewShouldSelectItem', this, items[i])) {
        sel.push(items[i]);
      }
    }
    
    var set = SC.Set.create(base), obj ;
    set.addEach(sel) ; // sel contains selectable items
    sel.length = 0 ; // we don't want duplicates in the selection, so clear it
    while (obj = set.pop()) sel.push(obj) ; // now fill it back up..
    
    // if we're not extending the selection, clear the selection anchor
    this._selectionAnchor = null ;
    this.set('selection', sel) ;  
  },
  
  /** 
    Removes the items from the selection.
  */
  deselectItems: function(items) {
    var base = SC.makeArray(this.get('selection')) ;
    var sel = [] ;
    
    items = SC.makeArray(items) ;
    
    var set = SC.Set.create(base), obj ;
    set.removeEach(items) ;
    while (obj = set.pop()) sel.push(obj) ;
    
    this.set('selection', sel) ;
  },
  
  /**
    Deletes the selected content if canDeleteContent is YES.  
    
    This will invoke delegate methods to provide fine-grained control.
    
    @returns {Boolean} YES if deletion is possible, even if none actually occurred.
  */
  deleteSelection: function() {
    // console.log('deleteSelection called on %@'.fmt(this));
    // perform some basic checks...
    if (!this.get('canDeleteContent')) return NO;  
    var sel = SC.makeArray(this.get('selection'));
    if (!sel || sel.get('length') === 0) return NO ;
    
    // let the delegate decide what to actually delete.  If this returns an
    // empty array or null, just do nothing.
    sel = this.invokeDelegateMethod(this.delegate, 'collectionViewShouldDeleteContent', this, sel) ;
    sel = SC.makeArray(sel) ; // ensure this is an array
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
    var hasDestroyObject = SC.typeOf(content.destroyObject) === SC.T_FUNCTION ;
    var hasRemoveObject = SC.typeOf(content.removeObject) === SC.T_FUNCTION ;
    if (!hasDestroyObject && !hasRemoveObject) return NO; // nothing to do
    
    // suspend property notifications and remove the objects...
    if (content.beginPropertyChanges) content.beginPropertyChanges();
    var idx = sel.get('length') ;
    while(--idx >= 0) {
      var item = sel.objectAt(idx) ;
      if (hasDestroyObject) {
        content.destroyObject(item);
      } else {
        content.removeObject(item);
      }
    }
    // begin notifying again...
    if (content.endPropertyChanges) content.endPropertyChanges() ;
    
    return YES ; // done!
  },
  
  // ......................................
  // EVENT HANDLING
  //
  
  /** @private */
  keyDown: function(evt) {
    // console.log('keyDown called on %@'.fmt(this));
    return this.interpretKeyEvents(evt) ;
  },
  
  /** @private */
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
    // console.log('deleteBackward called on %@ with evt %@'.fmt(this, evt));
    return this.deleteSelection() ;
  },
  
  /** @private
    Handle delete keyboard event.
  */
  deleteForward: function(evt) {
    // console.log('deleteForward called on %@ with evt %@'.fmt(this, evt));
    return this.deleteSelection() ;
  },
  
  /** @private
    Selects the same item on the next row or moves down one if itemsPerRow = 1
  */
  moveDown: function(sender, evt) {
    this.selectNextItem(false, this.get('itemsPerRow') || 1) ;
    return true ;
  },
  
  /** @private
    Selects the same item on the next row or moves up one if itemsPerRow = 1
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
  
  /** @private */
  moveDownAndModifySelection: function(sender, evt) {
    this.selectNextItem(true, this.get('itemsPerRow') || 1) ;
    return true ;
  },
  
  /** @private */
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

  /** @private
    Handles mouse down events on the collection view or on any of its 
    children.
    
    The default implementation of this method can handle a wide variety
    of user behaviors depending on how you have configured the various
    options for the collection view.
    
    @param ev {Event} the mouse down event
    @returns {Boolean} Usually YES.
  */
  mouseDown: function(ev) {
    // console.log('%@.mouseDown(%@)'.fmt(this, ev));
    // console.log(ev.originalEvent);
    
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
      
    // debugger ;
    // find the actual view the mouse was pressed down on.  This will call
    // hitTest() on item views so they can implement non-square detection
    // modes. -- once we have an item view, get its content object as well.
    var mouseDownView = (this._mouseDownView = this.itemViewForEvent(ev));
    var mouseDownContent = 
      (this._mouseDownContent = mouseDownView ? mouseDownView.get('content') : null);
      
    // become first responder if possible.
    this.becomeFirstResponder() ;
    
    // console.log(mouseDownView);
    
    // recieved a mouseDown on the collection element, but not on one of the 
    // childItems... unless we do not allow empty selections, set it to empty.
    if (!mouseDownView) {
      if (this.get('allowDeselectAll')) this.selectItems([], false);
      return true ;
    }
    
    // collection some basic setup info
    var selection  = this.get('selection') || [] ;
    var isSelected = (selection.indexOf(mouseDownContent) !== -1) ;
    var modifierKeyPressed = ev.ctrlKey || ev.metaKey ;
    if (mouseDownView.checkboxView && (SC.Event.element(ev) == ev.checkboxView.rootElement)) {
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
  
  /** @private */
  mouseUp: function(ev) {
    
    var canAct = this.get('actOnSelect') ;
    var view = this.itemViewForEvent(ev) ;
    var content, selection;
    
    if (this.useToggleSelection) {
      if (!view) return ; // do nothing when clicked outside of elements
      
      // determine if item is selected. If so, then go on.
      selection = this.get('selection') || [] ;
      content = (view) ? view.get('content') : null ;
      var isSelected = selection.include(content) ;
      if (isSelected) {
        this.deselectItems([content]) ;
      } else this.selectItems([content],true) ;
      
    } else {
      content = (view) ? view.get('content') : null ;
      
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
  
  /** @private */
  _cleanupMouseDown: function() {
    this._mouseDownAt = this._shouldDeselect = this._shouldReselect = this._refreshSelection = this._shouldSelect = false;
    this._mouseDownEvent = this._mouseDownContent = this._mouseDownView = null ;
  },
  
  /** @private */
  mouseMoved: function(ev) {
    var view = this.itemViewForEvent(ev) ;
    // handle hover events.
    if(this._lastHoveredItem && ((view === null) || (view != this._lastHoveredItem)) && this._lastHoveredItem.mouseOut) {
      this._lastHoveredItem.mouseOut(ev); 
    }
    this._lastHoveredItem = view ;
    if (view && view.mouseOver) view.mouseOver(ev) ;
  },
  
  /** @private */
  mouseOut: function(ev) {
  
    var view = this._lastHoveredItem ;
    this._lastHoveredItem = null ;
    if (view && view.didMouseOut) view.didMouseOut(ev) ;
  },
  
  /** @private */
  doubleClick: function(ev) {
    var view = this.itemViewForEvent(ev) ;
    if (view) {
      this._action(view, ev) ;
      return true ;
    } else return false ;
  },
  
  /** @private */
  _findSelectionExtendedByShift: function(selection, mouseDownContent) {
    var content = this.get('content');
    
    // bounds of the collection...
    var contentLowerBounds = 0;
    var contentUpperBounds = (content.get('length') - 1);
    
    var selectionBeginIndex = content.indexOf(selection[0]) ;
    var selectionEndIndex = content.indexOf(selection[selection.length-1]) ;
    
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
  
  /** @private
   Finds the next selectable item, up to content length, by asking the
   delegate. If a non-selectable item is found, the index is skipped. If
   no item is found, selection index is returned unmodified.
   
   @param {Integer} proposedIndex the desired index to select
   @returns {Integer} the next selectable index. This will always be in the range of the bottom of the current selection index and the proposed index.
   @private
  */
  _findNextSelectableItemFromIndex: function(proposedIndex) {
    var content = this.get('content');
    var contentLength = content.get('length');
    var bottom = this._indexOfSelectionTop();
    
    while (proposedIndex < contentLength &&
      this.invokeDelegateMethod(this.delegate, 'collectionViewShouldSelectItem', this, content.objectAt(proposedIndex)) === NO) {
      proposedIndex++;
    }
    return (proposedIndex < contentLength) ? proposedIndex : bottom;
  },
  
  /** @private
   Finds the previous selectable item, up to the first item, by asking the
   delegate. If a non-selectable item is found, the index is skipped. If
   no item is found, selection index is returned unmodified.
   
   @param {Integer} proposedIndex the desired index to select
   @returns {Integer} the previous selectable index. This will always be in the range of the top of the current selection index and the proposed index.
   @private
  */
  _findPreviousSelectableItemFromIndex: function(proposedIndex) {
    var content = this.get('content');
    var contentLength = content.get('length');
    var top = this._indexOfSelectionTop();
    
    while (proposedIndex >= 0 &&
           this.invokeDelegateMethod(this.delegate, 'collectionViewShouldSelectItem', this, content.objectAt(proposedIndex)) === NO) {
      proposedIndex--;
    }
    return (proposedIndex >= 0) ? proposedIndex : top ;
  },
  
  /** @private
    if content value is editable and we have one item selected, then edit.
    otherwise, invoke action.
  */
  insertNewline: function() {
    var sel, itemView;
    if (this.get('contentValueIsEditable')) {
      sel = this.get('selection') ;
      if (sel && sel.get('length') === 1) {
        itemView = this.itemViewForContent(sel.objectAt(0)) ;
        if (itemView && itemView.beginEditing) {
          this.scrollToItemView(itemView) ;
          itemView.beginEditing() ;
        }
      }
      
    // invoke action!
    } else {
      sel = this.get('selection') ;
      itemView = (sel && sel.get('length') === 1) ? this.itemViewForContent(sel.objectAt(0)) : null ;
      this._action(itemView, null) ;
    }
    
    return YES ; // always handle
  },
  
  // ......................................
  // FIRST RESPONDER
  // 
  
  /** @private
    Called whenever the collection becomes first responder. 
    Adds the focused class to the element.
  */
  didBecomeFirstResponder: function() {
    // console.log('didBecomeFirstResponder called on %@'.fmt(this));
    this.$().addClass('focus') ;
  },
  
  /** @private */
  willLoseFirstResponder: function() {
    // console.log('willLoseFirstResponder called on %@'.fmt(this));
    this.$().removeClass('focus');
  },
  
  // ......................................
  // DRAG AND DROP SUPPORT
  //

  /**
    When reordering its content, the collection view will store its reorder
    data using this special data type.  The data type is unique to each 
    collection view instance.  You can use this data type to detect reorders
    if necessary.
    
    @property
    @type String
  */
  reorderDataType: function() {
    return 'SC.CollectionView.Reorder.%@'.fmt(SC.guidFor(this)) ;
  }.property().cacheable(),
  
  /**
    This property is set to the array of content objects that are the subject
    of a drag whenever a drag is initiated on the collection view.  You can
    consult this property when implementing your collection view delegate 
    methods, but otherwise you should not use this property in your code.
    
    Note that drag content will always appear in the same order the content
    appears in the source content array.
    
    @type Array
  */
  dragContent: null,
  
  /**
    This property is set to the proposed insertion index during a call to
    collectionViewValidateDragOperation().  Your delegate implementations can change
    the value of this property to enforce a drop some in some other location.
    
    @type Number
  */
  proposedInsertionIndex: null,
  
  /**
    This property is set to the proposed drop operation during a call to
    collectionViewValidateDragOperation().  Your delegate implementations can change
    the value of this property to enforce a different type of drop operation.
    
    @type Number
    @field
  */
  proposedDropOperation: null,
  
  /** @private
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
        //var view = this.ghostViewFor(dragContent) ;
        var view = this.invokeDelegateMethod(this.delegate, 'dragViewFor', dragContent, this);
        
        // Initiate the drag
        SC.Drag.start({
          event: this._mouseDownEvent,
          source: this,
          dragView: view,
          ghost: NO,
          slideBack: YES,
          dataSource: this
        }); 
        
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
    
    @property 
    @type Array
  */
  dragDataTypes: function() {
    // console.log('dragDataTypes called on %@'.fmt(this));
    
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
  dragDataForType: function(drag, dataType) {
    
    // if this is a reorder, then return drag content.
    if (this.get('canReorderContent')) {
      if (dataType === this.get('reorderDataType')) {
        // console.log('dragContent is %@'.fmt(this.get('dragContent')));
        return this.get('dragContent') ;
      }
    }
    
    // otherwise, just pass along to the delegate.
    return this.invokeDelegateMethod(this.delegate, 'collectionViewDragDataForType', this, drag, dataType) ;
  },
  
  /**
    Implements the SC.DropTarget interface.  The default implementation will
    consult the collection view delegate, if you implement those methods.
  */
  computeDragOperations: function(drag, evt) {
    // console.log('computeDragOperations called on %@'.fmt(this));
    
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
    // op = this.invokeDelegateMethod(this.delegate, 'collectionViewValidateDrop', this, drag, SC.DROP_ANY, -1, op) ;
    op = this.invokeDelegateMethod(this.delegate, 'collectionViewComputeDragOperations', this, drag, op) ;
    
    if (op & SC.DRAG_REORDER) op = SC.DRAG_MOVE ;
    
    // return
    return op ;
  },
  
  /** @private
    Determines the allowed drop operation insertion point, operation type,
    and the drag operation to be performed.  Used by dragUpdated() and 
    performDragOperation().
  */
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
    if (SC.typeOf(idx) === SC.T_ARRAY) {
      dropOp = idx[1] ; // order matters here
      idx = idx[0] ;
    }
    
    // if the return drop operation is DROP_ON, then just check it with the
    // delegate method.  If the delegate method does not support dropping on,
    // then it will return DRAG_NONE, in which case we will try again with
    // drop before.
    if (dropOp == SC.DROP_ON) {
      // console.log('dropOp === SC.DROP_ON');
      
      // Now save the insertion index and the dropOp.  This may be changed by
      // the collection delegate.
      this.set('proposedInsertionIndex', idx) ;
      this.set('proposedDropOperation', dropOp) ;
      dragOp = this.invokeDelegateMethod(this.delegate, 'collectionViewValidateDragOperation', this, drag, dragOp, idx, dropOp) ;
      idx = this.get('proposedInsertionIndex') ;
      dropOp = this.get('proposedDropOperation') ;
      this._dropInsertionIndex = this._dropOperation = null ;

      // The delegate is OK with a drop on also, so just return.
      if (dragOp !== SC.DRAG_NONE) {
        // console.log('[idx, dropOp, dragOp] is [%@, %@, %@]'.fmt(idx, dropOp, dragOp));
        return [idx, dropOp, dragOp] ;
        
      // The delegate is NOT OK with a drop on, try to get the insertion
      // index again, but this time prefer SC.DROP_BEFORE, then let the 
      // rest of the method run...
      } else {
        dropOp = SC.DROP_BEFORE ;
        idx = this.insertionIndexForLocation(loc, SC.DROP_BEFORE) ;
        if (SC.typeOf(idx) === SC.T_ARRAY) {
          dropOp = idx[1] ; // order matters here
          idx = idx[0] ;
        }
      }
    }
    
    // console.log('this is a redorder drag, dropOp is %@'.fmt(dropOp)) ;
    
    // if this is a reorder drag, set the proposed op to SC.DRAG_REORDER and
    // validate the insertion point.  This only works if the insertion point
    // is DROP_BEFORE.  DROP_ON is not handled by reordering content.
    if ((idx >= 0) && this.get('canReorderContent') && (dropOp === SC.DROP_BEFORE)) {
      
      var objects = drag.dataForType(this.get('reorderDataType')) ;
      if (objects) {
        // console.log('found objects');
        var content = this.get('content') || [] ;
        // console.log('objects is %@, content is %@'.fmt(objects, content));
        
        // if the insertion index is in between two items in the drag itself, 
        // then this is not allowed.  Either use the last insertion index or 
        // find the first index that is not in between selections.  Stop when
        // we get to the beginning.
        var previousContent = (idx > 0) ? content.objectAt(idx-1) : null ;
        var nextContent = (idx < content.get('length')) ? content.objectAt(idx) : null;
        
        var isPreviousInDrag = (previousContent) ? objects.indexOf(previousContent)>=0 : NO;
        var isNextInDrag = (nextContent) ? objects.indexOf(nextContent)>=0 : NO;
        
        if (isPreviousInDrag && isNextInDrag) {
          if (SC.none(this._lastInsertionIndex)) {
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
    
    // console.log('the dragOp is %@'.fmt(dragOp)) ;
    
    // Now save the insertion index and the dropOp.  This may be changed by
    // the collection delegate.
    this.set('proposedInsertionIndex', idx) ;
    this.set('proposedDropOperation', dropOp) ;
    // dragOp = this.invokeDelegateMethod(this.delegate, 'collectionViewValidateDrop', this, drag, dropOp, idx, dragOp) ;
    dragOp = this.invokeDelegateMethod(this.delegate, 'collectionViewValidateDragOperation', this, drag, dragOp, idx, dropOp) ;
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
    // console.log('%@.dragUpdated(drag=%@, evt=%@)'.fmt(this, drag, evt));
    var state = this._computeDropOperationState(drag, evt) ;
    // console.log('state is %@'.fmt(state));
    var idx = state[0], dropOp = state[1], dragOp = state[2] ;
    
    // if the insertion index or dropOp have changed, update the insertion point
    if (dragOp !== SC.DRAG_NONE) {
      if ((this._lastInsertionIndex !== idx) || (this._lastDropOperation !== dropOp)) {
        // var itemView = this.itemViewForContent(this.get('content').objectAt(idx));
        var itemView = this.itemViewAtContentIndex(idx) ;
        this.showInsertionPoint(itemView, dropOp) ;
      }
      
      this._lastInsertionIndex = idx ;
      this._lastDropOperation = dropOp ;
    } else {
      this.hideInsertionPoint() ;
      this._lastInsertionIndex = this._lastDropOperation = null ;
    }
    
    // Normalize drag operation to the standard kinds accepted by the drag system.
    return (dragOp & SC.DRAG_REORDER) ? SC.DRAG_MOVE : dragOp;  
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
    Implements the SC.DropTarget protocol.
  */
  acceptDragOperation: function(drag, op) { return YES; },
  
  /**
    Implements the SC.DropTarget protocol.  Consults the collection view
    delegate to actually perform the operation unless the operation is 
    reordering content.
  */
  performDragOperation: function(drag, op) { 
    // console.log('performDragOperation called on %@ with drag.dataTypes %@'.fmt(this, drag.get('dataTypes')));
    // console.log('op is %@'.fmt(SC.Drag.inspectOperation(op)));
    // Get the correct insertion point, drop operation, etc.
    var state = this._computeDropOperationState(drag, null, op) ;
    var idx = state[0], dropOp = state[1], dragOp = state[2] ;
    // console.log('dragOp is %@'.fmt(SC.Drag.inspectOperation(dragOp)));
    
    // The dragOp is the kinds of ops allowed.  The drag operation must 
    // be included in that set.
    if (dragOp & SC.DRAG_REORDER) {
      op = (op & SC.DRAG_MOVE) ? SC.DRAG_REORDER : SC.DRAG_NONE ;
    } else {
      op = op & dragOp ;
    }
    // console.log('after processing, op is %@'.fmt(SC.Drag.inspectOperation(op)));
    
    // If no allowed drag operation could be found, just return.
    if (op === SC.DRAG_NONE) return op;
    
    // Some operation is allowed through, give the delegate a chance to
    // handle it.
    // var performed = this.invokeDelegateMethod(this.delegate, 'collectionViewAcceptDrop', this, drag, dropOp, idx, op) ;
    var performed = this.invokeDelegateMethod(this.delegate, 'collectionViewPerformDragOperation', this, drag, op, idx, dropOp) ;
    
    // console.log('performed is %@'.fmt(SC.Drag.inspectOperation(performed)));
    // If the delegate did not handle the drag (i.e. returned SC.DRAG_NONE),
    // and the op type is REORDER, then do the reorder here.
    // console.log('performed & SC.DRAG_NONE is %@, op & SC.DRAG_REORDER is %@'.fmt((performed & SC.DRAG_NONE),(op & SC.DRAG_REORDER)));
    if ((performed === SC.DRAG_NONE) && (op & SC.DRAG_REORDER)) {
      var objects = drag.dataForType(this.get('reorderDataType')) ;
      // console.log('objects is %@'.fmt(objects));
      if (!objects) return SC.DRAG_NONE ;
      
      var content = this.get('content') ;
      content.beginPropertyChanges(); // suspend notifications
      
      // find the old index and remove it.
      var old ;
      var objectsIdx = objects.get('length') ;
      while(--objectsIdx >= 0) {
        var obj = objects.objectAt(objectsIdx) ;
        old = content.indexOf(obj) ;
        if (old >= 0) content.removeAt(old) ;
        if ((old >= 0) && (old < idx)) idx--; //adjust idx
      }
      
      // now insert objects at new location
      content.replace(idx, 0, objects) ;
      content.endPropertyChanges(); // restart notifications
      
      var outOfDateIndices = Math.min(old, idx) ;
      if (outOfDateIndices < 0 ) outOfDateIndices = 0 ;
      
      this.rowHeightsDidChangeInRange({ start: outOfDateIndices, length: content.get('length')-outOfDateIndices }) ;
      
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
  
  /**
    If some state changes that causes the row height for a range of rows 
    then you should call this method to notify the view that it needs to
    recalculate the row heights for the collection.
    
    Anytime your content array changes, the rows are invalidated 
    automatically so you only need to use this for cases where your rows
    heights may change without changing the content array itself.
    
    If all rows heights have changed, you can pass null to invalidate the
    whole range.
    
    @param {Range} range or null.
    @returns {SC.CollectionView} reciever
  */
  rowHeightsDidChangeInRange: function(range) {},
  
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
    for(var idx=0; ((ret === null) && (idx<content.length)); idx++) {
      // itemView = this.itemViewForContent(content.objectAt(idx));
      itemView = this.itemViewAtContentIndex(idx);
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
    if ((ret === null) || (ret < 0)) ret = 0 ;
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
    
    @param itemView {SC.ClassicView} view the insertion point should appear directly before. If null, show insertion point at end.
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
    
    @param itemView {SC.ClassicView} the item view to show before.
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
  
  dragViewFor: function(dragContent) {
    // console.log('%@.dragViewFor(dragContent=%@)'.fmt(this, dragContent)) ;
    var view = SC.View.create() ;
    var layer = this.get('layer').cloneNode(false) ;
    
    view.set('parentView', this) ;
    view.set('layer', layer) ;
    
    var ary = dragContent, content = SC.makeArray(this.get('content')) ;
    for (var idx=0, len=ary.length; idx<len; idx++) {
      var itemView = this.itemViewAtContentIndex(content.indexOf(ary[idx])) ;
      if (itemView) layer.appendChild(itemView.get('layer').cloneNode(true)) ;
    }
    
    return view ;
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
  
  /** @private
    Perform the action.  Supports legacy behavior as well as newer style
    action dispatch.
  */
  _action: function(view, evt) {
    // console.log('_action invoked on %@ with view %@, evt %@'.fmt(this, view, evt));
    var action = this.get('action');
    var target = this.get('target') || null;
    // console.log('action %@, target %@'.fmt(action, target));
    if (action) {
      // if the action is a function, just call it
      if (SC.typeOf(action) == SC.T_FUNCTION) return this.action(view, evt) ;
      
      // otherwise, use the new sendAction style
      var pane = this.get('pane') ;
      if (pane) pane.rootResponder.sendAction(action, target, this, pane);
      // SC.app.sendAction(action, target, this) ;
      
    // if no action is specified, then trigger the support action,
    // if supported.
    } else if (!view) {
      return ; // nothing to do
      
    // if the target view has its own internal action handler,
    // trigger that.
    } else if (SC.typeOf(view._action) == SC.T_FUNCTION) {
      return view._action(evt) ;
      
    // otherwise call the action method to support older styles.
    } else if (SC.typeOf(view.action) == SC.T_FUNCTION) {
      return view.action(evt) ;
    }
  }
  
});
