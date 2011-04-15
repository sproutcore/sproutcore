// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2011 Strobe Inc. and contributors.
//            Portions ©2008-2011 Apple Inc. All rights reserved.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================
/*globals TestControls */

TestControls.alertController = SC.Controller.create({
  alertType: 'error',
  buttonCount: 1,

  message: "Hello, World!",
  description: "This is a description...",
  caption: "And this is a caption.",

  button1Title: "OK",
  button2Title: "Cancel",
  button3Title: "Nokay",

  showAlert: function() {
    var args = [];
    args.push(this.get('message'));
    args.push(this.get('description'));
    args.push(this.get('caption'));
    args.push(this.get('button1Title'));

    if (this.get('buttonCount') > 1) {
      args.push(this.get('button2Title'));
    }

    if (this.get('buttonCount') > 2) {
      args.push(this.get('button3Title'));
    }

    SC.AlertPane[this.get('alertType')].apply(SC.AlertPane, args);
  }
});

