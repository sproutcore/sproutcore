/** 
  A mixin for CollectionView that increases scrolling speed by implementing
  several improvements to rendering speed:
  
  Most importantly, it leaves views in DOM after they have left the visible area so that if they are scrolled back to no work has to be donw. The number of views it leaves in DOM are customizable by changing DOMPoolSize. For simply itemViews this can be set to a fairly large value and the browser will take care of scrolling on its own.
  
  CollectionFastPath aggressively fills its DOM pool by using the backgroundTaskQueue to render extra views when the user is inactive, so that short scrolls are extremely responsive as long as they remain with the background rendered area.
  
  It also keeps track of which what item each view is currently representing, so that if items are duplicated views can be re-used without any rendering. This is most useful when the collection is connected to a sparse array and many items are still waiting to be filled in by the server. Instead of rendering a new view for each item, it simply re-uses views that have been mapped to undefined. It is also useful if the view can be changed between different subsets of data within the dataset.
  
  It keeps any view that has gone offscreen in a queue and attempts to re-use views from that pool because simple views can be updated much faster than they can be re-rendered.
  
  To compensate for the larger number of views onscreen, CollectionFastPath handles view updates so that only its chidren that are actually visible are allowed to re-render. Offscreen children must wait for time in the background queue.
  
  Despite all this work to increase rendering speed, if it is still unable to render fast enough it uses setTimeout to break up rendering passes so that the browser will remain responsive.
  
  For these features to work correctly on non ListViews, you must override getNextBackground and should also override getNextNowShowing or else views will be rendered in the wrong order.
  
  For maximum speed, there are a few other things you can do:
  * inline css for item views
  * override layoutForContentIndex to give all item views a fixed width (otherwise resizing will be slow)
*/
SC.CollectionFastPath = {
  //
  // ITEM VIEW CLASS/INSTANCE MANAGEMENT
  //
  initMixin: function() {
    // these are coresets because they are very easy to iterate
    this._curShowing = SC.CoreSet.create();
    this._shouldBeShowing = SC.CoreSet.create();
    
    this._indexMap = [];
    // used for view to item map
    this._viewsForItem = {};
    
    // cached object for initializing views without creating a new object
    this._tempAttrs = {};
    
    // make the background task queue run more aggressively
    SC.backgroundTaskQueue.minimumIdleDuration = 100;
    
    // make sure the background task queue only runs once  before setting another timer no matter what
    SC.backgroundTaskQueue.runLimit = -1;
  },
  
  /**
    @private
    
    Attemps to render a view for the given index as quickly as possible. It does the by being as lazy as possible.
    
    First, it checks if there is already a view for the given index. If there is it uses that view.
    Then it checks if there is already a view rendered for that item that it can take. It is allowed to be taken if it is dirty and needs to be re-rendered anyway or if it is not visible.
    It then checks if there is a pooled view of the same type as the desired view that it can re-use by just updating it.
    Finally, if it couldn't do any of them it just renders a new view.
    
    After each check it attempts to update the view which may invalidate the view and cause it to fallback to the next step if, for example, the view type changed. 
  */
  renderFromPool: function(index) {
    //console.log("rendering index " + index);
    var view, exampleView, attrs;
    
    // if it already exists in the right place we might be able to use the existing view
    if(view = this._indexMap[index]) {
      this.unpool(view);
      
      // TODO: skip to the next step if the view actually does need an update
      view = this.updateView(view);
    }
    
    if(!view) attrs = this.attributesForIndex(index);
    
    // if a view has been rendered for the same item already, just take it and move it into its new position
    while(!view && (view = this.pooledViewForItem(index))) {
      this.unpool(view);
      
      view = this.updateView(view, attrs, YES);
    }

    // if a pooled view exists take it and update it to match its new content    
    while(!view && (view = this.viewFromDOMPoolFor(index))) {
      this.unpool(view);
      // replace the view or force-update it since we know the content changed
      view = this.updateView(view, attrs, YES);
    }
    
    // otherwise it needs to be rendered from scratch
    if(!view) view = this.renderItem(this.exampleViewForIndex(index), attrs);
    
    this.mapToItem(view);
    this.mapToIndex(view);
    
    return view;
  },
  
  _SCCFP_contentRangeObserver: null,
  
  _cv_contentDidChange: function() {
    if(this._SCCFP_contentRangeObserver) this._SCCFP_contentRangeObserver.destroy();
    
    var content = this.get('content');
    
    if(content) this._SCCFP_contentRangeObserver = content.addRangeObserver(null, this, this.contentIndicesDidChange);
    
    var indexMap = this._indexMap, i, len = indexMap.length, view;
    
    for(i = 0; i < len; i++) {
      view = indexMap[i];
      if(view) this.sendToOffscreenDOMPool(view);
    }
    
    // TODO: email charles about why observers do setIfChanged no matter what and this function never gets called
    this.reload();
    
    // this is at the end so contentLengthDidChange runs after our iteration
    sc_super();
  }.observes('content'),
  
  contentLengthDidChange: function() {
    var content = this.get('content'), length = content ? content.get('length') : 0,
    oldLength = this.get('length'), indexMap = this._indexMap;
    
    // if the content became shorter, send the extra views offscreen so they don't show up in bouncybounce
    if(length < oldLength) {
      var i, view;
      
      for(i = length; i < oldLength; i++) {
        view = indexMap[i];
        if(view) this.sendToOffscreenDOMPool(view);
      }
    }
    
    indexMap.length = length;
    
    this.set('length', length);
    
    // update the layout of the collection view itself
    var layout = this.computeLayout();
    if (layout) this.adjust(layout);
  },
  
  contentIndicesDidChange: function(array, objects, key, indexes, context) {
    this.reload(indexes);
  },
  
  _cv_nowShowingDidChange: function() {
    if (this.get('isVisibleInWindow')) this.invokeOnce(this.reloadIfNeeded);
  },
  
  /**
    Gives the passed indices a chance to update.
    
    @param {SC.IndexSet|Number} the index or indices to reload
  */
  reload: function(indexes) {
    // just calling reload with no arg means reload EVERYTHING
    if(SC.none(indexes)) {
      var i, len = this._indexMap.length;
      
      for(i = 0; i < len; i++) this.invalidate(i);
      
    // otherwise only reload what is necessary
    } else if(indexes.isIndexSet) {
      indexes.forEach(this.invalidate, this);
      
    } else {
      this.invalidate(indexes);
    }
      
    if (this.get('isVisibleInWindow')) this.invokeLast(this.reloadIfNeeded);
    
    return this ;
  },

  /**
    @private
    
    Returns YES if the item at the index is a group.
  */
  contentIndexIsGroup: function(index, contentObject) {
    var contentDelegate = this.get("contentDelegate");
    
    // setup our properties
    var groupIndexes = this.get('_contentGroupIndexes'), isGroupView = NO;
    
    // and do our checking
    isGroupView = groupIndexes && groupIndexes.contains(index);
    if (isGroupView) isGroupView = contentDelegate.contentIndexIsGroup(this, this.get("content"), index);
    
    // and return
    return isGroupView;
  },
  
  /**
    @private
    
    Determines the example view for a content index. It simply uses the groupExampleView if the item is a group, or the exampleView otherwise.
  */
  exampleViewForIndex: function(index) {
    var del = this.get('contentDelegate'),
        groupIndexes = this.get('_contentGroupIndexes'),
        key, ExampleView,
        content = this.get('content'), item = content.objectAt(index),
        isGroupView = this.contentIndexIsGroup(index, item);

    if (isGroupView) {
      // so, if it is indeed a group view, we go that route to get the example view
      key = this.get('contentGroupExampleViewKey');
      if (key && item) ExampleView = item.get(key);
      if (!ExampleView) ExampleView = this.get('groupExampleView') || this.get('exampleView');
    } else {
      // otherwise, we go through the normal example view
      key = this.get('contentExampleViewKey');
      if (key && item) ExampleView = item.get(key);
      if (!ExampleView) ExampleView = this.get('exampleView');
    }

    return ExampleView;
  },
  
  /**
    @private
    
    Copies nowShowing to a CoreSet and tracks the largest and smallest index in it so the background renderer knows where to start.
  */
  processNowShowing: function(index) {
    if(index < this._minShowing) this._minShowing = index;
    if(index > this._maxShowing) this._maxShowing = index;
    
    this._shouldBeShowing.add(index);
  },
  
  /**
    Item views should call this and pass a reference to themselves when they have detected that they need to re-render. This dirties the view and triggers a new rendering cycle.
    
    @param {SC.View} the view that wants an update
  */
  wantsUpdate: function(view) {
    // when we re-use a view we just ignore the update because we don't want to wait for the next runloop
    if(this._ignore) return;
    
    //console.log("wantsUpdate", view.contentIndex);
    
    if(this._indexMap[view.contentIndex] === view) {
      this.reload(view.contentIndex);
    
    // if the view was hidden, mark it dirty so if it's used again it will update properly
    } else {
      view._SCCFP_dirty = YES;
    }
  },
  
  /**
    @private
    
    After the first view is sent to the DOM pool in the background, successive ones go in front of it. This resets the background queue so insertions go to the back again.
  */
  _SCCFP_resetBackgroundRenderQueue: function() {
    for(var pool in this._DOMPools) {
      this._DOMPools[pool]._lastRendered = null;
    }
  },
  
  /**
    If we are scrolling or an item changed, update the collection view.
    
    @param {SC.IndexSet} the items that should be showing
    @param {Boolean} whether this is a scrolling update or not (scrolling updates perform less work to keep it smooth)
  */
  reloadIfNeeded: function(nowShowing, scrollOnly) {
    var content = this.get('content'), clen = content ? content.get('length') : 0,
    curShowing = this._curShowing,
    shouldBeShowing = this._shouldBeShowing,
    i, len, index,
    pendingRemovals = this._pendingRemovals || (this._pendingRemovals = []),
    view;
    
    if(!this.get('isVisibleInWindow')) return;
    
    // we use the nowShowing to determine what should and should not be showing.
    if (!nowShowing || !nowShowing.isIndexSet) nowShowing = this.get('nowShowing');
    
    shouldBeShowing.clear();
    this._maxShowing = 0;
    this._minShowing = clen;
  
    // we need to be able to iterate nowshowing more easily, so copy it into a coreset
    nowShowing.forEach(this.processNowShowing, this);
    
    // we reset these even on non-scrolling updates because data might have been loaded from the server and checking if views exist is cheap
    // TODO: determine if we actually need to keep these values seperately
    this._topBackground = this._maxShowing;
    this._bottomBackground = this._minShowing;
    
    // find the indices that arent showing any more and pool them
    len = curShowing.length;
    for(i = 0; i < len; i++) {
      index = curShowing[i];
    
      // remove and send to the pool
      if(!shouldBeShowing.contains(index)) {
        scrollOnly = YES;
        if(!this._indexMap[index]) throw "cannot pull null view";
        // need to use a seperate array to remove after iterating due to the way coreset handles removals
        pendingRemovals.push(this._indexMap[index]);
      }
    }
    
    // now actually queue them
    while(view = pendingRemovals.pop()) {
      view = this.updateView(view);
      if(view) this.sendToDOMPool(view);
    }
    
    // also check for adds, but don't bother if scrollOnly is already true
    if(!scrollOnly) {
      len = shouldBeShowing.length;
      for(i = 0; i < len; i++) {
        if(!curShowing.contains(shouldBeShowing[i])) scrollOnly = YES;
      }
    }
    
    // do these no matter what
    
    // prepare the background renderer for the next cycle
    this._SCCFP_resetBackgroundRenderQueue();
    
    // adds ourself to the incremental renderer and stops any background rendering
    this.incrementalRenderTask.add(this);
    
    // add ourself to be background rendered; it won't actually start until it's ready
    this.backgroundRenderTask.add(this);
    
    // if we aren't scrolling, update the layout just to make sure
    if(!scrollOnly) {
      this.contentLengthDidChange();
    }
  },
  
  // how many elements it will attempt to render at once (including the visible ones)
  DOMPoolSize: 200,

  /**
    @private
    
    Returns the DOM pool for the given exampleView. Different view types are pooled seperately because you don't want items suddenly being represented by a different type of view.
    
    @param {Class} the class of the view to get the pool for
    @returns {SC.CollectionFastPath._DoublyLinkedList} the pool for the given view type
  */
  DOMPoolForExampleView: function(exampleView) {
    var pools = this._DOMPools || (this._DOMPools = {}), guid = SC.guidFor(exampleView),
    pool = pools[guid];
    
    if(!exampleView) "no exampleView to create from";
    
    if (!pool) pool = pools[guid] = SC.CollectionFastPath._DoublyLinkedList.create();
    
    return pool;
  },
  
  /**
    @private
    
    Enqueues the given view in the DOM pool for its type. If this is being done for a background renderer, it inserts it in front of the last background pooled view.
    
    @params {SC.View} the view to pool
    @params {Boolean} whether to pool it in background mode or not
    @returns {SC.View}
  */
  sendToDOMPool: function(view, background) {
    if(!view) "cannot pool null view";
    //console.log("sending to pool", view.contentIndex, background);
    var exampleView = view.createdFromExampleView,
    pool = this.DOMPoolForExampleView(exampleView),
    curShowing = this._curShowing;
    
    if(background) {
      // if it is being background rendered it goes in front of the last one background rendered, or on the back if this is the first time
      if(pool._lastRendered) pool.insertBetween(view, pool._lastRendered, pool._lastRendered._SCCFP_next);
      // otherwise it goes to the front of the queue like normal
      else pool.enqueue(view);
      
      // we need to keep track of where it was inserted so we know where to insert further background rendered items
      pool._lastRendered = view;
    
    } else {
      pool.enqueue(view);
    }
    
    // it is no longer visible to the user so remove it from curShowing
    curShowing.remove(view.contentIndex);
    
    return view;
  },
  
  /**
    @private
    Does the same thing as sendToDOMPool except it also unmaps the view from its currently mapped index and it puts it in the front of the queue instead of the back.
    
    @param {SC.View}
    @returns {SC.View}
  */
  sendToOffscreenDOMPool: function(view) {
    var index = view.contentIndex, height, rowSpacing, rowPadding,
    pool = this.DOMPoolForExampleView(view.createdFromExampleView);
    
    //console.log("sending offscreen " + view.content.get('fullName'));
    
    // it is no longer rendering an index, only an item, so remove it from the index map but leave it in the item map
    this.unmapFromIndex(view);
    
    // pooled items cant be in nowShowing
    this._curShowing.remove(index);
  
    // move it off screen
    height = view.get("frame").height;
    if(rowSpacing = this.get('rowSpacing')) height += rowSpacing;
    if(rowPadding = this.get('rowPadding')) height += rowPadding * 2;
    view.adjust({ top: -height});
    
    // push it in front because we want it to get put back somewhere useful asap
    this.unpool(view);
    pool.push(view);
  },
  
  /**
    @private
    
    Looks up the exampleView that should be used to render the given index and then dequeues a view from that type's pool.
    
    @param {Number} the index of the item to retrieve a view for
    @returns {SC.View} a view that can be used for that item, or null
  */
  viewFromDOMPoolFor: function(index) {
    var exampleView = this.exampleViewForIndex(index),
    pool = this.DOMPoolForExampleView(exampleView);
    
    return pool.tail();
  },
  
  /**
    uhhhhh...alex?
  */
  touchScrollDidChange: function(left, top) {
    // prevent getting too many in close succession.
    if (Date.now() - this._lastTouchScrollTime < 25) return;
    
    var clippingFrame = this.get('clippingFrame');
    
    var cf = this._inScrollClippingFrame || (this._inScrollClippingFrame = {x: 0, y: 0, width: 0, height: 0});
    cf.x = clippingFrame.x; cf.y = clippingFrame.y; cf.width = clippingFrame.width; cf.height = clippingFrame.height;
    
    // update
    cf.x = left;
    cf.y = top;
    
    var r = this.contentIndexesInRect(cf);
    if (!r) return; // no rect, do nothing.
    
    var len = this.get('length'), 
        max = r.get('max'), min = r.get('min');

    if (max > len || min < 0) {
      r = r.copy();
      r.remove(len, max-len).remove(min, 0-min).freeze();
    }
    
    if (this._lastNowShowing) {
      if (r.contains(this._lastNowShowing) && this._lastNowShowing.contains(r)) return;
    }
    this._lastNowShowing = r;
    this.reloadIfNeeded(r, YES);
    
    this._lastTouchScrollTime = Date.now();
  },
  
  /**
    @private
    This maps a view to an index so it can be looked up later when you need to find the view for an index. It gets the index to map to from the view itself.
    
    @param {SC.View} the view to map
    @returns {SC.View}
  */
  mapToIndex: function(view) {
    var index = view.contentIndex;
    
    // a view should never get mapped ontop of another view, you should always unmap then remap
    if(this._indexMap[index] && this._indexMap[index] != view) throw "index already mapped";
    
    this._indexMap[index] = view;
    
    return view;
  },
  
  /**
    @private
    Removes a view from its mapping. Also clears the view's contentIndex property so we can tell that the view is no longer mapped.
    
    @param {SC.View}
    @returns {SC.View}
  */
  unmapFromIndex: function(view) {
    this._indexMap[view.contentIndex] = null;
    // if it is no longer mapped to an index, it shouldn't remember its old index
    view.contentIndex = null;
    
    return view;
  },
  
  /**
    @private
    
    This maps a view to an item. The biggest use for this in a simple list is reusing views that are mapped to undefined because your collection is a sparseArray that is waiting on data from the server. It is also useful if your collection can switch between different views of the same dataset.
    
    @param {SC.View}
    @returns {SC.View}
  */
  mapToItem: function(view) {
    var item = view.content,
    guid = SC.guidFor(item),
    views = this._viewsForItem[guid] || (this._viewsForItem[guid] = SC.CoreSet.create());

    // add to cache for item
    views.add(view);
    
    return view;
  },
  
  /**
    @private
    
    Removes a view from the map for the item it is currently mapped to.
    
    @param {SC.View}
    @returns {SC.View}
  */
  unmapFromItem: function(view) {
    var item = view.content,
    views = this._viewsForItem[SC.guidFor(item)];

    if(!views) "no view to unmap";

    views.remove(view);

    return view;
  },
  
  /**
    @private
    
    Looks up the list of views that are mapped to the item at the given index. Returns the first one it finds that is offscreen or dirty, and thus can be reused.
    
    @param {Number} index in the content to find a view for
    @returns {SC.View} the view found or null
  */
  pooledViewForItem: function(index) {
    var viewsForItem = this._viewsForItem,
    item = this.get('content').objectAt(index),
    views = viewsForItem[SC.guidFor(item)], view,
    oldIndex;
    
    if(views) {
      // look for one that isn't in now showing
      var i, len = views.length;
      for(i = 0; i < len; i++) {
        view = views[i];
        oldIndex = view.contentIndex;
        
        // even if it should be showing, we can steal it if it's currently dirty or offscreen
        if(!this._shouldBeShowing.contains(oldIndex) || view._SCCFP_dirty || SC.none(view.contentIndex)) {
          return view;
        }
      }
    }
    return null;
  },
  
  /**
    @private
    
    SetsIfChanged all the properties in attrs on to itemView.
    Note: adjust creates an object no matter what, so there's not point in using it. It still may be worth checking if the layout actually changed.
    
    @param {SC.View} the view to configure
    @param {Hash} the hash of properties to apply
    @returns {SC.View}
  */
  configureItemView: function(itemView, attrs) {
    itemView.beginPropertyChanges();
    
    itemView.setIfChanged(attrs);
    
    itemView.endPropertyChanges();
    
    return itemView;
  },
  
  /**
    @private
    
    Since we don't mess with our children's layerIds like CollectionView does, this simply looks up the view and returns its contentIndex propoerty.
    
    @param {String} the layerId to find the index for
    @returns {Number}
  */
  contentIndexForLayerId: function(id) {
    var view = SC.View.views[id];
    
    if(view && !SC.none(view.contentIndex)) return view.contentIndex;
    else return null;
  },
  
  /**
    @private
    
    Fills in a cached hash with the properties needed to build a view representing the given index.
    Properties include both the attributes given to the view and some CollectionView tracking
    properties, most importantly the exampleView.
    
    @params {Number}
    @returns {Hash}
  */
  attributesForIndex: function(index) {
    var del = this.get('contentDelegate'),
        content = this.get('content'), item = content.objectAt(index),
        isGroupView = this.contentIndexIsGroup(index),
        ExampleView = this.exampleViewForIndex(index),
        attrs = this._tempAttrs;
    
    attrs.createdFromExampleView = ExampleView;
    attrs.parentView = this.get('containerView') || this;
    attrs.contentIndex = index;
    attrs.owner = attrs.displayDelegate = this;
    attrs.content = item;
    attrs.page = this.page;
    attrs.isEnabled = del.contentIndexIsEnabled(this, content, index);
    attrs.isSelected = del.contentIndexIsSelected(this, content, index);
    attrs.outlineLevel = del.contentIndexOutlineLevel(this, content, index);
    attrs.disclosureState = del.contentIndexDisclosureState(this, content, index);
    attrs.isVisibleInWindow = this.get('isVisibleInWindow');
    attrs.isGroupView = isGroupView;
    attrs.layout = this.layoutForContentIndex(index);
    if (!attrs.layout) attrs.layout = ExampleView.prototype.layout;
    
    return attrs;
  },
  
  // TODO: make sure the first part of the if never triggers outside of the indexMap check in renderFromPool
  updateView: function(view, attrs, force) {
    // if an attribute hash is provided to update to, use that as the target index
    var oldIndex = view.contentIndex,
    newIndex = attrs ? attrs.contentIndex : view.contentIndex,
    exampleView = this.exampleViewForIndex(newIndex),
    content = this.get('content'),
    item = content.objectAt(newIndex);
    
    // if the item changed types we have to move the view to an offscreen pool (like the original fastpath) and replace it with a new view for the new type    
    if(exampleView !== view.createdFromExampleView || newIndex >= content.get('length') || newIndex < 0) {
      this.sendToOffscreenDOMPool(view);
      
      // null so we render it later
      view = null;
      
    // if we are going to be keeping the view, make sure that it's updated
    // TODO: make sure these conditions are accurate
    } else if(force || view._SCCFP_dirty || item !== view.content || oldIndex !== newIndex) {
      // remapping is cheap so just do it no matter what
      this.unmapFromItem(view);
      
      if(!SC.none(oldIndex)) {
        this.unmapFromIndex(view);
        // if we are mapping it to a new index it needs to be removed from curShowing. even if we arent, its just going to get added again anyway
        this._curShowing.remove(oldIndex);
      }
      
      // TODO: make sure this isn't too slow
      if(!attrs) attrs = this.attributesForIndex(newIndex);
      // update whatever changed
      this._ignore = YES;
      this.configureItemView(view, attrs);
      
      // need to fire observers now or else they will trigger an extra run loop later
      SC.RunLoop.currentRunLoop.flushAllPending();
      this._ignore = NO;
      
      view.update();
      
      // remap it now that we have updated it
      this.mapToIndex(view);
      this.mapToItem(view);
      
      // we just updated so it must be valid
      view._SCCFP_dirty = NO;
      this.validate(newIndex);
    }
    
    return view;
  },
  /**
    @private
  
    Creates a view with the given attributes.
    
    @param {Class} the class to instantiate the new view from
    @param {Hash} property hash to create the view with
    @returns {SC.View}
  */
  renderItem: function(exampleView, attrs) {
    this._ignore = YES;
    var view = exampleView.create(attrs);
    
    this.appendChild(view);
    
    SC.RunLoop.currentRunLoop.flushAllPending();
    this._ignore = NO;
    
    return view;
  },
  
  /**
    @private
    
    Creates and configures a view. This function is much slower than renderFromPool, and as such is only used for background rendering.
    It checks it a view is already rendered for the index but does none of the other checks that renderFromPool does.
    
    @param {Number} the view to render
    @returns {SC.View}
  */
  renderNewView: function(index) {
    var view, attrs;
    
    // if it already exists in the right place we might be able to use the existing view
    if(view = this._indexMap[index]) {
      this.unpool(view);
      
      view = this.updateView(view);
    }
    
    if(!view) {
      attrs = this.attributesForIndex(index);
    
      view = this.renderItem(this.exampleViewForIndex(index), attrs);
    }
    
    this.mapToItem(view);
    this.mapToIndex(view);
    
    return view;
  },
  
  /**
    @private
    
    Removes the given view from any pools it is in. If it wasn't in a pool this does nothing.
    
    @param {SC.View} the view to remove from its pool
    @returns {SC.View}
  */
  // TODO: give this a pool argument for caching
  unpool: function(view) {
    var pool = this.DOMPoolForExampleView(view.createdFromExampleView);
    
    // if we are going to steal the front of the background queue we need to fix it after we're done
    if(view === pool._lastRendered) {
      // if it's the head we need to null it, otherwise just use the next one back
      pool._lastRendered = (view._SCCFP_prev === view ? null : view._SCCFP_prev);
    }
    
    pool.remove(view);
    
    return view;
  },
  
  /**
    @private
    
    Renders a view that is visible to the user using the fastest method available.
  */
  renderForeground: function(index) {
    var reloaded;
    if (this.willReload) this.willReload(reloaded = SC.IndexSet.create(index));
    
    var view = this.renderFromPool(index);
    
    // if it was just rendered it's obviously not invalid anymore
    this.validate(index);
    this._curShowing.add(index);
    
    if (this.didReload) this.didReload(reloaded || SC.IndexSet.create(index));
    
    return view;
  },
  
  /**
    @private
    
    Renders a view that the user cannot see. If the pool still has room, it creates a new view. Otherwise it also uses the fast path.
    Regardless of how the view is rendered, it gets put into the pool for later re-use.
  */
  renderBackground: function(index) {
    //console.log("rendering to background", index);
    var reloaded,
    exampleView = this.exampleViewForIndex(index),
    pool = this.DOMPoolForExampleView(exampleView),
    view;
    if (this.willReload) this.willReload(reloaded = SC.IndexSet.create(index));
    
    // create a new view if the pool has room, otherwise just take the fast path
    if(pool.length < this.DOMPoolSize) view = this.renderNewView(index);
    else view = this.renderFromPool(index);
    
    this.sendToDOMPool(view, YES);
    
    // if it was just rendered it's obviously not invalid anymore
    this.validate(index);
    
    if (this.didReload) this.didReload(reloaded || SC.IndexSet.create(index));
    
    return view;
  },
  
  /**
    Attempts to locate a view for the index as quickly as possible. Treats the view as a foreground view because even if it isn't in nowShowing, it will just get pooled next render cycle anyway.
    
    @param {Number} the index to get a view for
    @returns {SC.View}
  */
  itemViewForContentIndex: function(index) {
    return this.renderForeground(index);
  },
  
  /**
    @private
    
    Returns the next index that is visible to the user that needs to be re-rendered.
    This does not need to be overriden to work with a custom CollectionView, but if you override it to return items in the order they came on screen it will look better.
    
    @returns {Number} the next index visible to the user that needs to be rendered
  */
  getNextNowShowing: function() {
    var curShowing = this._curShowing,
    shouldBeShowing = this._shouldBeShowing,
    i, len = shouldBeShowing.length, index,
    indexMap = this._indexMap, view;
    
    for(i = 0; i < len; i++) {
      index = shouldBeShowing[i];
      view = indexMap[index];
      if(!curShowing.contains(index) || !view || view._SCCFP_dirty) return index;
    }
  },
  
  /**
    @private
    
    Renders the next view that is visible to the user, if there is one.
    
    @returns {SC.View} the view that was rendered if there was one
  */
  renderNextNowShowing: function() {
    var index = this.getNextNowShowing();
    
    if(index !== undefined) {
      return this.renderForeground(index);
    }
  },
  
  /**
    @private
    
    Marks the view at the given index as dirty.
  */
  invalidate: function(index) {
    var view = this._indexMap[index];
    
    if(view) view._SCCFP_dirty = YES;
  },
  
  /**
    @private
    
    Marks the view at the given index as clean.
  */
  validate: function(index) {
    var view = this._indexMap[index];
    
    if(view) view._SCCFP_dirty = NO;
  },
  
  // used to keep track of where we are background rendering
  _topBackground: 0,
  _bottomBackground: 0,
  _parity: YES,
  /**
    @private
    
    Returns the next index that should be background rendered. By default it chooses indices in order of distance from nowShowing, alternating between going up and down.
    Returns undefined when distance between top and bottom is DOMPoolSize.
    Unlike getNextNowShowing, this should be overriden if your view lays out its children in a different order from SC.ListView (i.e. in order by index) or else views will not be background rendered in a useful way.
    
    @returns {Number} the next index to background render
  */
  getNextBackground: function() {
    var content = this.get('content'), clen = content.get('length'),
    indexMap = this._indexMap, view,
    top = this._topBackground, bottom = this._bottomBackground, parity = this._parity, poolSize = this.DOMPoolSize, ret;
    
    while((top - bottom < poolSize - 1) && (top < clen - 1 || bottom > 0)) {
      // alternates between checking top and bottom
      parity = !parity;
      
      // checks the top and moves up, looking for a missing or dirty view
      if(parity && top < clen - 1) {
        view = indexMap[++top];
        if(!view || view._SCCFP_dirty) {
          ret = top;
          break;
        }
      
      // checks the bottom and moves down
      } else if(bottom > 0) {
        view = indexMap[--bottom];
        if(!view || view._SCCFP_dirty) {
          ret = bottom;
          break;
        }
      }
    }
    
    // save for next time (otherwise we will simply return values that haven't been loaded yet repeatedly until they load, which is inefficient)
    this._topBackground = top;
    this._bottomBackground = bottom;
    this._parity = parity;
    
    return ret;
  },
  
  /**
    @private
    
    Calls getNextBackground to get the next index to background render. If it is undefined or the dom pool is full, it returns undefined so the background renderer stops being called.
    
    @returns {SC.View} the view rendered, if there was one
  */
  renderNextBackground: function() {
    var index = this.getNextBackground();
    
    if(index === undefined) return;
    
    var exampleView = this.exampleViewForIndex(index),
    pool = this.DOMPoolForExampleView(exampleView),
    view;
    
    if(pool._lastRendered && !pool.head) throw "New background render cycle started but last rendered view was not cleared";

    // if the last rendered is the tail and is about to be reused, that means we're done
    if(pool.length >= this.DOMPoolSize && pool._lastRendered && (pool._lastRendered === pool.head._SCCFP_prev)) {
      pool._lastRendered = null;
      return;
    }
    
    //console.log("background rendering: " + index);
    
    view = this._indexMap[index];
    
    if(view && view._SCCFP_dirty) {
      view = this.updateView(view);
    }
    
    if(!view) {
      view = this.renderBackground(index);
    }
    
    return view;
  },
  
  // runs queued tasks as fast as possible, but gives up control between to let the browser do stuff
  incrementalRenderQueue: SC.TaskQueue.create({
    runWhenIdle: YES,
    
    // assume that touch devices have less performance and can only render one at a time no matter what
    runLimit: SC.platform.touch ? -1 : 10,
    
    interval: SC.platform.touch ? 50 : 1,
    
    // doesn't care when the last runloop was
    minimumIdleDuration: -1
  }),
  
  /**
    @private
    
    Task that is shared between CollectionViews implementing fastPath that renders views in the background.
  */
  backgroundRenderTask: SC.Task.create({
    _cur: 0,
    
    rendering: NO,
    
    viewsNeedRendering: SC.CoreSet.create(),
    
    run: function(queue) {
      if(!this.rendering) return;
      
      var views = this.viewsNeedRendering,
      targetCollection;
      
      if(this._cur >= views.length) this._cur = 0;
      
      targetCollection = views[this._cur];
      
      if(targetCollection.renderNextBackground()) {
        this._cur++;
      } else {
        views.remove(targetCollection);
      }
      
      if(views.length > 0) {
        queue.push(this);
        
      } else {
        var i, len = views.length;

        // TODO: see if i actually need to do this
        for(i = 0;i < len;i++) {
          views[i]._SCCFP_resetBackgroundRenderQueue();
        }
        
        this.stop();
      }
    },
    
    // DOESNT RENDER AUTOMATICALLY
    add: function(collectionView) {
      this.viewsNeedRendering.add(collectionView);
    },
    
    // starts a new background rendering cycle
    start: function() {
      if(!this.rendering) {
        SC.backgroundTaskQueue.push(this);
        this.rendering = YES;
      }
    },
    
    // ends a cycle by clearing the lastRendered values
    stop: function() {
      this.rendering = NO;
    }
  
  }),
  
  incrementalRenderTask: SC.Task.create({
    _cur: 0,
    
    rendering: NO,
    
    viewsNeedRendering: SC.CoreSet.create(),
    
    run: function(queue) {
      var views = this.viewsNeedRendering,
      targetCollection;
      
      if(this._cur >= views.length) this._cur = 0;
      
      targetCollection = views[this._cur];
      
      if(targetCollection.renderNextNowShowing()) {
        this._cur++;
      } else {
        views.remove(targetCollection);
      }
      
      if(views.length > 0) {
        queue.push(this);
      } else {
        this.rendering = NO;
        
        // now that we are done rendering the important views kick off the background task
        SC.CollectionFastPath.backgroundRenderTask.start();
      }
    },
    
    // automatically start when added to so views will render asap
    // stops background rendering
    add: function(collectionView) {
      this.viewsNeedRendering.add(collectionView);
      
      if(!this.rendering) {
        SC.CollectionFastPath.backgroundRenderTask.stop();
        SC.CollectionFastPath.incrementalRenderQueue.push(this);
        this.rendering = YES;
      }
    }
    
  }),
  
  // these are probably dangerous to override, but generally your children don't actually need to know and notifying all <DOMPoolSize> of them is expensive
  // TODO: make these cheaper on the children instead of just not notifying them
  _viewFrameDidChange: function() {
    this.notifyPropertyChange('frame');
  },
  
  viewDidResize: function() {
    this._viewFrameDidChange();
  }
};

