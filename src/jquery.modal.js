/*
 * jquery.modal
 * https://github.com/amazingSurge/jquery-modal
 *
 * Copyright (c) 2013 amazingSurge
 * Licensed under the MIT license.
 */

(function(window, document, $, undefined) {
  "use strict";


  function isNumber(num) {
    return (typeof num === 'string' || typeof num === 'number') && !isNaN(num - 0) && num !== '';
  }

  function divideByTwo(num) {
    if (isNumber(num)) {
      return num / 2;
    }
    if (typeof num === 'string' && num.charAt(num.length - 1) === '%') {
      return num.substr(0, num.length - 1) / 2 + '%';
    }
  }

  // Constructor
  var Modal = $.Modal = function(element, options) {
    // Attach element to the 'this' keyword
    this.element = element;
    this.$element = $(element);

    // options
    var meta_data = [];
    $.each(this.$element.data(), function(k, v) {
      var re = new RegExp("^modal", "i");
      if (re.test(k)) {
        meta_data[k.toLowerCase().replace(re, '')] = v;
      }
    });
    this.options = $.extend(true, {}, Modal.defaults, options, meta_data);

    if (!$.isArray(this.options.animation)) {
      this.options.animation = [this.options.animation, this.options.animation];
    }

    // Namespacing
    var namespace = this.options.namespace;

    this.$element.addClass(namespace + '-container');

    var self = this;
    $.extend(self, {
      init: function() {
        if ($.isFunction(self.options.beforeOpen)) {
          self.$element.on('modal:beforeOpen', self.options.beforeOpen);
        }
        if ($.isFunction(self.options.afterOpen)) {
          self.$element.on('modal:afterOpen', self.options.afterOpen);
        }
        if ($.isFunction(self.options.beforeClose)) {
          self.$element.on('modal:beforeClose', self.options.beforeClose);
        }
        if ($.isFunction(self.options.afterClose)) {
          self.$element.on('modal:afterClose', self.options.afterClose);
        }

        // Bind logic
        self.$element.on('modal:open', function() {
          self.$element.trigger('modal:beforeOpen');

          self.$element.show().removeClass(namespace + '-hide');
          self.position();

          self.animate(self.$element, self.options.animation[0], self.options.duration);

          self.$element.trigger('modal:afterOpen');

          return false;
        });

        self.$element.on('modal:close', function() {
          self.$element.trigger('modal:beforeClose');

          self.animate(self.$element, self.options.animation[1], self.options.duration, null, function() {
            self.$element.hide().addClass(namespace + '-hide');
            self.$element.trigger('modal:afterClose');
          });


          return false;
        });

        if (self.options.overlay) {
          this.overlay.setup();
        }
        if (self.options.close) {
          this.close.setup();
        }

        if (self.options.closeByEscape) {
          self.$element.on('modal:open', function() {
            $(document).on('keydown.modal', function(e) {
              if (e.keyCode === 27) {
                e.preventDefault();
                self.$element.trigger('modal:close');
              }
            });
          });
          self.$element.on('modal:close', function() {
            $(document).off('keydown.modal');
          });
        }

        if (self.options.autoPosition) {
          self.$element.on('modal:open', function() {
            $(window).on('resize.modal orientationchange.modal', function() {
              self.position();
            });
          });
          self.$element.on('modal:close', function() {
            $(window).off('resize.modal orientationchange.modal');
          });
        }
      },
      overlay: {
        setup: function() {
          self.$overlay = $('<div class="' + namespace + '-overlay"></div>').appendTo('body');

          self.$element.on('modal:beforeOpen', function() {
            self.$overlay.addClass(namespace + '-show');
            self.animate(self.$overlay, namespace + '-animate-show', self.options.duration);

            // bind the overlay click to the close function, if enabled
            if (self.options.closeByOverlayClick) {
              self.$overlay.on('click.modal', function() {
                self.$element.trigger('modal:close');
              });
            }
          });

          self.$element.on('modal:beforeClose', function() {
            self.animate(self.$overlay, namespace + '-animate-hide', self.options.duration, null, function() {
              self.$overlay.removeClass(namespace + '-show');
            });

            if (self.options.closeByOverlayClick) {
              self.$overlay.off('click.modal');
            }
          });
        }
      },
      close: {
        setup: function() {
          if (self.options.close === true) {
            self.options.close = namespace + '-close';
          }
          self.$close = self.$element.find(self.options.close);

          self.$close.on('click', function() {
            self.$element.trigger('modal:close');
            return false;
          });
        }
      },
      animate: function($element, animation, duration, delay, callback) {
        if (!(window.requestAnimationFrame || window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame || window.oRequestAnimationFrame ||
          window.msRequestAnimationFrame)) {
          if ($.isFunction(callback)) {
            callback();
          }
          return;
        }

        $element.one('webkitAnimationEnd oanimationend msAnimationEnd animationend', function() {
          $element.data('animating', false);

          if ($.isFunction(callback)) {
            callback();
          }

          $element.removeClass(namespace + '-animate ' + animation);
        });

        if ($element.data('animating')) {
          $element.trigger('webkitAnimationEnd oanimationend msAnimationEnd animationend');
        }

        $element.addClass(namespace + '-animate ' + animation);
        if (duration) {
          $element.css({
            '-webkit-animation-duration': duration + 'ms',
            '-moz-animation-duration': duration + 'ms',
            '-o-animation-duration': duration + 'ms',
            '-ms-animation-duration': duration + 'ms',
            'animation-duration': duration + 'ms'
          });
        }
        if (delay) {
          $element.css({
            '-webkit-animation-delay': delay + 'ms',
            '-moz-animation-delay': delay + 'ms',
            '-o-animation-delay': delay + 'ms',
            '-ms-animation-delay': delay + 'ms',
            'animation-delay': delay + 'ms'
          });
        }

        $element.data('animating', true);
      }
    });

    self.init();
  };

  // Default options for the plugin as a simple object
  Modal.defaults = {
    animation: ['shake', 'shake'],
    duration: 1000,
    namespace: 'modal', // String: Prefix string attached to the class of every element generated by the plugin
    overlay: true,
    close: false,
    focus: true,
    closeByEscape: true,
    closeByOverlayClick: true,
    autoPosition: false,
    width: null,
    height: null,
    position: ['50%', '50%'],

    // Callback API
    beforeOpen: null, // Callback: function() - Fires before the modal open
    afterOpen: null, // Callback: function() - Fires after the modal open
    beforeClose: null, // Callback: function() - Fires before the modal close
    afterClose: null // Callback: function() - Fires after the modal close
  };

  Modal.prototype = {
    constructor: Modal,
    // This is a public function that users can call
    // Prototype methods are shared across all elements
    open: function() {
      this.$element.trigger('modal:open');
    },
    close: function() {
      this.$element.trigger('modal:close');
    },
    position: function() {
      var width, height;
      if (this.options.width) {
        width = this.options.width;
        this.$element.width(width);
      } else {
        width = this.$element.width();
      }

      if (this.options.height) {
        height = this.options.height;
        this.$element.height(height);
      } else {
        height = this.$element.height();
      }
      this.$element.css({
        marginLeft: divideByTwo('-' + width),
        marginTop: divideByTwo('-' + height),
        left: this.options.position[0],
        top: this.options.position[1]
      });
    }
  };

  // Collection method.
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
        var api = $.data(this, 'modal');
        if (!api) {
          api = new Modal(this, options);
          $.data(this, 'modal', api);
        }
        api.open();
      });
    }
  };
}(window, document, jQuery));
