// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2009 Sprout Systems, Inc. and contributors.
//            portions copyright @2009 Apple, Inc.
// License:   Licened under MIT license (see license.js)
// ==========================================================================

/*global module test htmlbody ok equals same stop start */

htmlbody('<style> .sc-static-layout { border: 1px red dotted; } </style>');
(function() {
   var pane = SC.ControlTestPane.design()
   .add("", SC.SeparatorView, { 

    layoutDirection: SC.LAYOUT_VERTICAL
   });
   pane.show(); 
})();
module("TODO: Test SC.SeparatorView UI");




