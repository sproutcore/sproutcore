// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2009 Sprout Systems, Inc. and contributors.
//            Portions ©2008-2009 Apple, Inc. All rights reserved.
// License:   Licened under MIT license (see license.js)
// ==========================================================================
sc_require('views/button');
sc_require('views/separator');

/**
  @class SC.MenuItemView
  @extends SC.ButtonView
  @since SproutCore 1.0
*/
SC.MenuItemView = SC.ButtonView.extend(
/** @scope SC.MenuItemView.prototype */{
  classNames: ['sc-menu-item'],
  tagName: 'div',
  anchor:null,
  parentPane:null,
  acceptsFirstResponder:YES,
  // ..........................................................
  // KEY PROPERTIES
  // 
  /**
    The content object the menu view will display.

    @type Object
  */
  content: null,
  
  /**
    The cached Content to verify that the content has changed or not

    @type Object
  */
  cachedContent:null,

  /**
    This returns true if the child view is a menu list view.
    This property can be over written to have other child views as well.

    @type View
  */
  childView: null,

  /**
    This returns true if the child view is a menu list view.
    This property can be over written to have other child views as well.

    @type Boolean
  */
  isSubMenuViewVisible: null,
  
  /**
    This will return true if the menu item is a seperator.

    @type Boolean
  */
  isSeperator: NO,

  /**
    (displayDelegate) The name of the property used for label itself   
    If null, then the content object itself will be used.

    @type String
  */
  contentValueKey: null,

  /**
    (displayDelegate) The name of the property used to determine if the menu 
    item is a branch or leaf (i.e. if the branch arow should be displayed to 
	the right edge.)   
    If this is null, then the branch arrow will be collapsed.

    @type String
  */
  contentIsBranchKey: null,

  /**
    The name of the property which will set the image for the short cut keys

    @type String
  */
  shortCutKey: null,

  /**
    The name of the property which will set the icon image for the menu item.

    @type String
  */
  contentIconKey: null,

  /*
    The name of the property which will set the checkbox image for the menu 
    item.

    @type String
  */
  contentCheckboxKey: null,

  /*
    The name of the property which will set the checkbox image for the menu 
    item.

    @type String
  */
  contentActionKey: null,
  
  /**
    The name of the property which will set the checkbox state

    @type Boolean
  */
  isCheckboxChecked: NO,  
  
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
    Property specifies which menu item the mouseover stops at

    @type Boolean
  */
  isSelected : NO,

  /**
    Sub Menu Items 
    If this is null then there is no branching

    @type View
  */
  subMenu:null,
  
  hasMouseExited:NO,
  /**
    This will hold the properties that can trigger a change in the diplay
  */
  displayProperties: ['contentValueKey', 'contentIconKey', 'shortCutKey',
                  'contentIsBranchKey','isCheckboxChecked','itemHeight',
                   'subMenu'],

  /**
    Fills the passed html-array with strings that can be joined to form the
    innerHTML of the receiver element.  Also populates an array of classNames
    to set on the outer element.
    
    @param {SC.RenderContext} context
    @param {Boolean} firstTime
    @returns {void}
  */
  render: function(context, firstTime) {
    if (SC.BENCHMARK_RENDER) {

      var bkey = '%@.render'.fmt(this) ;
      SC.Benchmark.start(bkey);
    }
	
    var content = this.get('content') ;
    if (this.cachedContent && this.cachedContent == content) return; 
    this.cachedContent = content ;

    var del = this.displayDelegate ;
    var key, value ;
    var ic ;
    var menu = this.parentMenu();
    var itemWidth = this.get('itemWidth') || menu.layout.width ;
    var itemHeight = this.get('itemHeight') || menu.layout.height ;
    this.set('itemWidth',itemWidth);
    this.set('itemHeight',itemHeight);
      //handle seperator    
    ic = context.begin('a').attr('href', 'javascript:;') ;   
    key = this.getDelegateProperty(del, 'isSeparatorKey') ;
    value = (key && content) ? (content.get ? content.get(key) : content[key]) : null ;
    if (value) {
      this.set('itemHeight',5) ;
      this.adjust({height:this.get('itemHeight')}) ;
      ic = ic.begin('span').addClass('separator') ;
      ic = ic.end() ;
      return ;
    } else {
      //handle checkbox
      key = this.getDelegateProperty(del, 'contentCheckboxKey') ;
      if (key) {
        value = content ? (content.get ? content.get(key) : content[key]) : NO ;
        if (value) {
        ic.begin('div').addClass('checkbox').end() ;
        }
      }

      // handle image -- always invoke
      key = this.getDelegateProperty(del, 'contentIconKey') ;
      value = (key && content) ? (content.get ? content.get(key) : content[key]) : null ;
      if(value && SC.typeOf(value) !== SC.T_STRING) value = value.toString() ;
      if(value) this.renderImage(ic, value) ;

      // handle label -- always invoke
      key = this.getDelegateProperty(del, 'contentValueKey') ;
      value = (key && content) ? (content.get ? content.get(key) : content[key]) : content ;
      if (value && SC.typeOf(value) !== SC.T_STRING) value = value.toString();
      this.renderLabel(ic, value||'') ;

      // handle branch
      key = this.getDelegateProperty(del, 'contentIsBranchKey') ;
      value = (key && content) ? (content.get ? content.get(key) : content[key]) : NO ;
      if (value) {       
        this.renderBranch(ic, value) ;
        ic.addClass('has-branch') ;
      } else { // handle action
        
        key = this.getDelegateProperty(del, 'action') ;
        value = (key && content) ? (content.get ? content.get(key) : content[key]) : null ;
        if (value && isNaN(value)) this.set('action', value) ;

        key = this.getDelegateProperty(del, 'target') ;
        value = (key && content) ? (content.get ? content.get(key) : content[key]) : null ;
        if (value && isNaN(value)) this.set('target', value) ;

        // handle short cut keys
        if (this.getDelegateProperty(del, 'shortCutKey')) {
        /* handle short cut keys here */
          key = this.getDelegateProperty(del, 'shortCutKey') ;
          value = (key && content) ? (content.get ? content.get(key) : content[key]) : null ;
          if (value) {
            this.renderShortcut(ic, value) ;
            ic.addClass('shortcutkey') ;
          }
        }
      }
    }
    ic.end();
    if (SC.BENCHMARK_RENDER) SC.Benchmark.end(bkey);
  },
      
  /** 
   Generates the image used to represent the image icon. override this to 
   return your own custom HTML
 
   @param {SC.RenderContext} context the render context
   @param {Boolean} hasBranch YES if the item has a branch
   @returns {void}
  */
  renderImage: function(context, image) {
    // get a class name and url to include if relevant

    var url = undefined, className = undefined ;
    if (image && SC.ImageView.valueIsUrl(image)) {
      url = image ;
      className = '' ;
    } else {
      className = image ;
      url = sc_static('blank.gif') ; 
    }
    // generate the img element...
    context.begin('img').addClass('image').addClass(className).attr('src', url).end() ;
  },

  renderLabel: function(context, label) {
    context.push("<span class='value'>"+label+"</span>") ;
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
    var url = sc_static('blank.gif') ;
    context.push('<span class= "hasBranch">'+a+'</span>') ; 
  },

  /** 
   Generates the string used to represent the short cut keys. override this to 
   return your own custom HTML

   @param {SC.RenderContext} context the render context
   @param {Boolean} hasBranch YES if the item has a branch
   @returns {void}
  */
  renderShortcut: function(context, shortcut) {
    context.push('<span class = "shortCut">' + shortcut + '</span>') ;
  },

  superClass: NO,

  getAnchor: function() {
    var anchor = this.get('anchor');
    if(anchor.kindOf(SC.MenuItemView)) return anchor;
    return null;
  },
  //..........................................
  //Mouse Events Handling
  //..........................................
  
  mouseUp: function(evt) {
    if (!this.isEnabled) return YES ;
    this.set('hasMouseExited',NO);
    this.isSelected = YES ;
    var key = this.get('contentCheckboxKey') ;
    var content = this.get('content') ;
    if (key) {
      if (content && content.get(key)) {
        this.$('.checkbox').setClass('inactive', YES) ;
        content.set(key, NO) ;
      } else {
        this.$('.checkbox').removeClass('inactive') ;
        content.set(key, YES) ;
      }
    }
    this._action(evt);
    var anchor = this.getAnchor();
    if(anchor) anchor.mouseUp(evt);
    var menu = this.parentMenu();
    if(menu) menu.remove();
    return YES ;
  },

  isCurrent: NO,
  
  /** @private
    This has been over ridden from button view to prevent calling of render 
    method (When isActive property is changed).
  */
  mouseEntered: function(evt) {
    if (!this.isEnabled) return YES ;
    this.becomeFirstResponder();
    this.isSelected = YES ;

    var parentPane = this.parentMenu() ;
    if(parentPane) parentPane.set('currentItemSelected', this) ;

    var key = this.get('contentIsBranchKey') ;
    if(key){
      var content = this.get('content');
      var value = (key && content) ? (content.get ? content.get(key) : content[key]) : NO ;
      if(value) this.invokeLater(this.branching,100);
    }
    this.$().addClass('sel');
	  return YES;
  },

  isSubMenuAMenuPane: function(subMenu) {
    if(subMenu.kindOf(SC.MenuPane)) return YES;
    return NO;  
  },
  
  hasSubMenu: function(){
    var content = this.get('content') ;
    var subMenu = content.get('subMenu') ;
    if(subMenu) return subMenu;
    return null;
  },
  
  branching: function() {
    if(this.get('hasMouseExited')) {
      this.set('hasMouseExited',NO);
      return;
    }
    var subMenu = this.hasSubMenu();
    if(subMenu) {
	    subMenu.set('anchor', this);
      if(this.isSubMenuAMenuPane(subMenu)) {
          subMenu.popup(this,[0,0,0]) ;
          var context = SC.RenderContext(this) ;
          context = context.begin(subMenu.get('tagName')) ;
          subMenu.prepareContext(context, YES) ;
          context = context.end() ;
      }
    }
  },
  
  parentMenu: function() {
    return this.get('parentPane');
  },

  mouseExited: function(evt) {
    this.loseFocus();
    return YES ;
  },
  
  mouseDown: function(evt) {
    return YES;
  },

  loseFocus: function() {
    if(!this.hasSubMenu()) this.$().removeClass('sel');
    this.set('hasMouseExited',YES);
    this.set('isSelected',NO) ;
    var menu = this.parentMenu();
    if(menu) menu.set('currentItemSelected', null) ;
  },
    
  moveUp: function(sender,evt) {
    var menu = this.parentMenu();
    if(menu) {
      menu.moveUp(this);
    }
    return YES;
  },
  
  moveDown: function(sender,evt) {
    var menu = this.parentMenu();
    if(menu) {
      menu.moveDown(this);
    }
    return YES;
  },
  
  keyDown: function(evt) {
    // console.log('keyDown called on %@'.fmt(this));
    return this.interpretKeyEvents(evt) ;
  },
  
  keyUp: function(evt) {
    return YES;
  }

});
