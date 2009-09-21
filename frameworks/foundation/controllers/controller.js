// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2009 Sprout Systems, Inc. and contributors.
//            Portions ©2008-2009 Apple Inc. All rights reserved.
// License:   Licened under MIT license (see license.js)
// ==========================================================================

/**
  @class
  
  The controller base class provides some common functions you will need
  for controllers in your applications, especially related to maintaining
  an editing context.
  
  In general you will not use this class, but you can use a subclass such
  as ObjectController, TreeController, or ArrayController.
  
  h2. EDITING CONTEXTS
  
  One major function of a controller is to mediate between changes in the
  UI and changes in the model.  In particular, you usually do not want 
  changes you make in the UI to be applied to a model object directly.  
  Instead, you often will want to collect changes to an object and then
  apply them only when the user is ready to commit their changes.
  
  The editing contact support in the controller class will help you
  provide this capability.
  
  @extends SC.Object
  @since SproutCore 1.0
*/
SC.Controller = SC.Object.extend(
/** @scope SC.Controller.prototype */ {
  
  /**
    Makes a controller editable or not editable.  The SC.Controller class 
    itself does not do anything with this property but subclasses will 
    respect it when modifying content.
    
    @property {Boolean}
  */
  isEditable: YES
  
});
