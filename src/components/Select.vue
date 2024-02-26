<template>
  <div
    :class="{ select: true, 'select--open': isOpen, 'select--condensed': size === 'condensed' }"
    :style="{ width: width + 'px' }"
  >
    <label v-show="isVisible" :for="id" :class="[hideLabel ? 'sr-only' : '']">{{
      formattedLabel
    }}</label>
    <div class="select__container">
      <div
        ref="replacementDisplay"
        :class="[
          'select__replacement-display',
          disabled ? 'select__replacement-display--disabled' : '',
          isFocused ? 'select__replacement-display--focused' : '',
        ]"
        @mousedown="!disabled && toggleDropdown($event)"
        @touchstart="!disabled && toggleDropdown($event)"
      >
        <span class="select__replacement-display__text">{{
          selectedItemText
        }}</span>
        <div class="select__replacement-display__arrow-icon">
          <span></span>
        </div>
      </div>

      <select
        :id="id"
        ref="select"
        :aria-label="formattedLabel"
        v-model="selected"
        :disabled="disabled"
        @focus="onFocus($event)"
        @blur="onBlur($event)"
        @mousedown="toggleDropdown($event)"
        @touchstart="toggleDropdown($event)"
        @keydown="handleKeypress($event)"
        :class="disabled ? 'select__replacement-display--disabled' : ''"
      >
        <option value="">{{ placeholder }}</option>
        <option
          v-for="item in items"
          v-bind:key="item.value"
          :value="item.value"
        >
          {{ item.label }}
        </option>
      </select>
      <ul class="select__dropdown" ref="selectDropdownList">
        <li
          v-for="item in items"
          v-bind:key="item.value"
          :data-value="item.value"
          :class="item.value === selected ? 'selected' : ''"
          tabindex="0"
          @click="selectItem(item.value)"
          @keydown.enter="selectItem(item.value)"
        >
          {{ item.label }}
        </li>
      </ul>
    </div>
    <div class="error__message" aria-live="polite">
      <span v-if="hasError">{{ errorMessage }}</span>
    </div>
  </div>
</template>
<script>

