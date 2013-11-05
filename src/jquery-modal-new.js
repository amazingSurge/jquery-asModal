/*
 * jquery.modal
 * https://github.com/amazingSurge/jquery-modal
 *
 * Copyright (c) 2013 amazingSurge
 * Licensed under the MIT license.
 */

(function(window, document, $, undefined) {
	var Modal = $.modal = function(element, options) {
		this.element = element;
		this.$element = $(element);
		this.$overlay = $('<div></div>').css({display: 'none'});
		this.$container = $('<div></div>').css({display: 'none'});

		// options
        var meta_data = [];
        $.each(this.$element.data(), function(k, v) {
            var re = new RegExp("^modal", "i");
            if (re.test(k)) {
                meta_data[k.toLowerCase().replace(re, '')] = v;
            }
        });
        this.options = $.extend(true, {}, Modal.defaults, options, meta_data);
        this.namespace = this.options.namespace;

        this.classes = {
			overlay: this.namespace + '_overlay',
			skin: this.namespace + '_' + this.options.skin,
			error: this.namespace + '_' + 'error',
			open: this.namespace + '_' + 'open'
        };

        // skin
        if (this.options.skin !== null) {
            this.$element.addClass(this.classes.skin);
            this.$container.addClass(this.classes.skin);
            this.$overlay.addClass(this.classes.skin);
        }
        this.$container.addClass(this.namespace);
        this.$overlay.addClass(this.classes.overlay);

        this.isLoading = false;
        this.enabled = true;
        this.isError = false;
        this.init();
	};

	Modal.prototype = {
		constructor: Modal,
		init: function() {
			var self = this,
				ainmate = this._animationSupport();

			// check element href
			if (this.options.content === null) {
				this.options.content = this.$element.attr('href');
			}

			this.css3Support = animate.css3Support;
			this.animationEnd = animationEnd;

			this.$container.appendTo('body');
			this.$overlay.appendTo('body');

			this.$container.on(this.animationEnd, function() {
				if (typeof self.options.onComplete === 'function') {
					self.options.onComplete.call(this,this);
				}
				self.$container.trigger('dropdown::onComplete', this);
				return false;
			});

		},
		_position: function() {},
		_load: function() {
			var self = this,
				dtd = $.Deferred();

			if (this.$content && !this.isError) {
				dtd.resolve(this.$content);
				return dtd.promise();
			}

			if (this.options.content.charAt(0) === '#' || this.options.content.charAt(0) === '.' ) {
				// element content
				dtd.resolve($(this.options.content));
			} else {
				// ajax
				$.ajax({
					type: 'get',
					cache: true,
					url: this.options.content
				}).then(function(html) {
					dtd.resolve($(html));
				}, function(error) {
					dtd.reject(self.options.error);
				});
				// loading for waiting ajax
				this._showLoading();
			}
			return dtd.promise();
		},
		_animationSupport: function() {

		},
		_unbindeEvent: function() {
			if (this.options.closeElement) {
				this.$close.off('click.dropdown');
			}			
			$(document).off('keydown.dropdown');
			this.$overlay.off('click.dropdown');
		},
		_showLoading: function() {},
		_hideLoading: function() {},
		_animate: function() {
			var dtd = $.Deferred(),
				self = this;

			this.$container.css({display: 'block'}).addClass(this.classes.open);

			// keep consistant with css3 animateEnd event
			// extend jquery animate in Modal.animations
			if (!this.css3Support) {
				Modal.animations[this.options.jqAnimate][this.status](this, dtd);
			}
			return dtd.promise();
		},
		open: function() {
			var self = this;

			if (this.isLoading) {
				this._hideLoading();
			}
			
			if (this.options.overlay) {
				this.$overlay.css({display: 'block'}).appendTo('body');
			}
			if (this.options.closeByEscape) {
				$(document).on('keydown.dropdown', function(event) {
					return false;
				});
			}
			if (this.options.closeByOverlayClick) {
				$(document).on('click.dropdown', function() {
					self.close();
					return false;
				});
			}

			this._load().then(function($content) {
				self.$content = $content;
				self.$content.appendTo(self.$container.empty());
				self._afterOpen();
			}, function(error) {
				self.$container.addClass(self.classes.error);
				self.$content = error;
				self.$content.appendTo(self.$container.empty());
				self._afterOpen();
			});
		},

		_afterOpen: function() {
			var self = this;

			// this must do after content loaded
			if (this.options.closeElement) {
				this.$close = this.$content.find(this.options.closeElement);
				this.$close.on('click.dropdown', $.proxy(this.hide, this));
			}

			// for animation 
			this.status = 'moveIn';
			this._animate().then(function() {
				self.$container.trigger(self.animationEnd, self);
			});
		},
		close: function() {
			var self = this;

			// for animation 
			this.status = 'moveOut';
			this._animate().then(function() {
				self._unbindeEvent();
				self.$overlay.css({display: 'none'});
				self.$container.removeClass(self.classes.open);
			});
		},
		enable: function() {},
		disable: function() {},
		destroy: function() {}
	};

	Modal.animations = {
		fade: {
			moveIn: function(instance, dtd) {
				instance.$container.animate({
					opacity: 1
				},{
					complete: function() {
						dtd.resolve();
					}
				});
				
			},
			moveOut: function(instance, dtd) {
				instance.$container.ainmate({
					opacity: 0
				}, {
					complete: function() {
						dtd.resolve();
					}
				});
			}
		}
	};

	Modal.defaults = {
		namespace: 'modal', // String: Prefix string attached to the class of every element generated by the plugin
		skin: null, // set plugin skin

		content: '#', // Set the URL, ID or Class.
        overlay: true, // Show the overlay.
        closeElement: '#', // Element ID or Class to close the modal
        effect: 'fade', // fadein | slide | newspaper | fall 
        jqAnimate: 'fade', // set default jquery animate when css3 animation doesn't support
        focus: true, // set focus to form element in content

        closeByEscape: true, // Allow the user to close the modal by pressing 'ESC'.
        closeByOverlayClick: true, // Allow the user to close the modal by clicking the overlay. 
        autoPosition: true, 

        // Callback API
        onOpen: null, // Callback: function() - Fires when the modal open
        onClose: null, // Callback: function() - Fires when the modal close
        onComplete: null // Callback: function() - Fires when the effect end
	};

	$.fn.modal = function(options) {
        if (typeof options === 'string') {
            var method = options;
            var method_arguments = arguments.length > 1 ? Array.prototype.slice.call(arguments, 1) : undefined;
            return this.each(function() {
                var api = $.data(this, 'modal');
                if (typeof api[method] === 'function') {
                    api[method].apply(api, method_arguments);
                }
            });
        } else {
            return this.each(function() {
                if (!$.data(this, 'modal')) {
                    $.data(this, 'modal', new Modal(this, options));
                }
            });
        }
    };

})(window, document, jQuery);