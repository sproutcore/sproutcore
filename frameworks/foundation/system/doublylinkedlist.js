/**
  Circular doubly linked list created for queue in CollectionFastPath. Not suitable for general use.
  TODO: make generic
 */
SC._DoublyLinkedList = SC.mixin({},
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
      if(!next || !prev) throw "invalid insertion";
      prev._SCCFP_next = item;
      item._SCCFP_prev = prev;
      
      next._SCCFP_prev = item;
      item._SCCFP_next = next;
      
      this.length++;
      return item;
    },
    
    remove: function(item) {
      var prev = item._SCCFP_prev,
      next = item._SCCFP_next,
      head = this.head;
      
      // if the item to be removed isn't actually in the a list, don't remove it
      if(!(next && prev && head)) return;
      
      next._SCCFP_prev = prev;
      prev._SCCFP_next = next;
      
      this.length--;
      
      if(item === head) {
        if(head._SCCFP_next === head) {
          this.head = null;
        } else {
          this.head = next;
        }
      }
      
      
      item._SCCFP_next = null;
      item._SCCFP_prev = null;
      
      return item;
    },
    
    init: function(item) {
        this.head = item;
        item._SCCFP_next = item;
        item._SCCFP_prev = item;
        
        this.length++;
        return this;
    },
    
    push: function(item) {
      var head = this.head;
      
      if(head) {
        this.insertBetween(item, head._SCCFP_prev, head);
      } else {
        this.init(item);
      }
      
      return this;
    },
    
    pop: function() {
      var head = this.head;
      
      if(head) return this.remove(head._SCCFP_prev);
    },
    
    unshift: function(item) {
      var head = this.head;
      
      if(head) {
        this.insertBetween(item, head._SCCFP_prev, head);
        this.head = item;
        
      } else {
        this.init(item);
      }
      
      return this;
    },
    
    shift: function() {
      return this.remove(this.head);
    },
    
    tail: function() {
      var head = this.head;
      
      if(head) return head._SCCFP_prev;
    }
  });
