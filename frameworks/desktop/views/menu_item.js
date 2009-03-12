SC.MenuItemView = SC.ListItemView.extend({
/** @scope SC.MenuItemView.prototype */
  classNames: ['sc-menu-item-view'],
  
  // ..........................................................
  // KEY PROPERTIES
  // 
  
  /**
    The content object the menu view will display.
  */
  content: null,

  /**
    This returns true if the child view is a menu list view.
    This property can be over written to have other child views as well.
  */
  childView: SC.MenuList, 
  
  /**
    This will set the contents for the child view if the menu item has a branch
  */
  childViewContent: null,

  /**
    This property will set the action meant to be performed for the menu
	only if it does not have a branch
  */
  menuItemAction: null,

  /**
    (displayDelegate) Returns true if the menu item has a child (branch).
    
    If false, the space for the branch arrow will be collapsed.
  */
  hasChild: NO,
  
  /**
    (displayDelegate) The name of the property used for label itself
    
    If null, then the content object itself will be used.
  */
  contentValueKey: null,
  
  /**
    (displayDelegate) The name of the property used to determine if the menu item
    is a branch or leaf (i.e. if the branch arow should be displayed to the
    right edge.)
    
    If this is null, then the branch arrow will be collapsed.
  */
  contentIsBranchKey: null,

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
    
    // handle label -- always invoke
    key = this.getDelegateProperty(del, 'contentValueKey') ;
    value = (key && content) ? (content.get ? content.get(key) : content[key]) : content ;
    if (value && SC.typeOf(value) !== SC.T_STRING) value = value.toString();
    this.renderLabel(context, value);

    // handle action 
    key = this.getDelegateProperty(del, 'menuItemAction') ;
    value = (key && content) ? (content.get ? content.get(key) : content[key]) : null ;
    if (value) {
      this.renderAction(context, value);
      context.addClass('has-action');
    }
    
    // handle branch
    if (this.getDelegateProperty(del, 'hasChild')) {
      key = this.getDelegateProperty(del, 'contentIsBranchKey');
      value = (key && content) ? (content.get ? content.get(key) : content[key]) : NO ;
      this.renderBranch(context, value);
      context.addClass('has-branch');
    }

	// handle short cut keys
	if (this.getDelegateProperty(del, 'shortCutKey')) {
	  /* handle short cut keys here */	
	}

  },

  renderLabel: function(context, label) {
    context.push('<label>', label || '', '</label>') ;
  },

  /** 
    Generates the html string used to represent the action item for your 
    list item.  override this to return your own custom HTML

    @param {SC.RenderContext} context the render context
    @param {String} actionClassName the name of the action item
    @returns {void}
  */
  renderAction: function(context, actionClassName){
	/* Set what action is called for the menu item. */
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
  
  /** @private 
  mouseDown is handled only for clicks on the checkbox view or or action
  button.
  */
  mouseDown: function(evt) {
 	if(this.get('hasChild')) return YES;
    return NO ; // let the collection view handle this event
  },

  mouseUp: function(evt) {
    /*do sumthing to set child menu items.*/
	if(this.get('hasChild')){
		//Pops out the child menu items with contents from the childViewContent property.
	}
	else{
		//performs the action set by the renderAction method.
	}
  },

  mouseMoved: function(evt) {
	//Set the CSS class so that the menu is higlighted.
  }
  
}) ;
