sc_require("handlebars");

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
    this.applyAttributes(options, childView, context);

    childView.applyAttributesToContext(context);


    // tomdale wants to make SproutCore slow
    childView.render(context, YES);

    return new Handlebars.SafeString(context.join());
  },

  applyAttributes: function(options, childView, context) {
    var id = options.hash.id;
    var classNames = options.hash['class'];

    if (classNames) { childView.set('classNames', classNames); }
    if (id) { childView.set('layerId', id); }

    var classBindings = options.hash.classBinding;
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


(function() {
  var bind = function(property, options, preserveContext, shouldDisplay) {
    var data = options.data;
    var view = data.view;
    var fn = options.fn;

    var spanId = "handlebars-bound-" + jQuery.uuid++;
    var result = this.getPath(property);

    var self = this, renderContext = SC.RenderContext('span').id(spanId);

    this.addObserver(property, function observer() {
      var result = self.getPath(property);
      var span = view.$("#" + spanId);

      if(span.length === 0) {
        self.removeObserver(property, observer);
        return;
      }

      if (fn && shouldDisplay(result)) {
        var renderContext = SC.RenderContext('span').id(spanId);
        renderContext.push(fn(self.get(property)));
        var element = renderContext.element();
        span.replaceWith(element);
      } else if (shouldDisplay(result)) {
        span.html(Handlebars.Utils.escapeExpression(result));
      } else {
        span.html("");
      }
    });

    if (shouldDisplay(result)) {
      if (preserveContext) {
        renderContext.push(fn(this));
      } else {
        if (fn) {
          renderContext.push(fn(result));
        } else {
          renderContext.push(Handlebars.Utils.escapeExpression(result));
        }
      }
    }

    return new Handlebars.SafeString(renderContext.join());
  };

  Handlebars.registerHelper('bind', function(property, fn) {
    return bind.call(this, property, fn, false, function(result) { return !SC.none(result); } );
  });

  Handlebars.registerHelper('boundIf', function(property, fn) {
    if(fn) {
      return bind.call(this, property, fn, true, function(result) { return !!result; } );
    } else {
      throw "Cannot use boundIf helper without a block.";
    }
  });
})();

Handlebars.registerHelper('loc', function(property) {
  return property.loc();
});

Handlebars.registerHelper('collection', function(path, fn, inverse) {
  var data = fn.data;
  var collectionClass;

  if(!data) {
    data = fn;
    fn = null;
  }

  if(typeof path === "string") {
    collectionClass = SC.objectForPropertyPath(path) || SC.TemplateCollectionView;
  } else {
    collectionClass = path;
  }

  if(fn) {
    if(collectionClass.isClass) {
      collectionClass.prototype.itemViewTemplate = fn;
      collectionClass.prototype.inverseTemplate = inverse;
    } else {
      collectionClass.itemViewTemplate = fn;
      collectionClass.inverseTemplate = inverse;
    }
  }

  var noop = function() { return ""; };

  noop.data = fn.data;
  noop.hash = fn.hash;
  noop.fn = noop;

  return Handlebars.helpers.view.call(this, collectionClass, noop);
});

Handlebars.registerHelper('bindCollection', function(path, bindingString, fn) {
  var data = fn.data;
  var inverse = fn.data;
  var collectionClass = SC.objectForPropertyPath(path) || SC.TemplateCollectionView;
  var binding = SC.Binding.from(bindingString, this);

  if(!data) {
    data = fn;
    fn = null;
  }

  if(fn) {
    // attach the function to the original class so it can be used recursively
    collectionClass.prototype.itemViewTemplate = fn;
  }

  if(collectionClass.isClass) {
    collectionClass = collectionClass.extend({ contentBinding: binding });
  } else {
    collectionClass.bindings.push( binding.to('content', collectionClass) );
  }

  return Handlebars.helpers.collection.call(this, collectionClass, fn);
});
