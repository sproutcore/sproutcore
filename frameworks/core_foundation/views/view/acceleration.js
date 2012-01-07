// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2011 Strobe Inc. and contributors.
//            Portions ©2008-2011 Apple Inc. All rights reserved.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================

sc_require("views/view");
sc_require("views/view/layout_style");

SC.View.reopen({
  /**
    Setting wantsAcceleratedLayer to YES will use transforms to move the
    layer when available. On some platforms transforms are hardware accelerated.
  */
  wantsAcceleratedLayer: NO,

  /**
    Specifies whether transforms can be used to move the layer.
  */
  hasAcceleratedLayer: function(){
    if (this.get('wantsAcceleratedLayer') && SC.platform.supportsAcceleratedLayers) {
      var layout = this.get('layout'),
          animations = layout.animate,
          AUTO = SC.LAYOUT_AUTO,
          key;

      if (animations && (animations.top || animations.left)) {
        for (key in animations) {
          // If we're animating other transforms at different speeds, don't use acceleratedLayer
          if (
            SC.CSS_TRANSFORM_MAP[key] &&
            ((animations.top && animations.top.duration !== animations[key].duration) ||
             (animations.left && animations.left.duration !== animations[key].duration))
          ) {
            return NO;
          }
        }
      }

      // loose comparison used instead of (layout.X === null || layout.X === undefined)
      if (
        layout.left != null && !SC.isPercentage(layout.left) && layout.left !== AUTO &&
        layout.top != null && !SC.isPercentage(layout.top) && layout.top !== AUTO &&
        layout.width != null && !SC.isPercentage(layout.width) && layout.width !== AUTO &&
        layout.height != null && !SC.isPercentage(layout.height) && layout.height !== AUTO
      ) {
       return YES;
      }
    }
    return NO;
  }.property('wantsAcceleratedLayer').cacheable()
});
