// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2010 Strobe Inc.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================

sc_require('system/platform');

/**
  @class
  
  Handles the loading of images into a local database,
  allowing them to be available offline.
  
  @author Colin Campbell (colin@strobecorp.com)
  @extends SC.Object
  @since SproutCore 1.5
*/
SC.imageStore = SC.Object.create(
/** @scope SC.imageStore.prototype */ {

  /**
    @property {Boolean}
    @default NO
  */
  debug: NO,
  
  /** @private
    A canvas element that is rendered offscreen
    and is used to generate the image data
  */
  _canvas: null,
  
  /** @private
    The database to use
  */
  _db: null,
  
  // ..........................................................
  // Saving and loading
  // 
  
  /**
    Loads an image from the database. You provide a URL, target, and callback,
    which will get called once the image is fetched. The callback should have
    the following signature:
    
      function(url, image)
    
    where url is the URL provided to this function, and image will be null
    if the image is not found in the database, or an Image object with its
    width and height set, and its src attribute set to the data URI of the
    saved image.
    
    @param {String} url The URL of the image to load from the store
    @param {Object} target The target of the callback
    @param {Function} callback The function to call once the image is fetched
    @returns YES if transaction is executed, NO otherwise
  */
  load: function(url, target, callback) {
    var db = this._retrieveDatabase(),
        image = null, that = this,
        debug = this.get('debug'),
        result;
    
    if (!db) return NO;
    
    if (debug) SC.Logger.log("[SC.imageStore#load]", url);
    
    this._setupTable(this, function() {
      db.transaction(function(t) {
        t.executeSql(
          'SELECT * FROM images WHERE url = ?;',
          [String(url)],
          function(transaction, results) {
            if (debug) SC.Logger.log("[SC.imageStore#load] loaded results", results.rows.length);
            if (results.rows.length > 0) {
              result = results.rows.item(0);
              
              image = new Image();
              image.src = result.value; // use the data uri
              image.width = result.width;
              image.height = result.height;
            }
            if (typeof callback === SC.T_FUNCTION) {
              SC.RunLoop.begin();
              callback.call(target, url, image);
              SC.RunLoop.end();
            }
          },
          that._errorHandler
        );
      }, this._transactionErrorHandler);
    });
    
    return YES;
  },
  
  /**
    Saves an image to the image store. The image parameter is an Image object its src
    attribute set to either a URL, or a dataURI. If it is a URL, due to browser security
    restrictions, it must be from the same origin as the application is running on. If its
    a dataURI, that data will be used when saving to the database, rather than rendering
    the image into a canvas and extracting the dataURI that way. The callback provided
    should have the following method signature:
    
      function(image)
    
    where image will be the actual stored image, with its src property set to the dataURI
    and its width and height set to the stored values.
    
    @param {String} url The URL of the image to save
    @param {Image} image The image to save. It should be loaded already.
    @param {Object} target The target of the callback
    @param {Function} callback The function to call once the image is saved
    @returns YES if transaction is executed, NO otherwise
  */
  save: function(url, image, target, callback) {
    var db = this._retrieveDatabase(),
        debug = this.get('debug'),
        that = this,
        canvas, context, data, storedImage;
    
    if (!db || !image) return NO;
    
    if (image.src.indexOf('data:') === -1) {
      canvas = this._retrieveCanvasElement();
      canvas.width = image.width;
      canvas.height = image.height;
      canvas.style.left = "-" + String(image.width + 20) + "px";
      context = canvas.getContext('2d');
      context.drawImage(image, 0, 0);
      
      try {
        data = canvas.toDataURL("image/png");
      } catch (e) {
        if (e.code === 18) {
          SC.Logger.warn("SC.imageStore tried to save image from different origin: %@".fmt(url));
        } else {
          console.error(e);
        }
        return NO;
      }
    } else {
      data = image.src;
    }
    
    if (debug) SC.Logger.log("[SC.imageStore#save]", url);
    
    this._setupTable(this, function() {
      db.transaction(function(t) {
        t.executeSql(
          'REPLACE INTO images (url, width, height, value) VALUES (?, ?, ?, ?);',
          [url, image.width, image.height, data],
          function(transaction, results) {
            if (debug) SC.Logger.log("[SC.imageStore#save] saved %@".fmt(url));
            storedImage = new Image();
            storedImage.src = data;
            storedImage.width = image.width;
            storedImage.height = image.height;
            
            if (typeof callback === SC.T_FUNCTION) callback.call(target, storedImage);
          },
          that._errorHandler
        );
      }, this._transactionErrorHandler);
    });
    
    return YES;
  },
  
  nuke: function() {
    var db = this._retrieveDatabase(),
        debug = this.get('debug'),
        that = this;
    
    if (!db) return NO;
    
    db.transaction(function(t) {
      t.executeSql(
        'DROP TABLE "images"',
        [],
        function() {
          if (debug) SC.Logger.log("[SC.imageStore#nuke] dropped the images table");
        },
        that._errorHandler
      );
    }, this._transactionErrorHandler);
    
    return YES;
  },
  
  
  // ..........................................................
  // Internal support
  // 
  
  /** @private
    Returns the database object
    
    @returns the database
  */
  _retrieveDatabase: function() {
    if (!SC.platform.supportsWebSQLDatabase) return NO;
    
    var db = this._db;
    if (db) return db;
    
    try {
      db = window.openDatabase('SCImageStore', '1.5', 'SCIS', 65536);
    } catch (e) {
      console.error(e);
    }
    
    this._db = db;
    return db;
  },
  
  _setupTable: function(target, callback) {
    var db = this._retrieveDatabase();
    
    if (!db) return;
    
    db.transaction(function(t) {
      t.executeSql(
        'CREATE TABLE IF NOT EXISTS images (url TEXT NOT NULL PRIMARY KEY, width TEXT NOT NULL, height TEXT NOT NULL, value BLOB NOT NULL);',
        [],
        function(transaction, results) {
          if (typeof callback === SC.T_FUNCTION) callback.call(target);
        },
        this._errorHandler
      );
    }, this._transactionErrorHandler);
  },
  
  _errorHandler: function(transaction, error) {
    SC.Logger.error('Error: %@ (code %@)'.fmt(error.message, error.code));
    return false;
  },
  
  _transactionErrorHandler: function(error) {
    SC.Logger.error('Transaction error: %@ (code %@)'.fmt(error.message, error.code));
    return false;
  },
  
  _createCanvasElement: function() {
    var canvas = document.createElement("canvas");
    canvas.style = 'left: -1px;';
    canvas.id = "sc-image-store-" + SC.guidFor(this);
    document.body.appendChild(canvas);
    return canvas;
  },
  
  _retrieveCanvasElement: function() {
    var canvas = this._canvas;
    if (canvas) return canvas;
    canvas = this._canvas = this._createCanvasElement();
    return canvas;
  }

});