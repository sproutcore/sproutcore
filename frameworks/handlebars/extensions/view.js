sc_require('extensions');

SC.Handlebars.ViewHelper = SC.Object.create({
  helper: function(thisContext, path, options) {
    var inverse = options.inverse;
    var data = options.data;
    var fn = options.fn;

    var newView;
    if (path.isClass || path.isObject) {
     newView = path;
     if (!newView) {
      throw "Null or undefined object was passed to the #view helper. Did you mean to pass a property path string?";
     }
    } else {
      newView = SC.objectForPropertyPath(path);
      if (!newView) { throw "Unable to find view at path '" + path + "'"; }
    }

    var currentView = data.view;

    var childViews = currentView.get('childViews');
    var childView = currentView.createChildView(newView);

    // Set the template of the view to the passed block if we got one
    if (fn) { childView.template = fn; }


    childViews.pushObject(childView);

    var context = SC.RenderContext(childView.get('tagName'));

    // Add id and class names passed to view helper
    this.applyAttributes(options.hash, childView, context);

    childView.applyAttributesToContext(context);


    // tomdale wants to make SproutCore slow
    childView.render(context, YES);

    return new Handlebars.SafeString(context.join());
  },

  applyAttributes: function(options, childView, context) {
    var id = options.id;
    var classNames = options['class'];

    if (classNames) {
      context.addClass(classNames.split(' '));
    }

    if (id) {
      childView.set('layerId', id);
      context.id(id);
    }

    var classBindings = options.classBinding;
    if (classBindings) {
      this.addClassBindings(classBindings, childView, context);
    }
  },

  addClassBindings: function(classBindings, view, context) {
    var classObservers = view._classObservers;

    // Teardown any existing observers on the view.
    if (classObservers) {
      for (var prop in classObservers) {
        if (classObservers.hasOwnProperty(prop)) {
          view.removeObserver(prop, classObservers[prop]);
        }
      }
    }

    classObservers = view._classObservers = {};

    // For each property passed, loop through and setup
    // an observer.
    classBindings.split(' ').forEach(function(property) {
      // Normalize property path to be suitable for use
      // as a class name. For exaple, content.foo.barBaz
      // becomes bar-baz.

      var dasherizedProperty = property.split('.').get('lastObject');
      dasherizedProperty = dasherizedProperty.dasherize();

      // Set up an observer on the view. If the bound property
      // changes, toggle the class name
      var observer = classObservers[property] = function() {
        var shouldDisplay = view.getPath(property);
        var elem = view.$();

        elem.toggleClass(dasherizedProperty, shouldDisplay);
      };

      view.addObserver(property, observer);

      // Add the class name to the view
      context.setClass(dasherizedProperty, view.getPath(property));
    });
  }
});


Handlebars.registerHelper('view', function(path, options) {
  return SC.Handlebars.ViewHelper.helper(this, path, options);
});
