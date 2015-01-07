// ==========================================================================
// Project:   SproutCore Costello - Property Observing Library
// Copyright: ©2006-2011 Strobe Inc. and contributors.
//            Portions ©2008-2011 Apple Inc. All rights reserved.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================

/** @namespace
  The `SC.ObservableProtocol` protocol defines the properties and methods that you may implement
  in your `SC.Observable` consumers (i.e. `SC.Object`) in order to access additional observer
  functionality. They will be used if defined but are not required for observing to work.

  *Note: Do not mix `SC.ObservableProtocol` into your classes. As a protocol, it exists only for
  reference sake. You only need define any of the properties or methods listed below in order to use
  this protocol.*
*/
SC.ObservableProtocol = {

  /**
    Generic property observer called whenever a property on the receiver changes.

    If you need to observe a large number of properties on your object, it
    is sometimes more efficient to implement this observer only and then to
    handle requests yourself.  Although this observer will be triggered
    more often than an observer registered on a specific property, it also
    does not need to be registered which can make it faster to setup your
    object instance.

    You will often implement this observer using a switch statement on the
    key parameter, taking appropriate action.

    @param observer {null} no longer used; usually null
    @param target {Object} the target of the change.  usually this
    @param key {String} the name of the property that changed
    @param value {Object} the new value of the property.
    @param revision {Number} a revision you can use to quickly detect changes.
    @returns {void}
  */
  propertyObserver: function(observer,target,key,value, revision) {

  }

};
