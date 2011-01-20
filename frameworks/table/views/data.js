// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2009 Sprout Systems, Inc. and contributors.
//            Portions ©2008-2009 Apple Inc. All rights reserved.
// License:   Licened under MIT license (see license.js)
// ==========================================================================

SC.DataView = SC.ListView.extend({

  /**
    Setting this to 'undefined' lets the 'contentValueKey' property
    be determined by SC.ListItemView instead of SC.ListItem.  It forces

      del.getDelegateProperty('contentValueKey', del) 

    in SC.ListItemView.displayValue() to ask itself instead of 'del' for
    the 'contentValueKey'.
  */
  contentValueKey: undefined,
  
  
  /**
    The view that will wrap the cells of a row
  */
  rowView: SC.View.extend(SC.Control,{
    classNames: ['sc-dataview-row', 'sc-list-item-view'],
    
  
    render: function(context, firstTime) {
      var content = this.get('content'),
        classArray = [];
    
      // add alternating row classes
      classArray.push((this.get('contentIndex') % 2 === 0) ? 'even' : 'odd');
      context.addClass(classArray);
      sc_super();
    }
  }),
  
  
  columnViews: function() {
    var containerView = this.get('containerView') || this;
    containerView.createLayer();
    return [containerView];
  }.property('columns').cacheable(),


  _cv_columnViewsDidChange: function() {
    this.reload();
  }.observes('columnViews'),
  
  
  
  /**
     Returns the appropriate value from the content based on row and column number

     @private
  */
  valueForRowAndColumnInTableView: function(row, column, tableView) {
    var ds = this.get('content');
    if (ds){
      var item = ds.objectAt(row),
        columns = tableView.get('columns');
        column = columns.objectAt(column);
      var  key = column.get('key');
      var ret = null;
      if (item){
        if (item.get){
          ret = item.get(key);
        }
        else
        {
          ret = item[key];
        }
      }
      return ret;
    }
  },
  
  /**
     Returns layout for row and column, or just for row if column is not specified

     @private
  */
  layoutForContentIndex: function(contentIndex,i) {
     if (SC.none(i)){
       return sc_super();
     }
     var columns = this.get('columns');
     return {
       top:0,
       bottom:0,
       width:columns.objectAt(i).get('width')
     };
   },
  
   /**
      Returns a view instance for the given row and column

      @param {Number} row the row index
      @param {Number} column the column index
   */
  viewForCell: function(row, column) {
    var itemViews = this._sc_itemViews;
    var view = itemViews[row].childViews[column];
      
    if(!view){
      return NO;  
    }

    return view;
  },
  
  /**
      Returns a clone of the layer for the view at the given row and column

      @param {Number} row the row index
      @param {Number} column the column index
   */
  ghostLayerForCell: function(row, column) {
    var itemViews = this._sc_itemViews;
    var view = itemViews[row].childViews[column];
    var layer;
      
    if(!view){
      return NO;  
    }

    layer = view.get('layer').cloneNode(YES);
    layer.style.top='%@px'.fmt(itemViews[row].get('layout').top);
    return layer;
  },
  
  _generateRowViewInstance: function(col, rowViewInstance, layout, isVisibleInWindow, idx, parentView, layerId, isEnabled, item, isSelected, outlineLevel, disclosureState){
    
    //TODO [AP]: rowViews should be cached too. Also consider cell selection
    
    var columns = this.get('columns'),
        rowView = this.get('rowView');
    if (columns[col]!==null && !rowViewInstance){
      rowViewInstance = this.createChildView(rowView.design({
        layout:layout,
        isVisibleInWindow:isVisibleInWindow,
        contentIndex:idx,
        parentView:parentView,
        layerId:layerId,
        isEnabled:isEnabled,
        content:item,
        isSelected:isSelected,
        outlineLevel:outlineLevel,
        disclosureState:disclosureState
      }));
    }
    return rowViewInstance;
  },
  
  /**
      Determines if a content item is selected

      @private
   */
  isSelected: function(item) {
    var sel = this.get('selection');
    return sel ? sel.contains(this.get('content'), item) : NO;
  },

  /** @private */
  computeLayout: function() {
    var ret = this._sclv_layout;
    if (!ret) ret = this._sclv_layout = {};
    ret.minHeight = this.rowOffsetForContentIndex(this.get('length'))+4;
    ret.minWidth = this.get('calculatedWidth');
    this.set('calculatedHeight',ret.minHeight);
    return ret ;
  },
  
  /**
    Internal method for itemViewForContentIndex. Returns an item view from the pool if possible, or creates a new one.
    You will not usually need to call this method yourself
    
  */
  createItemViewForContentIndex: function(layout,isVisibleInWindow,idx,parentView,layerId,isEnabled,item,isSelected,outlineLevel,disclosureState,E,viewPoolKey,isGroupView,itemViews){
    var ret, rowViewInstance,
        columns = this.get('columns'),
        rowView = this.get('rowView') || SC.View;
    
    for (var i=0;i<columns.length;i++)
    {
      ret=null;
      rowViewInstance = this._generateRowViewInstance(i, rowViewInstance, layout, isVisibleInWindow, idx, parentView, layerId, isEnabled, item, isSelected, outlineLevel, disclosureState);
      
      E = columns[i].get('exampleView');
     
      
      // If the view is reusable and there is an appropriate view inside the
      // pool, simply reuse it to avoid having to create a new view.
      if (E  &&  E.isReusableInCollections) {
        ret = this._retrieveViewFromPool(viewPoolKey,idx,rowViewInstance,i,layerId,isEnabled,isSelected,outlineLevel,disclosureState,isVisibleInWindow, parentView, layout, E, item);
        
      }

      // If we weren't able to re-use a view, then create a new one.
      if (!ret) { 
        ret = this._createNewItemView(idx,item,rowViewInstance,parentView, i, layerId, isEnabled, isSelected, outlineLevel, disclosureState, isGroupView, isVisibleInWindow, layout, E);
      }

      itemViews[idx] = rowViewInstance;
    }
    
    return rowViewInstance;
    
  },
  
  /**
     Internal method for itemViewForContentIndex. Creates a new item view.
     You will not usually need to call this method yourself

     @private
   */
  _createNewItemView: function(idx,item,rowViewInstance,parentView, col, layerId, isEnabled, isSelected, outlineLevel, disclosureState, isGroupView, isVisibleInWindow, layout, E){
    //console.log(col);
    var columns = this.get('columns'),
        ret;
    
    // collect some other state
    var attrs = this._TMP_ATTRS;
    attrs.contentIndex      = idx;
    attrs.content           = item;
    attrs.owner             = attrs.displayDelegate = this;
    attrs.parentView        = rowViewInstance || parentView;   // Same here; shouldn't be needed
    attrs.page              = this.page;
    attrs.layerId           = rowViewInstance?this.layerIdFor(idx,col):layerId;
    attrs.isEnabled         = isEnabled;
    attrs.isSelected        = isSelected;
    attrs.outlineLevel      = outlineLevel;
    attrs.disclosureState   = disclosureState;
    attrs.isGroupView       = isGroupView;
    attrs.isVisibleInWindow = isVisibleInWindow;
    if (isGroupView) attrs.classNames = this._GROUP_COLLECTION_CLASS_NAMES.copy();
    else attrs.classNames = this._COLLECTION_CLASS_NAMES.copy();
    if(rowViewInstance){
      attrs.classNames.push('column-'+col);
      if (col===0){
        attrs.classNames.push('first');
      }
      attrs.column = columns[col];
      attrs.contentValueKey = columns[col].get('key');
      attrs.isSelectedBinding = '*parentView.isSelected';
    }

    if (layout) {
      attrs.layout = rowViewInstance?this.layoutForContentIndex(idx,col):layout;
    } else {
      delete attrs.layout ;
    }

    ret = rowViewInstance? rowViewInstance.createChildView(E,attrs):this.createItemView(E, idx, attrs);

    if (rowViewInstance){
      rowViewInstance.get('childViews').push(ret);
      ret = null;
    }
    
    return rowViewInstance;
  },
  
  /**
    Internal method for itemViewForContentIndex. Retrieves a view instance from the pool, if possible.
    You will not usually need to call this method yourself
    
    @private
  */
  _retrieveViewFromPool: function(viewPoolKey,idx,rowViewInstance,col,layerId,isEnabled,isSelected,outlineLevel,disclosureState,isVisibleInWindow, parentView, layout, E, item){
    var ret,viewPool,reuseFunc,
        columns = this.get('columns');
    
    // Lazily create the view pool.
    viewPool = this[viewPoolKey];
    if (!viewPool) viewPool = this[viewPoolKey] = [];

    // Is there a view we can re-use?
    if (viewPool.length > 0) {
      ret = viewPool.pop();

      // Tell the view it's about to be re-used.
      reuseFunc = ret.prepareForReuse;
      if (reuseFunc) reuseFunc.call(ret);

      // Set the new state.  We'll set content last, because it's the most
      // likely to have observers.
      ret.beginPropertyChanges();
      ret.set('contentIndex', idx);
      ret.set('layerId', rowViewInstance?this.layerIdFor(idx,col):layerId);
      ret.set('isEnabled', isEnabled);
      ret.set('isSelected', isSelected);
      ret.set('outlineLevel', outlineLevel);
      ret.set('disclosureState', disclosureState);
      ret.set('isVisibleInWindow', isVisibleInWindow);
      var classNames = ret.get('classNames') || [];
      if (rowViewInstance){
        classNames.push('column-'+col);
        ret.set('column',columns[col]);
        ret.set('isSelected', SC.Binding.from('*parentView.isSelected',ret));
      }
      ret.set('classNames',classNames);

      // TODO:  In theory this shouldn't be needed, but without it, we
      //        sometimes get errors when doing a full reload, because
      //        'childViews' contains the view but the parent is not set.
      //        This implies a timing issue with the general flow of
      //        collection view.
      ret.set('parentView', rowViewInstance || parentView);

      // Since we re-use layerIds, we need to reset SproutCore's internal
      // mapping table.
      SC.View.views[layerId] = ret;

      if (layout) {
        ret.set('layout', rowViewInstance?this.layoutForContentIndex(idx,col):layout);
      }
      else {
        ret.set('layout', E.prototype.layout);
      }
      ret.set('content', item);
      ret.endPropertyChanges();
    }
    
    return ret;
    
  },
  
  
  /**
    Generates a layerId for the passed index and item.  Usually the default
    implementation is suitable.
    
    @param {Number} idx the content index
    @returns {String} layer id, must be suitable for use in HTML id attribute
  */
  layerIdFor: function(idx,column) {
    var ret = this._TMP_LAYERID;
    ret[0] = SC.guidFor(this);
    ret[1] = idx;
    return SC.none(column)?ret.join('-'):ret.join('-')+'-'+column;
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
    var ret = id.split('-');
    if (!SC.typeOf(ret)===SC.T_ARRAY || !ret.length>0){
      return null;
    }
    ret = (ret.length===3?Number(ret[1]):Number(ret[ret.length-1]));
    return isNaN(ret) ? null : ret ;
  },
  
  
  /**
    Extracts the column index from passed layer id
    
    @param {String} id the layer id
   */
   columnForLayerId: function(id){
     if (!id || !(id = id.toString())) return null ; // nothing to do

     var base = this._baseLayerId;
     if (!base) base = this._baseLayerId = SC.guidFor(this)+"-";

     // no match
     if ((id.length <= base.length) || (id.indexOf(base) !== 0)) return null ; 
     var ret = id.split('-');
     if (!SC.typeOf(ret)===SC.T_ARRAY || !ret.length>0){
       return null;
     }
     ret = ret[ret.length-1];
     return isNaN(ret) ? null : ret ;
   },

   /** 
      Finds the cell view for the given row and column

      @private
    */
   _itemViewForRowAndColumn: function(row,column){
      var itemViews = this._sc_itemViews;
      if (!itemViews || !itemViews.length || itemViews.length<row){
        return null;
      }
      else
      {
        var rowView = itemViews[row];
        if (rowView && rowView.childViews && rowView.childViews.length>column){
          return rowView.childViews[column];
        }
        return null;
      }
   },

  /**
    Returns a ghost view for a given column 
  */
  ghostForColumn: function(column) {
    var nowShowing = this.get('nowShowing'),
      el = document.createElement('div');
      
    nowShowing.forEach(function(idx) {
      var layer = this.ghostLayerForCell(idx, column);
      if (layer)
      {
        el.appendChild(layer);
      }
    }, this);
    
    el.className = "ghost";
    
    return el;
  },
  
  /** @private */
  mouseMoved: function(ev) {
    if(this._isDirty)
    {
      this.reload(null);
    }
    sc_super();
  },
  
  /** @private */
  _cv_columnsDidChange: function() {
    this.reload(null);
  }.observes('columns'),


    /* CollectionView in SC 1.4 does not call createItemViewForContentIndex
     * as the 1.5 version does, so this is a copy of the function in 1.5 that does. */
    itemViewForContentIndex: function(idx, rebuild) {
      var ret;

      // Use the cached view for this index, if we have it.  We'll do this up-
      // front to avoid
      var itemViews = this._sc_itemViews;
      if (!itemViews) {
        itemViews = this._sc_itemViews = [] ;
      }
      else if (!rebuild && (ret = itemViews[idx])) {
        return ret ;
      }

      // return from cache if possible
      var content   = this.get('content'),
          item = content.objectAt(idx),
          del  = this.get('contentDelegate'),
          groupIndexes = this.get('_contentGroupIndexes'),
          isGroupView = NO,
          key, E, layout, layerId,
          viewPoolKey, parentView, isEnabled, isSelected,
          outlineLevel, disclosureState, isVisibleInWindow;

      // otherwise generate...

      // first, determine the class to use
      isGroupView = groupIndexes && groupIndexes.contains(idx);
      if (isGroupView) isGroupView = del.contentIndexIsGroup(this, content,idx);
      if (isGroupView) {
        key  = this.get('contentGroupExampleViewKey');
        if (key && item) E = item.get(key);
        if (!E) E = this.get('groupExampleView') || this.get('exampleView');
        viewPoolKey = '_GROUP_VIEW_POOL';
      } else {
        key  = this.get('contentExampleViewKey');
        if (key && item) E = item.get(key);
        if (!E) E = this.get('exampleView');
        viewPoolKey = '_VIEW_POOL';
      }


      // Collect other state that we'll need whether we're re-using a previous
      // view or creating a new view.
      parentView        = this.get('containerView') || this;
      layerId           = this.layerIdFor(idx);
      isEnabled         = del.contentIndexIsEnabled(this, content, idx);
      isSelected        = del.contentIndexIsSelected(this, content, idx);
      outlineLevel      = del.contentIndexOutlineLevel(this, content, idx);
      disclosureState   = del.contentIndexDisclosureState(this, content, idx);
      isVisibleInWindow = this.isVisibleInWindow;
      layout            = this.layoutForContentIndex(idx);

      ret = this.createItemViewForContentIndex(layout,isVisibleInWindow,idx,parentView,layerId,isEnabled,item,isSelected,outlineLevel,disclosureState,E,viewPoolKey,isGroupView,itemViews);

      return ret ;
    }
  
});
