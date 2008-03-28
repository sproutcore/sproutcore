// ========================================================================
// SproutCore
// copyright 2006-2007 Sprout Systems, Inc.
// ========================================================================

require('views/view') ;
require('views/label') ;

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
  
  h4. INCREMENTAL RENDERING
  
  incremental rendering can be used in certain collection views to
  display only the visible views in your collection.  This will yield
  dramatically improved performance over the typical full-rendering
  facility.
  
  to activate incremental rendering you need to override the two methods
  below to return valid values and also implement layoutChildViewsFor()
  above.  

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
    
    @type Boolean
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
    
    @type Boolean
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
  isDirty: true,
  
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
    Property returns all of the item views, regardless of group view.

    @property
    @returns {Array} the item views.
  */
  itemViews: function() {
    var ret = [] ;
    if (!this._itemViews) return ret ;
    for(var key in this._itemViews) {
      if (this._itemViews.hasOwnProperty(key)) ret.push(this._itemViews[key]);
    }  
    return ret;
  }.property(),

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
    Returns true if the passed view belongs to the collection.
    
    This method uses the internal hash of item views and works even if 
    your items are stored in group views.  This is faster than searching
    the child view hierarchy yourself.
    
    @param {SC.View} view The view to search for.

    @returns {Boolean} True if the view is an item view in the receiver.
  */
  hasItemView: function(view) {
    if (!this._itemViews) this._itemViews = {};
    return !!this._itemViews[SC.getGUID(view)];
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
    view.set('frame', this.get('frame')) ;
    view.set('isPositioned', true) ;
    var idx = dragContent.length ;
    var maxX = 0; var maxY = 0 ;
    
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

      // Clone the contents of this node.  We should probably apply the 
      // computed style to the cloned nodes in order to make sure they match even if the 
      // CSS styles do not match.  Make sure the items are properly 
      // positioned.
      dom = dom.cloneNode(true) ;
      Element.setStyle(dom, { position: "absolute", left: "%@px".fmt(f.x), top: "%@px".fmt(f.y), width: "%@px".fmt(f.width), height: "%@px".fmt(f.height) }) ;
      view.rootElement.appendChild(dom) ;
    }
    
    // Trim the size of the view to match the maxX & maxY as well as overflow
    view.setStyle({ overflow: 'hidden', width: "%@px.".fmt(maxX+1), height: "%@px".fmt(maxY+1) }) ;

    return view ;
  },
  
  mouseDragged: function(ev) {
    // Don't do anything unless the user has been dragging for 123msec
    if ((Date.now() - this._mouseDownAt) < 123) return true ;
    
    // OK, they must be serious, start a drag if possible. 
    if (this.get('canReorderContent')) {

      // we need to recalculate the frame at this point.
      this.flushFrameCache();
      
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

      // debugger ;
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
  // GENERATING CHILDREN
  //
  
  /**
    Ensure that the displayed item views match the current set of content objects.
  
    This is the main entry point to the Collection View layout system.  It
    compares the current set of item views to the content objects, adding, removing,
    and reordering views as necessary to bring them in sync with the set of content
    objects.
  
    Once it has finished running, this method will also call your layoutChildViewsFor()
    method if you have implemented it.

    This method is called automatically whenever the content array changes.  You will
    not usually need to call it yourself.  If you want to refresh the item views,
    called rebuildChildren() instead.
  */
  updateChildren: function()
  {
    var el = this.containerElement || this.rootElement;
    
    SC.Benchmark.start('%@: updateChildren'.fmt(this._guid)) ;
    // initial setup
    if (this._firstUpdate)
    {
      el.innerHTML = '';
      this._firstUpdate = false;
    }

    // before removing from parent, make sure we have retrieved the frame
    // size so that layout can happen.
    this.cacheFrame();

    // viewsForContent will hold all the item views we currently have rendered
    // keyed by content._guid.  We use this to quickly determine if a view can
    // be reused.
    if (!this._viewsForContent) this._viewsForContent = {};

    // handle grouped items.  If items are grouped, then each childNode is
    // a group, which contains a label and a div with the items themselves.
    var groupBy = this.get('groupBy');
    var content = this.get('content') || [];

    // If the number of childViews differs from the content size, remove from
    // DOM to improve performance while updating.
    this._cachedParent = null;
    this._cachedSibling = null;
    if (content.get('length') != this.childNodes.get('length'))
    {
      this._cachedParent  = el.parentNode;
      this._cachedSibling = el.nextSibling;
      if (this._cachedParent) {
        this._cachedParent.removeChild(el);
      } else {
        //debugger;
      }
    }

    // this code path will render the collection of groups.  This creates 
    // group views for each distinct group it encounters and then has it 
    // render child views in each item.
    if (groupBy)
    {
      var loc = 0;
      var group = this.firstChild;
      while (group || (loc < content.get('length')))
      {
        var groupValue = (loc < content.get('length')) ? content.objectAt(loc).get(groupBy) : null;
        
        // we are out of content, just remove any remaining groups (including
        // child nodes)
        if (loc >= content.get('length')) {
          if (group) {
            // this will clear out the item views in the group.
            loc = this.updateChildrenInGroup(group.itemView, content, loc, groupBy, null);
            // now remove the group.
            var prev = group.previousSibling ;
            this.removeChild(group) ;
            group = prev ;
          }
          
        // otherwise, make sure the current group matches the next group. If
        // it doesn't, then add a new group.
        } else if (!group || (group.get('groupValue') != groupValue)) {
          
          // create group view.
          var newGroup = this.exampleGroupView.viewFor(null) ; 
          newGroup.owner = this ;
          newGroup.set('groupValue',groupValue) ;
          
          // add group label view.
          if (newGroup.labelView) newGroup.labelView.set('content',groupValue);

          // add item views to group.
          loc = this.updateChildrenInGroup(newGroup.itemView,content,loc,
                                           groupBy, groupValue) ;

          // add the new group at this point
          this.insertBefore(newGroup,group) ; 
          group = newGroup ;
          
        // otherwise, if the current group does match the next group, just
        // update its child nodes.
        } else {
          loc = this.updateChildrenInGroup(group.itemView,content,loc,
                                            groupBy, groupValue) ;
        }
        
        // go to the next group.  group will be nil if the first group was
        // removed.
        group = (group) ? group.nextSibling : this.firstChild ;
      }
      
    // grouping is not turned on.
    } else {
      this.updateChildrenInGroup(this, content, 0, null, null) ;
    }
    
    // Add back into DOM if optimization was used.
    if (this._cachedParent) {
      this._cachedParent.insertBefore(el,this._cachedSibling) ;
    }
    
    this.updateSelectionStates() ;
    this.flushFrameCache() ;
    this.set('isDirty',false); 
    SC.Benchmark.end('%@: updateChildren'.fmt(this._guid)) ;
  },

  /**
    @private 
  
    Step through the child nodes in the parent to match them to
    the content array, starting at the passed location.  It will go until it
    runs out of content objects or until the content no longer belong to the
    group indicated.
  */  
  updateChildrenInGroup: function(parent,content,loc,groupBy,groupValue) {
    // cacheing content.get('length') for optimization.
    var contentCount = content.get('length');
    var child = parent.firstChild;
    var inGroup = true ;

    if (!this._itemViews) this._itemViews = {};
    var itemViewsDidChange = false;
    
    this.updateComputedViewHeight(parent);

    // if we aren't rendering groups, then this can expire.
    var expired = false;
    var canExpire = !groupBy && loc == 0 ; 
    if (canExpire)
    {
      loc = this._lastRenderLoc ;
      child = this._lastRenderChild || child;
      this._resetRenderClock();
    };

    var firstChild = null ;
    
    // save the first child to be modified.  This will be
    // passed to the layout method.
    var firstModifiedChild = null;
    
    while (child || (inGroup && (loc < contentCount) && !expired)) {
      
      // get the content object.
      var cur = (inGroup && (loc < contentCount)) ? content.objectAt(loc) : null;
      
      // verify the new cur is still in the group.
      if (cur && groupBy && (cur.get(groupBy) != groupValue))
      {
        inGroup = false; 
        cur = null;
      }
      
      // we are out of content for this group, remaining children simply need 
      // to be removed.
      if (cur == null) {
        if (child) {
          if (this.flushUnusedViews) {
            var viewContent = child.get('content') ;
            if (viewContent) delete this._viewsForContent[SC.getGUID(viewContent)];
            child.set('content',null) ;
          }
          var prev = child.previousSibling ;
          parent.removeChild(child) ;
          if (this._itemViews[SC.getGUID(child)]) {
            itemViewsDidChange = true ;
            delete this._itemViews[SC.getGUID(child)]; 
          }
          
          child = prev;
        }

      // otherwise, make sure the current child matches the content object.
      // if it doesn't, get the right view (or create it) and insert it here.
      } else if (!child || (child.get('content') != cur)) {

        // find the correct view.  If it doesn't exist, create it.
        var newChild = this._viewsForContent[SC.getGUID(cur)] ;
        if (!newChild) {
          newChild = this.exampleView.viewFor(null) ;
          newChild.owner = this ;
          newChild._isChildView = true ;
          newChild.set('content',cur) ;
          this._viewsForContent[SC.getGUID(cur)] = newChild ;
        }

        // add the view at this point in the hierarchy and make the new child
        // the current child.
        parent.insertBefore(newChild,child);
        this._itemViews[SC.getGUID(newChild)] = newChild;
        itemViewsDidChange = true;
        if (!firstModifiedChild) firstModifiedChild = newChild ;
        child = newChild;
      }

      // go to next child and content object
      // child would only be nil if the current child was first and was 
      // removed
      if (!firstChild) firstChild = child;
      child = (child) ? child.nextSibling : ((inGroup) ? parent.firstChild : null);
      
      // go to the next loc only if cur was used last time.
      if (cur) loc++;
      
      expired = this._renderExpired();
    }


    // maybe save the current render loc and reschedule.
    if (expired && (loc < contentCount)) {
      this._lastRenderLoc = loc ;
      this._lastRenderChild = child ;
      setTimeout(this.updateChildren.bind(this),1) ; // do more later.
    } else {
      this._resetExpiredRender();
    }
    
    // now let the collection view layout the views that changed (if 
    // it is implemented.)
    if (firstModifiedChild && this.layoutChildViewsFor) {
      var el = this.containerElement || this.rootElement;
      if (this._cachedParent) {
        this._cachedParent.insertBefore(el,this._cachedSibling);
      }   
      this.layoutChildViewsFor(parent, firstModifiedChild);
      if (this._cachedParent) {
        this._cachedParent.removeChild(el);
      }
    }
    
    // notify itemViews change if applicable.
    if (itemViewsDidChange) this.propertyDidChange('itemViews');
    
    return loc;
  },


  /**
    Returns the itemView that represents the passed content object.  
    
    If no item view is currently rendered for the object, this method will
    return null.
    
    @param {Object} obj The content object.  Should be a member of the content array.
    @returns {SC.View} The item view for this object or null if no match could be found.
  */
  itemViewForContent: function( obj )
  {
    return this._viewsForContent[SC.getGUID(obj)];
  },

  /**
    Rebuild all the child item views in the collection view.
    
    This will remove all the child views from the collection view and rebuild them
    from scratch.  This method is generally expensive, but if you have made a
    substantial number of changes to the content array and need to bring everything 
    up to date, this is the best way to do it.
    
    In general the collection view will automatically keep the item views in sync
    with the content objects for you.  You should not need to call this method
    very often.
    
    @returns {void}
  */
  rebuildChildren: function() {
    this.clear();
    this._viewsForContent = {};
    this._resetExpiredRender();
    this.updateChildren();
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
    var selectionHash = {};
    var numberOfSelectedItems = selection.get('length');
    for( var i = 0;  i < numberOfSelectedItems;  i++ ) {
      var item = selection.objectAt(i);
      selectionHash[SC.getGUID(item)] = true;
    }

    for(var key in this._itemViews) {
      if (!this._itemViews.hasOwnProperty(key)) continue ;
      var child = this._itemViews[key] ;
      var content = (child.get) ? child.get('content') : null;
      var guid = (content) ? SC.getGUID(content) : null;
    
      if( !guid ) continue;
      var childIsSelected = selectionHash[guid] ? true : false;
    
      // If the child's state has changed from before, set it to the new 
      // state. Otherwise, don't bother setting the state to the same value 
      // it used to have.
      if( childIsSelected != child.get('isSelected') ) {
        if (child.set) child.set('isSelected', childIsSelected);
      }
    }
  },
    
//  layoutChildViewsFor: function(parentView, startingView) { return false; },
  
  resizeChildrenWithOldSize: function(oldSize) {
    if (this.layoutChildViewsFor && (this.layoutChildViewsFor(this, null))) {
      this.updateComputedViewHeight(this) ;
    } else {
      arguments.callee.base.apply(this,arguments) ;
    }
  },
  
  _firstUpdate: true,
  
  _lastRenderLoc: 0,
  _renderStart: null,
  _resetRenderClock: function() { this._renderStart = new Date().getTime(); },

  _resetExpiredRender: function() { 
    this._lastRenderLoc = 0; this._lastRenderChild = null;
  },
  
  _renderExpired: function() {
    var max = this.maxRenderTime ;
    if ((this._renderStart == null) || (max == 0)) return false ;
    return ((new Date().getTime()) - this._renderStart) > max ;
  },
  
  /**
    Override to return the range of items to render for a given frame.
    
    The range you return will be used to limit the number of actual views that are
    created for the collection view.  The passed frame is relative to the total frame 
    of the groupView. 
    
    You should override this method if you want to support incremental rendering.
    The default implementation does nothing.
    
    @param {SC.View} groupView The group view the requested items belong to.  If 
      grouping is not used, this will always be null.
      
    @param {Frame} frame The frame you should use to determine the range.
    
    @returns {Range} A hash that indicates the range of content objects to render.  ({ start: X, length: Y }) 
  */  
  itemRangeInFrame: function(groupView, frame) { return null; },
  
  /**  
    Override to return a computed height of the collection.

    This will be used to set a dynamic scrollbar height if you support incremental
    rendering.  The default implementation does nothing.
  
    @param {SC.View} groupView The group view this request relates to.  If grouping is 
      turned off, this parameter will be null.
    
    @returns {Number} The view height in pixels.
  */
  computedViewHeight: function(groupView) { return -1; },
  
  // This will set the collection height.
  updateComputedViewHeight: function(groupView) {
    var height = this.computedViewHeight(groupView) ;
    if (height >= 0) {
      var f = this.get('frame') ;
      if (Math.abs(f.height - height) > 0.1) {
        f.height = height ;
        this.set('frame', { height: height }) ;
      }
    }
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
    var content = this.get('content') ;
    var idx = content.length;    
    while(--idx >= 0) {
      var itemView = this.itemViewForContent(content.objectAt(idx));
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

  
  didMouseDown: function(ev) { 
    console.warn("didMouseDown will be removed from CollectionView in the near future. Use mouseDown instead");
    return this._mouseDown(ev, true); 
  },
  
  mouseDown: function(ev) {
    // older code might still use didMouseDown.  Warn to give people some time to transition.
    if (this.didMouseDown != SC.CollectionView.prototype.didMouseDown) {
      return this.didMouseDown(ev) ;
    } else return this._mouseDown(ev);
  },
    
  _mouseDown: function(ev) {
    // save for drag opt
    this._mouseDownEvent = ev ;

    // Toggle selection only triggers on mouse up.  Do nothing.
    if (this.useToggleSelection) return true;

    // Make sure that saved mouseDown state is always reset in case we do
    // not get a paired mouseUp. (Only happens if subclass does not call us like it should)
    this._mouseDownAt = this._shouldDeselect = this._shouldReselect = this._refreshSelection = false;

    var mouseDownView    = this._mouseDownView = this.itemViewForEvent(ev);
    var mouseDownContent = this._mouseDownContent = (mouseDownView) ? mouseDownView.get('content') : null;

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
  
  // invoked when the user releases the mouse.  based on the information saved
  // during mouse down, we decide what to do.
  didMouseUp: function(ev) { 
    console.warn("didMouseUp will be removed from CollectionView in the near future. Use mouseUp instead");
    return this._mouseUp(ev);
  },
  
  mouseUp: function(ev) {
    if (this.didMouseUp != SC.CollectionView.prototype.didMouseUp) {
      return this.didMouseUp(ev) ;
    } else return this._mouseUp(ev) ;
  },
  
  _mouseUp: function(ev) {
    
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
  
  // this can be used to initiate a drag.  Only drags 100ms after mouseDown
  // to avoid responding to clicks.
  mouseDidMove: function(ev) {
    console.warn("mouseDidMove will be removed from CollectionView in the near future. Use mouseMoved instead");
    return this._mouseMoved(ev) ;
  },
  
  mouseMoved: function(ev) {
    if (this.mouseDidMove != SC.CollectionView.prototype.mouseDidMove) {
      return this.mouseDidMove(ev) ;
    } else return this._mouseMoved(ev) ;
  },
  
  _mouseMoved: function(ev) {
    var view = this.itemViewForEvent(ev) ;
    // handle hover events.
    if(this._lastHoveredItem && ((view === null) || (view != this._lastHoveredItem)) && this._lastHoveredItem.didMouseOut) {
      this._lastHoveredItem.didMouseOut(ev); 
    }
    this._lastHoveredItem = view ;
    if (view && view.didMouseOver) view.didMouseOver(ev) ;
  },

  didMouseOut: function(ev) {
    console.warn("didMouseOut will be removed from CollectionView in the near future. Use mouseOut instead");
    return this._mouseOut(ev) ;
  },
  
  mouseOut: function(ev) {
    if (this.didMouseOut != SC.CollectionView.prototype.didMouseOut) {
      return this.didMouseOut(ev) ;
    } else return this._mouseOut(ev) ;
  },
  
  _mouseOut: function(ev) {
  
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
  // INTERNAL
  //
  
  init: function() {
    arguments.callee.base.apply(this, arguments) ;
    this._dropTargetObserver();
  },

  // When canReorderContent changes, add or remove drop target as necessary.
  _dropTargetObserver: function() {
    var canDrop = this.get('canReorderContent') || this.get('isDropTarget') ;
    if (canDrop) {
      SC.Drag.addDropTarget(this) ;
    } else {
      SC.Drag.removeDropTarget(this) ;
    }
  }.observes('canReorderContent', 'isDropTarget'),
  
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
  
  _viewsForContent: null,
  _content: [], // cached for changes.
  propertyObserver: function(observing,target,key,value)
  {
    if (target == this)
    {
      // update children when content changes.
      if (key == 'content')
      {
        // cache the observer binding
        if (!this._boundObserver)
        {
          this._boundObserver = this._contentPropertyObserver.bind(this);
        }

        // don't update the content unless it has changed.  Note that if we
        // get a new empty array, that doesn't count as a change from a prev
        // empty array.
        var isEqual = (
                        ((value && this._content) && (value.get('length') == 0) && (this._content.get('length') == 0)) || 
                        SC.isEqual( value, this._content)
                      );

        // remove and re-add the observer for "[]" before changing the content property
        // this triggers a render of the child item views whenever the array is modified.
        if (this._content && this._content.removeObserver) this._content.removeObserver('[]', this._boundObserver);
        this._content = value;
        if (this._content && this._content.addObserver) this._content.addObserver('[]', this._boundObserver);

        // only re-render the collection if the content was actually changed to a new value.
        if (!isEqual)
        {
          this._contentPropertyObserver(target,key,value);
        }
        
      // update selection when selection changes.  set this as a timeout so 
      // that a render can finish first.
      } 
      else if (key == 'selection')
      {
        if (!this._updatingSel)
        {
          this._updatingSel = this.invokeLater('_updateSelectionState',1);
        }
      }
    }
  },

  // called on content change *and* content.[] change...
  _contentPropertyObserver: function(target,key,value)
  {
    if (!this._updating) {
      this._updating = true;
      this.set('isDirty',true);
      this._resetExpiredRender();
      this.updateChildren();
      this._updating = false;
    }
  },

  _updateSelectionState: function() {
    try {
      this.updateSelectionStates() ;
    } catch(e) {
      console.log('exception while updating selection states in %@: %@'.format(this,e)) ;
    }
    this._updatingSel = null ;
  },

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
