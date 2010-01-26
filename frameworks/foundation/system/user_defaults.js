// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2009 Sprout Systems, Inc. and contributors.
//            Portions ©2008-2009 Apple Inc. All rights reserved.
// License:   Licened under MIT license (see license.js)
// ==========================================================================
/*globals ie7userdata */
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
    var ret= undefined, userKeyName, localStorage, key, del;
    
    // namespace keyname
    keyName = this._normalizeKeyName(keyName);
    userKeyName = this._userKeyName(keyName);

    // look into recently written values
    if (this._written) ret = this._written[userKeyName];
    
    // attempt to read from localStorage
    
    if(SC.browser.msie=="7.0"){
       localStorage=ie7userdata;
       try{
         localStorage.load("SC.UserDefaults");
       }catch(e){}
    }else{
       localStorage = window.localStorage ;
       if (!localStorage && window.globalStorage) {
         localStorage = window.globalStorage[window.location.hostname];
       }
    }
    if (localStorage) {
      key=["SC.UserDefaults",userKeyName].join('-at-');
      if(SC.browser.msie=="7.0"){
        ret=localStorage.getAttribute(key.replace(/\W/gi, ''));        
      }else{
        ret = localStorage[key];
      }
      if (!SC.none(ret)) {
        try {
          ret = SC.json.decode(ret);
        } 
        catch(ex) {
          ret = undefined;
        }
      } else ret = undefined;
    }
    
    // if not found in localStorage, try to notify delegate
    del =this.delegate ;
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
    var userKeyName, written, localStorage, key, del;
    
    keyName = this._normalizeKeyName(keyName);
    userKeyName = this._userKeyName(keyName);
    
    // save to local hash
    written = this._written ;
    if (!written) written = this._written = {};
    written[userKeyName] = value ;
    
    // save to local storage
    
    if(SC.browser.msie=="7.0"){
       localStorage=ie7userdata;
    }else{
       localStorage = window.localStorage ;
       if (!localStorage && window.globalStorage) {
         localStorage = window.globalStorage[window.location.hostname];
       }
    }
    key=["SC.UserDefaults",userKeyName].join('-at-');
    if (localStorage) {
      var encodedValue = SC.json.encode(value);
      if(SC.browser.msie=="7.0"){
        localStorage.setAttribute(key.replace(/\W/gi, ''), encodedValue);
        localStorage.save("SC.UserDefaults");
      }else{
        localStorage[key] = encodedValue;
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
    var fullKeyName, userKeyName, written, localStorage, key;
    fullKeyName = this._normalizeKeyName(keyName);
    userKeyName = this._userKeyName(fullKeyName);
    
    this.propertyWillChange(keyName);
    this.propertyWillChange(fullKeyName);
    
    written = this._written;
    if (written) delete written[userKeyName];
    
    if(SC.browser.msie=="7.0"){
       localStorage=ie7userdata;
    }else{
       localStorage = window.localStorage ;
       if (!localStorage && window.globalStorage) {
         localStorage = window.globalStorage[window.location.hostname];
       }
    }

    key=["SC.UserDefaults",userKeyName].join('-at-');

    if (localStorage) {
      if(SC.browser.msie=="7.0"){
        localStorage.setAttribute(key.replace(/\W/gi, ''), null);
        localStorage.save("SC.UserDefaults");
      }else{
        delete localStorage[key];
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
    this._scud_userDomain = this.get('userDomain');
    this._scud_appDomain  = this.get('appDomain');
    if(SC.browser.msie=="7.0"){
      var el = document.createElement('div');
      
      // set element properties
      el.id = "ie7userdata";
      el.style.display = 'none';
      el.addBehavior('#default#userData');
      
      // append element to body
      document.body.appendChild(el);
    }
   // this.set('ready', YES);
  },
  
  readyCallback: function(ob, func){
    this.func = func;
    this.ob = ob;
  },
  
  readyChanged: function(){
    if(this.get('ready')){
      console.log('ready changed');
      var f = this.get('func');
      if(f) f.apply(this.get('ob'));
    }
  }.observes('ready')
  
  
  
});

/** global user defaults. */
SC.userDefaults = SC.UserDefaults.create();