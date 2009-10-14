// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2009 Sprout Systems, Inc. and contributors.
//            Portions ©2008-2009 Apple Inc. All rights reserved.
// License:   Licened under MIT license (see license.js)
// ==========================================================================

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
  
  This mixin assumes the arrangedObjects property will return an SC.Array of 
  content you want the selection to reflect.
  
  Add this mixin to any controller you want to manage selection.  It is 
  already applied to the CollectionController and ArrayController.
  
  @since SproutCore 1.0
*/
SC.SelectionSupport = {
  
  // ..........................................................
  // PROPERTIES
  // 
  
  /**
    Walk like a duck.
    
    @property {Boolean}
  */
  hasSelectionSupport: YES,
  
  /**
    If YES, selection is allowed. Default is YES.
    
    @property {Boolean}
  */
  allowsSelection: YES,
  
  /**
    If YES, multiple selection is allowed. Default is YES.
    
    @property {Boolean}
  */
  allowsMultipleSelection: YES,
  
  /**
    If YES, allow empty selection Default is YES.
    
    @property {Boolean}
  */
  allowsEmptySelection: YES,
  
  /**
    Override to return the first selectable object.  For example, if you 
    have groups or want to otherwise limit the kinds of objects that can be
    selected.
    
    the default imeplementation returns firstObject property.
    
    @returns {Object} first selectable object
  */
  firstSelectableObject: function() {
    return this.get('firstObject');
  }.property(),
  
  /**
    This is the current selection.  You can make this selection and another
    controller's selection work in concert by binding them together. You
    generally have a master selection that relays changes TO all the others.
    
    @property {SC.SelectionSet}
  */
  selection: function(key, value) {
        
    var old = this._scsel_selection,
        oldlen = old ? old.get('length') : 0,
        content, empty, len;

    // whenever we have to recompute selection, reapply all the conditions to
    // the selection.  This ensures that changing the conditions immediately
    // updates the selection.
    // 
    // Note also if we don't allowSelection, we don't clear the old selection;
    // we just don't allow it to be changed.
    if ((value === undefined) || !this.get('allowsSelection')) value = old ;

    len = (value && value.isEnumerable) ? value.get('length') : 0;
    
    // if we don't allow multiple selection
    if ((len>1) && !this.get('allowsMultipleSelection')) {

      if (oldlen>1) {
        value = SC.SelectionSet.create()
                  .addObject(old.get('firstObject')).freeze();
        len   = 1;
      } else {
        value = old;
        len = oldlen;
      }
    }
    
    // if we don't allow empty selection, block that also.  select first 
    // selectable item if necessary.
    if ((len===0) && !this.get('allowsEmptySelection')) {
      if (oldlen===0) {
        value = this.get('firstSelectableObject');
        if (value) value = SC.SelectionSet.create().addObject(value).freeze();
        else value = SC.SelectionSet.EMPTY;
        len = value.get('length');
        
      } else {
        value = old;
        len = oldlen;
      }
    }
    
    // if value is empty or is not enumerable, then use empty set
    if (len===0) value = SC.SelectionSet.EMPTY;
    
    // always use a frozen copy...
    value = value.frozenCopy();
    this._scsel_selection = value;
    
    return value;
    
  }.property('arrangedObjects', 'allowsEmptySelection', 
      'allowsMultipleSelection', 'allowsSelection').cacheable(),
  
  /**
    YES if the receiver currently has a non-zero selection.
    
    @property {Boolean}
  */
  hasSelection: function() {
    var sel = this.get('selection') ;
    return !!sel && (sel.get('length') > 0) ;
  }.property('selection').cacheable(),
  
  // ..........................................................
  // METHODS
  // 

  /**
    Selects the passed objects in your content.  If you set "extend" to YES,
    then this will attempt to extend your selection as well.
  
    @param {SC.Enumerable} objects objects to select
    @param {Boolean} extend optionally set to YES to extend selection
    @returns {Object} receiver
  */
  selectObjects: function(objects, extend) {

    // handle passing an empty array
    if (!objects || objects.get('length')===0) {
      if (!extend) this.set('selection', SC.SelectionSet.EMPTY);
      return this;
    }
    
    var sel = this.get('selection');
    if (extend && sel) sel = sel.copy();
    else sel = SC.SelectionSet.create();
    
    sel.addObjects(objects).freeze();
    this.set('selection', sel);
    return this ;
  },
  
  /**
    Selects a single passed object in your content.  If you set "extend" to 
    YES then this will attempt to extend your selection as well.
    
    @param {Object} object object to select
    @param {Boolean} extend optionally set to YES to extend selection
    @returns {Object} receiver
  */
  selectObject: function(object, extend) {
    if (object === null) {
      if (!extend) this.set('selection', null);
      return this ;
      
    } else return this.selectObjects([object], extend);
  },    

  /**
    Deselects the passed objects in your content.
    
    @param {SC.Enumerable} objects objects to select
    @returns {Object} receiver
  */
  deselectObjects: function(objects) {

    if (!objects || objects.get('length')===0) return this; // nothing to do
    
    var sel = this.get('selection');
    if (!sel || sel.get('length')===0) return this; // nothing to do

    // find index for each and remove it
    sel = sel.copy().removeObjects(objects).freeze();
    this.set('selection', sel.freeze());
    return this ;
  },
  
  /**
    Deselects the passed object in your content.
    
    @param {SC.Object} object single object to select
    @returns {Object} receiver
  */
  deselectObject: function(object) {
    if (!object) return this; // nothing to do
    else return this.deselectObjects([object]);
  },
  
  /**  @private
    Call this method whenever your source content changes to ensure the 
    selection always remains up-to-date and valid.
  */
  updateSelectionAfterContentChange: function() {
    
    var content = this.get('arrangedObjects'),
        sel     = this.get('selection'),
        ret     = sel,
        indexes, len, max;

    // first, make sure selection goes beyond current items...
    if (ret && content && ret.get('sources').indexOf(content)>=0) {
      indexes = ret.indexSetForSource(content);
      len     = content.get('length') ;
      max     = indexes ? indexes.get('max') : 0;
      
      // to clean this up, just copy the selection and remove the extra 
      // indexes
      if (max > len) {
        ret = ret.copy().remove(content, len, max-len).freeze();
        this.set('selection', ret);
      }
    }

    // if we didn't have to recompute the selection anyway, do a quick check
    // to make sure there are no constraints that need to be recomputed.
    if (ret === sel) {
      len = sel ? sel.get('length') : 0;
      max = content ? content.get('length') : 0;
      
      // need to recompute if the selection is empty and it shouldn't be but
      // only if we have some content; otherwise what's the point?
      if ((len===0) && !this.get('allowsEmptySelection') && max>0) {
        this.notifyPropertyChange('selection');
      }
    }

    return this ;
  }
    
};
