SC.DoublyLinkedList = SC.mixin({},
  {
    head: null,
    
    length: 0,
    
    create: function(item) {
      var ret = SC.beget(this);
      
      if(item) ret.init(item);
      
      ret.enqueue = ret.unshift;
      ret.dequeue = ret.pop;
      
      return ret;
    },
    
    insertBetween: function(item, prev, next) {
      prev._next = item;
      item._prev = prev;
      
      next._prev = item;
      item._next = next;
      
      this.length++;
      return item;
    },
    
    remove: function(item) {
      var prev = item._prev,
      next = item._next,
      head = this.head;
      
      if(!(next && prev && head)) return;
      
      next._prev = prev;
      prev._next = next;
      
      this.length--;
      
      if(item === head) {
        if(head._next === head) {
          this.head = null;
        } else {
          this.head = next;
        }
      }
      
      
      item._next = null;
      item._prev = null;
      
      return item;
    },
    
    init: function(item) {
        this.head = item;
        item._next = item;
        item._prev = item;
        
        this.length++;
        return this;
    },
    
    push: function(item) {
      var head = this.head;
      
      if(head) {
        this.insertBetween(item, head._prev, head);
      } else {
        this.init(item);
      }
      
      return this;
    },
    
    pop: function() {
      var head = this.head;
      
      if(head) return this.remove(head._prev);
    },
    
    unshift: function(item) {
      var head = this.head;
      
      if(head) {
        this.insertBetween(item, head._prev, head);
        this.head = item;
        
      } else {
        this.init(item);
      }
      
      return this;
    },
    
    shift: function() {
      return this.remove(this.head);
    }
  });
