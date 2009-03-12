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
/** @scope SC.MenuView.prototype */ {
  
  classNames: ['sc-menu-view'],
  
 
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
  itemKeys: 'itemIsEnabledKey itemIconKey itemWidthKey'.w(),
  
  /**
    This computed property is generated from the items array based on the 
    itemKey properties that you set.  The return value is an array of arrays
    that contain private information used by the MenuView to render. 
    
    You will not generally need to access or edit this property.
    
    @property {Array}
  */
  displayItems: function() {
    var items = this.get('items'), loc = this.get('localize') ;
    var keys=null, itemType, cur ;
    var ret = [], max = items.get('length'), idx, item ;
    var fetchKeys = SC._segmented_fetchKeys;
    var fetchItem = SC._segmented_fetchItem;
    
    // loop through items and collect data
    for(idx=0;idx<max;idx++) {
      item = items.objectAt(idx) ;
      if (SC.none(item)) continue; //skip is null or undefined

      // if the item is a string, build the array using defaults...
      itemType = SC.typeOf(item);
      if (itemType === SC.T_STRING) {
        cur = [item.humanize().titleize(), item, YES, null, null, idx] ;
        
      // if the item is not an array, try to use the itemKeys.
      } else if (itemType !== SC.T_ARRAY) {
        
        // get the itemKeys the first time
        if (keys===null) {
          keys = this.itemKeys.map(fetchKeys,this);
        }
        
        // now loop through the keys and try to get the values on the item
        cur = keys.map(fetchItem, item);
        cur[cur.length] = idx; // save current index
        
        // special case 1...if title key is null, try to make into string
        if (!keys[0] && item.toString) cur[0] = item.toString();
        
        // special case 2...if value key is null, use item itself
        if (!keys[1]) cur[1] = item;
        
        // special case 3...if isEnabled is null, default to yes.
        if (!keys[2]) cur[2] = YES ; 
      }
      
      // finally, be sure to loc the title if needed
      if (loc && cur[0]) cur[0] = cur[0].loc();
      
      // add to return array
      ret[ret.length] = cur;
    }
    
    // all done, return!
    return ret ;
  }.property('items', 'itemTitleKey', 'itemValueKey', 'itemIsEnabledKey', 'localize', 'itemIconKey', 'itemWidthKey').cacheable(),
  
  /** If the items array itself changes, add/remove observer on item... */
  itemsDidChange: function() { 
	//code to update the contents of the menu bar
  }.observes('items'),
  
  /** 
    Invoked whenever the item array or an item in the array is changed.  This method will reginerate the list of items.
  */
  itemContentDidChange: function() {
    //this.notifyPropertyChange('displayItems');
  },
  
  init: function() {
    sc_super();
    this.itemsDidChange() ;
  },

  
  // ..........................................................
  // RENDERING/DISPLAY SUPPORT
  // 
  
  displayProperties: ['displayItems', 'value', 'activeIndex'],
  
  
  render: function(context, firstTime) { 
    // collect some data 
    var items = this.get('displayItems');
    // regenerate the buttons only if the new display items differs from the
    // last cached version of it needsFirstDisplay is YES.
    var last = this._seg_displayItems;
    if (firstTime || (items !== last)) {
      this._seg_displayItems = items; // save for future
      this.renderDisplayItems(context, items) ;
      context.addStyle('text-align', 'center');
    }else{
    // update selection and active state
      var activeIndex = this.get('activeIndex');
      var value = this.get('value');
      var isArray = SC.isArray(value);
      if (isArray && value.get('length')===1) {
        value = value.objectAt(0); isArray = NO ;
      }
      var names = {}; // reuse
    
      var loc = items.length, cq = this.$('a.sc-menu'), item;
      while(--loc>=0) {
        item = items[loc];
        names.sel = isArray ? (value.indexOf(item[1])>=0) : (item[1]===value);
        names.active = (activeIndex === loc);
        SC.$(cq.get(loc)).setClass(names);
      }
      names = items = value = items = null; // cleanup
    }
  },
  
  /**
    Actually generates the segment HTML for the display items.  This method 
    is called the first time a view is constructed and any time the display
    items change thereafter.  This will construct the HTML but will not set
    any "transient" states such as the global isEnabled property or selection.
  */
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

    var title = null, icon = null, url=null, className=null, ic=null, item=null;
    var newIc = null;
    var value = this.get('value');
    var isArray = SC.isArray(value);
    var activeIndex = this.get('activeIndex');
    var len= items.length;
	var innerString = '';

	ic = context.begin('div').attr('id','menu');
	ic.push('<ul id="nav">');
    for(var i=0; i< len; i++){
	   innerString = 'sc-menu ';
	   ic.push('<li>');
	   item=items[i];
	   title = item[0];
	   icon = item[3];

       newIc = context.begin('a').attr('href','javascript:;');
	   newIc.addClass('sc-menu');

		if(!item[2]){
		     newIc.addClass('disabled');
	    }
       	if(i===0){
		     newIc.addClass('sc-first-segment');
   	    }
        if(i===(len-1)){
		     newIc.addClass('sc-last-segment');
   	    }
   	    if(i!==0 && i!==(len-1)){
      	     newIc.addClass('sc-middle-segment');
   	    }      
   	    if( isArray ? (value.indexOf(item[1])>=0) : (item[1]===value)){
      	      newIc.addClass('sel');
        }
		if(activeIndex === i) {
		     newIc.addClass('active') ;
		}		
		if(item[4]){
		     width=item[4];
		     newIc.addStyle('width', width+'px');
		}
        if (icon) {
             url = (icon.indexOf('/')>=0) ? icon : static_url('blank');
             className = (url === icon) ? '' : icon ;
             icon = '<img src="'+url+'" alt="" class="icon '+className+'" />';
        } else {
             icon = '';
        }

       newIc.push(icon+title);  
	   newIc.end();	
	   ic.push('</li>');	
    }   
 	   ic.push('</ul>');	  
       ic.end();
  },

  // ..........................................................
  // EVENT HANDLING
  // 
  
  /** 
    Determines the index into the displayItems array where the passed mouse
    event occurred.
  */
  displayItemIndexForEvent: function(evt) {
    var elem = SC.$(evt.target) ;
    if (!elem || elem===document) return -1; // nothing found

    // start at the target event and go upwards until we reach either the 
    // root responder or find an anchor.sc-menu.
    var root = this.$(), match = null ;
    while(!match && (elem.length>0) && (elem.get(0)!==root.get(0))) {
      if (elem.parent().attr('tagName') === 'LI' && elem.attr('tagName')==='A' && elem.hasClass('sc-menu')) {
		match = elem;
      } else elem = elem.parent();
    }
	elem = root = null;	
	
    // if a match was found, return the index of the match in subtags
    return (match) ? this.$('a.sc-menu').index(match) : -1;
  },
  
 
  mouseDown: function(evt) {
	
    if (!this.get('isEnabled')) return YES; // nothing to do
    var idx = this.displayItemIndexForEvent(evt);
    // if mouse was pressed on a button, then start detecting pressed events
    if (idx>=0) {
      this._isMouseDown = YES ;
      this.set('activeIndex', idx);
    }
    
    return YES ;
  },
  
  mouseUp:function(evt){

  },

  mouseOver:function(evt){
    // should show the menu items under the clicked menu item	
  },

  mouseOut:function(evt){
   // should hide the last visible menu  	
  }
 
 
}) ;

// Helpers defined here to avoid creating lots of closures...
SC._segmented_fetchKeys = function(k) { return this.get(k); };
SC._segmented_fetchItem = function(k) { 
  if (!k) return null;
  return this.get ? this.get(k) : this[k]; 
};




