// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2009 Sprout Systems, Inc. and contributors.
//            Portions ©2008-2009 Apple, Inc. All rights reserved.
// License:   Licened under MIT license (see license.js)
// ==========================================================================

require('core') ;
/**
  @class

  This permits you to perform queries on your data store,
  written in a SQL-like language. Here is a simple example:
    
    q = SC.Query.create({
      conditions: "firstName = 'Jonny' AND lastName = 'Cash'"
    })
    
  You can check if a certain record matches the query by calling:
  
    q.contains(record)
  
  To find all records of your store, that match query q, use findAll with
  query q as argument:
  
    r = MyApp.store.findAll(q)
  
  r will be a record array containing all matching records.
  To limit the query to a record type of MyApp.MyModel,
  you can specify the type as a property of the query like this:
  
    q = SC.Query.create({ 
      conditions: "firstName = 'Jonny' AND lastName = 'Cash'",
      recordType: MyApp.MyModel 
    })
  
  Calling findAll() like above will now return only records of type t.
  It is recommended to limit your query to a record type, since the query will
  have to look for matching records in the whole store, if no record type
  is given.
  
  You can give an order, which the resulting records should follow, like this:
  
    q = SC.Query.create({ 
      conditions: "firstName = 'Jonny' AND lastName = 'Cash'",
      recordType: MyApp.MyModel,
      orderBy: "lastName, year DESC" 
    })
  
  The default order direction is ascending. You can change it to descending
  by writing DESC behind the property name like in the example above.
  If no order is given, or records are equal in respect to a given order,
  records will be ordered by guid.
  
  
  Features of the query language:
  
  Primitives:
  - record properties
  - null, undefined
  - true, false
  - numbers (integers and floats)
  - strings (double or single quoted)
  
  Parameters:
  - %@ (wild card)
  - {parameterName} (named parameter)
  Wild cards are used to identify parameters by the order in
  which they appear in the query string. Named parameters can be
  used when tracking the order becomes difficult.
  Both types of parameters can be used by giving the parameters
  as a property to your query object:
    yourQuery.parameters = yourParameters
  where yourParameters should have one of the following formats:
    for wild cards: [firstParam, secondParam, thirdParam]
    for named params: {name1: param1, mane2: parma2}
  You cannot use both types of parameters in a single query!
  
  Operators:
  - =
  - !=
  - <
  - <=
  - >
  - >=
  - BEGINS_WITH (checks if a string starts with another one)
  - ENDS_WITH   (checks if a string ends with another one)
  - MATCHES     (checks if a string is matched by a regexp,
                you will have to use a parameter to insert the regexp)
  - ANY         (checks if the thing on its left is contained in the array
                on its right, you will have to use a parameter
                to insert the array)
  - TYPE_IS     (unary operator expecting a string containing the name 
                of a Model class on its right side, only records of this type
                will match)
    
  Boolean Operators:
  - AND
  - OR
  - NOT
  
  Parenthesis for grouping:
  - ( and )
  
  
  Some example queries:
  
  TODO add examples
  
  
  You can extend the query language with your own operators by calling:
  
  SC.Query.registerQueryExtension('your_operator', your_operator_definition)
  
  See details below. As well you can provide your own comparison functions
  to control ordering of specific record properties like this:
  
  SC.Query.registerComparison(property_name, comparison_for_this_property) 
  
  Again see below for details.

  @extends SC.Object
  @static
  @since SproutCore 1.0
*/

