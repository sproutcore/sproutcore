sc_require('system/object');

SC._PropertyChain = SC.Object.extend(SC.Enumerable, {
  isPropertyChain: true,

  object: null,
  property: null,

  nextObject: function(index, previousObject, context) {
    return previousObject.next;
  },

  activate: function(prev) {
    var object   = this.get('object'),
        property = this.get('property');

    // If this chain has not yet been associated with an object,
    // look up the object and associate it.
    if (!object) {
      object = prev.get(property);
      this.set('object', object);
    }

    // If there is still no object, don't associate any KVO
    // property chains.
    if (!object) { return; }

    var next = this.next;

    // Set up KVO property chains, if they don't already exist
    var chains = this._chainsFor(this.get('nextProperty'), object);

    chains.add(this);

    // Unless we are at the tail of the chain, activate the next
    // element of the chain.
    if(next) { next.activate(object); }
  },

  deactivate: function() {
    console.log('deactivate!');
    var object       = this.get('object'),
        property     = this.get('property'),
        nextProperty = this.get('nextProperty');

    // If the chain element is not associated with an object,
    // we don't need to deactivate anything.
    if (!object) { return; }

    var next = this.next;

    // Set up KVO property chains, if they don't already exist
    var chains = this._chainsFor(nextProperty, object);

    chains.remove(this);

    if (chains.get('length') === 0) {
      delete object._kvo_property_chains[nextProperty];
    }

    // Unless we are at the tail of the chain, deactivate the
    // next element of the chain.
    if(next) { next.deactivate(); }
  },

  trigger: function() {
    var target       = this.get('target'),
        toInvalidate = this.get('toInvalidate');

    // Tell the target of the chain to invalidate the property
    // that depends on this element of the chain
    target.propertyDidChange(toInvalidate);

    // Tear down the rest of the existing chain
    this.deactivate();

    // Activate the chain on the newly set object
    this.activate();
  },

  _chainsFor: function(property, object) {
    object._kvo_property_chains = object._kvo_property_chains || {};
    var chains = object._kvo_property_chains[property] =
      object._kvo_property_chains[property] || SC.CoreSet.create();

    return chains;
  },

  toString: function() {
    return "SC._ChainProperty(target: %@, property: %@)".fmt(
      this.get('target'), this.get('property'));
  }
});

SC._PropertyChain.createChain = function(path, target, toInvalidate) {
  window.billy = target;

  var log = YES;
  var parts = path.split('.');

  if (log) {
    console.log("Creating chain on %@.%@ to invalidate %@".fmt(target, path, toInvalidate));
  }

  var len = parts.length - 1,
      i   = 1;

  var root = SC._PropertyChain.create({
    property:     parts[0],
    target:       target,
    toInvalidate: toInvalidate,
    nextProperty: parts[1]
  });

  root.set('length', len--);
  var tail = root;

  while(len--) {
    tail = tail.next = SC._PropertyChain.create({
      property:     parts[i],
      target:       target,
      toInvalidate: toInvalidate,
      nextProperty: parts[++i]
    });

    tail.set('length', len);
  }

  root.activate(target);
  return root;
};

