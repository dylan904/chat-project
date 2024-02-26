<template>
    <div class="input-wrap">
        <textarea ref="input" :tabindex="0" :placeholder="placeholder" @keydown="watchKey" @keyup.enter="tryAdd" v-model="value" :rows="rows" :disabled="disabled"></textarea>
        <div class="attach-wrap">
            <div style="display: flex">
                <button class="attach-btn" aria-label="Attach files">
                    <div class="attach-btn-inner">
                        <svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 -960 960 960" width="24"><path d="M720-330q0 104-73 177T470-80q-104 0-177-73t-73-177v-370q0-75 52.5-127.5T400-880q75 0 127.5 52.5T580-700v350q0 46-32 78t-78 32q-46 0-78-32t-32-78v-370h80v370q0 13 8.5 21.5T470-320q13 0 21.5-8.5T500-350v-350q-1-42-29.5-71T400-800q-42 0-71 29t-29 71v370q-1 71 49 120.5T470-160q70 0 119-49.5T640-330v-390h80v390Z" fill="currentColor"/></svg>
                    </div>
                </button>
                <input :multiple="false" type="file" :tabindex="-1" style="display: none">
            </div>
        </div>
        <button class="send-btn" @click="tryAdd" :disabled="!ready">➤</button>
    </div>
</template>

<script>
const newlineRegex = /\r\n|\r|\n/;

export default {
    name: "ChatInput",
    emits: ["add-item"],
    props: {
        ready: Boolean,
        disabled: Boolean
    },
    data() {
        return {
            value: ""
        }
    },
    methods: {
        watchKey(ev) {
            if (!this.ready) {
                return
            }

            if (ev.key === "Enter" && !ev.shiftKey) {
                ev.preventDefault();
            }
        },
        tryAdd(ev) {
            if (!this.ready) {
                ev.preventDefault();
                return
            }
            if (!ev.shiftKey) {
                ev.preventDefault();
                const text = this.value.trim();
                console.log('add?', text.length, text, ev)
                if (text.length) {
                    this.$emit("add-item", { text: text });
                    this.value = "";
                }
            }
        }
    },
    computed: {
        rows() {
            return this.value.split(newlineRegex).length;
        },
        placeholder() {
            return this.disabled ? 'Finish or close questionnaire to chat' : 'Start typing…'
        }
    }
};
</script>

<style scoped>
.input-wrap {
    position: relative;
    width: 100%;
    display: flex;
    flex-direction: column;
    border: 1px solid grey;
    border-radius: 8px;
}

textarea {
    font-size: 1rem;
    line-height: 1.5rem;
    margin: 0;
    width: 100%;
    resize: none;
    border-width: 0;
    background-color: transparent;
    max-height: 200px;
    overflow-y: hidden;
    padding: 0.875rem 54px;

    font-family: Lato, sans-serif;
}

.attach-wrap {
    position: absolute;
    left: 0.5rem;
    bottom: 0.5rem;
}

.attach-btn {
    color: white;
    margin: 0;
    padding: 0;
    position: relative;
    align-items: center;
    border-color: transparent;
    border-radius: 0.5rem;
    display: inline-flex;
    font-size: .875rem;
    line-height: 1.25rem;
    cursor: pointer;
    background-color: transparent;
}

.attach-btn-inner {
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    color: #4C6073;
}

.send-btn {
    background: #007bff;
    color: white;
    border: none;
    /* padding: 10px 20px; */
    border-radius: 20px;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 16px;
    width: 32px;
    height: 32px;
    position: absolute;
}

.send-btn:active {
  background: #0056b3;
}

.send-btn:disabled {
  background: darkgray;
  cursor: not-allowed;
}

@media (min-width: 768px) {
    .attach-wrap {
        left: 1rem;
        bottom: 0.75rem;
    }

    .send-btn {
        right: 0.75rem;
        bottom: 0.55rem;
    }
}
</style>
