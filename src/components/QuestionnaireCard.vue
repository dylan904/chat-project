<template>
  <div
    class="style-outlined"
    :class="{ focused: focused }"
    @click="handleClick"
    v-click-outside="handleClickOutside"
  >
    <div class="card-state-layer-outlined">
      <div class="state-layer"></div>
    </div>
    <div class="content-container">
      <div class="media-text-content">
        <div class="header">
          <div class="content">
            <div class="text">
              <div class="header2">Header</div>
            </div>
          </div>
          <div class="icon-button">
            <div class="container">
              <div class="state-layer2" id="close" @click="$emit('close')">
                <svg class="icons-more-vert-24-px" viewBox="0 0 24 24">
                  <path
                    d="M19 6.41 17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"
                    fill="#74777F"
                  ></path>
                </svg>
              </div>
            </div>
          </div>
        </div>
        <div class="text-content">
          <div class="supporting-text" ref="supportingText">
            <transition
              name="question-transition"
              @before-enter="onBeforeQuestionEnter"
              @enter="onQuestionEnter"
              @leave="onQuestionLeave"
              @focus="focused = true"
              @blur="focused = false"
            >
              <!--div v-for="(item, index) in currentQuestion" :key="item.q" -->
              <div
                v-if="currentQuestion"
                :key="currentQuestion.text"
                class="question-container"
                ref="currentQuestion"
              >
                <div style="padding-bottom: 12px">
                  {{ currentQuestion.text }}
                </div>

                <Radios
                  ref="radios"
                  @update:modelValue="questionAnswered"
                  v-if="questionIsRadio"
                  v-model="currentAnswer"
                  :keyHelper="true"
                  :items="currentQuestion.items.flatMap(i => i)"
                  @focus="focused = true"
                  @blur="focused = false"
                />

                <Select
                  @update:modelValue="
                    (answer) => answer && questionAnswered(answer)
                  "
                  :hideLabel="true"
                  v-else-if="currentQuestion.type === 'dropdown'"
                  id="chat-dd"
                  v-model="currentAnswer"
                  :items="currentDropdownItems"
                  @focus="focused = true"
                  @blur="focused = false"
                />
              </div>
              
              <div v-else-if="currentStep.type === 'launchpad'">
                <Vue3Lottie
                  :animationData="successLottieData"
                  :loop="false"
                  :autoplay="true"
                  :height="80" :width="80"
                  :speed="2"
                  style="margin: 0 auto; transform: translateX(-10px);" />
              </div>
            </transition>
          </div>
          <div class="actions">
            <Button
              size="small"
              label="Back"
              type="neutral"
              :disabled="stepIdx === 0"
              @click="changeQA(false)"
            />
            <Button
              :disabled="stepIdx >= steps.length - 1"
              size="small"
              label="Next"
              title="Continue to next step. [Enter]"
              @click="changeQA(true)"
            />
          </div>
        </div>
      </div>
    </div>
    <div
      class="style-outlined-progress"
      :style="{ transform: `scale(${progressX}, 1)` }"
    ></div>
  </div>
</template>

<script>
import Button from "./Button.vue";
import Radios from "./Radios.vue";
import Select from "./Select.vue";
import clickOutsideDirective from "../directives/clickOutside";
import { Vue3Lottie } from 'vue3-lottie';
import successLottieData from "../assets/data/lottie/success.json";

