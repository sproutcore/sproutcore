// ==========================================================================
// SC.ListItemView
// ==========================================================================

require('core');
require('views/view') ;
require('mixins/control');

SC.LIST_ITEM_ACTION_CANCEL = 'sc-list-item-cancel-action';
SC.LIST_ITEM_ACTION_REFRESH = 'sc-list-item-cancel-refresh';
SC.LIST_ITEM_ACTION_EJECT = 'sc-list-item-cancel-eject';

/** @class

  Displays a list item with a label, optional icon, count, and right icon.

  @extends SC.View
  @extends SC.Control
  @author    AuthorName  
  @version 0.1
*/
SC.ListItemView = SC.View.extend(SC.Control,
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
    (GROUP DELEGATE) True if you want the item view to display an icon.
    
    If false, the icon on the list item view will be hidden.  Otherwise,
    space will be left for the icon next to the list item view.
  */
  hasListItemIcon: NO,
  
  /**
    (GROUP DELEGATE) True if you want space to be allocated for a branch 
    arrow.
    
    If false, the space for the branch arrow will be collapsed.
  */
  hasListItemBranch: NO,
  
  /**
    (GROUP DELEGATE) The name of the property used to get the icon URL.
    
    Set this property on the collection view or on a subclass.
    Leave it null to keep the icon URL set to a blank GIF.
  */
  listItemIconUrlProperty: null,
  
  /**
    (GROUP DELEGATE) The name of the property used for the icon CSS class.

    This property will be checked on the content object for a CSS class name
    to apply to the list item view's icon.  You can use either this property
    of the iconUrlProperty to set the icon that should display.
  */
  listItemIconClassNameProperty: null,
  
  /**
    (GROUP DELEGATE) The name of the property used for label itself
    
    If null, then the content object itself will be used..
  */
  contentValueProperty: null,
  
  /**
    (GROUP DELEGATE) The name of the property used to find the count of 
    unread items. 
    
    The count will only be visible if this property is not null and the 
    returned value is not 0.
  */
  listItemCountProperty: null,
  
  /**
    (GROUP DELEGATE) The name of the property used to determine if the item
    is a branch or leaf (i.e. if the branch icon should be displayed to the
    right edge.)
    
    If this is null, then the branch view will be completely hidden.
    Otherwise space will be allocated for it.
  */
  listItemBranchProperty: null,
  
  
  /**
    (GROUP DELEGATE) The name of the property used to determine the action 
    item to display.  
    
    This property value should be a CSS class name to apply to the action
    icon that will display the appropriate glyph.  If the value is NO or
    null, then no action will be displayed.
  */
  listItemActionProperty: null,
  
  /**
    (GROUP DELEGATE) Invoked when the user presses the action button.
    Called first on the delegate.
  */
  listItemAction: function(listItem, actionName) { 
  },
  
  /**
    Regenerates the innerHTML for this view and updates it if necessary.
  */
  render: function() {
    var html = [] ;
    var content = this.get('content') ;
    var del = this.collectionDelegate ;
    
    // handle icon
    if (this.getDelegateProperty(del, 'hasListItemIcon')) {
      var urlKey = this.getDelegateProperty(del,'listItemIconUrlProperty') ;
      var url = (urlKey && content && content.get) ? content.get(urlKey) : null ;
      
      var classNameKey = this.getDelegateProperty(del,'listItemIconClassNameProperty') ;
      var className = (classNameKey && content && content.get) ? content.get(classNameKey) : null ;
      
      html.push('<img class="sc-icon ');
      html.push(className || '');
      html.push('" src="');
      html.push(url || static_url('blank.gif')) ;
      html.push('" />') ;
    }
    
    // handle label
    var labelKey = this.getDelegateProperty(del, 'contentValueProperty') ;
    var label = (labelKey && content && content.get) ? content.get(labelKey) : null ;
    html.push('<span class="sc-label">') ;
    html.push(label || '') ;
    html.push('</span>') ;
    
    // handle unread count
    var countKey = this.getDelegateProperty(def, 'listItemCountProperty') ;
    var count = (countKey && content && content.get) ? content.get(countKey) : null ;
    if ((count != null) && (count != 0)) {
      html.push('<span class="sc-count">') ;
      html.push(count.toString()) ;
      html.push('</span>') ;
    }
    
    // handle action 
    var actionKey = this.getDelegateProperty(def, 'listItemActionProperty') ;
    var actionClassName = (actionKey && content && content.get) ? content.get(actionKey) : null ;
    if (actionClassName) {
      html.push('<img src="') ;
      html.push(static_url('blank.gif')) ;
      html.push('" class="sc-action" />') ;
    }
    
    // handle branch
    if (this.getDelegateProperty(def, 'hasListItemBranch')) {
      var branchKey = this.getDelegateProperty(def, 'listItemBranchProperty');
      var hasBranch = (branchKey && content && content.get) ? 
        content.get(branchKey) : false ;
      html.push('<span class="sc-branch ');
      html.push(hasBranch ? 'sc-branch-visible' : 'sc-branch-hidden') ;
      html.push('">&nbsp;</span>') ;
    }
    
    html = html.join('') ;
    if (html != this._lastRenderedHtml) {
      this._lastRenderedHtml = html ;
      this.set('innerHTML', html) ;
    }
  }
  
}) ;
