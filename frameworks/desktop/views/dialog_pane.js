// ========================================================================
// SproutCore -- JavaScript Application Framework
// Copyright ©2006-2008, Sprout Systems, Inc. and contributors.
// Portions copyright ©2008 Apple, Inc.  All rights reserved.
// ========================================================================

/** @class

  Most SproutCore applications need modal dialogs. The default way to use the 
  dialog pane is to simply add it to your page like this:
  
  {{{
    SC.DialogPane.create({
      dialogView: SC.View.extend({
        layout: { width: 400, height: 200, centerX: 0, centerY: 0 }
      })
    }).append();
  }}}
  
  This will cause your dialog to display.  The default layout for a DialogPane 
  is to cover the entire document window with a semi-opaque background, and to 
  resize with the window.
  
  @extends SC.Pane
  @author Erich Ocean
  @since SproutCore 1.0
*/
SC.DialogPane = SC.Pane.extend({

  layout: { left:0, right:0, top:0, bottom:0 },
  classNames: ['sc-dialog-pane'],
  acceptsKeyPane: YES,

  // ..........................................................
  // CONTENT VIEW
  // 
  
  /**
    Set this to the view you want to act as the dialog within the dialog pane.
    
    @property {SC.View}
  */
  contentView: null,
  contentViewBindingDefault: SC.Binding.single(),

  /**
    Replaces any child views with the passed new content.  
    
    This method is automatically called whenever your dialogView property 
    changes.  You can override it if you want to provide some behavior other
    than the default.
    
    @param {SC.View} newContent the new dialog view or null.
    @returns {void}
  */
  replaceContent: function(newContent) {
    this.removeAllChildren() ;
    if (newContent) this.appendChild(newContent) ;
  },

  /** @private */
  createChildViews: function() {
    // if dialogView is defined, then create the content
    var view = this.contentView ;
    if (view) {
      view = this.contentView = this.createChildView(view) ;
      this.childViews = [view] ;
    }
  },

  
  /**
    Invoked whenever the content property changes.  This method will simply
    call replaceContent.  Override replaceContent to change how the view is
    swapped out.
  */
  contentViewDidChange: function() {
    this.replaceContent(this.get('contentView'));
  }.observes('contentView'),

  // ..........................................................
  // INTERNAL SUPPORT
  //
   
  /** @private - extends SC.Pane's method - make dialog keyPane when shown */
  paneDidAttach: function() {
    var ret = sc_super();
    this.get('rootResponder').makeKeyPane(this);
    return ret ;
  },

  /** @private - suppress all mouse events on dialog itself. */
  mouseDown: function(evt) { return YES; }
  
});