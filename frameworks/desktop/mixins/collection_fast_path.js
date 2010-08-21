/** 
  An experimental CollectionView mixin that makes it extremely fast under
  certain circumstances, including for mobile devices.
*/
SC.CollectionFastPath = {
  //
  // ITEM VIEW CLASS/INSTANCE MANAGEMENT
  //
  initMixin: function() {
    this._indexMap = {};
    this._curShowing = SC.CoreSet.create();
    this._shouldBeShowing = SC.CoreSet.create();
    this._viewsForItem = {};
    this._tempAttrs = {};
  },
  
  contentDidChange: function() {
    // setup range observer
    this.get('content').addRangeObserver(null, this, this.rangeDidChange);
  }.observes('content'),
  
  rangeDidChange: function(array, objects, key, indexes, context) {
    console.log("ROFLCOPTER");
  },
  
  /**
    Returns YES if the item at the index is a group.
    
    @private
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
    Determines the example view for a content index. There are two optional parameters that will
    speed things up: contentObject and isGroupView. If you don't supply them, they must be computed.
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
  
  // copies nowShowing to a coreset and track the largest and smallest index in it
  processNowShowing: function(index) {
    var shouldBeShowing = this._shouldBeShowing;
    
    if(index < this.minShowing) this.minShowing = index;
    if(index > this.maxShowing) this.maxShowing = index;
    
    shouldBeShowing.add(index);
  },


  reloadIfNeeded: function(nowShowing, scrollOnly) {
    var content = this.get('content'),
    curShowing = this._curShowing,
    shouldBeShowing = this._shouldBeShowing,
    i, len, index,
    pendingRemovals = this._pendingRemovals || (this._pendingRemovals = []),
    invalid;
    
    if(!content) return;
    
    // we use the nowShowing to determine what should and should not be showing.
    if (!nowShowing || !nowShowing.isIndexSet) nowShowing = this.get('nowShowing');
    
    if (!scrollOnly) {
      invalid = this._invalidIndexes;
      if (!invalid || !this.get('isVisibleInWindow')) return this;
      this._invalidIndexes = NO; 
      
      // tell others we will be reloading
      if (invalid.isIndexSet && invalid.contains(nowShowing)) invalid = YES ;
      if (this.willReload) this.willReload(invalid === YES ? null : invalid);
    }
   
    // scrolling updates
    shouldBeShowing.clear();
    this.maxShowing = 0;
    this.minShowing = content.length;
    
    // we need to be able to iterate nowshowing more easily, so copy it into a coreset
    nowShowing.forEach(this.processNowShowing, this);
    
    this.topBackground = this.maxShowing;
    this.bottomBackground = this.minShowing;
    
    // find the indices that arent showing any more and pool them
    len = curShowing.length;
    for(i = 0; i < len; i++) {
      index = curShowing[i];
      
      // remove and send to the pool
      if(!shouldBeShowing.contains(index)) {
        // need to use a seperate array to remove after iterating due to the way coreset handles removals
        pendingRemovals.push(this._indexMap[index]);
      }
    }
    
    // now actually queue them
    len = pendingRemovals.length;
    for(i = 0;i < len; i++) {
      this.sendToDOMPool(pendingRemovals.pop());
    }
    
    // adds ourself to the incremental renderer and stops any background rendering
    this.incrementalRenderer.add(this);
    
    // add ourself to be background rendered; it won't actually start until it's ready
    this.backgroundRenderer.add(this);
    
    if(!scrollOnly) {
      var layout = this.computeLayout();
      if (layout) this.adjust(layout);
      if (this.didReload) this.didReload(invalid === YES ? null : invalid);
    }
  },
  
  domPoolSize: 200,

  /**
  @private
    Returns the DOM pool for the given exampleView.
  */
  domPoolForExampleView: function(exampleView) {
    var pools = this._domPools || (this._domPools = {}), guid = SC.guidFor(exampleView),
    pool = pools[guid];
    
    if (!pool) pool = pools[guid] = SC.DoublyLinkedList.create();
    
    return pool;
  },
  
  sendToDOMPool: function(view, background) {
    var exampleView = view.createdFromExampleView,
    pool = this.domPoolForExampleView(exampleView),
    last,
    curShowing = this._curShowing;
    
    if(background) {
      
      // if it is being background rendered it goes in front of the last one background rendered, or on the back if this is the first time
      if(pool._lastRendered) {
        pool.insertBetween(view, pool._lastRendered, pool._lastRendered._next);
        
      } else {
        pool.enqueue(view);
      }
      
       pool._lastRendered = view;
       
    } else {
      pool.enqueue(view);
    }
    
    curShowing.remove(view.contentIndex);
  },
  
  viewFromDOMPoolFor: function(index) {
    var exampleView = this.exampleViewForIndex(index),
    pool = this.domPoolForExampleView(exampleView),
    curShowing = this._curShowing,
    view;
    
    // first see if a pooled view for the item already exists
    if(view = this.pooledViewForItem(index)) {
      pool.remove(view);
    }
    
    // otherwise take one from the pool (null if pool is empty)
    if(!view) view = pool.dequeue();
    
    if(view) {
      return this.unmapView(view);
    }
  },
  
  /**
    Tells ScrollView that this should receive live updates during touch scrolling.
    We are so fast, aren't we?
  */
  _lastTopUpdate: 0,
  _lastLeftUpdate: 0,
  _tolerance: 100,
  
  /**
    The fast-path that computes a special 
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
  
  mapView: function(view, index) {
    var item = this.get('content').objectAt(index),
    views = this._viewsForItem[SC.guidFor(item)] || (this._viewsForItem[SC.guidFor(item)] = SC.CoreSet.create());
    
    // add to cache for item
    views.add(view);
    
    this._indexMap[index] = view;
  },
  
  // looks at the views for an item and then determines if any of them are in a pool. if they are, takes them out and returns them
  pooledViewForItem: function(index) {
    var viewsForItem = this._viewsForItem,
    item = this.get('content').objectAt(index),
    views = viewsForItem[SC.guidFor(item)], view;
    
    if(views) {
      // look for one that isn't in now showing
      var i, len = views.length, exampleView;
      for(i = 0; i < len; i++) {
        view = views[i];
        
        if(!this._shouldBeShowing.contains(view.contentIndex)) {
          return view;
        }
      }
    }
    return null;
  },
  
  unmapView: function(view) {
    var viewsForItem = this._viewsForItem,
    item = this.get('content').objectAt(view.contentIndex),
    views = viewsForItem[SC.guidFor(item)];
    
    views.remove(view);
    this._indexMap[view.contentIndex] = null;
    
    return view;
  },
  
  configureItemView: function(itemView, attrs) {
    // set settings. Self explanatory.
    itemView.beginPropertyChanges();
    itemView.setIfChanged('content', attrs.content);
    itemView.setIfChanged('contentIndex', attrs.contentIndex);
    itemView.setIfChanged('parentView', attrs.parentView);
    itemView.setIfChanged('layerId', attrs.layerId);
    itemView.setIfChanged('isEnabled', attrs.isEnabled);
    itemView.setIfChanged('isSelected', attrs.isSelected);
    itemView.setIfChanged('outlineLevel', attrs.outlineLevel);
    itemView.setIfChanged('layout', attrs.layout);
    itemView.setIfChanged('disclosureState', attrs.disclosureState);
    itemView.setIfChanged('isVisibleInWindow', attrs.isVisibleInWindow);
    itemView.setIfChanged('isGroupView', attrs.isGroupView);
    itemView.setIfChanged('page', this.page);
    itemView.endPropertyChanges();
  },
  
  /**
    This may seem somewhat awkward, but it is for memory performance: this fills in a hash
    YOU provide with the properties for the given content index.
    
    Properties include both the attributes given to the view and some CollectionView tracking
    properties, most importantly the exampleView.
    
    
    @private
  */
  setAttributes: function(index, attrs) {
    var del = this.get('contentDelegate'),
        content = this.get("content"), item = content.objectAt(index),
        isGroupView = this.contentIndexIsGroup(index),
        ExampleView = this.exampleViewForIndex(index);
    
    // 
    // FIGURE OUT "NORMAL" ATTRIBUTES
    //
    attrs.createdFromExampleView = ExampleView;
    attrs.parentView = this.get('containerView') || this;
    attrs.contentIndex = index;
    attrs.owner = attrs.displayDelegate = this;
    attrs.content = item;
    attrs.page = this.page;
    attrs.layerId = this.layerIdFor(index);
    attrs.isEnabled = del.contentIndexIsEnabled(this, content, index);
    attrs.isSelected = del.contentIndexIsSelected(this, content, index);
    attrs.outlineLevel = del.contentIndexOutlineLevel(this, content, index);
    attrs.disclosureState = del.contentIndexDisclosureState(this, content, index);
    attrs.isVisibleInWindow = this.get('isVisibleInWindow');
    attrs.isGroupView = isGroupView;
    attrs.layout = this.layoutForContentIndex(index);
    if (!attrs.layout) attrs.layout = ExampleView.prototype.layout;
  },
  
  // create and configure a view (really slowly)
  renderItem: function(index, attrs) {
    var exampleView = this.exampleViewForIndex(index),
    view;
    
    if(!attrs) {
      attrs = this._tempAttrs;
      this.setAttributes(index, attrs);
    }
    
    view = exampleView.create(attrs);
    //view.createdFromExampleView = exampleView;
    
    this.appendChild(view);
    
    return view;
  },
  
  renderFast: function(index) {
    var view;
    
    // if it already exists in the right place we don't need to do anything
    if(view = this._indexMap[index]) {
      var pool = this.domPoolForExampleView(view.createdFromExampleView);
      pool.remove(view);
      return view;
    
    // we have to do actual work :(
    } else {
      var attrs = this._tempAttrs;
      this.setAttributes(index, attrs);
      
      // if a hidden view already exists for this item or a pooled view exists take it and use it
      if(view = this.viewFromDOMPoolFor(index)) {
        this.configureItemView(view, attrs);
      
      // otherwise it needs to be rendered from scratch
      } else {
        view = this.renderItem(index, attrs);
      }
    }
    
    return view;
  },
  
  // takes the fast path
  renderForeground: function(index) {
    var view = this.renderFast(index);
    
    this._curShowing.add(index);
    this.mapView(view, index);
    
    return view;
  },
  
  // attempts to fill the pool to the desired size before reverting to fast path
  renderBackground: function(index) {
    var exampleView = this.exampleViewForIndex(index),
    pool = this.domPoolForExampleView(exampleView),
    view;
    
    if(pool.length < this.domPoolSize) {
      view = this.renderItem(index);
    } else {
      view = this.renderFast(index);
    }
    
    this.sendToDOMPool(view, YES);
    
    this.mapView(view, index);
    
    return view;
  },
  
  itemViewForContentIndex: function(index) {
    return this.renderForeground(index);
  },
  
  // returns the first index that should be now showing but isnt (yet)
  getNextNowShowing: function() {
    var curShowing = this._curShowing,
    shouldBeShowing = this._shouldBeShowing,
    i, len = shouldBeShowing.length, index;
    
    for(i = 0; i < len; i++) {
      index = shouldBeShowing[i];
      if(!curShowing.contains(index)) return index;
    }
  },
  
  renderNextNowShowing: function() {
    var index = this.getNextNowShowing();
    
    if(index !== undefined) {
      return this.renderForeground(index);
    }
  },
  
  // checks whether a given index is eligible to be rendered
  // TODO: also check if it is invalid and needs to be re-rendered
  canBackgroundRender: function(index) {
    var indexMap = this._indexMap;
    
    // if the top background doesn't exist we can background render it
    // TODO: perhaps make it repool the view here if it finds one
    if((!indexMap[index])) {
      return YES;
    }
    
    return NO;
  },
  
  _parity: YES,
  
  // if you have a collectionview that does something other than show items in order by index, override this
  getNextBackground: function() {
    var content = this.get('content');
    
    // TODO: loop through invalid indices and allow the first one between top and bottom to re-render
    
    while((this.topBackground - this.bottomBackground < this.domPoolSize) && (this.topBackground < content.length - 1 || this.bottomBackground > 0)) {
      
      // alternates between checking top and bottom
      this._parity = !this._parity;
      
      if(this._parity && this.topBackground < content.length - 1) {
        ++this.topBackground;
        if(this.canBackgroundRender(this.topBackground)) return this.topBackground;
        
      } else if(this.bottomBackground > 0){
        --this.bottomBackground;
        if(this.canBackgroundRender(this.bottomBackground)) return this.bottomBackground;
      }
    }
    
  },
  
  topBackground: 0,
  
  bottomBackground: 0,
  
  renderNextBackground: function() {
    var index = this.getNextBackground(),
    exampleView = this.exampleViewForIndex(index),
    pool = this.domPoolForExampleView(exampleView);
    
    // dont render if the last view rendered is the tail
    if(index === undefined  || (pool.length >= this.domPoolSize && pool._lastRendered && pool._lastRendered === pool.head._prev)  ) {
      return;
    }
    
    //console.log("background rendering: ", index);
    
    return this.renderBackground(index);
  },
  
  // need to increase runlimit on desktop
  // runs queued tasks as fast as possible, but gives up control between to let the browser do stuff
  incrementalRenderQueue: SC.TaskQueue.create({
    runWhenIdle: YES,
    
    runLimit: 0,
    
    interval: 0,
    
    minimumIdleDuration: -1
  }),
  
  // static task that all fast collections use to schedule background renderahead
  backgroundRenderer: SC.Task.create({
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
      var views = this.viewsNeedRendering, view,
      i, len = views.length,
      pool;
      
      for(i = 0;i < len;i++) {
        view = views[i];
        for(pool in view._domPools) {
          view._domPools[pool]._lastRendered = null;
        }
      }
    }
  
  }),
  
  incrementalRenderer: SC.Task.create({
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
        SC.CollectionFastPath.backgroundRenderer.start();
      }
    },
    
    // automatically start when added to so views will render asap
    // stops background rendering
    add: function(collectionView) {
      this.viewsNeedRendering.add(collectionView);
      
      if(!this.rendering) {
        SC.CollectionFastPath.backgroundRenderer.stop();
        SC.CollectionFastPath.incrementalRenderQueue.push(this);
        this.rendering = YES;
      }
    }
    
  })
};
