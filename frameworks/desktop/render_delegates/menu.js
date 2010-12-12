// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2009 Sprout Systems, Inc. and contributors.
//            Portions ©2008-2009 Apple Inc. All rights reserved.
// License:   Licened under MIT license (see license.js)
// ==========================================================================
sc_require('render_delegates/panel');

// because render delegates are instances and therefore not, currently,
// subclassable, this is line-for-line the same render delegate as pickerRenderDelegate.
// this is obviously not optimal.
SC.BaseTheme.menuRenderDelegate = SC.Object.create({
  name: 'menu',
  
  render: function(dataSource, context) {
    var panelRenderDelegate = dataSource.get('theme').panelRenderDelegate;

    panelRenderDelegate.render(dataSource, context);

    var preferType = dataSource.get('preferType');
    var pointerPosition = dataSource.get('pointerPos');
    var pointerPositionY = dataSource.get('pointerPosY');

    if (preferType == SC.PICKER_POINTER || preferType == SC.PICKER_MENU_POINTER) {
      context.push('<div class="sc-pointer ' + pointerPosition + '" style="margin-top: ' + pointerPositionY + 'px"></div>');
      context.addClass(pointerPosition);
    }
  },
  
  update: function(dataSource, $) {
    var panelRenderDelegate = dataSource.get('theme').panelRenderDelegate;
    panelRenderDelegate.update(dataSource, $);
    
    var preferType = dataSource.get('preferType');
    var pointerPosition = dataSource.get('pointerPos');
    var pointerPositionY = dataSource.get('pointerPosY');

    if (preferType == SC.PICKER_POINTER || preferType == SC.PICKER_MENU_POINTER) {
      var el = $.find('.sc-pointer');
      el.attr('class', "sc-pointer "+pointerPosition);
      el.attr('style', "margin-top: "+pointerPositionY+"px");
      $.addClass(pointerPosition);
    }

  }
});
