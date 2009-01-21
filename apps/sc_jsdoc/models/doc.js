// ==========================================================================
// JsDoc.Doc
// ==========================================================================

/**
  @class

  @extends SC.Record
  @since SproutCore 1.0
*/
JsDoc.Doc = SC.Record.extend({
  
  icon: 'sc-icon-document-16',
  
  staticUrl: function() {
    var ret = '/static/%@/data/symbols/%@'.fmt(JsDoc.docsController.get('clientRoot'), this.get('url')) ;
    // console.log(ret) ;
    return ret ;
  }.property('url').cacheable()
  
});
