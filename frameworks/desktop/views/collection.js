// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2009 Sprout Systems, Inc. and contributors.
//            Portions ©2008-2009 Apple, Inc. All rights reserved.
// License:   Licened under MIT license (see license.js)
// ==========================================================================

sc_require('mixins/collection_view_delegate') ;
sc_require('views/list_item');

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

SC.BENCHMARK_RELOAD = NO ;

/**
  @class 

  TODO: Document SC.CollectionView
  
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
  @extends SC.CollectionContent
  @since SproutCore 0.9
*/
SC.CollectionView = SC.View.extend(
  SC.CollectionViewDelegate,
  SC.CollectionContent,
/** @scope SC.CollectionView.prototype */ {
  
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
    
    @type {SC.Array}
  */
  content: null,
  
  /** @private */
  contentBindingDefault: SC.Binding.multiple(),
  
  /**
    The current length of the content.
    
    @property
    @type {Numer}
  */
  length: 0,
  
  /**
    The set of indexes that are currently tracked by the collection view.
    This property is used to determine the range of items the collection view
    should monitor for changes.
    
    The default implementation of this property returns an index set covering
    the entire range of the content.  It changes automatically whenever the
    length changes.
    
    Note that the returned index set for this property will always be frozen.
    To change the nowShowing index set, you must create a new index set and 
    apply it.
    
    @property
    @type {SC.IndexSet}
  */
  nowShowing: function() {
    var ret = this.computeNowShowing();
    return ret ? ret.frozenCopy() : null;
  }.property('length', 'clippingFrame').cacheable(),
  
  /**
    Indexes of selected content objects.  This SC.SelectionSet is modified 
    automatically by the collection view when the user changes the selection 
    on the collection.
    
    Any item views representing content objects in this set will have their 
    isSelected property set to YES automatically.
    
    @type {SC.SelectionSet}
  */
  selection: null,
  
  /** 
    Allow user to select content using the mouse and keyboard.
    
    Set this property to NO to disallow the user from selecting items. If you 
    have items in your selectedIndexes property, they will still be reflected
    visually.
    
    @type {Boolean}
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
    
    @type {Boolean}
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
    
    @type {Boolean}
  */
  isEditable: YES,
  
  /** @private */
  isEditableBindingDefault: SC.Binding.bool(),
  
  /**
    Allow user to reorder items using drag and drop.
    
    If true, the user will can use drag and drop to reorder items in the list.
    If you also accept drops, this will allow the user to drop items into 
    specific points in the list.  Otherwise items will be added to the end.
    
    @type {Boolean}
  */
  canReorderContent: NO,
  
  /** @private */
  canReorderContentBindingDefault: SC.Binding.bool(),
  
  /**
    Allow the user to delete items using the delete key
    
    If true the user will be allowed to delete selected items using the delete
    key.  Otherwise deletes will not be permitted.
    
    @type {Boolean}
  */
  canDeleteContent: NO,
  
  /** @private */
  canDeleteContentBindingDefault: SC.Binding.bool(),
  
  /**
    Accept drops for data other than reordering.
    
    Setting this property to return true when the view is instantiated will 
    cause it to be registered as a drop target, activating the other drop 
    machinery.
    
    @type {Boolean}
  */
  isDropTarget: NO,
  
  /**
    Use toggle selection instead of normal click behavior.
    
    If set to true, then selection will use a toggle instead of the normal
    click behavior.  Command modifiers will be ignored and instead clicking
    once will select an item and clicking on it again will deselect it.
    
    @type {Boolean}
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
    The view class to use when creating new group item views.
    
    The collection view will automatically create an instance of the view 
    class you set here for each item in its content array.  You should provide 
    your own subclass for this property to display the type of content you 
    want.
    
    @property {SC.View}
  */
  groupExampleView: SC.ListItemView,
  
  /**
    If set, this key will be used to get the example view for a given
    content object.  The groupExampleView property will be ignored.
    
    @property {String}
  */
  contentGroupExampleViewKey: null,
  
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
    Enables observing content property changes.  Set this property if you 
    want to deal with property changes on content objects directly in the 
    collection view instead of delegating change observing to individual item
    views.
    
    @type {Boolean}
  */
  observeContentProperties: NO,
  
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
    Override to compute the layout of the itemView for the content at the 
    specified index.  This layout will be applied to the view just before it
    is rendered.
    
    @param {Number} contentIndex the index of content beind rendered by
      itemView
    @returns {Hash} a view layout
  */
  layoutForContentIndex: function(contentIndex) {
    return null ;
  },
  
  /**
    Override to return an IndexSet with the indexes that are at least 
    partially visible in the passed rectangle.  This method is used by the 
    default implementation of computeNowShowing() to determine the new 
    nowShowing range after a scroll.
    
    Override this method to implement incremental rendering.
    
    The default simply returns the current content length.
    
    @param {Rect} rect the visible rect
    @returns {SC.IndexSet} now showing indexes
  */
  contentIndexesInRect: function(rect) {
    return SC.IndexSet.create(0, this.get('length'));    
  },
  
  /**
    Compute the nowShowing index set.  The default implementation simply 
    returns the full range.  Override to implement incremental rendering.
    
    You should not normally call this method yourself.  Instead get the 
    nowShowing property.
    
    @returns {SC.IndexSet} new now showing range
  */
  computeNowShowing: function() {
    var r = this.contentIndexesInRect(this.get('clippingFrame')),
        content = SC.makeArray(this.get('content')),
        len     = content.get('length');
         
    // default show all.
    if (!r) r = SC.IndexSet.create(0, len);

    // make sure the index set doesn't contain any indexes greater than the
    // actual content.
    if (r.get('max') > len) r.remove(len, r.get('max')-len);
    
    return r ;
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
  
  // ..........................................................
  // DELEGATE SUPPORT
  // 
  
  
  /**
    Delegate used to implement fine-grained control over collection view 
    behaviors.
    
    You can assign a delegate object to this property that will be consulted
    for various decisions regarding drag and drop, selection behavior, and
    even rendering.  The object you place here must implement some or all of
    the SC.CollectionViewDelegate mixin.
    
    If you do not supply a delegate but the content object you set implements 
    the SC.CollectionViewDelegate mixin, then the content will be 
    automatically set as the delegate.  Usually you will work with a 
    CollectionView in this way rather than setting a delegate explicitly.
    
    @type {SC.CollectionViewDelegate}
  */
  delegate: null,
  
  /**
    The delegate responsible for handling selection changes.  This property
    will be either the delegate, content, or the collection view itself, 
    whichever implements the SC.CollectionViewDelegate mixin.
    
    @property
    @type {Object}
  */
  selectionDelegate: function() {
    var del = this.get('delegate'), content = this.get('content');
    return this.delegateFor('isCollectionViewDelegate', del, content);  
  }.property('delegate', 'content').cacheable(),
  
  /**
    The delegate responsible for providing additional display information 
    about the content.  If you bind a collection view to a controller, this
    the content will usually also be the content delegate, though you 
    could implement your own delegate if you prefer.
    
    @property
    @type {Object}
  */
  contentDelegate: function() {
    var del = this.get('delegate'), content = this.get('content');
    return this.delegateFor('isCollectionContent', del, content);
  }.property('delegate', 'content').cacheable(),
  
  // ..........................................................
  // CONTENT CHANGES
  // 
  
  /**
    Called whenever the content array or an item in the content array or a
    property on an item in the content array changes.  Reloads the appropriate
    item view when the content array itself changes or calls 
    contentPropertyDidChange() if a property changes.
    
    Normally you will not call this method directly though you may override
    it if you need to change the way changes to observed ranges are handled.
    
    @param {SC.Array} content the content array generating the change
    @param {Object} object the changed object
    @param {String} key the changed property or '[]' or an array change
    @param {SC.IndexSet} indexes affected indexes or null for all items
    @returns {void}
  */
  contentRangeDidChange: function(content, object, key, indexes) {
    if (!object && (key === '[]')) {
      this.reload(indexes); // note: if indexes == null, reloads all
    } else {
      this.contentPropertyDidChange(object, key, indexes);
    }
  },

  /**
    Called whenever a property on an item in the content array changes.  This
    is only called if you have set observesContentProperties to YES.
    
    Override this property if you want to do some custom work whenever a 
    property on a content object changes.

    The default implementation does nothing.
    
    @param {Object} target the object that changed
    @param {String} key the property that changed value
    @param {SC.IndexSet} indexes the indexes in the content array affected
    @returns {void}
  */
  contentPropertyDidChange: function(target, key, indexes) {
    // Default Does Nothing
  },
  
  /**
    Called whenever the view needs to updates it's contentRangeObserver to 
    reflect the current nowShowing index set.  You will not usually call this
    method yourself but you may override it if you need to provide some 
    custom range observer behavior.

    Note that if you do implement this method, you are expected to maintain
    the range observer object yourself.  If a range observer has not been
    created yet, this method should create it.  If an observer already exists
    this method should udpate it.
    
    When you create a new range observer, the oberver must eventually call
    contentRangeDidChange() for the collection view to function properly.
    
    If you override this method you probably also need to override 
    destroyRangeObserver() to cleanup any existing range observer.
    
    @returns {void}
  */
  updateContentRangeObserver: function() {
    var nowShowing = this.get('nowShowing'),
        observer   = this._cv_contentRangeObserver,
        content    = this.get('content');
    
    if (!content) return ; // nothing to do
    
    if (observer) {
      content.updateRangeObserver(observer, nowShowing);
    } else {
      var func = this.contentRangeDidChange,
          deep = this.get('observeContentProperties');
      
      observer = content.addRangeObserver(nowShowing, this, func, null, deep);      
      this._cv_contentRangeObserver = observer ;
    }
    
  },
  
  /**
    Called whever the view needs to invalidate the current content range 
    observer.  This is called whenever the content array changes.  You will 
    not usually call this method yourself but you may override it if you 
    provide your own range observer behavior.

    Note that if you override this method you should probably also override
    updateRangeObserver() to create or update a range oberver as needed.
    
    @returns {void}
  */
  removeContentRangeObserver: function() {
    var content  = this.get('content'),
        observer = this._cv_contentRangeObserver ;
        
    if (observer) {
      if (content) content.removeRangeObserver(observer);
      this._cv_contentRangeObserver = null ;
    }
  },
    
  /**
    Called whenever the content length changes.  This will invalidate the 
    length property of the view itself causing the nowShowing to recompute
    which will in turn update the UI accordingly.
    
    @returns {void}
  */
  contentLengthDidChange: function() {
    var content = this.get('content');
    this.set('length', content ? content.get('length') : 0);
  },
  
  /** @private
    Whenever content property changes to a new value:
    
     - remove any old observers 
     - setup new observers (maybe wait until end of runloop to do this?)
     - recalc height/reload content
     - set content as delegate if delegate was old content
     - reset selection
     
    Whenever content array mutates:
    
     - possibly stop observing property changes on objects, observe new objs
     - reload effected item views
     - update layout for receiver
  */
  _cv_contentDidChange: function() {
    var content = this.get('content'),
        lfunc   = this.contentLengthDidChange ;

    if (content === this._content) return this; // nothing to do

    // cleanup old content
    this.removeContentRangeObserver();
    if (this._content) {
      this._content.removeObserver('length', this, lfunc);
    }
    
    // cache
    this._content = content;
    
    // add new observers - range observer will be added lazily
    if (content) {
      content.addObserver('length', this, lfunc);
    }
    
    // notify all items changed
    this.contentLengthDidChange();
    this.contentRangeDidChange(content, null, '[]', null);
    
  }.observes('content'),
  
  // ..........................................................
  // ITEM VIEWS
  // 
  
  /** @private
  
    The indexes that need to be reloaded.  Must be one of YES, NO, or an
    SC.IndexSet.
  
  */
  _invalidIndexes: NO,
  
  /** 
    Regenerates the item views for the content items at the specified indexes.
    If you pass null instead of an index set, regenerates all item views.
    
    This method is called automatically whenever the content array changes in
    an observable way, but you can call its yourself also if you need to 
    refresh the collection view for some reason.
    
    Note that if the length of the content is shorter than the child views
    and you call this method, then the child views will be removed no matter
    what the index.
    
    @param {SC.IndexSet} indexes
    @returns {SC.CollectionView} receiver
  */
  reload: function(indexes) {
    var invalid = this._invalidIndexes ;
    if (indexes && invalid !== YES) {
      if (invalid) invalid.add(indexes);
      else invalid = this._invalidIndexes = indexes.clone();

    } else this._invalidIndexes = YES ; // force a total reload
    
    if (this.get('isVisibleInWindow')) this.invokeOnce(this.reloadIfNeeded);
    
    return this ;
  },

  /** 
    Invoked once per runloop to actually reload any needed item views.
    You can call this method at any time to actually force the reload to
    happen immediately if any item views need to be reloaded.
    
    Note that this method will also invoke two other callback methods if you
    define them on your subclass:
    
    - *willReload()* is called just before the items are reloaded
    - *didReload()* is called jsut after items are reloaded
    
    You can use these two methods to setup and teardown caching, which may
    reduce overall cost of a reload.  Each method will be passed an index set
    of items that are reloaded or null if all items are reloaded.
    
    @returns {SC.CollectionView} receiver
  */
  reloadIfNeeded: function() {
    var invalid = this._invalidIndexes;
    if (!invalid || !this.get('isVisibleInWindow')) return this ; // delay
    this._invalidIndexes = NO ;
    
    var content = this.get('content'),
        len     = content ? content.get('length'): 0,
        layout  = this.computeLayout(),
        bench   = SC.BENCHMARK_RELOAD,
        nowShowing = this.get('nowShowing'),
        itemViews  = this._sc_itemViews,
        containerView = this.get('containerView') || this,
        views, idx, cvlen, view, childViews ;

    // if the set is defined but it contains the entire nowShowing range, just
    // replace
    if (invalid.isIndexSet && invalid.contains(nowShowing)) invalid = YES ;
    if (this.willReload) this.willReload(invalid === YES ? null : invalid);

    // if an index set, just update indexes
    if (invalid.isIndexSet) {
      childViews = containerView.get('childViews');
      cvlen = childViews.get('length');
      
      if (bench) {
        SC.Benchmark.start(bench="%@#reloadIfNeeded (Partial)".fmt(this),YES);
      }
      
      invalid.forEach(function(idx) {
        
        // get the existing item view, if there is one
        var existing = itemViews ? itemViews[idx] : null;
        
        // if nowShowing, then reload the item view.
        if (nowShowing.contains(idx)) {
          view = this.itemViewForContentIndex(idx, YES);
          if (existing && existing.parentView === containerView) {
            containerView.replaceChild(view, existing);
          } else {
            containerView.appendChild(view);
          }
          
        // if not nowShowing, then remove the item view if needed
        } else if (existing && existing.parentView === containerView) {
          containerView.removeChild(existing);
        }
      },this);

      if (bench) SC.Benchmark.end(bench);
      
    // if set is NOT defined, replace entire content with nowShowing
    } else {

      if (bench) {
        SC.Benchmark.start(bench="%@#reloadIfNeeded (Full)".fmt(this),YES);
      }

      views = [];
      nowShowing.forEach(function(idx) {
        views.push(this.itemViewForContentIndex(idx, YES));
      }, this);

      // below is an optimized version of:
      //this.replaceAllChildren(views);
      containerView.beginPropertyChanges();
      containerView.destroyLayer().removeAllChildren();
      containerView.set('childViews', views); // quick swap
      containerView.replaceLayer();
      containerView.endPropertyChanges();
      
      if (bench) SC.Benchmark.end(bench);
      
    }
    
    // adjust my own layout if computed
    if (layout) this.adjust(layout);
    if (this.didReload) this.didReload(invalid === YES ? null : invalid);
    
    
    return this ;
  },
  
  displayProperties: 'isFirstResponder isEnabled isActive'.w(),
  
  /** @private
    If we're asked to render the receiver view for the first time but the 
    child views still need to be added, go ahead and add them.
  */
  render: function(context, firstTime) {
    if (firstTime && this._needsReload) this.reloadIfNeeded ;
    
    // add classes for other state.
    context.setClass('focus', this.get('isFirstResponder'));
    context.setClass('disabled', !this.get('isEnabled'));
    context.setClass('active', this.get('isActive'));

    return sc_super();
  },
    

  _TMP_ATTRS: {},
  _COLLECTION_CLASS_NAMES: ['sc-collection-item'],
  
  /**
    Returns the item view for the content object at the specified index. Call
    this method instead of accessing child views directly whenever you need 
    to get the view associated with a content index.

    Although this method take two parameters, you should almost always call
    it with just the content index.  The other two parameters are used 
    internally by the CollectionView.
    
    If you need to change the way the collection view manages item views
    you can override this method as well.  If you just want to change the
    default options used when creating item views, override createItemView()
    instead.
  
    Note that if you override this method, then be sure to implement this 
    method so that it uses a cache to return the same item view for a given
    index unless "force" is YES.  In that case, generate a new item view and
    replace the old item view in your cache with the new item view.

    @param {Number} idx the content index
    @param {Boolean} rebuild internal use, do not use
    @returns {SC.View} instantiated view
  */
  itemViewForContentIndex: function(idx, rebuild) {
    // return from cache if possible
    var content   = this.get('content'),
        itemViews = this._sc_itemViews,
        item = content.objectAt(idx),
        del  = this.get('contentDelegate'),
        groupIndexes = del.contentGroupIndexes(this, content),
        isGroupView = NO,
        key, ret, E, layout, layerId;

    // use cache if available
    if (!itemViews) itemViews = this._sc_itemViews = [] ;
    if (!rebuild && (ret = itemViews[idx])) return ret ; 

    // otherwise generate...
    
    // first, determine the class to use
    isGroupView = groupIndexes && groupIndexes.contains(idx);
    if (isGroupView) isGroupView = del.contentIndexIsGroup(this, content,idx);
    if (isGroupView) {
      key  = this.get('contentGroupExampleViewKey');
      if (key && item) E = item.get(key);
      if (!E) E = this.get('groupExampleView');

    } else {
      key  = this.get('contentExampleViewKey');
      if (key && item) E = item.get(key);
      if (!E) E = this.get('exampleView');
    }

    // collect some other state
    var attrs = this._TMP_ATTRS;
    attrs.contentIndex = idx;
    attrs.content      = item ;
    attrs.owner        = attrs.displayDelegate = this;
    attrs.parentView   = this.get('containerView') || this ;
    attrs.page         = this.page ;
    attrs.layerId      = this.layerIdFor(idx, item);
    attrs.isEnabled    = del.contentIndexIsEnabled(this, content, idx);
    attrs.isSelected   = del.contentIndexIsSelected(this, content, idx);
    attrs.outlineLevel = del.contentIndexOutlineLevel(this, content, idx);
    attrs.disclosureState = del.contentIndexDisclosureState(this, content, idx);
    attrs.isGroupView  = isGroupView;
    attrs.isVisibleInWindow = this.isVisibleInWindow;
    attrs.classNames = this._COLLECTION_CLASS_NAMES;
    
    layout = this.layoutForContentIndex(idx);
    if (layout) {
      attrs.layout = layout;
    } else {
      delete attrs.layout ;
    }
    
    ret = this.createItemView(E, idx, attrs);
    itemViews[idx] = ret ;
    return ret ;
  },
  
  _TMP_LAYERID: [],
  
  /**
    Primitive to instantiate an item view.  You will be passed the class 
    and a content index.  You can override this method to perform any other
    one time setup.

    Note that item views may be created somewhat frequently so keep this fast.

    *IMPORTANT:* The attrs hash passed is reused each time this method is 
    called.   If you add properties to this hash be sure to delete them before
    returning from this method.
    
    @param {Class} exampleClass example view class
    @param {Number} idx the content index
    @param {Hash} attrs expected attributes
    @returns {SC.View} item view instance
  */ 
  createItemView: function(exampleClass, idx, attrs) {
    return exampleClass.create(attrs);
  },

  /**
    Generates a layerId for the passed index and item.  Usually the default
    implementation is suitable.
    
    @param {Number} idx the content index
    @returns {String} layer id, must be suitable for use in HTML id attribute
  */
  layerIdFor: function(idx) {  
    var ret = this._TMP_LAYERID;
    ret[0] = SC.guidFor(this);
    ret[1] = idx;
    return ret.join('-');
  },
  
  /**
    Extracts the content index from the passed layerID.  If the layer id does
    not belong to the receiver or if no value could be extracted, returns NO.
    
    @param {String} id the layer id
  */
  contentIndexForLayerId: function(id) {
    if (!id || !(id = id.toString())) return null ; // nothing to do
    
    var base = this._baseLayerId;
    if (!base) base = this._baseLayerId = SC.guidFor(this)+"-";
    
    // no match
    if ((id.length <= base.length) || (id.indexOf(base) !== 0)) return null ; 
    var ret = Number(id.slice(id.lastIndexOf('-')+1));
    return isNaN(ret) ? null : ret ;
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
    
    var base    = SC.guidFor(this) + '-',
        baseLen = base.length,
        element = evt.target,
        layer   = this.get('layer'),
        contentIndex = null,
        id, itemView, ret ;
        
    // walk up the element hierarchy until we find this or an element with an
    // id matching the base guid (i.e. a collection item)
    while (element && element !== document && element !== layer) {
      id = element ? element.getAttribute('id') : null ;
      if (id && (contentIndex = this.contentIndexForLayerId(id)) !== null) {
          break;
      }
      element = element.parentNode ; 
    }
    
    // no matching element found? 
    if (contentIndex===null || (element === layer)) {
      element = layer = null; // avoid memory leaks 
      return null;    
    }
    
    // okay, found the DOM node for the view, go ahead and create it
    // first, find the contentIndex
    if (contentIndex >= this.get('length')) {
      throw "layout for item view %@ was found when item view does not exist (%@)".fmt(id, this);
    }
    
    return this.itemViewForContentIndex(contentIndex, NO);
  },
  
  // ..........................................................
  // DISCLOSURE SUPPORT
  // 
  
  /**
    Expands any items in the passed selection array that have a disclosure
    state.
    
    @param {SC.IndexSet} indexes the indexes to expand
    @returns {SC.CollectionView} receiver
  */
  expand: function(indexes) {
    if (!indexes) return this; // nothing to do
    var del     = this.get('contentDelegate'),
        content = this.get('content');
        
    indexes.forEach(function(i) { 
      var state = del.contentIndexDisclosureState(this, content, i);
      if (state === SC.BRANCH_CLOSED) del.contentIndexExpand(this,content,i);
    }, this);
    return this;
  },

  /**
    Collapses any items in the passed selection array that have a disclosure
    state.
    
    @param {SC.IndexSet} indexes the indexes to expand
    @returns {SC.CollectionView} receiver
  */
  collapse: function(indexes) {
    if (!indexes) return this; // nothing to do
    var del     = this.get('contentDelegate'),
        content = this.get('content');
        
    indexes.forEach(function(i) { 
      var state = del.contentIndexDisclosureState(this, content, i);
      if (state === SC.BRANCH_OPEN) del.contentIndexCollapse(this,content,i);
    }, this);
    return this;
  },
  
  // ..........................................................
  // SELECTION SUPPORT
  // 
  
  /** @private 

    Called whenever the selection object is changed to a new value.  Begins
    observing the selection for changes.
    
  */
  _cv_selectionDidChange: function() {  
    var sel  = this.get('selection'),
        last = this._cv_selection,
        func = this._cv_selectionContentDidChange;
        
    if (sel === last) return this; // nothing to do
    if (last) last.removeObserver('[]', this, func);
    if (sel) sel.addObserver('[]', this, func);
    
    this._cv_selection = sel ;
    this._cv_selectionContentDidChange();
  }.observes('selection'),

  /** @private
  
    Called whenever the selection object or its content changes.  This will
    repaint any items that changed their selection state.
  
  */
  _cv_selectionContentDidChange: function() {
    var sel  = this.get('selection'),
        last = this._cv_selindexes, // clone of last known indexes
        content = this.get('content'),
        diff ;

    // save new last
    this._cv_selindexes = sel ? sel.frozenCopy() : null;

    // determine which indexes are now invalid
    if (last) last = last.indexSetForSource(content, NO);
    if (sel) sel = sel.indexSetForSource(content, NO);
    
    if (sel && last) diff = sel.without(last).add(last.without(sel));
    else diff = sel || last;

    if (diff && diff.get('length')>0) this.reloadSelectionIndexes(diff);
  },
  
  /** @private
    Contains the current item views that need their selection to be repainted.
    This may be either NO, YES, or an IndexSet.
  */
  _invalidSelection: NO,
  
  /**
    Called whenever the selection changes.  The passed index set will contain
    any affected indexes including those indexes that were previously 
    selected and now should be deselected.
    
    Pass null to reload the selection state for all items.
    
    @param {SC.IndexSet} indexes affected indexes
    @returns {SC.CollectionView} reciever
  */
  reloadSelectionIndexes: function(indexes) {
    var invalid = this._invalidSelection ;
    if (indexes && (invalid !== YES)) {
      if (invalid) invalid.add(indexes)
      else invalid = this._invalidSelection = indexes.copy();

    } else this._invalidSelection = YES ; // force a total reload
    
    if (this.get('isVisibleInWindow')) {
      this.invokeOnce(this.reloadSelectionIndexesIfNeeded);
    } 
    
    return this ;
  },

  /**
    Reloads the selection state if needed on any dirty indexes.  Normally this
    will run once at the end of the runloop, but you can force the item views
    to reload their selection immediately by calling this method.
    
    You can also override this method if needed to change the way the 
    selection is reloaded on item views.  The default behavior will simply
    find any item views in the nowShowing range that are affected and 
    modify them.
    
    @returns {SC.CollectionView} receiver
  */
  reloadSelectionIndexesIfNeeded: function() {
    var invalid = this._invalidSelection;
    if (!invalid || !this.get('isVisibleInWindow')) return this ; 

    var nowShowing = this.get('nowShowing'),
        reload     = this._invalidIndexes,
        content    = this.get('content'),
        sel        = this.get('selection');
    
    this._invalidSelection = NO; // reset invalid
    
    // fast path.  if we are going to reload everything anyway, just forget
    // about it.  Also if we don't have a nowShowing, nothing to do.
    if (reload === YES || !nowShowing) return this ;
    
    // if invalid is YES instead of index set, just reload everything 
    if (invalid === YES) invalid = nowShowing;

    // if we will reload some items anyway, don't bother
    if (reload && reload.isIndexSet) invalid = invalid.without(reload);

    // iterate through each item and set the isSelected state.
    invalid.forEach(function(idx) {
      if (!nowShowing.contains(idx)) return; // not showing
      var view = this.itemViewForContentIndex(idx);
      if (view) view.set('isSelected', sel ? sel.contains(content, idx) : NO);
    },this);
    
    return this ;
  },
  
  /** 
    Selection primitive.  Selects the passed IndexSet of items, optionally 
    extending the current selection.  If extend is NO or not passed then this
    will replace the selection with the passed value.  Otherwise the indexes
    will be added to the current selection.
    
    @param {Number|SC.IndexSet} indexes index or indexes to select
    @param extend {Boolean} optionally extend the selection
    @returns {SC.CollectionView} receiver
  */
  select: function(indexes, extend) {

    var content = this.get('content'),
        del     = this.get('selectionDelegate'),
        sel;

    // normalize
    if (SC.typeOf(indexes) === SC.T_NUMBER) {
      indexes = SC.IndexSet.create(indexes, 1);
    }

    // if we are passed an empty index set or null, clear the selection.
    if (indexes && indexes.get('length')>0) {
      // give the delegate a chance to alter the items
      indexes = del.collectionViewShouldSelectIndexes(this, indexes, extend);
      if (!indexes || indexes.get('length')===0) return this; // nothing to do
    
    } else indexes = null;

    // build the selection object, merging if needed
    if (extend && (sel = this.get('selection'))) sel = sel.copy();
    else sel = SC.SelectionSet.create();
    if (indexes) sel.add(content, indexes);

    // give delegate one last chance
    sel = del.collectionViewSelectionForProposedSelection(this, sel);
    if (!sel) sel = SC.SelectionSet.create(); // empty
    
    // if we're not extending the selection, clear the selection anchor
    this._selectionAnchor = null ;
    this.set('selection', sel.freeze()) ;  
    return this;
  },
  
  /** 
    Primtive to remove the indexes from the selection.  
    
    @param {Number|SC.IndexSet} indexes index or indexes to select
    @returns {SC.CollectionView} receiver
  */
  deselect: function(indexes) {

    var sel     = this.get('selection'),
        content = this.get('content'),
        del     = this.get('selectionDelegate');
        
    if (!sel || sel.get('length')===0) return this; // nothing to do
        
    // normalize
    if (SC.typeOf(indexes) === SC.T_NUMBER) {
      indexes = SC.IndexSet.create(indexes, 1);
    }

    // give the delegate a chance to alter the items
    indexes = del.collectionViewShouldDeselectIndexes(this, indexes) ;
    if (!indexes || indexes.get('length')===0) return this; // nothing to do

    // now merge change - note we expect sel && indexes to not be null
    sel = sel.copy().remove(content, indexes);
    sel = del.collectionViewSelectionForProposedSelection(this, sel);
    if (!sel) sel = SC.SelectionSet.create(); // empty

    this.set('selection', sel.freeze()) ;
    return this ;
  },
  
  /** @private
   Finds the next selectable item, up to content length, by asking the
   delegate. If a non-selectable item is found, the index is skipped. If
   no item is found, selection index is returned unmodified.

   Return value will always be in the range of the bottom of the current 
   selection index and the proposed index.   
   
   @param {Number} proposedIndex the desired index to select
   @param {Number} bottom optional bottom of selection use as fallback
   @returns {Number} next selectable index. 
  */
  _findNextSelectableItemFromIndex: function(proposedIndex, bottom) {
    
    var lim     = this.get('length'),
        range   = SC.IndexSet.create(), 
        content = this.get('content'),
        del     = this.get('selectionDelegate'),
        ret, sel ;

    // fast path
    if (del.collectionViewShouldSelectIndexes === this.collectionViewShouldSelectIndexes) {
      return proposedIndex;
    }

    // loop forwards looking for an index that is allowed by delegate
    // we could alternatively just pass the whole range but this might be 
    // slow for the delegate
    while (proposedIndex < lim) {
      range.add(proposedIndex);
      ret = del.collectionViewShouldSelectIndexes(this, range);
      if (ret && ret.get('length') >= 1) return proposedIndex ;

      range.remove(proposedIndex);
      proposedIndex++;      
    }

    // if nothing was found, return top of selection
    if (bottom === undefined) {
      sel = this.get('selection');
      bottom = sel ? sel.get('max') : -1 ;
    }
    return bottom ;
  },
  
  /** @private
   Finds the previous selectable item, up to the first item, by asking the
   delegate. If a non-selectable item is found, the index is skipped. If
   no item is found, selection index is returned unmodified.
   
   @param {Integer} proposedIndex the desired index to select
   @returns {Integer} the previous selectable index. This will always be in the range of the top of the current selection index and the proposed index.
   @private
  */
  _findPreviousSelectableItemFromIndex: function(proposedIndex, top) {
    var range   = SC.IndexSet.create(), 
        content = this.get('content'),
        del     = this.get('selectionDelegate'),
        ret ;
    
    // fast path
    if (del.collectionViewShouldSelectIndexes === this.collectionViewShouldSelectIndexes) {
      return proposedIndex;
    }

    // loop backwards looking for an index that is allowed by delegate
    // we could alternatively just pass the whole range but this might be 
    // slow for the delegate
    while (proposedIndex >= 0) {
      range.add(proposedIndex);
      ret = del.collectionViewShouldSelectIndexes(this, range);
      if (ret && ret.get('length') >= 1) return proposedIndex ;
      range.remove(proposedIndex);
      proposedIndex--;      
    }

    // if nothing was found, return top of selection
    if (top === undefined) {
      var sel = this.get('selection');
      top = sel ? sel.get('min') : -1 ;
    }
    return top ;
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
      @returns {SC.CollectionView} receiver
  */
  selectPreviousItem: function(extend, numberOfItems) {
    if (SC.none(numberOfItems)) numberOfItems = 1 ;
    if (SC.none(extend)) extend = false ;
    
    var sel     = this.get('selection'),
        content = this.get('content');
    if (sel) sel = sel.indexSetForSource(content, NO);
    
    var selTop    = sel ? sel.get('min') : -1,
        selBottom     = sel ? sel.get('max')-1 : -1,
        anchor        = this._selectionAnchor;
    if (SC.none(anchor)) anchor = selTop;

    // if extending, then we need to do some fun stuff to build the array
    if (extend) {

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
      selTop = this._findPreviousSelectableItemFromIndex(selTop - numberOfItems);
      if (selTop < 0) selTop = 0 ;
      selBottom = selTop ;
      anchor = null ;
    }
    
    var scrollToIndex = selTop ;
    
    // now build new selection
    sel = SC.IndexSet.create(selTop, selBottom+1-selTop);
    
    // ensure that the item is visible and set the selection
    this.scrollToContentIndex(scrollToIndex) ;
    this.select(sel) ;
    this._selectionAnchor = anchor ;
    return this ;
  },
  
  /**
    Select one or more items folling the current selection, optionally
    extending the current selection.  Also scrolls to selected item.
    
    Selection does not wrap around.
    
    @param extend {Boolean} (Optional) If true, the selection will be extended 
      instead of replaced.  Defaults to false.
    @param numberOfItems {Integer} (Optional) The number of items to be 
      selected.  Defaults to 1.
    @returns {SC.CollectionView} receiver
  */
  selectNextItem: function(extend, numberOfItems) {
    if (SC.none(numberOfItems)) numberOfItems = 1 ;
    if (SC.none(extend)) extend = false ;

    var sel     = this.get('selection'),
        content = this.get('content');
    if (sel) sel = sel.indexSetForSource(content, NO);
    
    var selTop    = sel ? sel.get('min') : -1,
        selBottom = sel ? sel.get('max')-1 : -1,
        anchor    = this._selectionAnchor,
        lim       = this.get('length');
        
    if (SC.none(anchor)) anchor = selTop;

    // if extending, then we need to do some fun stuff to build the array
    if (extend) {
      
      // If the selTop is before the anchor, then reduce the selection
      if (selTop < anchor) {
        selTop = selTop + numberOfItems ;
        
      // otherwise, select the next item after the bottom 
      } else {
        selBottom = this._findNextSelectableItemFromIndex(selBottom + numberOfItems, selBottom);
      }
      
      // Ensure we are not out of bounds
      if (selBottom >= lim) selBottom = lim-1;
      if (selTop > selBottom) selTop = selBottom ;
      
    // if not extending, just select the item next to the selBottom
    } else {
      selBottom = this._findNextSelectableItemFromIndex(selBottom + numberOfItems, selBottom);
      
      if (selBottom >= lim) selBottom = lim-1;
      selTop = selBottom ;
      anchor = null ;
    }
    
    var scrollToIndex = selBottom ;
    
    // now build new selection
    sel = SC.IndexSet.create(selTop, selBottom-selTop+1);
    
    // ensure that the item is visible and set the selection
    this.scrollToContentIndex(scrollToIndex) ;
    this.select(sel) ;
    this._selectionAnchor = anchor ;
    return this ;
  },
    
  /**
    Deletes the selected content if canDeleteContent is YES.  This will invoke 
    delegate methods to provide fine-grained control.  Returns YES if the 
    deletion was possible, even if none actually occurred.
    
    @returns {Boolean} YES if deletion is possible.
  */
  deleteSelection: function() {
    
    // perform some basic checks...
    if (!this.get('canDeleteContent')) return NO;  

    var sel     = this.get('selection'),
        content = this.get('content'),
        del     = this.get('selectionDelegate'),
        indexes = sel&&content ? sel.indexSetForSource(content, NO) : null;
        
    if (!content || !indexes || indexes.get('length') === 0) return NO ;
    
    // let the delegate decide what to actually delete.  If this returns an
    // empty index set or null, just do nothing.
    indexes = del.collectionViewShouldDeleteIndexes(this, indexes);
    if (!indexes || indexes.get('length') === 0) return NO ;
    
    // now have the delegate (or us) perform the deletion. The default 
    // delegate implementation just uses standard SC.Array methods to do the
    // right thing.
    del.collectionViewDeleteContent(this, this.get('content'), indexes);
    
    // also, fix up the selection by removing the actual items we removed
    // set selection directly instead of calling select() since we are just
    // fixing up the selection.
    sel = this.get('selection').copy().remove(content, indexes);
    this.set('selection', sel.freeze());
    
    return YES ;
  },
  
  // ..........................................................
  // SCROLLING
  // 
  
  /**
    Scroll the rootElement (if needed) to ensure that the item is visible.
    
    @param {Number} contentIndex The index of the item to scroll to
    @returns {SC.CollectionView} receiver
  */
  scrollToContentIndex: function(contentIndex) {
    var itemView = this.itemViewForContentIndex(contentIndex) ;
    if (itemView) this.scrollToItemView(itemView) ;
    return this; 
  },
  
  /**
    Scroll the rootElement (if needed) to ensure that the item is visible.

    @param {SC.View} view The item view to scroll to
    @returns {SC.CollectionView} receiver
  */
  scrollToItemView: function(view) {
    
    // TODO: Implement scrollToItemView
    console.warn("SC.CollectionView#scrollToItemView() is not yet implemented in 1.0");
    return this ; 
    
    // find first scrollable view.
    // var scrollable = this ;
    // while(scrollable && (scrollable != SC.window) && (!scrollable.get('isScrollable'))) {
    //   scrollable = scrollable.get('parentNode') ;
    // }
    // if (!scrollable || (scrollable == SC.window)) return ; // no scrollable!
    // scrollable.scrollToVisible(view) ;
  },

  // ..........................................................
  // KEYBOARD EVENTS
  // 
  
  /** @private */
  keyDown: function(evt) {
    console.log('keyDown called on %@'.fmt(this));
    return this.interpretKeyEvents(evt) ;
  },
  
  /** @private */
  keyUp: function() { return true; },
  
  /** @private
    Handle select all keyboard event.
  */
  selectAll: function(evt) {
    var content = this.get('content'),
        sel = content ? SC.IndexSet.create(0, content.get('length')) : null;
    this.select(sel, NO) ;
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
      this._cv_action(itemView, null) ;
    }
    
    return YES ; // always handle
  },

  // ..........................................................
  // MOUSE EVENTS
  // 
  
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
    
    // When the user presses the mouse down, we don't do much just yet.
    // Instead, we just need to save a bunch of state about the mouse down
    // so we can choose the right thing to do later.
    
    // save the original mouse down event for use in dragging.
    this._mouseDownEvent = ev ;
    
    // Toggle selection only triggers on mouse up.  Do nothing.
    if (this.get('useToggleSelection')) return true;
    
    // find the actual view the mouse was pressed down on.  This will call
    // hitTest() on item views so they can implement non-square detection
    // modes. -- once we have an item view, get its content object as well.
    var itemView      = this.itemViewForEvent(ev),
        content       = this.get('content'),
        contentIndex  = itemView ? itemView.get('contentIndex') : -1, 
        info, anchor ;
        
    info = this.mouseDownInfo = {
      itemView: itemView,
      contentIndex: contentIndex,
      at: Date.now()
    };
      
    // become first responder if possible.
    this.becomeFirstResponder() ;
    
    // console.log(mouseDownView);
    
    // recieved a mouseDown on the collection element, but not on one of the 
    // childItems... unless we do not allow empty selections, set it to empty.
    if (!itemView) {
      if (this.get('allowDeselectAll')) this.select(null, false);
      return YES ;
    }
    
    // collection some basic setup info
    var sel = this.get('selection'), isSelected, modifierKeyPressed;
    if (sel) sel = sel.indexSetForSource(content, NO);
    
    isSelected = sel ? sel.contains(contentIndex) : NO;
    info.modifierKeyPressed = modifierKeyPressed = ev.ctrlKey || ev.metaKey ;
    
    // holding down a modifier key while clicking a selected item should 
    // deselect that item...deselect and bail.
    if (modifierKeyPressed && isSelected) {
      info.shouldDeselect = contentIndex >= 0;

    // if the shiftKey was pressed, then we want to extend the selection
    // from the last selected item
    } else if (ev.shiftKey && sel && sel.get('length') > 0) {
      sel = this._findSelectionExtendedByShift(sel, contentIndex);
      anchor = this._selectionAnchor ; 
      this.select(sel) ;
      this._selectionAnchor = anchor; //save the anchor
      
    // If no modifier key was pressed, then clicking on the selected item 
    // should clear the selection and reselect only the clicked on item.
    } else if (!modifierKeyPressed && isSelected) {
      info.shouldReselect = contentIndex >= 0;
      
    // Otherwise, if selecting on mouse down,  simply select the clicked on 
    // item, adding it to the current selection if a modifier key was pressed.
    } else {
      if (this.get("selectOnMouseDown")) {
        this.select(contentIndex, modifierKeyPressed);
      } else {
        info.shouldSelect = contentIndex >= 0 ;
      }
    }
    
    // saved for extend by shift ops.
    info.previousContentIndex = contentIndex;
    
    return YES;
  },
  
  /** @private */
  mouseUp: function(ev) {
    
    var canAct = this.get('actOnSelect'),
        view   = this.itemViewForEvent(ev),
        info   = this.mouseDownInfo,
        idx    = info.contentIndex,
        contentIndex, sel, isSelected, canEdit, itemView;
    
    if (this.get('useToggleSelection')) {
      if (!view) return ; // do nothing when clicked outside of elements
      
      // determine if item is selected. If so, then go on.
      sel = this.get('selection') ;
      contentIndex = (view) ? view.get('contentIndex') : -1 ;
      isSelected = sel && sel.include(contentIndex) ;

      if (isSelected) this.deselect(contentIndex) ;
      else this.select(contentIndex, YES) ;
      
    } else {
      contentIndex = (view) ? view.get('contentIndex') : -1 ;
      
      // this will be set if the user simply clicked on an unselected item and 
      // selectOnMouseDown was NO.
      if (info.shouldSelect) this.select(idx, info.modifierKeyPressed);
      
      // This is true if the user clicked on a selected item with a modifier
      // key pressed.
      if (info.shouldDeselect) this.deselect(idx);
      
      // This is true if the user clicked on a selected item without a 
      // modifier-key pressed.  When this happens we try to begin editing 
      // on the content.  If that is not allowed, then simply clear the 
      // selection and reselect the clicked on item.
      if (info.shouldReselect) {
        
        // - contentValueIsEditable is true
        canEdit = this.get('contentValueIsEditable') ;
        
        // - the user clicked on an item that was already selected
        // - is the only item selected
        if (canEdit) {
          sel = this.get('selection') ;
          canEdit = sel && (sel.get('length') === 1) && sel.contains(idx);
        }
        
        // - the item view responds to contentHitTest() and returns YES.
        // - the item view responds to beginEditing and returns YES.
        if (canEdit) {
          itemView = this.itemViewForContent(idx) ;
          canEdit = itemView && (!itemView.contentHitTest || itemView.contentHitTest(ev)) ;
          canEdit = (canEdit && itemView.beginEditing) ? itemView.beginEditing() : NO ;
        }
        
        // if cannot edit, just reselect
        if (!canEdit) this.select(idx, false) ;
      }
      
      this._cleanupMouseDown() ;
    }
    
    this._mouseDownEvent = null ;
    if (canAct) this._cv_action(ev, view) ;
    
    return NO;  // bubble event to allow didDoubleClick to be called...
  },
  
  /** @private */
  _cleanupMouseDown: function() {
    this._mouseDownEvent = null;
    this.mouseDownInfo = null;
  },
  
  /** @private */
  mouseMoved: function(ev) {
    var view = this.itemViewForEvent(ev), 
        last = this._lastHoveredItem ;

    // handle hover events.
    if (view !== last) {
      if (last && last.mouseOut) last.mouseOut(ev);
      if (view && view.mouseOver) view.mouseOver(ev);
    }
    this._lastHoveredItem = view ;

    if (view && view.mouseMoved) view.mouseMoved(ev);
    return YES;
  },
  
  /** @private */
  mouseOut: function(ev) {
    var view = this._lastHoveredItem ;
    this._lastHoveredItem = null ;
    if (view && view.mouseOut) view.mouseOut(ev) ;
    return YES ;
  },
  
  /** @private */
  doubleClick: function(ev) {
    var view = this.itemViewForEvent(ev) ;
    if (view) {
      this._cv_action(view, ev) ;
      return true ;
    } else return false ;
  },
  
  /** @private */
  _findSelectionExtendedByShift: function(sel, contentIndex) {
    
    // fast path.  if we don't have a selection, just select index
    if (!sel || sel.get('length')===0) {
      return SC.IndexSet.create(contentIndex);
    }
    
    // if we do have a selection, then figure out how to extend it.
    var content = this.get('content'),
        lim     = content.get('length')-1,
        min     = sel.get('min'),
        max     = sel.get('max')-1,
        info    = this.mouseDownInfo,
        anchor  = this._selectionAnchor ;
    if (SC.none(anchor)) anchor = -1;

    // clicked before the current selection set... extend it's beginning...
    if (contentIndex < min) {
      min = contentIndex;
      if (anchor<0) this._selectionAnchor = anchor = max; //anchor at end
    
    // clicked after the current selection set... extend it's ending...
    } else if (contentIndex > max) {
      max = contentIndex;
      if (anchor<0) this._selectionAnchor = anchor = min; // anchor at start
    
    // clicked inside the selection set... need to determine where the last
    // selection was and use that as an anchor.
    } else if (contentIndex >= min && contentIndex <= max) {
      if (anchor<0) this._selectionAnchor = anchor = min; //anchor at start
      
      if (contentIndex === anchor) min = max = contentIndex ;
      else if (contentIndex > anchor) {
        min = anchor;
        max = contentIndex ;
      } else if (contentIndex < anchor) {
        min = contentIndex;
        max = anchor ;
      }
    }

    return SC.IndexSet.create(min, max - min + 1);
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
    
    var del = this.delegateFor('isCollectionViewDelegate', this.delegate, this.get('content'));
    
    // if the mouse down event was cleared, there is nothing to do; return.
    if (this._mouseDownEvent === null) return YES ;
    
    // Don't do anything unless the user has been dragging for 123msec
    if ((Date.now() - this._mouseDownAt) < 123) return YES ;
    
    // OK, they must be serious, decide if a drag will be allowed.
    if (del.collectionViewShouldBeginDrag(this)) {
      
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

  // ..........................................................
  // INSERTION POINT
  // 
  
  
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
  
  // ..........................................................
  // INTERNAL SUPPORT
  // 

  /** @private - when we become visible, reload if needed. */
  _cv_isVisibleInWindowDidChange: function() {
    if (this.get('isVisibleInWindow')) {
      if (this._invalidIndexes) this.invokeOnce(this.reloadIfNeeded);
      if (this._invalidSelection) {
        this.invokeOnce(this.reloadSelectionIndexesIfNeeded);
      } 
    }
  }.observes('isVisibleInWindow'),


  /**
    Default delegate method implementation, returns YES if isSelectable
    is also true.
  */
  collectionViewShouldSelectItem: function(view, item) {
    return this.get('isSelectable') ;
  },
  
  _TMP_DIFF1: SC.IndexSet.create(),
  _TMP_DIFF2: SC.IndexSet.create(),
  
  /** @private
  
    Whenever the nowShowing range changes, update the range observer on the 
    content item and instruct the view to reload any indexes that are not in
    the previous nowShowing range.

  */
  _cv_nowShowingDidChange: function() {
    var nowShowing  = this.get('nowShowing'),
        last        = this._lastNowShowing,
        diff, diff1, diff2;

    // find the differences between the two
    // NOTE: reuse a TMP IndexSet object to avoid creating lots of objects
    // during scrolling
    if (last && nowShowing && (last !== nowShowing)) {
      diff1 = this._TMP_DIFF1.add(last).remove(nowShowing);
      diff2 = this._TMP_DIFF2.add(nowShowing).remove(last);
      diff = diff1.add(diff2);
    } else diff = last || nowShowing ;

    // if nowShowing has actually changed, then update
    if (diff && diff.get('length') > 0) {
      this._lastNowShowing = nowShowing ? nowShowing.frozenCopy() : null ;
      this.updateContentRangeObserver();
      this.reload(diff);
    }
    
    // cleanup tmp objects
    if (diff1) diff1.clear();
    if (diff2) diff2.clear();
    
  }.observes('nowShowing'),
  
  init: function() {
     sc_super();
     this._lastNowShowing = this.get('nowShowing').clone();
     if (this.content) this._cv_contentDidChange();
     if (this.selection) this._cv_selectionDidChange();
  },
  
  /** @private
    Perform the action.  Supports legacy behavior as well as newer style
    action dispatch.
  */
  _cv_action: function(view, evt) {
    // console.log('_cv_action invoked on %@ with view %@, evt %@'.fmt(this, view, evt));
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
