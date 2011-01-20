// ==========================================================================
// SC.FolderedListViewDelegate
// ==========================================================================

/** @class
  
  A Foldered View Delegate is consulted by a SC.FolderedListView to make
  policy decisions about certain behaviors.
  
  @author Michael Cohen
  @see SC.FolderedListView
*/

SC.FolderedListViewDelegate = {
  
  /**
    Walk like a duck. Used to detect the mixin by SC.FolderedListView
  */
  isFolderedListViewDelegate: YES,
  
  /**
    This method will be called by the foldered list view when a user right
    clicks on the view.
    
    The delegate can decide what items will be displayed in the context menu
    based on what has been selected. When creating a menu it is to follow the
    given pattern:
    
      [
        { title: <title>,  target: <target>, action: <action>, isEnabled: <enabled> },
        { title: <title>,  target: <target>, action: <action>, isEnabled: <enabled> },
        ...
      ]
      
    All the menu items must be in an array. If you wish to insert a separator then add
    the following to the array:
    
      { isSeparator: YES }
    
    In the case when a context menu should not to be displayed, simply return null
      
    @param {SC.FolderedListView} view the foldered list view
    @param {SC.ListItemView} list item view for the mouse event.
    @returns {Array} An array of menu items to display in the context menu popup
  */
  folderedListViewContextMenuItems: function(view, itemView) {
    return null;
  }
};

