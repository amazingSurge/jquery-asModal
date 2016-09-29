const support = ((() => {
  const el = document.createElement('fakeelement');

  const transitions = {
    transition: 'transitionend',
    WebkitTransition: 'webkitTransitionEnd'
  };

  let css3Support = false;
  let transition;

  // Check transition.
  for (const t in transitions) {
    if (transitions.hasOwnProperty(t) && el.style[t] !== undefined) {
      transition = transitions[t];
    }
  }

  if (transition) {
    css3Support = true;
  }
  return {
    css3Support,
    animationEnd: transition
  };
}))();

export default support;
