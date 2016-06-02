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

		var link				= clicked;
		var targetIMGSize		= {};
		var imgSize				= {};
		var img					= link.getElementsByTagName('img');
			img					= img.length ? img[0] : link; // Use the link as the source "img" if there is no img
		var targetIMG			= document.createElement('img');
			targetIMG.src		= link.getAttribute('href');
			targetIMG.className	= 'imagezoom';

		// Add the new image
		document.body.appendChild(targetIMG);

		// Initial styling
		targetIMG.style.display		= 'block';
		targetIMG.style.position	= 'absolute';
		targetIMG.style.zIndex		= '99';
		targetIMG.style.maxHeight	= '90%';
		targetIMG.style.maxWidth	= '90%';
		targetIMG.style.transition	= 'all ' + duration + 'ms ease-out';

		// Positions the large image on top of the source image
		var positionOnTop = function () {
			imgSize = img.getBoundingClientRect();

			targetIMG.style.left		= imgSize.left + 'px';
			targetIMG.style.top			= document.body.scrollTop + imgSize.top + 'px';
			targetIMG.style.width		= imgSize.width + 'px';
			targetIMG.style.height		= imgSize.height + 'px';
			targetIMG.style.boxShadow	= '0 0 0 rgba(0, 0, 0, .4)';
		};

		// Positions the large image in the center of the screen
		var positionCenter = function () {
			var winSize = getWinSize();

			targetIMG.style.left		= (winSize.width - targetIMGSize.width) / 2 + 'px';
			targetIMG.style.top			= document.body.scrollTop + (winSize.height - targetIMGSize.height) / 2 + 'px';
			targetIMG.style.width		= targetIMGSize.width + 'px';
			targetIMG.style.height		= targetIMGSize.height + 'px';
			targetIMG.style.boxShadow	= '0 0 60px rgba(0, 0, 0, .4)';
		};

		// When target has loaded
		var goOn = function () {
			// Store large image's size when it's as big as it can be
			targetIMGSize = targetIMG.getBoundingClientRect();

			// Hide source image
			img.style.visibility = 'hidden';

			// Position large image on top of source
			positionOnTop();

			// Now position large image in center of screen
			setTimeout(function () {
				positionCenter();
			});
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

		// Close the img when clicking it
		targetIMG.addEventListener('click', function () {
			positionOnTop();

			setTimeout(function () {
				// Show source again
				img.style.visibility = 'visible';

				// Remove large image
				targetIMG.parentNode.removeChild(targetIMG);
			}, duration);
		});
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
