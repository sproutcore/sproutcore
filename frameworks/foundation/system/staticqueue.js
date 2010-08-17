SC.StaticQueue = SC.mixin({},
{
  _content: null,
  
  create: function(max) {
    var ret = SC.beget(this);
    ret._content = [];
    ret._content.length = max;
    
    return ret;
  },
  
  enqueue: function(item) {
    if(this.length >= this._content.length) {
      return;
    }
    
    this._content[this._tail++] = item;
    
    if(this._tail >= this._content.length) this._tail = 0;
    
    this.length++;
    
    return this;
  },
  
  dequeue: function() {
    var ret;
    
    if(this.length > 0) {
      ret = this._content[this._head++];
    } else {
      return null;
    }
    
    if(this._head >= this._content.length) this._head = 0;
    
    this.length--;
    
    return ret;
  },
  
  peek: function(index) {
    index = index || 0;
    return this._content[(this._head + index) % this.length];
  },
  
  length: 0,
  
  _head: 0,
  
  _tail: 0
});
