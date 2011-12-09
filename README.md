SproutCore.js
=============

The goal for this SproutCore fork is:

* an all-JavaScript buildtools with installation via npm
* a simplified, streamlined framework organization with dead and experimental code removed
* a laser-like focus on desktop web browsers, awesome documentation, and  framework stability, especially in the view layer

In addition, the view layer is being updated in conjunction with the development of Blossom, Fohr's soon-to-be-released canvas-based SproutCore view layer.

The Changes
-----------

SproutCore.js involves three separate modifications to the existing SproutCore 1.4.5 framework (actually, the 1-4-stable branch).

First, the many sub-frameworks will be consolidated and/or removed. Just three frameworks will remain, Foundation, Datastore, and Desktop (similar to Cocoa’s Foundation, Core Data, and AppKit frameworks, respectively). Touch and mobile code will be removed completely, as well as anything experimental or unmaintained (e.g. Greenhouse).

Second, the Node.js buildtools (Garçon) will be moved into the SproutCore repository itself (they will not be a separate project). Historically, the Ruby buildtools have been tied to specific versions of SproutCore, but due to having two repositories, users would frequently use the wrong buildtools with their version of SproutCore. This was particularly problematic when working on SproutCore itself.

To combat the many problems we’ve had over the years, the JavaScript buildtools will be distributed and maintained within the main SproutCore repository and npm installer, not as a separate project.

Third, the view layer (Desktop) will be updated and modernized to remain in sync with Fohr’s proposed canvas-based view layer, called Blossom.

Getting Involved
----------------

* Why this fork exists: http://bit.ly/future-of-sproutcore
* Pull request to merge changes back into SproutCore proper: https://github.com/sproutcore/sproutcore/pull/633
* IRC Channel: #sproutcorejs on Freenode
* Google Group: https://groups.google.com/group/sproutcorejs

Please watch this repository on GitHub to follow development, or fork it and submit a pull request to help contribute to it's evolution.

This fork is maintained by Erich Ocean at Fohr <eocean@fohr.com>.
