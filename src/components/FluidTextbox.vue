<template>
    <div 
    :class="{ 'editable-container': true, 'pending-deletion': state.pendingDeletion }">
      <div 
        contenteditable="true" 
        class="text editable"
        @input="updateSuggestions" 
        @keydown="handleKeydown"
        v-html="modelValue"
        @focus="$emit('focus', $event)"
        @blur="onBlur"
        ref="editable">
      </div>

      <div v-if="removable" class="remove-wrap">
        <button @click="remove(index)" @mouseenter="state.pendingDeletion = true" @mouseleave="state.pendingDeletion = false" class="remove mini"></button>
      </div>

      <ul v-if="state.showSuggestions" class="suggestions">
        <li v-for="(suggestion, index) in state.filteredSuggestions" 
            :key="index" 
            @mousedown="selectSuggestion(suggestion)">
          {{ suggestion }}
        </li>
      </ul>
    </div>
  </template>
  
  <script>
  import { ref, reactive, watch } from 'vue';
  
  export default {
    name: 'FluidTextbox',
    emits: ['update:modelValue', 'focus', 'blur'],
    props: {
      maxTotalCharacters: {
        type: Number,
        default: 200
      }, 
      maxWidth: {
        type: Number,
        default: 400
      }, 
        modelValue: {
            type: String,
            required: true
        },
        removable: {
            type: Boolean,
            default: false
        },
        suggestions: {
            type: Array,
            default: () => []
        },
    },
    setup(props, { emit }) {
      const state = reactive({
        filteredSuggestions: [],
        showSuggestions: false,
        pendingDeletion: false
      });
      const editable = ref(null);
  
      const updateSuggestions = ev => {
        updateContent(ev);

        const text = ev.target.innerText;
        const currentWord = text.split(' ').pop().toLowerCase();
        console.log({text, currentWord})

        state.filteredSuggestions = props.suggestions.filter(suggestion => {
          console.log('match check', {suggestion, currentWord, check: !currentWord || suggestion.toLowerCase().startsWith(currentWord)})
          return !currentWord || suggestion.toLowerCase().startsWith(currentWord);
        });
        console.log('filtered', state.filteredSuggestions)
        state.showSuggestions = state.filteredSuggestions.length > 0;
      };
  
      const selectSuggestion = suggestion => {
        const text = editable.value.innerText;
        const words = text.split(' ');
        words.pop();
        words.push(suggestion);
        editable.value.innerText = words.join(' ') + ' ';
        state.showSuggestions = false;
        editable.value.focus();
      };
  
      const handleKeydown = ev => {
        if (ev.key === "Escape") {
          state.showSuggestions = false;
        }
        else {
            preventExceedingMaxLength(ev);
        }
      };

      const preventExceedingMaxLength = ev => {
      // Prevent adding more characters if the maxTotalCharacters limit is reached
      console.log('prevent check', ev.target.innerText.length, props.maxTotalCharacters)
      if (ev.target.innerText.length >= props.maxTotalCharacters && ev.keyCode !== 8) {
        ev.preventDefault();
      }
    }

    const updateContent = (event) => {
      // Emit the updated content to the parent component
      console.log('update content', event)
      emit('update:modelValue', event.target.innerText);
      //updateSuggestions(event.target.innerText);
    };

     // Watch for external modelValue changes to update the contenteditable text
     watch(() => props.modelValue, (newValue) => {
      if (editable.value && editable.value.innerText !== newValue) {
        editable.value.innerText = newValue;
      }
    });

    const onBlur = (ev) => { 
      state.showSuggestions = false;
      emit('blur', ev);
    }
  
      return { editable, state, updateSuggestions, selectSuggestion, handleKeydown, onBlur  };
    }
  };
  </script>
  
  <style>
  .editable-container {
    position: relative;
    display: flex;
    transition: background-color 0.3s ease;
  }

  .pending-deletion {
    background-color: #F36262;
  }

  .pending-deletion .text {
    color: white;
  }

    .editable {
        min-width: 50px;
        border: 1px solid black; 
        padding: 5px;
    }
  
  .suggestions {
    list-style-type: none;
    margin: 0;
    padding: 0;
    background: white;
    border: 1px solid #ccc;
    position: absolute;
    width: 100%;
    top: calc(100% - 3px);
    border-radius: 4px;
    z-index: 99;
  }
  
  .suggestions li {
    padding: 5px;
    cursor: pointer;
  }
  
  .suggestions li:hover {
    background-color: #eee;
  }
  </style>
