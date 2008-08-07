// ========================================================================
// SproutCore
// copyright 2006-2008 Sprout Systems, Inc.
// ========================================================================

/**
  @namespace
  
  Support methods for the Delegate design pattern.
  
  The Delegate design pattern makes it easy to delegate a portion of your 
  application logic to another object.  This is most often used in views to 
  delegate various application-logic decisions to controllers in order to 
  avoid having to bake application-logic directly into the view itself.
  
  The methods provided by this mixin make it easier to implement this pattern
  but they are not required to support delegates.
  
  h2. The Pattern
  
  The delegate design pattern typically means that you provide a property,
  usually ending in "delegate", that can be set to another object in the 
  system.  
  
  When events occur or logic decisions need to be made that you would prefer
  to delegate, you can call methods on the delegate if it is set.  If the 
  delegate is not set, you should provide some default functionality instead.
  
  Note that typically delegates are not observable, hence it is not necessary
  to use get() to retrieve the value of the delegate.
  
*/
SC.DelegateSupport = {  
  
  /**
    Invokes the named method on the delegate that you pass.  If no delegate
    is defined or if the delegate does not implement the method, then a 
    method of the same name on the receiver will be called instead.  
    
    You can pass any arguments you want to pass onto the delegate after the
    delegate and methodName.
    
    @param {Object} delegate a delegate object.  May be null.
    @param {String} methodName a method name
    @param {*} args (OPTIONAL) any additional arguments
    
    @returns value returned by delegate
  */
  invokeDelegateMethod: function(delegate, methodName, args) {
    args = SC.$A(arguments); args = args.slice(2, args.length) ;
    if (!delegate || !delegate[methodName]) delegate = this ;
    return delegate[methodName].apply(delegate, args) ;
  },
  
  /**
    Gets the named property from the delegate if the delegate exists and it
    defines the property.  Otherwise, gets the property from the receiver.
    
    @param {Object} delegate the delegate or null
    @param {String} key the property to get.
  */
  getDelegateProperty: function(delegate, key) {
    return (delegate && (delegate[key] != null)) ? delegate.get(key) : this.get(key) ;
  }
  
};
