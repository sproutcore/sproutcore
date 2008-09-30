// ========================================================================
// SproutCore
// copyright 2006-2008 Sprout Systems, Inc.
// ========================================================================

/**
  @namespace 
  
  Implements common selection management properties for controllers.

  Selection can be managed by any controller in your applications.  This
  mixin provides some common management features you might want such as
  disabling selection, or restricting empty or multiple selections.

  To use this mixin, simply add it to any controller you want to manage 
  selection and call updateSelectionAfterContentChange()
  whenever your source content changes.  You can also override the properties
  defined below to configure how the selection management will treat your 
  content.
  
  This mixin assumes the arrangedObjects property will return the array of 
  content you want the selection to reflect.
  
  Add this mixin to any controller you want to manage selection.  It is 
  already applied to the CollectionController and ArrayController.

*/
SC.SelectionSupport = {
  
  /** 
    Call this method whenever  your source content changes to ensure the 
    selection always remains up-to-date and valid.
  */
  updateSelectionAfterContentChange: function() {
    var objects = Array.from(this.get('arrangedObjects')) ;
    var currentSelection = Array.from(this.get('selection')) ;
    var sel = [] ;

    // the new selection is the current selection that exists in 
    // arrangedObjects or an empty selection if selection is not allowed.
    var max = currentSelection.get('length') ;
    if (this.get('allowsSelection')) {
      for(var idx=0;idx<max;idx++) {
        var obj = currentSelection.objectAt(idx) ;
        if (objects.indexOf(obj) >= 0) sel.push(obj) ;
      }
    }

    // if the new selection is a multiple selection, then get the first
    // object.
    var selectionLength = sel.get('length') ;
    if ((selectionLength > 1) && !this.get('allowsMultipleSelection')) {
      sel = [sel.objectAt(0)] ;
    }

    // if the selection is empty, select the first item.
    if ((selectionLength == 0) && !this.get('allowsEmptySelection')) {
      if (objects.get('length') > 0) sel = [objects.objectAt(0)];
    }

    // update the selection.
    this.set('selection',sel) ;
  },
  
  /**
    @field {Array} arrangedObjects
    
    Returns the set of content objects the selection should be a part of.
    Selections in general may contain objects outside of this content, but
    this set will be used when enforcing items such as no empty selection.
    
    The default version of this property returns the receiver.
  */
  arrangedObjects: function() {
    return this;
  }.property(),
  
  /**  
    @field {Array} selection 

    This is the current selection.  You can make this selection and another
    controller's selection work in concert by binding them together. You
    generally have a master selection that relays changes TO all the others.
  */
  selection: function(key,value)
  {
    if (value !== undefined) {
      
      // always force to an array
      value = Array.from(value) ;
    
      var allowsSelection         = this.get('allowsSelection');
      var allowsEmptySelection    = this.get('allowsEmptySelection');
      var allowsMultipleSelection = this.get('allowsMultipleSelection');
    
      // are we even allowing selection at all?
      // if not, then bail out.
      if ( !allowsSelection ) return this._selection;
    
      // ok, new decide if the *type* of seleciton is allowed...
      switch ( value.get('length') )
      {
        case 0:
          // check to see if we're attemting to set an empty array
          // if that's not allowed, set to the first available item in 
          // arrangedObjects
          if (!allowsEmptySelection) {
            var objects = this.get('arrangedObjects') ;
            if (objects.get('length') > 0) value = [objects.objectAt(0)];
          }
          this._selection = value ;
          break;
        case 1:
          this._selection = value;
          break;
        default:
          // fall through for >= 2 items...
          // only allow if configured for multi-select
          this._selection = allowsMultipleSelection ? value : this._selection;
          break;
      }
    }
  
    return this._selection;
  }.property(),

  /**
    If true, selection is allowed.

    @type bool
  */
  allowsSelection: true,

  /**
    If true, multiple selection is allowed.

    @type bool
  */
  allowsMultipleSelection: true,

  /**
    If true, allow empty selection

    @type bool
  */
  allowsEmptySelection: true,
  
  /**
    YES if the receiver currently has a non-zero selection.
    
    @property
    @type {Boolean}
  */
  hasSelection: function() {
    var sel = this.get('selection') ;
    return !!sel && (sel.get('length') > 0) ;
  }.property('selection')
    
};

