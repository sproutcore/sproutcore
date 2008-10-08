// ========================================================================
// SproutCore
// copyright 2006-2008 Sprout Systems, Inc.
// ========================================================================

require('foundation/object') ;

/** 
  Default placeholder for multiple values in bindings.
*/
SC.MULTIPLE_PLACEHOLDER = '@@MULT@@' ;

/**
  Default placeholder for null values in bindings.
*/
SC.NULL_PLACEHOLDER = '@@NULL@@' ;

/**
  Default placeholder for empty values in bindings.
*/
SC.EMPTY_PLACEHOLDER = '@@EMPTY@@' ;


/**
  A binding simply connects the properties of two objects so that whenever the
  value of one property changes, the other property will be changed also.  You
  do not usually work with Binding objects directly but instead describe
  bindings in your class definition using something like:
  
    valueBinding: "MyApp.someController.title"
  
  You can also create a binding with specific transforms by using the from()
  and other helpers.  For example, the following will create a binding that 
  allows only single values:
  
    valueBinding: SC.Binding.from('MyApp.someController.title').single()
      

  
  @extends Object
  
*/
SC.Binding = {
  
  /**
    This is the core method you use to create a new binding instance.  The
    binding instance will have the receiver instance as its parent which means
    any configuration you have there will be inherited.  
    
    The returned instance will also have its parentBinding property set to the 
    receiver.
    
    @returns {SC.Binding} new binding instance
  */
  beget: function() {
    var ret = SC.beget(this) ;
    ret.parentBinding = this;
    return ret ;
  },
  
  /**
    Returns a builder function for compatibility.  
  */
  builder: function() {
    var binding = this ;
    var ret = function(fromProperty) { return binding.beget().from(fromProperty); };
    ret.beget = function() { return binding.beget(); } ;
    return ret ;
  },
  
  /**
    This will set "from" property path to the specified value.  It will not
    attempt to resolve this property path to an actual object/property tuple
    until you connect the binding.
    
    @param propertyPath {String|Tuple} A property path or tuple
    @param root {Object} optional root object to use when resolving the path.
    @returns {SC.Binding} this
  */
  from: function(propertyPath, root) {
    // beget if needed.
    var binding = (this === SC.Binding) ? this.beget() : this ;
    binding._fromPropertyPath = propertyPath ;
    binding._fromRoot = root ;
    bidning._fromTuple = null ;
    return binding ;
  },
  
  /**
   This will set the "to" property path to the specified value.  It will not 
   attempt to reoslve this property path to an actual object/property tuple
   until you connect the binding.
    
    @param propertyPath {String|Tuple} A property path or tuple
    @param root {Object} optional root object to use when resolving the path.
    @returns {SC.Binding} this
  */
  to: function(propertyPath, root) {
    // beget if needed.
    var binding = (this === SC.Binding) ? this.beget() : this ;
    binding._toPropertyPath = propertyPath ;
    binding._toRoot = root ;
    binding._toTuple = null ; // clear out any existing one.
    return binding ;
  },
  
  /**
    Attempts to connect this binding instance so that it can receive and relay
    changes.  This method will raise an exception if you have not set the 
    from/to properties yet.
    
    @returns {SC.Binding} this
  */
  connect: function() {
    
    // If the binding is already connected, do nothing.
    if (this.isConnected) return this ;

    // try to connect the from side.
    SC.Observers.addObserver(this._fromPropertyPath, this.propertyDidChange, this, this._fromRoot) ;
    
    // try to connect the to side
    if (!this._oneWay) {
      SC.Observers.addObserver(this._toPropertyPath, this.propertyDidChange, this, this._toRoot) ;  
    }
    
    this.isConnected = YES ;
    return this; 
  },
  
  /**
    Disconnects the binding instance.  Changes will no longer be relayed.  You
    will not usually need to call this method.
    
    @returns {SC.Binding} this
  */
  disconnect: function() {
    if (!this.isConnected) return this; // nothing to do.

    SC.Observers.removeObserver(this._fromPropertyPath, this.propertyDidChange, this, this._fromRoot) ;
    if (!this._oneWay) {
      SC.Observers.removeObserver(this._toPropertyPath, this.propertyDidChange, this, this._toRoot) ;
    }
    
    this.isConnected = NO ;
    return this ;  
  },

  /**
    This method is invoked whenever the value of a property changes.  It will 
    save the property/key that has changed and relay it later.
  */
  fromPropertyDidChange: function(key, target) {
    var v = target.get(key) ;
    
    // if the new value is different from the current binding value, then 
    // schedule to register an update.
    if (v !== this._bindingValue) {
      this._bindingValue = v ;
      SC.Binding._changeQueue.add(this) ; // save for later.  
    }
  },

  _changeQueue: SC.Set.create(),
  _alternateChangeQueue: SC.Set.create(),
  
  /**
    Call this method on SC.Binding to flush all bindings with changed pending.
    
    @returns {SC.Binding} this
  */
  flushPendingChanges: function() {
    
    // don't allow flushing more than one at a time
    if (this._isFlushing) return ; 
    this._isFlushing = YES ;
    
    // keep doing this as long as there are changes to flush.
    var queue ;
    while((queue = this._changeQueue).get('length') > 0) {

      // first, swap the change queues.  This way any binding changes that
      // happen while we flush the current queue can be queued up.
      this._changeQueue = this._alternateChangeQueue ;
      this._alternateChangeQueue = queue ;
      
      // next, apply any bindings in the current queue.  This may cause 
      // additional bindings to trigger, which will end up in the new active 
      // queue.
      var binding ;
      while(binding = queue.popObject()) binding.applyBindingValue() ;
      
      // now loop back and see if there are additional changes pending in the
      // active queue.  Repeat this until all bindings that need to trigger have
      // triggered.
    }

    // clean up
    this._isFlushing = NO ;
    return this ;
  },
  
  /**
    This method is called at the end of the Run Loop to relay the changed 
    binding value from one side to the other.
  */
  applyBindingValue: function() {
    
    // compute the binding targets if needed.
    this._computeBindingTargets() ;
    
    var v = this._bindingValue ;
    
    // the from property value will always be the binding value, update if 
    // needed.
    if (!this._oneWay && this._fromTarget) {
      this._fromTarget.setPathIfChanged(this._fromPropertyKey, v) ;
    }
    
    // apply any transforms to get the to property value also
    var transforms = this._transforms;
    if (transforms) {
      var len = transforms.length ;
      for(var idx=0;idx<len;idx++) {
        var transform = transforms[idx] ;
        v = transform(v, this) ;
      }
    }
    
    // if error objects are not allowed, and the value is an error, then
    // change it to null.
    if (this._noError && $type(v) === T_ERROR) v = null ;
    
    // update the to value if needed.
    if (this._toTarget) {
      this._toTarget.setPathIfChanged(this._toPropertyKey, v) ;
    }
  },

  _computeBindingTargets: function() {
    if (!this._fromTarget) {
      var tuple = SC.Object.tupleForPropertyPath(this._fromPropertyPath, this._fromRoot) ;
      if (tuple) {
        this._fromTarget = tuple[0]; this._fromPropertyKey = tuple[1] ;
      }
    }

    if (!this._toTarget) {
      var tuple = SC.Object.tupleForPropertyPath(this._toPropertyPath, this._toRoot) ;
      if (tuple) {
        this._toTarget = tuple[0]; this._toPropertyKey = tuple[1] ;
      }
    }
  },
  
  /**
    Configures the binding as one way.  A one-way binding will relay changes
    on the "from" side to the "to" side, but not the other way around.  This
    means that if you change the "to" side directly, the "from" side may have a
    different value.
    
    @param aFlag {Boolean} Optionally pass NO to set the binding back to two-way
    @returns {SC.Binding} this
  */
  oneWay: function(aFlag) {
    // beget if needed.
    var binding = (this === SC.Binding) ? this.beget() : this ;
    binding._oneWay = (aFlag === undefined) ? YES : aFlag ;
    return binding ;
  },
  
  /**
    Adds the specified transform function to the array of transform functions.
    
    The function you pass must have the following signature:
    
    {{{
      function(value) {} ;
    }}}
    
    It must return either the transformed value or an error object.  
        
    Transform functions are chained, so they are called in order.  If you are
    extending a binding and want to reset the transforms, you can call
    resetTransform() first.
    
    @param transformFunc {Function} the transform function.
    @returns {SC.Binding} this
  */
  transform: function(transformFunc) {
    var binding = (this === SC.Binding) ? this.beget() : this ;
    var t = binding._transforms ;
    
    // clone the transform array if this comes from the parent
    if (t && (t === binding.parentBinding._transform)) {
      t = binding._transforms = t.slice() ;
    }
    
    // create the transform array if needed.
    if (!t) t = binding._transforms = [] ;
    
    // add the transform function
    t.push(transformFunc) ;
    return binding;
  },
  
  /**
    Resets the transforms for the binding.  After calling this method the 
    binding will no longer transform values.  You can then add new transforms
    as needed.
  
    @returns {SC.Binding} this
  */
  resetTransforms: function() {
    var binding = (this === SC.Binding) ? this.beget() : this ;
    binding._transforms = null ; return binding ;
  },
  
  /**
    Specifies that the binding should not return error objects.  If the value
    of a binding is an Error object, it will be transformed to a null value
    instead.
    
    Note that this is not a transform function since it will be called at the
    end of the transform chain.
    
    @param aFlag {Boolean} optionally pass NO to allow error objects again.
    @returns {SC.Binding} this
  */
  noError: function(aFlag) {
    var binding = (this === SC.Binding) ? this.beget() : this ;
    binding._noError = (aFlag === undefined) ? YES : aFlag ;
    return binding ;
  },
  
  /**
    Adds a transform to the chain that will allow only single values to pass.
    This will allow single values, nulls, and error values to pass through.  If
    you pass an array, it will be mapped as so:
    
    {{{
      [] => null
      [a] => a
      [a,b,c] => Multiple Placeholder
    }}}
    
    You can pass in an optional multiple placeholder or it will use the 
    default.
    
    Note that this transform will only happen on forwarded valued.  Reverse
    values are send unchanged.
    
    @param multiplePlaceholder {Object} optional placeholder value.
    @returns {SC.Binding} this
  */
  single: function(multiplePlaceholder) {
    if (multiplePlaceholder === undefined) {
      multiplePlaceholder = SC.MULTIPLE_PLACEHOLDER ;
    }
    return this.transform(function(value, isForward) {
      if (SC.isArray(value)) {
        value = (value.length > 1) ? multiplePlaceholder : (value.length <= 0) ? null : (value.objectAt) ? value.objectAt(0) : value[0];
      }
      return value ;
    }) ;
  },
  
  /** 
    Adds a transform that will return the placeholder value if the value is 
    null, undefined, an empty array or an empty string.  See also notNull().
    
    @param placeholder {Object} optional placeholder.
    @returns {SC.Binding} this
  */
  notEmpty: function(placeholder) {
    if (placeholder === undefined) placeholder = SC.EMPTY_PLACEHOLDER ;
    return this.transform(function(value, isForward) {
      if ((value === null) || (value === undefined) || (value === '') || (SC.isArray(value) && value.length === 0)) {
        value = placeholder ;
      }
      return value ;
    }) ;
  },
  
  /**
    Adds a transform that will return the placeholder value if the value is
    null.  Otherwise it will passthrough untouched.  See also notEmpty().
    
    @param placeholder {Object} optional placeholder;
    @returns {SC.Binding} this
  */
  notNull: function(placeholder) {
    if (placeholder === undefined) placeholder = SC.EMPTY_PLACEHOLDER ;
    return this.transform(function(value, isForward) {
      if ((value === null) || (value === undefined)) value = placeholder ;
      return value ;
    }) ;
  },

  /** 
    Adds a transform that will convert the passed value to an array.  If 
    the value is null or undefined, it will be converted to an empty array.

    @param placeholder {Object} optional placeholder;
    @returns {SC.Binding} this
  */
  multiple: function() {
    return this.transform(function(value) {
      if (!SC.isArray(value)) value = (value == null) ? [] : [value] ;
      return value ;
    }) ;
  },
  
  /**
    Adds a transform to convert the value to a bool value.  If the value is
    an array it will return YES if array is not empty.  If the value is a string
    it will return YES if the string is not empty.
  
    @returns {SC.Binding} this
  */
  bool: function() {
    return this.transform(function(v) {
      var t = $type(v) ;
      if (t === T_ERROR) return v ;
      return (t == T_ARRAY) ? (v.length > 0) : (v === '') ? NO : !!v ;
    }) ;
  },
  
  /**
    Adds a transform to convert the value to the inverse of a bool value.  This
    uses the same transform as bool() but inverts it.
    
    @returns {SC.Binding} this
  */
  not: function() {
    return this.transform(function(v) {
      var t = $type(v) ;
      if (t === T_ERROR) return v ;
      return !((t == T_ARRAY) ? (v.length > 0) : (v === '') ? NO : !!v) ;
    }) ;
  },
  
  /**
    Adds a transform that will return YES if the value is null, NO otherwise.
    
    @returns {SC.Binding} this
  */
  isNull: function() {
    return this.transform(function(v) { 
      var t = $type(v) ;
      return (t === T_ERROR) ? v : v == null ;
    });
  }  
} ;

