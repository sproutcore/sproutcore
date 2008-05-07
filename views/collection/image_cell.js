// ==========================================================================
// SC.LabelView
// ==========================================================================

require('mixins/control') ;
require('views/image') ;

/** @class

  An image cell displays a single image inside of a collection view.  Unlike
  a single imageView, the image cell will automatically position the image
  inside of the view to reflect the actual size of the image on load.

  @extends SC.View
  @author    AuthorName  
  @version 0.1
*/
SC.ImageCellView = SC.View.extend(SC.Control,
/** @scope SC.ImageCellView.prototype */ {

  emptyElement: '<div class="image-cell sc-collection-item"><img src="%@"  style="position:relative;" /></div>'.fmt(static_url('blank')),
  
  /** 
    The image URL you wish to display.
  */
  value: null,

  /** 
    The owner view of this cell.  The ImageCell relies on this
    view to provide many of its behavioral defaults and for 
    event handling.
  */
  owner: null,
  
  /**
    Set this to a validator or to a function and the value
    will be passed through it before being set.
    
    This is a default default that can be overidden by the
    settings in the owner view.
  */
  formatter: null,
  
  contentValueKey: null,
  
  /**
    This is the required margin you want to appear around the image.  Expressed in px
  */
  imageMargin: 2,
  
  /** 
    The imageView that will manage the image itself.  No bindings are
    configured for the image; the cell will simply inform it when
    important changes occur.
  */
  imageView: SC.ImageView.extend({
    
    // Resizes the imageView to fix within the boundaries of its 
    // parent.  Automatically triggered when load status changes and
    // also by owner whenever it is resized.
    sizeToFit: function() {

      if (this.get('status') != 'loaded') return ; 
      
      // find the best fit.
      var f= this.owner.get('frame') ;
      var margin = this.owner.get('imageMargin') ;
      f.width -= margin*2 ;
      f.height -= margin*2 ;
      
      var w = this.get('imageWidth') ;
      var h = this.get('imageHeight') ;
      var wideScaleFactor = (f.width / w) ;
      var tallScaleFactor = (f.height / h) ;
      var scaleFactor = (tallScaleFactor < wideScaleFactor) ? tallScaleFactor : wideScaleFactor;
      w = w * scaleFactor ; h = h*scaleFactor;
      
      var f= this.owner.get('frame') ; // reset w/o margin
      var newFrame = { width: w, height: h, x: Math.floor((f.width - w) /2), y: Math.floor((f.height - h) /2) };
      if (!SC.rectsEqual(newFrame, this.get('frame'))) {
        this.set('frame', newFrame);
      }
      
    }.observes('status')
    
  }).outletFor('img?'),
  
  outlets: ['imageView'],
  
  resizeChildrenWithOldSize: function() {
    if (this.get('content')) {
      this.outlet('imageView').sizeToFit() ;
    }  
  },
  
  /** 
    @private
    
    Invoked whenever the monitored value on the content object 
    changes.
    
    The value processed is either the contentValueKey, if set, or 
    it is the content object itself.
  */
  _valueDidChange: function() {
    var value = this.get('value') ;
    var owner = this.get('owner') ;
    
    // prepare the value...
    
    // 1. apply the formatter
    var formatter = this.getDelegateProperty(this.displayDelegate, 'formatter') ;
    if (formatter) {
      var formattedValue = ($type(formatter) == T_FUNCTION) ? formatter(value, this) : formatter.fieldValueForObject(value, this) ;
      if (formattedValue != null) value = formattedValue ;
    }
    
    // 2. If the returned value is not a string, convert it.
    if (value != null && value.toString) value = value.toString() ;

    // 3. Apply URL to image view.
    this.outlet('imageView').set('value', value) ;
  }.observes('value')
 
}) ;
