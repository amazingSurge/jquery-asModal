/*
 * jquery.modal
 * https://github.com/amazingSurge/jquery-modal
 *
 * Copyright (c) 2013 amazingSurge
 * Licensed under the MIT license.
 */

(function(window, document, $, undefined) {

	var CrossBroswer = (function(){
		var el = document.createElement('fakeelement'),
            transitions = {
                transition:         'transitionend',
                WebkitTransition:   'webkitTransitionEnd'
            },
            css3Support = false,
            transition;

        // Check transition.
        for( var t in transitions ) {
            if ( transitions.hasOwnProperty(t) && el.style[t] !== undefined ) {
                transition =  transitions[t];
            }
        }

		if (transition) {
			css3Support = true;
		}
		return {
			css3Support: css3Support,
			animationEnd: transition
		};
	})();

	var Modal = $.modal = function(element, options) {
		this.element = element;
		this.$element = $(element);
		this.$overlay = $('<div></div>').css({display: 'none'});
		this.$container = $('<div></div>').css({display: 'none'});
		this.$contentWrap = $('<div></div>').appendTo(this.$container);
		this.$content = $('<div></div>').appendTo(this.$contentWrap);

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

		this.css3Support = CrossBroswer.css3Support;
		this.animationEnd = CrossBroswer.animationEnd;
		
		// switch to jquery animate if not support
		if (!this.css3Support) {
			this.options.effect = this.options.jqAnimate;
		}

        this.classes = {
			overlay: this.namespace + '-overlay',
			container: this.namespace + '-container',
			content: this.namespace + '-content',
			contentWrap: this.namespace + '-contentWrap',
			skin: this.namespace + '_' + this.options.skin,
			error: this.namespace + '_' + 'error',
			open: this.namespace + '_' + 'open',
			effect: this.namespace + '_' + this.options.effect,
			overlayEffect: this.namespace + '_ovrelay_' + this.options.effect,
			loading: this.namespace + '_loading'
        };

        // skin
        if (this.options.skin !== null) {
            this.$element.addClass(this.classes.skin);
            this.$container.addClass(this.classes.skin);
            this.$overlay.addClass(this.classes.skin);
        }
        this.$container.addClass(this.classes.container);
        this.$overlay.addClass(this.classes.overlay);
        this.$contentWrap.addClass(this.classes.contentWrap);
        this.$content.addClass(this.classes.content);

        this.isLoading = false;
        this.enabled = true;
        this.isError = false;
        this.isOpen = false;

        this.init();
	};

	Modal.prototype = {
		constructor: Modal,
		init: function() {
			var self = this;

			// check element href
			if (this.options.content === null) {
				this.options.content = this.$element.attr('href');
			}

			// add animation effect
			this.$contentWrap.addClass(this.classes.effect);
			this.$overlay.addClass(this.classes.overlayEffect);

			this.$container.appendTo('body');
			this.$overlay.appendTo('body');

			// set fixed width/height
			if (this.options.width) {
				this.$content.width(this.options.width);
			}
			if (this.options.height) {
				this.$content.height(this.options.height);
			}

			this.$element.on('click.modal', function() {
				if (self.enabled) {
					self.open();
				}
				return false;
			});
			
			if (this.options.closeByOverlayClick) {
				// here not bind in this.$overlay because its zIndex is less then this.$container
				this.$container.on('click.modal', function(event) {
					if ($(event.target).hasClass(self.classes.container)) {
						self.close();
						return false;
					}
				});
			}
		},
		_load: function() {
			var self = this,
				dtd = $.Deferred();

			if (this.options.content.charAt(0) === '#' || this.options.content.charAt(0) === '.' ) {
				// element content
				dtd.resolve($(this.options.content));
			} else {
				// loading for waiting ajax
				this._showLoading();

				// ajax
				$.ajax({
					type: 'get',
					cache: true,
					url: this.options.content
				}).then(function(html) {
					dtd.resolve($(html));
				}, function() {
					dtd.reject(self.options.errorText);
				});
			}
			return dtd.promise();
		},
		_unbindeEvent: function() {
			if (this.options.closeElement) {
				this.$close.off('click.modal');
			}			
			$(document).off('keydown.modal');
		},
		_showLoading: function() {
			this.$loading = $('<div>loading...</div>').addClass(this.classes.loading);
			this.$loading.appendTo(this.$overlay);
		},
		_hideLoading: function() {
			if (this.$loading) {
				this.$loading.remove();
				this.$loading = null;
			}
		},
		_animate: function() {
			var dtd = $.Deferred();

			// keep consistant with css3 animateEnd event
			// extend jquery animate in Modal.animations
			if (!this.css3Support) {
				Modal.animations[this.options.jqAnimate][this.status](this, dtd);
			} else {
				// hand over control to css3 event
				dtd.reject();
			} 
			return dtd.promise();
		},
		open: function() {
			var self = this;

			if (this.isLoading) {
				this._hideLoading();
			}			
			if (this.options.overlay) {
				this.$overlay.css({display: 'block',opacity: 0});
			}
			if (this.options.closeByEscape) {
				$(document).on('keydown.modal', function(event) {
					// any bugs for different browsers, find a better way
					if (event.keyCode === 27) {
						self.close();
					}
				});
			}

			if (this.content && !this.isError) {
				// prevent reloading
				this._afterOpen();
				return;
			}

			// clear last open info before load
			this.$content.removeClass(this.classes.error);

			this._load().always(function() {
				self._hideLoading();
			}).then(function(content) {
				self.content = content;
				self.$content.empty().html(self.content);
				self._afterOpen();
			}, function(error) {
				self.$content.addClass(self.classes.error);
				self.isError = true;
				self.content = error;
				self.$content.empty().html(self.content);
				self._afterOpen();
			});
		},
		_afterOpen: function() {
			var self = this;

			// this must do after content loaded
			if (this.options.closeElement) {
				this.$close = this.content.find(this.options.closeElement);
				this.$close.on('click.modal', $.proxy(this.hide, this));
			}

			// show container
			this.$container.css({display: 'block'});
			
			// active css3 comeIn animation , if browser doesn't support, just ignore it 
			// give some space for css3 animation
			setTimeout(function(){
				self.$contentWrap.addClass(self.classes.open);
				self.$overlay.addClass(self.classes.open);
			}, 0);

			// overlay use jquery animation
			this.$overlay.animate({opacity:1},{
				duration: this.options.overlaySpeed
			});

			// for animation 
			this.status = 'moveIn';
			this._animate().then(function() {
				// trigger jquery animation end event manually
				self.isOpen = true;
				self.$content.trigger(self.animationEnd, self);
			});
		},
		close: function() {
			var self = this;

			// for jquery animation 
			this.status = 'moveOut';

			// css3 animationend event listener
			this.$content.on(this.animationEnd, function() {
				self._afterClose();
				self.$content.off(self.animationEnd)
				if (typeof self.options.onComplete === 'function') {
					self.options.onComplete.call(this,this);
				}
				self.$container.trigger('modal::onComplete', this);
				return false;
			});

			// overlay use jquery animation
			this.$overlay.animate({opacity: 0},{
				duration: this.options.overlaySpeed,
				complete: function() {
					self.$overlay.css({display:'none'});
				}
			});

			// active css3 comeOut animation 
			this.$contentWrap.removeClass(this.classes.open);
			//this.$overlay.removeClass(this.classes.open);

			this._animate().then(function() {
				self._afterClose();
			});
		},
		_afterClose: function() {
			this._unbindeEvent();
			this.$container.removeClass(this.classes.open).css({display: 'none'});
			this.isOpen = false;
		},
		enable: function() {
			this.enabled = true;
			this.$element.addClass(this.classes.enabled);
		},
		disable: function() {
			this.enabled = false;
			this.$element.removeClass(this.classes.enabled);
		},
		destroy: function() {
			this.$element.off('click.modal');
			this.$container.remove();
			this.$overlay.remove();
		}
	};

	Modal.animations = {
		fade: {
			moveIn: function(instance, dtd) {

				instance.$content.animate({
					opacity: 1
				},{
					duration: 400,
					complete: function() {
						dtd.resolve();
					}
				});
				
			},
			moveOut: function(instance, dtd) {

				instance.$content.animate({
					opacity: 0
				}, {
					duration: 400,
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

		content: null, // Set the URL, ID or Class.
        overlay: true, // Show the overlay.
        closeElement: null, // Element ID or Class to close the modal
        effect: 'fadeScale', // fadein | slide | newspaper | fall 
        overlaySpeed: 200, // Sets the speed of the overlay, in milliseconds
        jqAnimate: 'fade', // set default jquery animate when css3 animation doesn't support
        focus: true, // set focus to form element in content
        errorText: 'sorry, cant find the file !', // set ajax error text

        closeByEscape: true, // Allow the user to close the modal by pressing 'ESC'.
        closeByOverlayClick: true, // Allow the user to close the modal by clicking the overlay. 
        
        width: null, // Set a fixed total width.
        hieght: null, // Set a fixed total height.

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