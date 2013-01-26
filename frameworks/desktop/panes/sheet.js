// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2011 Strobe Inc. and contributors.
//            Portions ©2008-2011 Apple Inc. All rights reserved.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================

sc_require('panes/panel');

/**
 @class

   Displays a modal sheet pane that animates from the top of the viewport.

 The default way to use the sheet pane is to simply add it to your page like this:

 SC.SheetPane.create({
        layout: { width: 400, height: 200, centerX: 0 },
        contentView: SC.View.extend({
        })
      }).append();

 This will cause your sheet panel to display.  The default layout for a Sheet
 is to cover the entire document window with a semi-opaque background, and to
 resize with the window.

 @extends SC.PanelPane
 @since SproutCore 1.0
 @author Evin Grano
 @author Tom Dale
 @author Joe Gaudet
 */
SC.SheetPane = SC.PanelPane.extend(
  /** @scope SC.SheetPane.prototype */
  {

    /**
     @type {Array}
     @default {['sc-sheet']}
     @see {SC.View#classNames}
     */
    classNames: ['sc-sheet'],

    /**
     @type SC.View
     @default SC.ModalPane
     */
    modalPane: SC.ModalPane,

    /**
     * Duration in seconds
     * @type {Number}
     */
    duration: 0.2,

    /**
     * Timing Function
     *
     * @type {String}
     */
    timing: 'ease-in-out',

    /**
     Displays the pane.  SheetPane will calculate the height of your pane, draw it offscreen, then
     animate it down so that it is attached to the top of the viewport.

     @returns {SC.SheetPane} receiver
     */
    append: function () {
      this.slideDown();
      return sc_super();
    },

    /**
     Animates the sheet up, then removes it from the DOM once it is hidden from view.

     @returns {SC.SheetPane} receiver
     */
    remove: function () {
      // We want the functionality of `SC.PanelPane.remove()`, but we only want it once the animation is complete.
      // Store the reference to the superclass function, and it call it after the transition is complete.
      var that = this, args = arguments;
      this.slideUp(function () {
        args.callee.base.apply(that, args);
      });
      return this;
    },

    /** @private
     Once the pane has been rendered out to the DOM, begin the animation.
     */
    paneDidAttach: function () {
      var ret = sc_super();
      this.invokeLast(this.slideDown, this);
      return ret;
    },

    /** @private */
    slideDown: function (callback) {
      var height = this._computeHeight();
      this.adjust('top', -height);
      this.animate('top', 0, {
        duration: this.get('duration'),
        timing: this.get('timing'),
        callback: callback
      });
    },

    /** @private */
    slideUp: function (callback) {
      var height = this._computeHeight();
      this.animate('top', -height, {
        duration: this.get('duration'),
        timing: this.get('timing'),
        callback: callback
      });
    },

    _computeHeight: function () {
      var layout = this.get('layout');
      if (!layout.height || !layout.top) {
        layout = SC.View.convertLayoutToAnchoredLayout(layout, this.computeParentDimensions());
      }
      return layout.height;
    }

  });

