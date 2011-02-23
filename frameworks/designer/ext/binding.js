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

