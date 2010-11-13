SC.RendererRenderDelegate = SC.Object.extend({
  render: function(view, context) {
    var rendererName = this.get('rendererName');
    var renderer = view.get('theme').renderer(rendererName);

    this._updateRendererProperties(view, renderer);
    renderer.render(context);
    
    view._scrrd_renderer = renderer;
  },
  
  update: function(view, elem) {
    var renderer = view._scrrd_renderer;
    
    this._updateRendererProperties(view, renderer);
    
    renderer.update(elem);
  },

  _updateRendererProperties: function(view, renderer) {
    var displayProperties = view.get('displayProperties'),
        attrHash = {};
    var idx, len = displayProperties.length, key;

    for (idx = 0; idx < len; idx++) {      
      key = displayProperties[idx];
      attrHash[key] = view.getDisplayProperty(key);
    }
    
    attrHash['themeName'] = view.themeName;

    renderer.attr(attrHash);
  }
});