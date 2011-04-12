// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2010 Sprout Systems, Inc. and contributors.
//            Portions ©2008-2011 Apple Inc. All rights reserved.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================

sc_require("system/task_queue");

/** @ignore */
SC.chance = {

  preload_task: SC.Task.create({
    run: function(queue) {
      var bank = SC.chance.bank, idx, len = bank.length, images = SC.chance.images;
      for (idx = 0; idx < len; idx++) {
        if (images.length < 1) {
          return SC.chance.didPreloadImages();
        }

        var img = images.pop();
        bank[idx].className = img;
      }

      // to force a break:
      setTimeout(function(){
        SC.run(function() {
          SC.backgroundTaskQueue.push(SC.chance.preload_task);
        });
      }, 0);
    }
  }),


  images: [],
  bank: [],
  PRELOAD_CONCURRENCY: 50,

  preloadImages: function() {
    if (window.CHANCE_SLICES) {
      this.images = window.CHANCE_SLICES;
    }

    var bank = this.bank, idx, con = this.PRELOAD_CONCURRENCY;
    for (idx = 0; idx < con; idx++) {
      var img = document.createElement('div');
      document.body.appendChild(img);
      bank.push(img);
    }

    SC.run(function(){
      SC.backgroundTaskQueue.push(SC.chance.preload_task);
    });
  },

  didPreloadImages: function() {
    var bank = this.bank, idx, len = bank.length;
    for (idx = 0; idx < len; idx++) {
      document.body.removeChild(bank[idx]);
      bank[idx] = undefined;
    }
  }
};

//SC.ready(SC.chance, 'preloadImages');
