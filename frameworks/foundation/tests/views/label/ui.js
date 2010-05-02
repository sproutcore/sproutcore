// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2009 Sprout Systems, Inc. and contributors.
//            portions copyright @2009 Apple Inc.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================

// As one might expect, these tests used to test the UI. As the UI is done by
// renderers in the theme, this is tested in the theme itself (empty_theme).

// The problem is that this _requires_ the theme to be present, but the theme
// needs foundation. Unfortunately, the test runner only loads the framework
// being tested, and never loads the theme in addition. As such, the tests
// that require themes won't work.