export default {
  beforeMount(el, binding) {
    el.clickOutsideEvent = function (event) {
      // Check that click was outside the el and its children, and binding.value is a function
      if (
        !(el === event.target || el.contains(event.target)) &&
        typeof binding.value === "function"
      ) {
        binding.value(event);
      }
    };
    document.addEventListener("click", el.clickOutsideEvent);
  },
  unmounted(el) {
    document.removeEventListener("click", el.clickOutsideEvent);
  },
};
