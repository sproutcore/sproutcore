// ========================================================================
// SproutCore -- JavaScript Application Framework
// Copyright ©2006-2008, Sprout Systems, Inc. and contributors.
// Portions copyright ©2008 Apple Inc.  All rights reserved.
// ========================================================================

sc_require('views/designer');
sc_require('views/mixins/button');

SC.ButtonView.Designer = SC.ViewDesigner.extend( SC.Button.Designer,
/** @scope SC.ButtonView.Designer.prototype */ {
  
  encodeChildViews: NO,
  
  designProperties: 'theme buttonBehavior href'.w()
  
});