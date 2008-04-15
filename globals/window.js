// ========================================================================
// SproutCore
// copyright 2006-2007 Sprout Systems, Inc.
// ========================================================================

require('Core') ;
require('foundation/responder');
require('panes/pane');

// The window global object is automatically setup for each window that you 
// load.  Window listens for mouse and keyboard events and routes them to the
// first responder.  Using the firstResponder method you can control who gets
// to respond to keyboard events.
SC.window = SC.PaneView.extend({
  
  // This finds the first view responding to the event.
  firstViewForEvent: function(evt) {
    var el = Event.element(evt) ;
    while(el && (el != document) && (!el._configured)) el = el.parentNode ;
    if (el) el = SC.View.findViewForElement(el) ;
    if (el == this) el = null ;
    return el ;
  },

  // ........................................................................
  // Window Size/Resizing
  //

  innerFrame: function() { 
    return this.frame(); 
  }.property('frame'),
  
  clippingFrame: function() { 
    return this.frame(); 
  }.property('frame'),

  scrollFrame: function() { 
    return this.frame(); 
  }.property('frame'),
  
  frame: function() {
    var size = this.get('size') ;
    return { x: 0, y: 0, width: size.width, height: size.height } ;
  }.property('size'),
  
  // this returns the size of the window, possibly reading it from the browser
  // if needed.
  size: function() {
    if (!this._size) {
      if (window.innerHeight) {
        this._size = { 
          width: window.innerWidth, 
          height: window.innerHeight
        };
      } else if (document.documentElement && document.documentElement.clientHeight) {
        this._size = { 
          width: document.documentElement.clientWidth, 
          height: document.documentElement.clientHeight
        };
      } else if (document.body) {
        this._size = { 
          width: document.body.clientWidth, 
          height: document.body.clientHeight
        };
      }
    }
    
    return this._size ;
  }.property(),
  
  autoresizesChildViews: true,
  
  _onresize: function(evt) {
    var oldSize = Object.clone(this.get('size')) ;
    this._size = null ;
    var newSize = this.get('size') ;
    if ((newSize.width != oldSize.width) || (newSize.height != oldSize.height)) {
      this.resizeChildrenWithOldSize(oldSize) ;
    }
  },
  
  // ........................................................................
  // Keyboard Handling
  //

  _lastModifiers: null,
  _handleModifierChanges: function(evt)
  {
    //console.debug('_lastModifiers: %o', this._lastModifiers);
    // if the modifier keys have changed, then notify the first responder.
    var m = this._lastModifiers = this._lastModifiers || { alt: false, ctrl: false, shift: false };

    var changed = false;
    if (evt.altKey != m.alt) { m.alt = evt.altKey; changed=true; }
    if (evt.ctrlKey != m.ctrl) { m.ctrl = evt.ctrlKey; changed=true; }
    if (evt.shiftKey != m.shift) { m.shift = evt.shiftKey; changed=true;}

    if (changed) 
    {
      evt._type = 'flagsChanged';
      evt._modifiers = m;
      SC.app.sendEvent( evt );
    }
  },
  
  // this one gets called once when the key is down.  We use this to handle
  // function and non-printable keys. (i.e. if a modifier key is pressed or
  // we can map to some non-printable set of keycodes.)
  _onkeydown: function(evt)
  {
    // modifier keys are handled separately by the 'flagsChanged' event
    this._handleModifierChanges(evt);
    if (this._isModifierKey(evt)) return;
    if (!this._isFunctionOrNonPrintableKey(evt)) return true;  // let normal browser processing do its thing.
    return this._sendEvent('keyDown', evt);
  },

  // this one gets used for all the other keys not handled by key down.
  _onkeypress: function(evt)
  {
    if (this._isFunctionOrNonPrintableKey(evt)) return; // handled in _onkeydown
    if (evt.charCode != undefined && evt.charCode == 0) return;
    return this._sendEvent('keyDown', evt);
  },
  
  _onkeyup: function(evt)
  {
    // modifier keys are handled separately by the 'flagsChanged' event
    this._handleModifierChanges(evt);
    if (this._isModifierKey(evt)) return;
    return this._sendEvent('keyUp', evt);
  },

  _sendEvent: function( sctype, evt )
  {
    evt._type = sctype;
    evt._stopWhenHandled = (evt._stopWhenHandled !== undefined) ? evt._stopWhenHandled : true;
    
    var handler = SC.app.sendEvent( evt );
    
    if (handler && evt._stopWhenHandled) {
      Event.stop(evt);
      return false;
    } else {
      return true;
    }
  },

  // util code factored out of keypress and keydown handlers
  _isFunctionOrNonPrintableKey: function( evt )
  {
    return !!(evt.altKey || evt.ctrlKey || SC.FUNCTION_KEYS[evt.keyCode]);
  },
  _isModifierKey: function( evt )
  {
    return !!SC.MODIFIER_KEYS[evt.keyCode];
  },
  

  
  // ........................................................................
  // Mouse Handling
  //
  // Mouse clicks are routed to the target view.
  //
  _mouseDownView: null,
  _clickCount: 0,
  _lastMouseUpAt: null,
  
  dragDidStart: function(drag) {
    this._mouseDownView = drag ;  
  },
  
  _onmousedown: function(evt)
  {
    // make sure the view gets focus no matter what.  FF is inconsistant 
    // about this.
    this._onfocus(); 
    
    // first, save the click count.  Click count resets if your down is
    // more than 125msec after you last click up.
    this._clickCount = this._clickCount + 1 ;
    if (!this._lastMouseUpAt || ((Date.now() - this._lastMouseUpAt) > 200)) {
      this._clickCount = 1 ; 
    }
    evt.clickCount = this._clickCount ;
    
    evt._type = 'mouseDown';
    evt._stopWhenHandled = (evt._stopWhenHandled !== undefined) ? evt._stopWhenHandled : true;

    this._mouseDownView = SC.app.sendEvent( evt );
    if (this._mouseDownView && evt._stopWhenHandled)
    {
      Event.stop(evt);
    }

    // find the view to handle the mouseDown.  go up the chain till you find
    // one that implements didMouseDown or mouseDown && returns true.
/*    var view = this.firstViewForEvent(evt) ;
    var handled = false ;
    while(view && (view != this) && !handled) {
      var func = view.mouseDown || view.didMouseDown;
      if (func) handled = func.call(view, evt) ;
      
      if (!handled) view = view.get('nextResponder');
    }
    if (view == this) view = null;
    this._mouseDownView = view ;
    
    if (handled) Event.stop(evt) ;
*/
  },
  
  // mouseUp only gets delivered to the view that handled the mouseDown evt.
  // we also handle click and double click notifications through here to 
  // ensure consistant delivery.  Note that if mouseDownView is not
  // implemented, then no mouseUp event will be sent, but a click will be 
  // send.
  _onmouseup: function(evt)
  {
    var handler = null;

    this._lastMouseUpAt = Date.now();

    // record click count.
    evt.clickCount = this._clickCount ;
    
    // attempt the mouseup call only if there's a target.
    // don't want a mouseup going to anyone unless they handled the mousedown...
    if (this._mouseDownView)
    {
      evt._type = 'mouseUp';
      handler = SC.app.sendEvent(evt, this._mouseDownView);
    }
    // no one handled the mouseup... try doubleclick...
    if (!handler && (this._clickCount == 2))
    {
      evt._type = 'doubleClick';
      handler = SC.app.sendEvent(evt, this._mouseDownView);
    }
    // no one handled the doubleclick... try click...
    if (!handler)
    {
      evt._type = 'click';
      handler = SC.app.sendEvent(evt, this._mouseDownView);
    }
    
    this._mouseDownView = null;
  },
  
  _lastHovered: null,

  // this will sent mouseOver, mouseOut, and mouseMoved to the views you
  // hover over.  To receive these events, you must implement the method.
  // If any subviews implement them and return true, then you won't receive
  // any notices.
  //
  // if there is a target mouseDown view, then mouse moved events will also
  // trigger calls to mouseDragged.
  //
  _onmousemove: function(evt) {

    // make sure the view gets focus no matter what.  FF is inconsistant 
    // about this.
    this._onfocus(); 

    var lh = this._lastHovered || [] ;
    var nh = [] ;
    var view = this.firstViewForEvent(evt) ;
    
    // work up the view chain.  Notify of mouse entered and
    // mouseMoved if implemented.
    while(view && (view != this)) {
      var entered = view.mouseOver || view.didMouseOver || view.mouseEntered;
      var moved = view.mouseMoved || view.mouseDidMove  ;

      if (lh.include(view)) {
        if (moved) moved.call(view,evt) ;
        nh.push(view) ;
      } else {
        if (entered) entered.call(view,evt) ;
        nh.push(view) ;
      }
      
      view = view.get('nextResponder');
    }

    // now find those views last hovered over that were no longer found 
    // in this chain and notify of mouseExited.
    for(var loc=0; loc < lh.length; loc++) {
      view = lh[loc] ;
      var exited = view.mouseOut || view.didMouseOut || view.mouseExited ;
      if (exited && !nh.include(view)) exited.call(view, evt) ;
    }
    
    this._lastHovered = nh; 
    
    // also, if a mouseDownView exists, call the mouseDragged action, if it 
    // exists.
    if (this._mouseDownView && this._mouseDownView.mouseDragged) {
      this._mouseDownView.mouseDragged(evt) ;
    }
  },
  
  // remove event observers.
  _onunload: function() {
    this._listenerCache.each(function(e){
      Event.stopObserving.apply(Event, e) ;
    });
  },
  
  _onfocus: function() {
    if (!this._hasFocus) {
      this._hasFocus = YES ;
      this.addClassName('focus') ;
      this.removeClassName('blur') ;
    }
  },
  
  _onblur: function() {
    if (this._hasFocus) {
      this._hasFocus = NO ;
      this.removeClassName('focus') ;
      this.addClassName('blur');
    }
  },
  
  _hasFocus: NO,
  
  _EVTS: ['mousedown', 'mouseup', 'click', 'dblclick', 'keydown', 'keyup', 'keypress', 'mouseover', 'mouseout', 'mousemove', 'resize', 'unload', 'focus', 'blur'],

  _listenerCache: [],
  
  setup: function() {

    // setup event listeners for window.
    var win = this ;
    win._EVTS.each(function(e) {
      var func = win['_on' + e] ;
      var target = (SC.isIE() && (e != 'resize')) ? document : window ;
      if (func) {
        var f = func.bindAsEventListener(win) ;
        Event.observe(target, e, f) ;
        win._listenerCache.push([target, e, f]) ;
      }
    });
    
    this.get('size') ; // fetch the size from the window and save it.
    this.set('isVisibleInWindow', true) ;
    this._onfocus() ;
  }
}).viewFor($tag('body')) ;


