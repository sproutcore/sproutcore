sc_require("handlebars");

/**
  Prepares the Handlebars templating library for use inside SproutCore's view
  system.

  The SC.Handlebars object is the standard Handlebars library, extended to use
  SproutCore's get() method instead of direct property access, which allows
  computed properties to be used inside templates.

  To use SC.Handlebars, call SC.Handlebars.compile().  This will return a
  function that you can call multiple times, with a context object as the first
  parameter:

      var template = SC.Handlebars.compile("my {{cool}} template");
      var result = template({
        cool: "awesome"
      });

      console.log(result); // prints "my awesome template"

  Note that you won't usually need to use SC.Handlebars yourself. Instead, use
  SC.TemplateView, which takes care of integration into the view layer for you.
*/

SC.Handlebars = {};

SC.Handlebars.JavaScriptCompiler = function() {};
SC.Handlebars.JavaScriptCompiler.prototype = SC.beget(Handlebars.JavaScriptCompiler.prototype);
SC.Handlebars.JavaScriptCompiler.prototype.compiler = SC.Handlebars.JavaScriptCompiler;

SC.Handlebars.JavaScriptCompiler.prototype.nameLookup = function(parent, name, type) {
  if (type === 'context') {
    return "SC.get(" + parent + ", " + this.quotedString(name) + ");";
  } else {
    return Handlebars.JavaScriptCompiler.prototype.nameLookup.call(this, parent, name, type);
  }
};

SC.Handlebars.compile = function(string) {
  var ast = Handlebars.parse(string);
  var environment = new Handlebars.Compiler().compile(ast);
  return new SC.Handlebars.JavaScriptCompiler().compile(environment, true);
};


/**
  Determines the classes to add based on an array of bindings (provided as strings),
  as well as adding observers to make sure the classes are up-to-date.

  @param {SC.View} view The view at add the classes to
  @param {String} classBindings A string, space-separated, of class bindings to use
  @param {String|Number} id Optional id to scope the observers/jQuery element to
  @returns {Array} An array of class names to add
*/
SC.Handlebars.bindClasses = function(view, classBindings, id) {
  if (!view._classObservers) view._classObservers = {};
  id = id || '_default';
  var classObservers = view._classObservers[id],
      ret = [];

  // Teardown any existing observers on the view.
  if (classObservers) {
    for (var prop in classObservers) {
      if (classObservers.hasOwnProperty(prop)) {
        view.removeObserver(prop, classObservers[prop]);
      }
    }
  }

  classObservers = view._classObservers[id] = {};

  // For each property passed, loop through and setup
  // an observer.
  classBindings.split(' ').forEach(function(property) {
    // Normalize property path to be suitable for use
    // as a class name. For exaple, content.foo.barBaz
    // becomes bar-baz.

    var dasherizedProperty = property.split('.').get('lastObject').dasherize();

    // Set up an observer on the view. If the bound property
    // changes, toggle the class name
    var observer = (classObservers[property] = function() {
      var shouldDisplay = view.getPath(property);
      var elem = id !== '_default' ? view.$("[data-handlebars-id='" + id + "']") : view.$();

      if (elem.length === 0) {
        view.removeObserver(property, observer);
      } else {
        elem.toggleClass(dasherizedProperty, shouldDisplay);
      }
    });

    view.addObserver(property, observer);
    if (view.getPath(property)) ret.push(dasherizedProperty);
  });

  return ret;
};