// ==========================================================================
// Project:   SproutCore Costello - Property Observing Library
// Copyright: ©2006-2011 Strobe Inc. and contributors.
//            Portions ©2008-2011 Apple Inc. All rights reserved.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================

/** @namespace
  The `SC.ObjectMixinProtocol` protocol defines the properties and methods that you may implement
  in your mixin objects (i.e. JavaScript Objects passed to SC.Object's `extend` or `create`) in
  order to access additional functionality when used. They will be used if defined but are not
  required.

  # What is a Mixin?

  A mixin, in this context, is a simple JavaScript Object that can be used to provide extra
  functionality to SC.Object subclasses. While you can mix JavaScript Objects into "classes" (i.e.
  using `SC.mixin(SomeClass)`), this particular protocol only refers to mixins in the context of
  use with an SC.Object "instance" (i.e. SC.Object.create({ ... })).

  For example, in order to share a method between two different classes of object, we can use a
  mixin object that both will consume,

      // Common default properties and shared methods which our different classes may consume.
      MyApp.MyMixin = {
        a: true,

        aFunc: function () {
          this.set('a', false);
        },

        b: [], // SHARED OBJECT!

        c: {} // SHARED OBJECT!
      };

      // Two different object types, which both need the functionality provided by MyApp.MyMixin.
      MyApp.ObjectType1 = SC.Object.extend(MyApp.MyMixin);
      MyApp.ObjectType2 = SC.Object.extend();

      obj1 = MyApp.ObjectType1.create();
      obj2 = MyApp.ObjectType2.create(MyApp.MyMixin);

      // Some proofs.
      // 1. The default properties are copied over to the new objects.
      obj1.get('a'); // true <--
      obj2.get('a'); // true <--

      // 2. The primitive properties are unique to each object.
      obj1.set('a', false);
      obj1.get('a'); // false <--
      obj2.get('a'); // true <--

      // 3. The methods are copied over to the new objects.
      obj1.aFunc; // function () { ... } <--
      obj2.aFunc; // function () { ... } <--

      // 4. The functions/objects are shared between objects.
      obj1.aFunc === MyApp.MyMixin.aFunc; // true <--
      obj1.aFunc === obj2.aFunc; // true <--
      obj1.b === obj2.b; // true <-- !! Beware of modifying this object !!
      obj1.c === obj2.c; // true <-- !! Beware of modifying this object !!

  In this example, we used a mixin to share functionality between two classes, which is very easily
  achieved. There is one issue, that has been known to trip up developers, which should be
  highlighted. If you set default *Objects* (e.g. [] or {}) in a mixin, these same Objects will be
  shared between all of the mixin's consumers.

  If you want to set a default Object that is unique to each consumer of the mixin, a better
  practice is to set it in `initMixin()` or to check for its existence the first time it is used
  and only create it then.

  *Note: Do not mix `SC.ObjectMixinProtocol` into your classes. As a protocol, it exists only for
  reference sake. You only need define any of the properties or methods listed below in order to use
  this protocol.*
*/
SC.ObjectMixinProtocol = {

  /**
    This *optional* method is called to further initialize the consumer of the mixin when it is
    created. When a mixin (i.e. JavaScript Object) is used to extend an `SC.Object` subclass, we may
    want to perform additional set up of the `SC.Object` instance when it is created according to
    the needs of the mixin. In order to support this, `SC.Object` will call this method,
    `initMixin`, *if implemented*, on each mixin in the order that they were added.

    For example, if we use two mixins that both initialize the same value, the last mixin added
    would win,

        myObject = SC.Object.create(
          // First mixin.
          {
            initMixin: function () {
              this.set('a', true);
            }
          },

          // Second mixin.
          {
            initMixin: function () {
              this.set('a', false);
            }
          });

        myObject.get('a'); // false <--

    This was just an example to illustrate the order in which `initMixin` is called. It is rare
    that mixins will collide with each other, but it is something to bear in mind when making heavy
    use of mixins.

    Note, that unlike the similar `init()` method of `SC.Object`, you do *not* need to call
    `sc_super` in `initMixin`.
  */
  initMixin: function () {},

  /**
    This *optional* method is called to further de-initialize the consumer of the mixin when it is
    destroyed. When a mixin (i.e. JavaScript Object) is used to extend an `SC.Object` subclass, we
    may want to perform additional teardown of the `SC.Object` instance when it is destroyed
    according to the needs of the mixin (e.g. to clean up objects that the mixin code initialized
    and that may otherwise lead to memory leaks). In order to support this, `SC.Object` will call
    this method, `destroyMixin`, *if implemented*, on each mixin in the order that they were
    initially added.

    For example, if we use two mixins that both de-initialize the same value, the last mixin added
    would win,

        myObject = SC.Object.create(
          // Mixin.
          {
            initMixin: function () {
              // Created extra object for some purpose.
              this.set('anObject', SC.Object.create());
            },

            destroyMixin: function () {
              // Clean up extra object that the mixin is responsible for.
              var anObject = this.get('anObject');
              anObject.destroy();
              this.set('anObject', null);
            }
          });

        myObject.get('a'); // false <--

    Note, that unlike the similar `destroy()` method of `SC.Object`, you do *not* need to call
    `sc_super` in `destroyMixin`.
  */
  destroyMixin: function () {}

};
