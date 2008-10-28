// ========================================================================
// SproutCore
// copyright 2006-2008 Sprout Systems, Inc.
// ========================================================================

require('panes/pane') ;
require('views/container') ;

// Panes are views that appear over the top of your regular content such as
// dialogs boxes and pop-up menus.  This class provides the basic support for
// these functions.
//
// SproutCore provides built-in support for four different types of panes, but
// you can also create your own types of panes yourself.  The pane view
// automatically groups all panes of a similar type together. 
//
// To create your own type of pane, create a subclass of SC.PaneView and then
// register it with the SC.PaneManager:
//
// SC.PaneManager.registerPane('paneType', SC.PaneView);
//
// You can then make views show in the panes by settings the paneType 
// property on the view and set 'isVisible' to true.
//
// Note that PaneView instances are reused by the pane manager.  You should
// design your view be reused in this way.
//
SC.OverlayPaneView = SC.PaneView.extend({

  // This property will be set to the content view when you are asked to
  // display it.
  content: null,
  
  // Set this to a value that indicates where you want your view to appear
  // compare to other types of panes in the system.  the PaneManagers groups
  // all panes of the same type together, with the most recently opened one
  // appearing on top.
  layer: 0,
  
  // This property will be set to the view that triggered your pane to show
  // if relevant.  You can use this to properly size and position your pane.
  anchorView: null,
  
  // This property will be set to the event that triggered your pane to show
  // if relevant.  You can use this to properly size and position your pane.
  triggerEvent: null,
  
  // if true, this pane will be modal.  Clicks outside of the containerView
  // will be ignored.  If false, this pane is semi-modal: it will
  // hide if you click outside of the containerView.
  isModal: true,
  
  // override to position your pane on view.
  positionPane: function() {
  },
  
  // This method will do its best to position your pane on screen in relation
  // to the anchor view passed.
  fitPositionToScreen: function(preferredPosition, paneView, anchor) {
    
    // first build up the frame and convert to window...
    var f = paneView.get('frame') ;
    f.x = preferredPosition.x ; f.y = preferredPosition.y ;
    f = paneView.convertFrameToView(f, null) ;

    // get useful other frame limits.
    var aframe = anchor.convertFrameToView(anchor.get('frame'), null) ;
    var wframe = SC.window.get('frame') ;

    // make sure the right edge fits on the screen.  If not, anchor to 
    // right edge of anchor or right edge of window, whichever is closer.
    if (SC.maxX(f) > wframe.width) {
      var mx = Math.max(SC.maxX(aframe), f.width) ;
      f.x = Math.min(mx, wframe.width) - f.width ;
    }

    // if the left edge is off of the screen, try to position at left edge
    // of anchor.  If that pushes right edge off screen, shift back until 
    // right is on screen or left = 0
    if (SC.minX(f) < 0) {
      f.x = SC.minX(Math.max(aframe,0)) ;
      if (SC.maxX(f) > wframe.width) {
        f.x = Math.max(0, wframe.width - f.width);
      }
    }

    // make sure bottom edge fits on screen.  If not, try to anchor to top
    // of anchor or bottom edge of screen.
    if (SC.maxY(f) > wframe.height) {
      var mx = Math.max((aframe.y - f.height), 0) ;
      if (mx > wframe.height) {
        f.y = Math.max(0, wframe.height - f.height) ;
      } else f.y = mx ;
    }

    // if Top edge is off screen, try to anchor to bottom of anchor. If that
    // pushes off bottom edge, shift up until it is back on screen or top =0
    if (SC.minY(f) < 0) {
      var mx = Math.min(SC.maxY(aframe), (wframe.height - aframe.height)) ;
      f.y = Math.max(mx, 0) ;
    }

    return f ;
    
  },
  
  resizeWithOldParentSize: function(oldSize) {
    this.positionPane() ;  
  },
  
  // ...........................................
  // KEYBOARD SUPPORT
  //
  acceptsFirstResponder: true,

  keyDown: function(evt) {
    if (!this.interpretKeyEvents(evt)) {
      return sc_super();
    }
  },
  
  // when you hit return from within a dialog or panel, look for a child 
  // view with isDefault => true
  insertNewline: function(sender, evt) {
    var button = this._findViewWithKeyIn('isDefault', SC.ButtonView, this) ;
    if (button) {
      button.triggerAction(evt) ;
      return true ;
    } else return false ;
  },
  
  cancel: function(sender, evt) {
    var button = this._findViewWithKeyIn('isCancel', SC.ButtonView, this) ;    
    if (button) {
      button.triggerAction(evt) ;
      return true ;
    } else return false ;
  },
  
  _findViewWithKeyIn: function(keyName, rootClass, rootView, ignoreRoot) {
    if (!ignoreRoot) {
      if ((rootView instanceof rootClass) && rootView.get(keyName)) {
        return rootView ;
      }
    }
    
    var child = rootView.get('firstChild') ;
    while(child) {
      var ret = this._findViewWithKeyIn(keyName, rootClass, child) ;
      if (ret) return ret ;
      child = child.get('nextSibling') ;
    }
    return null ;
  },
  
  focusFirstKeyView: function() {
    var fr = this._findViewWithKeyIn('acceptsFirstResponder', SC.Responder, this, true) ;
    if (!fr) fr = this;
    fr.becomeFirstResponder() ;
  },

  click: function(evt) {
    if (!this.get('isModal')) {
      var content = this.containerView.get('content') ;
      if (content) content.set('isVisible', false) ;
    }
    return true ; 
  },
    
  // ...........................................
  // PRIVATE METHODS
  //
  _contentDidChange: function() {
    var containerView = this.get('containerView') ;
    if (containerView) containerView.set('content',this.get('content')) ;
  }.observes('content'),
  
  outlets: ['containerView'],
  containerView: SC.ContainerView.extend({
    outlets: ['rootView'],

    rootView: SC.View.extend({
      // absorb all clicks so the pane will not hide.
      click: function() { return true; }
    }).outletFor('.pane-root?'),
    
    _fixWidth: function() {
      var content = this.get('content') ;
      if (content) {
        content.resizeWithOldParentSize(this.get('size')) ;
        
        // compute space we need to add for border/padding
        var padding = 0;
        this.getEach('styleBorderLeftWidth', 'styleBorderRightWidth', 'stylePaddingLeft', 'stylePaddingRight').each(function(x) { padding += x || 0; });
        this.recacheFrames() ;
        content.recacheFrames() ;
        
        this.set('size', { width: (content.get('size').width + padding) });
        this.owner.positionPane() ;
        this.owner.setStyle({ visibility: 'visible' }) ;
      } 
      if (this.get('isVisibleInWindow')) 
      {
        this.owner.focusFirstKeyView();
      }
    }.observes('content'),
    
    init: function() {
      sc_super() ;
      
      // only Safari does well enough with animations to handle this dainty
      // guy. 
      if (SC.isSafari()) {
        this.visibleAnimation = {
          visible: 'opacity: 1.0', hidden: 'opacity: 0.0', duration: 100  
        } ;
      }
    },

    // allow click through outside of the rootView.
    click: function(evt) {
      return false ;
    }
    
  }).outletFor('.pane-wrapper?'),
  
  // just before the view becomes visible, set the width of the container
  // view to match its content
  show: function() {
    this.containerView._fixWidth();
    sc_super();
    //this.focusFirstKeyView() ;
  }

});
