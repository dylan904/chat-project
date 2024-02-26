<template>
  <button
    @focus="onFocus"
    @blur="$emit('blur', $event)"
    :class="classes"
    :disabled="disabled || null"
    @mousedown="pressed = true"
    @click="onClick"
  >
    <span v-if="$slots.icon" class="btn-icon">
      <slot name="icon"></slot>
    </span>

    <div style="display: flex">
      <span ref="label" class="btn--label">{{ label }}</span>
      <input
        ref="input"
        v-if="hasInput"
        @blur="focused = false"
        @keyup.enter="onSubmit"
        :placeholder="inputPlaceholder"
        v-model="currentInputText"
        :style="{
          width: inputInitWidth + 'px',
        }"
      />
    </div>
  </button>
</template>

<script>
export default {
  name: "Button",
  emits: ["input", "submit", "onClick", "focus", "blur"],
  props: {
    disabled: Boolean,
    hasInput: Boolean,
    inputPlaceholder: String,
    label: String,
    size: {
      type: String,
      default: "medium",
      validator: function (value) {
        return ["small", "medium", "large"].indexOf(value) !== -1;
      },
    },
    type: {
      type: String,
      default: "default",
      validator: function (value) {
        return (
          ["default", "primary", "black", "danger", "neutral"].indexOf(
            value
          ) !== -1
        );
      },
    },
    btnClasses: Object,
    inputText: String,
    title: String,
  },

  data() {
    return {
      inputInitWidth: 0,
      inputReady: false,
      focused: false,
      pressed: false,
    };
  },

  computed: {
    classes() {
      if (this.hasInput)
        console.log("checkit2", this.$slots.icon && !this.label);
      return {
        btn: true,
        [`btn--${this.type}`]: true,
        [`btn--${this.size}`]: true,
        "btn--has-input": this.hasInput,
        "btn--input-focused": this.focused,
        "btn--input-ready": this.inputReady,
        "btn--icon-only": this.$slots.icon && !this.label,
        "btn--pressed": this.pressed,
        ...this.btnClasses,
      };
    },

    currentInputText: {
      get: function () {
        return this.inputText;
      },
      set: function (newValue) {
        this.$emit("input", newValue);
      },
    },
  },

  mounted() {
    if (this.hasInput) {
      console.log("checkit", this.$slots.icon && !this.label);

      if (this.$slots.icon && !this.label) {
        this.inputInitWidth = 0;
      } else {
        const rect = this.$refs.label.getBoundingClientRect();
        console.log("btninput width", rect.width);
        this.inputInitWidth = rect.width;
        this.inputReady = true;
      }

      console.log("mountbtn", this.$el, this.inputText, this.currentInputText);

      //this.$watch('$route', this.onRouteChange);
    }
  },

  methods: {
    onFocus(event) {
      this.$emit("blur", event);
      if (this.hasInput) this.onInputFocus(event);
    },
    onSubmit() {
      console.log("SUBMIT!");
      this.$emit("submit", this.currentInputText);
      this.$refs.input.blur();
    },
    onClick() {
      const _this = this;
      setTimeout(() => {
        console.log("btn click");
        _this.pressed = false;
      }, 100);

      this.$emit("onClick");

      if (this.hasInput) {
        this.onInputFocus();
        this.$refs.input.select();
        this.$refs.input.focus();
      }
    },
    onInputFocus() {
      console.log("input focusing");

      this.focused = true;
    },
  },
};
</script>
<style lang="scss" scoped>
@import "../assets/css/_variables.scss";

.btn {
  border-radius: 4px;
  color: #fff;
  cursor: pointer;
  font-family: "Roboto", sans-serif;
  line-height: 1.2;
  display: inline-flex;
  align-items: center;

  transition-property: background-color, border, color, opacity;
  transition-duration: 0.2s;
  transition-timing-function: ease-out;

  &--black {
    background: rgb(15, 20, 25);
    border: 1px solid rgb(15, 20, 25);
  }

  &:active,
  &:focus,
  &:hover,
  &.btn--input-focused {
    background: $blue-active;
    border-color: $blue-active;
    color: #fff;
    outline: 0;

    & input::placeholder {
      color: white;
    }
  }
  &--default {
    background: $blue-primary;
    border: 1px solid $blue-primary;
  }
  &--primary {
    background: $button-green;
    border: 1px solid $button-green;

    &:active,
    &:focus,
    &:hover,
    &.btn--input-focused {
      background: #2a5200;
      border-color: #2a5200;
    }
  }
  &--danger {
    background: $red-1;
    border: 1px solid $red-1;

    &:active,
    &:focus,
    &:hover,
    &.btn--input-focused {
      background: #962e29;
      border-color: #962e29;
      color: #fff;
    }
  }
  &--neutral {
    background: #fff;
    border: 1px solid $blue-primary;
    color: $blue-primary;

    &:active,
    &:focus,
    &:hover,
    &.btn--input-focused {
      background: #e6eeff;
      border-color: #e6eeff;
      color: $blue-active;
    }

    &.btn--pressed {
      background: #f5f9ff;
    }

    &:disabled {
      color: #8bb2fe !important;
      border-color: #8bb2fe !important;
      background: transparent !important;
    }

    &--neutral {
      background: #fff;
      border: 1px solid var(--blue-primary);
      color: var(--blue-primary);
    }
  }
  &:disabled {
    background: $blue-disabled;
    border-color: $blue-disabled;
    opacity: 0.65;
    pointer-events: none;
  }
  &--small {
    font-size: 14px;
    padding: 4px 16px;
  }
  &--medium {
    font-size: 16px;
    padding: 8px 16px;
  }
  &--large {
    font-size: 18px;
    padding: 12px 24px;
  }

  & > .btn-icon {
    margin-right: 10px;
    height: fit-content;
    width: fit-content;
    display: flex;
    fill: currentColor;
  }

  &--has-input {
    & input {
      border: none;
      border-radius: 4px;
      padding: 2px 0px;
      font-size: 16px;
      position: relative;
      line-height: 1.2;
      transition-property: width, margin-left, opacity, padding;
      transition-duration: 0.2s;
      transition-timing-function: ease-out;
      outline: none !important;
      display: none;
      opacity: 0;
      //   font-weight: bold;
      cursor: pointer;
      //   background-color: transparent;

      &::placeholder {
        color: #0573e1;
        transition: color 0.2s ease-out;
      }
    }

    &.btn--small {
      padding-top: 3px;
      padding-bottom: 3px;
    }

    & .btn--label {
      padding: 2px 4px;
    }

    & > .btn-icon {
      margin-right: 5px;
    }

    &.btn--input-ready {
      & input {
        display: inline-block;
      }
      & .btn--label {
        position: absolute;
      }
    }

    &.btn--input-focused {
      & input {
        padding: 2px 4px;
        margin-left: 9px;
        width: 150px !important;
        //  background-color: white;
        opacity: 1;

        &::placeholder {
          color: rgb(117, 117, 117);
        }
      }
      & .btn--label {
        visibility: hidden;
      }
    }
  }

  &--icon-only {
    & .btn-icon {
      margin-right: 0;
    }

    & .btn--label {
      display: none;
    }

    & input {
      display: inline-block;
    }
    & .btn--label {
      position: absolute;
    }
  }
}
</style>