/**
  Circular doubly linked list created for queue in CollectionFastPath. Not suitable for general use.
  TODO: make generic
 */
SC.CollectionFastPath._DoublyLinkedList = SC.mixin({}, {
  head: null,

  length: 0,

  create: function(item) {
    var ret = SC.beget(this);
  
    if(item) ret.init(item);
  
    ret.enqueue = ret.unshift;
    ret.dequeue = ret.pop;
  
    return ret;
  },

  insertBetween: function(item, prev, next) {
    if(!next || !prev) throw "invalid insertion";
    prev._SCCFP_next = item;
    item._SCCFP_prev = prev;
  
    next._SCCFP_prev = item;
    item._SCCFP_next = next;
  
    this.length++;
    return item;
  },

  remove: function(item) {
    var prev = item._SCCFP_prev,
    next = item._SCCFP_next,
    head = this.head;
  
    // if the item to be removed isn't actually in the a list, don't remove it
    if(!(next && prev && head)) return;
  
    next._SCCFP_prev = prev;
    prev._SCCFP_next = next;
  
    this.length--;
  
    if(item === head) {
      if(head._SCCFP_next === head) {
        this.head = null;
      } else {
        this.head = next;
      }
    }
  
  
    item._SCCFP_next = null;
    item._SCCFP_prev = null;
  
    return item;
  },

  init: function(item) {
      this.head = item;
      item._SCCFP_next = item;
      item._SCCFP_prev = item;
    
      this.length++;
      return this;
  },

  push: function(item) {
    var head = this.head;
  
    if(head) {
      this.insertBetween(item, head._SCCFP_prev, head);
    } else {
      this.init(item);
    }
  
    return this;
  },

  pop: function() {
    var head = this.head;
  
    if(head) return this.remove(head._SCCFP_prev);
  },

  unshift: function(item) {
    var head = this.head;
  
    if(head) {
      this.insertBetween(item, head._SCCFP_prev, head);
      this.head = item;
    
    } else {
      this.init(item);
    }
  
    return this;
  },

  shift: function() {
    return this.remove(this.head);
  },

  tail: function() {
    var head = this.head;
  
    if(head) return head._SCCFP_prev;
  }
});
