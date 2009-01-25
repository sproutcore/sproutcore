// ==========================================================================
// Project:   SproutCore Unit Testing Library
// Copyright: ©2006-2009 Sprout Systems, Inc. and contributors.
//            Portions ©2008-2009 Apple, Inc. All rights reserved.
// License:   Licened under MIT license (see license.js)
// ==========================================================================

// these compiler directives are normally defined in costello's core.  But
// since the testing framework needs to be totally independent, we redefine
// them here also.
var require = require || function sc_require() {};
var sc_require = sc_require || require;
var sc_resource = sc_resource || function sc_resource() {};
