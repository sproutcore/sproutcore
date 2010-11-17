var formatter = null;

module("SC.NumberFormatter", {
    setup: function() {
        formatter = SC.NumberFormatter.create();
    }
});

test("can transform to string", function() {
    same('3', formatter.stringFromNumber(3));
});

test("can transform from string to number", function() {
    same(3, formatter.numberFromString('3'));
});

test("always parses numbers base 10", function() {
    same(8, formatter.numberFromString('08'));
});

test("refuses to parse garbage", function() {
    same(NaN, formatter.numberFromString('fnord'));
});

test("refuses to parse numbers with stuff appended", function() {
    same(NaN, formatter.numberFromString('8 fnord'));
});

test("refuses to parse numbers with stuff prepended", function() {
    same(NaN, formatter.numberFromString('fnord 8'));
});

test("can parse and serialize NaN", function() {
    same(NaN, formatter.numberFromString('NaN'));
    same('NaN', formatter.stringFromNumber(NaN));
});

test("can parse negative numbers", function() {
    same(-8, formatter.numberFromString('-8'));
});

test("can parse explicitly positive numbers", function() {
    same(8, formatter.numberFromString('+8'));
});

test("accepts spaces before and after number", function() {
    same(8, formatter.numberFromString('8 '));
    same(8, formatter.numberFromString(' 8'));
    same(8, formatter.numberFromString('     8       '));
});

test("serializes null and undefined to empty string", function() {
    same("", formatter.stringFromNumber(undefined));
    same("", formatter.stringFromNumber(null));
});

test("serializes 0 correctly", function() {
    same("0", formatter.stringFromNumber(0));
});



module("SC.NumberFormatter with suffix", {
    setup: function() {
        formatter = SC.NumberFormatter.create();
        formatter.set('suffix', 'h');
    }
});

test("can parse numbers without suffix", function() {
    same(8, formatter.numberFromString('8'));
});

test("can format numbers with suffix", function() {
    same('8 h', formatter.stringFromNumber(8));
});

test("can parse number with suffix", function() {
    same(8, formatter.numberFromString('8 h'));
});

test("rejects numbers with extra or different suffix", function() {
    same(NaN, formatter.numberFromString('8 fnord'));
});

test("can have multi-char suffix", function() {
    formatter.set('suffix', 'fnord');
    same(8, formatter.numberFromString('8 fnord'));
});

test("can have arbitrary whitespace between number and suffix", function() {
    same(8, formatter.numberFromString('8h'));
    same(8, formatter.numberFromString('8 h'));
    same(8, formatter.numberFromString('8   h'));
});

test("can have arbitrary whitespace suffix after", function() {
    same(8, formatter.numberFromString('8h'));
    same(8, formatter.numberFromString('8 h '));
    same(8, formatter.numberFromString('8   h   '));
});

test("accepts regex like suffix", function() {
    formatter.set('suffix', '[a-w]');
    same(8, formatter.numberFromString('8 [a-w]'));
});


module("SC.NumberFormatter with ranges", {
    setup: function() {
        formatter = SC.NumberFormatter.create();
        formatter.set('minimum', 23);
        formatter.set('maximum', 42);
    }
});

test("serializes values that are out of bound", function() {
    same('-10', formatter.stringFromNumber(-10));
    same('100', formatter.stringFromNumber(100));
});

test("rejects numbers that are out of bounds", function() {
    same(NaN, formatter.numberFromString('0'));
    same(NaN, formatter.numberFromString('1000'));
});

test("accepts the boundary numbers", function() {
    same(23, formatter.numberFromString('23'));
    same(42, formatter.numberFromString('42'));
});



// jQuery(function() {
//     setTimeout('window.location.reload()', 3000);
// });

// TODO: can deal with floats


