// ========================================================================
// SproutCore
// copyright 2006-2008 Sprout Systems, Inc.
// ========================================================================

require('views/view');

/** 
  If the view has a designer, give it an opportunity to handle an event 
  before passing it on to the main view.
*/
SC.View.prototype.tryToPerform = function(methodName, arg1, arg2) {
  if (this.designer) {
    return this.designer.tryToPerform(methodName, arg1, arg2);
  } else {
    return SC.Object.prototype.tryToPerform.apply(this, arguments);
  }
} ;
