// ==========================================================================
// Project:   SproutCore: Legacy
// License:   Licensed under MIT license (see license.js)
// ==========================================================================

/**
 Browser support in SproutCore.

 While it would be nice to have a full list of supported browsers and versions, such a list would be
 extremely long and difficult to make specific. Because the term "browser" is really referring to a
 specific build of a web browsing application on a specific OS using specific JavaScript and HTML
 engines, it becomes impossible to categorize all of the possible combinations.

 Instead, what we can do is to at least flag specific browser applications, engines or OS's that
 will not be supported. This is based on whether a specific browser is alive or not and as such
 SproutCore aims to support all browsers that are not "dead".

 As it turns out, the liveliness of a browser is also a bit difficult to make specific. Many
 browsers would be assumed to be dead because of their age, yet they still make up a significant
 portion of web traffic according to analytics sites. Are these browsers dead for us and our users?
 How do we decide?

 Well, SproutCore is made by developers and as developers, we know how painful it is to be working
 under deadline and then have to address bugs reported on old platforms that we don't want to be
 bothered to work on or possibly can't even get access to. So we've decided, that as a framework,
 SproutCore will continue to err on the side of caution and support web browsers as far back as
 could be considered reasonably possible.

 ## Oldest supported browser:

  Android Browser: 4 [Webkit 534.30] (October 18, 2011)
    - lots of these devices were made, but they probably get replaced frequently
  Chrome: 11.0.696 [Webkit 534.24] (April 27, 2011)
    - automatic updates means previous versions almost non-existent
  Chrome for Android: 20.0.1132 [WebKit 536.10] (June 26, 2012)
    - first non-beta version
  Internet Explorer: 7 [7] (October 18, 2006)
    - important for corporate customers
  Internet Explorer Mobile: 7 [Trident 3.1] (February 15, 2010)
  Firefox: 3.6 [Gecko 1.9.2] (January 21, 2010)
    - still shows up on worldwide stats
    - Mozilla auto-updated 3.5 users to 3.6 (and 3.6 users to 12)
  Opera: 15 [Chromium 28] (July 2, 2013)
    - switched to Chromium off of Presto with this version
    - Opera has a good history for having features early and requiring fewer workarounds
  Safari: 4.0 [Webkit 530.17] (June 8, 2009)
  Safari for iOS: 6.0 [Webkit 536.25] (July 25, 2012)
    - iPhone 4 version
  Safari for Windows: 5.1.7 (May 9, 2012)
    - last released version

*/
