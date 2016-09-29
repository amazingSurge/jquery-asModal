import $ from 'jquery';
import asModal from './asModal';
import info from './info';

const NAMESPACE = 'asModal';
const OtherAsModal = $.fn.asModal;

const jQueryAsModal = function(options, ...args) {
  if (typeof options === 'string') {
    const method = options;

    if (/^_/.test(method)) {
      return false;
    } else if ((/^(get)/.test(method))) {
      const instance = this.first().data(NAMESPACE);
      if (instance && typeof instance[method] === 'function') {
        return instance[method](...args);
      }
    } else {
      return this.each(function() {
        const instance = $.data(this, NAMESPACE);
        if (instance && typeof instance[method] === 'function') {
          instance[method](...args);
        }
      });
    }
  }

  return this.each(function() {
    if (!$(this).data(NAMESPACE)) {
      $(this).data(NAMESPACE, new asModal(this, options));
    }
  });
};

$.fn.asModal = jQueryAsModal;

$.asModal = $.extend({
  setDefaults: asModal.setDefaults,
  noConflict: function() {
    $.fn.asModal = OtherAsModal;
    return jQueryAsModal;
  }
}, info);
