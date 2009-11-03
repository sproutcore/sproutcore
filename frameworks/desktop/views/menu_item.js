// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2009 Sprout Systems, Inc. and contributors.
//            Portions ©2008-2009 Apple Inc. All rights reserved.
// License:   Licened under MIT license (see license.js)
// ==========================================================================
sc_require('views/button') ;
sc_require('views/separator') ;

// Constants
SC.BENCHMARK_MENU_ITEM_RENDER = YES ;

/**
  @class SC.MenuItemView
  @extends SC.ButtonView
  @since SproutCore 1.0
*/
SC.MenuItemView = SC.ButtonView.extend( SC.ContentDisplay,
/** @scope SC.MenuItemView.prototype */{
  
  
  classNames: ['sc-menu-item'],
  tagName: 'div',

  /**
    This provides the parentPane for the current MenuItemView
  */
  parentPane: null,
  
  /** 
    @private
    @property
    @type {Boolean}
  */
  acceptsFirstResponder: YES,

  // ..........................................................
  // KEY PROPERTIES
  // 
  /**
    The content object the menu view will display.

    @type Object
  */
  content: null,
  
  /**
    This returns true if the child view is a menu list view.
    This property can be over written to have other child views as well.

    @type Boolean
  */
  isSubMenuViewVisible: null,
  
  /**
    This will return true if the menu item is a separator.

    @type Boolean
  */
  isSeparator: NO,

  /**
    (displayDelegate) The name of the property used for label itself   
    If null, then the content object itself will be used.
    
    @readOnly
    @type String
  */
  contentValueKey: null,

  /**
    (displayDelegate) The name of the property used to determine if the menu 
    item is a branch or leaf (i.e. if the branch arow should be displayed to 
    the right edge.)   
    If this is null, then the branch arrow will be collapsed.

    @readOnly
    @type String
  */
  contentIsBranchKey: null,

  /**
    The name of the property which will set the image for the short cut keys

    @readOnly
    @type String
  */
  shortCutKey: null,

  /**
    The name of the property which will set the icon image for the menu item.

    @readOnly
    @type String
  */
  contentIconKey: null,

  /**
    The name of the property which will set the checkbox image for the menu 
    item.

    @readOnly
    @type String
  */
  contentCheckboxKey: 'checkbox',

  /**
    The name of the property which will set the checkbox image for the menu 
    item.

    @readOnly
    @type String
  */
  contentActionKey: null,
  
  
  /**
    Describes the width of the menu item    
    Default it to 100

    @type Integer
  */
  itemWidth: 100,
  
  /**
    Describes the height of the menu item    
    Default it to 20

    @type Integer
  */
  itemHeight: 20,
  

  /**
    Sub Menu Items 
    If this is null then there is no branching

    @type MenuPane
  */
  subMenu: null,
  
  /**
    This property specifies whether this menu item is currently in focus

    @type Boolean
  */
  hasMouseExited: NO,
  
  /**
    Anchor for the Parent Menu of which the Menu Item is part of

    @type ButtonView/MenuItemView
  */
  anchor: null,
  
  /**
    This will hold the properties that can trigger a change in the diplay
  */
  displayProperties: ['contentValueKey', 'contentIconKey', 'shortCutKey',
                  'contentIsBranchKey', 'itemHeight',
                   'subMenu','isEnabled','content'],
  contentDisplayProperties: 'title value icon separator action checkbox shortcut branchItem subMenu'.w(),
  /**
    Fills the passed html-array with strings that can be joined to form the
    innerHTML of the receiver element.  Also populates an array of classNames
    to set on the outer element.
    
    @param {SC.RenderContext} context
    @param {Boolean} firstTime
    @returns {void}
  */
  render: function(context, firstTime) {
    var bkey ;
    if (SC.BENCHMARK_MENU_ITEM_RENDER) {
      bkey = '%@.render'.fmt(this) ;
      SC.Benchmark.start(bkey) ;
    }
    var content = this.get('content') ;
    var del = this.displayDelegate ;
    var key, val ;
    var ic ;
    var menu = this.parentMenu() ;
    var itemWidth = this.get('itemWidth') || menu.layout.width ;
    var itemHeight = this.get('itemHeight') || 20 ;
    this.set('itemWidth',itemWidth) ;
    this.set('itemHeight',itemHeight) ;
    
    if(!this.get('isEnabled')) context.addClass('disabled') ;
    //handle separator    
    ic = context.begin('a').attr('href', 'javascript: ;') ;   
    key = this.getDelegateProperty('isSeparatorKey', del) ;
    val = (key && content) ? (content.get ? content.get(key) : content[key]) : null ;
    if (val) {
      ic.push("<span class='separator'></span>") ;
      context.addClass('disabled') ;
    } else {
      // handle checkbox
      key = this.getDelegateProperty('contentCheckboxKey', del) ;
      if (key) {
        val = content ? (content.get ? content.get(key) : content[key]) : NO ;
        if (val) {
          ic.begin('div').addClass('checkbox').end() ;
        }
      }

      // handle image -- always invoke
      key = this.getDelegateProperty('contentIconKey', del) ;
      val = (key && content) ? (content.get ? content.get(key) : content[key]) : null ;
      if(val && SC.typeOf(val) !== SC.T_STRING) val = val.toString() ;
      if(val) {
        this.renderImage(ic, val) ;
        ic.addClass('hasIcon') ;
      }

      // handle label -- always invoke
      key = this.getDelegateProperty('contentValueKey', del) ;
      val = (key && content) ? (content.get ? content.get(key) : content[key]) : content ;
      if (val && SC.typeOf(val) !== SC.T_STRING) val = val.toString() ;
      this.renderLabel(ic, val||'') ;

      // handle branch
      key = this.getDelegateProperty('contentIsBranchKey', del) ;
      val = (key && content) ? (content.get ? content.get(key) : content[key]) : NO ;
      if (val) {       
        this.renderBranch(ic, val) ;
        ic.addClass('has-branch') ;
      } else { // handle action
        
        key = this.getDelegateProperty('action', del) ;
        val = (key && content) ? (content.get ? content.get(key) : content[key]) : null ;
        if (val && isNaN(val)) this.set('action', val) ;

        key = this.getDelegateProperty('target', del) ;
        val = (key && content) ? (content.get ? content.get(key) : content[key]) : null ;
        if (val && isNaN(val)) this.set('target', val) ;

        // handle short cut keys
        if (this.getDelegateProperty('shortCutKey', del)) {
          key = this.getDelegateProperty('shortCutKey', del) ;
          val = (key && content) ? (content.get ? content.get(key) : content[key]) : null ;
          if (val) {
            this.renderShortcut(ic, val) ;
            ic.addClass('shortcutkey') ;
          }
        }
      }
    }
    ic.end() ;
    if (SC.BENCHMARK_MENU_ITEM_RENDER) SC.Benchmark.end(bkey) ;
  },
      
  /** 
   Generates the image used to represent the image icon. override this to 
   return your own custom HTML
 
   @param {SC.RenderContext} context the render context
   @param {String} the source path of the image
   @returns {void}
  */
  renderImage: function(context, image) {
    // get a class name and url to include if relevant

    var url, className ;
    if (image && SC.ImageView.valueIsUrl(image)) {
      url = image ;
      className = '' ;
    } else {
      className = image ;
      url = SC.BLANK_IMAGE_URL; 
    }
    // generate the img element...
    context.begin('img').addClass('image').addClass(className).attr('src', url).end() ;
  },

  /** 
   Generates the label used to represent the menu item. override this to 
   return your own custom HTML

   @param {SC.RenderContext} context the render context
   @param {String} menu item name
   @returns {void}
  */

  renderLabel: function(context, label) {
    context.push("<span class='value ellipsis'>"+label+"</span>") ;
  },
  
  /** 
   Generates the string used to represent the branch arrow. override this to 
   return your own custom HTML
 
   @param {SC.RenderContext} context the render context
   @param {Boolean} hasBranch YES if the item has a branch
   @returns {void}
  */

  renderBranch: function(context, hasBranch) {

    var a = '>' ;
    var url = SC.BLANK_IMAGE_URL;
    context.push('<span class= "hasBranch">'+a+'</span>') ; 
  },

  /** 
   Generates the string used to represent the short cut keys. override this to 
   return your own custom HTML

   @param {SC.RenderContext} context the render context
   @param {String} the shortcut key string to be displayed with menu item name
   @returns {void}
  */
  renderShortcut: function(context, shortcut) {
    context.push('<span class = "shortcut">' + shortcut + '</span>') ;
  },

  /**
    This method is used to fetch the Menu Item View to which the
    Parent Menu Pane is anchored 
    to

    @param {}
    @returns MenuPane
  */
  getAnchor: function() {
    var anchor = this.get('anchor') ;
    if(anchor && anchor.kindOf && anchor.kindOf(SC.MenuItemView)) return anchor ;
    return null ;
  },
  
  isCurrent: NO,

  /**
    This method checks if the menu item is a separator.

    @param {}
    @returns Boolean
  */	  
  isSeparator: function() {
    var content = this.get('content') ;
    var del = this.displayDelegate ;
    var key = this.getDelegateProperty('isSeparatorKey', del) ;
    var val = (key && content) ? (content.get ? content.get(key) : content[key]) : null ;
    if (val) return YES ;
    return NO ;
  },
  
  /**
    Checks if a menu is a sub menu, during branching.
    
    @param {}
    @returns MenuPane
  */
  isSubMenuAMenuPane: function() {
    var content = this.get('content') ;
    var subMenu = content.get('subMenu') ;
    if(subMenu && subMenu.kindOf(SC.MenuPane)) return subMenu ;
    return NO ;  
  },
  
  
  /**
    This method will check whether the current Menu Item is still
    selected and then create a submenu accordignly.
    
    @param {}
    @returns void
  */
  branching: function() {
    if(this.get('hasMouseExited')) {
      this.set('hasMouseExited',NO) ;
      return ;
    }
      this.createSubMenu() ;
  },
  
  /**
    This method will remove the focus of the current selected menu item.

    @param {}
  */
  loseFocus: function() {
    if(!this.isSubMenuAMenuPane()) {
      this.set('hasMouseExited',YES) ;
      this.$().removeClass('focus') ;
      //this.resignFirstResponder() ;
    }
  },
  
  /**
    This method will create the sub Menu with the current Menu Item as anchor
    
    @param {}
    @returns void
  */
  createSubMenu: function() {
    var subMenu = this.isSubMenuAMenuPane() ;
    if(subMenu) {
      subMenu.set('anchor', this) ;
      subMenu.popup(this,[0,0,0]) ;
      var context = SC.RenderContext(this) ;
      context = context.begin(subMenu.get('tagName')) ;
      subMenu.prepareContext(context, YES) ;
      context = context.end() ;
      var menuItemViews = subMenu.get('menuItemViews') ;
      if(menuItemViews && menuItemViews.length>0) {
        subMenu.becomeKeyPane();
      }
    }
  },
  
  parentMenu: function() {
    return this.get('parentPane') ;
  },

  //..........................................
  //Mouse Events Handling
  //..........................................

  // to check the 'isMouseDown' property of the anchor 
  isAnchorMouseDown: NO,

  mouseUp: function(evt) {
    // SproutCore's event system will deliver the mouseUp event to the view
    // that got the mouseDown event, but for menus we want to track the mouse,
    // so we'll do our own dispatching.
    var parentMenu = this.parentMenu() ;
    if (parentMenu) {
      var selectedMenuItem = parentMenu.get('currentSelectedMenuItem') ;
      if (selectedMenuItem  &&  (this !== selectedMenuItem)) {
        return selectedMenuItem.tryToPerform('mouseUp', evt) ;
      }
    }

    if (!this.get('isEnabled')) {
      this.set('hasMouseExited',NO) ;
      return YES ;
    }
    this.set('hasMouseExited',NO) ;
    var key = this.get('contentCheckboxKey') ;
    var content = this.get('content') ;
    if (key) {
      if (content && content.get(key)) {
        content.set(key, NO) ;
      } else if( content.get(key)!== undefined ) {
        content.set(key, YES) ;
      }
      this.displayDidChange();
    }
    this._action(evt) ;
    var anchor = this.getAnchor() ;
    if(anchor) {
      anchor.mouseUp(evt) ;
    } else {
      this.resignFirstResponder() ;
    }
    this.closeParent() ;
    return YES ;
  },

  /** @private*/
  mouseDown: function(evt) {
    return YES ;
  },

  /** @private
    This has been over ridden from button view to prevent calling of render 
    method (When isActive property is changed).
    Also based on whether the menu item has a sub Branch we create a sub Menu
    
    @returns Boolean
  */
  mouseEntered: function(evt) {
    var parentMenu = this.parentMenu() ;
    this.set('hasMouseExited', NO) ;
    if(parentMenu) {
      parentMenu.becomeKeyPane() ;
      // condition check whether the anchor tag has _isMouseDown or not
      if(parentMenu.get('anchor')._isMouseDown){
        var isAnchorMouseDown = parentMenu.getPath('anchor._isMouseDown') ;
        this.set('isAnchorMouseDown', isAnchorMouseDown) ;
        if(this.get('isAnchorMouseDown')) {
          SC.Event.trigger(this.get('layer'), 'mousedown');
        }
      }
    }
    if (!this.get('isEnabled') && !this.isSeparator()) return YES ;
    var key = this.get('contentIsBranchKey') ;
    if(key) {
      var content = this.get('content') ;
      var val = (key && content) ? (content.get ? content.get(key) : content[key]) : NO ;
      if(val) this.invokeLater(this.branching(),100) ;
    }
    this.becomeFirstResponder() ;
	  return YES ;
  },

  /** @private
    Set the focus based on whether the current Menu item is selected or not.
    
    @returns Boolean
  */
  mouseExited: function(evt) {
    this.loseFocus() ;
    var parentMenu = this.parentMenu() ;
    if(parentMenu) {
      parentMenu.set('previousSelectedMenuItem', this) ;
    }
    return YES ;
  },


  /** @private
    Call the moveUp function on the parent Menu
    
    @returns Boolean
  */
  moveUp: function(sender,evt) {
    var menu = this.parentMenu() ;
    if(menu) {
      menu.moveUp(this) ;
    }
    return YES ;
  },
  
  /** @private
    Call the moveDown function on the parent Menu
    
    @returns Boolean
  */
  moveDown: function(sender,evt) {
    var menu = this.parentMenu() ;
    if(menu) {
      menu.moveDown(this) ;
    }
    return YES ;
  },
  
  /** @private
    Call the function to create a branch
    
    @returns Boolean
  */
  moveRight: function(sender,evt) {
    this.createSubMenu() ;
    return YES ;
  },
  
  /** @private*/
  keyDown: function(evt) {
    return this.interpretKeyEvents(evt) ;
  },
  
  /** @private*/
  keyUp: function(evt) {
    return YES ;
  },
  
  /** @private*/
  cancel: function(evt) {
    this.loseFocus() ;
    var menu = this.parentMenu() ;
    if (menu) menu.remove() ;
    var pane = menu.getPath('anchor.pane') ;
    if (pane) pane.becomeKeyPane() ;
    return YES ;
  },
  
  /** @private*/
  didBecomeFirstResponder: function(responder) {
    if (responder !== this) return;
    if(!this.isSeparator()) {
      this.$().addClass('focus') ;
    }
    var parentMenu = this.parentMenu() ;
    if(parentMenu) {
      parentMenu.set('currentSelectedMenuItem', this) ;
    }
  },
  
  /** @private*/
  willLoseFirstResponder: function(responder) {
    if (responder !== this) return;
    this.$().removeClass('focus') ;
    var parentMenu = this.parentMenu() ;
    if(parentMenu) {
      parentMenu.set('currentSelectedMenuItem', null) ;
      parentMenu.set('previousSelectedMenuItem', this) ;
    }
  },
  
  /** @private*/
  insertNewline: function(sender, evt) {
    this.mouseUp(evt) ;
  },

  /**
    Close the parent Menu and remove the focus of the current Selected 
    Menu Item
    
    @returns void
  */
  closeParent: function() {
    this.$().removeClass('focus') ;
    var menu = this.parentMenu() ;
    if(menu) {
      menu.remove() ;
    }
  },
  
  /** @private*/
  clickInside: function(frame, evt) {
    return SC.pointInRect({ x: evt.pageX, y: evt.pageY }, frame) ;
  }
  
}) ;
