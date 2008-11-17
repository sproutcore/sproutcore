// ========================================================================
// SproutCore
// copyright 2006-2008 Sprout Systems, Inc.
// ========================================================================

require('deprecated/views/classic_view') ;

// A SpinnerView can be used to show state when loading.
SC.SpinnerView = SC.ClassicView.extend({
  isVisibleBindingDefault: SC.Binding.Not
}) ;