// events:
// window.onfocus --
//  notify all views that they now have window focus.

// window.onblur --
//  notify all views that they no longer have window focus.

// element.onfocus/element.onblur --
//  when a field gains focus, it should become first responder.  Other
//  elements should become first responder when you click on them.

// window.onresize --
//  call the resize code on the views to tell them their parent views resized.
//  -- we should have a root view that is the window.

// window.onscroll --
//  call the scroll code on the root view.

// element.onscroll --
//  call the scroll code on the element.

// window.onunload --
//  call this on all views? to let them unload....

// document.onclick --
// document.ondblclick --
// these events are ignored (actually, they are eaten) by the window object.
// click and double click events are handled by the mouseUp handler so that
// we can avoid calling click if mouseUp is handled by someone.

// document.onmousedown --
// document.onmouseup --
//  find the target element and work your way up the DOM hierarchy until you
//  find Views to handle the click.

// document.onmousemove --
// document.onmouseover --
// document.onmouseout --
//  use these events to simulate mouseover and mouseout on views.  Find the 
//  target element and work you way up the hierarchy until you find a view
//  that responds to these events.
//
//  also we should have some generic handlers in the window object that you
//  can use to be notified when the mouse enters and leaves the window in
//  general.

// formelement.onchange
//   use to trigger a value change on the form field element.

// form.onreset 
//   um, do nothing?  button will handle action directly.

// form.onsubmit
//   disable so that AJAX code can takeover.

// document.onkeydown --
// document.onkeypress --
// document.onkeyup --
//  notify the firstResponder and work up the chain until someone handles the
//  keypress.  You can have a defaultResponder, which gets the keypress if 
//  no one else does.  First normalize key info.

// img.onerror --
//  this should call some handler function in the ImageView.



