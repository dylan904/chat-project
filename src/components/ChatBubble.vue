<template>
    <div :class="classes">
        <div class="chat-bubble">
            <ChatLoader v-if="pending" />
            <span v-else>{{ text }}</span>
        </div>
    </div>
  </template>
  
  <script>
    import ChatLoader from "./ChatLoader.vue"

  export default {
    name: "ChatBubble",
    components: {
      ChatLoader
    },
    props: {
      type: {
        type: String,
        required: true,
        validator: function (value) {
          return ["user", "bot", "suggestion"].indexOf(value) !== -1;
        },
      },
      pending: Boolean,
      text: String,
    },
    emits: ["focus", "blur", "update:modelValue"],
    data() {
      return {};
    },
    computed: {
      classes() {
        return {
          "chat-bubble-wrap": true,
          "user-bubble-wrap": this.type === "user",
          "chat-suggesetion": this.type === "suggestion",
        };
      },
    },
  };
  </script>
  
  <style scoped>
.chat-bubble-wrap {
  display: block;
  max-width: 80%;
  align-self: flex-start;
}

.user-bubble-wrap {
  align-self: flex-end;
}

.chat-bubble {
  margin-bottom: 10px;
  padding: 8px 16px;
  background-color: #eff2f5;
  border-radius: 16px;
  display: inline-block;
}

.user-bubble-wrap > .chat-bubble {
  background-color: #007bff;
  color: white;
  margin-left: auto;
}

.chat-suggestion {
  align-self: flex-end;
}

.chat-suggestion > button {
  background: white;
  border: 1px solid #007bff;
  display: block;
  color: #007bff;
  cursor: pointer;
}









</style>
