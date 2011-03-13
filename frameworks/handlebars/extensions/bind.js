sc_require('extensions');

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

Handlebars.registerHelper('bindAttr', function(options) {
  var attrs = options.hash, attrKeys = SC.keys(options.hash);
  var view = options.data.view;
  var ret = [];

  // Generate a unique id for this element. This will be added as a
  // data attribute to the element so it can be looked up when
  // the bound property changes.
  var dataId = jQuery.uuid++;

  // For each attribute passed, create an observer and emit the
  // current value of the property as an attribute.
  attrKeys.forEach(function(attr) {
    var property = attrs[attr];

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

      elem.attr(attr, result);
    });

    // Return the current value, in the form src="foo.jpg"
    ret.push(attr+'="'+view.getPath(property)+'"');
  });

  // Add the unique identifier
  ret.push('data-handlebars-id="'+dataId+'"');
  return ret.join(' ');
});
