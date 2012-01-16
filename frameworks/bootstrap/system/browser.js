// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2011 Strobe Inc. and contributors.
//            Portions ©2008-2011 Apple Inc. All rights reserved.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================

window.SC = window.SC || { MODULE_INFO: {}, LAZY_INSTANTIATION: {} };


/**
  The list of browsers that are automatically identified.

  @static
  @constant
*/
SC.BROWSER = {
  android: 'android',
  blackberry: 'blackberry',
  chrome: 'chrome',
  firefox: 'firefox',
  ie: 'ie',
  opera: 'opera',
  safari: 'safari',
  unknown: 'unknown'
};

/**
  The list of devices that are automatically identified.

  @static
  @constant
*/
SC.DEVICE = {
  android: 'android',
  blackberry: 'blackberry',
  desktop: 'desktop',
  ipad: 'ipad',
  iphone: 'iphone',
  ipod: 'ipod',
  mobile: 'mobile'
};

/**
  The list of browser engines that are automatically identified.

  @static
  @constant
*/
SC.ENGINE = {
  gecko: 'gecko',
  opera: 'opera',
  presto: 'presto',
  trident: 'trident',
  webkit: 'webkit'
};

/**
  The list of operating systems that are automatically identified.

  @static
  @constant
*/
SC.OS = {
  android: 'android',
  blackberry: 'blackberry',
  ios: 'ios',
  linux: 'linux',
  mac: 'mac',
  win: 'windows'
};


