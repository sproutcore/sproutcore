// ========================================================================
// SproutCore -- JavaScript Application Framework
// Copyright ©2006-2008, Sprout Systems, Inc. and contributors.
// Portions copyright ©2008 Apple Inc.  All rights reserved.
// ========================================================================

// Key Bindings are used to map a keyboard input to an action message on a
// responder.  These bindings are most useful when implementing sophisticated
// keyboard input mechanisms.  For keyboard shortcuts, instead use menus, etc.

SC.MODIFIED_KEY_BINDINGS = {
  'ctrl_.': 'cancel',
  'shift_tab': 'insertBacktab',
  'shift_left': 'moveLeftAndModifySelection',
  'shift_right': 'moveRightAndModifySelection',
  'shift_up': 'moveUpAndModifySelection',
  'shift_down': 'moveDownAndModifySelection',
  'alt_left': 'moveLeftAndModifySelection',
  'alt_right': 'moveRightAndModifySelection',
  'alt_up': 'moveUpAndModifySelection',
  'alt_down': 'moveDownAndModifySelection',
  'ctrl_a': 'selectAll'
} ;

SC.BASE_KEY_BINDINGS = {
  'escape': 'cancel',
  'backspace': 'deleteBackward',
  'delete': 'deleteForward',
  'return': 'insertNewline',
  'tab': 'insertTab',
  'left': 'moveLeft',
  'right': 'moveRight',
  'up': 'moveUp',
  'down': 'moveDown',
  'home': 'moveToBeginningOfDocument',
  'end': 'moveToEndOfDocument',
  'pagedown': 'pageDown',
  'pageup': 'pageUp'
} ;

