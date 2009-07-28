// ========================================================================
// SproutCore -- JavaScript Application Framework
// Copyright ©2006-2008, Sprout Systems, Inc. and contributors.
// Portions copyright ©2008 Apple Inc.  All rights reserved.
// ========================================================================

require('system/drag') ;


/**
  @namespace

  This mixin can be used to implement a dynamic data source for a drag 
  operation.  You can return a set of allowed data types and then the 
  method will be used to actually get data in that format when requested.
*/
SC.DragDataSource = {

  /** @property
    Implement this property as an array of data types you want to support
    for drag operations.
  */
  dragDataTypes: [],

  /**
    Implement this method to return the data in the format passed.  Return
    null if the requested data type cannot be generated.
  
    @param {SC.Drag} drag The Drag instance managing this drag.
    @param {Object} dataType The proposed dataType to return.  This will 
      always be one of the data types declared in dragDataTypes.
    
    @returns The data object for the specified type
  */
  dragDataForType: function(drag, dataType) { return null; }
  
};


