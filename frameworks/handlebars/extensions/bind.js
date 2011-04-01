sc_require('extensions');

/**
  Adds the `bind`, `bindAttr`, and `boundIf` helpers to Handlebars.

  # bind

  `bind` can be used to display a value, then update that value if it changes.
  For example, if you wanted to print the `title` property of `content`:

      {{bind "content.title"}}

  This will return the `title` property as a string, then create a new observer
  at the specified path. If it changes, it will update the value in DOM. Note
  that this will only work with SC.Object and subclasses, since it relies on
  SproutCore's KVO system.

  # bindAttr

  `bindAttr` allows you to create a binding between DOM element attributes and
  SproutCore objects. For example:

      <img {{bindAttr src="imageUrl" alt="imageTitle"}}>

  # boundIf

  Use the `boundIf` helper to create a conditional that re-evaluates whenever
  the bound value changes.

      {{#boundIf "content.shouldDisplayTitle"}}
        {{content.title}}
      {{/boundIf}}
*/

(function() {
  var renderBindableSpan = function(spanId, fn, context) {
    var renderContext = SC.RenderContext('span').id(spanId);
    renderContext.push(fn(context));
    return renderContext.element();
  };

  var bind = function(property, options, preserveContext, shouldDisplay) {
    var data = options.data;
    var view = data.view;
    var fn = options.fn;
    var inverse = options.inverse;

    var spanId = "handlebars-bound-" + jQuery.uuid++;
    var result = this.getPath(property);

    var self = this, renderContext = SC.RenderContext('span').id(spanId);

    this.addObserver(property, function observer() {
      var result = self.getPath(property);
      var span = view.$("#" + spanId);
      var element;

      if(span.length === 0) {
        self.removeObserver(property, observer);
        return;
      }

      if (fn && shouldDisplay(result)) {
        if (preserveContext) {
          element = renderBindableSpan(spanId, fn, this);
        } else {
          element = renderBindableSpan(spanId, fn, self.get(property));
        }
        span.replaceWith(element);
      } else if (shouldDisplay(result)) {
        span.html(Handlebars.Utils.escapeExpression(result));
      } else if (inverse) {
        if (preserveContext) {
          element = renderBindableSpan(spanId, inverse, this);
        } else {
          element = renderBindableSpan(spanId, inverse, self.get(property));
        }
        span.replaceWith(element);
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
    } else if (inverse) {
      if (preserveContext) {
        renderContext.push(inverse(this));
      } else {
        renderContext.push(inverse(result));
      }
    }

    return new Handlebars.SafeString(renderContext.join());
  };

  Handlebars.registerHelper('bind', function(property, fn) {
    return bind.call(this, property, fn, false, function(result) { return !SC.none(result); } );
  });

  Handlebars.registerHelper('boundIf', function(property, fn) {
    if(fn) {
      return bind.call(this, property, fn, true, function(result) {
        if (SC.typeOf(result) === SC.T_ARRAY) {
          if (result.length !== 0) { return true; }
          return false;
        } else {
          return !!result;
        }
      } );
    } else {
      throw "Cannot use boundIf helper without a block.";
    }
  });
})();

Handlebars.registerHelper('with', function(context, options) {
  return Handlebars.helpers.bind.call(options.contexts[0], context, options);
});

Handlebars.registerHelper('if', function(context, options) {
  return Handlebars.helpers.boundIf.call(options.contexts[0], context, options);
});

Handlebars.registerHelper('bindAttr', function(options) {
  var attrs = options.hash;
  var view = options.data.view;
  var ret = [];

  // Generate a unique id for this element. This will be added as a
  // data attribute to the element so it can be looked up when
  // the bound property changes.
  var dataId = jQuery.uuid++;

  // Handle classes differently, as we can bind multiple classes
  var classBindings = attrs['class'];
  if (classBindings != null) {
    var classResults = SC.Handlebars.bindClasses(view, classBindings, dataId);
    ret.push('class="'+classResults.join(' ')+'"');
    delete attrs['class'];
  }

  var attrKeys = SC.keys(attrs);

  // For each attribute passed, create an observer and emit the
  // current value of the property as an attribute.
  attrKeys.forEach(function(attr) {
    var property = attrs[attr];
    var value = view.getPath(property);

    // Add an observer to the view for when the property changes.
    // When the observer fires, find the element using the
    // unique data id and update the attribute to the new value.
    view.addObserver(property, function observer() {
      var result = view.getPath(property);
      var elem = view.$("[data-handlebars-id='" + dataId + "']");

      // If we aren't able to find the element, it means the element
      // to which we were bound has been removed from the view.
      // In that case, we can assume the template has been re-rendered
      // and we need to clean up the observer.
      if (elem.length === 0) {
        view.removeObserver(property, observer);
        return;
      }

      // A false result will remove the attribute from the element. This is
      // to support attributes such as disabled, whose presence is meaningful.
      if (result === NO) {
        elem.removeAttr(attr);

      // Likewise, a true result will set the attribute's name as the value.
      } else if (result === YES) {
        elem.attr(attr, attr);

      } else {
        elem.attr(attr, result);
      }
    });

    // Use the attribute's name as the value when it is YES
    if (value === YES) {
      value = attr;
    }

    // Do not add the attribute when the value is false
    if (value !== NO) {
      // Return the current value, in the form src="foo.jpg"
      ret.push(attr+'="'+value+'"');
    }
  });

  // Add the unique identifier
  ret.push('data-handlebars-id="'+dataId+'"');
  return ret.join(' ');
});
