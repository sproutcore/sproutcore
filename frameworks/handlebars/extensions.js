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

Handlebars.registerHelper('bindProperty', function(property, fn, inverse) {
  var spanId = "handlebars-bound-" + jQuery.uuid++;
  var result = this.get(property);

  var currentView = SC.Handlebars.currentView;
  var self = this;

  this.addObserver(property, function() {
    // this code is called outside of the rendering process, which means that child bindProperty
    // calls will not have access to SC.Handlebars.currentView variable. However, we have access
    // to the original view that was being rendered when this observer was created (currentView
    // in this function), so we reassign it to SC.Handlebars.currentView for the duration of
    // this block.
    //
    // Note that, in general, the global state here is clearly a code smell. We need to add a
    // mechanism for template-local state to Handlebars.
    var originalView = SC.Handlebars.currentView;

    try {
      SC.Handlebars.currentView = currentView;

      if (fn) {
        currentView.$("#" + spanId).html(fn(self.get(property)));
      } else {
        currentView.$("#" + spanId).html(Handlebars.Utils.escapeExpression(self.get(property)));
      }
    } finally {
      SC.Handlebars.currentView = originalView;
    }
  });

  if (fn) {
    return new Handlebars.SafeString("<span id='" + spanId + "'>" +
                                     fn(result) + "</span>");
  } else {
    return new Handlebars.SafeString("<span id='" + spanId + "'>" +
                                     Handlebars.Utils.escapeExpression(result) +
                                     "</span>");
  }
});
