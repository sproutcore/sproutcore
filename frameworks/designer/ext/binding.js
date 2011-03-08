// ========================================================================
// SproutCore -- JavaScript Application Framework
// ========================================================================

/** 
  Extend SC.Binding with properites that make it easier to detect bindings
  in the inspector
*/
SC.Binding.isBinding = true;


SC.Binding.displayValue = function(){
  var from = this._fromRoot ? "<%@>:%@".fmt(this._fromRoot,this._fromPropertyPath) : this._fromPropertyPath;

  var to = this._toPropertyPath;

  var oneWay = this._oneWay ? '[oneWay]' : '';
  return "%@ -> %@ %@".fmt(from, to, oneWay);

};


SC.Binding.encodeDesign = function(coder){
  var ret = "SC.Binding";
  
  if(this._fromPropertyPath){
    ret= ret+".from('"+this._fromPropertyPath+"')";
  }
  if(this._oneWay){
    ret = ret+".oneWay()";
  }
  return ret;//coder.js(key,ret);
};
