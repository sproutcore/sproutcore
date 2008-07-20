// ==========================================================================
// SC.ListItemView
// ==========================================================================

require('core') ;
require('views/view') ;
require('mixins/control');
require('mixins/inline_editor_delegate');

SC.LIST_ITEM_ACTION_CANCEL = 'sc-list-item-cancel-action';
SC.LIST_ITEM_ACTION_REFRESH = 'sc-list-item-cancel-refresh';
SC.LIST_ITEM_ACTION_EJECT = 'sc-list-item-cancel-eject';

/** @class

  Displays a list item with a label, optional icon, count, and right icon.

  @extends SC.View
  @extends SC.Control
  @extends SC.InlineEditorDelegate
  @extends SC.Editable
  @author  Charles Jolley  
  @since SproutCore 1.0
*/
SC.ListItemView = SC.View.extend(SC.Control, SC.InlineEditorDelegate,
/** @scope SC.ListItemView.prototype */ {
  
  /** A ListItemView has an img tag, label, count, optional right button, and
    an optional right arrow.  These items are made visible/hidden based on a
    variety of CSS classes.
  */
  emptyElement: '<div class="sc-list-item-view sc-collection-item"></div>',
  
  /**
    The content object the list item will display.
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
    this.render() ;  
  },
  
  
  /**
    Regenerates the innerHTML for this view and updates it if necessary.
  */
  render: function() {
    var html = [] ;
    var content = this.get('content') ;
    var del = this.displayDelegate ;
    
    // handle checkbox
    var checkboxKey = this.getDelegateProperty(del, 'contentCheckboxKey') ;
    if (checkboxKey) {
      var checkboxValue = (content && content.get) ? content.get(checkboxKey) : false ;
      html.push(this.renderCheckboxHtml(checkboxValue)) ;
    }

    // handle icon
    if (this.getDelegateProperty(del, 'hasContentIcon')) {
       var iconKey = this.getDelegateProperty(del,'contentIconKey') ;
       var icon = (iconKey && content && content.get) ? content.get(iconKey) : null ;
       html.push(this.renderIconHtml(icon));
    }
    
    // handle label
    var labelKey = this.getDelegateProperty(del, 'contentValueKey') ;
    var label = (labelKey && content && content.get) ? content.get(labelKey) : null ;
    html.push(this.renderLabelHtml(label));
    
    // handle unread count
    var countKey = this.getDelegateProperty(del, 'contentUnreadCountKey') ;
    var count = (countKey && content && content.get) ? content.get(countKey) : null ;
    if ((count != null) && (count != 0)) {
      html.push(this.renderCountHtml(count));
    }
    
    // handle action 
    var actionKey = this.getDelegateProperty(del, 'listItemActionProperty') ;
    var actionClassName = (actionKey && content && content.get) ? content.get(actionKey) : null ;
    if (actionClassName) {
       html.push(this.renderActionHtml(actionClassName));
    }
    this.setClassName('sc-has-action', actionClassName) ;
    
    // handle branch
    if (this.getDelegateProperty(del, 'hasContentBranch')) {
      var branchKey = this.getDelegateProperty(del, 'contentIsBranchKey');
      var hasBranch = (branchKey && content && content.get) ? content.get(branchKey) : false ;
      html.push(this.renderBranchHtml(hasBranch));
      this.setClassName('sc-has-branch', true) ;
    } else this.setClassName('sc-has-branch', false) ;
    
    html = html.join('') ;
    if (html != this._lastRenderedHtml) {
      this._lastRenderedHtml = html ;
      this.set('innerHTML', html) ;
    }
  },
  
  /**
    Generates the HTML string used to represent the checkbox for your list
    item.  Override this to return your own custom HTML.  The default version
    will use the HTML provided by SC.CheckboxView.
    
    @returns {String}
    @param state {String} the checkbox state.  YES, NO, or SC.MIXED_STATE
  */
  renderCheckboxHtml: function(state) {
    var ret ;
    
    // Note: this basically takes the HTML from the checkbox view and then
    // inserts class names as necessary.  This is cached to avoid using too
    // much memory.
    if (state === SC.MIXED_STATE) {
      ret = SC.ListItemView._mixedCheckboxHtml ;
      if (!ret) {
        ret = SC.CheckboxView.prototype.emptyElement ;
        ret = ret.replace('class="', 'class="mixed ') ;
        SC.ListItemView._mixedCheckboxHtml = ret ;
      }
    } else if (state) {
      ret = SC.ListItemView._selectedCheckboxHtml ;
      if (!ret) {
        ret = SC.CheckboxView.prototype.emptyElement ;
        ret = ret.replace('class="', 'class="sel ') ;
        SC.ListItemView._selectedCheckboxHtml = ret ;
      }
    } else {
      ret = SC.ListItemView._normalCheckboxHtml ;
      if (!ret) {
        ret = SC.CheckboxView.prototype.emptyElement ;
        SC.ListItemView._normalCheckboxHtml = ret ;
      }
    }
    return ret ;
  },
  
  /** 
     renderIconHtml generates the html string used to represent the icon for 
     your list item.  override this to return your own custom HTML
     
     @returns {String}
     @param icon {String} the icon property based on your view's contentIconKey
   */
   renderIconHtml: function(icon){
     var html = [];
     // get a class name and url to include if relevant
     var url = null, className = null ;
     if (icon && SC.ImageView.valueIsUrl(icon)) {
       url = icon; className = '' ;
     } else {
       className = icon; url = static_url('blank.gif') ;
     }
     html.push('<img class="sc-icon ');
     html.push(className || '');
     html.push('" src="');
     html.push(url || static_url('blank.gif')) ;
     html.push('" />') ;
     html=html.join('');
     return html;
   },
   
   /** 
       renderLabelHtml generates the html string used to represent the label 
       for your list item.  override this to return your own custom HTML
       
       @returns {String}
       @param label {String} the label property based on your view's 
        contentValueKey
     */
   renderLabelHtml: function(label){
     var html = [];
     html.push('<span class="sc-label">') ;
     html.push(label || '') ;
     html.push('</span>') ;
     return html.join('');    
   },
   
   /**
      Finds and retrieves the element containing the label.  This is used
      for inline editing.  If you override renderLabelHtml() you probably
      need to override this as well.
  */
   findLabelElement: function() {
     return this.$class('sc-label') ;
   },
   
   /** 
        renderCountHtml generates the html string used to represent the count 
        (like unread count) for your list item.  override this to return your 
        own custom HTML
        
        @returns {String}
        @param count {Integer} the label property based on your view's 
         contentValueKey
    */
   renderCountHtml: function(count) {
     var html= [];
      html.push('<span class="sc-count"><span class="inner">') ;
       html.push(count.toString()) ;
       html.push('</span></span>') ;
       return html.join('');
   },
   
   /** 
      renderActionHtml generates the html string used to represent the 
      action item for your list item.  override this to return your own 
      custom HTML
    
      @returns {String}
      @param actionClassName {String} the name of the action item.
    */
   renderActionHtml: function(actionClassName){
     var html = [];
     html.push('<img src="') ;
     html.push(static_url('blank.gif')) ;
     html.push('" class="sc-action" />') ;
     return html.join('');
   },
   
   /** 
     renderBranchHtml generates the html string used to represent the 
     branch arrow. override this to return your own custom HTML
     @returns {String}
     @arguments {Boolean} whehter the branch is 
   */
   
   renderBranchHtml: function(hasBranch) {
     var html = [];
     html.push('<span class="sc-branch ');
     html.push(hasBranch ? 'sc-branch-visible' : 'sc-branch-hidden') ;
     html.push('">&nbsp;</span>');
     return html.join('');
   },
   
   _isInsideElementWithClassName: function(className, evt) {
     var el = Event.element(evt) ;
     var rootElement = this.rootElement;
     var ret = NO ;
     while(!ret && el && (el !== rootElement)) {
       if (Element.hasClassName(el, className)) ret = YES ;
       el = el.parentNode ;
     }
     
     rootElement = el = null ; //avoid memory leaks
     return ret ;
   },
   
   /** @private 
    mouseDown is handled only for clicks on the checkbox view or or action
    button.
   */
   mouseDown: function(evt) {
     var del = this.displayDelegate ;
     var checkboxKey = this.getDelegateProperty(del, 'contentCheckboxKey') ;
     if (checkboxKey) {
       if (this._isInsideElementWithClassName('sc-checkbox-view', evt)) {
         this._addCheckboxActiveState() ;
         this._isMouseDownOnCheckbox = YES ;
         this._isMouseInsideCheckbox = YES ;
         return true ;
       }
     }  
     
     return false ; // otherwise let normal handlers do it...
   },

   mouseUp: function(evt) {
     var ret= NO ;
     if (this._isMouseDownOnCheckbox) {
       
       // update only if mouse inside on mouse up...
       if (this._isMouseInsideCheckbox) {
         var del = this.displayDelegate ;
         var checkboxKey = this.getDelegateProperty(del, 'contentCheckboxKey') ;
         var content = this.get('content') ;
         if (content && content.get) {
           var value = content.get(checkboxKey) ;
           value = (value === SC.MIXED_STATE) ? YES : !value ;
           content.set(checkboxKey, value) ;
         }
       }

       this._removeCheckboxActiveState() ;
       ret = YES ;
     } 

     this._isMouseInsideCheckbox = this._isMouseDownOnCheckbox = NO ;
     return ret ;
   },
   
   mouseOut: function(evt) {
     if (this._isMouseDownOnCheckbox) {
       this._removeCheckboxActiveState() ;
       this._isMouseInsideCheckbox = NO ;
     }  
     return NO ;
   },
   
   mouseOver: function(evt) {
     if (this._isMouseDownOnCheckbox) {
       this._addCheckboxActiveState() ;
       this._isMouseInsideCheckbox = YES ;
     }  
     return NO ;
   },
   
   _addCheckboxActiveState: function() {
     var el = this.$sel('.sc-checkbox-view') ;
     if (this.get('isEnabled')) Element.addClassName(el, 'active') ;
     el = null ;
   },
   
   _removeCheckboxActiveState: function() {
     var el = this.$sel('.sc-checkbox-view') ;
     Element.removeClassName(el, 'active') ;
     el = null ;
   },
   
   /** 
    Returns true if a click is on the label text itself to enable editing.
    
    Note that if you override renderLabelHtml(), you probably need to override 
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
     var el = this.findLabelElement() ;
     if (!el) return NO ; // no label to check for.
     
     var cur = Event.element(evt) ;
     while(cur && (cur != (this.rootElement)) && (cur != window)) {
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
     var el = this.findLabelElement() ;
     if (!el) return NO ;

     // if the label has a large line height, try to adjust it to something
     // more reasonable so that it looks right when we show the popup editor.
     var oldLineHeight = Element.getStyle(el, 'lineHeight') ;
     var fontSize = parseInt(Element.getStyle(el, 'fontSize'), 0) ;
     var lineHeight = parseInt(oldLineHeight, 0) ;
     var lineHeightShift = 0;
     
     if (fontSize && lineHeight) {
       var targetLineHeight = fontSize * 1.5 ;
       if (targetLineHeight < lineHeight) {
         Element.setStyle(el, { lineHeight: '1.5' }) ;
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
     if (oldLineHeight) Element.setStyle(el, { lineHeight: oldLineHeight }) ;
     
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
     var el = this.findLabelElement() ;
     this._oldOpacity = Element.getStyle(el, 'opacity') ;
     Element.setStyle(el, { opacity: 0.0 }) ;
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
     
     // force a refresh, otherwise the label will never be visible again
     // b/c its opacity is 0.
     this._lastRenderedHtml = null;
     this.render() ;
   }   
  
}) ;
