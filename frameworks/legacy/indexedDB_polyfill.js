
/** @scope window

  ## Support Notes

  See [http://caniuse.com/#search=indexeddb]().

  Android Browser 4 - no support to full support
  Chrome 11 - partial prefixed support to full support
  Chrome for Android 20 - unknown support to full support
  Internet Explorer 7 - no support to partial support
  Internet Explorer Mobile 7 - no support to partial support
  Firefox 4 - partial prefixed support to full support
  Opera 15 - full support
  Safari 4.0 - no support to partial support
  Safari for iOS 6.0 - no support to partial support
  Safari for Windows 5.1.7 - no support

  Based on the oldest supported browsers, this polyfill needs to work from no support, prefixed
  partial support (i.e. be wary of incomplete implementations), prefixed full support to full
  support (i.e. unprefixed).
*/
// Checks for IndexedDB support first on the current platform.
if (SC.platform.supportsIndexedDB) { // No support
  window.indexedDB = window[SC.browser.experimentalNameFor(window, 'indexedDB')]; // Prefixed / unprefixed
  // window.IDBOpenDBRequest = window[SC.browser.experimentalNameFor(window, 'IDBOpenDBRequest')]; // Prefixed / unprefixed
  // window.IDBTransaction
  // window.IDBKeyRange
  // window.IDBCursor
}
