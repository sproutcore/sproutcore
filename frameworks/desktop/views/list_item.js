// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2009 Sprout Systems, Inc. and contributors.
//            portions copyright @2009 Apple, Inc.
// License:   Licened under MIT license (see license.js)
// ==========================================================================

sc_require('mixins/collection_item');

SC.LIST_ITEM_ACTION_CANCEL = 'sc-list-item-cancel-action';
SC.LIST_ITEM_ACTION_REFRESH = 'sc-list-item-cancel-refresh';
SC.LIST_ITEM_ACTION_EJECT = 'sc-list-item-cancel-eject';

/**
  @class
  
  Many times list items need to display a lot more than just a label of text.
  You often need to include checkboxes, icons, extra counts and an action or 
  warning icon to the far right. 
  
  A ListItemView can implement all of this for you in a more efficient way 
  than you might get if you simply put together a list item on your own using
  views.
  
  @extends SC.View
  @extends SC.Control
  @extends SC.InlineEditorDelegate
  @extends SC.CollectionItem
  @extends SC.Editable
  @since SproutCore 1.0
*/
SC.ListItemView = SC.View.extend(
    SC.Control,
    SC.InlineEditorDelegate,
    SC.CollectionItem,
/** @scope SC.ListItemView.prototype */ {
  
  classNames: ['sc-list-item-view'],
  
  // ..........................................................
  // KEY PROPERTIES
  // 
  
  /**
    The content object the list item will display.
    
    @type SC.Object
  */
  content: null,
  
  /**
    (displayDelegate) True if you want the item view to display an icon.
    
    If false, the icon on the list item view will be hidden.  Otherwise,
    space will be left for the icon next to the list item view.
  */
  hasContentIcon: NO,
  
  /**
    (displayDelegate) True if you want space to be allocated for a branch 
    arrow.
    
    If false, the space for the branch arrow will be collapsed.
  */
  hasContentBranch: NO,
  
  /**
    (displayDelegate) The name of the property used for the checkbox value.
    
    The checkbox will only be visible if this key is not null.
    
    @type {String}
  */
  contentCheckboxKey: null,
  
  /**
    (displayDelegate) Property key to use for the icon url

    This property will be checked on the content object to determine the 
    icon to display.  It must return either a URL or a CSS class name.
  */
  contentIconKey: null,
  
  /**
    (displayDelegate) The name of the property used for label itself
    
    If null, then the content object itself will be used..
  */
  contentValueKey: null,
  
  /**
    IF true, the label value will be escaped to avoid HTML injection attacks.
    You should only disable this option if you are sure you will only 
    display content that is already escaped and you need the added 
    performance gain.
  */
  escapeHTML: YES,
  
  /**
    (displayDelegate) The name of the property used to find the count of 
    unread items. 
    
    The count will only be visible if this property is not null and the 
    returned value is not 0.
  */
  contentUnreadCountKey: null,
  
  /**
    (displayDelegate) The name of the property used to determine if the item
    is a branch or leaf (i.e. if the branch icon should be displayed to the
    right edge.)
    
    If this is null, then the branch view will be completely hidden.
    Otherwise space will be allocated for it.
  */
  contentIsBranchKey: null,
  
  /**
    YES if the item view is currently editing.
  */
  isEditing: NO,
  
  contentPropertyDidChange: function() {
    if (this.get('isEditing')) this.discardEditing() ;
    this.displayDidChange();
  },
  
  /**
    Fills the passed html-array with strings that can be joined to form the
    innerHTML of the receiver element.  Also populates an array of classNames
    to set on the outer element.
    
    @param {SC.RenderContext} context
    @param {Boolean} firstTime
    @returns {void}
  */
  render: function(context, firstTime) {
    var content = this.get('content') ;
    var del = this.displayDelegate ;
    var key, value ;
    
    // handle checkbox
    key = this.getDelegateProperty(del, 'contentCheckboxKey') ;
    if (key) {
      value = content ? (content.get ? content.get(key) : content[key]) : NO ;
      this.renderCheckbox(context, value);
      context.addClass('has-checkbox');
    }
    
    // handle icon
    if (this.getDelegateProperty(del, 'hasContentIcon')) {
      key = this.getDelegateProperty(del,'contentIconKey') ;
      value = (key && content) ? (content.get ? content.get(key) : content[key]) : null ;
      
      this.renderIcon(context, value);
      context.addClass('has-icon');
    }
    
    // handle label -- always invoke
    key = this.getDelegateProperty(del, 'contentValueKey') ;
    value = (key && content) ? (content.get ? content.get(key) : content[key]) : content ;
    if (value && SC.typeOf(value) !== SC.T_STRING) value = value.toString();
    if (this.get('escapeHTML')) value = SC.RenderContext.escapeHTML(value);
    this.renderLabel(context, value);
    
    // handle unread count
    key = this.getDelegateProperty(del, 'contentUnreadCountKey') ;
    value = (key && content) ? (content.get ? content.get(key) : content[key]) : null ;
    if (!SC.none(value) && (value !== 0)) this.renderCount(context, value) ;
    
    // handle action 
    key = this.getDelegateProperty(del, 'listItemActionProperty') ;
    value = (key && content) ? (content.get ? content.get(key) : content[key]) : null ;
    if (value) {
      this.renderAction(context, value);
      context.addClass('has-action');
    }
    
    // handle branch
    if (this.getDelegateProperty(del, 'hasContentBranch')) {
      key = this.getDelegateProperty(del, 'contentIsBranchKey');
      value = (key && content) ? (content.get ? content.get(key) : content[key]) : NO ;
      this.renderBranch(context, value);
      context.addClass('has-branch');
    }
  },
  
  /**
    Adds a checkbox with the appropriate state to the content.  This method
    will only be called if the list item view is supposed to have a 
    checkbox.
    
    @param {SC.RenderContext} context the render context
    @param {Boolean} state YES, NO or SC.MIXED_STATE
    @returns {void}
  */
  renderCheckbox: function(context, state) {
    context = context.begin('a').attr('href', 'javascript:;')
      .classNames(SC.CheckboxView.prototype.classNames);
    
    // set state on html
    if (state === SC.MIXED_STATE) {
      context.addClass('mixed');
    } else context.setClass('sel', state);
    
    // now add inner content.  note we do not add a real checkbox because
    // we don't want to have to setup a change observer on it.
    context.push('<img src="', SC.BLANK_IMAGE_URL, '" class="button" />');
    
    // apply edit
    context.end();
  },
  
  /** 
    Generates an icon for the label based on the content.  This method will
    only be called if the list item view has icons enabled.  You can override
    this method to display your own type of icon if desired.
    
    @param {SC.RenderContext} context the render context
    @param {String} icon a URL or class name.
    @returns {void}
  */
  renderIcon: function(context, icon){
    // get a class name and url to include if relevant
    var url = null, className = null ;
    if (icon && SC.ImageView.valueIsUrl(icon)) {
      url = icon; className = '' ;
    } else {
      className = icon; url = SC.BLANK_IMAGE_URL ;
    }
    
    // generate the img element...
    context.begin('img')
      .addClass('icon').addClass(className)
      .attr('src', url)
    .end();
  },
  
  /** 
   Generates a label based on the content.  You can override this method to 
   display your own type of icon if desired.
   
   @param {SC.RenderContext} context the render context
   @param {String} label the label to display, already HTML escaped.
   @returns {void}
  */
  renderLabel: function(context, label) {
    context.push('<label>', label || '', '</label>') ;
  },
  
  /**
    Finds and retrieves the element containing the label.  This is used
    for inline editing.  The default implementation returns a CoreQuery
    selecting any label elements.   If you override renderLabel() you 
    probably need to override this as well.
  
    @returns {SC.CoreQuery} CQ object selecting label elements
  */
  $label: function() {
    return this.$('label') ;
  },
  
  /** 
   Generates an unread or other count for the list item.  This method will
   only be called if the list item view has counts enabled.  You can 
   override this method to display your own type of counts if desired.
   
   @param {SC.RenderContext} context the render context
   @param {Number} count the count
   @returns {void}
  */
  renderCount: function(context, count) {
    context.push('<span class="count"><span class="inner">')
      .push(count.toString()).push('</span></span>') ;
  },
  
  /**
    Generates the html string used to represent the action item for your 
    list item.  override this to return your own custom HTML
    
    @param {SC.RenderContext} context the render context
    @param {String} actionClassName the name of the action item
    @returns {void}
  */
  renderAction: function(context, actionClassName){
    context.push('<img src="',SC.BLANK_IMAGE_URL,'" class="action" />');
  },
  
  /**
   Generates the string used to represent the branch arrow. override this to 
   return your own custom HTML
   
   @param {SC.RenderContext} context the render context
   @param {Boolean} hasBranch YES if the item has a branch
   @returns {void}
  */
  renderBranch: function(context, hasBranch) {
    context.begin('span').addClass('branch')
      .addClass(hasBranch ? 'branch-visible' : 'branch-hidden')
      .push('&nbsp;').end();
  },
  
  /** 
    Determines if the event occured inside an element with the specified
    classname or not.
  */
  _isInsideElementWithClassName: function(className, evt) {
    var layer = this.get('layer');
    if (!layer) return NO ; // no layer yet -- nothing to do
    
    var el = SC.$(evt.target) ;
    var ret = NO, classNames ;
    while(!ret && el.length>0 && (el.get(0) !== layer)) {
      if (el.hasClass(className)) ret = YES ;
      el = el.parent() ;
    }
    el = layer = null; //avoid memory leaks
    return ret ;
  },
  
  /** @private
    Returns YES if the list item has a checkbox and the event occurred 
    inside of it.
  */
  _isInsideCheckbox: function(evt) {
    var del = this.displayDelegate ;
    var checkboxKey = this.getDelegateProperty(del, 'contentCheckboxKey') ;
    return checkboxKey && this._isInsideElementWithClassName('sc-checkbox-view', evt);
  },
  
  /** @private 
  mouseDown is handled only for clicks on the checkbox view or or action
  button.
  */
  mouseDown: function(evt) {
    // if occurred inside checkbox, item view should handle the event.
    if (this._isInsideCheckbox(evt)) {
      this._addCheckboxActiveState() ;
      this._isMouseDownOnCheckbox = YES ;
      this._isMouseInsideCheckbox = YES ;
      return YES ; // listItem should handle this event
    }  
    return NO ; // let the collection view handle this event
  },
  
  mouseUp: function(evt) {
   var ret= NO ;
   // if mouse was down in checkbox -- then handle mouse up, otherwise 
   // allow parent view to handle event.
   if (this._isMouseDownOnCheckbox) {
   
     // update only if mouse inside on mouse up...
     if (this._isInsideCheckbox(evt)) {
       var del = this.displayDelegate ;
       var checkboxKey = this.getDelegateProperty(del, 'contentCheckboxKey') ;
       var content = this.get('content') ;
       if (content && content.get) {
         var value = content.get(checkboxKey) ;
         value = (value === SC.MIXED_STATE) ? YES : !value ;
         content.set(checkboxKey, value) ; // update content
         this.displayDidChange(); // repaint view...
       }
     }
     
     this._removeCheckboxActiveState() ;
     ret = YES ;
   } 
   
   // clear cached info
   this._isMouseInsideCheckbox = this._isMouseDownOnCheckbox = NO ;
   return ret ;
  },
  
  mouseExited: function(evt) {
   if (this._isMouseDownOnCheckbox) {
     this._removeCheckboxActiveState() ;
     this._isMouseInsideCheckbox = NO ;
   }  
   return NO ;
  },
  
  mouseEntered: function(evt) {
   if (this._isMouseDownOnCheckbox) {
     this._addCheckboxActiveState() ;
     this._isMouseInsideCheckbox = YES ;
   }  
   return NO ;
  },
  
  _addCheckboxActiveState: function() {
   var enabled = this.get('isEnabled');
   this.$('.sc-checkbox-view').setClass('active', enabled);
  },
  
  _removeCheckboxActiveState: function() {
   this.$('.sc-checkbox-view').removeClass('active');
  },
  
  /**
  Returns true if a click is on the label text itself to enable editing.
  
  Note that if you override renderLabel(), you probably need to override 
  this as well.
  
  @param evt {Event} the mouseUp event.
  @returns {Boolean} YES if the mouse was on the content element itself.
  */
  contentHitTest: function(evt) {
   // if not content value is returned, not much to do.
   var del = this.displayDelegate ;
   var labelKey = this.getDelegateProperty(del, 'contentValueKey') ;
   if (!labelKey) return NO ;
   
   // get the element to check for.
   var el = this.$label().get(0) ;
   if (!el) return NO ; // no label to check for.
   
   var cur = evt.target, layer = this.get('layer') ;
   while(cur && (cur !== layer) && (cur !== window)) {
     if (cur === el) return YES ;
     cur = cur.parentNode ;
   }
   
   return NO;
  },
  
  beginEditing: function() {
   if (this.get('isEditing')) return YES ;
   
   var content = this.get('content') ;
   var del = this.displayDelegate ;
   var labelKey = this.getDelegateProperty(del, 'contentValueKey') ;
   var v = (labelKey && content && content.get) ? content.get(labelKey) : null ;
   
   var f = this.get('frame') ;
   var el = this.$label() ;
   if (!el) return NO ;
   
   // if the label has a large line height, try to adjust it to something
   // more reasonable so that it looks right when we show the popup editor.
   var oldLineHeight = el.css('lineHeight');
   var fontSize = el.css('fontSize');
   var lineHeight = oldLineHeight;
   var lineHeightShift = 0;
   
   if (fontSize && lineHeight) {
     var targetLineHeight = fontSize * 1.5 ;
     if (targetLineHeight < lineHeight) {
       el.css({ lineHeight: '1.5' });
       lineHeightShift = (lineHeight - targetLineHeight) / 2; 
     } else oldLineHeight = null ;
   }
   
   f.x += el.offsetLeft ;
   f.y += el.offsetTop + lineHeightShift - 2;
   f.height = el.offsetHeight ;
   f.width = (f.width - 30 - el.offsetLeft) ;
   f = this.convertFrameToView(f, null) ;
   
   var ret = SC.InlineTextFieldView.beginEditing({
     frame: f, 
     exampleElement: el, 
     delegate: this, 
     value: v
   }) ;
   
   // restore old line height for original item if the old line height 
   // was saved.
   if (oldLineHeight) el.css({ lineHeight: oldLineHeight }) ;
   
   // Done!  If this failed, then set editing back to no.
   return ret ;
  },
  
  commitEditing: function() {
   if (!this.get('isEditing')) return YES ;
   return SC.InlineTextFieldView.commitEditing();
  },
  
  discardEditing: function() {
   if (!this.get('isEditing')) return YES ;
   return SC.InlineTextFieldView.discardEditing();
  },
  
  /** @private
   Set editing to true so edits will no longer be allowed.
  */
  inlineEditorWillBeginEditing: function(inlineEditor) {
   this.set('isEditing', YES);
  },
  
  /** @private 
   Hide the label view while the inline editor covers it.
  */
  inlineEditorDidBeginEditing: function(inlineEditor) {
   var el = this.$label() ;
   this._oldOpacity = el.css('opacity');
   el.css('opacity', 0.0) ;
  },
  
  /** @private
   Could check with a validator someday...
  */
  inlineEditorShouldEndEditing: function(inlineEditor, finalValue) {
   return YES ;
  },
  
  /** @private
   Update the field value and make it visible again.
  */
  inlineEditorDidEndEditing: function(inlineEditor, finalValue) {
    this.set('isEditing', NO) ;
    
    var content = this.get('content') ;
    var del = this.displayDelegate ;
    var labelKey = this.getDelegateProperty(del, 'contentValueKey') ;
    if (labelKey && content && content.set) {
     content.set(labelKey, finalValue) ;
    }
    this.displayDidChange();
  }
  
});
