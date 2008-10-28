// ========================================================================
// SproutCore
// copyright 2006-2008 Sprout Systems, Inc.
// ========================================================================

require('foundation/object') ;

// A relay simply allows you to connect the properties of two objects. 
// Whenever the value of one property changes, the value of the other 
// property will change also.  This allows you to design your system more
// modular.
//
// You can also configure a relay to be one way so only the from -> to path
// changes are permitted. We will also allow transforms and placeholder values 
// eventually.

SC.Binding = SC.Object.extend({
  
  // ......................................
  // PROPERTIES
  // Configure these on setup.  They should be either tuples or property
  // paths.  The relay will try to observe both of them.
  from: '', to: '',
  
  // set to true if you don't want changes to -> from to relay.
  oneWay: false,
  
  // set this to some value if you want a placeholder when the source
  // value is an empty array or null (if you don't also set a nullPlaceholder)
  emptyPlaceholder: null,
  
  // set this to some value if you want a placeholder value when the source
  // value is null.  If you don't set this but you do set an emptyPlaceholder
  // then the emptyPlaceholder will be used instead.
  nullPlaceholder: null,
  
  // set this to some value if you want a placeholder when the value is 
  // an array with multiple values.  If you set this, arrays with single
  // values will be converted to indivdual objects.  If this is set ot null,
  // multiple values will be allowed to pass untouched.
  multiplePlaceholder: null,
  
  // set this to a function if you want a transform performed on an input
  // value.  This transform is performed both ways and before placeholder
  // values are applied.
  transform: null,
  
  // ......................................
  // METHODS
  
  // This will connect the relay so that properties can be forwarded.  If
  // the items are already connected, this has no effect.
  connect: function() {
    if (this._connected) return ;
    var funcs = this._boundObservers() ;
    
    SC.Observers.addObserver(this.get('from'),funcs.from) ;
    SC.Observers.addObserver(this.get('to'),funcs.to) ;
    this._connected = true ;
    return this ;
  },
  
  // this will disconnect the relay from its observing.  Call this if you 
  // want to destroy the relay. This returns null so you can use it in
  // assignment.
  disconnect: function() {  
    if (!this._connected) return ;
    var funcs = this._boundObservers() ;
    SC.Observers.removeObserver(this.get('from'),funcs.from) ;
    SC.Observers.removeObserver(this.get('to'),funcs.to) ;
    this._connected = false ;
    return this ;
  },
  
  // simulate a from -> to relay.
  relay: function() { 
    var tuple = SC.Object.tupleForPropertyPath(this.get('from')) ;
    if (tuple) tuple = this._walkTuple(tuple) ;
    if (tuple) this._fromObserver(tuple[0],tuple[1],tuple[0].get(tuple[1]));
  },
  
  // ......................................
  // INTERNAL METHODS

  init: function() {
    arguments.callee.base.call(this) ;
    this.connect() ;
  },
  
  _boundObservers: function() {
    var ret = this._boundObserverFuncs ;
    if (!ret) {
      this._boundObserverFuncs = ret = {
        from: this._fromObserver.bind(this),
        to: this._toObserver.bind(this)
      } ;
    }
    return ret ;
  },
  
  _fromObserver: function(target,key,value, propertyRevision) {
    // to avoid echos, check against last toProperty revision.
    if (propertyRevision <= this._lastFromPropertyRevision) return ;
    this._lastFromPropertyRevision = propertyRevision ;
    
    // no need to forward values if they haven't actually changed.
    if (!this._didChange(this._lastFromValue,value)) return ;
    this._lastFromValue = value ;
    
    // try to get the to object.
    var tuple = SC.Object.tupleForPropertyPath(this.get('to')) ;
    if (tuple) tuple = this._walkTuple(tuple) ;
    if (tuple) {

      // transform the value
      var transformFunc = this.transform ;
      if (transformFunc) value = transformFunc('to', key, value) ;
      this._lastToValue = value ;

      // apply placeholder settings.
      var pholder ;

      // handle empty placeholder.
      if (value && (value == []) && (pholder = this.get('emptyPlaceholder'))) {
        value = pholder ;

      // handle multiple value placeholder
      } else if (value && (value instanceof Array) && (pholder = this.get('multiplePlaceholder'))) {
        value = (value.length == 1) ? value[0] : pholder ;
      }

      // now handle null placeholder.  This is used if one of these other 
      // transforms results in a null value.
      if ((value == null) && (pholder = this.get('nullPlaceholder') || this.get('emptyPlaceholder'))) {
        value = pholder ;
      }

      tuple[0].set(tuple[1],value) ;      
      this._lastToPropertyRevision = tuple[0].propertyRevision ;
      
    }
  },

  _toObserver: function(target,key,value, propertyRevision) {
    // try to get the to object.
    if (this.get('oneWay')) return ; // block.

    // to avoid echos, check against last toProperty revision.
    if (propertyRevision <= this._lastToPropertyRevision) return ;
    this._lastToPropertyRevision = propertyRevision ;
    
    // no need to forward values if they haven't actually changed.
    if (!this._didChange(this._lastToValue,value)) return ;
    this._lastToValue = value ;
    
    var tuple = SC.Object.tupleForPropertyPath(this.get('from')) ;
    if (tuple) tuple = this._walkTuple(tuple) ;
    if (tuple) {
      // transform the value
      var transformFunc = this.get('transform') ;
      if (transformFunc) value = transformFunc('from', key, value) ;
      this._lastFromValue = value ;
      
      // send along to the 'from' source.
      tuple[0].set(tuple[1],value) ;
      var result = tuple[0].get(tuple[1]);
      if (result) this._lastFromPropertyRevision = result.propertyRevision ;
      
      // now that it has been set, the FROM object might not allow some 
      // changes.  If that is the case, then we need to set this back on the
      // sender.
      if (result != value) {
        target.set(key,result) ;
        this._lastToPropertyRevision = target.propertyRevision ;
      }
      
    } 
  },
  
  _didChange: function(lastValue, newValue) {
    if (newValue && lastValue) {
      if (typeof(newValue) == typeof(lastValue)) {
        if (lastValue == newValue) return false ;
      }
    } else if (((newValue === null) && (lastValue === null)) || ((newValue === undefined) && (lastValue === undefined))) return false ;
    return true ;
  },
  
  _lastToPropertyRevision: 0,
  _lastFromPropertyRevision: 0,
  
  _walkTuple: function(tuple) {
    var parts = tuple[1].split('.') ;
    if (parts.length > 1) {
      tuple = tuple.slice() ; // duplicate to avoid an error.
      var obj = tuple[0] ;
      tuple[1] = parts.pop() ;
      for(var loc=0;(obj && (loc<parts.length));loc++) {
        obj = obj.get(parts[loc]) ;
      }
      tuple[0] = obj ;
    }
    return (tuple[0] && tuple[1]) ? tuple : null ;
  }
  
}) ;

