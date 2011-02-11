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

  },

  // in TemplateView, updating is handled by observers created by helpers in the
  // template. As a result, we create an empty update method so that the old
  // (pre-1.5) behavior which would force a full re-render does not get activated.
  update: function() { }
});
