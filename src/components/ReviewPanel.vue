<template>
    <div class="panel">
        <div class="nav-bar">
            <nav-item :class="{ active: active === item }" v-for="(item, index) in navItems" :key="index" @click="navClick(item)" :type="item"></nav-item>
        </div>

        <div :class="{ 'panel-slider': true, active: !!active }">
            <div v-if="active === 'journey'">
                <SnapScroll v-if="journey" selector=".tree-list">
                    <ul class="tree-list">
                        <li class="tree-list-item start">
                            <div style="position: relative">
                            <div class="config">
                                Start here
                            </div>
                            </div>
                        </li>

                        <NodeEditor
                            class="tree-list-item"
                            :index="0"
                            :is-root="true"
                            :node="journey[0]"
                            :forPanel="true"
                        />
                    </ul>
                </SnapScroll>
            </div>

            <div v-else-if="active === 'bot'">
                <ChatBox>
                    <chat-box title="Beeline Assistant" />
                </ChatBox>
            </div>
        </div>
    </div>
</template>

<style scoped>
.panel {
    height: 100vh;
    margin: 0;
    position: fixed;
    left: 0;
    overflow-y: auto;
    z-index: 999999;
    top: 0;
    display: flex;
    box-shadow: 0 4px 8px 3px rgba(0, 0, 0, 0.15), 0 1px 3px 0 rgba(0, 0, 0, 0.30);
}
.nav-bar {
    background-color: white;;
    width: 96px;
    height: 100%;
    padding: 0 8px;
    z-index: 3;
}

.panel-slider {
    transition: transform 0.3s ease;
    transform: translateX(-100%);
    background: white;
}

.panel-slider.active {
    transform: translateX(0);
}
</style>

<script>
import NodeEditor from '../components/NodeEditor.vue';
import SnapScroll from './SnapScroll.vue';
import NavItem from './NavItem.vue';
import ChatBox from './ChatBox.vue';

export default {
    name: 'ReviewPanel',
    components: {
        NodeEditor,
        SnapScroll,
        NavItem,
        ChatBox
    },

    data() {
        return {
            active: null,
            navItems: [
                'legend', 'journey', 'revisions', 'bot', 'issues'
            ],
        }
    },

    methods: {
        navClick(item) {
            if (item === this.active) {
                this.active = null;
            } else {
                this.active = item;
            }
        }
    },

    props: {
        journey: {
            type: Array,
            required: true
        }
    }
}
</script>