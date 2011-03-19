SC.mixin({
  /**
    Returns a copy of the passed data that is stripped of internal SproutCore properties
    such as _sc_guid* properties.
  */
  cleanSCProperties: function(content) {
    // we need to sanitize hashes. Arrays could have hashes, so those too.
    if(SC.typeOf(content) === SC.T_ARRAY){
      var len = content.length;

      var arr = [];
      for(var i=0;i<len;i++){
        arr.push(this.sanitizeContent(content[i]));
      }

      return arr;
    } else if (SC.typeOf(content) === SC.T_HASH) {
      //Must be hash
      var hash = {};
      for (var key in content) {
        if (key.substr(0, 9) === "_sc_guid_") continue;
        hash[key] = this.sanitizeContent(content[key]);
      }
      return hash;
    }

    return content;
  }
});