SC.Binding.mixin({
  // Constant values for placeholders
  MULTIPLE_PLACEHOLDER: '@@MULT@@',
  NULL_PLACEHOLDER: '@@NULL@@',
  EMPTY_PLACEHOLDER: '@@EMPTY@@'
}) ;

// This is the basic method you can use to create a builder function for
// different types of relays.  The first param is either a string or a set
// of properties.  The second param is a set of properties.  Both are opt.
SC.Binding.From = function(from,opts) {
  if (!opts) opts = {} ;
  if (($type(from) == T_STRING) || ($type(from) == T_ARRAY)) {
    opts.from = from ;
  } else Object.extend(opts,from) ;
  var ret = SC.Binding.extend(opts) ; 
  return ret ;
} ;

SC.Binding.build = function(tr) {
  return function(from) { 
    return SC.Binding.From(from,{ transform: tr }) ; 
  } ;
} ; 

SC.Binding.NoChange = SC.Binding.From;

// This binding will return errors as null.
SC.Binding.NoError = SC.Binding.build(function(dir, key, value) {
  return ($type(value) == T_ERROR) ? null : value ;  
}) ;

SC.Binding.NoError.ext = function(bindFunc) {
  return function(d,k,v) {
    return ($type(value) == T_ERROR) ? null : bindFunc(d,k,v) ;  
  } ;
} ;

