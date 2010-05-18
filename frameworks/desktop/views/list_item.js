// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2010 Sprout Systems, Inc. and contributors.
//            portions copyright @2009 Apple Inc.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================

SC.LIST_ITEM_ACTION_CANCEL = 'sc-list-item-cancel-action';
SC.LIST_ITEM_ACTION_REFRESH = 'sc-list-item-cancel-refresh';
SC.LIST_ITEM_ACTION_EJECT = 'sc-list-item-cancel-eject';

/**
  @class
  
  Many times list items need to display a lot more than just a label of text.
  You often need to include checkboxes, icons, right icons, extra counts and 
  an action or warning icon to the far right. 
  
  A ListItemView can implement all of this for you in a more efficient way 
  than you might get if you simply put together a list item on your own using
  views.
  
  @extends SC.View
  @extends SC.Control
  @extends SC.Editable
  @extends SC.StaticLayout
  @since SproutCore 1.0
*/
SC.ListItemView = SC.View.extend(
    SC.Control,
/** @scope SC.ListItemView.prototype */ {
  
  classNames: ['sc-list-item-view'],
  
  displayProperties: ['disclosureState', 'escapeHTML'],
  
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
    (displayDelegate) True if you want the item view to display a right icon.
    
    If false, the icon on the list item view will be hidden.  Otherwise,
    space will be left for the icon next to the list item view.
  */
  hasContentRightIcon: NO,
  
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
    The URL or CSS class name to use for the icon. This is only used if
    contentIconKey is null, or returns null from the delegate.
  */
  icon: null,
  
  /**
    (displayDelegate) Property key to use for the icon url

    This property will be checked on the content object to determine the 
    icon to display.  It must return either a URL or a CSS class name.
  */
  contentIconKey: null,
 
  /**
    The URL or CSS class name to use for the right icon. This is only used if
    contentRightIconKey is null, or returns null from the delegate.
  */
  rightIcon: null,
  
  /**
    (displayDelegate) Property key to use for the right icon url

    This property will be checked on the content object to determine the 
    icon to display.  It must return either a URL or a CSS class name.
  */
  contentRightIconKey: null,
  
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
  
  /**
    Indent to use when rendering a list item with an outline level > 0.  The
    left edge of the list item will be indented by this amount for each 
    outline level.
  */
  outlineIndent: 16,
  
  /**
    Outline level for this list item.  Usually set by the collection view.
  */
  outlineLevel: 0,
  
  /**
    Disclosure state for this list item.  Usually set by the collection view
    when the list item is created.
  */
  disclosureState: SC.LEAF_NODE,

  /**
    The validator to use for the inline text field created when the list item
    is edited.
  */
  validator: null,

  contentPropertyDidChange: function() {
    //if (this.get('isEditing')) this.discardEditing() ;
    if (this.get('contentIsEditable') !== this.contentIsEditable()) {
      this.notifyPropertyChange('contentIsEditable');
    }
    
    this.displayDidChange();
  },
  
  /**
    Determines if content is editable or not.  Checkboxes and other related
    components will render disabled if an item is not editable.
  */
  contentIsEditable: function() {
    var content = this.get('content');
    return content && (content.get ? content.get('isEditable')!==NO : NO);
  }.property('content').cacheable(),
  
  
  createRenderer: function(theme) {
    var ret = theme.listItem();
    this.updateRenderer(ret);
    return ret;
  },
  
  updateRenderer: function(renderer) {
    var content = this.get('content'),
        del = this.displayDelegate,
        key, value;
    
    var attrs = {
      contentIndex: this.get('contentIndex'),
      contentIsEditable: this.get('contentIsEditable'),
      escapeHTML: this.get('escapeHTML'),
      isEnabled: this.get('isEnabled'),
      outlineIndent: this.get('outlineIndent'),
      outlineLevel: this.get('outlineLevel')
    };
    
    // disclosure
    value = this.get('disclosureState');
    if (value !== SC.LEAF_NODE) {
      attrs.disclosureState = value === SC.BRANCH_OPEN ? YES : NO;
    } else {
      // nullify as renderer may have been true/false before
      attrs.disclosureState = null;
    }
    
    // checkbox
    if (key = this.getDelegateProperty('contentCheckboxKey', del)) {
      value = content ? (content.get ? content.get(key) : content[key]) : NO;
      attrs.checkbox = value;
    }
    
    // icon
    if (this.getDelegateProperty('hasContentIcon', del)) {
      key = this.getDelegateProperty('contentIconKey', del);
      value = (key && content) ? (content.get ? content.get(key) : content[key]) : null;
      attrs.icon = value;
    } else if (!SC.none(this.icon)) {
      attrs.icon = this.get('icon');
    }
    
    // label, always on
    key = this.getDelegateProperty('contentValueKey', del) ;
    value = (key && content) ? (content.get ? content.get(key) : content[key]) : content;
    if (value && SC.typeOf(value) !== SC.T_STRING) {
      value = value.toString();
    }
    attrs.label = value;
    
    // right icon
    if (this.getDelegateProperty('hasContentRightIcon', del)) {
      key = this.getDelegateProperty('contentRightIconKey', del);
      value = (key && content) ? (content.get ? content.get(key) : content[key]) : null;
      attrs.rightIcon = value;
    } else if (!SC.none(this.rightIcon)) {
      attrs.rightIcon = this.get('rightIcon');
    }
    
    // unread count
    key = this.getDelegateProperty('contentUnreadCountKey', del) ;
    value = (key && content) ? (content.get ? content.get(key) : content[key]) : null;
    attrs.count = value;
    
    // WTF does the listItemActionProperty do?
    // its render function does essentially nothing?
    // key = this.getDelegateProperty('listItemActionProperty', del) ;
    // value = (key && content) ? (content.get ? content.get(key) : content[key]) : null ;
    // if (value) {
    //   this.renderAction(working, value);
    //   classArray.push('has-action');
    // }
    
    if (this.getDelegateProperty('hasContentBranch', del)) {
      key = this.getDelegateProperty('contentIsBranchKey', del);
      value = (key && content) ? (content.get ? content.get(key) : content[key]) : NO;
      attrs.branch = value;
    }
        
    renderer.attr(attrs);
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
    Determines if the event occured inside an element with the specified
    classname or not.
  */
  _isInsideElementWithClassName: function(className, evt) {
    var layer = this.get('layer');
    if (!layer) return NO ; // no layer yet -- nothing to do
    
    var el = SC.$(evt.target) ;
    var ret = NO, classNames ;
    while(!ret && el.length>0 && (el[0] !== layer)) {
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
    var checkboxKey = this.getDelegateProperty('contentCheckboxKey', del) ;
    return checkboxKey && this._isInsideElementWithClassName('sc-checkbox-view', evt);
  },
  
  /** @private 
    Returns YES if the list item has a disclosure triangle and the event 
    occurred inside of it.
  */
  _isInsideDisclosure: function(evt) {
    if (this.get('disclosureState')===SC.LEAF_NODE) return NO;
    return this._isInsideElementWithClassName('disclosure', evt);
  },
  
  /** @private 
    Returns YES if the list item has a right icon and the event 
    occurred inside of it.
  */
  _isInsideRightIcon: function(evt) {
    var del = this.displayDelegate ;
    var rightIconKey = this.getDelegateProperty('hasContentRightIcon', del) ;
    return rightIconKey && this._isInsideElementWithClassName('right-icon', evt);
  },
  
  /** @private 
  mouseDown is handled only for clicks on the checkbox view or or action
  button.
  */
  mouseDown: function(evt) {
    
    // if content is not editable, then always let collection view handle the
    // event.
    if (!this.get('contentIsEditable')) return NO ; 
    
    // if occurred inside checkbox, item view should handle the event.
    if (this._isInsideCheckbox(evt)) {
      this._addCheckboxActiveState() ;
      this._isMouseDownOnCheckbox = YES ;
      this._isMouseInsideCheckbox = YES ;
      return YES ; // listItem should handle this event

    } else if (this._isInsideDisclosure(evt)) {
      this._addDisclosureActiveState();
      this._isMouseDownOnDisclosure = YES;
      this._isMouseInsideDisclosure = YES ;
      return YES;
    } else if (this._isInsideRightIcon(evt)) {
      this._addRightIconActiveState();
      this._isMouseDownOnRightIcon = YES;
      this._isMouseInsideRightIcon = YES ;
      return YES;
    }
    
    return NO ; // let the collection view handle this event
  },
  
  mouseUp: function(evt) {
    var ret= NO, del, checkboxKey, content, state, idx, set;

    // if mouse was down in checkbox -- then handle mouse up, otherwise 
    // allow parent view to handle event.
    if (this._isMouseDownOnCheckbox) {
   
      // update only if mouse inside on mouse up...
      if (this._isInsideCheckbox(evt)) {
        del = this.displayDelegate ;
        checkboxKey = this.getDelegateProperty('contentCheckboxKey', del);
        content = this.get('content') ;
        if (content && content.get) {
          var value = content.get(checkboxKey) ;
          value = (value === SC.MIXED_STATE) ? YES : !value ;
          content.set(checkboxKey, value) ; // update content
          this.displayDidChange(); // repaint view...
        }
      }
 
      this._removeCheckboxActiveState() ;
      ret = YES ;
    
    // if mouse as down on disclosure -- handle mosue up.  otherwise pass on
    // to parent.
    } else if (this._isMouseDownOnDisclosure) {
      if (this._isInsideDisclosure(evt)) {
        state = this.get('disclosureState');
        idx   = this.get('contentIndex');
        set   = (!SC.none(idx)) ? SC.IndexSet.create(idx) : null;
        del = this.get('displayDelegate');
        
        if (state === SC.BRANCH_OPEN) {
          if (set && del && del.collapse) del.collapse(set);
          else this.set('disclosureState', SC.BRANCH_CLOSED);
          this.displayDidChange();
          
        } else if (state === SC.BRANCH_CLOSED) {
          if (set && del && del.expand) del.expand(set);
          else this.set('disclosureState', SC.BRANCH_OPEN);
          this.displayDidChange();
        }
      }
     
      this._removeDisclosureActiveState();
      ret = YES ;
    // if mouse was down in right icon -- then handle mouse up, otherwise 
    // allow parent view to handle event.
    } else if (this._isMouseDownOnRightIcon) {
      this._removeRightIconActiveState() ;
      ret = YES ;
    } 
   
    // clear cached info
    this._isMouseInsideCheckbox = this._isMouseDownOnCheckbox = NO ;
    this._isMouseDownOnDisclosure = this._isMouseInsideDisclosure = NO ;
    this._isMouseInsideRightIcon = this._isMouseDownOnRightIcon = NO ;
    return ret ;
  },
  
  mouseMoved: function(evt) {
    if (this._isMouseDownOnCheckbox && this._isInsideCheckbox(evt)) {
      this._addCheckboxActiveState() ;
      this._isMouseInsideCheckbox = YES ;
    } else if (this._isMouseDownOnCheckbox) {
     this._removeCheckboxActiveState() ;
     this._isMouseInsideCheckbox = NO ;
    } else if (this._isMouseDownOnDisclosure && this._isInsideDisclosure(evt)) {
      this._addDisclosureActiveState();
      this._isMouseInsideDisclosure = YES;
   } else if (this._isMouseDownOnDisclosure) {
     this._removeDisclosureActiveState();
     this._isMouseInsideDisclosure = NO ;
    } else if (this._isMouseDownOnRightIcon && this._isInsideRightIcon(evt)) {
      this._addRightIconActiveState();
      this._isMouseInsideRightIcon = YES;
   } else if (this._isMouseDownOnRightIcon) {
     this._removeRightIconActiveState();
     this._isMouseInsideRightIcon = NO ;
   }
   return NO ;
  },
  
  touchStart: function(evt){
    return this.mouseDown(evt);
  },
  
  touchEnd: function(evt){
    return this.mouseUp(evt);
  },
  
  touchEntered: function(evt){
    return this.mouseEntered(evt);
  },
  
  touchExited: function(evt){
    return this.mouseExited(evt);
  },
  
  
  _addCheckboxActiveState: function() {
    if (this.get('isEnabled')) {
      this.renderer.attr({
        checkboxActive: YES
      });
      this.displayDidChange();
    }
  },
  
  _removeCheckboxActiveState: function() {
   this.renderer.attr({
     checkboxActive: NO
   });
   this.displayDidChange();
  },

  _addDisclosureActiveState: function() {
    if (this.get('isEnabled')) {
      this.renderer.attr({
        disclosureActive: YES
      });
      this.displayDidChange();
    }
  },
  
  _removeDisclosureActiveState: function() {
    this.renderer.attr({
      disclosureActive: NO
    });
    this.displayDidChange();
  },

  _addRightIconActiveState: function() {
   this.$('img.right-icon').setClass('active', YES);
  },
  
  _removeRightIconActiveState: function() {
   this.$('img.right-icon').removeClass('active');
  },
  
  /**
    Returns true if a click is on the label text itself to enable editing.
  
    Note that if you override renderLabel(), you probably need to override 
    this as well, or just $label() if you only want to control the element
    returned.
  
    @param evt {Event} the mouseUp event.
    @returns {Boolean} YES if the mouse was on the content element itself.
  */
  contentHitTest: function(evt) {
   // if not content value is returned, not much to do.
   var del = this.displayDelegate ;
   var labelKey = this.getDelegateProperty('contentValueKey', del) ;
   if (!labelKey) return NO ;
   
   // get the element to check for.
   var el = this.$label()[0] ;
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
    //if (!this.get('contentIsEditable')) return NO ;
    return this._beginEditing(YES);
  },
  
  _beginEditing: function(scrollIfNeeded) {
    var content   = this.get('content'),
        del       = this.get('displayDelegate'),
        labelKey  = this.getDelegateProperty('contentValueKey', del),
        parent    = this.get('parentView'),
        pf        = parent ? parent.get('frame') : null,
        el        = this.$label(),
        validator = this.get('validator'),
        f, v, offset, oldLineHeight, fontSize, top, lineHeight, escapeHTML,
        lineHeightShift, targetLineHeight, ret ;

    // if possible, find a nearby scroll view and scroll into view.
    // HACK: if we scrolled, then wait for a loop and get the item view again
    // and begin editing.  Right now collection view will regenerate the item
    // view too often.
    if (scrollIfNeeded && this.scrollToVisible()) {
      var collectionView = this.get('owner'), idx = this.get('contentIndex');
      this.invokeLast(function() {
        var item = collectionView.itemViewForContentIndex(idx);
        if (item && item._beginEditing) item._beginEditing(NO);
      });
      return YES; // let the scroll happen then begin editing...
    }
    
    // nothing to do...    
    if (!parent || !el || el.get('length')===0) return NO ;
    v = (labelKey && content && content.get) ? content.get(labelKey) : null ;

    f = this.computeFrameWithParentFrame(null);
    offset = SC.viewportOffset(el[0]);

    // if the label has a large line height, try to adjust it to something
    // more reasonable so that it looks right when we show the popup editor.
    oldLineHeight = el.css('lineHeight');
    fontSize = el.css('fontSize');
    top = this.$().css('top');

    if (top) top = parseInt(top.substring(0,top.length-2),0);
    else top =0;

    lineHeight = oldLineHeight;
    lineHeightShift = 0;

    if (fontSize && lineHeight) {
      targetLineHeight = fontSize * 1.5 ;
      if (targetLineHeight < lineHeight) {
        el.css({ lineHeight: '1.5' });
        lineHeightShift = (lineHeight - targetLineHeight) / 2; 
      } else oldLineHeight = null ;
    }

    f.x = offset.x;
    f.y = offset.y+top + lineHeightShift ;
    f.height = el[0].offsetHeight ;
    f.width = el[0].offsetWidth ;

    escapeHTML = this.get('escapeHTML');

    ret = SC.InlineTextFieldView.beginEditing({
      frame: f, 
      exampleElement: el, 
      delegate: this, 
      value: v,
      multiline: NO,
      isCollection: YES,
      validator: validator,
      escapeHTML: escapeHTML
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
    Allow editing.
  */
  inlineEditorShouldBeginEditing: function(inlineEditor) {
    return YES ;
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
  inlineEditorShouldBeginEditing: function(inlineEditor) {
   return YES ;
  },

  /** @private
   Could check with a validator someday...
  */
  inlineEditorShouldBeginEditing: function(inlineEditor, finalValue) {
    return YES ;
  },

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
    var labelKey = this.getDelegateProperty('contentValueKey', del) ;
    if (labelKey && content && content.set) {
     content.set(labelKey, finalValue) ;
    }
    this.displayDidChange();
  }
  
});
