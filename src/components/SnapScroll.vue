<template>
    <div class="scroll-container">
        <div ref="scrollContainer" class="snap-scroll" :style="{'--test-height': shownHeight + 'px' }" >
        <slot></slot>
      </div>
    </div>
  </template>
  
  <script>
    import { useNodesStore } from '../stores/nodes';

    let debounceTimeout;
    const debounceDuration = 100; // milliseconds

  export default {
    name: 'SnapScroll',
    props: {
      selector: {
        type: String,
        required: true,
      },
    },
    computed: {

    },
    data() {
      return {
        sections: [],
        currentSection: 0,
        nodesStore: useNodesStore(),
        sectionsPerPage: 0,
        shownHeight: 0,
      };
    },
    watch: {
    // Using a function to return the specific state to watch
    'nodesStore.focused'(newId, oldId) {
      console.log(`Focused changed from ${oldId} to ${newId}`);
      this.$nextTick(() => {
        this.calculateSections();
        console.log(this.sections)
      });
    }
  },
    methods: {
      getShownHeight() {
        if (!this.sections.length) return 0;
        const elements = this.sections[this.currentSection].elements;
        if (!elements.length) return 0;
        return elements[elements.length - 1].getBoundingClientRect().bottom - elements[0].getBoundingClientRect().top + 24;
      },
        calculateSections() {
          this.$nextTick(() => {
            this.shownHeight = this.getShownHeight();
          });
  // Clear existing sections
  this.sections = [];

  const scrollContainer = this.$refs.scrollContainer;
  const scrollContainerHeight = scrollContainer.clientHeight;
  const totalHeight = scrollContainer.scrollHeight;
  let numberOfSections = Math.ceil(totalHeight / scrollContainerHeight);

  for (let i = 0; i < numberOfSections; i++) {
    // Calculate the top value for each section based on the container's height
    let sectionTop = i * scrollContainerHeight;
    this.sections.push({
      top: sectionTop,
      height: scrollContainerHeight,
      elements: [] // This example does not associate specific elements with sections
    });
  }

  const elements = [...scrollContainer.querySelectorAll(this.selector)];
  //const containerHeight = scrollContainer.clientHeight;

    elements.forEach((el) => {
        //const rect = element.getBoundingClientRect();
        const config = el.querySelector('.config');
        const rect = config.getBoundingClientRect();
        
        const currentSection = this.sections.find(section => {
            return section.top < rect.top && section.top + section.height > rect.top + rect.height;
        });

        if (!currentSection) {
            console.error("Element is not in any section");
            return;
        }
        currentSection.elements.push(config);
    });

  // Optional: Log sections for debugging
  console.log("Sections:", this.sections);
},

debouncedScrollHandler(ev) {
  clearTimeout(debounceTimeout);

  const direction = ev.deltaY > 0 ? 'down' : 'up';

  // Set a new timeout
  debounceTimeout = setTimeout(() => {
    console.log('Debounced Scroll Detected', direction);
    if (direction === 'down') {
      this.currentSection = Math.min(this.currentSection + 1, this.sections.length - 1);
    } else {
      this.currentSection = Math.max(this.currentSection - 1, 0);
    }
  }, debounceDuration);

  // Prevent the default scrolling behavior
  ev.preventDefault();
}
,


      scrollToSection(index) {
        if (index >= 0 && index < this.sections.length) {
          window.scrollTo({
            top: this.sections[index].top,
            behavior: 'smooth',
          });
        }
      },

    },
    mounted() {
      
      console.log('shownHeight', this.shownHeight)
      this.calculateSections();
      window.addEventListener('resize', this.calculateSections);

      this.$refs.scrollContainer.addEventListener('wheel', this.debouncedScrollHandler, { passive: false }); // Use passive: false to allow preventDefault()
    },
    beforeUnmount() {
      window.removeEventListener('resize', this.calculateSections);
    },
  };
  </script>
  
  <style>
  .scroll-container {
    /* Styles for your scroll container */
    height: 100%; /* Example height */
  }
  .snap-scroll {
    overflow-y: hidden;
    height: calc(100% - 48px);
    max-height: var(--test-height)
  }
  </style>