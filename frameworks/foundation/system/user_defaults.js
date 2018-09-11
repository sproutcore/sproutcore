// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2011 Strobe Inc. and contributors.
//            Portions ©2008-2011 Apple Inc. All rights reserved.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================
/*globals ie7userdata openDatabase*/
/**
  @class

  The UserDefaults object provides an easy way to store user preferences in
  your application on the local machine.  You use this by providing built-in
  defaults using the SC.userDefaults.defaults() method.  You can also
  implement the UserDefaultsDelegate interface to be notified whenever a
  default is required.

  You should also set the userDomain property on the defaults on page load.
  This will allow the UserDefaults application to store/fetch keys from
  localStorage for the correct user.

  You can also set an appDomain property if you want.  This will be
  automatically prepended to key names with no slashes in them.

  SC.userDefaults.getPath("global:contactInfo.userName");

  @extends SC.Object
  @since SproutCore 1.0
*/
SC.UserDefaults = SC.Object.extend(/** @scope SC.UserDefaults.prototype */ {

  ready: NO,

  /**
    the default domain for the user.  This will be used to store keys in
    local storage.  If you do not set this property, the wrong values may be
    returned.
  */
  userDomain: null,

  /**
    The default app domain for the user.  Any keys that do not include a
    slash will be prefixed with this app domain key when getting/setting.
  */
  appDomain: null,

  /** @private
    Defaults.  These will be used if not defined on localStorage.
  */
  _defaults: null,

  _safari3DB: null,

  /**
    Invoke this method to set the builtin defaults.  This will cause all
    properties to change.
  */
  defaults: function(newDefaults) {
    this._defaults = newDefaults ;
    this.allPropertiesDidChange();
  },

  /**
    Attempts to read a user default from local storage.  If not found on
    localStorage, use the the local defaults, if defined.  If the key passed
    does not include a slash, then add the appDomain or use "app/".

    @param {String} keyName
    @returns {Object} read value
  */
  readDefault: function(keyName) {
    // Note: different implementations of localStorage may return 'null' or
    // may return 'undefined' for missing properties so use SC.none() to check
    // for the existence of ret throughout this function.
    var ret, userKeyName, localStorage, key, errorMessage;

    // namespace keyname
    keyName = this._normalizeKeyName(keyName);
    userKeyName = this._userKeyName(keyName);

    // look into recently written values
    if (this._written) { ret = this._written[userKeyName]; }

    try {
      localStorage = window.localStorage;
      if (!localStorage && window.globalStorage) {
        localStorage = window.globalStorage[window.location.hostname];
      }
    }catch(e){
      errorMessage = "Failed accessing localStorage. "+e;
      this._logError(keyName, null, userKeyName, errorMessage, e);
    }
    if (localStorage) {
      key=["SC.UserDefaults",userKeyName].join('-at-');
      ret = localStorage[key];
      if (!SC.none(ret)) {
        try { ret = SC.json.decode(ret); }
        catch(ex) {}
      }
    }

    // if not found in localStorage, try to notify delegate
    var del = this.delegate ;
    if (del && del.userDefaultsNeedsDefault) {
      ret = del.userDefaultsNeedsDefault(this, keyName, userKeyName);
    }

    // if not found in localStorage or delegate, try to find in defaults
    if (SC.none(ret) && this._defaults) {
      ret = this._defaults[userKeyName] || this._defaults[keyName];
    }

    return ret ;
  },

  /**
    Attempts to write the user default to local storage or at least saves them
    for now.  Also notifies that the value has changed.

    @param {String} keyName
    @param {Object} value
    @returns {SC.UserDefault} receiver
  */
  writeDefault: function(keyName, value) {
    var userKeyName, written, localStorage, key, del, errorMessage;

    keyName = this._normalizeKeyName(keyName);
    userKeyName = this._userKeyName(keyName);

    // save to local hash
    written = this._written ;
    if (!written) { written = this._written = {}; }
    written[userKeyName] = value ;

    try {
      localStorage = window.localStorage;
      if (!localStorage && window.globalStorage) {
        localStorage = window.globalStorage[window.location.hostname];
      }
    }catch(e){
      errorMessage = "Failed accessing localStorage. "+e;
      this._logError(keyName, value, userKeyName, errorMessage, e);
    }

    key=["SC.UserDefaults",userKeyName].join('-at-');
    if (localStorage) {
      var encodedValue = SC.json.encode(value);
      try{
        localStorage[key] = encodedValue;
      }catch(e){
        errorMessage = "Failed writing to localStorage. "+e;
        this._logError(keyName, value, userKeyName, errorMessage, e);
      }
    }

    // also notify delegate
    del = this.delegate;
    if (del && del.userDefaultsDidChange) {
      del.userDefaultsDidChange(this, keyName, value, userKeyName);
    }

    return this ;
  },

  /**
    Removed the passed keyName from the written hash and local storage.

    @param {String} keyName
    @returns {SC.UserDefaults} receiver
  */
  resetDefault: function(keyName) {
    var fullKeyName, userKeyName, written, localStorage, key, errorMessage;
    fullKeyName = this._normalizeKeyName(keyName);
    userKeyName = this._userKeyName(fullKeyName);

    this.propertyWillChange(keyName);
    this.propertyWillChange(fullKeyName);

    written = this._written;
    if (written) delete written[userKeyName];

    try {
      localStorage = window.localStorage;
      if (!localStorage && window.globalStorage) {
        localStorage = window.globalStorage[window.location.hostname];
      }
    }catch(e){
      errorMessage = "Failed accessing localStorage. "+e;
      this._logError(keyName, null, userKeyName, errorMessage, e);
    }

    key=["SC.UserDefaults",userKeyName].join('-at-');

    if (localStorage) {
      // In case error occurs while deleting local storage in any browser,
      // do not allow it to propagate further
      try{
        delete localStorage[key];
      } catch(e) {
        errorMessage = 'Deleting local storage encountered a problem. '+e;
        this._logError(keyName, null, userKeyName, errorMessage, e);
      }
    }


    this.propertyDidChange(keyName);
    this.propertyDidChange(fullKeyName);
    return this ;
  },

  /**
    Is called whenever you .get() or .set() values on this object

    @param {Object} key
    @param {Object} value
    @returns {Object}
  */
  unknownProperty: function(key, value) {
    if (value === undefined) {
      return this.readDefault(key) ;
    } else {
      this.writeDefault(key, value);
      return value ;
    }
  },

  /**
    Normalize the passed key name.  Used by all accessors to automatically
    insert an appName if needed.
  */
  _normalizeKeyName: function(keyName) {
    if (keyName.indexOf(':')<0) {
      var domain = this.get('appDomain') || 'app';
      keyName = [domain, keyName].join(':');
    }
    return keyName;
  },

  /**
    Builds a user key name from the passed key name
  */
  _userKeyName: function(keyName) {
    var user = this.get('userDomain') || '(anonymous)' ;
    return [user,keyName].join('-at-');
  },

  _domainDidChange: function() {
    var didChange = NO;
    if (this.get("userDomain") !== this._scud_userDomain) {
      this._scud_userDomain = this.get('userDomain');
      didChange = YES;
    }

    if (this.get('appDomain') !== this._scud_appDomain) {
      this._scud_appDomain = this.get('appDomain');
      didChange = YES;
    }

    if (didChange) this.allPropertiesDidChange();
  }.observes('userDomain', 'appDomain'),

  init: function() {
    sc_super();

    // Increment the jQuery ready counter, so that SproutCore will
    // defer loading the app until the user defaults are available.
    jQuery.readyWait++;

    if(SC.userDefaults && SC.userDefaults.get('dataHash')){
      var dh = SC.userDefaults.get('dataHash');
      if (dh) this.dataHash=SC.userDefaults.get('dataHash');
    }
    this._scud_userDomain = this.get('userDomain');
    this._scud_appDomain  = this.get('appDomain');

    jQuery.ready(true);
  },

  // Private method for logging errors
  _logError: function(keyName, value, userKeyName, errorMessage, errorObject) {
    if (!errorMessage && errorObject) {
      errorMessage = errorObject.name + ': ' + errorObject.message;
    }

    SC.Logger.error(errorMessage);

    // also notify delegate
    var del = this.delegate;
    if (del && del.userDefaultsDidError) {
      var e = SC.Error.create({
        message: errorMessage,
        errorObject: errorObject
      })
      del.userDefaultsDidError(this, keyName, value, userKeyName, e);
    }
  },

  //Private methods to use if user defaults uses the database in safari 3
  _killTransaction: function(transaction, error){
    return true; // fatal transaction error
  },

  _nullDataHandler: function(transaction, results){}
});

/** global user defaults. */
SC.userDefaults = SC.UserDefaults.create();
