// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2011 Strobe Inc. and contributors.
//            Portions ©2008-2011 Apple Inc. All rights reserved.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================
var
  INITIAL_VOL = 0.8,
  TIMEOUT = 1000,
  TESTFILE = static_url("silence.mp3"), // the real sound of silence
  isPhantom = !!window.callPhantom,
  pane, audioView;

module("SC.AudioView", {

  setup: function () {
    SC.RunLoop.begin();

    audioView = SC.AudioView.create({
      volume: INITIAL_VOL
    });

    pane = SC.MainPane.create();
    pane.appendChild(audioView);
    pane.append();

    SC.RunLoop.end();

    SC.Timer.schedule({
      action: function () { audioView.set("value", TESTFILE); },
      interval: 100
    });
  },

  teardown: function () {
    pane.remove();
    pane = audioView = null;
  }
});

function checkAudioSupport() {
  if (isPhantom) {
    warn("Audio cannot be tested in PhantomJS (see http://phantomjs.org/supported-web-standards.html)");
    return false;
  }
  return true;
}

test("Test MP3 file", function () {
  if (!checkAudioSupport()) return;
  stop(TIMEOUT);

  // assume audio has been loaded when the duration changes
  audioView.addObserver("duration", function (sender, key) {
    ok(sender.get(key), "MP3 file did load");
    start();
  });
});

test("Test initial volume", function () {
  if (!checkAudioSupport()) return;
  stop(TIMEOUT);

  // assume audio has been loaded when the duration changes
  audioView.addObserver("duration", function (sender, key) {
    equals(audioView.get("volume"), INITIAL_VOL, "Initial volume is still set after audio has been loaded");
    start();
  });
});