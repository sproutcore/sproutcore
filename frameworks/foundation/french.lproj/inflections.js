// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2011 Strobe Inc. and contributors.
//            Portions ©2008-2011 Apple Inc. All rights reserved.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================

/** @private
  Active Support style inflection constants
*/
SC.hashesForLocale('fr', 'inflectionConstants', {
  /** @private */
  PLURAL: [
    [/(bijou|caillou|chou|genou|hibou|joujou|pou|au|eu|eau)$/i, '$1x'],
    [/(bleu|émeu|landau|lieu|pneu|sarrau)$/i, '$1s'],
    [/al$/i, 'aux'],
    [/ail$/i, 'ails'],
    [/(b|cor|ém|gemm|soupir|trav|vant|vitr)ail$/i, '$1aux'],
    [/(s|x|z)$/i, '$1'],
    [/$/, "s"]
  ],

  /** @private */
  SINGULAR: [
    [/(bijou|caillou|chou|genou|hibou|joujou|pou|au|eu|eau)x$/i, '$1'],
    [/(journ|chev)aux$/i, '$1al'],
    [/ails$/i, 'ail'],
    [/(b|cor|ém|gemm|soupir|trav|vant|vitr)aux$/i, '$1ail'],
    [/s$/i, ""]
  ],

  /** @private */
  IRREGULAR: [
    ['monsieur', 'messieurs'],
    ['madame', 'mesdames'],
    ['mademoiselle', 'mesdemoiselles']
  ],

  /** @private */
  UNCOUNTABLE: []
});