// ......................................
// DEPRECATED
//
// The transforms below are deprecated but still available for backwards 
// compatibility.  Instead of using these methods, however, you should use
// the helpers.  For example, where before you would have done:
//
//  contentBinding: SC.Binding.Single('MyApp.myController.count') ;
//
// you should do:
//
//  contentBinding. SC.Binding.from('MyApp.myController.count').single();
//
// and for defaults:
//
//  contentBindingDefault: SC.Binding.single()
//
SC.Binding.From = SC.Binding.NoChange = SC.Binding.builder();

SC.Binding.Single = SC.Binding.single().builder() ;
SC.Binding.SingleNull = SC.Binding.single(null).builder() ;
SC.Binding.SingleNoError = SC.Binding.Single.beget().noError().builder() ;
SC.Binding.SingleNullNoError = SC.Binding.SingleNull.beget().noError().builder() ;
SC.Binding.Multiple = SC.Binding.multiple().builder() ;
SC.Binding.MultipleNoError = SC.Binding.multiple().noError().builder() ;

SC.Binding.Bool = SC.Binding.bool().builder() ;
SC.Binding.Not = SC.Binding.bool().not().builder() ;
SC.Binding.NotNull = SC.Binding.isNull().not().builder() ;
SC.Binding.IsNull = SC.Binding.isNull().builder() ;

// No Error versions.
SC.Binding.BoolNoError = SC.Binding.Bool.beget().noError().builder();
SC.Binding.NotNullNoError = SC.Binding.NotNull.beget().noError().builder();
SC.Binding.NotNoError = SC.Binding.Not.beget().noError().builder();
SC.Binding.IsNullNoError = SC.Binding.IsNull.beget().noError().builder() ;

