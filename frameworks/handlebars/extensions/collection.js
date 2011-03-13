sc_require('extensions');

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
    var collectionObject = collectionClass;

    if(collectionObject.isClass) {
      collectionObject = collectionObject.prototype;
    }

    collectionObject.itemViewTemplate = fn;
    collectionObject.inverseTemplate = inverse;
    collectionObject.itemViewOptions = itemHash;
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
