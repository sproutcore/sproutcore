// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2009 Sprout Systems, Inc. and contributors.
//            Portions ©2008-2009 Apple, Inc. All rights reserved.
// License:   Licened under MIT license (see license.js)
// ==========================================================================

/**
  @class

  

  @extends SC.View
  @since SproutCore 1.0
*/


SC.MenuView = SC.View.extend(SC.Control,
 {
	
 classNames:['sc-menu-view'],

 /**
   Set to YES to enabled the segmented view, NO to disabled it.
 */
 isEnabled: YES,


 /** 
   A key that determines if a menuitem in particular is enabled.  Note if the
   control in general is not enabled, no items will be enabled, even if the
   item's enabled property returns YES.
   
   @property {String}
 */
 itemIsEnabledKey: null, 

 /**
    The array of items to display.  This can be a simple array of strings,
    objects or hashes.  If you pass objects or hashes, you must also set the
    various itemKey properties to tell the MenuView how to extract the
    information it needs.

    @property {Array}
  */
  items: [],

  /** 
    The key that contains the icon for each item.  If omitted, no icons will
    be displayed.

    @property {String}
  */
  itemIconKey: null,	

  /** 
    The key that contains the desired width for each item.  If omitted, the
    width will autosize.

    @property {String}
  */
  itemWidthKey: null,

  /**
    If YES, titles will be localized before display.
  */
  localize: YES,
	

  /**
    The array of itemKeys that will be searched to build the displayItems
    array.  This is used internally by the class.  You will not generally
    need to access or edit this array.

    @property {Array}
  */
 itemKeys: 'itemIconKey itemIsEnabledKey itemWidthKey'.w(),

 // add default views
 // should add a default view that holds all the menu items 
  menuItemsView: SC.View, 
  
 /**
    This computed property is generated from the items array
 */
 displayItems: function() {
   //get the items
 }.property('items','itemIconKey', 'itemIsEnabledKey','itemWidthKey').cacheable(),

 
 /*based on the items passed that needs to form the
 menu bar the render method fetches the items and 
creates the menu tab*/

 render: function(context, firstTime) { 

    // collect some data 
    var items = this.get('displayItems');

    // regenerate the buttons only if the new display items differs from the
    // last cached version of it needsFirstDisplay is YES.
   
	this.renderDisplayItems(context, items) ;
  },


 renderDisplayItems: function(context, items) {
   
    /*
    create a div that holds u'r menu tabs , like in the below snippet
    have a the tabs within <li> tag (the menu view class) and the menu items that should 
    be obtained from menu items class be in a structure within a div and the menuitems 
    within the <a> tags.

    <div id="menu">
	<ul id="nav">
		<li><a href="i#">Home</a></li>
		
		<li><a href="#" onmouseover="mopen('m1')" onmouseout="mclosetime()">Music</a>				
				<!-- the items from menuitems class-->
				<div id="m1"onmouseover="mcancelclosetime()"onmouseout="mclosetime()">
					<a href="#">Discography</a>
					<a href="#">Lyrics</a>
					<a href="#">Learn To Play</a>
				</div>
		</li>

		<li><a href="#" onmouseover="mopen('m2')" onmouseout="mclosetime()">Community</a>
			    <!-- the items from menuitems class-->
			    <div id="m2" onmouseover="mcancelclosetime()" onmouseout="mclosetime()">
				    <a href="#">Forum</a>
					<a href="#">News</a>
					<a href="#">Street Team</a>
					<a href="#">Affiliates</a>
			</div>
		</li>
	</ul>
	</div>
   */

  },

  displayProperties: ['displayItems','activeIndex'],
  
  /** If the items array itself changes, add/remove observer on item... */
  itemsDidChange: function() { 
	//code to update the contents of the menu bar
  }.observes('items'),

  /** 
    Invoked whenever the item array or an item in the array is changed.  This method will reginerate the list of items.
  */
  itemContentDidChange: function() {
    //code to recreate the menu bar
  },


  /*
	method that deals with fetching the index of the item selected from the menu 
	bar  
  */

  displayItemIndexForEvent: function(evt) {	 
	 //code to get return the index	 
  }	,

  mouseDown:function(evt){
   //trigger an event when the mouse is clicked
   //the event should fetch the menu items and appened it to the menu tab
   //make the menu tab be displayed as selected	
  },

  mouseUp:function(evt){
	
  },

  mouseOver:function(evt){
    // should show the menu items under the clicked menu item	
  },

  mouseOut:function(evt){
   // should hide the last visible menu  	
  },
  
  createChildViews: function() {
	  var childViews = [] ;   
      if (view = this.get('menuItemsView')) {
       	 view = this.createChildView(view, {
	          layoutView: this
	          //rootElementPath: [idx]
	        }) ;
	        childViews.push(view) ;
	  }
    this.set('childViews', childViews) ;
    return this ; 
  }


}) ;