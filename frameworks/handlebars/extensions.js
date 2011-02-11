require("handlebars");

SC.Handlebars = {};

SC.Handlebars.JavaScriptCompiler = function() {};
SC.Handlebars.JavaScriptCompiler.prototype = SC.beget(Handlebars.JavaScriptCompiler.prototype);

SC.Handlebars.JavaScriptCompiler.prototype.nameLookup = function(parent, name, type) {
  return "SC.get(" + parent + ", " + this.quotedString(name) + ");";
};

SC.Handlebars.JavaScriptCompiler.prototype.initializeBuffer = function() {
  return "context._renderContext";
};

SC.Handlebars.JavaScriptCompiler.prototype.appendToBuffer = function(string) {
  return "buffer.push(" + string + ");";
};

SC.Handlebars.compile = function(string) {
  var ast = Handlebars.parse(string);
  var environment = new Handlebars.Compiler().compile(ast);
  return new SC.Handlebars.JavaScriptCompiler().compile(environment);
};

Handlebars.registerHelper('view', function(path) {
  var view = SC.objectForPropertyPath(path);

  var childViews = this.get('childViews');
  var childView = this.createChildView(view);
  childViews.pushObject(childView);

  var context = this._renderContext.begin(childView.get('tagName'));

  // Setting the render context on the view is a hack, and we will
  // resolve this in Handlebars. One possible avenue is to make it
  // possible to pass a custom buffer to Handlebars.
  this._renderContext = context;

  // tomdale wants to make SproutCore slow
  childView.renderToContext(context, YES);

  context.end();
});

Handlebars.registerHelper('bindProperty', function(property) {
  var spanId = "handlebars-bound-" + jQuery.uuid++;
  var result = this.get(property);

  var currentView = SC.Handlebars.currentView;
  var self = this;

  this.addObserver(property, function() {
    currentView.$("#" + spanId).html(Handlebars.Utils.escapeExpression(self.get(property)));
  });

  return new Handlebars.SafeString("<span id='" + spanId + "'>" +
                                   Handlebars.Utils.escapeExpression(result) +
                                   "</span>");
});
