require("src/theme");

SC.AceTheme.PointLeft = SC.AceTheme.subtheme("point-left", "point-left");
SC.AceTheme.PointRight = SC.AceTheme.subtheme("point-right", "point-right");

SC.AceTheme.renderers.Button = SC.EmptyTheme.renderers.Button.extend({
  renderContents: function(context) {
    // render background slices
    context.push("<span class='button-left'></span>");
    // render inner html
    context.push("<span class='button-middle'>");
    
    context = context.begin("label").addClass("sc-button-label");
    this._titleRenderer.render(context);
    context = context.end();
    
    context.push('</span>');
    context.push("<span class='button-right'></span>");
  }
});

SC.AceTheme.renderers.button = SC.AceTheme.renderers.Button.create();