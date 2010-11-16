// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2009 Sprout Systems, Inc. and contributors.
//            Portions ©2008-2009 Apple Inc. All rights reserved.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================

/** @class
  @extends SC.Renderer
  @since SproutCore 1.1
*/

sc_require("renderers/renderer");
SC.BaseTheme.Title = SC.Renderer.extend({
  name: 'title',

  render: function(context) {
    var icon = this.icon,
        image = '',
        title = this.title,
        hint = this.hint,
        needsTitle = (!SC.none(title) && title.length>0), imgTitle;

    if(this.escapeHTML) title = SC.RenderContext.escapeHTML(title) ;

    // get the icon.  If there is an icon, then get the image and update it.
    // if there is no image element yet, create it and insert it just before
    // title.

    if (icon) {
      var blank = SC.BLANK_IMAGE_URL;

      if (icon.indexOf('/') >= 0) {
        image = '<img src="'+icon+'" alt="" class="icon" />';
      } else {
        image = '<img src="'+blank+'" alt="" class="icon '+icon+'" />';
      }
      needsTitle = YES ;
    }

    if (hint && (!title || title === '')) {
      if (this.escapeHTML) hint = SC.RenderContext.escapeHTML(hint);
      title = "<span class='sc-hint'>" + hint + "</span>";
    }

    imgTitle = image + title;

    // handle ellipsis
    if(this.needsEllipsis){
      context.addClass('ellipsis');
    }

    // push title.
    context.push(imgTitle);

    this._ImageTitleCached = imgTitle;
  },

  update: function(cq) {
    var icon = this.icon,
        image = '' ,
        title = this.title ,
        hint = this.hint,
        needsTitle = (!SC.none(title) && title.length>0), imgTitle,
        elem, htmlNode;
    if(this.escapeHTML) title = SC.RenderContext.escapeHTML(title);

    if (icon) {
      var blank = SC.BLANK_IMAGE_URL;

      if (icon.indexOf('/') >= 0) {
        image = '<img src="'+icon+'" alt="" class="icon" />';
      } else {
        image = '<img src="'+blank+'" alt="" class="'+icon+'" />';
      }
      needsTitle = YES ;
    }
    
    if (hint && (!title || title === '')) {
      if (this.escapeHTML) hint = SC.RenderContext.escapeHTML(hint);
      title = "<span class='sc-hint'>" + hint + "</span>";
    }
    
    imgTitle = image + title;
    
    if ( (htmlNode = cq[0])){
      if(needsTitle) { 
        if(this.needsEllipsis){
          cq.addClass('ellipsis');
          if(this._ImageTitleCached !== imgTitle) {
            this._ImageTitleCached = imgTitle; // Update the cache
            htmlNode.innerHTML = imgTitle;
          }
        }else{
          cq.removeClass('ellipsis');
          if(this._ImageTitleCached !== imgTitle) {
            this._ImageTitleCached = imgTitle; // Update the cache
            htmlNode.innerHTML = imgTitle;
          }
        } 
      }
      else {
        this._ImageTitleCached = imgTitle; // update the cache.
        htmlNode.innerHTML = '';
      }
    }    
  }
});

SC.BaseTheme.addRenderer(SC.BaseTheme.Title);