/**
  Detects browser properties based on the given userAgent and language.

  @private
*/
SC.detectBrowser = function(userAgent, language) {
  var browser = {},
      device,
      engineAndVersion,
      isIOSDevice,
      conExp = '(?:[\\/:\\::\\s:;])', // Match the connecting character
      numExp = '(\\S+[^\\s:;:\\)]|)', // Match the "number"
      nameAndVersion,
      osAndVersion,
      override;

  // Use the current values if none are provided.
  userAgent = (userAgent || navigator.userAgent).toLowerCase();
  language = language || navigator.language || navigator.browserLanguage;

  // Calculations to determine the device.  See SC.DEVICE.
  device =
    userAgent.match( new RegExp('(android|ipad|iphone|ipod|blackberry)') ) ||
    userAgent.match( new RegExp('(mobile)') ) ||
    ['', SC.DEVICE.desktop];

  /**
    @name SC.browser.device
    @type {SC.DEVICE}
  */
  browser.device = device[1];


  // It simplifies further matching by recognizing this group of devices.
  isIOSDevice =
    browser.device === SC.DEVICE.ipad ||
    browser.device === SC.DEVICE.iphone ||
    browser.device === SC.DEVICE.ipod;


  // Calculations to determine the name and version.  See SC.BROWSER.

  nameAndVersion =
    // Match the specific names first, avoiding commonly spoofed browsers.
    userAgent.match( new RegExp('(opera|chrome|firefox|android|blackberry)' + conExp + numExp) ) ||
    userAgent.match( new RegExp('(ie|safari)' + conExp + numExp) ) ||
    ['', SC.BROWSER.unknown, '0'];

  // If the device is an iOS device, use SC.BROWSER.safari for browser.name.
  if (isIOSDevice) { nameAndVersion[1] = SC.BROWSER.safari; }

  // If a `Version` number is found, use that over the `Name` number
  override = userAgent.match( new RegExp('(version)' + conExp + numExp) );
  if (override) { nameAndVersion[2] = override[2]; }
  // If there is no `Version` in Safari, don't use the Safari number since it is
  // the Webkit number.
  else if (nameAndVersion[1] === SC.BROWSER.safari) { nameAndVersion[2] = '0'; }


  /**
    @name SC.browser.name
    @type {SC.BROWSER}
  */
  browser.name = nameAndVersion[1];

  /**
    @name SC.browser.version
    @type String
  */
  browser.version = nameAndVersion[2];


  // Calculations to determine the engine and version.  See SC.ENGINE.
  engineAndVersion =
    // Match the specific engines first, avoiding commonly spoofed browsers.
    userAgent.match( new RegExp('(presto)' + conExp + numExp) ) ||
    userAgent.match( new RegExp('(opera|trident|webkit|gecko)' + conExp + numExp) ) ||
    ['', SC.BROWSER.unknown, '0'];

  // If the browser is SC.BROWSER.ie, use SC.ENGINE.trident.
  override = browser.name === SC.BROWSER.ie ? SC.ENGINE.trident : false;
  if (override) { engineAndVersion[1] = override; }

  // If the engineVersion is unknown and the browser is SC.BROWSER.ie, use
  // browser.version for browser.engineVersion.
  override = browser.name === SC.BROWSER.ie && engineAndVersion[2] === '0';
  if (override) { engineAndVersion[2] = browser.version; }

  // If a `rv` number is found, use that over the engine number.
  override = userAgent.match( new RegExp('(rv)' + conExp + numExp) );
  if (override) { engineAndVersion[2] = override[2]; }


  /**
    @name SC.browser.engine
    @type {SC.ENGINE}
    @type {SC.BROWSER.unknown}
  */
  browser.engine = engineAndVersion[1];

  /**
    @name SC.browser.engineVersion
    @type String
  */
  browser.engineVersion = engineAndVersion[2];


  // If we don't know the name of the browser, use the name of the engine.
  if (browser.name === SC.BROWSER.unknown) { browser.name = browser.engine; }

  // Calculations to determine the os and version.  See SC.OS.
  osAndVersion =
    // Match the specific names first, avoiding commonly spoofed os's.
    userAgent.match( new RegExp('(blackberry)') ) ||
    userAgent.match( new RegExp('(android|iphone(?: os)|windows(?: nt))' + conExp + numExp) ) ||
    userAgent.match( new RegExp('(os|mac(?: os)(?: x))' + conExp + numExp) ) ||
    userAgent.match( new RegExp('(linux)') ) ||
    [null, SC.BROWSER.unknown, '0'];

  // Normalize the os name.
  if (isIOSDevice) { osAndVersion[1] = SC.OS.ios; }
  else if (osAndVersion[1] === 'mac os x' || osAndVersion[1] === 'mac os') { osAndVersion[1] = SC.OS.mac; }
  else if (osAndVersion[1] === 'windows nt') { osAndVersion[1] = SC.OS.windows; }

  // Normalize the os version.
  osAndVersion[2] = osAndVersion[2] ? osAndVersion[2].replace(/_/g, '.') : '0';


  /**
    @name SC.browser.os
    @type {SC.OS}
    @type {SC.BROWSER.unknown}
  */
  browser.os = osAndVersion[1];

  /**
    @name SC.browser.osVersion
    @type String
  */
  browser.osVersion = osAndVersion[2];


  /**
    This function takes the major version part and creates a comparable integer.

    Example: '10.89' => 10 === '10.77' => 10

    @returns {Number}
  */
  browser.versionMajor = function(version) {
    return version === SC.BROWSER.unknown ? 0 : parseInt(version);
  };

  /**
    This function takes all minor version parts and creates a comparable float.

    Example: '2.1b4-7' => 0.147 > '2.1b4-5' => 0.145 > '2.09a' => 0.09

    @returns {Number}
  */
  browser.versionMinor = function(version) {
    var part,
        parts,
        ret = '0.';

    if (version !== SC.BROWSER.unknown) {
      // Split on non-decimals
      parts = version.split(/\D/);
      for (var i = 1; i < parts.length; i++) {
        // Simply append each part.
        ret += parts[i];
      }
    }
    return parseFloat(ret);
  };

  /**
    This function takes the major and minor version parts and creates a comparable float.

    Example: '1.45.0.3' => 1.4503 > '1.45.0.2' => 1.4502 > '1.36.9.10' => 1.3691

    @returns {Number}
  */
  browser.versionFloat = function(version) {
    return this.versionMajor(version) + this.versionMinor(version);
  };


  /** @deprecated Since version 1.7. Use browser.os === SC.OS.windows.
    @name SC.browser.isWindows
    @type Boolean
  */
  browser.windows = browser.isWindows = browser.os === SC.BROWSER.windows;

  /** @deprecated Since version 1.7. Use browser.os === SC.OS.mac.
    @name SC.browser.isMac
    @type Boolean
  */
  browser.mac = browser.isMac = browser.os === SC.BROWSER.mac;

  /** @deprecated Since version 1.7. Use browser.os === SC.OS.mac && SC.browser.versionFloat(browser.osVersion) >= 10.7 && SC.browser.versionFloat(browser.osVersion) < 10.8
    @name SC.browser.isLion
    @type Boolean
  */
  browser.lion = browser.isLion = !!(/mac os x 10_7/.test(userAgent) && !/like mac os x 10_7/.test(userAgent));
  
  /** @deprecated Since version 1.7. Use browser.device === SC.DEVICE.iphone.
    @name SC.browser.isiPhone
    @type Boolean
  */
  browser.iPhone = browser.isiPhone = browser.device === SC.DEVICE.iphone;

  /** @deprecated Since version 1.7. Use browser.device === SC.DEVICE.ipod.
    @name SC.browser.isiPod
    @type Boolean
  */
  browser.iPod = browser.isiPod = browser.device === SC.DEVICE.ipod;

  /** @deprecated Since version 1.7. Use browser.device === SC.DEVICE.ipad.
    @name SC.browser.isiPad
    @type Boolean
  */
  browser.iPad = browser.isiPad = browser.device === SC.DEVICE.ipad;

  /** @deprecated Since version 1.7. Use browser.os === SC.OS.ios.
    @name SC.browser.isiOS
    @type Boolean
  */
  browser.iOS = browser.isiOS = browser.os === SC.OS.ios;

  /** @deprecated Since version 1.7. Use browser.os === SC.OS.android or browser.name === SC.BROWSER.android or browser.device === SC.BROWSER.android.
    @name SC.browser.isAndroid
    @type Boolean
  */
  browser.android = browser.isAndroid = browser.os === SC.OS.android;

  /** @deprecated Since version 1.7. Use browser.version or browser.engineVersion.
    @name SC.browser.opera
    @type String
  */
  browser.opera = browser.name === SC.BROWSER.opera ? browser.version : '0';

  /** @deprecated Since version 1.7. Use browser.name === SC.BROWSER.opera.
    @name SC.browser.isOpera
    @type Boolean
  */
  browser.isOpera = browser.name === SC.BROWSER.opera;

  /** @deprecated Since version 1.7. Use browser.version or browser.engineVersion.
    @name SC.browser.msie
    @type String
  */
  browser.msie = browser.name === SC.BROWSER.ie ? browser.version : '0';

  /** @deprecated Since version 1.7. Use browser.name === SC.BROWSER.ie.
    @name SC.browser.isIE
    @type Boolean
  */
  browser.isIE = browser.name === SC.BROWSER.ie;

  /** @deprecated Since version 1.7. Use browser.versionMajor(browser.version) <= 8 or browser.versionMajor(browser.engineVersion) <= 8
    @name SC.browser.isIE8OrLower
    @type Boolean
  */
  browser.isIE8OrLower = browser.name === SC.BROWSER.ie && browser.versionMajor(browser.version) <= 8;

  /** @deprecated Since version 1.7. Use browser.version or browser.engineVersion.
    @name SC.browser.mozilla
    @type String
  */
  browser.mozilla = browser.engine === SC.ENGINE.gecko ? browser.version : '0';

  /** @deprecated Since version 1.7. Use browser.name === SC.BROWSER.firefox or browser.engine === SC.ENGINE.gecko.
    @name SC.browser.isMozilla
    @type Boolean
  */
  browser.isMozilla = browser.engine === SC.ENGINE.gecko;

  /** @deprecated Since version 1.7. Use browser.engineVersion.
    @name SC.browser.webkit
    @type String
  */
  browser.webkit = browser.engine === SC.ENGINE.webkit ? browser.engineVersion : '0';

  /** @deprecated Since version 1.7. Use browser.engine === SC.ENGINE.webkit.
    @name SC.browser.isWebkit
    @type Boolean
  */
  browser.isWebkit = browser.engine === SC.ENGINE.webkit;

  /** @deprecated Since version 1.7. Use browser.version.
    @name SC.browser.chrome
    @type String
  */
  browser.chrome = browser.name === SC.BROWSER.chrome ? browser.version : '0';

  /** @deprecated Since version 1.7. Use browser.name === SC.BROWSER.chrome.
    @name SC.browser.isChrome
    @type Boolean
  */
  browser.isChrome = browser.name === SC.BROWSER.chrome;

  /** @deprecated Since version 1.7. Use browser.version.
    @name SC.browser.mobileSafari
    @type String
  */
  browser.mobileSafari = browser.os === SC.OS.ios ? browser.version : '0';

  /** @deprecated Since version 1.7. Use browser.name === SC.BROWSER.safari && browser.os === SC.OS.ios
    @name SC.browser.isMobileSafari
    @type Boolean
  */
  browser.isMobileSafari = browser.name === SC.BROWSER.safari && browser.os === SC.OS.ios;

  /** @deprecated Since version 1.7. Use browser.version.
    @name SC.browser.iPadSafari
    @type String
  */
  browser.iPadSafari = browser.device === SC.DEVICE.ipad && browser.name === SC.BROWSER.safari ?
    browser.version : 0;

  /** @deprecated Since version 1.7. Use browser.device === SC.DEVICE.ipad && browser.name === SC.BROWSER.safari
    @name SC.browser.isiPadSafari
    @type Boolean
  */
  browser.isiPadSafari = browser.device === SC.DEVICE.ipad && browser.name === SC.BROWSER.safari;

  /** @deprecated Since version 1.7. Use browser.version.
    @name SC.browser.iPhoneSafari
    @type String
  */
  browser.iPhoneSafari = browser.device === SC.DEVICE.iphone && browser.name === SC.BROWSER.safari ?
    browser.version : 0;

  /** @deprecated Since version 1.7. Use browser.device === SC.DEVICE.iphone && browser.name === SC.BROWSER.safari
    @name SC.browser.isiPhoneSafari
    @type Boolean
  */
  browser.isiPhoneSafari = browser.device === SC.DEVICE.iphone && browser.name === SC.BROWSER.safari;

  /** @deprecated Since version 1.7. Use browser.version.
    @name SC.browser.iPodSafari
    @type String
  */
  browser.iPodSafari = browser.device === SC.DEVICE.ipod && browser.name === SC.BROWSER.safari ?
    browser.version : 0;

  /** @deprecated Since version 1.7. Use browser.device === SC.DEVICE.ipod && browser.name === SC.BROWSER.safari
    @name SC.browser.isiPodSafari
    @type Boolean
  */
  browser.isiPodSafari = browser.device === SC.DEVICE.ipod && browser.name === SC.BROWSER.safari;

  /** @deprecated Since version 1.7. Use SC.platform.standalone.
    @name SC.browser.isiOSHomeScreen
    @type Boolean
  */
  browser.isiOSHomeScreen = browser.isMobileSafari && !(/apple.*mobile.*safari/.test(userAgent));

  /** @deprecated Since version 1.7. Use browser.version.
    @name SC.browser.safari
    @type String
  */
  browser.safari = browser.name === SC.BROWSER.safari && browser.os === SC.OS.mac ?
    browser.version : 0;

  /** @deprecated Since version 1.7. Use browser.name === SC.BROWSER.safari && browser.os === SC.OS.mac.
    @name SC.browser.isSafari
    @type Boolean
  */
  browser.isSafari = browser.name === SC.BROWSER.safari && browser.os === SC.OS.mac;

  /**
    @name SC.browser.language
    @type String
  */
  browser.language = language.split('-', 1)[0];

  /**
    @name SC.browser.countryCode
    @type String
  */
  browser.countryCode = language.split('-')[1] ? language.split('-')[1].toLowerCase() : undefined;

  /** @deprecated Since version 1.7. Use browser.name.  See SC.BROWSER for possible values.
    Possible values:

      - 'msie'
      - 'mozilla'
      - 'chrome'
      - 'safari'
      - 'opera'
      - 'mobile-safari'
      - 'unknown'

    @name SC.browser.current
    @type String
    @default 'unknown'
  */
  browser.current = browser.name;

  return browser;
};


