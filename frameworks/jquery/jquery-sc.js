// sc_require("jquery-buffer");
jQuery.Buffer.scheduleFlushing = function() {
  SC.RunLoop.currentRunLoop.invokeOnce(function() {
    jQuery.Buffer.flush()
  });
  this.flushingScheduled = true;
};