SC.Query = SC.Object.extend({

 
  conditions:  null,
  orderBy:     null,
  recordType:  null,
  parameters:  null,
 
  /** 
    Returns YES if record is matched by the query, NO otherwise.
 
    @param {SC.Record} record the record to check
    @returns {Boolean} YES if record belongs, NO otherwise
  */ 
  contains: function(record, wildCardValues) {
    // if called for the first time we have to parse the query
    if (!this.isReady) this.parseQuery();

    // if parsing worked we check if record is contained
    // if parsing failed no record will be contained
    return this.isReady && this.tokenTree.evaluate(record, wildCardValues);
  },
 
  /** 
    Default sort method that is used when calling containsStoreKeys()
    or containsRecords() on this query. Simply materializes two records based 
    on storekeys before passing on to compare() .
 
    @param {Number} storeKey1 a store key
    @param {Number} storeKey2 a store key
    @returns {Number} -1 if record1 < record2,  +1 if record1 > record2, 0 if equal
  */
 
  compareStoreKeys: function(storeKey1, storeKey2) {
    var store = SC.Query._TMP_STORE;
    var queryKey = SC.Query._TMP_QUERY_KEY;
    
    var record1 = store.materializeRecord(storeKey1);
    var record2 = store.materializeRecord(storeKey2);
    
    return queryKey.compare.call(queryKey, record1, record2);
  },
  
  /**
    This will tell you which of the two passed records is greater
    than the other, in respect to the orderBy property of your SC.Query object.
 
    @param {SC.Record} record1 the first record
    @param {SC.Record} record2 the second record
    @returns {Number} -1 if record1 < record2, 
                      +1 if record1 > record2,
                      0 if equal
  */
  compare: function(record1, record2) {
    var result;
    var propertyName;

    // if called for the first time we have to build the order array
    if (!this.isReady) this.parseQuery();
    // if parsing failed we say everything is equal
    if (!this.isReady) return 0;
    
    // for every property specified in orderBy
    for (var i=0, orderLength=this.order.length ; i < orderLength; i++) {
      propertyName = this.order[i].propertyName;
      // if this property has a registered comparison use that
      // if not use default SC.compare()
      if (SC.Query.comparisons[propertyName]) {
        result = SC.Query.comparisons[propertyName](
                  record1.get(propertyName),record2.get(propertyName));
      }
      else {
        result = SC.compare(
                  record1.get(propertyName),record2.get(propertyName));
      }
      if (result != 0) {
        // if order is descending we invert the sign of the result
        if (this.order[i].descending) result = (-1) * result;
        return result;
      }
    };
    // all properties are equal now
    // get order by guid
    return SC.compare(record1.get('guid'),record2.get('guid'));
  },
  
  
  
  /** @private
    Some internal properties
  */
  isReady:        false,
  tokenList:      null,
  usedProperties: null,
  needsRecord:    false,
  tokenTree:      null,
  order:          [],
  
  
  
  /**
    This method has to be called before the query object can be used.
    You will normaly not have to do this, it will be called automatically
    if you try to evaluate a query.
    You can however use this function for testing your queries.
 
    @returns {Boolean} true if parsing succeeded, false otherwise
  */
  parseQuery: function() {
    this.tokenList = this.tokenizeString(this.conditions, this.queryLanguage);
    this.tokenTree = this.buildTokenTree(this.tokenList, this.queryLanguage);
    this.order     = this.buildOrder(this.orderBy);
    
    // maybe we need this later
    // this.usedProperties = this.propertiesUsedInQuery(this.tokenList);
    
    if ( !this.tokenTree || this.tokenTree.error ) {
      return false;
    }  
    else {
      this.isReady = true;
      return true;
    }
  },
  
  
  
  // ..........................................................
  // QUERY LANGUAGE DEFINITION
  //
  
  
  /**
    This is the definition of the query language. You can extend it
    by using SC.Query.registerQueryExtension().
  */
  queryLanguage: {
    'UNKNOWN': {
      firstCharacter:   /[^\s'"\w\d\(\)\{\}]/,
      notAllowed:       /[\s'"\w\d\(\)\{\}]/
    },
    'PROPERTY': {
      firstCharacter:   /[a-zA-Z_]/,
      notAllowed:       /[^a-zA-Z_0-9]/,
      evalType:         'PRIMITIVE',
      evaluate:         function (r,w) { return r.get(this.tokenValue); }
    },
    'NUMBER': {
      firstCharacter:   /\d/,
      notAllowed:       /[^\d\.]/,
      format:           /^\d+$|^\d+\.\d+$/,
      evalType:         'PRIMITIVE',
      evaluate:         function (r,w) { return parseFloat(this.tokenValue); }
    },
    'STRING': {
      firstCharacter:   /['"]/,
      delimeted:        true,
      evalType:         'PRIMITIVE',
      evaluate:         function (r,w) { return this.tokenValue; }
    },
    'PARAMETER': {
      firstCharacter:   /\{/,
      lastCharacter:    '}',
      delimeted:        true,
      evalType:         'PRIMITIVE',
      evaluate:         function (r,w) { return w[this.tokenValue]; }
    },
    '%@': {
      rememberCount:    true,
      reservedWord:     true,
      evalType:         'PRIMITIVE',
      evaluate:         function (r,w) { return w[this.tokenValue]; }
    },
    'OPEN_PAREN': {
      firstCharacter:   /\(/,
      singleCharacter:  true
    },
    'CLOSE_PAREN': {
      firstCharacter:   /\)/,
      singleCharacter:  true
    },
    'AND': {
      reservedWord:     true,
      leftType:         'BOOLEAN',
      rightType:        'BOOLEAN',
      evalType:         'BOOLEAN',
      evaluate:         function (r,w) {
                          var left  = this.leftSide.evaluate(r,w);
                          var right = this.rightSide.evaluate(r,w);
                          return left && right;
                        }
    },
    'OR': {
      reservedWord:     true,
      leftType:         'BOOLEAN',
      rightType:        'BOOLEAN',
      evalType:         'BOOLEAN',
      evaluate:         function (r,w) {
                          var left  = this.leftSide.evaluate(r,w);
                          var right = this.rightSide.evaluate(r,w);
                          return left || right;
                        }
    },
    'NOT': {
      reservedWord:     true,
      rightType:        'BOOLEAN',
      evalType:         'BOOLEAN',
      evaluate:         function (r,w) {
                          var right = this.rightSide.evaluate(r,w);
                          return !right;
                        }
    },
    '=': {
      reservedWord:     true,
      leftType:         'PRIMITIVE',
      rightType:        'PRIMITIVE',
      evalType:         'BOOLEAN',
      evaluate:         function (r,w) {
                          var left  = this.leftSide.evaluate(r,w);
                          var right = this.rightSide.evaluate(r,w);
                          return left == right;
                        }
    },
    '!=': {
      reservedWord:     true,
      leftType:         'PRIMITIVE',
      rightType:        'PRIMITIVE',
      evalType:         'BOOLEAN',
      evaluate:         function (r,w) {
                          var left  = this.leftSide.evaluate(r,w);
                          var right = this.rightSide.evaluate(r,w);
                          return left != right;
                        }
    },
    '<': {
      reservedWord:     true,
      leftType:         'PRIMITIVE',
      rightType:        'PRIMITIVE',
      evalType:         'BOOLEAN',
      evaluate:         function (r,w) {
                          var left  = this.leftSide.evaluate(r,w);
                          var right = this.rightSide.evaluate(r,w);
                          return left < right;
                        }
    },
    '<=': {
      reservedWord:     true,
      leftType:         'PRIMITIVE',
      rightType:        'PRIMITIVE',
      evalType:         'BOOLEAN',
      evaluate:         function (r,w) {
                          var left  = this.leftSide.evaluate(r,w);
                          var right = this.rightSide.evaluate(r,w);
                          return left <= right;
                        }
    },
    '>': {
      reservedWord:     true,
      leftType:         'PRIMITIVE',
      rightType:        'PRIMITIVE',
      evalType:         'BOOLEAN',
      evaluate:         function (r,w) {
                          var left  = this.leftSide.evaluate(r,w);
                          var right = this.rightSide.evaluate(r,w);
                          return left > right;
                        }
    },
    '>=': {
      reservedWord:     true,
      leftType:         'PRIMITIVE',
      rightType:        'PRIMITIVE',
      evalType:         'BOOLEAN',
      evaluate:         function (r,w) {
                          var left  = this.leftSide.evaluate(r,w);
                          var right = this.rightSide.evaluate(r,w);
                          return left >= right;
                        }
    },
    'BEGINS_WITH': {
      reservedWord:     true,
      leftType:         'PRIMITIVE',
      rightType:        'PRIMITIVE',
      evalType:         'BOOLEAN',
      evaluate:         function (r,w) {
                          var all   = this.leftSide.evaluate(r,w);
                          var start = this.rightSide.evaluate(r,w);
                          return ( all.substr(0,start.length) == start );
                        }
    },
    'ENDS_WITH': {
      reservedWord:     true,
      leftType:         'PRIMITIVE',
      rightType:        'PRIMITIVE',
      evalType:         'BOOLEAN',
      evaluate:         function (r,w) {
                          var all = this.leftSide.evaluate(r,w);
                          var end = this.rightSide.evaluate(r,w);
                          var suf = all.substring(all.length-end.length,all.length);
                          return suf == end;
                        }
    },
    'ANY': {
      reservedWord:     true,
      leftType:         'PRIMITIVE',
      rightType:        'PRIMITIVE',
      evalType:         'BOOLEAN',
      evaluate:         function (r,w) {
                          var prop   = this.leftSide.evaluate(r,w);
                          var values = this.rightSide.evaluate(r,w);
                          var found  = false;
                          var i      = 0;
                          while ( found==false && i<values.length ) {
                            if ( prop == values[i] ) found = true;
                            i++;
                          };
                          return found;
                        }
    },
    'MATCHES': {
      reservedWord:     true,
      leftType:         'PRIMITIVE',
      rightType:        'PRIMITIVE',
      evalType:         'BOOLEAN',
      evaluate:         function (r,w) {
                          var toMatch = this.leftSide.evaluate(r,w);
                          var matchWith = this.rightSide.evaluate(r,w);
                          return matchWith.test(toMatch);
                        }
    },
    'TYPE_IS': {
      reservedWord:     true,
      rightType:        'PRIMITIVE',
      evalType:         'BOOLEAN',
      evaluate:         function (r,w) {
                          var actualType = SC.Store.recordTypeFor(r.storeKey);
                          var right      = this.rightSide.evaluate(r,w);
                          var expectType = SC.objectForPropertyPath(right);
                          return actualType == expectType;
                        }
    },
    'null': {
      reservedWord:     true,
      evalType:         'PRIMITIVE',
      evaluate:         function (r,w) { return null; }
    },
    'undefined': {
      reservedWord:     true,
      evalType:         'PRIMITIVE',
      evaluate:         function (r,w) { return undefined; }
    },
    'false': {
      reservedWord:     true,
      evalType:         'PRIMITIVE',
      evaluate:         function (r,w) { return false; }
    },
    'true': {
      reservedWord:     true,
      evalType:         'PRIMITIVE',
      evaluate:         function (r,w) { return true; }
    }
  },
  

  // ..........................................................
  // TOKENIZER
  //
  
  
  /**
    Takes a string and tokenizes it based on the grammar definition
    provided. Called by parseQuery().
    
    @param {String} inputString the string to tokenize
    @param {Object} grammar the grammar definition (normally queryLanguage)
    @returns {Array} list of tokens
  */
  tokenizeString: function (inputString, grammar) {
	
	
    var tokenList           = [];
    var c                   = null;
  	var t                   = null;
  	var token               = null;
    var tokenType           = null;
    var currentToken        = null;
    var currentTokenType    = null;
    var currentTokenValue   = null;
    var currentDelimeter    = null;
    var endOfString         = false;
    var endOfToken          = false;
    var belongsToToken      = false;
    var skipThisCharacter   = false;
    var rememberCount       = {};
  
  
    // helper function that adds tokens to the tokenList
  
    function addToken (tokenType, tokenValue) {
      t = grammar[tokenType];
      //tokenType = t.tokenType;
      
      // handling of special cases
      // check format
      if ( t.format && !t.format.test(tokenValue) ) 
        tokenType = "UNKNOWN";
      // delimeted token (e.g. by ")
      if ( t.delimeted ) 
        skipThisCharacter = true;
      // reserved words
      if ( !t.delimeted ) {
        for ( var anotherToken in grammar ) {
          if ( grammar[anotherToken].reservedWord
               && anotherToken == tokenValue ) {
            tokenType = anotherToken;
          }
        }
      };
      // reset t
      t = grammar[tokenType];
      // remembering count type
      if ( t && t.rememberCount ) {
        if (!rememberCount[tokenType]) rememberCount[tokenType] = 0;
        tokenValue = rememberCount[tokenType];
        rememberCount[tokenType] += 1;
      };

      // push token to list
      tokenList.push( {tokenType: tokenType, tokenValue: tokenValue} );

      // and clean up currentToken
      currentToken      = null;
      currentTokenType  = null;
      currentTokenValue = null;
    };
  
  
    // stepping through the string:
    
    if (!inputString) return [];
    
    for (var i=0; i < inputString.length; i++) {
      
      // end reached?
      endOfString = (i==inputString.length-1);
      
      // current character
      c = inputString[i];
    
      // set true after end of delimeted token so that
      // final delimeter is not catched again
      skipThisCharacter = false;
        
    
      // if currently inside a token
    
      if ( currentToken ) {
      
        // some helpers
        t = grammar[currentToken];
        endOfToken = (t.delimeted) ? c==currentDelimeter : t.notAllowed.test(c);
      
        // if still in token
        if ( !endOfToken )
          currentTokenValue += c;
      
        // if end of token reached
        if ( endOfToken || endOfString )
          addToken(currentToken, currentTokenValue);
      
        // if end of string don't check again
        if ( endOfString && !endOfToken )
          skipThisCharacter = true;
      };
    
 
    
      // if not inside a token, look for next one
    
      if ( !currentToken && !skipThisCharacter ) {
        // look for matching tokenType
        for ( token in grammar ) {
          t = grammar[token];
          if ( t.firstCharacter && t.firstCharacter.test(c) )
            currentToken = token;
        };

        // if tokenType found
        if ( currentToken ) {
          t = grammar[currentToken];
          currentTokenValue = c;
          // handling of special cases
          if ( t.delimeted ) {
            currentTokenValue = "";
            if ( t.lastCharacter ) 
              currentDelimeter = t.lastCharacter;
            else
              currentDelimeter = c;
          };
          if ( t.singleCharacter || endOfString )
            addToken(currentToken, currentTokenValue);
        };
      };
    };
    return tokenList;
  },
  
  
  
  // ..........................................................
  // BUILD TOKEN TREE
  //
  
  /**
    Takes an array of tokens and returns a tree, depending on the
    specified tree logic. The returned object will have an error property
    if building of the tree failed. Check it to get some information
    about what happend.
    If everything worked the tree can be evaluated by calling:
    
      tree.evaluate(record, parameters)
    
    If tokenList is empty, a single token will be returned which will
    evaluate to true for all records.
    
    @param {Array} tokenList the list of tokens
    @param {Object} treeLogic the logic definition (normally queryLanguage)
    @returns {Object} token tree
  */
  buildTokenTree: function (tokenList, treeLogic) {
  
    var l                    = tokenList.slice();
    var i                    = 0;
    var openParenthesisStack = [];
    var shouldCheckAgain     = false;
    var error                = [];
    
  
    // empty tokenList is a special case
    if (!tokenList || tokenList.length == 0){
      return {evaluate: function(){return true;}};
    }
  
  
    // some helper functions
  
    function tokenLogic (position) {
      var p = position;
      if ( p < 0 ) return false;
      
      tl = treeLogic[l[p].tokenType];
      
      if ( ! tl ) {
        error.push("logic for token '"+l[p].tokenType+"' is not defined");
        return false;
      };

      // save evaluate in token, so that we don't have
      // to look it up again when evaluating the tree
      l[p].evaluate = tl.evaluate;
      return tl;
    };
  
    function expectedType (side, position) {
      var p = position;
      var tl = tokenLogic(p);
      if ( !tl )            return false;
      if (side == 'left')   return tl.leftType;
      if (side == 'right')  return tl.rightType;
    };
  
    function evalType (position) {
      var p = position;
      var tl = tokenLogic(p);
      if ( !tl )  return false;
      else        return tl.evalType;
    };
  
    function removeToken (position) {
      l.splice(position, 1);
      if ( position <= i ) i--;
    };
  
    function preceedingTokenExists (position) {
      var p = position || i;
      if ( p > 0 )  return true;
      else          return false;
    };
  
    function tokenIsMissingChilds (position) {
      var p = position;
      if ( p < 0 )  return true;
      if (( expectedType('left',p) && !l[p].leftSide )
              || ( expectedType('right',p) && !l[p].rightSide ))
                    return true;
      else          return false;
    };
  
    function typesAreMatching (parent, child) {
      var side = (child < parent) ? 'left' : 'right';
      if ( parent < 0 || child < 0 )                      return false;
      if ( !expectedType(side,parent) )                   return false;
      if ( !evalType(child) )                             return false;
      if ( expectedType(side,parent) == evalType(child) ) return true;
      else                                                return false;
    };
  
    function preceedingTokenCanBeMadeChild (position) {
      var p = position;
      if ( !tokenIsMissingChilds(p) )   return false;
      if ( !preceedingTokenExists(p) )  return false;
      if ( typesAreMatching(p,p-1) )    return true;
      else                              return false;
    };
  
    function preceedingTokenCanBeMadeParent (position) {
      var p = position;
      if ( tokenIsMissingChilds(p) )    return false;
      if ( !preceedingTokenExists(p) )  return false;
      if ( !tokenIsMissingChilds(p-1) ) return false;
      if ( typesAreMatching(p-1,p) )    return true;
      else                              return false;
    };
  
    function makeChild (position) {
      var p = position;
      if (p<1) return false;
      l[p].leftSide = l[p-1];
      removeToken(p-1);
    };
  
    function makeParent (position) {
      var p = position;
      if (p<1) return false;
      l[p-1].rightSide = l[p];
      removeToken(p);
    };
  
    function removeParenthesesPair (position) {
      removeToken(position);
      removeToken(openParenthesisStack.pop());
    };
  
    // step through the tokenList
  
    for (i=0; i < l.length; i++) {
      shouldCheckAgain = false;
    
      if ( l[i].tokenType == 'UNKNOWN' )
        error.push('found unknown token: '+l[i].tokenValue);
      
      if ( l[i].tokenType == 'OPEN_PAREN' )
        openParenthesisStack.push(i);
      
      if ( l[i].tokenType == 'CLOSE_PAREN' )      
        removeParenthesesPair(i);
      
      if ( preceedingTokenCanBeMadeChild(i) ) 
        makeChild(i);
      
      if ( preceedingTokenCanBeMadeParent(i) ){
        makeParent(i);
        shouldCheckAgain = true;
      } 
      
      if ( shouldCheckAgain ) i--;
    
    };
  
    // error if tokenList l is not a single token now
    if (l.length == 1) l = l[0];
    else error.push('string did not resolve to a single tree');
  
    // error?
    if (error.length > 0) return {error: error.join(',\n'), tree: l};
    // everything fine - token list is now a tree and can be returned
    else return l;
  
  },
  
  
  // ..........................................................
  // ORDERING
  //
  
  /**
    Takes a string containing an order statement and returns an array
    describing this order for easier processing.
    Called by parseQuery().
    
    @param {String} orderString the string containing the order statement
    @returns {Array} array of order statement
  */
  buildOrder: function (orderString) {
    if (!orderString) {
      return [];
    }
    else {
      var o = orderString.split(',');
      for (var i=0; i < o.length; i++) {
        var p = o[i];
        p = p.replace(/^\s+|\s+$/,'');
        p = p.replace(/\s+/,',');
        p = p.split(',');
        o[i] = {propertyName: p[0]};
        if (p[1] && p[1] == 'DESC') o[i].descending = true;
      };
      return o;
    }
    
  }
  
  
  // ..........................................................
  // OTHER HELPERS
  // not used right now
  
  // propertiesUsedInQuery: function (tokenList) {
  //   var propertyList = [];
  //   for (var i=0; i < tokenList.length; i++) {
  //     if (tokenList[i].tokenType == 'PROPERTY') propertyList.push(tokenList[i].tokenValue);
  //   };
  //   return propertyList;
  // }
  

});


// Class Methods
SC.Query.mixin( /** @scope SC.Query */ {
  /**
    Will find which records match a given SC.Query and return the storeKeys.
    This will also apply the sorting for the query
    
    @param {SC.Query} query to apply
    @param {Array} storeKeys to search within
    @param {SC.Store} store to materialize record from during sort
    @returns {Array} array instance of store keys matching the SC.Query (sorted)
  */
  
  containsStoreKeys: function(query, storeKeys, store) {
    var ret = [];
    var recType = query.get('recordType');
    // if storeKeys is not set, just get all storeKeys for this record type,
    // or all storeKeys in store if no record type is given
    if(!storeKeys) {
      if(recType) {
        storeKeys = store.storeKeysFor(recType);
      }
      else {
        storeKeys = store.storeKeys();
      }
    }
    
    for(var idx=0,len=storeKeys.length;idx<len;idx++) {
      var record = store.materializeRecord(storeKeys[idx]);
      if(record && query.contains(record)) ret.push(storeKeys[idx]);
    }
    
    SC.Query.orderStoreKeys(ret, query, store);
    
    return ret;
  },
  
  /**
    Will find which records match a give SC.Query and return an array of 
    store keys. This will also apply the sorting for the query.
    
    @param {SC.Query} query to apply
    @param {SC.RecordArray} records to search within
    @param {SC.Store} store to materialize record from
    @returns {Array} array instance of store keys matching the SC.Query (sorted)
  */
  
  containsRecords: function(query, records, store) {
    var ret = [];
    for(var idx=0,len=records.get('length');idx<len;idx++) {
      var record = records.objectAt(idx);
      if(record && query.contains(record)) {
        ret.push(record.get('storeKey'));
      }
    }
    
    SC.Query.orderStoreKeys(ret, query, store);
    
    return ret;
  },
  
  /** 
    Sorts a set of store keys according to the orderBy property
    of the SC.Query.
    
    @param {Array} storeKeys to sort
    @param {SC.Query} query to use for sorting
    @param {SC.Store} store to materialize records from
  */
  
  orderStoreKeys: function(storeKeys, query, store) {
    // apply the sort if there is one
    if(query.get('orderBy') && storeKeys) {
      // TODO: hack for now to get around the fact that we cannot pass
      // additional parameters to .sort()
      SC.Query._TMP_STORE = store;
      SC.Query._TMP_QUERY_KEY = query;
      storeKeys.sort(query.compareStoreKeys);
      delete SC.Query._TMP_STORE;
      delete SC.Query._TMP_QUERY_KEY;
    }
  }
  
});


/** @private
  Hash of registered comparisons by propery name. 
*/
SC.Query.comparisons = {};

/**
  Call to register a comparison for a specific property name.
  The function you pass should accept two values of this property
  and return -1 if the first is smaller than the second,
  0 if they are equal and 1 if the first is greater than the second.
  
  @param {String} name of the record property
  @param {Function} custom comparison function
  @returns {SC.Query} receiver
*/
SC.Query.registerComparison = function(propertyName, comparison) {
  SC.Query.comparisons[propertyName] = comparison;
};


/**
  Call to register an extension for the query language.
  You shoud provide a name for your extension and a definition
  specifying how it should be parsed and evaluated.
  
  Have a look at queryLanguage for examples of definitions.
  
  TODO add better documentation here
  
  @param {String} tokenName name of the operator
  @param {Object} token extension definition
  @returns {SC.Query} receiver
*/
SC.Query.registerQueryExtension = function(tokenName, token) {
  SC.Query.prototype.queryLanguage[tokenName] = token;
};
