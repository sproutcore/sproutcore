// ========================================================================
// SproutCore -- JavaScript Application Framework
// Copyright ©2006-2008, Sprout Systems, Inc. and contributors.
// Portions copyright ©2008 Apple, Inc.  All rights reserved.
// ========================================================================

// alias event handlers onto touch events
SC.ButtonView.prototype.touchStart = SC.ButtonView.prototype.mouseDown;
SC.ButtonView.prototype.touchEnd = SC.ButtonView.prototype.mouseUp;
SC.ButtonView.prototype.touchMoved = SC.ButtonView.prototype.mouseMoved;
SC.ButtonView.prototype.touchEntered = SC.ButtonView.prototype.mouseEntered;
SC.ButtonView.prototype.touchExited = SC.ButtonView.prototype.mouseExited;
