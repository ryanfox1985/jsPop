/*
 *	jsPop - Javascript Library v1.0
 *	
 *	Copyright (c) 2012 Bytecrawl.com
 *
 *	Permission is hereby granted, free of charge, to any person obtaining a copy
 *	of this software and associated documentation files (the "Software"), to deal
 *	in the Software without restriction, including without limitation the rights 
 *	to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies
 *	of the Software, and to permit persons to whom the Software is furnished to do 
 *	so, subject to the following conditions:
 *
 *	The above copyright notice and this permission notice shall be included in all
 *	copies or substantial portions of the Software.
 *
 *	THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED,
 *	INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A 
 *	PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT
 *	HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION 
 *	OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE 
 *	SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 *
 */
$(document).ready(function () {
	(function (window, undefined) {
		var ByteJSPopup = (function () {
			/**
				Global variables for jsPop.
			*/
			var _isOpen = false; // Popup status.
			var _isForm = false; // Current content belongs to a form.
			var _tag = ""; // Store tag loading from _form when calling form();
			var _form = ""; // Store form when calling form();
			var _url = ""; // Current ajax loaded url, in case of ajax() just reload.
			var _submitting = false; // Prevent double form submit via ajax().
			var _tShow = 80; // Default fadeIn time.
			var _tHide = 80; // Default fadeOut time.

			/**
				Formatter custom styles.
			*/
			var _fSet = false;
			var _fPadding = 0;
			var _fWidth = 0;
			var _fHeight = 0;

			/**
				DOM elements creation.Bytecrawl.
			*/
			var ByteJSPopup = document.createElement("div"); // Complete jsPop.
			var ByteJSPopupOverlay = document.createElement("div"); // Background overlay.
			var ByteJSPopupWrap = document.createElement("div"); // Popup itself.
			var ByteJSPopupContent = document.createElement("div"); // Popup Content.

			/**
				DOM elements attribute settings.
			*/
			$(ByteJSPopup).attr("id", "ByteJSPopup");
			$(ByteJSPopupWrap).attr("id", "ByteJSPopupWrap");
			$(ByteJSPopupOverlay).attr("id", "ByteJSPopupOverlay");
			$(ByteJSPopupContent).attr("id", "ByteJSPopupContent");
			$(ByteJSPopupWrap).attr("id", "ByteJSPopupWrap");
			$(ByteJSPopup).hide();

			/**
				DOM elements appending.
			*/
			$(ByteJSPopupWrap).append(ByteJSPopupContent);
			$(ByteJSPopup).append(ByteJSPopupOverlay);
			$(ByteJSPopup).append(ByteJSPopupWrap);
			$('body').append(ByteJSPopup);

			/**
				DOM event bindings.
			*/
			$(window).resize(function () {
				centerPopup();
			});
			$(document).keydown(function (event) {
				if (event.keyCode == 27) jsPop.close();
			});
			$(ByteJSPopupOverlay).click(function () {
				jsPop.close();
			});

			/**
				Void function for empty callbacks.
			*/
			var noop = function () {};

			/**
				Popup fadeOut.
				Once fadeOut complete, set _isOpen before callback, then
				run callback.
			*/
			function hide(ms, callback) {
				var ms = ms || 0;
				var callback = callback || noop;
				$(ByteJSPopup).fadeOut(ms, function () {
					_isOpen = false;
					callback();
				});
			};

			/**
				Popup fadeIn.
				Before fadeIn, apply custom styling formatter().
				@hack setTimeOut to center popup once fadeIn starts.
				Once fadeIn complete, set _isOpen before callback, then
				run callback.
			*/
			function show(ms, callback) {
				var ms = ms || 0;
				var callback = callback || noop;
				formatter();
				setTimeout(centerPopup, 1);
				$(ByteJSPopup).fadeIn(ms, function () {
					_isOpen = true;
					callback();
				});
			};

			/**
				Popup dinamic center. Popup dynamic max-height to
				display scroll.
			*/
			function centerPopup() {
				$(ByteJSPopupWrap).css("left", $(window).width() / 2 - $(ByteJSPopupWrap).width() / 2);
				$(ByteJSPopupWrap).css("top", $(window).height() / 3 - $(ByteJSPopupWrap).height() / 3);
				$(ByteJSPopupContent).css("max-height", $(window).height() * 0.9);
			};

			/**
				Div loading, check if _isOpen, close if true
				otherwise proceed to load the tag by clone().
				Load to ByteJSPopupContent a clone of the original
				tag.
				Call show() on cloned tag to display it in case
				it's hidden.
			*/
			var div = function (tag) {
				if (_isOpen) {
					close(function () {
						div(tag);
					});
				} else {
					var clone = $(tag).clone();
					$(clone).show();
					$(clone).appendTo($(ByteJSPopupContent));
					show(_tShow);
				};
			};

			/**
				Form loading, check if _isOpen, close if true
				otherwise proceed to detach the tag from the form
				to the Popup, then attach the Popup to the form.
				This way the fields in the popup are submitted along
				with the form.
			*/
			var form = function (tag, formtag) {
				if (_isOpen) {
					close(function () {
						form(tag, formtag);
					});
				} else {
					$(tag).detach().appendTo($(ByteJSPopupContent));
					$(tag).show();
					$(formtag).append(ByteJSPopup);
					show(_tShow, function () {
						_isForm = true;
						_tag = tag;
						_form = formtag;
					});
				};
			};

			/**
				Ajax loading, check if already submitting ajax and
				_isOpen, if submitting, ignore. Otherwise, if _isOpen
				close, then load via ajax.
			*/
			var ajax = function (href) {
				_url = href;
				if (!_submitting) if (_isOpen) {
					close(function () {
						ajax(href);
					});
				} else {
					_submitting = true;
					$(ByteJSPopupContent).load(href, function () {
						_submitting = false;
						show(_tShow);
					});
				};
			};

			/**
				Plain Html content loading, check if _isOpen, close if true
				otherwise update content with html and open Popup.
			*/
			var html = function (text) {
				if (_isOpen) {
					close(function () {
						html(text);
					});
				} else {
					$(ByteJSPopupContent).html(text);
					show(_tShow);
				};
			};

			/**
				Close Popup. In case of _isForm, detach Popup
				from the form and reattach to body. Then detach
				tag and reattach to form, so it's submitted along
				with the form.
				If !_isForm, empty content DOM.
			*/
			var close = function (callback) {
				var callback = callback || noop;
				if (_isOpen) if (_isForm) {
					hide(_tHide, function () {
						$(ByteJSPopup).detach().appendTo('body');
						$(_tag).hide();
						$(_tag).detach().appendTo($(_form));
						_isForm = false;
						callback();
					});
				} else {
					hide(_tHide, function () {
						$(ByteJSPopupContent).empty();
						callback();
					});
				};
			};

			/**
				Apply custom option settings before launching Popup.
			*/
			var formatter = function () {
				// Padding settings.
				if (_fPadding > 0) $(ByteJSPopupContent).css("padding", _fPadding);
				else $(ByteJSPopupContent).css("padding", "");

				// Width settings.
				if (_fWidth > 0) {
					$(ByteJSPopupContent).children().css("width", _fWidth);
					$(ByteJSPopupContent).children().css("height", "auto");
				} else {
					$(ByteJSPopupContent).children().css("width", "");
					$(ByteJSPopupContent).children().css("height", "");
				};

				// Reset after setting applied.
				_fSet = false;
				_fPadding = 0;
				_fWidth = 0;
			}

			/**
				Custom options setter.
			*/
			var setFormatter = function (options) {
				_fSet = true;
				_fWidth = options.width;
				_fPadding = options.padding;
			}

			/**
				Public jsPop methods.
			*/
			var jsPop = {
				html: function (text, options) {
					if (options) setFormatter(options);
					html(text);
				},
				div: function (tag, options) {
					if (options) setFormatter(options);
					div(tag);
				},
				form: function (tagf, formtag, options) {
					if (options) setFormatter(options);
					form(tagf, formtag);
				},
				ajax: function (href, options) {
					href = href || _url
					if (options) setFormatter(options);
					ajax(href);
				},
				close: function () {
					close();
				},
				open: function () {
					show(_tShow);
				}
			};

			return ( window.jsPop = jsPop);

		})();
	})(window);
});
