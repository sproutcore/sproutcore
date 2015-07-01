// ==========================================================================
// Project:   SproutCore Costello - Property Observing Library
// Copyright: ©2006-2011 Strobe Inc. and contributors.
//            Portions ©2008-2011 Apple Inc. All rights reserved.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================

sc_require('ext/function');
sc_require('system/object');

//@if(debug)
/**
  Debug parameter you can turn on.  This will log all bindings that fire to
  the console.  This should be disabled in production code.  Note that you
  can also enable this from the console or temporarily.

  @type Boolean
*/
SC.LOG_BINDINGS = NO;

/**
  Performance parameter.  This will benchmark the time spent firing each
  binding.

  @type Boolean
*/
SC.BENCHMARK_BINDING_NOTIFICATIONS = NO;

/**
  Performance parameter.  This will benchmark the time spend configuring each
  binding.

  @type Boolean
*/
SC.BENCHMARK_BINDING_SETUP = NO;
//@endif

/**
  Default placeholder for multiple values in bindings.

  @type String
*/
SC.MULTIPLE_PLACEHOLDER = '@@MULT@@';

/**
  Default placeholder for null values in bindings.

  @type String
*/
SC.NULL_PLACEHOLDER = '@@NULL@@';

/**
  Default placeholder for empty values in bindings.

  @type String
*/
SC.EMPTY_PLACEHOLDER = '@@EMPTY@@';


