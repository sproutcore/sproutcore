SC.JSTransition = function (view, hash, options) {
  var from = {},
      key,
      $view = view.$();

  for (key in hash) {
    if (hash.hasOwnProperty(key)) {
      from[key] = $view.css(key);
    }
  }

  return new SC.Animation(view, {
    from: from,
    to: hash
  }, options);
};
