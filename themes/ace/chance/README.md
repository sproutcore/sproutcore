Description
===========
Chance is a set of ruby scripts to auto-generate sprites from your CSS.
It only requires two special tags in your css to work.

Contributions
=============
* Alex Iskander  (http://create.tpsitulsa.com/blog/)   -- All credit for the initial idea
* Joshua Holt    (http://blog.thesempiternalholts.com) -- Modifications and Additions
* Colin Campbell (-----------------------------------) -- Modifications and Additions

Build Tools
===========
The operation works inside the theme folder, and generates the "resources" folder used
by SproutCore. There are various options that can be seen by calling with the --help argument.

The theme packaging operation is recursive (much like SproutCore's build tools), so
any folder depth may be used. The suggested folder layout is this:

* Theme Folder
	* View Category Folders (controls, containers, etc.)
		* Views (button\_view, progress\_view, etc.)
			* 1 CSS file
			* 0+ images (PSDs, usually)

Each CSS file will reference images relative to itself. So, controls/progress\_view/progress_view.css
could reference "progress\_view.png".

CSS Syntax
----------
Normal CSS won't work too well for accessing Sprites. It will work even less when
you need to perform slicing (do not talk to me about my nemesis, Photoshop slicing).

However, I do not want to parse CSS, so I use regular expressions.

Here is the current syntax:

	@view(view-name) .more-rules {
		/*
		 Input file, repeat, anchor, slice rect
		*/
		background: sprite("progress_view_track.png" repeat-x [12 1]);
		background: sprite("progress_view_track.png" anchor-right [-8])
		background: sprite("progress_view_track.png" anchor-right [1 1 5 1]) /* 1,1; size: 5, 1 */
	}

The build tools would just search for sprite(, and then parse the contents, and replace @view(view-name)
with .sc-view.view-name.theme.name (where theme.name is specified via an argument to the build tool).
Note: right now, it does not do anything with the theme name; this may change in future.

The syntax is:

	sprite(<sprite name> [<repeat method>] [clear] [<anchor method>] [<rect or partial rect>])
	
	Sprite name: 		the name of the image (quotes required only for images with spaces)
	
	Repeat Method:		repeat-x or repeat-y
	
	clear:				Whether to ensure there are no more images on the row after this one.
						Use with anchor-left to ensure a lonely item.
	
	Anchor Method:		anchor-left or anchor-right (forces the image to be on left or right side of image;
						see below)
						
	Partial Rectangle: 	\[ left [width] \]			// left can be positive or negative.
	Rectangle:		   	\[ left top width height \]

It is rather trivial to parse, yet also easy to read.


Chance also provides declarations for easily providing cross-browser compatible CSS rules, including
border-radius and box-shadow. Here is example input:
	
	.class {
		-sc-box-shadow: 0 0 5px #000;
		-sc-border-radius: 5px;
		/*
			Also supported:
			-sc-border-top-left-radius
			-sc-border-top-right-radius
			-sc-border-bottom-left-radius
			-sc-border-bottom-right-radius
		*/
	}

Chance will then output the following, allowing for a single declaration to cover all browsers:
	
	.class {
		-moz-box-shadow: 0 0 5px #000; -webkit-box-shadow: 0 0 5px #000; box-shadow: 0 0 5px #000;
		-moz-border-radius: 5px; -webkit-border-radius: 5px; border-radius: 5px;
	}
	

Anchoring
---------
Anchoring an image to the left or right side allows you to effectively create controls that have left,
right, and middle parts. Such controls are usually easy to make, but not if the control can shrink to
0px (like ProgressView).

For ProgressView, the control is created like this:

container w/left portion
	inner-head with right portion: anchor-right, left: 8, right: 0
		The left:8 right:0 allows it to never overlap the left edge.
	inner-tail with middle portion: left: 8, right: 8
		Writes over any junk that comes before the right-anchored part.


Producing Production-Ready Files
================================
It would be best to open the files that are in resources/images in Photoshop and Save for Web. This will
reduce the size by a large margin. For instance, in one test, the main png started at ~24,000 bytes, and
after going through PS, finished at ~17,000.