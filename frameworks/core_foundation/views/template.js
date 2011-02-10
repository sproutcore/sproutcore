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
    var template = this.get('template');
    context.push( template(this) );
  }
});
