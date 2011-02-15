sc_require("views/view");

// Global hash of shared templates. This will automatically be populated
// by the build tools so that you can store your Handlebars templates in
// separate files that get loaded into JavaScript at buildtime.
SC.TEMPLATES = SC.Object.create();

/** @class

  SC.TemplateView allows you to create a view that uses the Handlebars templating
  engine to generate its HTML representation.

  @extends SC.CoreView
  @since SproutCore 1.5
*/
SC.TemplateView = SC.CoreView.extend(
/** @scope SC.TemplateView.prototype */ {

  // This makes it easier to build custom views on top of TemplateView without
  // gotchas, but may have tab navigation reprecussions. The tab navigation
  // system should be revisited.
  acceptsFirstResponder: YES,

  templateName: null,

  templates: SC.TEMPLATES,

  template: function() {
    var templateName = this.get('templateName');
    var template = this.get('templates').get(templateName);

    if (!template) {
      //@if(debug)
      if (templateName) {
        SC.Logger.warn('%@ - Unable to find template "%@".'.fmt(this, templateName));
      }
      //@endif

      return function() { return ''; };
    }

    return template;
  }.property('templateName').cacheable(),

  context: function() {
    return this;
  }.property().cacheable(),

  /**
    When the view is asked to render, we look for the appropriate
    template and invoke it with this view as the context, as well
    as a hash that contains a reference to the view.

    @param {SC.RenderContext} context the render context
  */
  render: function(context) {
    var template = this.get('template');

    this._didRenderChildViews = YES;

    context.push(template(this.get('context'), null, null, { view: this, isRenderData: true }));
  },

  // in TemplateView, updating is handled by observers created by helpers in the
  // template. As a result, we create an empty update method so that the old
  // (pre-1.5) behavior which would force a full re-render does not get activated.
  update: function() { }
});
