<template>
    <div class="scroll-container">
        <div ref="scrollContainer" class="snap-scroll" :style="{'--test-height': '100%' }" >
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
        shownHeight: null
      };
    },
    watch: {
    // Using a function to return the specific state to watch
    'nodesStore.focused'(newId, oldId) {
      console.log(`Focused changed from ${oldId} to ${newId}`);
      this.$nextTick(() => {
        this.calculateSections();
        console.log('scroll focused', this.$refs.scrollContainer.querySelector('.config.focused'))

        setTimeout(() => {
          this.$refs.scrollContainer.querySelector('.config.focused').scrollIntoView({
            behavior: 'smooth',
            block: 'center',
            inline: 'center'
          });
        }, 200);
      });
    }
  },
    methods: {
      getShownHeight() {
        console.log('shown??', this.sections, this.currentSection)
        if (!this.sections.length) return 0;
        const elements = this.sections[this.currentSection].elements;
        if (!elements.length) return 0;
        console.log('shown height check', elements[elements.length - 1].getBoundingClientRect().bottom, elements)
        return elements[elements.length - 1].getBoundingClientRect().bottom - elements[0].getBoundingClientRect().top + 8;
      },
      calculateSections() {
        this.shownHeight = null;
  this.$nextTick(() => {
    
    console.log('shownHeight', this.shownHeight)
    const scrollContainer = this.$refs.scrollContainer;
    const elements = [...scrollContainer.querySelectorAll(this.selector)];
    const scrollContainerHeight = scrollContainer.clientHeight;
    const totalHeight = scrollContainer.scrollHeight;
    let numberOfSections = Math.ceil(totalHeight / scrollContainerHeight);

    // Reset sections
    console.log('number of sections', numberOfSections, totalHeight, scrollContainerHeight)
    this.sections = Array.from({ length: numberOfSections }, (_, i) => ({
      top: i * scrollContainerHeight,
      height: scrollContainerHeight,
      elements: [],
    }));

    elements.forEach(el => {
      const config = el.querySelector('.config');
      const rect = config.getBoundingClientRect();
      const scrollContainerRect = scrollContainer.getBoundingClientRect();

      // Adjust rect top based on scroll container's position
      const adjustedRectTop = rect.top - scrollContainerRect.top + scrollContainer.scrollTop;
      const adjustedRectBottom = rect.bottom - scrollContainerRect.top + scrollContainer.scrollTop;

      // Find section based on adjusted positions
      let sectionIndex = this.sections.findIndex(section =>
        adjustedRectTop < section.top + section.height &&
        adjustedRectBottom > section.top
      );

      // Logic to assign element to a section and adjust section height
      if (sectionIndex !== -1) {
        this.sections[sectionIndex].elements.push(config);

        // Additional logic to adjust section heights based on where the element falls
        // This is a simplified example; you may need to further refine this logic based on your exact requirements
        const sectionBottom = this.sections[sectionIndex].top + this.sections[sectionIndex].height;
        if (adjustedRectBottom > sectionBottom) {
          // If the element extends beyond the current section, adjust the next section's top and height accordingly
          const overflowHeight = adjustedRectBottom - sectionBottom;
          if (sectionIndex + 1 < this.sections.length) {
            this.sections[sectionIndex + 1].top += overflowHeight;
            this.sections[sectionIndex + 1].height -= overflowHeight;
          }
        }
      }
    });

    this.shownHeight = this.getShownHeight();
    console.log("Sections after adjustment:", this.sections);
  });
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
      this.calculateSections();
      window.addEventListener('resize', this.calculateSections);

      //this.$refs.scrollContainer.addEventListener('wheel', this.debouncedScrollHandler, { passive: false });
    },
    beforeUnmount() {
      window.removeEventListener('resize', this.calculateSections);
      //this.$refs.scrollContainer.removeEventListener('wheel', this.debouncedScrollHandler, { passive: false });
    },
  };
  </script>
  
  <style>
  .scroll-container {
    height: 100vh;
    padding: 24px;
    background-color: #f4f4f4;
    border: 1px solid #e0e0e0;
    border-radius: 0 8px 8px 0;
  }
  .snap-scroll {
    overflow: hidden auto;
    height: calc(100% - 0);
    max-height: var(--test-height);
    padding-bottom: 24px;
    min-width: 360px;
  }
  </style>