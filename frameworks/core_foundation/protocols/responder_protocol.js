// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2011 Strobe Inc. and contributors.
//            Portions ©2008-2011 Apple Inc. All rights reserved.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================

/** @namespace
  The `SC.ResponderProtocol` protocol defines the properties and methods that you may implement
  in your `SC.Responder` (i.e. `SC.View`) subclasses in order to handle specific responder chain
  events.

  *Note: Do not mix `SC.ResponderProtocol` into your classes. As a protocol, it exists only for
  reference sake. You only need define any of the properties or methods listed below in order to use
  this protocol.*

  @since SproutCore 1.0
*/
SC.ResponderProtocol = {

  // .......................................................................
  // Mouse Event Handlers
  //

  /**
    Called when the mouse is pressed. You must return `YES` to receive
    mouseDragged and mouseUp in the future.

    @param evt {SC.Event} the mousedown event
    @returns {Boolean} YES to receive additional mouse events, NO otherwise
  */
  mouseDown: function(evt) {},

  /**
    Called when the mouse is released.

    @param evt {SC.Event} the mouseup event
    @returns {Boolean} YES to handle the mouseUp, NO to allow click() and doubleClick() to be called
  */
  mouseUp: function(evt) {},

  /**
    Called when the mouse is dragged, after responding `YES` to a previous `mouseDown`:
    call.

    @param evt {SC.Event} the mousemove event
    @returns {void}
  */
  mouseDragged: function(evt) {},

  /**
    Called when the mouse exits the view and the root responder is not in a
    drag session.

    @param evt {SC.Event} the mousemove event
    @returns {void}
  */
  mouseExited: function(evt) {},

  /**
    Called when the mouse enters the view and the root responder is not in a
    drag session.

    @param evt {SC.Event} the mousemove event
    @returns {void}
  */
  mouseEntered: function(evt) {},

  /**
    Called when the mouse moves within the view and the root responder is not in a
    drag session.

    @param evt {SC.Event} the mousemove event
    @returns {void}
  */
  mouseMoved: function(evt) {},

  /**
     Called when a contextmenu event is triggered. Used to disable contextmenu
     per view.

     @param evt {SC.Event} the contextmenu event
     @returns {void}
   */
  contextMenu: function(evt) {},

  /**
    Called when a selectstart event in IE is triggered. **ONLY IE**
    We use it to disable IE accelerators and text selection

    @param evt {SC.Event} the selectstart event
    @returns {void}
  */
  selectStart: function(evt) {},

  // .......................................................................
  // Touch Event Handlers
  //

  /**
    Called when a touch begins. Capturing a touch is a special case behavior that allows for the
    nesting of touch capable views. In some situations, an outer view may want to capture a touch
    *before* the inner view acts on it. For example, a container view may want to act on swipes or
    pinches, while the inner view may only respond to taps. If the normal event path was followed,
    the inner view would get the `touchStart` event and by accepting it, would inadvertently prevent
    the outer view from being able to act on it.

    For this reason, when a touch begins, each view from the top-down has a chance to capture a
    touch first, before it is passed to the bottom-most target view. For example, SC.ScrollView
    captures touches so that it can determine if the touch is the beginning of a swipe or pinch. If
    the touch does become one of these gestures, SC.ScrollView can act on it. However, if the touch
    doesn't become one of these gestures, SC.ScrollView understands that it needs to pass the touch
    to its children.

    Therefore, implementors of `captureTouch` are expected to release the touch if they won't use it
    by calling the touch's `captureTouch` method and passing themself as the new starting point
    (capturing will continue from the implementor onward as it would have if the implementor hadn't
    temporarily captured it).

    Note, `captureTouch` is only meaningful for container type views where their children may
    handle touches as well. For most controls that want to handle touch, there is no reason to
    capture a touch, because they don't have any children. For these views, simply use the
    `touchStart`, `touchesDragged`, `touchCancelled` and `touchEnd` methods.

    @param touch {SC.Touch} the touch
    @returns {Boolean} YES to claim the touch and receive touchStart, NO otherwise
    @see SC.Touch#captureTouch
  */
  captureTouch: function (touch) {},

  /**
    Called when a touch previously claimed by returning `true` from `touchStart` is cancelled.

    @param touch {SC.Touch} the touch
    @returns {void}
  */
  touchCancelled: function (touch) {},

  /**
    Called when an active touch moves. The touches array contains all of the touches that this view
    has claimed by returning `true` from `touchStart`.

    @param evt {SC.Event} the event
    @param touches {Array} the touches
    @returns {void}
  */
  touchesDragged: function (evt, touches) {},

  /**
    Called when a touch previously claimed by returning `true` from `touchStart` ends.

    @param touch {SC.Touch} the touch
    @returns {void}
  */
  touchEnd: function (touch) {},

  /**
    Called when a touch begins. You must return `YES` to receive `touchesDragged` and `touchEnd` in
    the future.

    @param touch {SC.Touch} the touch
    @returns {Boolean} YES to receive additional touch events, NO otherwise
  */
  touchStart: function (touch) {},

  // .......................................................................
  // Keyboard Event Handlers
  //
  // These methods are called by the input manager in response to keyboard
  // events.  Most of these methods are defined here for you, but not actually
  // implemented in code.

  /**
    Insert the text or act on the key.

    @param {String} the text to insert or respond to
    @returns {Boolean} YES if you handled the method; NO otherwise
  */
  insertText: function(text) {},

  /**
    When the user presses a key-combination event, this will be called so you
    can run the command.

    @param charCode {String} the character code
    @param evt {SC.Event} the keydown event
    @returns {Boolean} YES if you handled the method; NO otherwise
  */
  performKeyEquivalent: function(charCode, evt) { return false; },

  /**
    This method is called if no other view in the current view hierarchy is
    bound to the escape or command-. key equivalent.  You can use this to
    cancel whatever operation is running.

    @param sender {Object} the object that triggered; may be null
    @param evt {SC.Event} the event that triggered the method
    @returns {Boolean} YES if you handle the event; NO otherwise
  */
  cancel: function(sender, evt) {},

  /**
    Delete the current selection or delete one element backward from the
    current selection.

    @param sender {Object} the object that triggered the method; may be null
    @param evt {SC.Event} the event that triggered the method; may be null
    @returns {Boolean} YES if you handle the event; NO otherwise
  */
  deleteBackward: function(sender, evt) {},

  /**
    Delete the current selection or delete one element forward from the
    current selection.

    @param sender {Object} the object that triggered the method; may be null
    @param evt {SC.Event} the event that triggered the method; may be null
    @returns {Boolean} YES if you handle the event; NO otherwise
  */
  deleteForward: function(sender, evt) {},

  /**
    A field editor might respond by selecting the field before it.

    @param sender {Object} the object that triggered the method; may be null
    @param evt {SC.Event} the event that triggered the method; may be null
    @returns {Boolean} YES if you handle the event; NO otherwise
  */
  insertBacktab: function(sender, evt) {},

  /**
    Insert a newline character or end editing of the receiver.

    @param sender {Object} the object that triggered the method; may be null
    @param evt {SC.Event} the event that triggered the method; may be null
    @returns {Boolean} YES if you handle the event; NO otherwise
  */
  insertNewline: function(sender, evt) {},

  /**
    Insert a tab or move forward to the next field.

    @param sender {Object} the object that triggered the method; may be null
    @param evt {SC.Event} the event that triggered the method; may be null
    @returns {Boolean} YES if you handle the event; NO otherwise
  */
  insertTab: function(sender, evt) {},

  /**
    Move insertion point/selection backward one. (i.e. left arrow key)

    @param sender {Object} the object that triggered the method; may be null
    @param evt {SC.Event} the event that triggered the method; may be null
    @returns {Boolean} YES if you handle the event; NO otherwise
  */
  moveLeft: function(sender, evt) {},

  /**
    Move the insertion point/selection forward one (i.e. right arrow key)
    in left-to-right text, this could be the left arrow key.

    @param sender {Object} the object that triggered the method; may be null
    @param evt {SC.Event} the event that triggered the method; may be null
    @returns {Boolean} YES if you handle the event; NO otherwise
  */
  moveRight: function(sender, evt) {},

  /**
    Move the insertion point/selection up one (i.e. up arrow key)

    @param sender {Object} the object that triggered the method; may be null
    @param evt {SC.Event} the event that triggered the method; may be null
    @returns {Boolean} YES if you handle the event; NO otherwise
  */
  moveUp: function(sender, evt) {},

  /**
    Move the insertion point/selection down one (i.e. down arrow key)

    @param sender {Object} the object that triggered the method; may be null
    @param evt {SC.Event} the event that triggered the method; may be null
    @returns {Boolean} YES if you handle the event; NO otherwise
  */
  moveDown: function(sender, evt) {},

  /**
    Move left, extending the selection. - shift || alt

    @param sender {Object} the object that triggered the method; may be null
    @param evt {SC.Event} the event that triggered the method; may be null
    @returns {Boolean} YES if you handle the event; NO otherwise
  */
  moveLeftAndModifySelection: function(sender, evt) {},

  /**
    Move right, extending the seleciton - shift || alt

    @param sender {Object} the object that triggered the method; may be null
    @param evt {SC.Event} the event that triggered the method; may be null
    @returns {Boolean} YES if you handle the event; NO otherwise
  */
  moveRightAndModifySelection: function(sender, evt) {},

  /**
    Move up, extending the selection - shift || alt

    @param sender {Object} the object that triggered the method; may be null
    @param evt {SC.Event} the event that triggered the method; may be null
    @returns {Boolean} YES if you handle the event; NO otherwise
  */
  moveUpAndModifySelection: function(sender, evt) {},

  /**
    Move down, extending selection - shift || alt

    @param sender {Object} the object that triggered the method; may be null
    @param evt {SC.Event} the event that triggered the method; may be null
    @returns {Boolean} YES if you handle the event; NO otherwise
  */
  moveDownAndModifySelection: function(sender, evt) {},

  /**
    Move insertion point/selection to beginning of document.

    @param sender {Object} the object that triggered the method; may be null
    @param evt {SC.Event} the event that triggered the method; may be null
    @returns {Boolean} YES if you handle the event; NO otherwise
  */
  moveToBeginningOfDocument: function(sender, evt) {},

  /**
    Move insertion point/selection to end of document.

    @param sender {Object} the object that triggered the method; may be null
    @param evt {SC.Event} the event that triggered the method; may be null
    @returns {Boolean} YES if you handle the event; NO otherwise
  */
  moveToEndOfDocument: function(sender, evt) {},

  /**
    Page down

    @param sender {Object} the object that triggered the method; may be null
    @param evt {SC.Event} the event that triggered the method; may be null
    @returns {Boolean} YES if you handle the event; NO otherwise
  */
  pageDown: function(sender, evt) {},

  /**
    Page up

    @param sender {Object} the object that triggered the method; may be null
    @param evt {SC.Event} the event that triggered the method; may be null
    @returns {Boolean} YES if you handle the event; NO otherwise
  */
  pageUp: function(sender, evt) {},

  /**
    Select all

    @param sender {Object} the object that triggered the method; may be null
    @param evt {SC.Event} the event that triggered the method; may be null
    @returns {Boolean} YES if you handle the event; NO otherwise
  */
  selectAll: function(sender, evt) {}

};
