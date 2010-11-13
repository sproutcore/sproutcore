// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2010 Sprout Systems, Inc. and contributors.
//            Portions ©2008-2010 Apple Inc. All rights reserved.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================

/** @class

  Implements a push-button-style button.  This class is used to implement 
  both standard push buttons and tab-style controls.  See also SC.CheckboxView
  and SC.RadioView which are implemented as field views, but can also be 
  treated as buttons.
  
  By default, a button uses the SC.Control mixin which will apply CSS 
  classnames when the state of the button changes:
    - active     when button is active
    - sel        when button is toggled to a selected state
  
  @extends SC.View
  @extends SC.Control
  @extends SC.Button
  @since SproutCore 1.0  
*/
SC.ImageButtonView = SC.ButtonView.extend(
/** @scope SC.ImageButtonView.prototype */ {
  
  /**
    Class names that will be applied to this view
    
    @property {Array}
  */
  classNames: ['sc-image-button-view'],

  renderDelegateName: 'imageButtonRenderDelegate',
  
  image: null
}) ;