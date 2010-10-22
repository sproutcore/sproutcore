sc_require('views/thumb');
SC.TableHeaderCellView = SC.View.extend(SC.Button,{
  
  layout:{top:0,bottom:0},
  
  column: null,
  
  classNames: ['sc-table-cell'],

  titleBinding: '*column.label',
  
  tagName: 'div',
  
  displayProperties:['column','title'],
  
  sortDescriptor: null,
  sortDescriptorBinding: '.parentView.sortDescriptor',
  
  childViews: 'sortStateView labelView thumbView'.w(),
  
  labelView: SC.View.extend({
    tagName: 'label',
    
    layout:{left:5,right:5,top:0,bottom:0},
    
    valueBinding: '.parentView.title',
    
    displayProperties: ['value'],
    render: function(context,firstTime){
      context.push(this.get('value'));
    }
  }),
  
  /** 
    This View renders the arrow indicating sort state
    
    @private 
  */
  sortStateView: SC.View.extend({
    layout:{centerY:2,height:8,right:15,width:9},
    sortStateBinding: '.parentView.sortState',
    sortStateDidChange: function(){
      switch (this.get('sortState')){
        case "ASC":
          this.set('classNames',['sc-sort-state-asc']);
        break;
        case "DESC":
          this.set('classNames',['sc-sort-state-desc']);
        break;
        default:
        this.set('classNames',[]);
        break;
      }
      this.displayDidChange();
    }.observes('sortState')
  }),
  
  thumbView: SC.ThumbView.extend({
    delegateBinding: '.parentView',
    layout: {
      top: 0, bottom: 0, right: 0, width: 16
    },
    isVisibleBinding: '.parentView*column.isResizable'
  }),
  
  /** @private */
  sortState: function() {
    var key = this.get('sortDescriptor');
    if(!key || this.spacer)
    {
      return;
    }
    
    var descending = NO;

    if(SC.typeOf(key) === "array")
    {
      key = key[0];
    }
      
    if (key.indexOf('ASC') > -1) {
         key = key.split('ASC ')[1];
       } else if (key.indexOf('DESC') > -1) {
         key = key.split('DESC ')[1];
         descending = YES;
       }
    if(key === this.get('column').get('key'))
    {
      return descending ? "DESC" : "ASC";
    }
    
    return "none";
  }.property('sortDescriptor').cacheable(),
  
  displayProperties: ['dragging', 'sortState'],

  sortStateBinding: '*column.sortState',
  
  render: function(context, firstTime) {
    var href, toolTip, classes, theme;
    var sortState = this.get('sortState');
    
    context.setClass('first', this.get('first'));

    classes = this._TEMPORARY_CLASS_HASH || {};
    classes.asc = (sortState  === "ASC");
    classes.desc = (sortState === "DESC");
    classes.selected = !SC.none(sortState) && sortState !== "none";
    classes.draggging = this.get('dragging');
    classes.def = this.get('isDefault');
    classes.cancel = this.get('isCancel');
    
    classes.icon = !!this.get('icon');
    classes.dragging = this.get('dragging');
    
    context.attr('role', 'button').setClass(classes);
    theme = this.get('theme');
    if (theme) context.addClass(theme);
    if (firstTime)
    {
      this.renderChildViews(context, firstTime);
    }
  },
  
  /** @private */
  mouseDown: function(evt) {
    this._initialX = evt.pageX;
    return sc_super();
  },
    
  /** @private */
  mouseDragged: function(evt) {
    var x = evt.pageX,
        isReorderable = this.getPath('column.isReorderable');
    
    if (!isReorderable){
      return YES;
    }
    
    if(!this._dragging)
    {
       if(Math.abs(this._initialX - x) < 6)
       {
        return;
      }
      else {
        this._dragging = YES;
        this.set('dragging', YES);
        this.invokeDelegateMethod(this.delegate, 'headerDidBeginDrag', this, evt);
        return YES;
      }
    }
      var lastX = this._lastX;
      if(SC.none(lastX))
      {
        lastX = this._lastX = x;
      }

    var offset = x - lastX;
    this._lastX = x;
    
    this.invokeDelegateMethod(this.delegate, 'headerWasDragged', this, offset, evt);
    return YES;
  },
  
  /** @private */
  mouseUp: function(evt) {
    if(this._dragging) {
      this.set('dragging', NO);
      this.invokeDelegateMethod(this.delegate, 'headerDidEndDrag', this, evt);
      this._dragging = false;
    } else {
      this.get('parentView').get('table').sortByColumn(this.get('column'), this.get('sortState'));
    }
    this._lastX = null;
    return sc_super();
  },
  
  
  // ..........................................................
  // touch support
  // 
  touchStart: function(evt){
    return this.mouseDown(evt);
  },
  
  touchEnd: function(evt){
    return this.mouseUp(evt);
  },
  
  touchesDragged: function(evt, touches) {
    return this.mouseDragged(evt);
  },
  
  touchEntered: function(evt){
    return this.mouseEntered(evt);
  },

  touchExited: function(evt){
    return this.mouseExited(evt);
  },
  
  
  /** @private */
  thumbViewWasDragged: function(view, offset, evt) {
    var column = this.get('column'),
      width = column.get('width') || 100,
      minWidth = column.get('minWidth') || 20,
      maxWidth = column.get('maxWidth'),
      newWidth;
      
    newWidth = Math.max(minWidth, width + offset.x);
    if(maxWidth)
    {
      newWidth = Math.min(maxWidth, newWidth);
    }

    column.set('width', newWidth);
    this.invokeDelegateMethod(this.delegate, 'thumbWasDragged', this, offset, evt);
  },
  
  /** @private */
  thumbViewDidBeginDrag: function(view, offset, evt) {
    this.set('dragging',YES);
  },
  
  /** @private */
  thumbViewDidEndDrag: function(view, offset, evt){
    this.set('dragging',NO);
    this.invokeDelegateMethod(this.delegate, 'headerDidEndDrag', this, evt);
  }

});