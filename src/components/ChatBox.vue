<template>
    <div class="chat-container">
      <div class="chat-header">
        <img src="img/bot.png" alt="Profile" width="40" height="40" />
        <b style="font-size: 16px">{{ title }}</b>
      </div>
      <div class="chat-messages" ref="messages">
        <TransitionGroup name="bubble">
            <ChatBubble v-for="item in history" :type="item.type" :key="item.id" :text="item.text" :pending="item.pending" />
        </TransitionGroup>

        <Transition name="qcard" @enter="setQCardHeight" @afterEnter="unsetQCardHeight">
            <QuestionnaireCard ref="qcard" :journeyData="journeyData" v-if="journeyData" @close="closeQCard()" />
        </Transition>
      </div>
      <div class="chat-footer">
        <ChatInput ref="input-section" @addItem="addItem" :ready="ready" :disabled="!!journeyData" />
      </div>
    </div>
  </template>
  
  <script>
  import ChatBubble from "./ChatBubble.vue";
  import ChatInput from "./ChatInput.vue";
  import QuestionnaireCard from "./QuestionnaireCard.vue";
  import testJourneyData from "../assets/data/questionnaire-journey.json";
  import assistant from "../utils/oai-assistant.js";
  import { v4 as uuidv4 } from 'uuid';
  
  export default {
    components: {
      ChatBubble,
      QuestionnaireCard,
      ChatInput
    },
    props: {
      title: String,
    },
    data() {
      return {
        history: [{ type: "bot", text: "My name is Beeline Assistant. How can I assist you today?", id: uuidv4() }],
        journeyData: null,
        qCardHeight: 0,
        threadId: null,
        ready: false
      };
    },
    async mounted() {
        const potentialThreadId = localStorage.getItem("assistant-threadId");
        await assistant.init()

        if (potentialThreadId !== assistant.threadId) {
            localStorage.setItem("assistant-threadId", assistant.threadId);
        }
        this.ready = true
    },
    methods: {
        closeQCard() {
            this.ready = true;
            this.journeyData = null;
            setTimeout(() => {
                console.log('tryfocus', this.$refs['input-section'].$refs.input)
                this.$refs['input-section'].$refs.input.focus()
            }, 20);
        },
        unsetQCardHeight(el) {
            el.style.height = "";
        },
        setQCardHeight(el) {
            console.log('setQCardHeight', el, el.scrollHeight)
            if (el) {
                el.style.visibility = "hidden";
                el.style.height = "auto";
                el.style.position = "absolute";

                this.$nextTick(() => {
                    const questionContainer = el.querySelector('.question-container');
                    const fullHeight = questionContainer ? (questionContainer.scrollHeight + el.scrollHeight) : el.scrollHeight
                    this.qCardHeight = fullHeight;
                    el.style.height = fullHeight + "px";
                    el.style.visibility = "";
                    el.style.position = "";
                });
            }
        },
        addResponses(responses) {
            for (const response of responses) {
                if (response.type === 'text') {
                    const pendingItem = this.history.find(item => item.pending);

                    console.log('replace pending?', pendingItem, this.history)
                    pendingItem.pending = false;
                    pendingItem.text = response.text.value;
                }
                else if (response.type === 'function') {
                    if (response.function.name === 'guideme') {
                        console.log('bingo', response.data)
                        this.journeyData = testJourneyData;
                        this.ready = false
                        this.$refs['input-section'].$refs.input.blur()

                        const pendingIdx = this.history.findIndex(item => item.pending);
                        this.history.splice(pendingIdx, 1);

                        this.$nextTick(() => {
                            this.$refs.qcard.$el.scrollIntoView({ behavior: 'smooth' });
                            this.$refs.qcard.focused = true
                        });
                    }
                }
            }
        },
        async addItem({ text }) {
            console.log('add?', text.length, text)
            this.history.push({ type: "user", text: text, id: uuidv4() });

            setTimeout(() => {
                this.$refs.messages.scrollTo({ top: 99999, behavior: 'smooth' });
            }, 20);

            setTimeout(() => {
                this.history.push({ type: "bot", pending: true, id: uuidv4() });

                setTimeout(() => {
                    this.$refs.messages.scrollTo({ top: 99999, behavior: 'smooth' });
                }, 20);
            }, 500);

            this.ready = false
            const responses = await assistant.sendMessage(text, this.threadId)
            console.log('got responses', responses)
            this.addResponses(responses)

            if (!this.journeyData) {
                this.ready = true
            }

            setTimeout(() => {
                this.$refs.messages.scrollTo({ top: 99999, behavior: 'smooth' });
            }, 20)
        },
    },
  };
  </script>
  

<style>
.chat-container {
  display: flex;
  flex-direction: column;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
  font-size: 14px;
  max-width: 415px;
  
  height: 80%;
    max-height: 500px;
    position: fixed;
    bottom: 0;
    right: 0;
    margin: 16px;
    min-width: 415px;
}

.chat-header {
  background: linear-gradient(
    to left,
    #00c6ff,
    #0072ff
  ); /* Simulating gradient */
  color: white;
  padding: 12px 16px;
  display: flex;
  align-items: center;
}

.chat-header img {
  border-radius: 50%;
  margin-right: 10px;
}

.chat-messages {
  flex: 1;
  padding: 20px;
  overflow: hidden scroll;
  background: white;
  display: flex;
  flex-direction: column;
}

.chat-footer {
  padding: 12px 16px;
  display: flex;
  align-items: center;
}

.qcard-enter-active,
.qcard-leave-active {
    transition: height 1s ease, margin 1s ease, box-shadow 1s ease, opacity 0.75s ease;
}

.qcard-enter-from,
.qcard-leave-to {
    opacity: 0;
    height: 0;
    margin-top: 0;
    box-shadow: 0 0 0 0 #c4c6d0;
}

.bubble-enter-active,
.bubble-leave-active {
    transition: transform 0.3s ease-out, opacity 0.2s ease-out;
}

.bubble-enter-from {
    transform: translateX(-100%);
    opacity: 0;
}

.user-bubble-wrap.bubble-enter-from {
    transform: translateX(100%);
}

</style>