export default {
  emits: ["update:modelValue", "close"],
  components: {
    Button,
    Radios,
    Select,
    Vue3Lottie,
  },
  directives: {
    "click-outside": clickOutsideDirective,
  },
  data(props) {
    return {
      steps: [props.journeyData.journey.start],
      formQA: [],
      currentAnswer: null,
      stepIdx: 0,
      focused: false,
      successLottieData,
    };
  },
  watch: {
    currentQuestion() {
      this.adjustContainerHeight();
    },
  },
  mounted() {
    const _this = this;
    window.addEventListener("keyup", function (ev) {
      if (_this.focused && _this.questionIsRadio && _this.$refs.radios)
        _this.$refs.radios.onKeyPress(ev); // declared in your component methods
    });

    if (this.$refs.currentQuestion) {
      this.adjustContainerHeight(); // Adjust the height based on the new question
    } else {
      const unwatch = this.$watch("currentQuestion", (newValue) => {
        console.log("ref val change", newValue);
        if (newValue) {
          // Check if `currentQuestion` has a value
          this.adjustContainerHeight(); // Adjust the height based on the new question
          unwatch(); // Remove the watcher after adjusting the height
        }
      });
    }
  },
  methods: {
    parentMethod() {
      console.log("Event handled in parent, calling method in child");
    },

    handleClick() {
      console.log("click");
      this.focused = true;
    },
    handleClickOutside() {
      console.log("clickoutside");
      this.focused = false;
    },
    adjustContainerHeight() {
      this.$nextTick(() => {
        if (this.$refs.currentQuestion) {
          const contentHeight = this.$refs.currentQuestion.scrollHeight;
          this.$refs.supportingText.style.height = `${contentHeight}px`;
        }
      });
    },
    onBeforeQuestionEnter(el) {
      // Initially set height to 0 to start the transition from 0
      el.style.height = "0";

      // Make sure to also set the supportingText container's overflow to hidden temporarily if needed
      this.$refs.supportingText.style.overflow = "hidden";
    },
    onQuestionEnter(el, done) {
      const updateHeight = () => {
        // Set the height of the supportingText container to match the entering element
        const height = el.scrollHeight;
        el.style.height = `${height}px`;
        this.$refs.supportingText.style.height = `${height}px`;
      };

      this.$nextTick(() => {
        updateHeight();
        el.addEventListener("transitionend", () => {
          // reset height to auto for responsive adjustments
          el.style.height = "auto";

          // Cleanup: reset the container's height to auto after transition completes
          //this.$refs.supportingText.style.height = "";
          this.$refs.supportingText.style.overflow = "visible";
          done();
        });
      });
    },
    onQuestionLeave(el, done) {
      // Set the element's height to its scrollHeight then to 0 to animate hiding
      el.style.height = `${el.scrollHeight}px`;
      this.$nextTick(() => {
        el.style.height = "0";
        el.addEventListener("transitionend", done);
      });
    },

    questionAnswered(answer) {
      if (answer === null || typeof answer === "undefined") return;
      console.log()
      this.currentStep.answer = answer;

      setTimeout(() => {

        this.currentStep.path.find(p => {
          console.log('target try', p.option, answer, this.currentQuestion.ref)
          return p.option === answer || p.option === this.currentQuestion.ref;
        })
        
        this.steps.push(this.currentStep.path.find(p => p.option === answer || p.option === this.currentQuestion.ref));
        ++this.stepIdx;

        console.log("questionAnswered", answer, this.currentStep);
        this.$nextTick(() => {
          this.currentAnswer = null; // reset temp variable
        });
      }, 500);
    },
    changeQA(isForward) {
      if (isForward) ++this.stepIdx;
      else --this.stepIdx;

      this.$nextTick(() => {
        console.log("setAnswer", {
          answer: this.steps[this.stepIdx].answer,
          stepIdx: this.stepIdx,
          step: this.steps[this.stepIdx],
          currentStep: this.currentStep,
        });
        this.currentAnswer = this.steps[this.stepIdx].answer;
      });
    },
    getMaxSubsequentSteps(node) {
      if (node.type === "launchpad" || node.type === "roadblock") {
        return 0;
      }

      // If the node is a question, recursively calculate the depth of each path
      if (node.type === "question" && node.path) {
        let maxDepth = 0;

        node.path.forEach((item) => {
          console.log('getMaxSubsequentSteps inner', item)
          const depth = this.getMaxSubsequentSteps(item);
          maxDepth = Math.max(maxDepth, depth);
        });

        // Add 1 to include the current step in the count
        return 1 + maxDepth;
      }

      // In case the node doesn't match any known types, return 0 as a safe fallback
      return 0;
    },
  },
  computed: {
    questionIsRadio() {
      return (
        this.currentQuestion.type === "radio"
      );
    },
    currentDropdownItems() {
      return this.currentQuestion.items.flatMap(item => 
        item.map(item => ({
            label: item.label,
            value: item.label // Set the value to the same as label
        })
      ))
    },
    currentStep() {
      return this.steps[this.stepIdx];
    },
    currentQuestion() {
      if (!this.currentStep || this.currentStep.type !== "question")
        return null;
      return this.journeyData.questions[this.currentStep.q];
    },
    progressX() {
      console.log('try', this.currentStep, this.stepIdx, this.steps)
      const totalSteps =
        this.steps.length + this.getMaxSubsequentSteps(this.currentStep);
      return this.steps.length / totalSteps;
    },
  },
  props: {
    classes: Object,
    styles: [Array, Object],
    journeyData: Object,
    modelValue: {
      type: Object,
    }
  },
};
</script>

