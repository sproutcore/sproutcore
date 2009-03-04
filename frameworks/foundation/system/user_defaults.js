// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2009 Sprout Systems, Inc. and contributors.
//            Portions ©2008-2009 Apple, Inc. All rights reserved.
// License:   Licened under MIT license (see license.js)
// ==========================================================================

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
    var ret= undefined ;
    
    // namespace keyname
    if (keyName.indexOf('/')) {
      var domain = this.get('appDomain') || 'app';
      keyName = [domain, keyName].join(':');
    } 
    
    var user = this.get('userDomain') || '' ;
    var userKeyName = [user,keyName].join('@');

    // look into recently written values
    if (this._written) ret = this._written[userKeyName];
    
    // attempt to read from localStorage
    var localStorage = window.localStorage ;
    if (!localStorage && window.globalStorage) {
      localStorage = window.globalStorage[window.location.hostname];
    }
    if (localStorage) {
      //console.log('userKeyName = %@ local=%@'.fmt(userKeyName, localStorage));
      ret = localStorage[["SC.UserDefaults",userKeyName].join('@')];
    }
    
    // if not found in localStorage, try to notify delegate
    var del =this.delegate ;
    if (del && del.userDefaultsNeedsDefault) {
      ret = del.userDefaultsNeedsDefault(this, keyName, userKeyName);
    }
    
    // if not found in localStorage or delegate, try to find in defaults
    if ((ret===undefined) && this._defaults) {
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
    // namespace keyname
    if (keyName.indexOf('/')) {
      var domain = this.get('appDomain') || 'app';
      keyName = [domain, keyName].join(':');
    } 
    
    var user = this.get('userDomain') || '' ;
    var userKeyName = [user,keyName].join('@');

    // save to local hash
    var written = this._written ;
    if (!written) written = this._written = {};
    written[userKeyName] = value ;
    
    // save to local storage
    var localStorage = window.localStorage ;
    if (!localStorage && window.globalStorage) {
      localStorage = window.globalStorage[window.location.hostname];
    }
    if (localStorage) {
      localStorage[["SC.UserDefaults",userKeyName].join('@')] = value;
    }
    
    // also notify delegate
    var del = this.delegate;
    if (del && del.userDefaultsDidChange) {
      del.userDefaultsDidChange(this, keyName, value, userKeyName);
    }
    
    return this ;
  },
  
  unknownProperty: function(key, value) {
    if (value === undefined) {
      return this.readDefault(key) ;
    } else {
      this.writeDefault(key, value);
      return value ;
    }
  }
  
});

/** global user defaults. */
SC.userDefaults = SC.UserDefaults.create();