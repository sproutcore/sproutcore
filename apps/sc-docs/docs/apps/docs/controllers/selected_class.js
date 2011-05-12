// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2008-2011 Apple Inc. All rights reserved.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================
/*globals Docs */

sc_require('resources/jquery_ui');

/** @class

  (Document Your Controller Here)

  @extends SC.ObjectController
*/
Docs.selectedClassController = SC.ObjectController.create(
/** @scope Docs.selectedClassController.prototype */ {

  contentBinding: SC.Binding.single('Docs.classesController.selection'),
  nameBinding: SC.Binding.oneWay('.content.displayName'),

  symbolSelection: null,
  symbols: [],
  properties: [],
  methods: [],
 
  _contentDidChange: function(){
    var content = this.get('content');
    if (!content) {return;}

    var that = this;
    // Give the browser a chance to render, we can wait
    // for the next run loop
    //that.invokeLater(function(){

      var methods = content.get('methods').toArray().sortProperty('name');
      var properties = content.get('properties').toArray().sortProperty('name');

        that.set('symbols',properties.concat(methods));

        that.set('properties',properties);
        that.set('methods',methods);

      that.invokeLater(function(){
        that._resolveLinkTags();
        that._updateDataTypeButtons();
      });
    //});
      

  }.observes('content'),

  _updateLocation: function(symbol) {

    var location = SC.routes.get('location');
    var prefix = "/";
    if(location) {
      prefix = location.split('/')[0]+'/';
    }
    SC.routes.set('location',prefix+symbol.get('name'));

  },

  _scrollToSymbol: function($symbol){
    var container = SC.$('.class-detail');
    var position = this._positionInContainer($symbol[0],container[0]);

    container.stop();
    container.animate({scrollTop: position.top}, 250,'swing');
    $symbol.children('.header').effect("highlight", {}, 1000);
  },

  _selectionDidChange: function(){
    var symbol = this.getPath('symbolSelection.firstObject');
    if (!symbol) { return; }

    var that = this;
    this.invokeLater(function(){
      that._updateLocation(symbol);
      
      var $symbol = SC.$('div[name="'+symbol.get('name')+'"]');
      if(!$symbol || !$symbol[0]) { return; }

      that._scrollToSymbol($symbol);
    });

  }.observes('symbolSelection'),

  _positionInContainer: function(obj,container) {
    var curtop = 0;
    var curleft = 0;

    if (obj.offsetParent) {
      do {
        if (obj === container) { break; }

        curleft += obj.offsetLeft;
        curtop += obj.offsetTop;
      } while (obj = obj.offsetParent);
    }

    return {left: curleft, top: curtop};
  },

  _resolveLinkTags: function() {
    var overviews = SC.$('.class-detail .overview');

    overviews.each(function() {
      var regex = /{\@link\s+([\w.]+)}/g;

      this.innerHTML = this.innerHTML.replace(regex,function(str, p1){ return '<span name="'+p1+'" class="data-type">'+p1+'</span>'; });
    })

    //overviews.each(function() {
      //var regex = /\b(\w+\.\w+)\b/g;

      //this.innerHTML = this.innerHTML.replace(regex,function(str, p1){ return '<span name="'+p1+'" class="data-type">'+p1+'</span>'; });
    //})
  },

  _updateDataTypeButtons: function() {

    var that = this;
    var dataTypes = SC.$('.class-detail .data-type');
    var curClassName = that.getPath('content.displayName');
    var symbols = this.get('symbols');

    dataTypes.each(function(index){

      var name = $(this).attr('name');
      var indexHash = Docs.get('indexHash');
      var valid = NO;

      // Check if it's a top-level symbol
      if (indexHash[name] && curClassName !== name) {
        valid = YES;
      }
      // Assume it's a symbol in the current class
      else if (symbols.findProperty('displayName',name)) {
        valid = YES;
      }

      if (valid) {
        var el = $(this);
        el.addClass('clickable');

        el.click(function(){
          var name = el.attr('name');

          if (name.indexOf('.') !== 0) {
            Docs.routeToClass({'class': name});
          }
          else {
            Docs.routeToSymbol({symbol: name});
          }
        });
      }
    });
  }
}) ;
