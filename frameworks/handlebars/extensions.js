require("handlebars");

SC.Handlebars = {};

SC.Handlebars.JavaScriptCompiler = function() {};
SC.Handlebars.JavaScriptCompiler.prototype = SC.beget(Handlebars.JavaScriptCompiler.prototype);
SC.Handlebars.JavaScriptCompiler.prototype.compiler = SC.Handlebars.JavaScriptCompiler;

SC.Handlebars.JavaScriptCompiler.prototype.nameLookup = function(parent, name, type) {
  return "SC.get(" + parent + ", " + this.quotedString(name) + ");";
};

// SC.Handlebars.JavaScriptCompiler.prototype.initializeBuffer = function() {
//   return "data.renderContext";
// };

// SC.Handlebars.JavaScriptCompiler.prototype.appendToBuffer = function(string) {
//   return "buffer.push(" + string + ");";
// };

SC.Handlebars.compile = function(string) {
  var ast = Handlebars.parse(string);
  var environment = new Handlebars.Compiler().compile(ast);
  return new SC.Handlebars.JavaScriptCompiler().compile(environment, true);
};

Handlebars.registerHelper('view', function(path, fn, inverse, data) {
  if (fn.isRenderData) { data = fn; fn = null; }

  var newView = SC.objectForPropertyPath(path);
  var currentView = data.view;

  var childViews = currentView.get('childViews');
  var childView = currentView.createChildView(newView);

  // Set the template of the view to the passed block if we got one
  if (fn) { childView.template = fn; }

  childViews.pushObject(childView);

  var context = SC.RenderContext(childView.get('tagName'));
  childView.applyAttributesToContext(context);
  // tomdale wants to make SproutCore slow
  childView.render(context, YES);

  return new Handlebars.SafeString(context.join());
});

Handlebars.registerHelper('bindProperty', function(property, fn, inverse, data) {
  if(fn.isRenderData) { data = fn; fn = null; }
  var view = data.view;

  var spanId = "handlebars-bound-" + jQuery.uuid++;
  var result = this.get(property);

  var self = this;

  this.addObserver(property, function() {
    if (fn) {
      var renderContext = SC.RenderContext('span').id(spanId);

      renderContext.push(fn(self.get(property)));
      var element = renderContext.element();
      view.$("#" + spanId).replaceWith(element);
    } else {
      view.$("#" + spanId).html(Handlebars.Utils.escapeExpression(self.get(property)));
    }
  });

  var renderContext = SC.RenderContext('span').id(spanId);
  if (fn) {
    renderContext.push(fn(result));
  } else {
    renderContext.push(Handlebars.Utils.escapeExpression(result));
  }
  renderContext = renderContext.end();

  return new Handlebars.SafeString(renderContext.join());
});
