require("src/theme");

SC.AceTheme.renderers.Button = SC.EmptyTheme.renderers.Button.extend({
  renderContents: function(context) {
    // render background slices
    context.push("<span class='button-left'></span>");
    context.push("<span class='button-right'></span>");
    context.push("<span class='button-middle'></span>");
  
    // render inner html
    this._titleRenderer.render(context);
  }
});

SC.AceTheme.renderers.button = SC.AceTheme.renderers.Button.create();