SC.mixin(SC, {
  /**
    Returns the hash of “simple types”, for easy “is this type a built-in
    type?” comparison.
  */
  getSimpleTypes: function() {
    var simpleTypes = SC._simpleTypes;
    if (!simpleTypes) {
      simpleTypes = SC._simpleTypes = {};
      simpleTypes[SC.T_STRING]    = true;
      simpleTypes[SC.T_NUMBER]    = true;
      simpleTypes[SC.T_BOOL]      = true;
      simpleTypes[SC.T_UNDEFINED] = true;
      simpleTypes[SC.T_NULL]      = true;
    }
    return simpleTypes;
  },

  /*
  * Returns YES if the type of the passed value is a primitive.
  */
  isSimple: function(value) {
    return SC.getSimpleTypes()[SC.typeOf(value)];
  },

  /*
  * Returns YES if the type of the passed value is not primitive.
  */
  isComplex: function(value) {
    return !SC.getSimpleTypes()[SC.typeOf(value)];
  }
});