<style>
.style-outlined {
  background: var(--m-3-sys-light-surface, #faf9fd);
  border-radius: 12px;
  box-shadow: 0 0 0 1px #c4c6d0;
  display: flex;
  flex-direction: row;
  gap: 0px;
  align-items: flex-start;
  justify-content: flex-start;
  flex-shrink: 0;
  width: 360px;
  max-height: 480px;
  margin-top: 48px;
  position: relative;
  overflow: hidden;
  transition: box-shadow 0.25s ease;
}

.style-outlined.focused {
  box-shadow: 0 0 0 2px #8bb2fe;
}

.style-outlined:not(.focused) .key-underline {
  text-decoration: none;
}

.style-outlined-progress {
  position: absolute;
  height: 5px;
  background: #009dd9;
  width: 100%;
  top: 0;
  left: 0;
  transform-origin: 0 50%;
  transition: transform 0.4s cubic-bezier(0.76, 0, 0.24, 1);
}

.state-layer {
  padding: 10px;
  display: flex;
  flex-direction: column;
  gap: 10px;
  align-items: center;
  justify-content: center;
}
.content-container {
  border-width: 1px;
  align-self: stretch;
  flex: 1;
  position: relative;
  overflow: hidden;
}
.media-text-content {
  display: flex;
  flex-direction: column;
  gap: 0px;
  align-items: center;
  justify-content: flex-start;
}
.header {
  padding: 12px 4px 12px 16px;
  display: flex;
  flex-direction: row;
  gap: 0px;
  align-items: center;
  justify-content: flex-start;
  align-self: stretch;
  flex-shrink: 0;
  height: 72px;
  position: relative;

  height: 56px;
}
.content {
  display: flex;
  flex-direction: row;
  gap: 16px;
  align-items: center;
  justify-content: flex-start;
  flex: 1;
  position: relative;
}
.monogram {
  flex-shrink: 0;
  width: 40px;
  height: 40px;
  position: relative;
  overflow: hidden;
  background: var(--m-3-sys-light-primary, #005db8);
  border-radius: 50%;
}

.initial {
  color: var(--m-3-sys-light-surface, #faf9fd);
  text-align: center;
  font-family: var(--m-3-title-medium-font-family, "Roboto-Medium", sans-serif);
  font-size: var(--m-3-title-medium-font-size, 16px);
  line-height: var(--m-3-title-medium-line-height, 24px);
  font-weight: var(--m-3-title-medium-font-weight, 500);
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
}
.text {
  display: flex;
  flex-direction: column;
  gap: 4px;
  align-items: flex-start;
  justify-content: flex-start;
  flex: 1;
  position: relative;
}
.header2 {
  color: var(--m-3-sys-light-on-surface, #1a1b1e);
  text-align: left;
  font-family: var(--m-3-title-medium-font-family, "Roboto-Medium", sans-serif);
  font-size: var(--m-3-title-medium-font-size, 16px);
  line-height: var(--m-3-title-medium-line-height, 24px);
  font-weight: var(--m-3-title-medium-font-weight, 500);
  position: relative;
  align-self: stretch;
}
.subhead {
  color: var(--m-3-sys-light-on-surface, #1a1b1e);
  text-align: center;
  font-family: var(--m-3-body-medium-font-family, "Roboto-Regular", sans-serif);
  font-size: var(--m-3-body-medium-font-size, 14px);
  line-height: var(--m-3-body-medium-line-height, 20px);
  font-weight: var(--m-3-body-medium-font-weight, 400);
  position: relative;
  width: 56.81px;
}
.icon-button {
  display: flex;
  flex-direction: column;
  gap: 10px;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  width: 48px;
  height: 48px;
  position: relative;
}
.container {
  border-radius: 100px;
  display: flex;
  flex-direction: row;
  gap: 10px;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  position: relative;
  overflow: hidden;
}
.state-layer2 {
  padding: 8px;
  display: flex;
  flex-direction: row;
  gap: 10px;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  position: relative;
  cursor: pointer;
}
.icons-more-vert-24-px {
  flex-shrink: 0;
  width: 24px;
  height: 24px;
  position: relative;
  overflow: visible;
}

.text-content {
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 32px;
  align-items: flex-start;
  justify-content: flex-start;
  align-self: stretch;
  flex-shrink: 0;
  position: relative;
}
.headline {
  display: flex;
  flex-direction: column;
  gap: 0px;
  align-items: flex-start;
  justify-content: flex-start;
  align-self: stretch;
  flex-shrink: 0;
  position: relative;
}
.title {
  color: var(--m-3-sys-light-on-surface, #1a1b1e);
  text-align: left;
  font-family: var(--m-3-body-large-font-family, "Roboto-Regular", sans-serif);
  font-size: var(--m-3-body-large-font-size, 16px);
  line-height: var(--m-3-body-large-line-height, 24px);
  font-weight: var(--m-3-body-large-font-weight, 400);
  position: relative;
  width: 328px;
}
.subhead2 {
  color: var(--m-3-sys-light-on-surface-variant, #44474e);
  text-align: left;
  font-family: var(--m-3-body-medium-font-family, "Roboto-Regular", sans-serif);
  font-size: var(--m-3-body-medium-font-size, 14px);
  line-height: var(--m-3-body-medium-line-height, 20px);
  font-weight: var(--m-3-body-medium-font-weight, 400);
  position: relative;
  width: 328px;
}
.supporting-text {
  color: var(--m-3-sys-light-on-surface-variant, #44474e);
  text-align: left;
  font-family: var(--m-3-body-medium-font-family, "Roboto-Regular", sans-serif);
  font-size: var(--m-3-body-medium-font-size, 14px);
  line-height: var(--m-3-body-medium-line-height, 20px);
  font-weight: var(--m-3-body-medium-font-weight, 400);
  position: relative;
  align-self: stretch;
}
.actions {
  display: flex;
  flex-direction: row;
  gap: 8px;
  align-items: flex-start;
  justify-content: flex-end;
  align-self: stretch;
  flex-shrink: 0;
  position: relative;
}

.label-text {
  color: var(--m-3-sys-light-primary, #005db8);
  text-align: center;
  font-family: var(--m-3-label-large-font-family, "Roboto-Medium", sans-serif);
  font-size: var(--m-3-label-large-font-size, 14px);
  line-height: var(--m-3-label-large-line-height, 20px);
  font-weight: var(--m-3-label-large-font-weight, 500);
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
}
.label-text2 {
  color: var(--m-3-sys-light-on-primary, #ffffff);
  text-align: center;
  font-family: var(--m-3-label-large-font-family, "Roboto-Medium", sans-serif);
  font-size: var(--m-3-label-large-font-size, 14px);
  line-height: var(--m-3-label-large-line-height, 20px);
  font-weight: var(--m-3-label-large-font-weight, 500);
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
}

.question-transition-enter-active,
.question-transition-leave-active {
  opacity: 1;
  transition: opacity 3s ease;
}

.question-transition-enter-from,
.question-transition-leave-to /* Updated class names for Vue 3 */ {
  opacity: 0;
}

.supporting-text {
  position: relative; /* Add this line */
  transition: height 0.2s ease;
}

.question-container {
  position: absolute; /* Make question containers overlap */
  top: 0;
  left: 0;
  width: 100%; /* Ensure it spans the full width of the container */
  opacity: 1; /* Initial opacity */

  transition: height 0.2s ease; /* Smooth transition for height */
}

.question-transition-enter-active,
.question-transition-leave-active {
  transition: opacity 0.3s ease, height 0.2s ease;
  overflow: hidden;
}

.question-transition-enter-from,
.question-transition-leave-to {
  opacity: 0; /* Fade out */
}

/* After the transition ends (element has fully entered or left), allow overflow content */
.question-transition-enter-to,
.question-transition-leave-from {
  overflow: visible;
}
</style>
