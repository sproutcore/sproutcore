// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2009 Sprout Systems, Inc. and contributors.
//            Portions ©2008-2009 Apple Inc. All rights reserved.
// License:   Licened under MIT license (see license.js)
// ==========================================================================
sc_require('views/button') ;
sc_require('views/separator') ;

/**
  @class SC.MenuItemView
  @extends SC.ButtonView
  @since SproutCore 1.0
*/
SC.MenuItemView = SC.View.extend( SC.ContentDisplay,
/** @scope SC.MenuItemView.prototype */{

  classNames: ['sc-menu-item'],
  
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
    This property specifies whether this menu item is currently in focus

    @type Boolean
  */
  hasMouseExited: NO,
  
  /**
    This menu item's submenu, if it exists.
    
    @type SC.MenuView
  */
  subMenu: function() {
    var content = this.get('content'), menuItems, parentMenu;
    
    if (!content) return null;
    
    parentMenu = this.get('parentMenu');
    menuItems = content.get(parentMenu.itemSubMenuKey );
    if (menuItems) {
      if (SC.kindOf(menuItems, SC.MenuPane)) {
        menuItems.set('isModal', NO);
        menuItems.set('isSubMenu', YES);
        menuItems.set('parentMenu', parentMenu);
        return menuItems;
      } else {
        return SC.MenuPane.create({
          layout: { width: 200 },
          items: menuItems,
          isModal: NO,
          isSubMenu: YES,
          parentMenu: parentMenu
        });
      }
    }
    
    return null;
  }.property('content').cacheable(),
  
  /**
    Whether or not this menu item has a submenu.
    
    @type Boolean
  */
  hasSubMenu: function() {
    return !!this.get('subMenu');
  }.property('subMenu').cacheable(),
  
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
    var key, val ;
    var menu = this.get('parentMenu');
    var itemWidth = this.get('itemWidth') || menu.layout.width ;
    var itemHeight = this.get('itemHeight') || 20 ;
    this.set('itemWidth',itemWidth);
    this.set('itemHeight',itemHeight);
    
    context = context.begin('a').attr('href', 'javascript:');
    
    if (content.get(menu.itemSeparatorKey)) {
      context.push('<span class="separator"></span>');
      context.addClass('disabled');
    } else {
      val = content.get(menu.itemIconKey);
      if (val) {
        this.renderImage(context, val);
        context.addClass('has-icon');
      }
      
      val = content.get(menu.itemTitleKey) || '';
      if (SC.typeOf(val) !== SC.T_STRING) val = val.toString();
      // TODO check localization setting
      this.renderLabel(context, val.loc());
      
      if (content.get(menu.itemCheckboxKey)) {
        context.push('<div class="checkbox"></div>');
      }
      
      if (this.get('hasSubMenu')) {
        this.renderBranch(context);
      }
      
      val = content.get(menu.itemShortCutKey);
      if (val) {
        this.renderShortcut(context, val);
      }
    }
    
    context = context.end();
    
    //         // handle short cut keys
    //         if (this.getDelegateProperty('shortCutKey', del)) {
    //           key = this.getDelegateProperty('shortCutKey', del) ;
    //           val = (key && content) ? (content.get ? content.get(key) : content[key]) : null ;
    //           if (val) {
    //             this.renderShortcut(ic, val) ;
    //             ic.addClass('shortcutkey') ;
    //           }
    //         }
    //       }
    //     }
    //     ic.end() ;
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
   @returns {void}
  */

  renderBranch: function(context) {
    context.push('<span class= "hasBranch">&gt;</span>') ; 
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
    return this.getContentProperty('itemSeparatorKey') === YES;
  }.property('content').cacheable(),
  
  /**
    Checks if a menu is a sub menu, during branching.
    
    @param {}
    @returns MenuPane
  */
  isSubMenuAMenuPane: function() {
    var subMenu = this.get('subMenu');
    if(subMenu && subMenu.kindOf(SC.MenuPane)) return subMenu ;
    return NO ;  
  },
  
  
  /**
    This method will check whether the current Menu Item is still
    selected and then create a submenu accordignly.
    
    @param {}
    @returns void
  */
  showSubMenu: function() {
    var subMenu = this.get('subMenu') ;
    if(subMenu) {
      subMenu.set('anchor', this) ;
      subMenu.popup(this,[0,0,0]) ;
    }
  },
  
  isEnabled: function() {
    return this.getContentProperty('itemIsEnabledKey') !== NO;
  }.property('content.isEnabled').cacheable(),

  title: function() {
    var ret = this.getContentProperty('itemTitleKey');

    if (ret) {
      ret = ret.loc();
    }
    return ret;
  }.property('content.title').cacheable(),
  
  getContentProperty: function(property) {
    var content = this.get('content'),
        menu = this.get('parentMenu');
    
    if (content) {
      return content.get(menu.get(property));
    }
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
    var targetMenuItem;
    
    targetMenuItem = this.getPath('parentMenu.rootMenu.targetMenuItem');

    if (targetMenuItem) targetMenuItem.performAction();

    return YES ;
  },

  performAction: function(skipFlash) {
    var action = this.getContentProperty('itemActionKey'),
        target = this.getContentProperty('itemTargetKey'),
        rootMenu = this.getPath('parentMenu.rootMenu');

    if (this.get('hasSubMenu')) {
      return;
    }

    action = (action === undefined) ? rootMenu.get('action') : action;
    target = (target === undefined) ? rootMenu.get('target') : target;

    this._flashCounter = 0;
    if (skipFlash) {
      this.getPath('pane.rootResponder').sendAction(action, target, this, this.get('pane'));
      rootMenu.remove();
      rootMenu.set('selectedMenuItem', this);
    } else {
      this.invokeLater(this.flashHighlight, 25);
    }
  },

  flashHighlight: function() {
    var flashCounter = this._flashCounter, layer = this.$();
    if (flashCounter % 2 === 0) {
      layer.addClass('focus');
    } else {
      layer.removeClass('focus');
    }

    if (flashCounter > 2) {
      this.performAction(YES);
    } else {
      this.invokeLater(this.flashHighlight, 50);
      this._flashCounter++;
    }
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
    var menu = this.get('parentMenu'), content = this.get('content');
    menu.set('mouseHasEntered', YES);
    menu.set('currentMenuItem', this);

    if(this.get('hasSubMenu')) {
      this.invokeLater(this.showSubMenu(),100) ;
    }
	  return YES ;
  },

  /** @private
    Set the focus based on whether the current Menu item is selected or not.
    
    @returns Boolean
  */
  mouseExited: function(evt) {
    var subMenu, parentMenu;

    if (this.get('hasSubMenu')) {
      subMenu = this.get('subMenu');
      this.invokeLater(this.checkMouseLocation, 200);
    } else {
      parentMenu = this.get('parentMenu');
      
      if (parentMenu.get('currentMenuItem') === this) {
        parentMenu.set('currentMenuItem', null);
      }
    }

    return YES ;
  },
  
  checkMouseLocation: function() {
    var subMenu = this.get('subMenu'), parentMenu = this.get('parentMenu'),
        currentMenuItem, previousMenuItem;
    if (!subMenu.get('mouseHasEntered')) {
      currentMenuItem = parentMenu.get('currentMenuItem');
      if (currentMenuItem === this || currentMenuItem === null) {
        previousMenuItem = parentMenu.get('previousMenuItem');

        if (previousMenuItem) {
                  parentMenu.get('previousMenuItem').$().removeClass('focus');
        }
        subMenu.remove();
      }
    }
  },

  /** @private
    Call the moveUp function on the parent Menu
    
    @returns Boolean
  */
  moveUp: function(sender,evt) {
    var menu = this.get('parentMenu') ;
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
    var menu = this.get('parentMenu') ;
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
    var menu = this.get('parentMenu') ;
    if (menu) menu.remove() ;
    var pane = menu.getPath('anchor.pane') ;
    if (pane) pane.becomeKeyPane() ;
    return YES ;
  },
  
  /** @private*/
  didBecomeFirstResponder: function(responder) {
    if (responder !== this) return;
    var parentMenu = this.get('parentMenu') ;
    if(parentMenu) {
      parentMenu.set('currentSelectedMenuItem', this) ;
    }
  },
  
  /** @private*/
  willLoseFirstResponder: function(responder) {
    if (responder !== this) return;
    // this.$().removeClass('focus') ;
    var parentMenu = this.get('parentMenu') ;
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
    var menu = this.get('parentMenu') ;
    if(menu) {
      menu.remove() ;
    }
  },
  
  /** @private*/
  clickInside: function(frame, evt) {
    return SC.pointInRect({ x: evt.pageX, y: evt.pageY }, frame) ;
  }
  
}) ;
