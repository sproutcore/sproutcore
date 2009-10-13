// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2009 Sprout Systems, Inc. and contributors.
//            Portions ©2008-2009 Apple Inc. All rights reserved.
// License:   Licened under MIT license (see license.js)
// ==========================================================================

/**
  @class
  
  Routes makes it possible to load a location in the browser.
  
  This is useful when application need to change state depending upon the URL 
  change. Applications can support deep-linking using routes, which means user 
  can type specific URL to see certain state of the app e.g.
  http://localhost:4020/routes_demo#Documents/Photographs
  
  To use Routes, first add routes by using SC.routes.add(route, target, 
  method).
  
  - *route* - Route is the part of the URL that come after hash (#).
  - *target* - Object whose route handler needs to be invoked.
  - *method* - Method that is the route handler.
  
  This registers the route to the routes system. When application's URL 
  matches a registered route, system triggers the route handler. Route handler 
  should contain the app logic to bring the app to the required state.
  
  Second thing to do with routes is to set location. Whenever you want to 
  register any URL location in browser history you can use 
  SC.routes.set('location', 'some_path'); 
  
  This will register the URL to browser history and also change the URL of the 
  application. Ideally when you set the location you would like route handler 
  to get invoked. You should have a route registered to match this pattern of 
  the location.
  
  h2. Example
  
  {{{
    SC.routes.add(':', RoutesDemo, 'routeHandler');
  }}}
  
  This route would match any URL change. Whatever comes after # would get 
  passed as parameter. RouteDemo is the object that contains method 
  'routeHandler'.
  
  {{{
    SC.routes.set('location', 'Documents/Photographs');
  }}}
  
  Doing this changes the location to #Documents/Photographs. Part after #, 
  Documents/Photographs in this case, gets passed as parameter to route 
  handler.
  
  If your url has a route, the corresponding routeHandler is fired only after 
  the app's main function is executed. If you need the routeHandlers to be fired
  much before running main(), then you probably read the location hash manually, 
  possibly in the bootstrap of your app and not use routes.

  @extends SC.Object
  @since SproutCore 1.0
*/
SC.routes = SC.Object.create(
/** @scope SC.routes.prototype */ {
  
  // set this property to your current app lication
  location: function(key,value) {
    if (value !== undefined) {
      if (value === null) value = '' ;
      
      // convert an object hash to a string, if it was passed.
      if (typeof(value) == "object") {
        
        // get the original route and any params
        var parts = value.route ? value.route.split('&') : [''] ;
        var route = parts.shift() ;
        var params = {} ;
        parts.forEach(function(p) {
          var bits = p.split('=') ;
          params[bits[0]] = bits[1] ;
        }) ;
        
        // overlay any params passed in the object.
        for(key in value) {
          if (!value.hasOwnProperty(key)) continue ;
          if (key != 'route') {
            params[key] = encodeURIComponent(''+value[key]) ;
          }
        }
        
        // now build params.
        parts = [route] ;
        for(key in params) {
          if (!params.hasOwnProperty(key)) continue ;
          parts.push([key,params[key]].join('=')) ;          
        }
        
        // and combine.
        value = parts.join('&') ;
      }
      
      if (this._location != value) {
        this._location = value ;
        this._setWindowLocation(value) ;
        //this.gotoRoute(value) ;
      }
    }
    return this._location ;
  }.property(),
  
  /**
    Ensures we are at the current route location.
  */
  ping: function() { 
    if (!this._didSetupHistory) {
      this._didSetupHistory = true ;
      this._setupHistory() ;
    }
    this._checkWindowLocation(); 
  },
  
  /**
    Register a route here.  Routes have the following format:
    
    static/route/path -- matches this path only.
    static/route/:path -- matches any static/route, :path passed as param.
    static/ *route -- matches any static, route gets rest of URL.
    
    parameters can also be passed using &.
    static/route&param1=value&param2=value2
    
    @param {string} route
    @param {Object} target
    @param {Function or String} method or method name on target
    @returns {SC.routes} receiver
  */
  add: function(route, target, method) {
    // normalize the target/method
    if (method===undefined && SC.typeOf(target) === SC.T_FUNCTION) {
      method = target; target = null ;
    } else if (SC.typeOf(method) === SC.T_STRING) {
      method = target[method] ;
    }
    
    var parts = route.split('/') ;
    if (!this._routes) this._routes = SC.routes._Route.create() ;
    this._routes.addRoute(parts, target, method) ;
    return this;
  },
  
  /**
    Eval routes.
    
    @param {String} route
  */
  gotoRoute: function(route) {
    var params = {},
        parts, routeHandler, target, method ;
    
    // save this route for window location sensing
    this._lastRoute = route ;
    
    // step 1: split out parameters
    parts = route.split('&') ;
    if (parts && parts.length > 0) {
      route = parts.shift() ;
      parts.forEach(function(part) {
        var param = part.split('=') ;
        if (param && param.length > 1) params[param[0]] = decodeURIComponent(param[1]) ;
      }) ;
    } else route = '' ;
    
    // step 2: split our route parts
    parts = route.split('/') ;
    
    // step 3: evaluate route.
    if (!this._routes) this._routes = SC.routes._Route.create() ;
    
    routeHandler = this._routes.functionForRoute(parts,params) ;
    
    if (routeHandler) {
      target = routeHandler._target;
      method = routeHandler._method;
      if (method) method.call(target, params);
    }
      //else console.log('could not find route for: "'+route+'"') ;
  },
  
  /** @private */
  init: function() {
    arguments.callee.base.call(this) ;
    if (SC.browser.isSafari && !(SC.browser.safari >= 3)) {
      SC.mixin(this,this.browserFuncs.safari) ;  
    } else if (SC.browser.isIE) {
      SC.mixin(this,this.browserFuncs.ie) ;  
    } else if (SC.browser.isMozilla) {
      SC.mixin(this,this.browserFuncs.firefox);
    }
    this._didSetupHistory = false ;
  },
  
  // use this method instead of invokeLater() to check windowLocation since
  // we don't want to trigger runLoops.
  invokeCheckWindowLocation: function(after) {
    var f = this.__checkWindowLocation, that = this;
    if (!f) {
      f = this.__checkWindowLocation = function() {
        that._checkWindowLocation();
      };
    }
    setTimeout(f, after);
  },
  
  /** @private
    _checkWindowLocation and _setWindowLocation are implemented separately for
    each browser.  Below are the implementations, which get copied during init.
  */
  browserFuncs: {
    
    // for Safari2 and earlier.
    safari: {
      
      _setupHistory: function() {
        // get initial cloc.
        var cloc = location.hash ;
        cloc = (cloc && cloc.length > 0) ? cloc.slice(1,cloc.length) : '' ;
        this._cloc = cloc ;
        
        // create back stack.
        this._backStack = [] ;
        this._backStack.length = history.length ;
        this._backStack.push(cloc) ;
        
        // create forward stack.
        this._forwardStack = [] ;
        
        this.invokeCheckWindowLocation(1000) ;
      },
      
      _checkWindowLocation: function() { 
        // The way we know the user has moved forward or back in the history 
        // is when the length of the history array no longer matched our own 
        // copy of the history. However, when we first change locations, it 
        // takes a little while for Safari to catch up.  So what we do instead 
        // is first check to see if Safari's length has changed from its last 
        // known length and only then check for a delta.
        var historyDidChange = (history.length - this._lastLength) !== 0;
        var delta = (historyDidChange) ? (history.length - this._backStack.length) : 0 ;
        this._lastLength = history.length ;
        
        if (historyDidChange) console.log('historyDidChange') ;
        
        // if the history length has changed, then we need to move forward or 
        // back in the history.
        if (delta) {
          if (delta < 0) { // back button has been pushed
            
            // shift out the current loc.
            this._forwardStack.push(this._cloc) ; 
            
            // shift out other items.
            for(var i=0; i < Math.abs(delta+1);i++) {
              this._forwardStack.push(this._backStack.pop()) ;
            }
            
            // set new cloc.
            this._cloc = this._backStack.pop() ;
            
            
          } else { // forward button has been pushed
            
            // shift out the current loc.
            this._backStack.push(this._cloc) ;
            
            for(i=0; i < (delta-1); i++) {
              this._backStack.push(this._forwardStack.pop()) ;
            }
            
            this._cloc = this._forwardStack.pop() ;
          }
          
        // if the history has changed but the delta hasn't, then that means
        // a new location was set via _setWindowLocation().  Normally we would
        // call gotoRoute in that method, but doing so will crash Safari.
        // Instead, we wait until Safari registers the change and then do the
        // route change.
        } else if (historyDidChange && this._locationDidChange) {
          this.gotoRoute(this._cloc) ;
          this._locationDidChange = false ;
        }
        
        var cloc = this._cloc ;
        var loc = this.get('location') ;
        if (cloc != loc) {
          this.set('location',(cloc) ? cloc : '') ;
          this.gotoRoute(cloc) ;
        }
        
        this.invokeCheckWindowLocation(50) ;
      },
      
      _setWindowLocation: function(loc) {
        var cloc = this._cloc ;
        if (cloc != loc) {
          this._backStack.push(this._cloc) ;
          this._forwardStack.length = 0 ;
          this._cloc = loc ;          
          location.hash = (loc && loc.length > 0) ? loc : '' ;
          this._locationDidChange = true ;
        }
      }
      
    },
    
    // for IE.
    ie: {
      _setupHistory: function() {
        this.invokeCheckWindowLocation(1000) ;
      },
      
      _checkWindowLocation: function() {
        var loc = this.get('location') ;
        var cloc = location.hash ;
        cloc = (cloc && cloc.length > 0) ? cloc.slice(1,cloc.length) : '' ;
        if (cloc != loc) this.set('location',(cloc) ? cloc : '') ;
        this.invokeCheckWindowLocation(100) ;
      },
      
      _setWindowLocation: function(loc) {
        //console.log('_setWindowLocation('+loc+')') ;
        var cloc = location.hash ;
        cloc = (cloc && cloc.length > 0) ? cloc.slice(1,cloc.length) : '' ;
        if (cloc != loc) {
          location.hash = (loc && loc.length > 0) ? loc : '#' ;
        }
        this.gotoRoute(loc) ;
      }
    },
    
    // Firefox
    // Because of bugs:
    // https://bugzilla.mozilla.org/show_bug.cgi?id=378962
    // https://bugzilla.mozilla.org/show_bug.cgi?id=483304
    firefox: {
      
      _checkWindowLocation: function() {
        var loc = this.get('location') ;
        var cloc = location.hash ;
        cloc = (cloc && cloc.length > 0) ? cloc.slice(1,cloc.length) : '' ;
        if (cloc != loc) {
          SC.RunLoop.begin();
          this.set('location',(cloc) ? cloc : '') ;
          SC.RunLoop.end();
        }

        this.invokeCheckWindowLocation(150) ;
      },
      
      _setWindowLocation: function(loc) {
        //console.log('_setWindowLocation('+loc+')') ;
        var cloc = location.hash ;
        cloc = (cloc && cloc.length > 0) ? cloc.slice(1,cloc.length) : '' ;
        if (cloc != loc) {
          location.hash = (loc && loc.length > 0) ? loc : '#' ;
        }
        this.gotoRoute(loc) ;
      }
      
    }
  },
  
  /** @private */
  _setupHistory: function() {
    var that = this ;
    this.invokeCheckWindowLocation(1000) ;
  },
  
  /** @private */
  _checkWindowLocation: function() {
    var loc = this.get('location') ;
    var cloc = decodeURI(location.hash) ;
    cloc = (cloc && cloc.length > 0) ? cloc.slice(1,cloc.length) : '' ;
    if (cloc !== loc) {
      SC.RunLoop.begin();
      this.set('location',(cloc) ? cloc : '') ;
      SC.RunLoop.end();
    }
    
    this.invokeCheckWindowLocation(150) ;
  },
  
  /** @private */
  _setWindowLocation: function(loc) {
    //console.log('_setWindowLocation('+loc+')') ;
    var cloc = location.hash ;
    cloc = (cloc && cloc.length > 0) ? cloc.slice(1,cloc.length) : '' ;
    if (cloc != loc) {
      location.hash = (loc && loc.length > 0) ? encodeURI(loc) : '#' ;
    }
    this.gotoRoute(loc) ;
  },
  
  /** @private */
  _routes: null,
  
  /** @private This object handles a single route level. */
  _Route: SC.Object.extend({
    
    // route handler class.
    _target: null,
    
    // route handler
    _method: null,
    
    // staticly named routes.
    _static: null,
    
    // dynamically named routes.
    _dynamic: null,
    
    // set the wildcard route name here.
    _wildcard: null,
    
    addRoute: function(parts, target, method) {
      
      if (!parts || parts.length === 0) {
        this._target = target;
        this._method = method;
        
      // add to route table.
      } else {
        var part = parts.shift() ; // get next route.
        var nextRoute = null ;
        switch(part.slice(0,1)) {
          
          // add a dynamic route
          case ':':
            part = part.slice(1,part.length) ;
            var routes = this._dynamic[part] || [] ;
            nextRoute = SC.routes._Route.create() ;
            routes.push(nextRoute) ;
            this._dynamic[part] = routes ;
            break ;
            
          // setup wildcard route
          case '*':
            part = part.slice(1,part.length) ;
            this._wildcard = part ;
            this._target = target;        
            this._method = method;
            break ;
            
          // setup a normal static route.
          default:
            routes = this._static[part] || [] ;
            nextRoute = SC.routes._Route.create() ;
            routes.push(nextRoute) ;
            this._static[part] = routes ;
        }
        
        // if we need to go another level deeper, call nextRoute
        if (nextRoute) nextRoute.addRoute(parts, target, method) ;
      }
    },
    
    // process the next level of the route and pass on.
    functionForRoute: function(parts, params) {
      
      // if parts it empty, then we are here, so return func
      if (!parts || parts.length === 0) {
        return this ;        
        
      // process the next part
      } else {
        var part = parts.shift(),
            ret  = null,
           routes, nextRoute, loc , routesLen;
        
        // try to match to static
        routes = this._static[part] ;
        if (routes) {
          for(loc=0, routesLen = routes.length;(loc < routesLen) && (ret===null);loc++) {
            var clone = parts.slice() ;
            ret = routes[loc].functionForRoute(clone, params) ;
          }
        }
        
        // try to match dynamic if no static match was found.
        if (ret === null) {
          for(var key in this._dynamic) {
            routes = this._dynamic[key] ;
            if (routes) {
              for(loc=0, routesLen = routes.length; (loc<routesLen) && (ret === null);loc++) {
                clone = parts.slice() ;
                ret = routes[loc].functionForRoute(clone,params) ;
            
                // if a route was found, save the current part in params.
                if (ret && params) params[key] = part ;
              }
            }

            if (ret) break ; 
          }
        }
        
        
        // if nothing still found, and there is a wildcard, match that.
        if ((ret === null) && this._wildcard) {
          parts.unshift(part) ;
          if (params) params[this._wildcard] = parts.join('/') ;
          ret = this;
        }
        
        return ret ;
      }
    },
    
    init: function() {
      arguments.callee.base.call(this) ;
      this._static = {} ; this._dynamic = {} ;
    }
  })
  
});
