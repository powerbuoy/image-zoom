/**
 * ImageZoom 1.0
 *
 * Run on an element and all links pointing to images
 * inside that element will "zoom out" of the link.
 *
 * @param	HTMLElement		w: the wrapping element, if you want all img links affected just run it on document.body
 * @param	String			d: transition duration (in ms), default 100
 */
'use strict';

var ImageZoom = function (w, d) {
	var wrap = w || document.body;
	var duration = d || 100;

	// http://stackoverflow.com/questions/3437786/get-the-size-of-the-screen-current-web-page-and-browser-window
	var getWinSize = function () {
		var w = window,
			d = document,
			e = d.documentElement,
			g = d.getElementsByTagName('body')[0],
			x = w.innerWidth || e.clientWidth || g.clientWidth,
			y = w.innerHeight|| e.clientHeight|| g.clientHeight;

		return {
			width: x,
			height: y
		};
	};

	// http://stackoverflow.com/questions/3464876/javascript-get-window-x-y-position-for-scroll
	var getScrollPosition = function () {
		var doc = document.documentElement;
		var left = (window.pageXOffset || doc.scrollLeft) - (doc.clientLeft || 0);
		var top = (window.pageYOffset || doc.scrollTop)  - (doc.clientTop || 0);

		return {
			left: left,
			top: top
		};
	};

	// Check whether element is a link pointing to an image
	var isIMGLink = function (el) {
		return el && el.tagName && el.tagName.toUpperCase() == 'A' && el.href && el.href.match(/\.(png|gif|jpg|jpeg)$/);
	};

	// When clicking anything inside the wrapper
	wrap.addEventListener('click', function (e) {
		// Make sure a link pointing to an image was clicked
		var clicked = e.target;

		if (!isIMGLink(clicked)) {
			var child = clicked;

			while (child.parentNode) {
				if (isIMGLink(child.parentNode)) {
					clicked = child.parentNode;

					break;
				}

				child = child.parentNode;
			}
		}

		if (!isIMGLink(clicked)) {
			return;
		}

		// An img link was clicked - go on
		e.preventDefault();

		if (clicked.classList.contains('image-zoom-loading')) {
			return;
		}

		var link				= clicked;
		var targetIMGSize		= {};
		var img					= link.getElementsByTagName('img');
			img					= img.length ? img[0] : link; // Use the link as the source "img" if there is no img
		var targetIMGWrap		= document.createElement('div');
		var targetIMG			= document.createElement('img');
		var closer				= document.createElement('a');

		// Create target popup
		targetIMGWrap.className	= 'image-zoom';
		targetIMG.src			= link.getAttribute('href');

		// Add the new image
		targetIMGWrap.appendChild(targetIMG);
		document.body.appendChild(targetIMGWrap);

		// Initial styling
		targetIMGWrap.style.display		= 'block';
		targetIMGWrap.style.position	= 'absolute';
		targetIMGWrap.style.zIndex		= 100;
		targetIMGWrap.style.transition	= 'all ' + duration + 'ms ease-out';

		// Image
		targetIMG.style.display			= 'block';
		targetIMG.style.position		= 'absolute';
		targetIMG.style.left			= '50%';
		targetIMG.style.top				= '50%';
		targetIMG.style.transform		= 'translateX(-50%) translateY(-50%)';
		targetIMG.style.maxHeight		= '100%';
		targetIMG.style.maxWidth		= '100%';
		targetIMG.style.transition		= 'all ' + duration + 'ms ease-out';

		// Positions the large image on top of the source image
		var positionOnTop = function () {
			var imgSize = img.getBoundingClientRect();
			var scrollPosition = getScrollPosition();

			targetIMGWrap.classList.remove('in-center');
			targetIMGWrap.classList.add('on-top');

			targetIMGWrap.style.position	= 'absolute';
			targetIMGWrap.style.transition	= 'all ' + duration + 'ms ease-out';
			targetIMGWrap.style.left		= imgSize.left + 'px';
			targetIMGWrap.style.top			= scrollPosition.top + imgSize.top + 'px';
			targetIMGWrap.style.width		= imgSize.width + 'px';
			targetIMGWrap.style.height		= imgSize.height + 'px';

			targetIMG.style.maxWidth		= '100%';
			targetIMG.style.maxHeight		= '100%';
		};

		// Positions the large image in the center of the screen
		var positionCenter = function () {
			var winSize = getWinSize();
			var scrollPosition = getScrollPosition();

			targetIMGWrap.classList.remove('on-top');
			targetIMGWrap.classList.add('in-center');

			targetIMGWrap.style.position	= 'absolute';
			targetIMGWrap.style.left		= 0;
			targetIMGWrap.style.top			= scrollPosition.top + 'px';
			targetIMGWrap.style.width		= '100%';
			targetIMGWrap.style.height		= '100%';

			targetIMG.style.maxWidth		= '90%';
			targetIMG.style.maxHeight		= '90%';

			// When animation is complete - fix the image
			setTimeout(function () {
				targetIMGWrap.style.transition	= 'none';
				targetIMGWrap.style.position = 'fixed';
				targetIMGWrap.style.top = 0;
			}, duration);
		};

		link.classList.add('image-zoom-loading');

		// When target has loaded
		var goOn = function () {
			link.classList.remove('image-zoom-loading');

			// Store large image's size when it's as big as it can be
			targetIMGSize = targetIMG.getBoundingClientRect();

			// Hide source image
			img.style.visibility = 'hidden';

			// Position large image on top of source
			positionOnTop();

			// Now position large image in center of screen
			setTimeout(positionCenter);
		};

		// Check if already cached (TODO: needed?)
		if (targetIMG.complete) {
			goOn();
		}
		else {
			targetIMG.addEventListener('load', function () {
				goOn();
			});
		}

		// Closes the image
		var closeImage = function () {
			var scrollPosition = getScrollPosition();

			targetIMGWrap.style.position	= 'absolute';
			targetIMGWrap.style.top			= scrollPosition.top + 'px';

			setTimeout(positionOnTop);

			setTimeout(function () {
				// Show source again
				img.style.visibility = 'visible';

				// Remove large image
				targetIMGWrap.parentNode.removeChild(targetIMGWrap);
			}, duration);
		};

		// Close the img when clicking it
		targetIMGWrap.addEventListener('click', closeImage);
	});
};

if (module && module.exports) {
	module.exports = ImageZoom;
}

if (typeof(jQuery) != 'undefined') {
	jQuery.fn.imageZoom = function (delay) {
		return this.each(function () {
			ImageZoom.init(this, delay);
		});
	};
}