// This binding only allows single, null, or error values.  If an array is 
// passed, it will be mapped like so:
//
// [] => null
// [x] => x
// [x,x,x] => MULTIPLE_PLACEHOLDER
//
SC.Binding.Single = SC.Binding.build(function(d,k,v) {
  if ($type(v) == T_ARRAY) {
    switch(v.length) {
      case 0:
        v = null ;
        break ;
      case 1:
        v = v[0] ;
        break ;
      default:
        v = SC.Binding.MULTIPLE_PLACEHOLDER ;
    }
  }
  return v;
});

// This binding works just like Single except if you pass a multiple value
// it will be converted to NULL.
SC.Binding.SingleNull = SC.Binding.build(function(d,k,v) {
  if ($type(v) == T_ARRAY) {
    switch(v.length) {
      case 0:
        v = null ;
        break ;
      case 1:
        v = v[0] ;
        break ;
      default:
        v = null ;
    }
  }
  return v;
});

// NoError versions.
SC.Binding.SingleNoError = SC.Binding.NoError.ext(SC.Binding.Single);
SC.Binding.SingleNullNoError = SC.Binding.NoError.ext(SC.Binding.SingleNull);

// This requires the value to be a multiple.  null => [], x => [x]
SC.Binding.Multiple = SC.Binding.build(function(d,k,v) {
  var t = $type(v) ;
  if (t != T_ARRAY) {
    if (t == null) {
      v = [] ;
    } else if (t != T_ERROR) {
      v = [v] ;
    }
  }
  return v ;
}) ;

SC.Binding.MultipleNoError = SC.Binding.NoError.ext(SC.Binding.Multiple);

// Converts value to a bool.  true if: not null, not empty array, not 0, '',
// etc.
SC.Binding.Bool = SC.Binding.build(function(d,k,v) {
  return ($type(v) == T_ARRAY) ? (v.length > 0) : !!v ;
}) ;

// Converts value to a bool, but its only true if not null
SC.Binding.NotNull = SC.Binding.build(function(d,k,v) { 
  return (v != null) ;
}) ;

// Converts inverse of bool.
SC.Binding.Not = SC.Binding.build(function(d,k,v) {
  return !(($type(v) == T_ARRAY) ? (v.length > 0) : !!v) ;
}) ;

// Converts value to a bool, but its only true if not null
SC.Binding.IsNull = SC.Binding.build(function(d,k,v) {
  return (v == null) ;
}) ;

// No Error versions.
SC.Binding.BoolNoError = SC.Binding.NoError.ext(SC.Binding.Bool) ;
SC.Binding.NotNullNoError = SC.Binding.NoError.ext(SC.Binding.NotNull) ;
SC.Binding.NotNoError = SC.Binding.NoError.ext(SC.Binding.Not) ;
SC.Binding.IsNullNoError = SC.Binding.NoError.ext(SC.Binding.IsNull) ;

// .........................................................
// DEPRECATED

// This relay forces all values to be multiple values
SC.Binding.Multiple = function(from) {
  return SC.Binding.From(from,{
    transform: function(dir,key,value) { 
      return (value) ? (SC.isArray(value) ? value : [value]) : value;
    }
  }) ;
} ;

// This relay forces all values to be multiple values, null values are not
// allowed.
SC.Binding.MultipleNotEmpty = function(from) {
  return SC.Binding.From(from,{
    transform: function(dir,key,value) { 
      return (value) ? (SC.isArray(value) ? value : [value]) : [];
    }
  }) ;
} ;

// This relay allows single values and no null/empty values.
SC.Binding.SingleNotEmpty = function(from) {
  return SC.Binding.From(from,{
    multiplePlaceholder: SC.Binding.MULTIPLE_PLACEHOLDER,
    emptyPlaceholder: SC.Binding.EMPTY_PLACEHOLDER,
    nullPlaceholder: SC.Binding.NULL_PLACEHOLDER
  }) ;
} ;

// This relay allows any values, but only one way flow.
SC.Binding.OneWay = function(from) {
  return SC.Binding.From(from, { oneWay: true }) ;
} ;

// This relay forces the value to be true or false.  Empty and null values
// represent false.
SC.Binding.Flag = function(from) {
  return SC.Binding.From(from, { 
    transform: function(dir,key,value) {
      return (value && (value instanceof Array)) ? (value.length == 0) : !!value ;
    }
  }) ;
} ;

SC.Binding.OneWayFlag = function(from) {
  var ret = SC.Binding.Flag(from) ;
  ret.oneWay = true ;
  return ret ;  
} ;


