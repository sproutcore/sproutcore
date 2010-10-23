// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2010 Strobe Inc.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================

/**
  @class
  
  ImageStores store images locally for quicker loading
  and offline use. You need to use a ImageStore subclass
  for actual storage, this provides some abstract implementation
  features.
  
  @author Colin Campbell (colin@strobecorp.com)
  @extends SC.Object
  @since SproutCore 1.5
*/
SC.ImageStore = SC.Object.extend(
/** @scope SC.ImageStore.prototype */ {

  /**
    Walk like a duck.
    
    @property {Boolean}
    @default YES
    @isReadOnly
  */
  isImageStore: YES,
  
  /**
    You provide a URL, target, and callback, which will get called once
    the image is fetched. The callback should have the following signature:
    
      function(url, image)
    
    where url is the URL provided to this function, and image will be null
    if the image is not found locally, or an Image object representing the
    image.
    
    @param {String} url The URL of the image to load from the store
    @param {Object} target The target of the callback
    @param {Function} callback The function to call once the image is fetched
    @returns YES if store will fetch image
  */
  load: function(url, target, callback) {
    return NO;
  },
  
  /**
    The image parameter is an Image object its src attribute set to either a URL, or a dataURI.
    The callback provided should have the following method signature:
    
      function(image)
    
    where image is an Image object that will be stored locally.
    
    @param {String} url The URL of the image to save
    @param {Image} image The image to save. It should be loaded already.
    @param {Object} target The target of the callback
    @param {Function} callback The function to call once the image is saved
    @returns YES if the image will be attempted to be saved locally.
  */
  save: function(url, image, target, callback) {
    return NO;
  }

});