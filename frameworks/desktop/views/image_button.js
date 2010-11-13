// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2010 Sprout Systems, Inc. and contributors.
//            Portions ©2008-2010 Apple Inc. All rights reserved.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================

/** @class

  Provides a button that displays an image instead of the standard button
  user interface.

  It behaves the same as an SC.ButtonView, but has an image property that
  should be set to a unique class name.

  For example:

  SC.ImageButtonView.create({
    action: 'imageButtonWasClicked',

    image: 'image-button-icon'
  });

  You could then add some CSS rule for a normal state:

    .sc-image-button-view .image-button-icon {
      background: sc_static('image-button-image');
    }

  And an active state:

    .sc-image-button-view.active .image-button-icon {
      background: sc_static('image-button-image-active');
    }

  @extends SC.View
  @extends SC.Control
  @extends SC.ButtonView
  @since SproutCore 1.5
*/
SC.ImageButtonView = SC.ButtonView.extend(
/** @scope SC.ImageButtonView.prototype */ {

  /**
    Class names that will be applied to this view

    @property {Array}
  */
  classNames: ['sc-image-button-view'],


  /**
    The name of the theme's SC.ImageButtonView render delegate.

    @property {String}
  */
  renderDelegateName: 'imageButtonRenderDelegate',

  /**
    A class name that will be applied to the img tag of the button.

    @property {String}
  */
  image: null
}) ;