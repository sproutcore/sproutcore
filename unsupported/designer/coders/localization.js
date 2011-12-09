// ========================================================================
// SproutCore -- JavaScript Application Framework
// Copyright ©2006-2011, Strobe Inc. and contributors.
// Portions copyright ©2008 Apple Inc.  All rights reserved.
// ========================================================================

sc_require('coders/object');

/** @class

  A LocalizationCoder encodes specifically the localization for views.
  
  @extends SC.ObjectCoder
*/
SC.LocalizationCoder = SC.ObjectCoder.extend({
  extendMethodName: 'localization',
  encodeMethodName: 'encodeLoc'
});

