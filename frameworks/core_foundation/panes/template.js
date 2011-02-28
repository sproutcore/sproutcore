/**
  SC.TemplatePane is a helper that will create a new pane based on
  a single root TemplateView.

  function main() {
    MyApp.mainPane = SC.TemplatePane.append({
      layerId: 'my-root-id',
      templateName: 'app'
    })
  }
*/
SC.TemplatePane = SC.Object.extend({});

SC.mixin(SC.TemplatePane, {
  append: function(attrs) {
    var pane = SC.MainPane.extend({
      childViews: ['contentView'],

      contentView: SC.TemplateView.design(attrs)
    });

    return pane.create().append();
  }
});
