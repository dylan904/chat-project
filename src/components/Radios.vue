<template>
  <div class="radio-wrap">
    <div class="custom-control" v-for="item in items" :key="item.value">
      <label class="custom-control-label">
        <div class="radio-input-wrap">
          <input
            v-model="value"
            type="radio"
            tabindex="-1"
            :name="`radio-${uid}`"
            class="custom-control-input"
            :value="item.value"
            @focus="$emit('focus', $event)"
            @blur="$emit('blur', $event)"
          />
          <div
            class="radio-btn"
            tabindex="0"
            @keydown="onKeyPress($event, item)"
          ></div>
        </div>
        <span v-if="keyHelper"
          ><span class="key-underline">{{ item.label.charAt(0) }}</span
          >{{ item.label.slice(1) }}</span
        >
        <span v-else>{{ item.label }}</span>
      </label>
    </div>
  </div>
</template>

<style scoped>
.key-underline {
  text-decoration: underline;
}

.custom-control-input {
  position: absolute;
  left: 0;
  top: 0;
  width: 100%;
  height: 100%;
  opacity: 0;
  margin: 0;
  cursor: pointer;
}

input[type="checkbox"],
input[type="radio"] {
  box-sizing: border-box;
  padding: 0;
}

label {
  font-size: 15px;
  line-height: 1em;
  display: inline-block;
  margin-bottom: 0.5rem;
}

.custom-control-label {
  cursor: pointer;
  position: relative;
  margin-bottom: 0;
  vertical-align: top;
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 4px;
}

.custom-control {
  position: relative;
  z-index: 1;
  display: block;
  margin: 6px;
}

.radio-input-wrap {
  position: relative;
  width: 20px;
  height: 20px;
}

.radio-btn {
  width: 100%;
  height: 100%;
}

.radio-btn::before {
  display: block;
  width: 100%;
  height: 100%;
  border: rgb(3, 79, 229) solid 2px;
  border-radius: 50%;
  content: "";
}

.radio-btn::after {
  position: absolute;
  width: 50%;
  height: 50%;
  display: block;
  border-radius: 50%;
  pointer-events: none;
  content: "";
  border-radius: 50%;
  background-color: #034fe5;
  left: 50%;
  top: 50%;

  transform: translate(-50%, -50%) scale(0);
  transition: transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.custom-control-input:checked ~ .radio-btn::after {
  transform: translate(-50%, -50%) scale(1);
}

.radio-wrap {
  display: flex;
  justify-content: space-evenly;
}
</style>

<script>
import { useModelWrapper } from "../utils/modelWrapper";

export default {
  emits: ["focus", "blur", "update:modelValue"],
  props: {
    classes: Object,
    styles: [Array, Object],
    modelValue: {
      type: String,
    },
    items: {
      type: Array,
      required: true,
    },
    keyHelper: {
      type: Boolean,
    },
  },
  setup(props, { emit }) {
    console.log('radio props', props.items)
    return {
      value: useModelWrapper(props, emit, "modelValue"),
      uid: Math.floor(Math.random() * 90000) + 10000,
    };
  },
  methods: {
    toggleValue(item) {
      if (this.value === item.value) this.value = null;
      else this.value = item.value;
    },
    onKeyPress(ev, item) {
      const key = ev.key.toLowerCase();

      console.log("test kp", { key, item });

      if (this.keyHelper) {
        for (const item of this.items) {
          if (key === item.label.charAt(0).toLowerCase()) {
            ev.stopPropagation();
            ev.preventDefault();

            this.toggleValue(item);
          }
        }
      }

      if (!item || key !== " ") return;
      ev.stopPropagation();
      ev.preventDefault();

      console.log("Space", this.value, item.value);

      this.toggleValue(item);
    },
  },
};
</script>
