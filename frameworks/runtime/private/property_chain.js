sc_require('system/object');

/**
  @class
  @private

  SC._PropertyChain is used as the bookkeeping system for notifying the KVO
  system of changes to computed properties that contains paths as dependent
  keys.

  Each instance of SC._PropertyChain serves as a node in a linked list. One node
  is created for each property in the path, and stores a reference to the name
  of the property and the object to which it belongs. If that property changes,
  the SC._PropertyChain instance notifies its associated computed property to
  invalidate, then rebuilds the chain with the new value.

  To create a new chain, call SC._PropertyChain.createChain() with the target,
  path, and property to invalidate if any of the objects in the path change.

  For example, if you called createChain() with 'foo.bar.baz', it would
  create a linked list like this:

   ---------------------     ---------------------     ---------------------
  | property:     'foo' |   | property:     'bar' |   | property:     'baz' |
  | nextProperty: 'bar' |   | nextProperty: 'baz' |   | nextProperty: undef |
  | next:           ------->| next:           ------->| next:     undefined |
   ---------------------     ---------------------     ---------------------

  @extends SC.Object
  @since SproutCore 1.5
*/

SC._PropertyChain = SC.Object.extend(
/** @scope SC.ObjectController.prototype */ {

  /**
    The object represented by this node in the chain.

    @property {Object}
  */
  object: null,

  /**
    The key on the previous object in the chain that contains the object
    represented by this node in the chain.

    @property {String}
  */
  property: null,

  /**
    The target object. This is the object passed to createChain(), and the
    object which contains the +toInvalidate+ property that will be invalidated
    if +property+ changes.

    @property {Object}
  */
  target: null,

  /**
    The property of +target+ to invalidate when +property+ changes.

    @property {String}
  */
  toInvalidate: null,

  /**
    The property key on +object+ that contains the object represented by the
    next node in the chain.

    @property {String}
  */
  nextProperty: null,

  /**
    Registers this segment of the chain with the object it represents.

    This should be called with the object represented by the previous node in
    the chain as the first parameter. If no previous object is provided, it will
    assume it is the root node in the chain and treat the target as the previous
    object.

    @param {Object} [prev] The previous object in the chain.
  */
  activate: function(prev) {
    var object   = this.get('object'),
        property = this.get('property');

    // If no parameter is passed, assume we are the root in the chain
    // and look up property relative to the target, since dependent key
    // paths are always relative.
    if (!prev) { prev = this.get('target'); }

    // If this node has not yet been associated with an object,
    // look up the object and associate it.
    if (!object) {
      // In the special case of @each, we treat the enumerable as the next
      // property.
      if (property === '@each') {
        object = prev;
      } else {
        object = prev.get(property);
      }
      this.set('object', object);
    }

    // If there is still no object, don't associate any KVO
    // property chains.
    if (!object) { return; }

    // Register this node with the object, and tell it which key changing should
    // cause the node to be notified.
    object.registerDependentKeyWithChain(this.get('nextProperty'), this);
  },

  /**
    Removes this segment of the chain from the object it represents. This is usually
    called when the object represented by the previous segment in the chain changes.
  */
  deactivate: function() {
    var object       = this.get('object'),
        nextProperty = this.get('nextProperty');

    // If the chain element is not associated with an object,
    // we don't need to deactivate anything.
    if (!object) { return; }

    object.removeDependentKeyWithChain(nextProperty, this);
  },

  /**
    Invalidates the +toInvalidate+ property of the +target+ object.
  */
  notifyPropertyDidChange: function() {
    var target       = this.get('target'),
        toInvalidate = this.get('toInvalidate');

    // Tell the target of the chain to invalidate the property
    // that depends on this element of the chain
    target.propertyDidChange(toInvalidate);
  },

  /**
    Deactivates the current chain, then recreates it with the new
    values.
  */
  rebuildChain: function() {
    this.deactivate();
    this.activate();
  },

  /**
    Returns a string representation of the chain segment.

    @returns {String}
  */
  toString: function() {
    return "SC._ChainProperty(target: %@, property: %@)".fmt(
      this.get('target'), this.get('property'));
  }
});

SC._PropertyChain.createChain = function(path, target, toInvalidate) {
  var parts = path.split('.');
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

  return root;
};
