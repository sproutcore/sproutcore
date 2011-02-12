sc_require("views/view");

SC.TEMPLATES = SC.Object.create();

SC.TemplateView = SC.CoreView.extend(
  /** @scope SC.TemplateView.prototype */ {

  templateName: null,

  templates: SC.TEMPLATES,

  template: function() {
    return this.get('templates').get(this.get('templateName'));
  }.property('templateName').cacheable(),

  /**
    When the view is asked to render, we look for the appropriate
    template and invoke it with this view as the context, as well
    as a hash that contains a reference to the view.

    @param {SC.RenderContext} context the render context
  */
  render: function(context) {
    var template = this.get('template');

    this._didRenderChildViews = YES;

    context.push(template(this, null, null, { view: this, isRenderData: true }));
  },

  // in TemplateView, updating is handled by observers created by helpers in the
  // template. As a result, we create an empty update method so that the old
  // (pre-1.5) behavior which would force a full re-render does not get activated.
  update: function() { }
});
