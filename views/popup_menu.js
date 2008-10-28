// ========================================================================
// SproutCore
// copyright 2006-2008 Sprout Systems, Inc.
// ========================================================================

require('views/view') ;

/**
  @class
  
  This is a basic popup menu. You can show the popup menu by calling the 
  view's popup() method.  Pass in the root element and event so that is can
  be positioned.
  
  @extends SC.View
*/
SC.PopupMenuView = SC.View.extend({
  emptyElement: "<ul></ul>",
  
  acceptsFirstResponder: true,


  keyDown: function(evt)
  {
    return this.interpretKeyEvents(evt);
  },

  // interpretKeyEvents callbacks...
  cancel: function()
  {
    this.set('currentSelectedMenuItem', null);
    this.set('isVisible', false);
  },
  moveUp: function()
  {
    this.selectPreviousMenuItem();
  },
  moveDown: function()
  {
    this.selectNextMenuItem();
  },
  
  _currentSelectedMenuItem: null,
  currentSelectedMenuItem: function( key, value )
  {
    if (value !== undefined)
    {
      if (this._currentSelectedMenuItem) this._currentSelectedMenuItem.set('isDefault', false);
      this._currentSelectedMenuItem = value;
      if (this._currentSelectedMenuItem) this._currentSelectedMenuItem.set('isDefault', true);
    }
    return this._currentSelectedMenuItem;
  }.property(),
  
  selectPreviousMenuItem: function()
  {
    var item = this.previousValidMenuItem();
    if (!item) return false;
    this.set('currentSelectedMenuItem', item);
  },
  
  selectNextMenuItem: function()
  {
    var item = this.nextValidMenuItem();
    if (!item) return false;
    this.set('currentSelectedMenuItem', item);
  },
  
  previousValidMenuItem: function()
  {
    return this._validMenuItemInDirection('previousSibling', 'lastChild');
  },
  nextValidMenuItem: function()
  {
    return this._validMenuItemInDirection('nextSibling', 'firstChild');
  },
  _validMenuItemInDirection: function( direction, begin )
  {
    var curr = this.get('currentSelectedMenuItem');
    var view = curr ? curr.get(direction) : this.get(begin);
    if (!view) return null;
    do {
      if (view.get('isEnabled')) return view;
    } while (view = view.get(direction));
    return null;
  },
  
  
  _show: function()
  {
    // clear out any previously used selection value...
    this.set('currentSelectedMenuItem', null);

    var menuItems = this.get('childNodes');
    for (var i=0, n=menuItems.length; i < n; i++)
    {
      // for each menu item, get the action that it performs and the current target for that action
      var sender = menuItems[i];

      // old function style actions... skip validating and let them be
      if (sender._hasLegacyActionHandler()) continue;

      var action = sender.get('action');
      var target = SC.app.targetForAction(action, sender.get('target'), sender);
      
      //console.log( "action: %s, target: %o", action, target );
      
      // found a target and the target validates, menu item is enabled if the validator returns true
      if (target && target.respondsTo('validateMenuItem')) sender.set('isEnabled', target.validateMenuItem(sender));
      // found a target and it chooses not to validate, menu item is enabled
      if (target && !target.respondsTo('validateMenuItem')) sender.set('isEnabled', true);
      // unable to resolve a target for this action, therefor disable the menu item
      if (!target) sender.set('isEnabled', false);
    }
    // call the superclasses _show method to make the menu visible
    sc_super();
  },
  
  resizeWithOldParentSize: function() {
    
    // loop through child views (which should be menu items), and get their
    // required widths.  Use the maximum returned width.
    var requiredWidth = 0;
    var child = this.get('firstChild') ;
    while(child) {
      var w = (child.computedRequiredWidth) ? child.computedRequiredWidth():0;
      if (w > requiredWidth) requiredWidth = w ;
      child = child.get('nextSibling') ;
    }
   var oldWidth = this.get("size").width;
   if(requiredWidth != oldWidth)
   {
     var size = { width: requiredWidth };
     // set this view to the same size.
     this.set('size',size) ;
   }
  }
  
});
