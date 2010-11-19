// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2009 Sprout Systems, Inc. and contributors.
//            Portions ©2008-2009 Apple Inc. All rights reserved.
// License:   Licened under MIT license (see license.js)
// ==========================================================================
sc_require('render_delegates/panel');

SC.BaseTheme.pickerRenderDelegate = SC.Object.create({

  render: function(dataSource, context) {
    var panelRenderDelegate = dataSource.getPath('theme').panelRenderDelegate;
    var displayProperties = dataSource.getChangedDisplayProperties();

    panelRenderDelegate.render(dataSource, context);

    var preferType = displayProperties.preferType;
    var pointerPosition = displayProperties.pointerPos;
    var pointerPositionY = displayProperties.pointerPosY;

    if (preferType == SC.PICKER_POINTER || preferType == SC.PICKER_MENU_POINTER) {
      context.push('<div class="sc-pointer ' + pointerPosition + '" style="margin-top: ' + pointerPositionY + 'px"></div>');
      context.addClass(pointerPosition);
    }
  },
  
  update: function(dataSource, $) {
    var panelRenderDelegate = dataSource.getPath('theme').panelRenderDelegate;
    panelRenderDelegate.update(dataSource, $);
    
    var displayProperties = dataSource.getChangedDisplayProperties();

    var preferType = displayProperties.preferType;
    var pointerPosition = displayProperties.pointerPos;
    var pointerPositionY = displayProperties.pointerPosY;

    if (preferType == SC.PICKER_POINTER || preferType == SC.PICKER_MENU_POINTER) {
      var el = $.find('.sc-pointer');
      el.attr('class', "sc-pointer "+pointerPosition);
      el.attr('style', "margin-top: "+pointerPositionY+"px");
      $.addClass(pointerPosition);
    }

  }
});
