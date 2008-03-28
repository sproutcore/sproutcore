// ========================================================================
// SproutCore
// copyright 2006-2007 Sprout Systems, Inc.
// ========================================================================

require('views/label');

// The ErrorExplanation view is a special type of label view that can display
// one or more errors related to a form or field.  This view will set itself
// to visible only if it has errors.
SC.ErrorExplanationView = SC.LabelView.extend({

  emptyElement: '<ul class="errors"></ul>',
  explanationTemplate: '<li>%@</li>',
  
  _errorsFor: function(errors) {
    if (!errors || errors.length == 0) return [] ;
    return errors.map(function(er) {
      return ($type(er) == T_ERROR) ? er : null ;
    }).compact() ;
  },
  
  contentBindingDefault: SC.Binding.Multiple,
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
  
  _contentVisibleObserver: function() {
    var errors = this._errorsFor(this.get('content')) ;
    var isVisible = errors && errors.length > 0 ;
    if (this.get('isVisible') != isVisible) this.set('isVisible',isVisible);
  }.observes('content'),
  
  init: function() {
    arguments.callee.base.apply(this,arguments) ;
    this._contentVisibleObserver() ;
  }
});