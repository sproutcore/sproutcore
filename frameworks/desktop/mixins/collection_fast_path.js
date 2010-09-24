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
    
    // these are coresets because they need to be iterated a lot
    this._curShowing = SC.CoreSet.create();
    this._shouldBeShowing = SC.CoreSet.create();
    this._viewsForItem = {};
    this._tempAttrs = {};
    
    // this is an index set because they handle ranges better
    this._invalidIndexes = SC.IndexSet.create();
    
    // temporarily disabled for debugging purposes; re-enable when background rendering is better tested
    SC.backgroundTaskQueue.minimumIdleDuration = 100;
  },
  
  _SCCFP_contentRangeObserver: null,
  
  contentDidChange: function() {
    if(this._SCCFP_contentRangeObserver) this._SCCFP_contentRangeObserver.destroy();
    
    var content = this.get('content');
    
    if(content) this._SCCFP_contentRangeObserver = content.addRangeObserver(null, this, this.contentIndicesDidChange);
    
    // TODO: email charles about why observers do setIfChanged no matter what and this function never gets called
    this.reload();
  }.observes('content'),
  
  contentIndicesDidChange: function(array, objects, key, indexes, context) {
    this.reload(indexes);
  },
  
  _cv_nowShowingDidChange: function() {
    if (this.get('isVisibleInWindow')) this.invokeOnce(this.reloadIfNeeded);
  },
  
  reload: function(indexes) {
    if(!this._invalidIndexes) return this;
    
    // just calling reload with no arg means reload EVERYTHING
    if(SC.none(indexes)) {
      // TODO: make this use the old length
      this.invalidate(0, this.getPath('content.length'));
      
    // otherwise only reload what is necessary
    } else {
      this.invalidate(indexes);
    }
      
    if (this.get('isVisibleInWindow')) this.invokeLast(this.reloadIfNeeded);
    
    return this ;
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
  
  wantsUpdate: function(view) {
    if(this._ignore) {
      return;
    }
    
    // if we can't handle it just update it now
    if(view.contentIndex === undefined) {
      view.update();
      
    // make sure the view is currently being rendered
    } else if(this._indexMap[view.contentIndex] === view) {
      
      //console.log("wants update", view.contentIndex);
      this.reload(view.contentIndex);
    
    // if the view was hidden due to changing type, mark it dirty so if it's used again it will update properly
    } else {
      view._SCCFP_dirty = YES;
    }
  },

  reloadIfNeeded: function(nowShowing, scrollOnly) {
    var content = this.get('content'),
    curShowing = this._curShowing,
    shouldBeShowing = this._shouldBeShowing,
    i, len, index,
    pendingRemovals = this._pendingRemovals || (this._pendingRemovals = []),
    invalid, view;
    
    if(!content || !this.get('isVisibleInWindow')) return;
    
    // we use the nowShowing to determine what should and should not be showing.
    if (!nowShowing || !nowShowing.isIndexSet) nowShowing = this.get('nowShowing');
    
    shouldBeShowing.clear();
    this.maxShowing = 0;
    this.minShowing = content.get('length');
  
    // we need to be able to iterate nowshowing more easily, so copy it into a coreset
    nowShowing.forEach(this.processNowShowing, this);
    
    // find the indices that arent showing any more and pool them
    len = curShowing.length;
    for(i = 0; i < len; i++) {
      index = curShowing[i];
    
      // remove and send to the pool
      if(!shouldBeShowing.contains(index)) {
        scrollOnly = YES;
        // not sure what's causing this... it's either a view being pooled twice, something being put in curshowing without being mapped, or something being unmapped without being removed from curshowing
        // or if something was (un)mapped with the wrong contentIndex assigned
        if(!this._indexMap[index]) debugger;
        // need to use a seperate array to remove after iterating due to the way coreset handles removals
        pendingRemovals.push(this._indexMap[index]);
      }
    }
    
    // now actually queue them
    len = pendingRemovals.length;
    for(i = 0;i < len; i++) {
      view = pendingRemovals.pop();
      view = this.updateView(view);
      if(view) this.sendToDOMPool(view);
    }
  
    // just to be sure
    pendingRemovals.length = 0;
    
    // also check for adds
    len = shouldBeShowing.length;
    for(i = 0; i < len; i++) {
      if(!curShowing.contains(shouldBeShowing[i])) scrollOnly = YES;
    }
    
    // scrolling updates
    if(scrollOnly) {
      for(var pool in this._domPools) {
        this._domPools[pool]._lastRendered = null;
      }
    }
    
    // do these no matter what
    
    // we reset these even on non-scrolling updates because data might have been loaded from the server and checking if views exist is cheap
    this.topBackground = this.maxShowing;
    this.bottomBackground = this.minShowing;
    
    // adds ourself to the incremental renderer and stops any background rendering
    this.incrementalRenderer.add(this);
    
    // add ourself to be background rendered; it won't actually start until it's ready
    this.backgroundRenderer.add(this);
    
    // we want to make sure we do this on the first render
    if(curShowing.length === 0 || !scrollOnly) {
      var layout = this.computeLayout();
      if (layout) this.adjust(layout);
    }
  },
  
  // how many elements it will attempt to render at once (including the visible ones)
  domPoolSize: 200,

  /**
  @private
    Returns the DOM pool for the given exampleView.
  */
  domPoolForExampleView: function(exampleView) {
    var pools = this._domPools || (this._domPools = {}), guid = SC.guidFor(exampleView),
    pool = pools[guid];
    
    if (!pool) pool = pools[guid] = SC._DoublyLinkedList.create();
    
    return pool;
  },
  
  sendToDOMPool: function(view, background) {
    if(!view) debugger;
    //console.log("sending to pool", view.contentIndex, background);
    var exampleView = view.createdFromExampleView,
    pool = this.domPoolForExampleView(exampleView),
    last,
    curShowing = this._curShowing;
    
    if(background) {
      
      // if it is being background rendered it goes in front of the last one background rendered, or on the back if this is the first time
      if(pool._lastRendered) {
        pool.insertBetween(view, pool._lastRendered, pool._lastRendered._SCCFP_next);
        
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
    view;
    
    // otherwise take one from the pool (null if pool is empty)
    view = pool.dequeue();
    
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
  
  // the biggest use for this is reusing views that are mapped to undefined; it basically generates blank views on demand. it would be _slightly_ faster to have pre-generated blank views, but this is fine for now
  mapView: function(view, index) {
    var item = view.content,
    views = this._viewsForItem[SC.guidFor(item)] || (this._viewsForItem[SC.guidFor(item)] = SC.CoreSet.create());
  
    // add to cache for item
    views.add(view);
  
    this._indexMap[index] = view;
  },
  
  unmapView: function(view) {
    var viewsForItem = this._viewsForItem,
    item = view.content,
    views = viewsForItem[SC.guidFor(item)];
    
    if(!views) debugger;
  
    views.remove(view);
    
    this._indexMap[view.contentIndex] = null;
    
    return view;
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
        
        if(!this._shouldBeShowing.contains(view.contentIndex) && !this._curShowing.contains(view.contentIndex)) {
          return this.unmapView(view);
        }
      }
    }
    return null;
  },
  
  configureItemView: function(itemView, attrs) {
    // set settings. Self explanatory.
    itemView.beginPropertyChanges();
    itemView.setIfChanged(attrs);
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
  
  updateView: function(view, force) {
    // if the item changed types we have to move the view to an offscreen pool (like the original fastpath) and replace it with a new view for the new type
    var index = view.contentIndex,
    exampleView = this.exampleViewForIndex(index),
    pool = this.domPoolForExampleView(view.createdFromExampleView),
    content = this.get('content'),
    item = content.objectAt(index);
    
    if(exampleView !== view.createdFromExampleView || index >= content.get('length') || index < 0) {
      // make sure it is no longer treated as a rendered view; this is like sendToDOMPool but it leaves it mapped to the item in case the item is rendered later
      this._indexMap[index] = null;
      this._curShowing.remove(index);
    
      // move it off screen
      var f = view.get("frame");
      view.adjust({ top: -f.height });
    
      // push it in front because we want it to get put back somewhere useful asap
      pool.push(view);
      
      // null so we render it later
      view = null;
      
    // if we are going to be keeping the view, make sure that it's updated
    } else if(force || view._SCCFP_dirty || this._invalidIndexes.contains(index)) {
      
      // check if it went invalid because its backing item was changed, and update if so
      if(item !== view.content) {
        // the item the view is mapped to could have changed, so it needs to be remapped
        this.unmapView(view);
        
        view.set('content', item);
        // flush now so we don't get an extra notification later
        SC.Binding.flushPendingChanges();
        
        this.mapView(view, index);
      }
      
      view.update();
      
      view._SCCFP_dirty = NO;
      
      // we just updated so it must be valid
      this.validate(index);
    }
    
    return view;
  },
  
  renderItem: function(exampleView, attrs) {
    var view = exampleView.create(attrs);
    
    SC.Binding.flushPendingChanges();
    this.appendChild(view);
    
    return view;
  },
  
  // create and configure a view (really slowly)
  renderNew: function(index) {
    var exampleView = this.exampleViewForIndex(index), view, attrs;
    
    // if it already exists in the right place we might be able to use the existing view
    if(view = this._indexMap[index]) {
      // if we just rendered it, it is no longer in a pool
      var pool = this.domPoolForExampleView(view.createdFromExampleView);
      if(pool._lastRendered == view) debugger;
      pool.remove(view);
      
      view = this.updateView(view);
    }
    
    if(!view) {
      attrs = this._tempAttrs;
      this.setAttributes(index, attrs);
    
      view = this.renderItem(exampleView, attrs);
    }
    
    this.mapView(view, index);
    
    return view;
  },
  
  renderFast: function(index) {
    var view, exampleView,
    pool;
    
    // if it already exists in the right place we might be able to use the existing view
    if(view = this._indexMap[index]) {
      // if we just rendered it, it is no longer in a pool
      pool = this.domPoolForExampleView(view.createdFromExampleView);
      if(pool._lastRendered == view) debugger;
      pool.remove(view);
      
      view = this.updateView(view);
    }
    
    var attrs = this._tempAttrs;
    this.setAttributes(index, attrs);
    
    // if a view has been rendered for the same item already, just take it and move it into its new position
    if(!view && (view = this.pooledViewForItem(index))) {
      pool = this.domPoolForExampleView(view.createdFromExampleView);
      
      // if we are going to steal the front of the background queue we need to fix it after we're done
      if(view === pool._lastRendered) {
        // if it's the head we need to null it, otherwise just use the next one back
        pool._lastRendered = (view._SCCFP_prev === view ? null : view._SCCFP_prev);
      }
      pool.remove(view);
    
      this.configureItemView(view, attrs);
      
      view = this.updateView(view);
    }

    // if a pooled view exists take it and update it to match its new content    
    if(!view && (view = this.viewFromDOMPoolFor(index))) {
      //console.log("reusing view from ", view.contentIndex, "for", index);
      
      this.configureItemView(view, attrs);
      
      // need to fire observers now or else they will trigger an extra run loop later
      this._ignore = YES;
      SC.Binding.flushPendingChanges();
      this._ignore = NO;
      
      // replace the view or force-update it since we know the content changed
      view = this.updateView(view, YES);
    }
    
    // otherwise it needs to be rendered from scratch
    if(!view) {
      view = this.renderItem(this.exampleViewForIndex(index), attrs);
    }
    
    this.mapView(view, index);
    
    return view;
  },
  
  // takes the fast path
  renderForeground: function(index) {
    var reloaded;
    if (this.willReload) this.willReload(reloaded = SC.IndexSet.create(index));
    
    var view = this.renderFast(index);
    
    // if it was just rendered it's obviously not invalid anymore
    this.validate(index);
    this._curShowing.add(index);
    
    if (this.didReload) this.didReload(reloaded || SC.IndexSet.create(index));
    
    return view;
  },
  
  // attempts to fill the pool to the desired size before reverting to fast path
  renderBackground: function(index) {
    //console.log("rendering to background", index);
    
    var reloaded;
    if (this.willReload) this.willReload(reloaded = SC.IndexSet.create(index));
    
    var exampleView = this.exampleViewForIndex(index),
    pool = this.domPoolForExampleView(exampleView),
    view;
    
    if(pool.length < this.domPoolSize) {
      view = this.renderNew(index);
    } else {
      view = this.renderFast(index);
    }
    
    this.sendToDOMPool(view, YES);
    
    // if it was just rendered it's obviously not invalid anymore
    this.validate(index);
    
    if (this.didReload) this.didReload(reloaded || SC.IndexSet.create(index));
    
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
      if(!curShowing.contains(index) || this._invalidIndexes.contains(index)) return index;
    }
  },
  
  renderNextNowShowing: function() {
    var index = this.getNextNowShowing();
    
    if(index !== undefined) {
      return this.renderForeground(index);
    }
  },
  
  invalidate: function(start, range) {
    this._invalidIndexes.add(start, range);
  },
  
  validate: function(start, range) {
    this._invalidIndexes.remove(start, range);
  },
  
  _parity: YES,
  
  // if you have a collectionview that does something other than show items in order by index, override this
  getNextBackground: function() {
    var content = this.get('content'),
    invalid = this._invalidIndexes, indexMap = this._indexMap,
    i, len = invalid.length, clen = content.get('length'),
    top = this.topBackground, bottom = this.bottomBackground, parity = this._parity, poolSize = this.domPoolSize, ret;
    
    while((top - bottom < poolSize - 1) && (top < clen - 1 || bottom > 0)) {
      // alternates between checking top and bottom
      parity = !parity;
      
      if(parity && top < clen - 1) {
        top++;
        if(!indexMap[top] || invalid.contains(top)) {
          ret = top;
          break;
        }
        
      } else if(bottom > 0) {
        bottom--;
        if(!indexMap[bottom] || invalid.contains(bottom)) {
          ret = bottom;
          break;
        }
      }
    }
    
    // save for next time (otherwise we will simply return values that haven't been loaded yet repeatedly until they load)
    this.topBackground = top;
    this.bottomBackground = bottom;
    this._parity = parity;
    
    return ret;
  },
  
  topBackground: 0,
  
  bottomBackground: 0,
  
  renderNextBackground: function() {
    var index = this.getNextBackground();
    
    if(index === undefined) return;
    
    var exampleView = this.exampleViewForIndex(index),
    pool = this.domPoolForExampleView(exampleView),
    view;
    
    if(pool._lastRendered && !pool.head) debugger;

    // if the last rendered is the tail and is about to be reused, that means we're done
    if(pool.length >= this.domPoolSize && pool._lastRendered && (pool._lastRendered === pool.head._SCCFP_prev)) {
      pool._lastRendered = null;
      return;
    }
    
    //console.log("background rendering: " + index);
    
    if(this._invalidIndexes.contains(index) && (view = this._indexMap[index])) {
      view = this.updateView(view);
    }
    
    if(!view) {
      view = this.renderBackground(index);
    }
    
    return view;
  },
  
  // need to increase runlimit on desktop
  // runs queued tasks as fast as possible, but gives up control between to let the browser do stuff
  incrementalRenderQueue: SC.TaskQueue.create({
    runWhenIdle: YES,
    
    // assume that touch devices have less performance
    runLimit: SC.platform.touch ? -1 : 10,
    
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
        var view,
        i, len = views.length,
        pool;

        for(i = 0;i < len;i++) {
          view = views[i];
          for(pool in view._domPools) {
            view._domPools[pool]._lastRendered = null;
          }
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
