// ========================================================================
// SproutCore -- JavaScript Application Framework
// Copyright ©2006-2008, Sprout Systems, Inc. and contributors.
// Portions copyright ©2008 Apple Inc.  All rights reserved.
// ========================================================================

/** @class

  A modal pane is used to capture mouse events inside a pane that is modal.
  You normally will not work with modal panes directly, though you may set 
  the modalPane property to a subclass of this pane when designing custom 
  panes.
  
  A modal pane is automatically appended when a pane with isModal set to
  YES is made visible and removed when the same pane is hidden.  The only 
  purpose of the ModalPane is to absorb mouse events so that they cannot 
  filter through to the underlying content. 
  
  @extends SC.Pane
  @since SproutCore 1.0
*/
SC.ModalPane = SC.Pane.extend({
  
  classNames: 'sc-modal',
  
  /** @private cover the entire screen */
  layout: { top: 0, left: 0, bottom: 0, right: 0 },

  _openPaneCount: 0,
  
  /** 
    Called by a pane just before it appends itself.   The modal pane can
    make itself visible first if needed.

    @param {SC.Pane} pane the pane
    @returns {SC.ModalPane} receiver
  */
  paneWillAppend: function(pane) {
    this._openPaneCount++;
    if (!this.get('isVisibleInWindow')) this.append();
    return this ;    
  },
  
  /**
    Called by a pane just after it removes itself.  The modal pane can remove
    itself if needed.   Modal panes only remove themselves when an equal 
    number of paneWillAppend() and paneDidRemove() calls are received.
  
    @param {SC.Pane} pane the pane
    @returns {SC.ModalPane} receiver
  */
  paneDidRemove: function(pane) { 
    this._openPaneCount--;
    if (this._openPaneCount <= 0) {
      this._openPaneCount = 0 ;
      if (this.get('isVisibleInWindow')) this.remove();
    }
  },
  
  /** 
    If owner pane implements modalPaneDidClick(), call it on mouse down.
  */
  mouseDown: function(evt) {
    var owner = this.get('owner');
    if (owner && owner.modalPaneDidClick) owner.modalPaneDidClick(evt);
  }
  
});
