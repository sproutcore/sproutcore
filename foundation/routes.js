// ========================================================================
// SproutCore
// copyright 2006-2008 Sprout Systems, Inc.
// ========================================================================

require('foundation/object') ;

/**
  @class
  
  Routes makes it possible to load a location in the browser.
  
  @extends SC.Object
*/
SC.Routes = SC.Object.create(
/** @scope SC.Routes.prototype */ {

  // set this property to your current app lication
  location: function(key,value) {
    if (value !== undefined) {
      if (value === null) value = '' ;
      
      // convert an object hash to a string, if it was passed.
      if (typeof(value) == "object") {

        // get the original route and any params
        var parts = (value.route) ? value.route.split('&') : [''] ;
        var route = parts.shift() ;
        var params = {} ;
        parts.each(function(p) {
          var bits = p.split('=') ;
          params[bits[0]] = bits[1] ;
        }) ;

        // overlay any params passed in the object.
        for(var key in value) {
          if (!value.hasOwnProperty(key)) continue ;
          if (key != 'route') {
            params[key] = encodeURIComponent(''+value[key]) ;
          }
        }
        
        // now build params.
        parts = [route] ;
        for(var key in params) {
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
  
  // ensures we are at the current route location.
  ping: function() { 
    if (!this._didSetupHistory) {
      this._didSetupHistory = true ;
      this._setupHistory() ;
    }
    this._checkWindowLocation(); 
  },
  
  // register a route here.  Routes have the following format:
  // static/route/path -- matches this path only.
  // static/route/:path -- matches any static/route, :path passed as param.
  // static/*route -- matches any static, route gets rest of URL.
  //
  // parameters can also be passed using &.
  // static/route&param1=value&param2=value2
  //
  addRoute: function(route, func) {
    var parts = route.split('/') ;
    if (!this._routes) this._routes = SC.Routes._Route.create() ;
    this._routes.addRoute(parts,func) ;
  },
  
  // eval routes.
  gotoRoute: function(route) {
    var params = {} ; var parts, route, func ;

    // save this route for window location sensing
    this._lastRoute = route ;
    
    // step 1: split out parameters
    var parts = route.split('&') ;
    if (parts && parts.length > 0) {
      route = parts.shift() ;
      parts.each(function(part) {
        var param = part.split('=') ;
        if (param && param.length > 1) params[param[0]] = decodeURIComponent(param[1]) ;
      }) ;
    } else route = '' ;
    
    // step 2: split our route parts
    parts = route.split('/') ;
    
    // step 3: evaluate route.
    if (!this._routes) this._routes = SC.Routes._Route.create() ;
    func = this._routes.functionForRoute(parts,params) ;
    if (func) func(params) ;
    //else console.log('could not find route for: "'+route+'"') ;
  },
  
  
  init: function() {
    arguments.callee.base.call(this) ;
    if (SC.isSafari() && !SC.isSafari3()) {
      Object.extend(this,this.browserFuncs.safari) ;  
    } else if (SC.isIE()) {
      Object.extend(this,this.browserFuncs.ie) ;  
    }
    this._didSetupHistory = false ;
  },
  
  // _checkWindowLocation and _setWindowLocation are implemented separately for
  // each browser.  Below are the implementations, which get copied during init.
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

        this.invokeLater(this._checkWindowLocation, 1000) ;
      },
      
      _checkWindowLocation: function() { 
        // The way we know the user has moved forward or back in the history 
        // is when the length of the history array no longer matched our own 
        // copy of the history. However, when we first change locations, it 
        // takes a little while for Safari to catch up.  So what we do instead 
        // is first check to see if Safari's length has changed from its last 
        // known length and only then check for a delta.
        var historyDidChange = (history.length - this._lastLength) != 0;
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
            
            for(var i=0; i < (delta-1); i++) {
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
        
        this.invokeLater(this._checkWindowLocation, 50) ;
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
        this.invokeLater(this._checkWindowLocation, 1000) ;
      },

      _checkWindowLocation: function() {
        var loc = this.get('location') ;
        var cloc = location.hash ;
        cloc = (cloc && cloc.length > 0) ? cloc.slice(1,cloc.length) : '' ;
        if (cloc != loc) this.set('location',(cloc) ? cloc : '') ;
        this.invokeLater(this._checkWindowLocation, 100) ;
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
  
  _setupHistory: function() {
    this.invokeLater(this._checkWindowLocation, 1000) ;
  },
  
  _checkWindowLocation: function() {
    var loc = this.get('location') ;
    var cloc = location.hash ;
    cloc = (cloc && cloc.length > 0) ? cloc.slice(1,cloc.length) : '' ;
    if (cloc != loc) this.set('location',(cloc) ? cloc : '') ;
    this.invokeLater(this._checkWindowLocation, 100) ;
  },
  
  _setWindowLocation: function(loc) {
    //console.log('_setWindowLocation('+loc+')') ;
    var cloc = location.hash ;
    cloc = (cloc && cloc.length > 0) ? cloc.slice(1,cloc.length) : '' ;
    if (cloc != loc) {
      location.hash = (loc && loc.length > 0) ? loc : '#' ;
    }
    this.gotoRoute(loc) ;
  },
  
  _routes: null,
  
  // This object handles a single route level.  
  _Route: SC.Object.extend({
    
    // a route that ends here gets this func.
    _func: null,
    
    // staticly named routes.
    _static: null,
    
    // dynamically named routes.
    _dynamic: null,
    
    // set the wildcard route name here.
    _wildcard: null,
    
    addRoute: function(parts, func) {
      if (!parts || parts.length == 0) {
        this._func = func ;
        
      // add to route table.
      } else {
        var part = parts.shift() ; // get next route.
        var nextRoute = null ;
        switch(part.slice(0,1)) {
          
          // add a dynamic route
          case ':':
            part = part.slice(1,part.length) ;
            var routes = this._dynamic[part] || [] ;
            nextRoute = SC.Routes._Route.create() ;
            routes.push(nextRoute) ;
            this._dynamic[part] = routes ;
            break ;
            
          // setup wildcard route
          case '*':
            part = part.slice(1,part.length) ;
            this._wildcard = part ;
            this._func = func ;
            break ;
            
          // setup a normal static route.
          default:
            var routes = this._static[part] || [] ;
            nextRoute = SC.Routes._Route.create() ;
            routes.push(nextRoute) ;
            this._static[part] = routes ;
        }
        
        // if we need to go another level deeper, call nextRoute
        if (nextRoute) nextRoute.addRoute(parts,func) ;
      }
    },
    
    // process the next level of the route and pass on.
    functionForRoute: function(parts, params) {
      // if parts it empty, then we are here, so return func
      if (!parts || parts.length == 0) {
        return this._func ;
        
      // process the next part
      } else {
        var part = parts.shift() ;
        var routes, nextRoute, ret, loc ;
        
        // try to match to static
        routes = this._static[part] ;
        if (routes) for(loc=0;(loc < routes.length) && (ret==null);loc++) {
          var clone = parts.slice() ;
          ret = routes[loc].functionForRoute(clone, params) ;
        }
        
        // try to match dynamic if no static match was found.
        if (ret == null) for(var key in this._dynamic) {
          routes = this._dynamic[key] ;
          if (routes) for(loc=0;(loc<routes.length) && (ret == null);loc++) {
            var clone = parts.slice() ;
            ret = routes[loc].functionForRoute(clone,params) ;
            
            // if a route was found, save the current part in params.
            if (ret && params) params[key] = part ;
          }
          if (ret) break ; 
        }
        
        // if nothing still found, and there is a wildcard, match that.
        if ((ret == null) && this._wildcard) {
          parts.unshift(part) ;
          if (params) params[this._wildcard] = parts.join('/') ;
          ret = this._func ;
        }
        
        return ret ;
      }
    },
    
    init: function() {
      arguments.callee.base.call(this) ;
      this._static = {} ; this._dynamic = {} ;
    }
  })
  
}) ;
