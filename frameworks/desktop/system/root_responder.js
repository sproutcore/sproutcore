// ========================================================================
// SproutCore -- JavaScript Application Framework
// Copyright ©2006-2008, Sprout Systems, Inc. and contributors.
// Portions copyright ©2008 Apple Inc.  All rights reserved.
// ========================================================================

/** Set to NO to leave the backspace key under the control of the browser.*/
SC.CAPTURE_BACKSPACE_KEY = NO ;

/**
  Order layer for regular Panels.  Panels appear in front of the main view, 
  but behind palettes, popups.
*/
SC.PANEL_ORDER_LAYER = 0x1000 ;

/** 
  Order layer for Palettes.  Palettes appear in front of the main view and 
  panels, but behind popups.
*/
SC.PALETTE_ORDER_LAYER = 0x2000 ;

/**
  Order layer for Popups.  Popups appear in fron of hte main view and panels.
*/
SC.POPUP_ORDER_LAYER = 0x3000 ;

/*
  This is the root responder subclass for desktop-style applications.  It 
  supports mouse events and window resize events in addition to the built
  in keyboard handling provided by the base class.
*/
SC.RootResponder = SC.RootResponder.extend(
/** @scope SC.RootResponder.prototype */ {

  platform: 'desktop',

  // ..........................................................
  // ORDERED PANES
  // 
  
  /** @property
    The current front view.  This view should have the highest z-index of all 
    the other views.
  */
  focusedPane: function() {
    var views = this.get('orderedPanes');
    return views[views.length-1];
  }.property('orderedPanes'),
  
  
  /** @property
    Array of panes currently displayed that can be reordered.  This property 
    changes when you orderBack() or orderOut() a pane to determine the next 
    frontmost pane.
  */
  orderedPanes: null,

  /**
    Inserts the passed panes into the orderedPanes array before the named pane 
    array.  Pass null to order at the front.  If this changes the frontmost 
    view, then focus will also be shifted.  The pane you request must have the 
    same orderLayer property at the pane you are passing in.  If it does not, 
    the pane will be placed nearest to the target as possible.
    
    @param {SC.Pane} pane
    @param {SC.Pane} beforePane
    @returns {SC.RootResponder} receiver
  */
  orderBefore: function(pane, beforePane) {
    var currentFocus = this.get('focusedPane'),
        panes = this.get('orderedPanes').without(pane),
        len, idx, currentOrder, newFocus ;

    // adjust the beforePane to match orderLayer
    var orderLayer = pane.get('orderLayer');
    if (beforePane) {
      len = panes.length;
      idx = panes.indexOf(beforePane);
      currentOrder = beforePane.get('orderLayer');
      
      if (currentOrder<orderLayer) {
        while((beforePane.get('orderLayer')<orderLayer) && (++idx<len)) beforePane = panes[idx];
        if (idx>=len) beforePane = null ; // insert at end if needed 
      } else if (currentOrder>orderLayer) {
        while((beforePane.get('orderLayer')>orderLayer) && (--idx>=0)) beforePane = panes[idx];
        beforePane = (idx<0) ? panes[0] : panes[idx+1]; // go to next pane
      }
    
    // otherwise, find the highest pane matching the order...
    } else {
      idx = panes.length ;
      while((--idx >= 0) && !beforePane) {
        beforePane = panes[idx] ;
        if (beforePane.get('orderLayer') > orderLayer) beforePane = null; // try next one
      }
      if (idx<0) { // did not find a match, insert at beginning
        beforePane = panes[0];
      } else beforePane = panes[idx+1]; // go to next pane
    }
    
    // adjust array
    if (beforePane) {
      idx = panes.indexOf(beforePane);
      panes.insertAt(idx, pane);
    } else panes.push(pane);
    this.set('orderedPanes', panes); // update

    newFocus = this.get('focusedPane'); 
    if (newFocus !== currentFocus) {
      if (currentFocus) currentFocus.blurTo(newFocus);
      if (newFocus) newFocus.focusFrom(currentFocus);
    }
    
    return this ;
  },

  /**
    Removes the named pane from the orderedPanes array.  If the pane was also 
    focused, it will also blur the pane and focus the next view.  If the view 
    is key, it will also determine the next view to make key by going down the 
    list of ordered panes, finally ending with the mainPane.
    
    @param {SC.Pane} pane
    @param {SC.Pane} beforePane
    @returns {SC.RootResponder} receiver
  */
  orderOut: function(pane) {
    var currentFocus = this.get('focusedPane'), currentKey = this.get('keyPane');
    
    var panes = this.get('orderedPanes').without(pane) ;
    this.set('orderedPanes', panes) ;
    
    // focus only changes if we are removing the current focus view.
    // in this case, blur the old view and focus the new.  Also, if the view was
    // key, try to make the new focus view key or make main key.
    if (currentFocus === pane) {
      var newFocus = this.get('focusedPane') ;
      if (currentFocus) currentFocus.blurTo(newFocus) ;
      if (newFocus) newFocus.focusFrom(currentFocus) ;
      if (currentKey === pane) this.makeKeyPane(newFocus); 
      
    // if the front is not changing, just check for key view.  Go back to main...
    } else if (currentKey === pane) {
      this.makeKeyPane(null);
    }
    
    return this ;
  },
  
  init: function() {
    sc_super();
    this.orderedPanes = []; // create new array  
  },
  
  // .......................................................
  // EVENT HANDLING
  //
  
  setup: function() {
    // handle basic events        
    this.listenFor('keydown keyup mousedown mouseup click dblclick mouseout mouseover mousemove selectstart'.w(), document)
        .listenFor('resize focus blur'.w(), window);

    // handle special case for keypress- you can't use normal listener to block the backspace key on Mozilla
    if (this.keypress) {
      if (SC.CAPTURE_BACKSPACE_KEY && SC.browser.mozilla) {
        var responder = this ;
        document.onkeypress = function(e) { 
          e = SC.Event.normalizeEvent(e);
          return responder.keypress.call(responder, e); 
        };
        
        SC.Event.add(window, 'unload', this, function() { document.onkeypress = null; }); // be sure to cleanup memory leaks
  
      // Otherwise, just add a normal event handler. 
      } else SC.Event.add(document, 'keypress', this, this.keypress);
    }

    // handle these two events specially in IE
    'drag selectstart'.w().forEach(function(keyName) {
      var method = this[keyName] ;
      if (method) {
        if (SC.browser.msie) {
          var responder = this ;
          document.body['on' + keyName] = function(e) { 
            // return method.call(responder, SC.Event.normalizeEvent(e)); 
            return method.call(responder, SC.Event.normalizeEvent(event || window.event)); // this is IE :(
          };

          // be sure to cleanup memory leaks
           SC.Event.add(window, 'unload', this, function() { 
            document.body['on' + keyName] = null; 
          });
          
        } else {
          SC.Event.add(document, keyName, this, method);
        }
      }
    }, this);
    
    // handle mousewheel specifically for FireFox
    var mousewheel = SC.browser.mozilla ? 'DOMMouseScroll' : 'mousewheel';
    SC.Event.add(document, mousewheel, this, this.mousewheel);
    
    // do some initial set
    this.set('currentWindowSize', this.computeWindowSize()) ;
    this.focus(); // assume the window is focused when you load.
  },

  /**
    Invoked on a keyDown event that is not handled by any actual value.  This 
    will get the key equivalent string and then walk down the keyPane, then 
    the focusedPane, then the mainPane, looking for someone to handle it.  
    Note that this will walk DOWN the view hierarchy, not up it like most.
    
    @returns {Object} Object that handled evet or null
  */ 
  attemptKeyEquivalent: function(evt) {
    var ret = null ;

    // keystring is a method name representing the keys pressed (i.e 
    // 'alt_shift_escape')
    var keystring = evt.commandCodes()[0];
    
    // couldn't build a keystring for this key event, nothing to do
    if (!keystring) return NO;
    
    var keyPane  = this.get('keyPane'), mainPane = this.get('mainPane'), 
        mainMenu = this.get('mainMenu');

    // try the keyPane
    if (keyPane) ret = keyPane.performKeyEquivalent(keystring, evt) ;
    
    // if not, then try the main pane
    if (!ret && mainPane && (mainPane!==keyPane)) {
      ret = mainPane.performKeyEquivalent(keystring, evt);
    }

    // if not, then try the main menu
    if (!ret && mainMenu) {
      ret = mainMenu.performKeyEquivalent(keystring, evt);
    }
    
    return ret ;
  },

  /** @property The last known window size. */
  currentWindowSize: null,
  
  /** Computes the window size from the DOM. */  
  computeWindowSize: function() {
    var size ;
    if (window.innerHeight) {
      size = { 
        width: window.innerWidth, 
        height: window.innerHeight 
      } ;

    } else if (document.documentElement && document.documentElement.clientHeight) {
      size = { 
        width: document.documentElement.clientWidth, 
        height: document.documentElement.clientHeight 
      } ;

    } else if (document.body) {
      size = { 
        width: document.body.clientWidth, 
        height: document.body.clientHeight 
      } ;
    }
    return size;
  },
  
  /** 
    On window resize, notifies panes of the change. 
    
    @returns {Boolean}
  */
  resize: function() {
    this._resize();
    //this.invokeLater(this._resize, 10);
    return YES; //always allow normal processing to continue.
  },
  
  _resize: function() {
    // calculate new window size...
    var newSize = this.computeWindowSize(), oldSize = this.get('currentWindowSize');
    this.set('currentWindowSize', newSize); // update size
    
    if (!SC.rectsEqual(newSize, oldSize)) {
      // notify panes
      if (this.panes) {
        SC.RunLoop.begin() ;
        this.panes.invoke('windowSizeDidChange', oldSize, newSize) ;
        SC.RunLoop.end() ;
      }
    }
  },
  
  /** 
    Indicates whether or not the window currently has focus.  If you need
    to do something based on whether or not the window is in focus, you can
    setup a binding or observer to this property.  Note that the SproutCore
    automatically adds an sc-focus or sc-blur CSS class to the body tag as
    appropriate.  If you only care about changing the appearance of your 
    controls, you should use those classes in your CSS rules instead.
  */
  hasFocus: NO,
  
  /**
    Handle window focus.  Change hasFocus and add sc-focus CSS class 
    (removing sc-blur).  Also notify panes.
  */  
  focus: function() {
    if (!this.get('hasFocus')) {
      SC.$('body').addClass('sc-focus').removeClass('sc-blur');
      
      SC.RunLoop.begin();
      this.set('hasFocus', YES);
      SC.RunLoop.end();
    }
    return YES ; // allow default
  },
  
  /**
    Handle window focus.  Change hasFocus and add sc-focus CSS class (removing 
    sc-blur).  Also notify panes.
  */  
  blur: function() {
    if (this.get('hasFocus')) {
      SC.$('body').addClass('sc-blur').removeClass('sc-focus');
      
      SC.RunLoop.begin();
      this.set('hasFocus', NO);
      SC.RunLoop.end();
    }
    return YES ; // allow default
  },
  
  dragDidStart: function(drag) {
    this._mouseDownView = drag ;
    this._drag = drag ;
  },
  
  // .......................................................
  // KEYBOARD HANDLING
  // 
  
  _lastModifiers: null,
  
  /** @private
    Modifier key changes are notified with a keydown event in most browsers.  
    We turn this into a flagsChanged keyboard event.  Normally this does not
    stop the normal browser behavior.
  */  
  _handleModifierChanges: function(evt) {
    // if the modifier keys have changed, then notify the first responder.
    var m;
    m = this._lastModifiers = (this._lastModifiers || { alt: false, ctrl: false, shift: false });
    
    var changed = false;
    if (evt.altKey !== m.alt) { m.alt = evt.altKey; changed=true; }
    if (evt.ctrlKey !== m.ctrl) { m.ctrl = evt.ctrlKey; changed=true; }
    if (evt.shiftKey !== m.shift) { m.shift = evt.shiftKey; changed=true;}
    evt.modifiers = m; // save on event
    
    return (changed) ? (this.sendEvent('flagsChanged', evt) ? evt.hasCustomEventHandling : YES) : YES ;
  },
  
  /** @private
    Determines if the keyDown event is a nonprintable or function key. These
    kinds of events are processed as keyboard shortcuts.  If no shortcut
    handles the event, then it will be sent as a regular keyDown event.
  */
  _isFunctionOrNonPrintableKey: function(evt) {
    return !!(evt.altKey || evt.ctrlKey || evt.metaKey || ((evt.charCode !== evt.which) && SC.FUNCTION_KEYS[evt.which]));
  },
  
  /** @private 
    Determines if the event simply reflects a modifier key change.  These 
    events may generate a flagsChanged event, but are otherwise ignored.
  */
  _isModifierKey: function(evt) {
    return !!SC.MODIFIER_KEYS[evt.charCode];
  },
  
  /** @private
    The keydown event occurs whenever the physically depressed key changes.
    This event is used to deliver the flagsChanged event and to with function
    keys and keyboard shortcuts.
    
    All actions that might cause an actual insertion of text are handled in
    the keypress event.
  */
  keydown: function(evt) {
    // This code is to check for the simulated keypressed event
    if(!evt.kindOf) this._ffevt=null;
    else evt=this._ffevt;
    if (SC.none(evt)) return YES;    
    // Firefox does NOT handle delete here...
    if (SC.browser.mozilla && (evt.which === 8)) return true ;
    
    // modifier keys are handled separately by the 'flagsChanged' event
    // send event for modifier key changes, but only stop processing if this 
    // is only a modifier change
    var ret = this._handleModifierChanges(evt),
        target = evt.target || evt.srcElement,
        forceBlock = (evt.which === 8) && !SC.allowsBackspaceToPreviousPage && (target === document.body);
    
    if (this._isModifierKey(evt)) return (forceBlock ? NO : ret);
    
    // if this is a function or non-printable key, try to use this as a key
    // equivalent.  Otherwise, send as a keyDown event so that the focused
    // responder can do something useful with the event.
    ret = YES ;
    if (this._isFunctionOrNonPrintableKey(evt)) {
      // Simulate keydown events for firefox since keypress only triggers once
      // We don't do it in keypress as it doesn't work in certain cases, ie.
      // Caret is at last position and you press down arrow key.
      if (SC.browser.mozilla && evt.keyCode>=37 && evt.keyCode<=40){
        this._ffevt=evt;
        SC.RunLoop.begin();
        this.invokeLater(this.keydown, 100);
        SC.RunLoop.end();
      }
      // otherwise, send as keyDown event.  If no one was interested in this
      // keyDown event (probably the case), just let the browser do its own
      // processing.
      ret = this.sendEvent('keyDown', evt) ;
      
      // attempt key equivalent if key not handled
      if (!ret) {
        ret = !this.attemptKeyEquivalent(evt) ;
      } else {
        ret = evt.hasCustomEventHandling ;
        if (ret) forceBlock = NO ; // code asked explicitly to let delete go
      }
    }

    return forceBlock ? NO : ret ; 
  },
  
  /** @private
    The keypress event occurs after the user has typed something useful that
    the browser would like to insert.  Unlike keydown, the input codes here 
    have been processed to reflect that actual text you might want to insert.
    
    Normally ignore any function or non-printable key events.  Otherwise, just
    trigger a keyDown.
  */
  keypress: function(evt) {
    var ret ;
    
    // delete is handled in keydown() for most browsers
    if (SC.browser.mozilla && (evt.which === 8)) {
      ret = this.sendEvent('keyDown', evt);
      return ret ? (SC.allowsBackspaceToPreviousPage || evt.hasCustomEventHandling) : YES ;

    // normal processing.  send keyDown for printable keys...
    } else {
      if (evt.charCode !== undefined && evt.charCode === 0) return YES;
      return this.sendEvent('keyDown', evt) ? evt.hasCustomEventHandling:YES;
    }
  },
  
  keyup: function(evt) {
    // to end the simulation of keypress in firefox set the _ffevt to null
    if(this._ffevt) this._ffevt=null;
    // modifier keys are handled separately by the 'flagsChanged' event
    // send event for modifier key changes, but only stop processing if this is only a modifier change
    var ret = this._handleModifierChanges(evt);
    if (this._isModifierKey(evt)) return ret;
    return this.sendEvent('keyUp', evt) ? evt.hasCustomEventHandling:YES;
  },
  
  mousedown: function(evt) {
    try {
      // make sure the window gets focus no matter what.  FF is inconsistant 
      // about this.
      this.focus();
      if(SC.browser.msie) {
        this._lastMouseDownX = evt.clientX;
        this._lastMouseDownY = evt.clientY;
      }
      // first, save the click count.  Click count resets if your down is
      // more than 125msec after you last click up.
      this._clickCount += 1 ;
      if (!this._lastMouseUpAt || ((Date.now()-this._lastMouseUpAt) > 200)) {
        this._clickCount = 1 ; 
      }
      evt.clickCount = this._clickCount ;
      
      var fr, view = this.targetViewForEvent(evt) ;
      // InlineTextField needs to loose firstResponder whenever you click outside
      // the view. This is a special case as textfields are not supposed to loose 
      // focus unless you click on a list, another textfield or an special
      // view/control.
      if(view) fr=view.get('pane').get('firstResponder');
      
      if(fr && fr.kindOf(SC.InlineTextFieldView) && fr!==view){
        fr.resignFirstResponder();
      }
      
      view = this._mouseDownView = this.sendEvent('mouseDown', evt, view) ;
      if (view && view.respondsTo('mouseDragged')) this._mouseCanDrag = YES ;
    } catch (e) {
    
      console.warn('Exception during mousedown: %@'.fmt(e)) ;
      this._mouseDownView = null ;
      this._mouseCanDrag = NO ;
      throw e;
    }
    
    return view ? evt.hasCustomEventHandling : YES;
  },
  
  /**
    mouseUp only gets delivered to the view that handled the mouseDown evt.
    we also handle click and double click notifications through here to 
    ensure consistant delivery.  Note that if mouseDownView is not
    implemented, then no mouseUp event will be sent, but a click will be 
    sent.
  */
  mouseup: function(evt) {

    try {
      if (this._drag) {
        this._drag.tryToPerform('mouseUp', evt) ;
        this._drag = null ;
      }
      
      var handler = null, view = this._mouseDownView ;
      this._lastMouseUpAt = Date.now() ;
      
      // record click count.
      evt.clickCount = this._clickCount ;
      
      // attempt the mouseup call only if there's a target.
      // don't want a mouseup going to anyone unless they handled the mousedown...
      if (view) {
        handler = this.sendEvent('mouseUp', evt, view) ;
        
        // try doubleClick
        if (!handler && (this._clickCount === 2)) {
          handler = this.sendEvent('doubleClick', evt, view) ;
        }
        
        // try single click
        if (!handler) {
          handler = this.sendEvent('click', evt, view) ;
        }
      }
      
      // try whoever's under the mouse if we haven't handle the mouse up yet
      if (!handler) {
        view = this.targetViewForEvent(evt) ;
      
        // try doubleClick
        if (this._clickCount === 2) {
          handler = this.sendEvent('doubleClick', evt, view);
        }
      
        // try singleClick
        if (!handler) {
          handler = this.sendEvent('click', evt, view) ;
        }
      }
      
      // cleanup
      this._mouseCanDrag = NO; this._mouseDownView = null ;
    } catch (e) {
      this._drag = null; this._mouseCanDrag = NO; this._mouseDownView = null ;
      throw e;
    }
    return (handler) ? evt.hasCustomEventHandling : YES ;
  },
  
  dblclick: function(evt){
    if (SC.browser.isIE) {
      this._clickCount = 2;
      // this._onmouseup(evt);
      this.mouseup(evt);
    }
  },
  
  mousewheel: function(evt) {
    try {
      var view = this.targetViewForEvent(evt) ,
          handler = this.sendEvent('mouseWheel', evt, view) ;
    } catch (e) {
      throw e;
    }
    return (handler) ? evt.hasCustomEventHandling : YES ;
  },
  
  _lastHovered: null,
  
  /**
   This will send mouseEntered, mouseExited, mousedDragged and mouseMoved 
   to the views you hover over.  To receive these events, you must implement 
   the method. If any subviews implement them and return true, then you won't 
   receive any notices.
   
   If there is a target mouseDown view, then mouse moved events will also
   trigger calls to mouseDragged.
  */
  mousemove: function(evt) {
    if(SC.browser.msie){
      if(this._lastMoveX === evt.clientX && this._lastMoveY === evt.clientY) return;
      else {
        this._lastMoveX = evt.clientX;
        this._lastMoveY = evt.clientY;
      }
    }
    
    SC.RunLoop.begin();
    try {
      // make sure the view gets focus no matter what.  FF is inconsistant 
      // about this.
      this.focus();
      // only do mouse[Moved|Entered|Exited|Dragged] if not in a drag session
      // drags send their own events, e.g. drag[Moved|Entered|Exited]
      if (this._drag) {
        //IE triggers mousemove at the same time as mousedown
        if(SC.browser.msie){
          if (this._lastMouseDownX !== evt.clientX && this._lastMouseDownY !== evt.clientY) {
            this._drag.tryToPerform('mouseDragged', evt);
          }
        }
        else {
          this._drag.tryToPerform('mouseDragged', evt);
        }
      } else {
        var lh = this._lastHovered || [] , nh = [] , exited, loc, len, 
            view = this.targetViewForEvent(evt) ;
        
        // work up the view chain.  Notify of mouse entered and
        // mouseMoved if implemented.
        while(view && (view !== this)) {
          if (lh.indexOf(view) !== -1) {
            view.tryToPerform('mouseMoved', evt);
            nh.push(view) ;
          } else {
            view.tryToPerform('mouseEntered', evt);
            nh.push(view) ;
          }
          
          view = view.get('nextResponder');
        }
        // now find those views last hovered over that were no longer found 
        // in this chain and notify of mouseExited.
        for(loc=0, len=lh.length; loc < len; loc++) {
          view = lh[loc] ;
          exited = view.respondsTo('mouseExited') ;
          if (exited && !(nh.indexOf(view) !== -1)) {
            view.tryToPerform('mouseExited',evt);
          }
        }
        this._lastHovered = nh; 
        
        // also, if a mouseDownView exists, call the mouseDragged action, if 
        // it exists.
        if (this._mouseDownView) {
          if(SC.browser.msie){
            if (this._lastMouseDownX !== evt.clientX && this._lastMouseDownY !== evt.clientY) {
              this._mouseDownView.tryToPerform('mouseDragged', evt);
            }
          }
          else {
            this._mouseDownView.tryToPerform('mouseDragged', evt);
          }
        }
      }
    } catch (e) {
      throw e;
    }
    SC.RunLoop.end();
  },

  // these methods are used to prevent unnecessary text-selection in IE,
  // there could be some more work to improve this behavior and make it
  // a bit more useful; right now it's just to prevent bugs when dragging
  // and dropping.
  
  _mouseCanDrag: YES,
  
  selectstart: function(evt) { 
    var result = this.sendEvent('selectStart', evt, this.targetViewForEvent(evt));
    return (result !==null ? YES: NO) && (this._mouseCanDrag ? NO : YES);
  },
  
  drag: function() { return false; }
  
});
