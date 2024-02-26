<template>
    <div class="panel">
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
</template>

<style scoped>
.panel {
  background-color: #f4f4f4;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  padding: 24px;
  height: 90vh;
  width: 400px;
  margin: 16px;
  position: fixed;
  right: 0;
  overflow-y: auto;
  z-index: 999999;
  top: 0;
}
</style>

<script>
import NodeEditor from '../components/NodeEditor.vue';
import SnapScroll from './SnapScroll.vue';

export default {
    name: 'ReviewPanel',
    components: {
        NodeEditor,
        SnapScroll
    },

    props: {
        journey: {
            type: Array,
            required: true
        }
    }
}
</script>