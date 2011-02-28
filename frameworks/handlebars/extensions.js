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

Handlebars.registerHelper('view', function(path, fn, inverse, data) {
  if (fn.isRenderData) { data = fn; fn = null; }

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
  childView.applyAttributesToContext(context);
  // tomdale wants to make SproutCore slow
  childView.render(context, YES);

  return new Handlebars.SafeString(context.join());
});

Handlebars.registerHelper('bind', function(property, fn, inverse, data) {
  if(fn.isRenderData) { data = fn; fn = null; }
  var view = data.view;

  var spanId = "handlebars-bound-" + jQuery.uuid++;
  var result = this.getPath(property);

  var self = this, renderContext = SC.RenderContext('span').id(spanId);

  this.addObserver(property, function() {
    var result = self.getPath(property);

    if (fn && (result !== null && result !== undefined)) {
      var renderContext = SC.RenderContext('span').id(spanId);
      renderContext.push(fn(self.get(property)));
      var element = renderContext.element();
      view.$("#" + spanId).replaceWith(element);
    } else if (result !== null && result !== undefined) {
      view.$("#" + spanId).html(Handlebars.Utils.escapeExpression(self.get(property)));
    } else {
      view.$("#" + spanId).html("");
    }
  });

  if (result !== null && result !== undefined) {
    if (fn) {
      renderContext.push(fn(result));
    } else {
      renderContext.push(Handlebars.Utils.escapeExpression(result));
    }
  }

  return new Handlebars.SafeString(renderContext.join());
});

Handlebars.registerHelper('collection', function(path, fn, inverse, data) {
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

  return Handlebars.helpers.view.call(this, collectionClass, Handlebars.VM.noop, inverse, data);
});

Handlebars.registerHelper('bindCollection', function(path, bindingString, fn, inverse, data) {
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

  return Handlebars.helpers.collection.call(this, collectionClass, fn, inverse, data);
});
