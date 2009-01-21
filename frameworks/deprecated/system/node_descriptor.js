// ========================================================================
// SproutCore -- JavaScript Application Framework
// Copyright ©2006-2008, Sprout Systems, Inc. and contributors.
// Portions copyright ©2008 Apple, Inc.  All rights reserved.
// ========================================================================

require('core') ;

/**
  This object can generate HTML DOM elements from a hash-based description of 
  the nodes.  See the NodeDescriptor wiki page for complete docs.

  See https://wiki.sproutit.com/engineering/show/NodeDescriptor 

  @deprecated
*/
SC.NodeDescriptor = {
  create: function(descriptor, opts) {
    if (!opts) opts = {} ;
    // collect info from descriptor
    var tag = opts.tag || descriptor.tag || 'div' ;
    var className = opts.cssClass || descriptor.cssClass ;
    var elementId = opts.id || descriptor.id ;
    var style = opts.style || descriptor.style ;
    var innerHTML = opts.innerHTML || descriptor.innerHTML ;
    if (!innerHTML) {
      var childNodes = opts.childNodes || descriptor.childNodes ;
    } 

    // create element
    var ret = $(document.createElement(tag)) ;
    if (className) ret.className = className ;
    if (elementId) ret.id = elementId ;
    if (style) {
      for (var name in style) element.style[name.camelize()] = style[name];
    }
    
    // apply extra attributes
    for(var attr in descriptor) {
      if (this.ignoredProperties.indexOf(attr) == -1) {
        ret.setAttribute(attr,descriptor[attr]) ;
      }
    }
    
    // build child nodes, if they exist.
    if (innerHTML) {
      ret.innerHTML = innerHTML ;
    } else if (childNodes) {
      var that = this ;
      childNodes.each(function(desc) {
        ret.appendChild(that.create(desc)) ;
      }) ;
	  that=null;
	  childNodes=null;
    }
    
	try{
    	return ret ;
	}finally{
		//ie7 memory leaks
		tag=null;
		className=null;
		elementId=null;
		style=null;
		innerHTML=null;
		ret=null;
	}
  },
  
  ignoredProperties: ['tag','cssClass','id','style','childNodes','innerHTML']
};

