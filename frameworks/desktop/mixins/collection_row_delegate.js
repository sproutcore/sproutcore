// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2009 Sprout Systems, Inc. and contributors.
//            Portions ©2008-2009 Apple Inc. All rights reserved.
// License:   Licened under MIT license (see license.js)
// ==========================================================================



/** 
  @namespace
  
  CollectionRowDelegates are consulted by SC.ListView and SC.TableView to 
  control the height of rows, including specifying custom heights for 
  specific rows.  
  
  You can implement a custom row height in one of two ways.  
  
*/
SC.CollectionRowDelegate = {

  /** walk like a duck */
  isCollectionRowDelegate: YES,
  
  /**
    Default row height.  Unless you implement some custom row height 
    support, this row height will be used for all items.
    
    @property
    @type Number
  */
  rowHeight: 18,

  /**
    Index set of rows that should have a custom row height.  If you need 
    certains rows to have a custom row height, then set this property to a 
    non-null value.  Otherwise leave it blank to disable custom row heights.
    
    @property
    @type SC.IndexSet
  */
  customRowHeightIndexes: null,
  
  /**
    Called for each index in the customRowHeightIndexes set to get the 
    actual row height for the index.  This method should return the default
    rowHeight if you don't want the row to have a custom height.
    
    The default implementation just returns the default rowHeight.
    
    @param {SC.CollectionView} view the calling view
    @param {Object} content the content array
    @param {Number} contentIndex the index 
    @returns {Number} row height
  */
  contentIndexRowHeight: function(view, content, contentIndex) {
    return this.get('rowHeight');    
  }
  
  
};
