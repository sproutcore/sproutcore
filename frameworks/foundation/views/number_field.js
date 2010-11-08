// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2010 Sprout Systems, Inc. and contributors.
//            Portions ©2008-2010 Apple Inc. All rights reserved.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================
sc_require('views/text_field');

/**
  @class

  A text field is an input element with type "text".  This view adds support
  for hinted values, etc.

  @extends SC.FieldView
  @extends SC.Editable
  @author Juan Pablo Goldfinger
*/
SC.NumberFieldView = SC.TextFieldView.extend(
/** @scope SC.TextFieldView.prototype */
{

  // Places
  decimalPlaces: 2,

  // Symbols
  decimalSymbol: ',',
  thousandSymbol: '.',
  prefix: '$ ',
  postfix: '.-',
  textAlign: SC.ALIGN_RIGHT,

  allowThousand: YES,
  allowDecimal: NO,
  allowSignChange: NO,
  showPrefix: NO,
  showPostfix: NO,
  showZeroOnNull: YES,

  validator: SC.Validator.FormattedNumber,

  // *************
  // KEY EVENTS
  // *************
  keyDown: function(evt) {
    if (this.interpretKeyEvents(evt)) {
      evt.stop();
      if (this._needsFieldUpdate && this.get('applyImmediately')) {
        this.invokeLater(this.fieldValueDidChange, 1); // notify change
      }
      this._needsFieldUpdate = NO;
      return YES;
    }
    sc_super();
  },

  moveDown: function(evt) {
    return YES;
  },

  allowedValues: '0 1 2 3 4 5 6 7 8 9 0'.w(),

  insertText: function(text) {
    var av = this.get('allowedValues');
    var ts = this.get('thousandSymbol');
    var ds = this.get('decimalSymbol');
    var sp = this.get('showPrefix');
    var cs = this.get('selection');
    var sc = this.get('allowSignChange');
    var pcs = cs.start;
    var pce = cs.end;
    var fv = this.getFieldValue();
    var ct;
    var prefix = this.get('prefix') || '';

    if (text === '-' && sc) {
      ct = this.cleanThousands(fv);
      if (!ct.match('^-')) {
        this.setFieldValue(this.formatNumber('-%@'.fmt(ct)));
        cs.end = cs.start = pcs + 1;
      } else {
        this.setFieldValue(this.formatNumber(ct.replace('-','')));
        cs.end = cs.start = pcs - 1;
      }
      this._needsFieldUpdate = YES;
    } else if (text === '+' && sc) {
      ct = this.cleanThousands(fv);
      if (ct.match('^-')) {
        this.setFieldValue(this.formatNumber(ct.replace('-','')));
        this._needsFieldUpdate = YES;
        cs.end = cs.start = pcs - 1;
      }
    } else if (text === ds && this.get('allowDecimal')) {
      var cpp = this.cleanPrePostFix(fv);
      if (SC.empty(fv)) {
        this.setFieldValue(this.formatNumber('0'));
        this._needsFieldUpdate = YES;
        cs.end = cs.start = (sp ? prefix.length : 0) + 2;
      } else {
        var dsp = cpp.indexOf(ds);
        cs.end = cs.start = (sp ? prefix.length + dsp : dsp) + 1;
      }
    } else if (text === '0' && SC.empty(fv) && this.get('allowDecimal')) {
      this.setFieldValue(this.formatNumber('0'));
      this._needsFieldUpdate = YES;
      cs.start = (sp ? prefix.length : 0) + 2;
      cs.end = cs.start;
    } else if (av.indexOf(text) >= 0) {
      var fn;
      
      // Check if is ALL selection
      if (pce - pcs > 1 && pcs === 0 && pce === fv.length) {
        fn = this.formatNumber(text);
        cs.end = cs.start = (sp ? prefix.length : 0) + 1;
      //} else if (pce - pcs > 1) {
      } else {
        var s1 = fv.substring(0, pcs);
        var s2 = fv.substring(cs.end);
        var nv = s1 + text + s2;
        ct = this.cleanThousands(nv);
        fn = this.formatNumber(ct);
        
        // Calculates caret position
        var posFix = fn.substring(pce).length - s2.length;
        if (SC.empty(fv)) posFix = sp ? prefix.length + 1 : 1;
        cs.end = cs.start = pcs + posFix;
      }
        
      this.setFieldValue(fn);
      this._needsFieldUpdate = YES;
    }
    this.set('selection', cs);

    return YES;
  },
  
  moveLeft: function(evt) {
    var cs = this.get('selection');
    var fv = this.getFieldValue();
    var sp = this.get('showPrefix');
    var sf = this.get('showPostfix');
    var ad = this.get('allowDecimal');
    var dp = this.get('decimalPlaces');
    var prefix = this.get('prefix');
    var postfix = this.get('prefix');
    var pcs = cs.start;
    var pce = cs.end;

    // Check if all is selected
    if (pce - pcs > 1 && pcs === 0 && pce === fv.length) {
      cs.end = cs.start = fv.length - ( (sf ? postfix.length : 0) + (ad ? dp + 1 : 0) + 0);
    } else if (!sp || pcs > prefix.length) {
      cs.end = cs.start = pcs - 1;
    }

    this.set('selection', cs);

    return YES;
  },

  moveRight: function(evt) {
    var cs = this.get('selection');
    var fv = this.getFieldValue();
    var sp = this.get('showPrefix');
    var sf = this.get('showPostfix');
    var ad = this.get('allowDecimal');
    var dp = this.get('decimalPlaces');
    var prefix = this.get('prefix');
    var postfix = this.get('prefix');
    var pcs = cs.start;
    var pce = cs.end;

    // Check if all is selected
    if (pce - pcs > 1 && pcs === 0 && pce === fv.length) {
      cs.end = cs.start = fv.length - ( (sf ? postfix.length : 0) + (ad ? dp + 1 : 0) + 0);
    } else if (!sf || pcs < (fv.length - postfix.length)) {
      cs.end = cs.start = pcs + 1;
    }

    this.set('selection', cs);

    return YES;
  },
  
  deleteBackward: function(evt) {
    var cs = this.get('selection');
    var fv = this.getFieldValue();
    var ts = this.get('thousandSymbol');
    var ds = this.get('decimalSymbol');
    var sp = this.get('showPrefix');
    var sf = this.get('showPostfix');
    var prefix = this.get('prefix');
    var postfix = this.get('prefix');
    var pcs = cs.start;
    var pce = cs.end;
    var inside = true;

    // Check if all is selected
    if (pce - pcs > 1) {
      // Check if is ALL selection
      if (pcs === 0 && pce === fv.length) {
        this.setFieldValue(this.formatNumber(null));
        this._needsFieldUpdate = YES;
        cs.end = cs.start = (sp ? prefix.length : 0) + 1;
        this.set('selection', cs);
        return YES;
      } else {
        console.log('no, is a default selection');
      }
    }
    
    // Check if can delete
    // We only delete if caret are poistioned inside the 'number'
    if (sp || sf) {
      if (sp && pcs < prefix.length + 1) inside = false;
      if (sf && pcs > fv.substring(0,fv.length - postfix.length).length) inside = false;
      if (!inside) return YES;
    }

    var chr = fv.substring(pcs - 1, pcs);
    if (chr === ts || chr === ds) pcs--;

    var s1 = fv.substring(0, pcs - 1);

    // Prevent field empty if showZeroOnNull is active
    if (s1 === '' && this.get('showZeroOnNull')) {
      s1 = '0';
    }

    var s2 = fv.substring(pcs);
    var nv = s1 + s2;

    var ct = this.cleanThousands(nv);
    var fn = this.formatNumber(ct);

    this.setFieldValue(fn);

    // Calculates caret position
    var posFix = fn.substring(cs.end).length - s2.length;

    if (chr === ts || chr === ds) posFix++;

    cs.start = pcs + posFix;
    cs.end = pcs + posFix;

    this.set('selection', cs);

    this._needsFieldUpdate = YES;

    return YES;
  },

  deleteForward: function(evt) {
    var cs = this.get('selection');
    var fv = this.getFieldValue();
    var ts = this.get('thousandSymbol');
    var ds = this.get('decimalSymbol');
    var sp = this.get('showPrefix');
    var sf = this.get('showPostfix');
    var prefix = this.get('prefix');
    var postfix = this.get('prefix');    
    var pcs = cs.start;
    var pce = cs.end;
    var inside = true;
    
    // Check if is a selection
    if (pce - pcs > 1) {
      // Check if is ALL selection
      if (pcs === 0 && pce === fv.length) {
        console.log('is ALL selection');
      } else {
        console.log('no, is a default selection');
      }
    }
    
    // Check if can delete
    // We only delete if caret are positioned inside the 'number'
    if (sp || sf) {
      if (sp && pcs < prefix.length) inside = false;
      if (sf && pcs > fv.substring(0,fv.length - postfix.length - 1).length) inside = false;
      if (!inside) return YES;
    }
    
    var chr = fv.substring(pcs, pcs + 1);
    if (chr === ts || chr === ds) pcs++;

    var s1 = fv.substring(0, pcs);

    // Prevent field empty if showZeroOnNull is active
    if (s1 === '' && this.get('showZeroOnNull')) {
      s1 = '0';
    }

    var s2 = fv.substring(pcs + 1);
    var nv = s1 + s2;

    var ct = this.cleanThousands(nv);
    var fn = this.formatNumber(ct);

    this.setFieldValue(fn);

    // Calculates caret position
    var posFix = fn.substring(cs.end).length - s2.length;

    cs.start = pcs + posFix;
    cs.end = pcs + posFix;

    this.set('selection', cs);

    this._needsFieldUpdate = YES;
    return YES;
  },

  // ****************
  //  FORMAT STRING
  // ****************
  cleanPrePostFix: function(number) {
    var sp = this.get('showPrefix');
    var sf = this.get('showPostfix');

    if (sp) number = number.replace(this.get('prefix'), '');
    if (sf) number = number.replace(this.get('postfix'), '');
    return number;    
  },
  
  cleanThousands: function(number) {
    var ts = this.get('thousandSymbol');
    return this.cleanPrePostFix(number).split(ts).join('');
  },

  checkDecimal: function(number) {
    var ds = this.get('decimalSymbol');
    return number.replace('.', ds);
  },

  systemDecimal: function(number) {
    var ds = this.get('decimalSymbol');
    return number.replace(ds, '.');
  },

  formatNumber: function(number) {
    if (SC.empty(number)) {
      if (this.get('showZeroOnNull')) number = '0';
      else return '';
    }

    if (!isNaN(number)) {
      number = this.checkDecimal(String(number));
    }

    var ts = this.get('thousandSymbol');
    var ds = this.get('decimalSymbol');
    var dp = this.get('decimalPlaces');
    var sp = this.get('showPrefix');
    var sf = this.get('showPostfix');

    var a = number.split(ds, 2);

    var d = a[1];
    var i = parseInt(a[0], 10);

    if (isNaN(i)) {
      return '';
    }

    // Format Integer
    var minus = (i < 0) ? '-': '';
    var n = String(Math.abs(i));

    if (this.get('allowThousand')) {
      a = [];
      while (n.length > 3) {
        var nn = n.substr(n.length - 3);
        a.unshift(nn);
        n = n.substr(0, n.length - 3);
      }

      // If n <= 3, automaticaliy push to array
      if (n.length > 0) {
        a.unshift(n);
      }
      // Formqted Integer with thousands
      n = minus + a.join(ts);
    } else {
      // Without thousands
      n = minus + n;
    }

    // Format Decimals
    if (this.get('allowDecimal')) {
      var z = this.get('fillZeroes');
      if (SC.none(d)) {
        n = n + ds + z;
      } else {
        d = d + z;
        n = n + ds + d.substring(0, dp);
      }
    }

    // Show Prefix?
    if (sp) n = this.get('prefix') + n;

    // Show Postfix?
    if (sf) n = n + this.get('postfix');
    
    return n;
  },

  fillZeroes: function() {
    var dp = this.get('decimalPlaces'),
    z = '';
    for (var i = 0; i < dp; i++) {
      z += '0';
    }
    return z;
  }.property('decimalPlaces').cacheable()

});
