sc_require('extensions');

Handlebars.registerHelper('collection', function(path, options) {
  var fn = options.fn;
  var data = options.data;
  var inverse = options.inverse;
  var collectionClass, collectionObject;

  collectionClass = path ? SC.objectForPropertyPath(path) : SC.TemplateCollectionView;
  //@ if (debug)
  if (!collectionClass) {
    throw "%@ #collection: Could not find %@".fmt(data.view, path);
  }
  //@ endif

  var hash = fn.hash, itemHash = {}, match;

  for (var prop in hash) {
    if (fn.hash.hasOwnProperty(prop)) {
      match = prop.match(/^item(.)(.*)$/);

      if(match) {
        itemHash[match[1].toLowerCase() + match[2]] = hash[prop];
        delete hash[prop];
      }
    }
  }

  if(fn) {
    if(collectionClass.isClass) {
      collectionObject = collectionClass.create();
    } else {
      collectionObject = collectionClass;
    }

    collectionObject.itemViewTemplate = fn;
    collectionObject.inverseTemplate = inverse;
    collectionObject.itemViewOptions = itemHash;
  }

  options.fn = function() { return ""; };

  return Handlebars.helpers.view.call(this, collectionObject, options);
});

Handlebars.registerHelper('each', function(path, options) {
  options.hash.content = SC.getPath(this, path);
  options.hash.itemContextProperty = 'content';
  return Handlebars.helpers.collection.call(this, null, options);
});