/** @class

  This object contains information about the browser environment SproutCore is
  running in. This includes the following properties:

    - browser.device            ex. SC.DEVICE.ipad
    - browser.name              ex. SC.BROWSER.chrome
    - browser.version           ex. '16.0.2.34'
    - browser.os                ex. SC.OS.mac
    - browser.osVersion         ex. '10.6'
    - browser.engine            ex. SC.ENGINE.webkit
    - browser.engineVersion     ex. '533.29'

  For utility, this object also contains the functions versionMajor(),
  versionMinor() and versionFloat() which allow you to faithfully compare
  different versions.

  Ex.
    var A = '16.1.20.7'
    var B = '16.1.93.2'

    browser.versionMajor(A)
    16
    browser.versionMajor(B)
    16
    browser.versionMajor(A) === browser.versionMajor(B)
    true

    browser.versionMinor(A)
    0.1207
    browser.versionMinor(B)
    0.1932
    browser.versionMinor(A) > browser.versionMinor(B)
    false

    browser.versionFloat(A)
    16.1207
    browser.versionFloat(B)
    16.1932
    browser.versionFloat(A) < browser.versionFloat(B)
    true

  User agent sniffing does not provide guaranteed results and spoofing may
  affect the accuracy.  Therefore, as a general rule, it is much better
  to rely on the browser's verified capabilities in SC.platform.  Based on
  the unit test sample, the most accurate browser properties are `engine` and
  `engineVersion`.

  @since SproutCore 1.0
*/
SC.browser = SC.detectBrowser();
