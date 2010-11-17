SC.FORMAT_INTEGER = "[-+]?\\d+";

SC.NumberFormatter = SC.Object.extend({
    
    // TODO: localize and provide different defaults
    numberFormat: SC.FORMAT_INTEGER,
    
    // no suffix by default
    suffix: '',
    
    // Boundary values are included in allowed values
    minimum: -Infinity,
    maximum: Infinity,
    
    stringFromNumber: function(aNumber){
        var suffix = (this.hasSuffix()) ? ' ' + this.get('suffix') : '';
        return String(aNumber) + suffix;
    },
    
    numberFromString: function(aString) {
        if ( ! this.isStringMatchingFormat(aString))
            return NaN;
        
        var parsedNumber = parseInt(aString, 10);
        
        if (this.isNumberOutsideBounds(parsedNumber))
            return NaN;
        
        return parsedNumber;
    },
    
    // Private methods .....................
    
    format: function() {
        var format = '^\\s*' + this.get('numberFormat');
        if (this.hasSuffix())
            format += '(?:\\s*' + this.get('suffix').escapeForRegExp() + ')?';
        format += '\\s*$';
        
        return new RegExp(format);
    }.property('numberFormat'),
    
    hasSuffix: function() {
        return !! this.get('suffix');
    },
    
    isStringMatchingFormat: function(aString) {
        return this.get('format').test(aString);
    },
    
    isNumberOutsideBounds: function(aNumber) {
        return aNumber < this.get('minimum')
            || aNumber > this.get('maximum');
    }
    
});