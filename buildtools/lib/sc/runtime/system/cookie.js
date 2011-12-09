// ==========================================================================
// SC.Cookie
// ==========================================================================

/** @class
  
  Allows for easier handling of the document.cookie object. To create a cookie,
  simply call SC.Cookie.create. To retrieve a cookie, use SC.Cookie.find.
  Cookies are not added to document.cookie, which SC.Cookie.find uses, until you
  have called SC.Cookie#write.
  
  Heavy inspiration from the
  {@link <a href="http://plugins.jquery.com/project/cookie">jQuery cookie plugin</a>}.
  
  @extends SC.Object
  @since Sproutcore 1.0
  @author Colin Campbell
*/

SC.Cookie = SC.Object.extend({
  
  // ..........................................................
  // PROPERTIES
  //   
  
  /**
    The name of the cookie
    
    @property {String}
  */
  name: null,
  
  /**
    The value of the cookie
    
    @property {String}
  */
  value: '',
  
  /**
    Amount of time until the cookie expires. Set to -1 in order to delete the cookie.
    
    @property {Integer|SC.DateTime|Date}
  */
  expires: null,
  
  /**
    The value of the path atribute of the cookie (default: path of page that created the cookie).
    
    @property {String}
  */
  path: null,
  
  /**
    The value of the domain attribute of the cookie (default: domain of page that created the cookie).
    
    @property {String}
  */
  domain: null,
  
  /**
    If true, the secure attribute of the cookie will be set and the cookie transmission will
    require a secure protocol (like HTTPS).
    
    @property {Boolean}
  */
  secure: NO,
  
  /**
    Walk like a duck
    
    @property {Boolean}
    @isReadOnly
  */
  isCookie: YES,
  
  // ..........................................................
  // METHODS
  // 
  
  /**
    Sets SC.Cookie#expires to -1, which destroys the cookie.
  */
  destroy: function() {
    this.set('expires', -1);
    this.write();
    
    arguments.callee.base.apply(this, arguments); 
  },
  
  /**
    Writes this SC.Cookie to document.cookie and adds it to SC.Cookie collection. To find this
    cookie later, or on reload, use SC.Cookie.find.
    
    @see SC.Cookie.find
  */
  write: function() {
    var name = this.get('name'),
        value = this.get('value'),
        expires = this.get('expires'),
        path = this.get('path'),
        domain = this.get('domain'),
        secure = this.get('secure');
    
    var expiresOutput = '';
    if (expires && (SC.typeOf(expires) === SC.T_NUMBER || (SC.DateTime && expires.get && expires.get('milliseconds')) || SC.typeOf(expires.toUTCString) === SC.T_FUNCTION)) {
      var date;
      if (SC.typeOf(expires) === SC.T_NUMBER) {
        date = new Date();
        date.setTime(date.getTime()+(expires*24*60*60*1000));
      }
      else if (SC.DateTime && expires.get && expires.get('milliseconds')) {
        date = new Date(expires.get('milliseconds'));
      }
      else if (SC.typeOf(expires.toUTCString) === SC.T_FUNCTION) {
        date = expires;
      }
      
      if (date) {
        expiresOutput = '; expires=' + date.toUTCString();
      }
    }
    
    var pathOutput = path ? '; path=' + path : '';
    var domainOutput = domain ? '; domain=' + domain : '';
    var secureOutput = secure ? '; secure' : '';
    
    document.cookie = [name, '=', encodeURIComponent(value), expiresOutput, pathOutput, domainOutput, secureOutput].join('');
    
    return this;
  }
  
});

SC.Cookie.mixin(
  /** @scope SC.Cookie */ {
  
  /**
    Finds a cookie that has been stored
    
    @param {String} name The name of the cookie
    @returns SC.Cookie object containing name and value of cookie
  */
  find: function(name) {
    if (document.cookie && document.cookie != '') {
      var cookies = document.cookie.split(';');
      for (var i = 0; i < cookies.length; i++) {
        var cookie = String(cookies[i]).trim();
        if (cookie.substring(0, name.length + 1) === (name + "=")) {
          return SC.Cookie.create({
            name: name,
            value: decodeURIComponent(cookie.substring(name.length + 1))
          });
        }
      }
    }
    return null;
  }
  
});