/** 
  An experimental CollectionView mixin that makes it extremely fast under
  certain circumstances, including for mobile devices.
  
  Note: if you use this, override layoutForContentIndex to have fixed sizes for elements, otherwise resizing will be incredibly slow.
*/
SC.CollectionFastPath = {
  //
  // ITEM VIEW CLASS/INSTANCE MANAGEMENT
  //
  initMixin: function() {
    this._indexMap = [];
    
    // these are coresets because they need to be iterated a lot
    this._curShowing = SC.CoreSet.create();
    this._shouldBeShowing = SC.CoreSet.create();
    this._viewsForItem = {};
    this._tempAttrs = {};
    
    // make the background task queue run more aggressively
    SC.backgroundTaskQueue.minimumIdleDuration = 100;
    
    // make sure the background task queue only runs once  before setting another timer no matter what
    SC.backgroundTaskQueue.runLimit = -1;
  },
  
  _SCCFP_contentRangeObserver: null,
  
  _SCCFP_oldLength: 0,
  
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
    
    if(length < oldLength) {
      var i, view;
      
      for(i = length; i < oldLength; i++) {
        view = indexMap[i];
        if(view) this.sendToOffscreenDOMPool(view);
      }
    }
    
    indexMap.length = length;
    
    sc_super();
  },
  
  contentIndicesDidChange: function(array, objects, key, indexes, context) {
    this.reload(indexes);
  },
  
  _cv_nowShowingDidChange: function() {
    if (this.get('isVisibleInWindow')) this.invokeOnce(this.reloadIfNeeded);
  },
  
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
    if(index < this.minShowing) this.minShowing = index;
    if(index > this.maxShowing) this.maxShowing = index;
    
    this._shouldBeShowing.add(index);
  },
  
  wantsUpdate: function(view) {
    if(this._ignore) return;
    
    //console.log("wantsUpdate", view.contentIndex);
    
    if(this._indexMap[view.contentIndex] === view) {
      this.reload(view.contentIndex);
    
    // if the view was hidden, mark it dirty so if it's used again it will update properly
    } else {
      view._SCCFP_dirty = YES;
    }
  },

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
    this.maxShowing = 0;
    this.minShowing = clen;
  
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
    while(view = pendingRemovals.pop()) {
      view = this.updateView(view);
      if(view) this.sendToDOMPool(view);
    }
    
    // also check for adds
    len = shouldBeShowing.length;
    for(i = 0; i < len; i++) {
      if(!curShowing.contains(shouldBeShowing[i])) scrollOnly = YES;
    }
    
    // scrolling updates
    
    // reset the pointer into the list so background insertions go to the back correctly
    if(scrollOnly) {
      for(var pool in this._domPools) {
        this._domPools[pool]._lastRendered = null;
      }
    }
    
    // do these no matter what
    
    // we reset these even on non-scrolling updates because data might have been loaded from the server and checking if views exist is cheap
    // TODO: determine if we actually need to keep these values seperately
    this.topBackground = this.maxShowing;
    this.bottomBackground = this.minShowing;
    
    // adds ourself to the incremental renderer and stops any background rendering
    this.incrementalRenderer.add(this);
    
    // add ourself to be background rendered; it won't actually start until it's ready
    this.backgroundRenderer.add(this);
    
    // if the content length changed we need to relayout
    // TODO: hook this into collectionview's _cv_contentDidChange
    if(this._SCCFP_oldLength !== clen) {
      var layout = this.computeLayout();
      if (layout) this.adjust(layout);
      this._SCCFP_oldLength = clen;
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
    if(!exampleView) debugger;
    if (!pool) pool = pools[guid] = SC._DoublyLinkedList.create();
    
    return pool;
  },
  
  sendToDOMPool: function(view, background) {
    if(!view) debugger;
    //console.log("sending to pool", view.contentIndex, background);
    var exampleView = view.createdFromExampleView,
    pool = this.domPoolForExampleView(exampleView),
    curShowing = this._curShowing;
    
    if(background) {
      
      // if it is being background rendered it goes in front of the last one background rendered, or on the back if this is the first time
      if(pool._lastRendered) pool.insertBetween(view, pool._lastRendered, pool._lastRendered._SCCFP_next);
      else pool.enqueue(view);
      
      pool._lastRendered = view;
       
    } else {
      pool.enqueue(view);
    }
    
    curShowing.remove(view.contentIndex);
  },
  
  // like the regular version except it also removes it from its index mapping, moves it offscreen, and pushes it to the front of the pull instead of the back
  sendToOffscreenDOMPool: function(view) {
    var index = view.contentIndex, height, rowSpacing, rowPadding,
    pool = this.domPoolForExampleView(view.createdFromExampleView);
    
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
  
  viewFromDOMPoolFor: function(index) {
    var exampleView = this.exampleViewForIndex(index),
    pool = this.domPoolForExampleView(exampleView);
    
    return pool.tail();
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
  mapToIndex: function(view) {
    var index = view.contentIndex;
    
    // a view should never get mapped ontop of another view, you should always unmap then remap
    if(this._indexMap[index] && this._indexMap[index] != view) debugger;
    
    this._indexMap[index] = view;
    
    return view;
  },
  
  unmapFromIndex: function(view) {
    this._indexMap[view.contentIndex] = null;
    // if it is no longer mapped to an index, it shouldn't remember its old index
    view.contentIndex = null;
    
    return view;
  },
  
  mapToItem: function(view) {
    var item = view.content,
    guid = SC.guidFor(item),
    views = this._viewsForItem[guid] || (this._viewsForItem[guid] = SC.CoreSet.create());

    // add to cache for item
    views.add(view);
    
    return view;
  },
  
  unmapFromItem: function(view) {
    var item = view.content,
    views = this._viewsForItem[SC.guidFor(item)];

    if(!views) debugger;

    views.remove(view);

    return view;
  },
  
  // returns a view that already exists for an item if it can find one that is not showing
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
        
        // even if it should be showing, we can steal it if it's currently invalid
        if(!this._shouldBeShowing.contains(oldIndex) || view._SCCFP_dirty || SC.none(view.contentIndex)) {
          return view;
        }
      }
    }
    return null;
  },
  
  // aplies a hash to a view
  // TODO: consider combining this and setAttributes (i don't think we actually need an intermediate object)
  configureItemView: function(itemView, attrs) {
    itemView.beginPropertyChanges();
    itemView.setIfChanged(attrs);
    itemView.endPropertyChanges();
    
    return itemView;
  },
  
  contentIndexForLayerId: function(id) {
    var view = SC.View.views[id];
    
    if(view && !SC.none(view.contentIndex)) return view.contentIndex;
    else return null;
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
        content = this.get('content'), item = content.objectAt(index),
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
    //attrs.layerId = this.layerIdFor(index);
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
  
  /*  inlining this; keeping original around in case i need to change it
  flushBindings: function() {
    while(SC.Binding.flushPendingChanges());
  },*/
  
  // TODO: make sure the first part of the if never triggers outside of the indexMap check in renderFast
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
    } else if(force || view._SCCFP_dirty || item !== view.content || oldIndex !== newIndex || SC.none(oldIndex)) {
      // remapping is cheap so just do it no matter what
      this.unmapFromItem(view);
      
      if(!SC.none(oldIndex)) {
        this.unmapFromIndex(view);
        // if we are mapping it to a new index it needs to be removed from curShowing. even if we arent, its just going to get added again anyway
        this._curShowing.remove(oldIndex);
      }
      
      // TODO: make sure this isn't too slow
      if(!attrs) attrs = this.setAttributes(newIndex, this._tempAttrs);
      /*
      var cname = view.content ? view.content.get('fullName') : "undefined",
      aname = attrs.content ? attrs.content.get('fullName') : "undefined";
      console.log("updating view " + cname + " to " + aname);
      */
      // update whatever changed
      this._ignore = YES;
      this.configureItemView(view, attrs);
      
      // need to fire observers now or else they will trigger an extra run loop later
      while(SC.Binding.flushPendingChanges());
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
  
  renderItem: function(exampleView, attrs) {
    this._ignore = YES;
    var view = exampleView.create(attrs);
    
    this.appendChild(view);
    
    while(SC.Binding.flushPendingChanges());
    this._ignore = NO;
    
    return view;
  },
  
  // create and configure a view (really slowly)
  renderNew: function(index) {
    var view, attrs;
    //var cname, aname;
    
    // if it already exists in the right place we might be able to use the existing view
    if(view = this._indexMap[index]) {
      /*cname = view.content ? view.content.get('fullName') : "undefined";
      console.log("found view already at index " + index + " (" + cname + ")");*/
      this.unpool(view);
      
      view = this.updateView(view);
    }
    
    if(!view) {
      attrs = this.setAttributes(index, this._tempAttrs);
      
      /*aname = attrs.content ? attrs.content.get('fullName') : "undefined";
      console.log("rendering new view for " + aname);*/
    
      view = this.renderItem(this.exampleViewForIndex(index), attrs);
    }
    
    this.mapToItem(view);
    this.mapToIndex(view);
    
    return view;
  },
  
  // removes the view from its pool if it was in one
  // TODO: give this a pool argument for caching
  unpool: function(view) {
    var pool = this.domPoolForExampleView(view.createdFromExampleView);
    
    // if we are going to steal the front of the background queue we need to fix it after we're done
    if(view === pool._lastRendered) {
      // if it's the head we need to null it, otherwise just use the next one back
      pool._lastRendered = (view._SCCFP_prev === view ? null : view._SCCFP_prev);
    }
    
    pool.remove(view);
  },
  
  renderFast: function(index) {
    //console.log("rendering index " + index);
    var view, exampleView, attrs;
    //var cname, aname;
    
    // if it already exists in the right place we might be able to use the existing view
    if(view = this._indexMap[index]) {
      /*cname = view.content ? view.content.get('fullName') : "undefined";
      console.log("found view already at index " + index + " (" + cname + ")");*/
      this.unpool(view);
      
      // TODO: consider if the item backing this index has changed, skip to the next step
      
      view = this.updateView(view);
    }
    
    if(!view) attrs = this.setAttributes(index, this._tempAttrs);
    
    // if a view has been rendered for the same item already, just take it and move it into its new position
    while(!view && (view = this.pooledViewForItem(index))) {
      /*cname = view.content ? view.content.get('fullName') : "undefined";
      console.log("attempting to reuse view for " + cname);*/
      this.unpool(view);
      
      view = this.updateView(view, attrs, YES);
    }

    // if a pooled view exists take it and update it to match its new content    
    while(!view && (view = this.viewFromDOMPoolFor(index))) {
      /*cname = view.content ? view.content.get('fullName') : "undefined";
      aname = attrs.content ? attrs.content.get('fullName') : "undefined";
      console.log("using pooled view " + cname + " for " + aname);*/
      this.unpool(view);
      // replace the view or force-update it since we know the content changed
      view = this.updateView(view, attrs, YES);
    }
    
    // otherwise it needs to be rendered from scratch
    if(!view) {
      /*aname = attrs.content ? attrs.content.get('fullName') : "undefined";
      console.log("rendering new view for " + aname);*/
      
      view = this.renderItem(this.exampleViewForIndex(index), attrs);
    }
    
    this.mapToItem(view);
    this.mapToIndex(view);
    
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
    var reloaded,
    exampleView = this.exampleViewForIndex(index),
    pool = this.domPoolForExampleView(exampleView),
    view;
    if (this.willReload) this.willReload(reloaded = SC.IndexSet.create(index));
    
    // create a new view if the pool has room, otherwise just take the fast path
    if(pool.length < this.domPoolSize) view = this.renderNew(index);
    else view = this.renderFast(index);
    
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
    i, len = shouldBeShowing.length, index,
    indexMap = this._indexMap, view;
    
    for(i = 0; i < len; i++) {
      index = shouldBeShowing[i];
      view = indexMap[index];
      if(!curShowing.contains(index) || !view || view._SCCFP_dirty) return index;
    }
  },
  
  renderNextNowShowing: function() {
    var index = this.getNextNowShowing();
    
    if(index !== undefined) {
      return this.renderForeground(index);
    }
  },
  
  invalidate: function(index) {
    var view = this._indexMap[index];
    
    if(view) view._SCCFP_dirty = YES;
  },
  
  validate: function(index) {
    var view = this._indexMap[index];
    
    if(view) view._SCCFP_dirty = NO;
  },
  
  _parity: YES,
  
  // if you have a collectionview that does something other than show items in order by index, override this
  getNextBackground: function() {
    var content = this.get('content'), clen = content.get('length'),
    indexMap = this._indexMap, view,
    top = this.topBackground, bottom = this.bottomBackground, parity = this._parity, poolSize = this.domPoolSize, ret;
    
    while((top - bottom < poolSize - 1) && (top < clen - 1 || bottom > 0)) {
      // alternates between checking top and bottom
      parity = !parity;
      
      if(parity && top < clen - 1) {
        top++;
        view = indexMap[top];
        if(!view || view._SCCFP_dirty) {
          ret = top;
          break;
        }
        
      } else if(bottom > 0) {
        bottom--;
        view = indexMap[bottom];
        if(!view || view._SCCFP_dirty) {
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
    
    view = this._indexMap[index];
    
    if(view && view._SCCFP_dirty) {
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
    
    // assume that touch devices have less performance and can only render one at a time no matter what
    runLimit: SC.platform.touch ? -1 : 10,
    
    interval: 1,
    
    // doesn't care when the last runloop was
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

// TODO: see if i actually need to do this
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
    
  }),
  
  // these are probably dangerous to override, but generally your children don't actually need to know and notifying all <domPoolSize> of them is expensive
  // TODO: make these cheaper on the children instead of just not notifying them
  _viewFrameDidChange: function() {
    this.notifyPropertyChange('frame');
  },
  
  viewDidResize: function() {
    this._viewFrameDidChange();
  }
};
