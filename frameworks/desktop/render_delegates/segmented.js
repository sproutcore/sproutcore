// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2009 Sprout Systems, Inc. and contributors.
//            Portions ©2008-2009 Apple Inc. All rights reserved.
// License:   Licened under MIT license (see license.js)
// ==========================================================================

SC.BaseTheme.segmentedRenderDelegate = SC.RendererRenderDelegate.create({
  rendererName: 'segmented',
  
  render: function(dataSource, context) {    
    var view = dataSource.view;
    var rendererName = this.get('rendererName');
    var renderer = view.get('theme').renderer(rendererName);

    renderer.attr(view.getChangedDisplayProperties());
    this.updateRenderer(view, renderer);

    renderer.render(context);

    view._scrrd_renderer = renderer;
  },
  
  update: function(dataSource, $) {
    var view = dataSource.view;
    var renderer = view._scrrd_renderer;

    renderer.attr(view.getChangedDisplayProperties());
    this.updateRenderer(view, renderer);

    renderer.update($);
  },

  updateRenderer: function(view, r) {
    var items = view.get('displayItems'), value = view.get('value'), isArray = SC.isArray(value),
        activeIndex = view.get("activeIndex"), item;
    for (var idx = 0, len = items.length; idx < len; idx++) {
      item = items[idx];
      
      item.classNames = {
        active: activeIndex === idx,
        sel: isArray ? value.indexOf(item.value) > -1 : value === item.value
      };
    }

    // set the attributes
    var size = view.get('controlSize');
    r.attr({
      segments: items,
      align: view.get('align'),
      layoutDirection: view.get('layoutDirection'),
      size: size === SC.AUTO_CONTROL_SIZE ? view.get('frame') : size,
      themeName: view._themeClassName
    });
  },

  indexForClientPosition: function(view, cq, x, y) {
    var renderer = view._scrrd_renderer;
    
    return renderer.indexForClientPosition(cq, x, y);
  }
});