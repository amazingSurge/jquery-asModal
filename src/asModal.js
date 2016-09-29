import $ from 'jquery';
import support from './support';
import DEFAULTS from './defaults';
import ANIMATIONS from './animations';

const NAMESPACE = 'asModal';


class asModal {
  constructor(element, options) {
    this.element = element;
    this.$element = $(element);
    this.$container = $('<div></div>');
    this.$contentWrap = $('<div></div>').appendTo(this.$container);
    this.$content = $('<div></div>').appendTo(this.$contentWrap);

    // options
    const metas = [];
    $.each(this.$element.data(), (k, v) => {
      const re = new RegExp("^modal", "i");
      if (re.test(k)) {
        metas[k.toLowerCase().replace(re, '')] = v;
      }
    });

    this.options = $.extend(true, {}, DEFAULTS, options, metas);
    this.namespace = this.options.namespace;

    // switch to jquery animate if not support
    if (!support.css3Support) {
      this.options.effect = this.options.effectFallback;
    }

    this.classes = {
      overlay: `${this.namespace}-overlay`,
      container: `${this.namespace}-container`,
      content: `${this.namespace}-content`,
      contentWrap: `${this.namespace}-contentWrap`,
      skin: `${this.namespace}_${this.options.skin}`,
      error: `${this.namespace}_error`,
      open: `${this.namespace}_open`,
      animateActive: `${this.namespace}_animateActive`,
      effect: `${this.namespace}_${this.options.effect}`,
      overlayEffect: `${this.namespace}_ovrelay_${this.options.effect}`,
      loading: `${this.namespace}_loading`,
      disabled: `${this.namespace}_disabled`
    };

    // skin
    if (this.options.skin) {
      this.$element.addClass(this.classes.skin);
      this.$container.addClass(this.classes.skin);
    }
    this.$container.addClass(this.classes.container);
    this.$contentWrap.addClass(this.classes.contentWrap);
    this.$content.addClass(this.classes.content);

    if (this.options.overlay) {
      this.$overlay = $('<div></div>');
      this.$overlay.addClass(this.classes.overlay);
      if (this.options.skin) {
        this.$overlay.addClass(this.classes.skin);
      }
    }

    this.isLoading = false;
    this.disabled = false;
    this.isError = false;
    this.isOpen = false;

    this._init();
  }

  _init() {
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

    this._bindEvents();

    this._trigger('ready');
  }

  _bindEvents() {
    if (this.options.closeElement) {
      this.$contentWrap.on('click.modal', this.options.closeElement, $.proxy(this.hide, this));
    }

    this.$element.on('click.modal', () => {
      if (!this.disabled) {
        this.open();
      }
      return false;
    });

    if (this.options.closeByOverlayClick) {
      // here not bind in this.$overlay because its zIndex is less then this.$container
      this.$container.on('click.modal', event => {
        /* eslint consistent-return: "off" */
        if ($(event.target).hasClass(this.classes.container)) {
          this.close();
          return false;
        }
      });
    }
  }

  _load() {
    const dtd = $.Deferred();

    if (this.options.content.charAt(0) === '#' || this.options.content.charAt(0) === '.') {
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
      }).then(html => {
        dtd.resolve($(html));
      }, () => {
        dtd.reject(this.options.errorContent);
      });
    }
    return dtd.promise();
  }

  _unbindeEvent() {
    $(document).off('keydown.modal');
  }

  _showLoading() {
    this.$loading = $('<div></div>').html(this.options.loadingContent).addClass(this.classes.loading);
    this.$loading.appendTo(this.$overlay);
  }

  _hideLoading() {
    if (this.$loading) {
      this.$loading.remove();
      this.$loading = null;
    }
  }

  _animate() {
    const dtd = $.Deferred();

    // keep consistant with css3 animateEnd event
    // extend jquery animate in Modal.animations
    if (!support.css3Support) {
      ANIMATIONS[this.options.effectFallback][this.status](this, dtd);
    } else {
      // hand over control to css3 event
      dtd.reject();
    }
    return dtd.promise();
  }

  open() {
    if (this.isLoading) {
      this._hideLoading();
    }
    if (this.options.overlay) {
      this.$overlay.addClass(this.classes.open);
      // overlay use jquery animation
      this.$overlay.animate({
        opacity: 1
      }, {
        duration: this.options.overlaySpeed
      });
    }

    if (this.options.closeByEscape) {
      $(document).on('keydown.modal', event => {
        // any bugs for different browsers, find a better way
        if (event.keyCode === 27) {
          this.close();
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

    this._load().always(() => {
      this._hideLoading();
    }).then(content => {
      this.content = content;
      this.$content.empty().html(this.content);
      this._afterOpen();
    }, error => {
      this.$content.addClass(this.classes.error);
      this.isError = true;
      this.content = error;
      this.$content.empty().html(this.content);
      this._afterOpen();
    });
  }

  _afterOpen() {
    if (this.options.focus) {
      // make sure to excute after content show
      setTimeout(() => {
        const $input = $.isFunction(this.content.find) && this.content.find('input');
        if ($input.length > 0) {
          $input.get(0).focus();
        }
      }, 10);
    }

    // show container
    this.$container.addClass(this.classes.open);

    // active css3 comeIn animation , if browser doesn't support, just ignore it
    // give some space for css3 animation
    setTimeout(() => {
      this.$contentWrap.addClass(this.classes.animateActive);
    }, 0);

    // for animation
    this.status = 'moveIn';
    this._animate().then(() => {
      // trigger jquery animation end event manually
      this.isOpen = true;
      this.$content.trigger(this.animationEnd, this);
    });
  }

  close() {
    const that = this;

    // for jquery animation
    this.status = 'moveOut';

    // css3 animationend event listener
    this.$content.on(support.animationEnd, function() {
      that._afterClose();
      that.$content.off(that.animationEnd);
      if (typeof that.options.onComplete === 'function') {
        that.options.onComplete.call(this, this);
      }

      that.$container.trigger('modal::complete', this);
      return false;
    });

    // overlay use jquery animation
    this.$overlay.animate({
      opacity: 0
    }, {
      duration: this.options.overlaySpeed,
      complete() {
        that.$overlay.removeClass(that.classes.open);
      }
    });

    // active css3 comeOut animation
    this.$contentWrap.removeClass(this.classes.animateActive);

    this._animate().then(() => {
      that._afterClose();
    });
  }

  _afterClose() {
    this._unbindeEvent();
    this.$container.removeClass(this.classes.open);
    this.isOpen = false;
  }

  enable() {
    this.disabled = false;
    this.$element.addClass(this.classes.disabled);

    this._trigger('enable');
  }

  disable() {
    this.disabled = true;
    this.$element.removeClass(this.classes.disabled);

    this._trigger('disable');
  }

  destroy() {
    this.$element.off('click.modal');
    this.$container.remove();
    this.$overlay.remove();

    this._trigger('destroy');
  }

  _trigger(eventType, ...params) {
    let data = [this].concat(...params);

    // event
    this.$element.trigger(`${NAMESPACE}::${eventType}`, data);

    // callback
    eventType = eventType.replace(/\b\w+\b/g, (word) => {
      return word.substring(0, 1).toUpperCase() + word.substring(1);
    });
    let onFunction = `on${eventType}`;

    if (typeof this.options[onFunction] === 'function') {
      this.options[onFunction].apply(this, ...params);
    }
  }

  static setDefaults(options) {
    $.extend(DEFAULTS, $.isPlainObject(options) && options);
  }
}

export default asModal;
