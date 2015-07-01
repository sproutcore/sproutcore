// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2011 Strobe Inc. and contributors.
//            Portions ©2008-2011 Apple Inc. All rights reserved.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================

/** @private
  Active Support style inflection constants
*/
SC.hashesForLocale('es', 'inflectionConstants', {
  /** @private */
  PLURAL: [
    [/([^aeéiou])$/i, '$1es'],
    [/([aeiou]s)$/i, '$1'],
    [/z$/i, 'ces'],
    [/á([sn])$/i, 'a$1es'],
    [/é([sn])$/i, 'e$1es'],
    [/í([sn])$/i, 'i$1es'],
    [/ó([sn])$/i, 'o$1es'],
    [/ú([sn])$/i, 'u$1es'],
    [/$/, "s"]
  ],

  /** @private */
  SINGULAR: [
    [/es$/i, ''],
    [/s$/i, ""]
  ],

  /** @private */
  IRREGULAR: [
    ['el', 'los']
  ],

  /** @private */
  UNCOUNTABLE: []
});