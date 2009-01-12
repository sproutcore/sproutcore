require('desktop.platform/drag/drag') ;

SC.Drag.mixin(
/** @scope SC.Drag */ {
   
  /**
    Convenience method to turn an operation mask into a descriptive string.
  */
  inspectOperation: function(op) {
    var ret = [] ;
    if (op === SC.DRAG_NONE) {
      ret = ['DRAG_NONE'];
    } else if (op === SC.DRAG_ANY) {
      ret = ['DRAG_ANY'] ;
    } else {
      if (op & SC.DRAG_LINK) {
        ret.push('DRAG_LINK') ;
      }

      if (op & SC.DRAG_COPY) {
        ret.push('DRAG_COPY') ;
      }

      if (op & SC.DRAG_MOVE) {
        ret.push('DRAG_MOVE') ;
      }
    }
    return ret.join('|') ;
  }

});