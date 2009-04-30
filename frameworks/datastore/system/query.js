// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2009 Sprout Systems, Inc. and contributors.
//            Portions ©2008-2009 Apple, Inc. All rights reserved.
// License:   Licened under MIT license (see license.js)
// ==========================================================================

require('core') ;
/**
  @class

  A Query permits you to write queries on your data store in a SQL-like language.
  Here is a simple example:
    q = SC.Query.create({queryString:"firstName = 'Jonny' AND lastName = 'Cash'"})
  You can check if a certain record matches the query by calling:
    q.contains(record)
  Normally you will not use SC.Query directly, instead you will write:
    r = MyApp.store.findAll("firstName = 'Jonny' AND lastName = 'Cash'")
  r will be a record array containing all matching records. (This does not work yet!)
  
  
  Features of the query language:
  
  Primitives:
  - record properties (just include a property you want to check)
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
  Both types of parameters can be used by calling:
    query.contains(record,parameters)
  where parameters should have the one of the following formats:
    for wild cards: [firstParam, secondParam, thirdParam]
    for named params: {firstParamName: firstParamValue, secondParamName: secondParamValue}
  You cannot use both types of parameters in a single query!
  
  Comparators:
  - =
  - !=
  - <
  - <=
  - >
  - >=
  - BEGINS_WITH (checks if a string starts with another one)
  - ENDS_WITH (checks if a string ends with another one)
  - MATCHES (checks if a string is matched by a regexp,
    you will have to use a parameter to insert the regexp)
  - ANY (checks if the thing on its left is contained in the array
    on its right, you will have to use a parameter to insert the array)
    
  Boolean Operators:
  - AND
  - OR
  - NOT
  
  Parenthesis for grouping:
  - ( and )
  
  
  Some example queries:
  
  TODO add examples
  

  @extends SC.Object
  @static
  @since SproutCore 1.0
*/

