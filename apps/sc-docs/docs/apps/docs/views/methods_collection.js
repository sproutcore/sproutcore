// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2008-2011 Apple Inc. All rights reserved.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================

Docs.MethodsCollectionView = SC.TemplateCollectionView.extend({
  contentBinding: 'Docs.selectedClassController.methods'
});

Handlebars.registerHelper('signature', function(object) {

  var method = this.get(object);

  var name = method.get('name');
  var params = method.get('params');
  var param, suffix;

  var out = '<div class="method-signature">';
  out += name + '(';

  for(var i=0, l=params.length; i<l; i++) {
    param = params[i];

    if ( i < (l-1)) {
      suffix = ", ";
    } 
    else {
      suffix = "";
    }

    if(param.type) {
      out += '<span class="data-type" name="%@">%@</span>'.fmt(param.type,param.type);
    }

    if(param.name) {
      out += '<span class="method-param-name">%@%@</span>'.fmt(param.name,suffix);
    }
  }

  out += ')';
  out += "</div>";

  return new Handlebars.SafeString(out);
});


Handlebars.registerHelper('returns', function(object) {

  var method = this.get(object);
  var returns = method.get('returns');
  if (!returns) return "";
  
	var out = "";

  out = '<div class="returns">';
    out += '<span class="name">Returns: </span>'; 
    out += '<span class="data-type" name="'+returns.type+'">'+returns.type+'</span>';
    out += '<span class="return-text">'+returns.desc+'</span>';
  out += "</div>";

  return new Handlebars.SafeString(out);
});

Handlebars.registerHelper('extends', function(object) {

  var extendsFrom = this.getPath(object);
  if (!extendsFrom) return "";
  
	var out = "";
  var len = extendsFrom.length;

  for(var i=0; i<len; i++) {
    var extendFrom = extendsFrom[i];
    out += '<span class="data-type" name="'+extendFrom+'">'+extendFrom+'</span>';
  }
  

  return new Handlebars.SafeString(out);
});
