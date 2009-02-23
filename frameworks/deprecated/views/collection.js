// ==========================================================================
// SproutCore -- JavaScript Application Framework
// copyright 2006-2008, Sprout Systems, Inc. and contributors.
// ==========================================================================

SC.mixin( SC.CollectionView.prototype, {
  
  // ======================================================================
  // DEPRECATED APIS (Still available for compatibility)
  
  /** @private 
    If set to false, this method will prevent you from deselecting all of
    the items in your view.  This is better implemented using a controller
    that prohibits empty selection.
  */
  allowDeselectAll: YES,
  
  /** @private */
  itemExistsInCollection: function(view) { return this.hasItemView(view); },
  
  /** @private */
  viewForContentRecord: function(rec) { return this.itemViewForContent(rec); }
  
});