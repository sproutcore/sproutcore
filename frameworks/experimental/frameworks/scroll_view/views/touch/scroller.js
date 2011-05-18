// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2011 Strobe Inc. and contributors.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================
sc_require('views/scroller');

/**
  @class
  @extends SC.TouchScrollerView
*/
SC.TouchScrollerView = SC.ScrollerView.extend(
  /** @scope SC.TouchScrollerView.prototype */{

  /**
    @type Array
    @default ['sc-touch-scroller-view']
    @see SC.View#classNames
  */
  classNames: ['sc-touch-scroller-view'],

  /**
    @type Array
    @default ['capLength']
    @see SC.View#displayProperties
   */
  displayProperties: ['capLength'],
  
  /**
    @type Number
    @default 12
  */
  scrollbarThickness: 12,
  
  /**
    @type Number
    @default 5
  */
  capLength: 5,
  
  /**
    @type Number
    @default 0
  */
  capOverlap: 0,
  
  /**
    @type Boolean
    @default NO
  */
  hasButtons: NO,
  
  /**
    @type Number
    @default 36
  */
  buttonOverlap: 36,

  /**
    @type String
    @default 'touchScrollerRenderDelegate'
   */
  renderDelegateName: 'touchScrollerRenderDelegate'

});
