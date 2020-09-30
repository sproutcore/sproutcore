// ==========================================================================
// Project:   Sproutcore Chat
// Copyright: ©2013 GestiXi
// Author:    Nicolas BADIA and contributors
// License:   Licensed under MIT license (see license.js)
// ==========================================================================

/**
  @class

  A simple object that makes it easier to use the
  window.visibilitychange in a SproutCore application.

  @author Nicolas BADIA
*/
SC.Visibility = SC.Object.create({

  /**
    Set to YES if the tab is visible.

    @type Boolean
    @readOnly
  */
  isVisible: YES,

  /**
    @private
  */
  init: function() {
    sc_super();
    this.observeVisibility();
  },

  /**
    @private
  */
  observeVisibility: function() {
    var prop = this.getHiddenProp();

    if (prop) {
      var evtname = prop.replace(/[H|h]idden/,'') + 'visibilitychange';

      SC.Event.add(document, evtname, this, 'visibilityDidChange');
    }
  },

  /**
    @private
  */
  getHiddenProp: function() {
    var prefixes = ['webkit','moz','ms','o'];

    // if 'hidden' is natively supported just return it
    if ('hidden' in document) return 'hidden';

    // otherwise loop over all the known prefixes until we find one
    for (var i = 0; i < prefixes.length; i++){
      if ((prefixes[i] + 'Hidden') in document) return prefixes[i] + 'Hidden';
    }

    // otherwise it's not supported
    return null;
  },

  /**
    @private
  */
  visibilityDidChange: function() {
    var prop = this.getHiddenProp(),
      isVisible = !document[prop];

    this.set('isVisible', isVisible);
  },

});
