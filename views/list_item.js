// ==========================================================================
// SC.ListItemView
// ==========================================================================

require('Core') ;
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
  
  
  contentPropertyDidChange: function() {
    this.render() ;  
  },
  
  /**
    Regenerates the innerHTML for this view and updates it if necessary.
  */
  render: function() {
    var html = [] ;
    var content = this.get('content') ;
    var del = this.displayDelegate ;
    
    // handle icon
    if (this.getDelegateProperty(del, 'hasContentIcon')) {
      
      var iconKey = this.getDelegateProperty(del,'contentIconKey') ;
      var icon = (iconKey && content && content.get) ? content.get(iconKey) : null ;

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
    }
    
    // handle label
    var labelKey = this.getDelegateProperty(del, 'contentValueKey') ;
    var label = (labelKey && content && content.get) ? content.get(labelKey) : null ;
    html.push('<span class="sc-label">') ;
    html.push(label || '') ;
    html.push('</span>') ;
    
    // handle unread count
    var countKey = this.getDelegateProperty(del, 'contentUnreadCountKey') ;
    var count = (countKey && content && content.get) ? content.get(countKey) : null ;
    if ((count != null) && (count != 0)) {
      html.push('<span class="sc-count"><span class="inner">') ;
      html.push(count.toString()) ;
      html.push('</span></span>') ;
    }
    
    // handle action 
    var actionKey = this.getDelegateProperty(del, 'listItemActionProperty') ;
    var actionClassName = (actionKey && content && content.get) ? content.get(actionKey) : null ;
    if (actionClassName) {
      html.push('<img src="') ;
      html.push(static_url('blank.gif')) ;
      html.push('" class="sc-action" />') ;
    }
    this.setClassName('sc-has-action', actionClassName) ;
    
    // handle branch
    if (this.getDelegateProperty(del, 'hasContentBranch')) {
      var branchKey = this.getDelegateProperty(del, 'contentIsBranchKey');
      var hasBranch = (branchKey && content && content.get) ? 
        content.get(branchKey) : false ;
      html.push('<span class="sc-branch ');
      html.push(hasBranch ? 'sc-branch-visible' : 'sc-branch-hidden') ;
      html.push('">&nbsp;</span>') ;
      this.setClassName('sc-has-branch', true) ;
    } else this.setClassName('sc-has-branch', false) ;
    
    html = html.join('') ;
    if (html != this._lastRenderedHtml) {
      this._lastRenderedHtml = html ;
      this.set('innerHTML', html) ;
    }
  }
  
}) ;