/**
  @class

  A binding simply connects the properties of two objects so that whenever the
  value of one property changes, the other property will be changed also.  You
  do not usually work with Binding objects directly but instead describe
  bindings in your class definition using something like:

        valueBinding: "MyApp.someController.title"

  This will create a binding from "MyApp.someController.title" to the "value"
  property of your object instance automatically.  Now the two values will be
  kept in sync.

  One-Way Bindings
  ===

  By default, bindings are set up as two-way. In cases where you only need the
  binding to function in one direction, for example if a value from a controller
  is bound into a read-only LabelView, then for performance reasons you should
  use a one-way binding. To do this, call the very useful `oneWay` helper:

      valueBinding: SC.Binding.oneWay('MyApp.someController.title')

  or:

      valueBinding: SC.Binding.from('MyApp.someController.title').oneWay()

  This way if the value of MyApp.someController.title changes, your object's
  `value` will also update. Since `value` will never update on its own, this will
  avoid the setup time required to plumb the binding in the other direction,
  nearly doubling performance for this binding.

  Transforms
  ===

  In addition to synchronizing values, bindings can also perform some basic
  transforms on values.  These transforms can help to make sure the data fed
  into one object always meets the expectations of that object, regardless of
  what the other object outputs.

  To customize a binding, you can use one of the many helper methods defined
  on SC.Binding. For example:

        valueBinding: SC.Binding.single("MyApp.someController.title")

  This will create a binding just like the example above, except that now the
  binding will convert the value of MyApp.someController.title to a single
  object (removing any arrays) before applying it to the "value" property of
  your object.

  You can also chain helper methods to build custom bindings like so:

        valueBinding: SC.Binding.single("MyApp.someController.title").notEmpty(null,"(EMPTY)")

  This will force the value of MyApp.someController.title to be a single value
  and then check to see if the value is "empty" (null, undefined, empty array,
  or an empty string).  If it is empty, the value will be set to the string
  "(EMPTY)".

  The following transform helper methods are included: `noError`, `single`, `notEmpty`,
  `notNull`, `multiple`, `bool`, `not`, `isNull`, `and` (two values only), `or` (two
  values only), and `equalTo`. See each method's documentation for a full description.

  (Note that transforms are only applied in the forward direction (the 'to' side); values
  are applied untransformed to the 'from' side. If the 'from' object has validation
  needs, it should own and apply them itself, for example via a read/write calculated
  property.)

  Adding Custom Transforms
  ===

  In addition to using the standard helpers provided by SproutCore, you can
  also defined your own custom transform functions which will be used to
  convert the value.  To do this, just define your transform function and add
  it to the binding with the transform() helper.  The following example will
  not allow Integers less than ten.  Note that it checks the value of the
  bindings and allows all other values to pass:

        valueBinding: SC.Binding.transform(function (value, binding) {
          return ((SC.typeOf(value) === SC.T_NUMBER) && (value < 10)) ? 10 : value;
        }).from("MyApp.someController.value")

  If you would like to instead use this transform on a number of bindings,
  you can also optionally add your own helper method to SC.Binding.  This
  method should simply return the value of this.transform(). The example
  below adds a new helper called notLessThan() which will limit the value to
  be not less than the passed minimum:

      SC.Binding.notLessThan = function (minValue) {
        return this.transform(function (value, binding) {
          return ((SC.typeOf(value) === SC.T_NUMBER) && (value < minValue)) ? minValue : value;
        });
      };

  You could specify this in your core.js file, for example.  Then anywhere in
  your application you can use it to define bindings like so:

        valueBinding: SC.Binding.from("MyApp.someController.value").notLessThan(10)

  Also, remember that helpers are chained so you can use your helper along with
  any other helpers.  The example below will create a one way binding that
  does not allow empty values or values less than 10:

        valueBinding: SC.Binding.oneWay("MyApp.someController.value").notEmpty().notLessThan(10)

  Note that the built in helper methods all allow you to pass a "from"
  property path so you don't have to use the from() helper to set the path.
  You can do the same thing with your own helper methods if you like, but it
  is not required.

  Creating Custom Binding Templates
  ===

  Another way you can customize bindings is to create a binding template.  A
  template is simply a binding that is already partially or completely
  configured.  You can specify this template anywhere in your app and then use
  it instead of designating your own custom bindings.  This is a bit faster on
  app startup but it is mostly useful in making your code less verbose.

  For example, let's say you will be frequently creating one way, not empty
  bindings that allow values greater than 10 throughout your app.  You could
  create a binding template in your core.js like this:

        MyApp.LimitBinding = SC.Binding.oneWay().notEmpty().notLessThan(10);

  Then anywhere you want to use this binding, just refer to the template like
  so:

        valueBinding: MyApp.LimitBinding.beget("MyApp.someController.value")

  Note that when you use binding templates, it is very important that you
  always start by using beget() to extend the template.  If you do not do
  this, you will end up using the same binding instance throughout your app
  which will lead to erratic behavior.

  How to Manually Activate a Binding
  ===

  All of the examples above show you how to configure a custom binding, but
  the result of these customizations will be a binding template, not a fully
  active binding.  The binding will actually become active only when you
  instantiate the object the binding belongs to.  It is useful however, to
  understand what actually happens when the binding is activated. (Of course
  you should always use the highest-level APIs available, even if you understand
  how it works underneath; unless you have specific needs, you should rely on
  the convenience `fooBinding` format.)

  For a binding to function it must have at least a "from" property and a "to"
  property.  The from property path points to the object/key that you want to
  bind from while the to path points to the object/key you want to bind to.

  When you define a custom binding, you are usually describing the property
  you want to bind from (such as "MyApp.someController.value" in the examples
  above).  When your object is created, it will automatically assign the value
  you want to bind "to" based on the name of your binding key.  In the
  examples above, during init, SproutCore objects will effectively call
  something like this on your binding:

        binding = this.valueBinding.beget().to("value", this);

  This creates a new binding instance based on the template you provide, and
  sets the to path to the "value" property of the new object.  Now that the
  binding is fully configured with a "from" and a "to", it simply needs to be
  connected to become active.  This is done through the connect() method:

        binding.connect();

  Now that the binding is connected, it will observe both the from and to side
  and relay changes.

  If you ever needed to do so (you almost never will, but it is useful to
  understand this anyway), you could manually create an active binding by
  doing the following:

        SC.Binding.from("MyApp.someController.value")
         .to("MyApp.anotherObject.value")
         .connect();

  You could also use the bind() helper method provided by SC.Object. (This is
  the same method used by SC.Object.init() to setup your bindings):

        MyApp.anotherObject.bind("value", "MyApp.someController.value");

  Both of these code fragments have the same effect as doing the most friendly
  form of binding creation like so:


        MyApp.anotherObject = SC.Object.create({
          valueBinding: "MyApp.someController.value",

          // OTHER CODE FOR THIS OBJECT...

        });

  SproutCore's built in binding creation method make it easy to automatically
  create bindings for you. If you need further documentation on SC.Binding's inner
  workings, see the private method documentation in the source code.

  @since SproutCore 1.0
*/
SC.Binding = /** @scope SC.Binding.prototype */{

  /**
    Quack.
  */
  isBinding: YES,

  /** @private
    This is the core method you use to create a new binding instance.  The
    binding instance will have the receiver instance as its parent which means
    any configuration you have there will be inherited.

    The returned instance will also have its parentBinding property set to the
    receiver.

    @param {String} [fromPath]
    @returns {SC.Binding} new binding instance
  */
  beget: function (fromPath) {
    var ret = SC.beget(this);
    ret.parentBinding = this;

    // Mix adapters must be recreated on beget.
    if (ret._MixAdapter) {
      ret._mixAdapter = ret._MixAdapter.create(ret._mixAdapterHash);
      ret = ret.from('aggregateProperty', ret._mixAdapter).oneWay();
    }

    // Enables duplicate API calls for SC.Binding.beget and SC.Binding.from
    if (fromPath !== undefined) ret = ret.from(fromPath);
    return ret;
  },

  /** @private
    Returns a builder function for compatibility.
  */
  builder: function () {
    var binding = this,
        ret = function (fromProperty) { return binding.beget().from(fromProperty); };
    ret.beget = function () { return binding.beget(); };
    return ret;
  },

  /**
    This will set "from" property path to the specified value.  It will not
    attempt to resolve this property path to an actual object/property tuple
    until you connect the binding.

    The binding will search for the property path starting at the root level
    unless you specify an alternate root object as the second parameter to this
    method.  Alternatively, you can begin your property path with either "." or
    "*", which will use the root object of the to side be default.  This special
    behavior is used to support the high-level API provided by SC.Object.

    @param {String|Tuple} propertyPath A property path or tuple
    @param {Object} [root] root object to use when resolving the path.
    @returns {SC.Binding} this
  */
  from: function (propertyPath, root) {

    // if the propertyPath is null/undefined, return this.  This allows the
    // method to be called from other methods when the fromPath might be
    // optional. (cf single(), multiple())
    if (!propertyPath) return this;

    // beget if needed.
    var binding = (this === SC.Binding) ? this.beget() : this;
    binding._fromPropertyPath = propertyPath;
    binding._fromRoot = root;
    binding._fromTuple = null;
    return binding;
  },

  /**
    This will set the "to" property path to the specified value.  It will not
    attempt to reoslve this property path to an actual object/property tuple
    until you connect the binding.

    If you are using the convenience format `fooBinding`, for example
    `isVisibleBinding`, you do not need to call this method, as the `to` property
    path will be generated for you when its object is created.

    @param {String|Tuple} propertyPath A property path or tuple
    @param {Object} [root] root object to use when resolving the path.
    @returns {SC.Binding} this
  */
  to: function (propertyPath, root) {
    // beget if needed.
    var binding = (this === SC.Binding) ? this.beget() : this;
    binding._toPropertyPath = propertyPath;
    binding._toRoot = root;
    binding._toTuple = null; // clear out any existing one.
    return binding;
  },

  /**
    Attempts to connect this binding instance so that it can receive and relay
    changes.  This method will raise an exception if you have not set the
    from/to properties yet.

    @returns {SC.Binding} this
  */
  connect: function () {
    // If the binding is already connected, do nothing.
    if (this.isConnected) return this;
    this.isConnected = YES;
    this._connectionPending = YES; // its connected but not really...
    this._syncOnConnect = YES;

    SC.Binding._connectQueue.add(this);

    if (!SC.RunLoop.isRunLoopInProgress()) {
      this._scheduleSync();
    }

    return this;
  },

  /** @private
    Actually connects the binding.  This is done at the end of the runloop
    to give you time to setup your entire object graph before the bindings
    try to activate.
  */
  _connect: function () {
    if (!this._connectionPending) return; //nothing to do
    this._connectionPending = NO;

    var path, root;

    //@if(debug)
    var bench = SC.BENCHMARK_BINDING_SETUP;
    if (bench) SC.Benchmark.start("SC.Binding.connect()");
    //@endif

    // try to connect the from side.
    // as a special behavior, if the from property path begins with either a
    // . or * and the fromRoot is null, use the toRoot instead.  This allows
    // for support for the SC.Object shorthand:
    //
    // contentBinding: "*owner.value"
    //
    path = this._fromPropertyPath;
    root = this._fromRoot;

    if (typeof path === "string") {

      // if the first character is a '.', this is a static path.  make the
      // toRoot the default root.
      if (path.indexOf('.') === 0) {
        path = path.slice(1);
        if (!root) root = this._toRoot;

      // if the first character is a '*', then setup a tuple since this is a
      // chained path.
      } else if (path.indexOf('*') === 0) {
        path = [this._fromRoot || this._toRoot, path.slice(1)];
        root = null;
      }
    }
    this._fromObserverData = [path, this, this.fromPropertyDidChange, root];
    SC.Observers.addObserver.apply(SC.Observers, this._fromObserverData);

    // try to connect the to side
    if (!this._oneWay) {
      path = this._toPropertyPath;
      root = this._toRoot;
      this._toObserverData = [path, this, this.toPropertyDidChange, root];
      SC.Observers.addObserver.apply(SC.Observers, this._toObserverData);
    }

    //@if(debug)
    if (bench) SC.Benchmark.end("SC.Binding.connect()");
    //@endif

    // now try to sync if needed
    if (this._syncOnConnect) {
      this._syncOnConnect = NO;
      //@if(debug)
      if (bench) SC.Benchmark.start("SC.Binding.connect().sync");
      //@endif
      this.sync();
      //@if(debug)
      if (bench) SC.Benchmark.end("SC.Binding.connect().sync");
      //@endif
    }
  },

  /**
    Disconnects the binding instance.  Changes will no longer be relayed.  You
    will not usually need to call this method.

    @returns {SC.Binding} this
  */
  disconnect: function () {
    if (!this.isConnected) return this; // nothing to do.

    // if connection is still pending, just cancel
    if (this._connectionPending) {
      this._connectionPending = NO;

      SC.Binding._connectQueue.remove(this);
    // connection is completed, disconnect.
    } else {
      SC.Observers.removeObserver.apply(SC.Observers, this._fromObserverData);
      if (!this._oneWay) {
        SC.Observers.removeObserver.apply(SC.Observers, this._toObserverData);
      }

      // Remove ourselves from the change queue (if we are in it).
      SC.Binding._changeQueue.remove(this);
    }

    this.isConnected = NO;
    return this;
  },

  /** @private
    Indicates when the binding has been destroyed.

    @type Boolean
    @default NO
  */
  isDestroyed: NO,

  /** @private
    Disconnects the binding and removes all properties and external references. Called by
    either binding target object when destroyed.

    @private
  */
  destroy: function () {
    // If we're already destroyed, there's nothing to do.
    if (this.isDestroyed) return;

    // Mark it destroyed.
    this.isDestroyed = YES;

    // Clean up the mix adapter, if any. (See adapter methods.)
    if (this._mixAdapter) {
      this._mixAdapter.destroy();
      this._mixAdapter = null;
      this._MixAdapter = null;
      this._mixAdapterHash = null;
    }

    // Disconnect the binding.
    this.disconnect();

    // Aggressively null out internal properties.
    this._bindingSource = null;
    this._toRoot = this._toTarget = null;
    this._fromRoot = this._fromTarget = null;
    this._toObserverData = this._fromObserverData = null;
  },

  /** @private
    Invoked whenever the value of the "from" property changes.  This will mark
    the binding as dirty if the value has changed.

    @param {Object} target The object that contains the key
    @param {String} key The name of the property which changed
  */
  fromPropertyDidChange: function (target, key) {
    var v = target ? target.get(key) : null;

    // In rare circumstances, getting a property can result in observers firing,
    // which may in turn run code that disconnects the binding. The cause of
    // this pattern has been difficult to determine and so until a concrete test
    // scenario and a lower level fix can be found, show a warning and ignore
    // the update.
    if (!this.isConnected) {
      //@if(debug)
      SC.Logger.warn("Developer Warning: A binding attempted to update after it was disconnected. The update will be ignored for binding: %@".fmt(this._fromPropertyPath, this._fromTarget, this));
      //@endif

      // Break early.
      return;
    }

    // if the new value is different from the current binding value, then
    // schedule to register an update.
    if (v !== this._bindingValue || key === '[]') {

      this._setBindingValue(target, key);
      SC.Binding._changeQueue.add(this); // save for later.

      this._scheduleSync();
    }
  },

  /** @private
    Invoked whenever the value of the "to" property changes.  This will mark the
    binding as dirty only if:

    - the binding is not one way
    - the value does not match the stored transformedBindingValue

    if the value does not match the transformedBindingValue, then it will
    become the new bindingValue.

    @param {Object} target The object that contains the key
    @param {String} key The name of the property which changed
  */
  toPropertyDidChange: function (target, key) {
    if (this._oneWay) return; // nothing to do

    var v = target.get(key);

    // In rare circumstances, getting a property can result in observers firing,
    // which may in turn run code that disconnects the binding. The cause of
    // this pattern has been difficult to determine and so until a concrete test
    // scenario and a lower level fix can be found, show a warning and ignore
    // the update.
    if (!this.isConnected) {
      //@if(debug)
      SC.Logger.warn("Developer Warning: A binding attempted to update after it was disconnected. The update will be ignored for binding: %@".fmt(this));
      //@endif

      // Break early.
      return;
    }

    // if the new value is different from the current binding value, then
    // schedule to register an update.
    if (v !== this._transformedBindingValue) {
      this._setBindingValue(target, key);
      SC.Binding._changeQueue.add(this); // save for later.

      this._scheduleSync();
    }
  },

  /** @private */
  _scheduleSync: function () {
    if (SC.RunLoop.isRunLoopInProgress() || SC.Binding._syncScheduled) { return; }
    SC.Binding._syncScheduled = YES;
    setTimeout(function () { SC.run(); SC.Binding._syncScheduled = NO; }, 1);
  },

  /** @private
    Saves the source location for the binding value.  This will be used later
    to actually update the binding value.
  */
  _setBindingValue: function (source, key) {
    this._bindingSource = source;
    this._bindingKey    = key;
  },

  /** @private
    Updates the binding value from the current binding source if needed.  This
    should be called just before using this._bindingValue.
  */
  _computeBindingValue: function () {
    var source = this._bindingSource,
        key    = this._bindingKey,
        v;

    this._bindingValue = v = (source ? source.getPath(key) : null);
    this._transformedBindingValue = this._computeTransformedValue(v);
  },

  /** @private
    Applies transforms to the value and returns the transfomed value.
    @param {*} value Binding value to transform
    @returns {*} Transformed value
  */
  _computeTransformedValue: function (value) {
    var transforms = this._transforms,
        idx,
        len,
        transform;

    if (transforms) {
      len = transforms.length;
      for (idx = 0; idx < len; idx++) {
        transform = transforms[idx];
        value = transform(value, this);
      }
    }

    // if error objects are not allowed, and the value is an error, then
    // change it to null.
    if (this._noError && SC.typeOf(value) === SC.T_ERROR) { value = null; }

    return value;
  },

  _connectQueue: SC.CoreSet.create(),
  _alternateConnectQueue: SC.CoreSet.create(),
  _changeQueue: SC.CoreSet.create(),
  _alternateChangeQueue: SC.CoreSet.create(),

  /** @private
    Call this method on SC.Binding to flush all bindings with changes pending.

    @returns {Boolean} YES if changes were flushed.
  */
  flushPendingChanges: function () {

    // don't allow flushing more than one at a time
    if (this._isFlushing) return NO;
    this._isFlushing = YES;
    SC.Observers.suspendPropertyObserving();

    var didFlush = NO,
        // connect any bindings
        queue, binding;

    while ((queue = this._connectQueue).length > 0) {
      this._connectQueue = this._alternateConnectQueue;
      this._alternateConnectQueue = queue;
      while ((binding = queue.pop())) { binding._connect(); }
    }

    // loop through the changed queue...
    while ((queue = this._changeQueue).length > 0) {
      //@if(debug)
      if (SC.LOG_BINDINGS) SC.Logger.log("Begin: Trigger changed bindings");
      //@endif

      didFlush = YES;

      // first, swap the change queues.  This way any binding changes that
      // happen while we flush the current queue can be queued up.
      this._changeQueue = this._alternateChangeQueue;
      this._alternateChangeQueue = queue;

      // next, apply any bindings in the current queue.  This may cause
      // additional bindings to trigger, which will end up in the new active
      // queue.
      while ((binding = queue.pop())) { binding.applyBindingValue(); }

      // now loop back and see if there are additional changes pending in the
      // active queue.  Repeat this until all bindings that need to trigger
      // have triggered.
      //@if(debug)
      if (SC.LOG_BINDINGS) SC.Logger.log("End: Trigger changed bindings");
      //@endif
    }

    // clean up
    this._isFlushing = NO;
    SC.Observers.resumePropertyObserving();

    return didFlush;
  },

  /** @private
    This method is called at the end of the Run Loop to relay the changed
    binding value from one side to the other.
  */
  applyBindingValue: function () {
    // compute the binding targets if needed.
    this._computeBindingTargets();
    this._computeBindingValue();

    var v = this._bindingValue,
        tv = this._transformedBindingValue;

    //@if(debug)
    var bench = SC.BENCHMARK_BINDING_NOTIFICATIONS,
      log = SC.LOG_BINDINGS;
    //@endif

    // the from property value will always be the binding value, update if
    // needed.
    if (!this._oneWay && this._fromTarget) {
      //@if(debug)
      if (log) SC.Logger.log("%@: %@ -> %@".fmt(this, v, tv));
      if (bench) SC.Benchmark.start(this.toString() + "->");
      //@endif

      this._fromTarget.setPathIfChanged(this._fromPropertyKey, v);

      //@if(debug)
      if (bench) SC.Benchmark.end(this.toString() + "->");
      //@endif
    }

    // update the to value with the transformed value if needed.
    if (this._toTarget) {

      //@if(debug)
      if (log) SC.Logger.log("%@: %@ <- %@".fmt(this, v, tv));
      if (bench) SC.Benchmark.start(this.toString() + "<-");
      //@endif

      this._toTarget.setPathIfChanged(this._toPropertyKey, tv);

      //@if(debug)
      if (bench) SC.Benchmark.start(this.toString() + "<-");
      //@endif
    }
  },

  /**
    Calling this method on a binding will cause it to check the value of the
    from side of the binding matches the current expected value of the
    binding. If not, it will relay the change as if the from side's value has
    just changed.

    This method is useful when you are dynamically connecting bindings to a
    network of objects that may have already been initialized. Otherwise you
    should not need to call this method.
  */
  sync: function () {
    var target,
        key,
        v,
        tv;

    // do nothing if not connected
    if (!this.isConnected) return this;

    // connection is pending, just note that we should sync also
    if (this._connectionPending) {
      this._syncOnConnect = YES;

    // we are connected, go ahead and sync
    } else {
      this._computeBindingTargets();
      target = this._fromTarget;
      key = this._fromPropertyKey;
      if (!target || !key) return this; // nothing to do

      // Let's check for whether target is a valid observable with getPath.
      // Common cases might have it be a Window or a DOM object.
      //
      // If we have a target, it is ready, but if it is invalid, that is WRONG.
      if (!target.isObservable) {
        //@if(debug)
        // Provide some developer support.
        if (target === window) {
          var msg = "Developer Warning: You are attempting to bind \"%{to_root}\"'s '%{to_property}' property to the non-observable 'window.%{key}'. It's likely that you've specified a local binding path without prepending a period. For example, you may have `%{to_property}Binding: '%{key}'` instead of `%{to_property}Binding: '.%{key}'`.";
          msg = msg.fmt({
            to_root: (this._toRoot || 'object').toString(),
            to_property: this._toPropertyPath,
            key: key
          });
          SC.Logger.warn(msg);
        } else {
          SC.Logger.warn("Developer Warning: Cannot bind \"%@\"'s '%@' property to property '%@' on non-observable '%@'".fmt((this._toRoot || 'object').toString(), this._toPropertyPath, key, target));
        }
        //@endif
        return this;
      }

      // get the new value
      v = target.getPath(key);
      tv = this._computeTransformedValue(v);

      // if the new value is different from the current binding value, then
      // schedule to register an update.
      if (v !== this._bindingValue || tv !== this._transformedBindingValue || key === '[]') {
        this._setBindingValue(target, key);
        SC.Binding._changeQueue.add(this); // save for later.
      }
    }

    return this;
  },

  /** @private
    set if you call sync() when the binding connection is still pending.
   */
  _syncOnConnect: NO,

  /** @private */
  _computeBindingTargets: function () {
    var path, root, tuple;

    if (!this._fromTarget) {
      // if the fromPropertyPath begins with a . or * then we may use the
      // toRoot as the root object.  Similar code exists in connect() so if
      // you make a change to one be sure to update the other.
      path = this._fromPropertyPath;
      root = this._fromRoot;
      if (typeof path === "string") {

        // static path beginning with the toRoot
        if (path.indexOf('.') === 0) {
          path = path.slice(1); // remove the .
          if (!root) root = this._toRoot; // use the toRoot optionally

        // chained path beginning with toRoot.  Setup a tuple
        } else if (path.indexOf('*') === 0) {
          path = [root || this._toRoot, path.slice(1)];
          root = null;
        }
      }

      tuple = SC.tupleForPropertyPath(path, root);
      if (tuple) {
        this._fromTarget = tuple[0];
        this._fromPropertyKey = tuple[1];
      }
    }

    if (!this._toTarget) {
      path = this._toPropertyPath;
      root = this._toRoot;
      tuple = SC.tupleForPropertyPath(path, root);
      if (tuple) {
        this._toTarget = tuple[0];
        this._toPropertyKey = tuple[1];
        // Hook up _mixAdapter if needed (see adapter methods).
        if (this._mixAdapter) {
          this._mixAdapter.set('localObject', this._toTarget);
        }
      }
    }
  },

  // -------------------------------
  // Helper Methods
  //

  /**
    Configures the binding as one way.  A one-way binding will relay changes
    on the "from" side to the "to" side, but not the other way around.  This
    means that if you change the "to" side directly, the "from" side will not
    be updated, and may have a different value.

    @param {String} [fromPath] from path to connect.
    @param {Boolean} [aFlag] Pass NO to set the binding back to two-way
    @returns {SC.Binding} this
  */
  oneWay: function (fromPath, aFlag) {

    // If fromPath is a bool but aFlag is undefined, swap.
    if ((aFlag === undefined) && (SC.typeOf(fromPath) === SC.T_BOOL)) {
      aFlag = fromPath;
      fromPath = null;
    }

    // beget if needed.
    var binding = this.from(fromPath);
    if (binding === SC.Binding) binding = binding.beget();
    binding._oneWay = (aFlag === undefined) ? YES : aFlag;

    return binding;
  },

  /**
    Adds the specified transform function to the array of transform functions.

    The function you pass must have the following signature:

          function (value) {};

    or:

          function (value, binding) {};

    It must return either the transformed value or an error object.

    Transform functions are chained, so they are called in order.  If you are
    extending a binding and want to reset its transforms, you can call
    resetTransform() first.

    @param {Function} transformFunc the transform function.
    @returns {SC.Binding} this
  */
  transform: function (transformFunc) {
    var binding = (this === SC.Binding) ? this.beget() : this;
    var t = binding._transforms;

    // clone the transform array if this comes from the parent
    if (t && (t === binding.parentBinding._transforms)) {
      t = binding._transforms = t.slice();
    }

    // create the transform array if needed.
    if (!t) t = binding._transforms = [];

    // add the transform function
    t.push(transformFunc);
    return binding;
  },

  /**
    Resets the transforms for the binding.  After calling this method the
    binding will no longer transform values.  You can then add new transforms
    as needed.

    @returns {SC.Binding} this
  */
  resetTransforms: function () {
    var binding = (this === SC.Binding) ? this.beget() : this;
    binding._transforms = null;
    return binding;
  },

  /**
    Adds a transform to convert the value to a bool value.  If the value is
    an array it will return YES if array is not empty.  If the value is a string
    it will return YES if the string is not empty.

    @param {String} [fromPath]
    @returns {SC.Binding} this
  */
  bool: function (fromPath) {
    return this.from(fromPath).transform(function (v) {
      var t = SC.typeOf(v);
      if (t === SC.T_ERROR) return v;
      return (t == SC.T_ARRAY) ? (v.length > 0) : (v === '') ? NO : !!v;
    });
  },

  /**
    Adds a transform that will *always* return an integer Number value. Null and undefined values will
    return 0 while String values will be transformed using the parseInt method (according to the
    radix) and Boolean values will be 1 or 0 if true or false accordingly. Other edge cases like NaN
    or other non-Numbers will also return 0.

    Example results,

    - null => 0
    - undefined => 0
    - '123' => 123
    - true => 1
    - {} => 0

    @param {String} fromPathOrRadix from path or the radix for the parsing or null for 10
    @param {String} radix the radix for the parsing or null for 10
    @returns {SC.Binding} this
  */
  integer: function (fromPathOrRadix, radix) {
    // Normalize arguments.
    if (radix === undefined) {
      radix = fromPathOrRadix;
      fromPathOrRadix = null;
    }

    // Use base 10 by default.
    if (radix === undefined) radix = 10;

    return this.from(fromPathOrRadix).transform(function (value) {

      // Null or undefined will be converted to 0.
      if (SC.none(value)) {
        value = 0;

      // String values will be converted to integer Numbers using parseInt with the given radix.
      } else if (typeof value === SC.T_STRING) {
        value = window.parseInt(value, radix);

      // Boolean values will be converted to 0 or 1 accordingly.
      } else if (typeof value === SC.T_BOOL) {
        value = value ? 1 : 0;
      }

      // All other non-Number values will be converted to 0 (this includes bad String parses above).
      if (typeof value !== SC.T_NUMBER || isNaN(value)) {
        value = 0;
      }

      return value;
    });
  },

  /**
    Adds a transform that will return YES if the value is null or undefined, NO otherwise.

    @param {String} [fromPath]
    @returns {SC.Binding} this
  */
  isNull: function (fromPath) {
    return this.from(fromPath).transform(function (v) {
      var t = SC.typeOf(v);
      return (t === SC.T_ERROR) ? v : SC.none(v);
    });
  },

  /**
    Specifies that the binding should not return error objects.  If the value
    of a binding is an Error object, it will be transformed to a null value
    instead.

    Note that this is not a transform function since it will be called at the
    end of the transform chain.

    @param {String} [fromPath] from path to connect.
    @param {Boolean} [aFlag] Pass NO to allow error objects again.
    @returns {SC.Binding} this
  */
  noError: function (fromPath, aFlag) {
    // If fromPath is a bool but aFlag is undefined, swap.
    if ((aFlag === undefined) && (SC.typeOf(fromPath) === SC.T_BOOL)) {
      aFlag = fromPath;
      fromPath = null;
    }

    // beget if needed.
    var binding = this.from(fromPath);
    if (binding === SC.Binding) binding = binding.beget();
    binding._noError = (aFlag === undefined) ? YES : aFlag;

    return binding;
  },

  /**
    Adds a transform to convert the value to the inverse of a bool value.  This
    uses the same transform as bool() but inverts it.

    @param {String} [fromPath]
    @returns {SC.Binding} this
  */
  not: function (fromPath) {
    return this.from(fromPath).transform(function (v) {
      var t = SC.typeOf(v);
      if (t === SC.T_ERROR) return v;
      return !((t == SC.T_ARRAY) ? (v.length > 0) : (v === '') ? NO : !!v);
    });
  },

  /**
    Adds a transform that will convert the passed value to an array.  If
    the value is null or undefined, it will be converted to an empty array.

    @param {String} [fromPath]
    @returns {SC.Binding} this
  */
  multiple: function (fromPath) {
    return this.from(fromPath).transform(function (value) {
      /*jshint eqnull:true*/
      if (!SC.isArray(value)) value = (value == null) ? [] : [value];
      return value;
    });
  },

  /**
    Adds a transform that will return the placeholder value if the value is
    null, undefined, an empty array or an empty string.  See also notNull().

    @param {String} fromPath from path or null
    @param {Object} [placeholder]
    @returns {SC.Binding} this
  */
  notEmpty: function (fromPath, placeholder) {
    if (placeholder === undefined) placeholder = SC.EMPTY_PLACEHOLDER;
    return this.from(fromPath).transform(function (value, isForward) {
      if (SC.none(value) || (value === '') || (SC.isArray(value) && (value.get ? value.get('length') : value.length) === 0)) {
        value = placeholder;
      }
      return value;
    });
  },

  /**
    Adds a transform that will return the placeholder value if the value is
    null or undefined.  Otherwise it will pass through untouched.  See also notEmpty().

    @param {String} fromPath from path or null
    @param {Object} [placeholder]
    @returns {SC.Binding} this
  */
  notNull: function (fromPath, placeholder) {
    if (placeholder === undefined) placeholder = SC.EMPTY_PLACEHOLDER;
    return this.from(fromPath).transform(function (value, isForward) {
      if (SC.none(value)) value = placeholder;
      return value;
    });
  },

  /**
    Adds a transform to the chain that will allow only single values to pass.
    This will allow single values, nulls, and error values to pass through.  If
    you pass an array, it will be mapped as so:

          [] => null
          [a] => a
          [a,b,c] => Multiple Placeholder

    You can pass in an optional multiple placeholder or it will use the
    default.

    Note that this transform will only happen on forwarded valued.  Reverse
    values are send unchanged.

    @param {String} fromPath from path or null
    @param {Object} [placeholder] placeholder value.
    @returns {SC.Binding} this
  */
  single: function (fromPath, placeholder) {
    if (placeholder === undefined) {
      placeholder = SC.MULTIPLE_PLACEHOLDER;
    }
    return this.from(fromPath).transform(function (value, isForward) {
      if (value && value.isEnumerable) {
        var len = value.get('length');
        value = (len > 1) ? placeholder : (len <= 0) ? null : value.firstObject();
      }
      return value;
    });
  },

  /**
    Adds a transform that will *always* return a String value. Null and undefined values will return
    an empty string while all other non-String values will be transformed using the toString method.

    Example results,

    - null => ''
    - undefined => ''
    - 123 => '123'
    - true => 'true'
    - {} => '[object Object]' (i.e. x = {}; return x.toString())

    @param {String} fromPath from path or null
    @returns {SC.Binding} this
  */
  string: function (fromPath) {
    return this.from(fromPath).transform(function (value) {

      // Null or undefined will be converted to an empty string.
      if (SC.none(value)) {
        value = '';

      // Non-string values will be converted to strings using `toString`.
      } else if (typeof value !== SC.T_STRING && value.toString) {
        value = value.toString();
      }

      return value;
    });
  },

  /* @private Used by mix adapter bindings. */
  _sc_mixAdapterBinding: function (adapterClass) {
    var paths = [];

    //@if(debug)
    // Add some developer support to prevent improper use.
    if (arguments.length < 3 ) {
      SC.Logger.warn('Developer Warning: Invalid mix binding, it should have at least two target paths');
    }
    //@endif

    // If either path is local, remove any * chains and append the localObject path to it.
    for (var i = 1; i < arguments.length; i++) {
      var path = arguments[i];

      if (path.indexOf('*') === 0 || path.indexOf('.') === 0) {
        path = path.slice(1).replace(/\*/g, '.');
        path = '*localObject.' + path;
      }
      paths.push( path );
    }

    // Gets the adapter class and instantiates a nice copy.
    var adapterHash = {
      localObject: null,
    };

    // create the oneWay bindings pointing to the real data sources.
    // for naming use a hardcoded convention 'value' + index of the property/path.
    // of course, these properties are internal so we are not concerned by the naming convention
    for (i = 0; i < paths.length; ++i) {
      var key = 'value' + i;
      adapterHash[key + 'Binding'] = SC.Binding.oneWay(paths[i]);
    }

    var adapter = adapterClass.create(adapterHash);

    // Creates and populates the return binding.
    var ret = this.from('aggregateProperty', adapter).oneWay();

    // This is all needed later on by beget, which must create a new adapter instance
    // or risk bad behavior.
    ret._MixAdapter = adapterClass;
    ret._mixAdapterHash = adapterHash;
    ret._mixAdapter = adapter;

    // On our way.
    return ret;
  },

  /** @private */
  _sc_mixImpl: function(paths, mixFunction) {
    var len = paths.length,
        properties = [];

    //@if(debug)
    // Add some developer support to prevent improper use.
    if (SC.none(mixFunction) || SC.typeOf(mixFunction) !== SC.T_FUNCTION ) {
      SC.Logger.error('Developer Error: Invalid mix binding, the last argument must be a function.');
    }
    //@endif

    // Create the adapter class that eventually will contain bindings pointing to all values that will be processed
    // by mixFunction. The effective aggregation is done by another property that depends on all these local properties
    // and is invalidated whenever they change.
    // First of all, create the list of the property names that the aggregate property depends on.
    // The names of these dynamically created properties are matching the pattern
    // mentioned above (into _sc_mixAdapterBinding): 'value' + index of the property/path
    for (var i = 0; i < len; ++i) {
      properties.push('value' + i);
    }

    // Create a proxy SC.Object which will be bound to the each of the paths and contain a computed
    // property that will be dependent on all of the bound properties. The computed property will
    // return the result of the mix function.
    var adapter = SC.Object.extend({
      // Use SC.Function.property to be able to pass an array as arguments to .property
      aggregateProperty: SC.Function.property(function() {
        // Get an array of current values that will be passed to the mix function.
        var values = properties.map(function (name) {
                                      return this.get(name);
                                    }, this);

        // Call the mixFunction providing an array containing all current source property values.
        return mixFunction.apply(null, values);
      }, properties).cacheable()
    });

    return this._sc_mixAdapterBinding.apply(this, [adapter].concat(paths));
  },

  /**
    Adds a transform that returns the logical 'AND' of all the values at the provided paths. This is
    a quick and useful way to bind a `Boolean` property to two or more other `Boolean` properties.

    For example, imagine that we wanted to only enable a deletion button when an item in a list
    is selected *and* the current user is allowed to delete items. If these two values are set
    on controllers respectively at `MyApp.itemsController.hasSelection` and
    `MyApp.userController.canDelete`. We could do the following,

        deleteButton: SC.ButtonView.design({

          // Action & target for the button.
          action: 'deleteSelectedItem',
          target: MyApp.statechart,

          // Whether the list has a selection or not.
          listHasSelectionBinding: SC.Binding.oneWay('MyApp.itemsController.hasSelection'),

          // Whether the user can delete items or not.
          userCanDeleteBinding: SC.Binding.oneWay('MyApp.userController.canDelete'),

          // Note: Only enable when the list has a selection and the user is allowed!
          isEnabled: function () {
            return this.get('listHasSelection') && this.get('userCanDelete');
          }.property('listHasSelection', 'userCanDelete').cacheable()

        })

    However, this would be much simpler to write by using the `and` binding transform like so,

        deleteButton: SC.ButtonView.design({

          // Action & target for the button.
          action: 'deleteSelectedItem',
          target: MyApp.statechart,

          // Note: Only enable when the list has a selection and the user is allowed!
          isEnabledBinding: SC.Binding.and('MyApp.itemsController.hasSelection', 'MyApp.userController.canDelete')

        })

    *Note:* the transform acts strictly as a one-way binding, working only in the one direction.

    @param {String...} the property paths of source values that will be provided to the AND transform.
  */
  and: function () {
    // Fast copy.
    var len = arguments.length,
        paths = new Array(len);
    for (var i = 0; i < len; i++) { paths[i] = arguments[i]; }

    // Create a new mix implementation for the AND function.
    return this._sc_mixImpl(paths, function() {
      var result = true;

      for (i = 0; result && (i < arguments.length); i++) { // Bails early if any value is false.
        result = result && arguments[i];
      }

      return result;
    });
  },

  /**
    Adds a transform that returns the logical 'OR' of all the values at the provided paths. This is
    a quick and useful way to bind a `Boolean` property to two or more other `Boolean` properties.

    For example, imagine that we wanted to show a button when one or both of two values are present.
    If these two values are set on controllers respectively at `MyApp.profileController.hasDisplayName` and
    `MyApp.profileController.hasFullName`. We could do the following,

        saveButton: SC.ButtonView.design({

          // Action & target for the button.
          action: 'saveProfile',
          target: MyApp.statechart,

          // Whether the profile has a displayName or not.
          profileHasDisplayNameBinding: SC.Binding.oneWay('MyApp.profileController.hasDisplayName'),

          // Whether the profile has a fullName or not.
          profileHasFullNameBinding: SC.Binding.oneWay('MyApp.profileController.hasFullName'),

          // Note: Only show when the profile has a displayName or a fullName or both!
          isVisible: function () {
            return this.get('profileHasDisplayName') || this.get('profileHasFullName');
          }.property('profileHasDisplayName', 'profileHasFullName').cacheable()

        })

    However, this would be much simpler to write by using the `or` binding transform like so,

        saveButton: SC.ButtonView.design({

          // Action & target for the button.
          action: 'saveProfile',
          target: MyApp.statechart,

          // Note: Only show when the profile has a displayName or a fullName or both!
          isVisibleBinding: SC.Binding.or('MyApp.profileController.hasDisplayName', 'MyApp.profileController.hasFullName')

        })

    *Note:* the transform acts strictly as a one-way binding, working only in the one direction.

    @param {String...} the paths of source values that will be provided to the OR sequence.
  */
  or: function () {
    // Fast copy.
    var len = arguments.length,
        paths = new Array(len);
    for (var i = 0; i < len; i++) { paths[i] = arguments[i]; }

    // Create a new mix implementation for the OR function.
    return this._sc_mixImpl( paths, function() {
      var result = false;
      for (i = 0; !result && (i < arguments.length); i++) { // Bails early if any value is true.
        result = result || arguments[i];
      }

      return result;
    });
  },

  /**
    Adds a transform that aggregates through a given function the values at the provided paths. The
    given function is called whenever any of the values are updated. This is a quick way to
    aggregate multiple properties into a single property value.

    For example, to concatenate two properties 'MyApp.groupController.name' and
    'MyApp.userController.fullName', we could do the following,

        currentGroupUserLabel: SC.LabelView.extend({

          // The group name (may be null).
          groupNameBinding: SC.Binding.oneWay('MyApp.groupController.name'),

          // The user full name (may be null).
          userFullNameBinding: SC.Binding.oneWay('MyApp.userController.fullName'),

          // Ex. Returns one of "", "Selected Group", or "Selected Group: Selected User"
          value: function () {
            var groupName = this.get('groupName'),
                userFullName = this.get('userFullName');

            if (SC.none(userFullName)) {
              if (SC.none(groupName)) {
                return ''; // No group and no user.
              } else {
                return groupName; // Just a group.
              }
            } else {
              return '%@: %@'.fmt(groupName, userFullName); // Group and user.
            }
          }.property('groupName', 'userFullName').cacheable()

        })

    However, this is simpler (ex. 86 fewer characters) to write by using the `mix` binding transform like so,

        currentGroupUserLabel: SC.LabelView.extend({

          // Ex. Returns one of "", "Selected Group", or "Selected Group: Selected User"
          valueBinding: SC.Binding.mix(
            'MyApp.groupController.name', // The group name (may be null).
            'MyApp.userController.fullName', // The user full name (may be null).

            // Aggregate function. The arguments match the bound property values above.
            function (groupName, userFullName) {
              if (SC.none(userFullName)) {
                if (SC.none(groupName)) {
                  return ''; // No group and no user.
                } else {
                  return groupName; // Just a group.
                }
              } else {
                return '%@: %@'.fmt(groupName, userFullName); // Group and user.
              }
            })

        })

    *Note:* the number of parameters of `mixFunction` should match the number of paths provided.
    *Note:* the transform acts strictly as a one-way binding, working only in the one direction.

    @param {String...} the paths of source values that will be provided to the aggregate function.
    @param {Function} mixFunction the function that aggregates the values
  */
  mix: function() {
    var len = arguments.length - 1,
        paths = new Array(len);

    // Fast copy. The function is the last argument.
    for (var i = 0; i < len; i++) { paths[i] = arguments[i]; }

    return this._sc_mixImpl(paths, arguments[len]);
  },

  /**
    Adds a transform that will return YES if the value is equal to equalValue, NO otherwise.

      isVisibleBinding: SC.Binding.oneWay("MyApp.someController.title").equalTo(comparisonValue)

    Or:

      isVisibleBinding: SC.Binding.equalTo("MyApp.someController.title", comparisonValue)

    @param {String} fromPath from path or null
    @param {Object} equalValue the value to compare with
    @returns {SC.Binding} this
  */
  equalTo: function(fromPath, equalValue) {
    // Normalize arguments.
    if (equalValue === undefined) {
      equalValue = fromPath;
      fromPath = null;
    }

    return this.from(fromPath).transform(function(value, binding) {
       return value === equalValue;
     });
  },

  /** @private */
  toString: function () {
    var from = this._fromRoot ? "<%@>:%@".fmt(this._fromRoot, this._fromPropertyPath) : this._fromPropertyPath;

    var to = this._toRoot ? "<%@>:%@".fmt(this._toRoot, this._toPropertyPath) : this._toPropertyPath;

    var oneWay = this._oneWay ? '[oneWay]' : '';
    return "SC.Binding%@(%@ -> %@)%@".fmt(SC.guidFor(this), from, to, oneWay);
  }
};

/**
  Shorthand method to define a binding.  This is the same as calling:

        SC.binding(path) = SC.Binding.from(path)
*/
SC.binding = function (path, root) { return SC.Binding.from(path, root); };
