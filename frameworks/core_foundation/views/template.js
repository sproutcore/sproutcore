sc_require("views/view");

SC.TEMPLATES = SC.Object.create();

SC.TemplateView = SC.CoreView.extend(
  /** @scope SC.TemplateView.prototype */ {

  templateName: null,

  templates: SC.TEMPLATES,

  template: function() {
    return this.get('templates').get(this.get('templateName'));
  }.property('templateName').cacheable(),

  render: function(context) {
    var originalView;

    try {
      originalView = SC.Handlebars.currentView;
      SC.Handlebars.currentView = this;

      this._didRenderChildViews = YES;
      var template = this.get('template');
      this._renderContext = context;
      template(this);
    } finally {
      SC.Handlebars.currentView = originalView;
    }

  }
});
