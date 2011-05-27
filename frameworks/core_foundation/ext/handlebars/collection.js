/*globals Handlebars */

sc_require('ext/handlebars');

Handlebars.registerHelper('collection', function(path, options) {
  var fn = options.fn;
  var data = options.data;
  var inverse = options.inverse;
  var hash = options.hash;
  var collectionClass, collectionObject;

  collectionClass = path ? SC.getPath(this, path) || SC.getPath(path) :
    SC.TemplateCollectionView;

  // @if (debug)
  if (!collectionClass) {
    throw "%@ #collection: Could not find %@".fmt(data.view, path);
  }
  // @endif

  var extensions = {};

  if (hash) {
    var itemHash = {}, match;

    for (var prop in hash) {
      if (hash.hasOwnProperty(prop)) {
        match = prop.match(/^item(.)(.*)$/);

        if(match) {
          itemHash[match[1].toLowerCase() + match[2]] = hash[prop];
          delete hash[prop];
        }
      }
    }

    extensions = SC.clone(hash);
    extensions.itemViewOptions = itemHash;
  }

  if (fn) { extensions.itemViewTemplate = fn; }
  if (inverse) { extensions.inverseTemplate = inverse; }

  if(collectionClass.isClass) {
    collectionObject = collectionClass.extend(extensions);
  } else {
    collectionObject = SC.mixin(collectionClass, extensions);
  }

  options.fn = function() { return ""; };

  return Handlebars.helpers.view.call(this, collectionObject, options);
});

Handlebars.registerHelper('each', function(path, options) {
  options.hash.contentBinding = SC.Binding.from('*'+path, this).oneWay();
  options.hash.itemContextProperty = 'content';
  return Handlebars.helpers.collection.call(this, null, options);
});
