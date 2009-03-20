sc_require('views/button');
sc_require('views/separator');

SC.MenuItemView = SC.ButtonView.extend(SC.Control,{
/** @scope SC.MenuItemView.prototype */
  classNames: ['sc-menu-item-view'],
  tagName: 'div',
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
  childView: SC.MenuList, //may not need after all

  /**
    This will return true if the menu item is a seperator.
  */
  isSeperator: NO,

  /**
    This retirns true if the menu item is infact an option. If true it will
    dispaly an image of a tick mark when the menu item is selected.
  */
  isAnOption: NO,
  
  /**
    This will set the contents for the child view if the menu item has a branch
  */
  childViewContent: null,  //still may be needed to set child menu items

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
    The name of the property which will set the icon image for the menu item.
  */
  contentIconKey: null,

  /**
    The name of the property which will set the image for the short cut keys
  */
  shortCutKey: null,
 /*
	The name of the property which will set the checkbox image for the menu item.
  */	
	contentCheckboxKey:null,
 /*
	The name of the property which will set the checkbox state
  */	
	isCheckboxChecked:NO,
	
  /**
    Fills the passed html-array with strings that can be joined to form the
    innerHTML of the receiver element.  Also populates an array of classNames
    to set on the outer element.
    
    @param {SC.RenderContext} context
    @param {Boolean} firstTime
    @returns {void}
  */
displayProperties: ['contentValueKey', 'contentIconKey', 'shortCutKey'],
  	render: function(context, firstTime) {
    var content = this.get('content') ;
	var del = this.displayDelegate ;
    var key, value ;
	var ic = context.begin('a').attr('href', 'javascript:;');
	
	//handle seperator
	key = this.getDelegateProperty(del, 'isSeparator');
	value = (key && content) ? (content.get ? content.get(key) : content[key]) : null ;
	if(value) {
		ic = ic.begin('span').addClass('separator') ;
		ic = ic.end() ;
		return;
	} else {
	  	key = this.getDelegateProperty(del, 'contentCheckboxKey') ;
      	if (key) {
      		value = content ? (content.get ? content.get(key) : content[key]) : NO ;
			if(value) {
				ic.begin('div').addClass('checkbox').end() ;
			}
      	}

      	// handle image
	  	key = this.getDelegateProperty(del,'contentIconKey') ;
	  	value = (key && content) ? (content.get ? content.get(key) : content[key]) : null ;
	  	this.renderImage(ic, value);

	  	// handle label -- always invoke
	  	key = this.getDelegateProperty(del, 'contentValueKey') ;
	  	value = (key && content) ? (content.get ? content.get(key) : content[key]) : content ;
	  	if (value && SC.typeOf(value) !== SC.T_STRING) value = value.toString();
	  	this.renderLabel(ic, value);

	  	// handle branch
	  	if (this.getDelegateProperty(del, 'contentIsBranchKey')) {
	    	key = this.getDelegateProperty(del, 'contentIsBranchKey');
	    	value = (key && content) ? (content.get ? content.get(key) : content[key]) : NO ;
	    	this.renderBranch(ic, value);
	    	ic.addClass('has-branch');
	    	return;
	  	} else { // handle action
			key = this.getDelegateProperty(del, 'action');
			value = (key && content) ? (content.get ? content.get(key) : content[key]) : null ;
			if(value && isNaN(value)) this.set('action',value);

			// handle short cut keys
			if (this.getDelegateProperty(del, 'shortCutKey')) {
		  		/* handle short cut keys here */	
		  		key = this.getDelegateProperty(del,'shortCutKey') ;
	      		value = (key && content) ? (content.get ? content.get(key) : content[key]) : null ;
	      		this.renderShortcut(ic, value);
	      		ic.addClass('shortcutkey');
			}
	  	}
	}
	ic.end();	
  },

  renderImage: function(context, image) {
	// get a class name and url to include if relevant
    var url = null, className = null ;
    if (image && SC.ImageView.valueIsUrl(image)) {
      url = image; className = '' ;
    } else {
      className = image; url = sc_static('blank.gif') ;
    }

    // generate the img element...
    context.begin('img')
      .addClass('image').addClass(className)
      .attr('src', url)
    .end();
  },

   
  renderLabel: function(context, label) {
<<<<<<< HEAD:frameworks/desktop/views/menu_item.js
<<<<<<< HEAD:frameworks/desktop/views/menu_item.js
    context.push( label || '') ;
=======
    context.push('<label class="title">', label || '', '</label>') ;
>>>>>>> made changes to link menu and menu_item:frameworks/desktop/views/menu_item.js
=======
    context.push( label || '') ;
>>>>>>> basic display of the menu,menu item completed, with some actions:frameworks/desktop/views/menu_item.js
  },

	//   /** 
	//     Generates the html string used to represent the action item for your 
	//     menu item.  override this to return your own custom HTML
	// 
	//     @param {SC.RenderContext} context the render context
	//     @param {String} actionClassName the name of the action item
	//     @returns {void}
	//   */
	//   renderAction: function(context, actionClassName){
	// /* Set what action is called for the menu item. */
	// this.set('action', actionClassName);
	//   },

  /** 
   Generates the string used to represent the branch arrow. override this to 
   return your own custom HTML
 
   @param {SC.RenderContext} context the render context
   @param {Boolean} hasBranch YES if the item has a branch
   @returns {void}
  */

  renderBranch: function(context, hasBranch) {
	var a = '>';
    context.begin('span')//.addClass('branch')
      .addClass(hasBranch ? 'branch-visible' : 'branch-hidden')
      .push(a).end();
  },
  
  /***/
  renderShortcut: function(context, shortcut) { /*alert("short cut");*/ },

  superClass: NO,

  mouseUp: function(evt)
  {
	if(this.get('superClass')) sc_super();	
    this._closeParentMenu();
  },

  _closeParentMenu: function()
  {
    var menu = this.get('parentNode');
    if (menu) menu.set('isVisible', false);
  },

  mouseDown: function(evt) {
	var key = this.get('contentCheckboxKey');
	var content = this.get('content');
 	if(key) {
		if(content && content.get(key)){
				this.$('.checkbox').setClass('inactive',YES);
				content.set(key,NO);
				}else {
				this.$('.checkbox').removeClass('inactive');
				content.set(key,YES);
				}
	}
	
	if(this.get('contentIsBranchKey')) return YES;
	this.set('superClass', YES);
    sc_super();
  },
  
  
}) ;
