SC.RendererRenderDelegate = SC.Object.extend({
  render: function(dataSource, context) {
    var rendererName = this.get('rendererName');
    var renderer = dataSource.get('theme').renderer(rendererName);

    var view = dataSource.view;
    renderer.attr(view.getChangedDisplayProperties());
    renderer.render(context);

    dataSource.get('renderState')._scrrd_renderer = renderer;
  },

  update: function(dataSource, elem) {
    var view = dataSource.view;
    var renderer = dataSource.get('renderState')._scrrd_renderer;

    renderer.attr(view.getChangedDisplayProperties());
    renderer.update(elem);
  }
});