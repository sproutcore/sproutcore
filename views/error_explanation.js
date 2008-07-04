// ========================================================================
// SproutCore
// copyright 2006-2008 Sprout Systems, Inc.
// ========================================================================

require('views/label');

/**
  @class
  
  The ErrorExplanation view is a special type of label view that can display
  one or more errors related to a form or field.  This view will set itself
  to visible only if it has errors.
  
  @extends SC.View
  @extends SC.Control
  
*/
SC.ErrorExplanationView = SC.View.extend(SC.Control,
/** @scope SC.ErrorExplanationView.prototype */ {

  emptyElement: '<ul class="errors"></ul>',
  explanationTemplate: '<li>%@</li>',
  
  _errorsFor: function(errors) {
    if (!errors || errors.length == 0) return [] ;
    return errors.map(function(er) {
      return ($type(er) == T_ERROR) ? er : null ;
    }).compact() ;
  },
  
  valueBindingDefault: SC.Binding.Multiple,
  
  formatter: function(errors, view) {
    errors = view._errorsFor(errors) ;
    if (!errors || errors.length == 0) return '' ;
    return errors.map(function(er) {
      er = er.get('description') ; 
      if (er.escapeHTML) er = er.escapeHTML() ;
      return view.explanationTemplate.fmt(er); 
    }).join("") ;
  },
  
  escapeHTML: false,
  
  _valueObserver: function() {
    var errors = this._errorsFor(this.get('value')) ;
    var isVisible = errors && errors.length > 0 ;
    if (this.get('isVisible') != isVisible) this.set('isVisible',isVisible);
    this.set('innerHTML', this.formatter(errors, this)) ;
  }.observes('value'),
  
  init: function() {
    sc_super() ;
    this._valueObserver() ;
  }
  
});