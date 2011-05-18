// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2011 Strobe Inc. and contributors.
//            Portions ©2008-2011 Apple Inc. All rights reserved.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================

SC.BaseTheme.touchScrollerRenderDelegate = SC.RenderDelegate.create({
  name: 'touch-scroller',

  render: function (dataSource, context) {
    var layoutDirection = dataSource.get('layoutDirection'),
        isVertical = layoutDirection === SC.LAYOUT_VERTICAL,
        isHorizontal = layoutDirection === SC.LAYOUT_HORIZONTAL;

    context.setClass({
      'sc-vertical': isVertical,
      'sc-horizontal': isHorizontal,
      disabled: !dataSource.get('isEnabled'),
      'controls-hidden': dataSource.get('controlsHidden')
    });

    context.push(
      '<div class="track"></div>',
      '<div class="cap"></div>',
      dataSource.get('hasButtons') ?
        '<div class="button-bottom"></div><div class="button-top"></div>' :
        '<div class="endcap"></div>',
      '<div class="thumb">',
        '<div class="thumb-top"></div>',
        '<div class="thumb-clip">',
          ('<div class="thumb-inner" style="-webkit-transform: ' +
             'translate%@(' + (dataSource.get('thumbLength') - 1044) + 'px);').
               fmt(isVertical ? 'Y' : 'X') + '>',
             '<div class="thumb-center"></div>',
             '<div class="thumb-bottom"></div>',
           '</div>',
         '</div>',
      '</div>');
  },

  update: function (dataSource, context) {
    var layoutDirection = dataSource.get('layoutDirection'),
        isVertical = layoutDirection === SC.LAYOUT_VERTICAL,
        isHorizontal = layoutDirection === SC.LAYOUT_HORIZONTAL,
        controlsAreHidden = dataSource.get('controlsHidden'),
        thumb, K = 'touchScrollerRenderDelegate';

    context.setClass({
      'sc-vertical': isVertical,
      'sc-horizontal': isHorizontal,
      disabled: !dataSource.get('isEnabled'),
      'controls-hidden': controlsAreHidden
    });

    if (!controlsAreHidden) {
      thumb = context.find('.thumb-inner');

      var max = dataSource.get("scrollerLength") - dataSource.get('capLength'),
          min = dataSource.get("minimum") + dataSource.get('capLength'),
          length = dataSource.get('thumbLength'),
          position = dataSource.get('thumbPosition');
    
      if (position + length > max) {
        position = Math.min(max - 20, position);
        length = max - position;
      }
    
      if (position < min) {
        length -= min - position;
        position = min;
      }

      if (dataSource.didChangeFor(K, 'thumbPosition')) {
        thumb.css('-webkit-transform',
                  'translate3d(' +
                    (layoutDirection === SC.LAYOUT_VERTICAL ?
                      '0px,' + position : position + 'px,0') + 'px,0px)');
      }

      if (dataSource.didChangeFor(K, 'thumbLength')) {
        var len = Math.round(dataSource.get('thumbLength') - 1044);
        thumb.css('-webkit-transform',
                  'translate3d(' +
                    (layoutDirection === SC.LAYOUT_VERTICAL ?
                      '0px,' + length : length + 'px,0') + 'px,0px)');
      }
    }
  }

});
