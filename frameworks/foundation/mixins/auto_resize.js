/**
  Implements some automatic resizing utilities.
*/
SC.AutoResize = {
  autoResizeField: "value",
  
  shouldAutoResize: YES, // if NO, only measuredSize is changed.
  shouldMeasureSize: YES, // if NO, nothing happens.
  
  /**
    Determines if the view's width should be resized
    on calculation. Default is YES.
    
    @property {Boolean}
  */
  shouldResizeWidth: YES,
  
  /**
    Determines if the view's height should be resized
    on calculation. Default is NO to retain backwards
    compatibility.
    
    @property {Boolean}
  */
  shouldResizeHeight: NO,
  
  measuredSize: { width: 0, height: 0 },
  
  autoSizePadding: 10, // just to add some nice space.
  
  initMixin: function() {
    this.addObserver(this.get("autoResizeField"), this, "_scar_valueDidChange");
  },
  
  measureSize: function() {
    if (!this.get("shouldMeasureSize")) return;
    
    // get the layer
    var layer = this.get("layer");
    
    // return if there wasn't one (no font sizes, etc. to use with measuring)
    if (!layer) return;
     
    // get metrics, using layer as example element
    var metrics = SC.metricsForString(this.get(this.get("autoResizeField")), layer);
    
    // set it
    this.set("measuredSize", metrics);
    if (this.get("shouldAutoResize")) {
      if (this.get('shouldResizeWidth')) this.adjust("width", metrics.width + this.get("autoSizePadding"));
      if (this.get('shouldResizeHeight')) this.adjust("height", metrics.height + this.get("autoSizePadding"));
    }
  },
  
  // we need to update the measurement when the value changes
  _scar_valueDidChange: function(){ 
    sc_super(); // just in case
    this.measureSize();
  },
  
  // also, need to update when the layer is created
  // note: not so much need to update when the layer is updated; 
  // we could then end up changing the size due to the layer being updated, causing another layer update;
  // which would not be great for performance.
  didAppendToDocument: function(){
    sc_super(); // just in case
    this.invokeLast("measureSize");
  },
  
  didCreateLayer: function() {
    sc_super();
    this.invokeLast("measureSize");
  }
};