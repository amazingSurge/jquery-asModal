export default {
  fade: {
    moveIn(instance, dtd) {
      instance.$content.animate({
        opacity: 1
      }, {
        duration: 400,
        complete() {
          dtd.resolve();
        }
      });

    },
    moveOut(instance, dtd) {

      instance.$content.animate({
        opacity: 0
      }, {
        duration: 400,
        complete() {
          dtd.resolve();
        }
      });
    }
  }
};
