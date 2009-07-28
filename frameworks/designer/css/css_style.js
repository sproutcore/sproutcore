// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2009 Sprout Systems, Inc. and contributors.
//            Portions ©2008-2009 Apple Inc. All rights reserved.
// License:   Licened under MIT license (see license.js)
// ==========================================================================

/**
  @class SC.CSSStyle

  A css style object represents a css style that is part of a single css rule 
  in a single css style sheet.
  
  @extends SC.Object
*/
SC.CSSStyle = SC.Object.extend(
/** @scope SC.CSSStyle.prototype */ {
  
  /**
    @property {String} a css string representing the style property
  */
  style: '',
  
  /**
    @property {SC.CSSRule} the rule this style is part of
  */
  rule: null
  
});