SC.Query = SC.Object.extend({

 
  queryString: null,
  orderBy:     null,
  recordType:  null,
 
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
    if ( this.isReady && this.tokenTree.evaluate(record, wildCardValues) )
      return true;
    else
      return false;
  },
 
  /**
    Not implemented yet!
    Override to compare two records according to any predefined order.  This will be used
    to sort the result set.  Assume the records you are passed have already been checked
    for membership via contains().
 
    @param {SC.Record} record1 the first record
    @param {SC.Record} record2 the second record
    @returns {Number} -1 if record1 < record2,  +1 if record1 > record2, 0 if equal
  */
  compare: function(record1, record2) {
    var result = 0;
    // if called for the first time we have to build the order array
    if ( this.order.length == 0 ) this.buildOrder();
    
    // for every key specified in orderBy
    for (var i=0; i < this.order.length; i++) {
      result = this.compareByProperty(record1, record2, this.order[i]);
      if (result != 0) return result;
    };
    return result;
  },
  
  
  // ..........................................................
  // INTERNAL PROPERTIES
  //
  
  // for containment:
  
  isReady:        false,
  tokenList:      null,
  usedProperties: null,
  needsRecord:    false,
  tokenTree:      null,
  
  // for comparison:
  
  order:          [],
  
  // ..........................................................
  // QUERY LANGUAGE DEFINITION
  //
  
  queryGrammar: {
  
    generalTypes        : {
      'UNKNOWN'         : {
        firstCharacter  : /\S/,
        notAllowed      : /[\s'"\w\d\(\)\{\}]/
                        },
      'PROPERTY'        : {
        firstCharacter  : /[a-zA-Z_]/,
        notAllowed      : /[^a-zA-Z_0-9]/
                        },
      'NUMBER'          : {
        firstCharacter  : /\d/,
        notAllowed      : /[^\d\.]/,
        format          : /^\d+$|^\d+\.\d+$/
                        },
      'STRING'          : {
        firstCharacter  : /['"]/,
        delimeted       : true
                        },
      'PARAMETER'       : {
        firstCharacter  : /\{/,
        lastCharacter   : '}',
        delimeted       : true
                        },
      'OPEN_PAREN'      : {
        firstCharacter  : /\(/,
        singleCharacter : true
                        },
      'CLOSE_PAREN'     : {
        firstCharacter  : /\)/,
        singleCharacter : true
                        },
      'WILD_CARD'       : {
        rememberCount   : true
                        }
                        },
    reservedTypes       : {
      'WILD_CARD'       : ['%@'],
      'COMPARATOR'      : ['=','!=','<','<=','>','>=','BEGINS_WITH','ENDS_WITH','ANY','MATCHES'],
      'BOOL_OP'         : ['NOT','AND','OR'],
      'BOOL_VAL'        : ['false','true'],
      'NULL'            : ['null','undefined']
                        }
  },

  queryLogic: {
    'PROPERTY'        : {
      evalType        : 'PRIMITIVE',
      evaluate        : function (r,w) { return r.get(this.tokenValue) },
      evaluateNR      : function (r,w) { return r.get(this.tokenValue) }
                      },
    'STRING'          : {
      evalType        : 'PRIMITIVE',
      evaluate        : function (r,w) { return this.tokenValue }
                      },
    'NUMBER'          : {
      evalType        : 'PRIMITIVE',
      evaluate        : function (r,w) { return parseFloat(this.tokenValue) }
                      },
    'BOOL_VAL'        : {
      evalType        : 'PRIMITIVE',
      evaluate        : function (r,w) { if (this.tokenValue == 'true') return true; else return false }
                      },
    'NULL'            : {
      evalType        : 'PRIMITIVE',
      evaluate        : function (r,w) { return null }
                      },
    'WILD_CARD'       : {
      evalType        : 'PRIMITIVE',
      evaluate        : function (r,w) { return w[this.tokenValue] }
                      },
    'PARAMETER'       : {
      evalType        : 'PRIMITIVE',
      evaluate        : function (r,w) { return w[this.tokenValue] }
                      },
    'COMPARATOR'      : {
      dependsOnValue  : true,
      '='             : {
        leftType      : 'PRIMITIVE',
        rightType     : 'PRIMITIVE',
        evalType      : 'BOOLEAN',
        evaluate      : function (r,w) { return ( this.leftSide.evaluate(r,w) == this.rightSide.evaluate(r,w) ) }
                      },
      '!='            : {
        leftType      : 'PRIMITIVE',
        rightType     : 'PRIMITIVE',
        evalType      : 'BOOLEAN',
        evaluate      : function (r,w) { return ( this.leftSide.evaluate(r,w) != this.rightSide.evaluate(r,w) ) }
                      },
      '<'             : {
        leftType      : 'PRIMITIVE',
        rightType     : 'PRIMITIVE',
        evalType      : 'BOOLEAN',
        evaluate      : function (r,w) { return ( this.leftSide.evaluate(r,w) < this.rightSide.evaluate(r,w) ) }
                      },
      '<='            : {
        leftType      : 'PRIMITIVE',
        rightType     : 'PRIMITIVE',
        evalType      : 'BOOLEAN',
        evaluate      : function (r,w) { return ( this.leftSide.evaluate(r,w) <= this.rightSide.evaluate(r,w) ) }
                      },
      '>'             : {
        leftType      : 'PRIMITIVE',
        rightType     : 'PRIMITIVE',
        evalType      : 'BOOLEAN',
        evaluate      : function (r,w) { return ( this.leftSide.evaluate(r,w) > this.rightSide.evaluate(r,w) ) }
                      },
      '>='            : {
        leftType      : 'PRIMITIVE',
        rightType     : 'PRIMITIVE',
        evalType      : 'BOOLEAN',
        evaluate      : function (r,w) { return ( this.leftSide.evaluate(r,w) >= this.rightSide.evaluate(r,w) ) }
                      },
      'BEGINS_WITH'   : {
        leftType      : 'PRIMITIVE',
        rightType     : 'PRIMITIVE',
        evalType      : 'BOOLEAN',
        evaluate      : function (r,w) {
                          var all   = this.leftSide.evaluate(r,w);
                          var start = this.rightSide.evaluate(r,w);
                          return ( all.substr(0,start.length) == start );
                        }
                      },
      'ENDS_WITH'     : {
        leftType      : 'PRIMITIVE',
        rightType     : 'PRIMITIVE',
        evalType      : 'BOOLEAN',
        evaluate      : function (r,w) {
                          var all = this.leftSide.evaluate(r,w);
                          var end = this.rightSide.evaluate(r,w);
                          return ( all.substring(all.length-end.length,all.length) == end );
                        }
                      },
      'MATCHES'       : {
        leftType      : 'PRIMITIVE',
        rightType     : 'PRIMITIVE',
        evalType      : 'BOOLEAN',
        evaluate      : function (r,w) {
                          var toMatch = this.leftSide.evaluate(r,w);
                          var matchWith = this.rightSide.evaluate(r,w);
                          return matchWith.test(toMatch);
                        }
                      },
      'ANY'           : {
        leftType      : 'PRIMITIVE',
        rightType     : 'PRIMITIVE',
        evalType      : 'BOOLEAN',
        evaluate      : function (r,w) {
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
                      },                
    'BOOL_OP'         : {
      dependsOnValue  : true,
      'AND'           : {
        leftType      : 'BOOLEAN',
        rightType     : 'BOOLEAN',
        evalType      : 'BOOLEAN',
        evaluate      : function (r,w) { return ( this.leftSide.evaluate(r,w) && this.rightSide.evaluate(r,w) ) }
                      },
      'OR'            : {
        leftType      : 'BOOLEAN',
        rightType     : 'BOOLEAN',
        evalType      : 'BOOLEAN',
        evaluate      : function (r,w) { return ( this.leftSide.evaluate(r,w) || this.rightSide.evaluate(r,w) ) }
                      },
      'NOT'           : {
        rightType     : 'BOOLEAN',
        evalType      : 'BOOLEAN',
        evaluate      : function (r,w) { return ( ! this.rightSide.evaluate(r,w) ) }
                      },
                      },
    'OPEN_PAREN'      : 'nothing',
    'CLOSE_PAREN'     : 'nothing'
  },
  
  
  // ..........................................................
  // PARSING THE QUERY
  //
  
  parseQuery: function() {

    this.tokenList      = this.tokenizeString(this.queryString, this.queryGrammar);
    this.usedProperties = this.propertiesUsedInQuery(this.tokenList);
    this.needsRecord    = false; // this.willNeedRecord(usedProperties)
    this.tokenTree      = this.buildTokenTree(this.tokenList, this.queryLogic);
    
    if ( !this.tokenTree || this.tokenTree.error )
      return false;
    else {
      this.isReady = true;
      return true;
    }
  },
  
  
  // ..........................................................
  // TOKENIZER
  //
  
  tokenizeString: function (inputString, grammar) {
	
  	// takes a string and returns an array of tokens
  	// depending on the grammar specified
	
  	// currently there is no form of syntax validation !
	
	
    var tokenList           = [];
    var c                   = null;
  	var t                   = null;
    var tokenType           = null;
    var currentTokenType    = null;
    var currentTokenValue   = null;
    var currentDelimeter    = null;
    var endOfString         = false;
    var belongsToToken      = false;
    var skipThisCharacter   = false;
    var rememberCount       = {};
  
  
    // helper function that adds tokens to the tokenList
  
    function addToken (tokenType, tokenValue) {
      t = grammar.generalTypes[tokenType];

      // handling of special cases
      // check format
      if ( t.format && !t.format.test(tokenValue) ) 
        tokenType = "UNKNOWN";
      // delimeted token (e.g. by ")
      if ( t.delimeted ) 
        skipThisCharacter = true;
      // reserved type
      if ( !t.delimeted ) {
        for ( reservedType in grammar.reservedTypes ) {
          if ( grammar.reservedTypes[reservedType].indexOf(tokenValue) >= 0 ) {
            tokenType = reservedType;
            t = grammar.generalTypes[tokenType];
          }
        }
      };
      // remembering count type
      if ( t && t.rememberCount ) {
        if (!rememberCount[tokenType]) rememberCount[tokenType] = 0;
        tokenValue = rememberCount[tokenType];
        rememberCount[tokenType] += 1;
      };

      // push token to list
      tokenList.push( {tokenType: tokenType, tokenValue: tokenValue} );

      // and clean up currentToken
      currentTokenType  = null;
      currentTokenValue = null;
    };
  
  
    // stepping through the string:
    
    for (var i=0; i < inputString.length; i++) {
      
      // end reached?
      endOfString = (i==inputString.length-1);
      
      // current character
      c = inputString[i];
    
      // set true after end of delimeted token so that final delimeter is not catched again
      skipThisCharacter = false;
        
    
      // if currently inside a token
    
      if ( currentTokenType ) {
      
        // some helpers
        t = grammar.generalTypes[currentTokenType];
        endOfToken  = (t.delimeted) ? (c==currentDelimeter) : (t.notAllowed.test(c));
      
        // if still in token
        if ( !endOfToken )
          currentTokenValue += c;
      
        // if end of token reached
        if ( endOfToken || endOfString )
          addToken(currentTokenType, currentTokenValue);
      
        // if end of string don't check again
        if ( endOfString && !endOfToken )
          skipThisCharacter = true;
      };
    
 
    
      // if not inside a token, look for next one
    
      if ( !currentTokenType && !skipThisCharacter ) {
        // look for matching tokenType
        for ( tokenType in grammar.generalTypes ) {
          t = grammar.generalTypes[tokenType];
          if ( t.firstCharacter && t.firstCharacter.test(c) )
            currentTokenType = tokenType;
        };
        // if tokenType found
        if ( currentTokenType ) {
          t = grammar.generalTypes[currentTokenType];
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
            addToken(currentTokenType, currentTokenValue);
        };
      };
    };
    return tokenList;
  },
  
  
  
  // ..........................................................
  // BUILD TOKEN TREE
  //
  
  buildTokenTree: function (tokenList, treeLogic) {
    
    /**
      Takes a list of tokens and returns a tree, depending on the specified tree logic.
      The returned object will have an error property if building of the tree failed.
      Check it to get some information about what happend.
      If everything worked the tree can be evaluated by calling:
      tree.evaluate(record,queryValues)
    */
  
    var l                    = tokenList.slice();
    var i                    = 0;
    var openParenthesisStack = [];
    var shouldCheckAgain     = false;
    var error                = [];

  
  
    // some helper functions
  
    function tokenLogic (position) {
      var p = position;
      if ( p < 0 ) return false;
      var tl = treeLogic[l[p].tokenType];
      if ( ! tl ) {
        error.push("logic for token '"+l[p].tokenType+"' is not defined");
        return false;
      };
      if ( tl.dependsOnValue ) tl=tl[l[p].tokenValue];
      if ( ! tl ) {
        error.push("logic for token '"+l[p].tokenType+"':'"+l[p].tokenValue+"' is not defined");
        return false;
      };
      // save tokenLogic in token, so that we don't have to look it up again when evaluating the tree
      /*
      if ( this.needsRecord && tl.evaluateNR )
        l[p].evaluate = tl.evaluateNR;
      else
        l[p].evaluate = tl.evaluate;
      */
      l[p].evaluate = (this.needsRecord && tl.evaluateNR) ? tl.evaluateNR : tl.evaluate;
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
      if ( parent < 0 || child < 0 )    return false;
      if ( !expectedType(side,parent) ) return false;
      if ( !evalType(child) )           return false;
      else                              return (expectedType(side,parent) == evalType(child));
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
    
      if ( l[i].tokenType == 'UNKNOWN' )          error.push('found unknown token: '+l[i].tokenValue);
      if ( l[i].tokenType == 'OPEN_PAREN' )       openParenthesisStack.push(i);
      if ( l[i].tokenType == 'CLOSE_PAREN' )      removeParenthesesPair(i);
      if ( preceedingTokenCanBeMadeChild(i) )     makeChild(i);
      if ( preceedingTokenCanBeMadeParent(i) )  { makeParent(i);
                                                  shouldCheckAgain = true; }; 
      if ( shouldCheckAgain )                     i--;
    
    
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
  
  compareByProperty: function (record1, record2, property) {
    
  },
  
  
  
  // ..........................................................
  // OTHER HELPERS
  //
  
  propertiesUsedInQuery: function (tokenList) {
    var propertyList = [];
    for (var i=0; i < tokenList.length; i++) {
      if (tokenList[i].tokenType == 'PROPERTY') propertyList.push(tokenList[i].tokenValue);
    };
    return propertyList;
  }
  

});






// Old code by Peter:
//
//SC.Query = SC.SparseArray.extend(
///** @scope SC.Query.prototype */ {
//
//  queryString: '',
//  truthFunction: null,
//  conditions: null,
//  store: null,
//  // delegate: null,  
//  recordType: null,
//  needRecord: false,
//  
//  length: 0,
//  
//  createTruthFunction: function(queryString) {
//    this.set('queryString', queryString);
//    
//    /* Need parsing here from Thomas.. curently hacked. */
//    var hackComponents = [queryString.split('=')[0]];
//    
//    var components = queryString.split('=');
//    
//    var needRecord = this.willNeedRecord(hackComponents);
//    this.set('needRecord', needRecord);
//
//    if(needRecord) {
//      this.truthFunction = function(rec, conditions) {
//          if(!rec) return NO;
//          return (rec.get(components[0]) == conditions[0]);
//      };
//    } else {
//      this.truthFunction = function(rec, conditions) {
//          if(!rec) return NO;
//          return (rec[components[0]] == conditions[0]);
//      };
//    }
//  },
//  
//  willNeedRecord: function(components) {
//    
//    var rec = this.get('delegate').createCompRecord(this.get('recordType'));
//    var needRecord = NO;
//    for(var i=0, iLen=components.length; i<iLen; i++) {
//      if(rec[components[i]]) {
//        needRecord = YES;
//      }
//    }
//    console.log('needRecord: ' + needRecord);
//    return needRecord;
//  },
//
//  
//  parse: function(recordType, queryString, conditions) {
//    this.set('recordType', recordType);
//    this.createTruthFunction(queryString);
//    this.loadConditions(conditions);
//  },
//  
//  loadConditions: function(conditions) {
//    if(!conditions) {
//      conditions = null;
//    }
//    this.set('conditions', conditions);
//  },
//  
//  performQuery: function() {
//    var store = this.get('delegate');
//
//    if(!store) return null;
//    
//    this.beginPropertyChanges();
//    
//    this._storeKeysForQuery = store.performQuery(this);
//    this.set('length', this._storeKeysForQuery.length);
//
//  //  this.enumerableContentDidChange() ;
//    this.endPropertyChanges();
//    return this;
//  },
//
//  recordsDidChange: function() {
//    this.invokeOnce(this.performQuery);
//  },
//  
//  objectAt: function(idx)
//  {
//    if (idx < 0) return undefined ;
//    if (idx >= this.get('length')) return undefined;
//    return this.fetchContentAtIndex(idx);
//  },
//
//  fetchContentAtIndex: function(idx) {
//    var store = this.get('delegate') ;
//    var storeKey = this._storeKeysForQuery[idx];
//    var ret = null; 
//    if(store && storeKey) {
//      ret = store.materializeRecord(storeKey);
//    }
//    return ret;
//  },
//    
//  _storeKeysForQuery: null,
//  
//  init: function() {
//    sc_super();
//    this._storeKeysForQuery = [];
//  }
//  
//
//}) ;
//