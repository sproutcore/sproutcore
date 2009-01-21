// ==========================================================================
// QUnit.Test
// ==========================================================================

QUnit.Test = SC.Record.extend({
  
  title: function() {
    if (!this._title) {
      var parts = (this.get('name') || '').split('/') ;
      var ret = parts.pop() || '' ;
      this._title = ret.replace(/\.rhtml$/,'').replace(/_/g,' ');
    }
    return this._title ;
  }.property('name'),
  
  group: function() {
    if (!this._group) {
      var parts = (this.get('name') || '').split('/') ;
      this._group = parts.slice(0,parts.length-1).join('/').toLowerCase() ;
    }
    return this._group; 
  }.property('name')
  
});