export default {
  name: "Select",
  props: {
    size: {
      type: String,
      default: "default",
    },
    allowBlankOption: {
      /* old prop - doesn't affect behavior */ type: Boolean,
      default: false,
    },
    blankPlaceholder: {
      type: String,
      default: "",
    },
    disabled: {
      type: Boolean,
      default: false,
    },
    id: {
      type: String,
      required: true,
    },
    items: {
      type: Array,
    },
    hasError: {
      type: Boolean,
      default: false,
    },
    hideLabel: {
      type: Boolean,
      default: false,
    },
    errorMessage: {
      type: String,
      default: "An error has occurred",
    },
    label: {
      type: String,
      default: "Select",
    },
    required: {
      type: Boolean,
      default: false,
    },
    requiredIndicator: {
      type: String,
      default: "*",
    },
    modelValue: {
      type: String,
    },
    width: {
      type: String,
    },
  },
  emits: ["focus", "blur", "update:modelValue"],
  data() {
    return {
      isFocused: null,
      isOpen: false,
      selected: this.modelValue == null ? "" : this.modelValue,
      observer: null,
    };
  },
  computed: {
    formattedLabel() {
      return `${this.label} ${this.required ? this.requiredIndicator : ""}`;
    },
    selectedItemText() {
      let displayText = "";

      if (this.selected != null && this.selected !== "") {
        let selectedItemText = "";
        for (const itemIndex in this.items) {
          if (this.items[itemIndex].value === this.selected) {
            selectedItemText = this.items[itemIndex].label;
          }
        }
        displayText = selectedItemText;
      } else {
        displayText = this.blankPlaceholder;
      }

      return displayText;
    },
    isVisible() {
      return !this.disabled;
    },
    placeholder() {
      if (this.disabled && !this.selected) {
        return this.formattedLabel;
      } else {
        return this.blankPlaceholder;
      }
    },
  },
  watch: {
    modelValue(newValue) {
      this.selected = newValue;
      this.$nextTick(function () {
        this.$refs.select.style.height = this.getOffsetHeight();
      });
    },
  },
  mounted() {
    this.updateDropdownPosition();
    window.addEventListener('resize', this.updateDropdownPosition);
    document.addEventListener("scroll", this.updateDropdownPosition);

    const observerConfig = { attributes: true, childList: true, subtree: true };
    this.observer = new MutationObserver(this.updateDropdownPosition);
    this.observer.observe(this.$el, observerConfig);

    this.$refs.replacementDisplay.width = this.$refs.select.offsetWidth + "px";
    console.log('setheight', this.blankPlaceholder
      ? this.getOffsetHeight()
      : this.size === "condensed" ? "28px" : "40px", this.size)
    this.$refs.select.style.height = this.blankPlaceholder
      ? this.getOffsetHeight()
      : this.size === "condensed" ? "28px" : "40px";
  },
  beforeUnmount() {
    window.removeEventListener('resize', this.updateDropdownPosition);
    document.removeEventListener("scroll", this.updateDropdownPosition);
    this.observer.disconnect();
  },
  methods: {
    updateDropdownPosition() {
      if (!this.$refs.select) 
        return {};

        const selectRect = this.$refs.select.getBoundingClientRect();

        this.$refs.selectDropdownList.style.width = selectRect.width + 'px';
        this.$refs.selectDropdownList.style.top = (selectRect.top + selectRect.height) + 'px';
        this.$refs.selectDropdownList.style.left = selectRect.left + 'px';
    },
    handleKeypress(event) {
      const expandKeyCodes = ["Enter", "Space", "ArrowDown", "ArrowUp"];
      const navigateKeyCodes = ["ArrowDown", "ArrowUp"];
      const selectContainer = event.target.parentNode;
      const selectedItem = selectContainer.querySelector(
        `[data-value='${this.selected}']`
      );

      if (this.isOpen && navigateKeyCodes.includes(event.code)) {
        event.preventDefault();
        let targetOption = null;

        if (selectedItem) {
          targetOption =
            event.code === "ArrowDown"
              ? selectedItem.nextElementSibling
              : selectedItem.previousElementSibling;
        } else {
          targetOption = selectContainer.querySelector(
            ".select__dropdown > :first-child"
          );
        }

        if (targetOption) {
          this.selected = targetOption.dataset.value;
          this.$emit("update:modelValue", this.selected);
          targetOption.scrollIntoView({ block: "nearest", inline: "nearest" });
        }

        this.$nextTick(function () {
          //this.$refs.selectDropdownList.style.top = this.getOffsetHeight();
        });
      } else if (
        expandKeyCodes.includes(event.code) ||
        (this.isOpen && event.code === "Tab")
      ) {
        this.toggleDropdown(event);
      }
    },
    getOffsetHeight() {
      return this.$refs.replacementDisplay.offsetHeight + "px";
    },
    onBlur(event) {
      this.$emit("blur", event);
      if (
        !event.relatedTarget ||
        !event.relatedTarget.parentElement.classList.contains(
          "select__dropdown"
        )
      ) {
        this.isOpen = false;
      }

      this.isFocused = false;
    },
    onFocus() {
      this.isFocused = true;
      this.$emit("focus", event);

      this.$nextTick(function () {
        this.$refs.select.style.height = this.getOffsetHeight();
      });
    },
    selectItem(value) {
      console.log('SELECTITEM', value)
      this.selected = value;
      this.$emit("update:modelValue", value);
      this.isOpen = false;

      this.$nextTick(function () {
        if (this.$refs.select)
          this.$refs.select.style.height = this.getOffsetHeight();
      });
    },
    toggleDropdown(event) {
      event.preventDefault();
      this.isOpen = !this.isOpen;
      document.getElementById(this.id).focus();
      //this.$refs.selectDropdownList.style.top = this.getOffsetHeight();
    },
  },
};
</script>
<style lang="scss" scoped>
@import "../assets/css/_main.scss";

