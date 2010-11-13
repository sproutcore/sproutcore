// ========================================================================
// SproutCore -- JavaScript Application Framework
// Copyright ©2006-2008, Sprout Systems, Inc. and contributors.
// Portions copyright ©2008 Apple Inc.  All rights reserved.
// ========================================================================

sc_require('panes/modal');

/** 
  Shadow views from top-left corner clockwise
*/

/** @class

  Most SproutCore applications need modal panels. The default way to use the 
  panel pane is to simply add it to your page like this:
  
  {{{
    SC.PanelPane.create({
      layout: { width: 400, height: 200, centerX: 0, centerY: 0 },
      contentView: SC.View.extend({
      })
    }).append();
  }}}
  
  This will cause your panel to display.  The default layout for a Panel 
  is to cover the entire document window with a semi-opaque background, and to 
  resize with the window.
  
  @extends SC.Pane
  @author Erich Ocean
  @since SproutCore 1.0
*/
SC.PanelPane = SC.Pane.extend({

  layout: { left:0, right:0, top:0, bottom:0 },
  classNames: ['sc-panel'],
  acceptsKeyPane: YES,
  
  /**
    Indicates that a pane is modal and should not allow clicks to pass
    though to panes underneath it.  This will usually cause the pane to show
    the modalPane underneath it.
    
    @property {Boolean}
  */
  isModal: YES,

  /**
    The modal pane to place behind this pane if this pane is modal.  This 
    must be a subclass or an instance of SC.ModalPane.
  */
  modalPane: SC.ModalPane.extend({
    classNames: 'for-sc-panel'
  }),
  
  // ..........................................................
  // CONTENT VIEW
  // 
  
  /**
    Set this to the view you want to act as the content within the panel.
    
    @property {SC.View}
  */
  contentView: null,
  contentViewBindingDefault: SC.Binding.single(),
  
  replaceContent: function(newContent) {
    this.removeAllChildren() ;
    if (newContent) this.appendChild(newContent) ;
  },

  /** @private */
  createChildViews: function() {
    // if contentView is defined, then create the content
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

  /**
    The name of the theme's SC.PanelPane render delegate.

    @property {String}
  */
  renderDelegateName: 'panelRenderDelegate',

  // get the modal pane. 
  _modalPane: function() {
    var pane = this.get('modalPane');
    
    // instantiate if needed
    if (pane && pane.isClass) {
      pane = pane.create({ owner: this });
      this.set('modalPane', pane); 
    }
    
    return pane ;
  },
  
  /** @private - whenever showing on screen, deal with modal pane as well */
  appendTo: function(elem) {
    var pane ;
    if (!this.get('isVisibleInWindow') && this.get('isModal') && (pane = this._modalPane())) {
      this._isShowingModal = YES;
      pane.paneWillAppend(this);
    }
    return sc_super();
  },
  
  /** @private - when removing from screen, deal with modal pane as well. */
  remove: function() {
    var pane, ret = sc_super();
    
    if (this._isShowingModal) {
      this._isShowingModal = NO ;
      if (pane = this._modalPane()) pane.paneDidRemove(this);
    }
    return ret ;
  },
  
  /** @private - if isModal state changes, update pane state if needed. */
  _isModalDidChange: function() {
    var pane, isModal = this.get('isModal');
    if (isModal) {
       if (!this._isShowingModal && this.get('isVisibleInWindow') && (pane = this._modalPane())) {
         this._isShowingModal = YES;
         pane.paneWillAppend(this);
       }
       
    } else {
      if (this._isShowingModal && (pane = this._modalPane())) {
        this._isShowingModal = NO ;
        pane.paneDidRemove(this); 
      }
    }
  }.observes('isModal'),
  
  /** @private - extends SC.Pane's method - make panel keyPane when shown */
  paneDidAttach: function() {
    var ret = sc_super();
    this.becomeKeyPane();
    return ret ;
  }
});
