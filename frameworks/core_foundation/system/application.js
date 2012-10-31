// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2011 Strobe Inc. and contributors.
//            Portions ©2008-2011 Apple Inc. All rights reserved.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================
sc_require('system/root_responder');


/** @class

  The root object for a SproutCore application. Usually you will create a
  single SC.Application instance as your root namespace. SC.Application is
  required if you intend to use SC.Responder to route events.

  ## Example

      Contacts = SC.Application.create({
        store: SC.Store.create(SC.Record.fixtures),

        // add other useful properties here
      });

  @extends SC.ResponderContext
  @since SproutCore 1.0
*/
SC.Application = SC.Responder.extend(SC.ResponderContext,
/** SC.Application.prototype */ {

  /**
    The current design mode of the application and its views.

    If the application has designModes specified, this property will be set
    automatically as the window width changes across the design mode boundaries.

    @property {String}
    @default null
  */
  designMode: null,

  /**
    A hash of the design modes for this application.

    While a design (the way views are positioned, shaped and styled) may be
    flexible enough to stretch up for a large display and to compress down
    for a medium sized display, at a certain point it often makes more sense
    to stop stretching or compressing and implement an additional design
    layout specific to the much different display size.  In order to
    make this possible and with as much ease as possible, SC.Application has
    support for design "modes".

    For example, you may want to have a "small" design mode for smartphones and
    a "large" design mode for everything else, but you could even go so far as
    to have "small-portrait", "small-landscape", "medium-portrait",
    "medium-landscape", "large-portrait" and more.  Obviously, the more designs
    you use, the more complex it is to test each mode, but no matter how many
    you implement, design modes can very easily be used to reposition, hide or
    show and modify the styles of your application's views as needed.

    To use design modes in your application, set the designModes property to a
    hash of mode names where the value of each represents the upper width
    limit at which the design mode of the pane should switch.  As the width of
    the window crosses the threshold value, the new design mode will be applied
    to each attached view.

    Then, if the view has an adjustment in its designAdjustments
    property that matches the current mode, the layout of the view will be
    adjusted accordingly.

    As well, a className for the current design mode will be applied to each
    view, which allows you to update the style of the views without manually
    adding bindings or observers.

    Note that the designMode property of each view will be updated, so
    you can make computed properties dependent on designMode in order to adjust
    other properties, such as isVisible.

    For example,

        MyApp = SC.Application.create({

          // This application will support three different design modes.
          designModes: {
            small: 480,       // 0 to 480
            medium: 768,      // 481 to 768
            large: Infinity   // 769 to Infinity
          }

        });

        var myPane = SC.PanelPane.create({

          // This pane will additionally get class names: 'small', 'medium' &
          // 'large' depending on the current design mode.  Therefore we can
          // have specific styles in CSS like .my-pane.small & .my-pane.large
          classNames: ['my-pane'],

          layout: { height: 200, width: 300 },

          contentView: SC.View.design({
            // This view will additionally get class names: 'small', 'medium' &
            // 'large' depending on the current design mode.
            classNames: ['my-view'],

            // This view will adjust its layout for small and medium modes.
            designAdjustments: {
              small: { height: 44, right: 10 },
              medium: { height: 50, width: 180 }
            },

            // The layout is common to design modes.
            layout: { left: 10, top: 10 },

            // This view will hide itself in large mode.
            isVisible: function() {
              return this.get('designMode') !== 'large';
            }.property('designMode').cacheable()

          })

        }).append();

    @property {Object|null}
    @default null
  */
  designModes: null,


  /** @private */
  init: function () {
    sc_super();

    // Watch designModes for changes.
    this.addObserver('designModes', this, '_designModesDidChange');

    // Initialize the value on the RootResponder when it is ready.
    SC.ready(this, '_designModesDidChange');
  }.property().cacheable(),


  /** @private */
  _designModesDidChange: function () {
    var binding = this._binding,
      designModes = this.get('designModes'),
      responder = SC.RootResponder.responder;

    // All we do is pass the value to the root responder for convenience.
    responder.set('designModes', designModes);

    if (designModes) {
      if (binding && !binding.isConnected) { binding.connect(); }
      else if (!binding) { this._binding = this.bind('designMode', responder, 'currentDesignMode'); }
    } else {
      if (binding) { binding.disconnect(); }
    }
  }

});