.select {
  font-family: "Lato", Arial, sans-serif;
  position: relative;

  &__container {
    position: relative;
  }

  &__replacement-display {
    background: #fff;
    border: 1px solid $gray-border;
    border-radius: 4px;
    box-sizing: border-box;
    cursor: pointer;
    display: flex;
    flex-direction: row;
    font-size: 14px;
    padding: 10px 4px 11px 14px;
    position: absolute;
    width: 100%;

    &__text {
      text-align: left;
      word-break: break-word;
    }

    &__arrow-icon {
      align-items: center;
      display: flex;
      flex: auto;
      justify-content: right;
      margin-right: 2px;
      padding: 7px 12px 5px 5px;

      span {
        border-color: $font-primary transparent transparent;
        border-style: solid;
        border-width: 5px 4px 0 4px;
      }
    }
  }

  &__replacement-display--disabled {
    background: $gray-disabled;
    border-color: $gray-border;
    cursor: default;

  }

  &__dropdown {
    background: #fff;
    border: 1px solid $gray-border;
    border-bottom-left-radius: 4px;
    border-bottom-right-radius: 4px;
    border-top: none;
    box-sizing: border-box;
    display: none;
    font-size: 14px;
    max-height: 300px;
    overflow: auto;
    position: fixed;
    z-index: 2;

    li {
      cursor: pointer;
      padding: 8px;
      word-break: break-word;
      text-align: left;

      &.selected {
        background: #ddd;
      }

      &:active,
      &:focus,
      &:hover {
        background: $blue-5;
        color: #fff;
        outline: 0;
      }
    }
  }

  label {
    background: #fff;
    box-sizing: border-box;
    color: $font-primary;
    cursor: text;
    display: block;
    font-size: 12px;
    font-weight: bold;
    height: auto;
    left: 4px;
    padding: 3px 3px 0;
    position: absolute;
    top: -10px;
    width: auto;
    z-index: 1;
  }

  select {
    appearance: none;
    -moz-appearance: none;
    -webkit-appearance: none;
    background: transparent;
    border-color: transparent;
    border-radius: 4px;
    color: transparent;
    cursor: pointer;
    width: 100%;

    &:disabled {
      cursor: default;
    }

    &:not(:disabled) {
      &:hover,
      &:focus,
      &:focus-visible,
      &:active {
        background-color: white;
        border: 2px solid $blue-5;
        outline: 0;
      }
    }
  }

  &__icon {
    height: 32px;
    pointer-events: none;
    position: absolute;
    right: 0;
    top: 4px;
    width: 30px;

    span {
      border-color: #888 transparent transparent transparent;
      border-style: solid;
      border-width: 5px 4px 0 4px;
      height: 0;
      left: 50%;
      margin-left: -4px;
      margin-top: -2px;
      position: absolute;
      top: 50%;
      width: 0;
    }
  }

  &--open {
    .select__replacement-display {
      border-radius: 4px 4px 0px 0px;
    }

    .select__dropdown {
      display: block;
    }
  }

  .error {
    &__icon,
    &__message {
      color: $red-1;
      font-size: 14px;
    }

    &__icon {
      font-size: 10.5px;
      padding: 4px 5px;
      position: absolute;
      right: 0;
      top: 0;
    }

    &__message {
      margin-top: 5px;
    }
  }
}

.select--condensed {
  .select__replacement-display {
    padding: 4px 4px 5px 14px!important;
    font-weight: bold;
  }
}

.select:hover
  .select__replacement-display:not(.select__replacement-display--disabled),
.select__replacement-display--focused {
  // border-color: $blue-5;
  // border-width: 2px;
  outline: 2px solid $blue-5;
  // padding: 9px 3px 10px 13px;
}

.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  margin: -1px;
  padding: 0;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  border: 0;
  white-space: nowrap; /* Added to keep the content on a single line */
}
</style>
