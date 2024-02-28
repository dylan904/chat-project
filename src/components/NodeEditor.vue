<template>
  <li v-if="localNode" :class="itemClasses" ref="root">
    <div style="position: relative">
    <div class="arrow"></div>
    <div :class="{ config: true, reveal: reveal, focused: focused }">
      <Select v-if="localNode.type !== 'answer'"
        :hideLabel="true"
        :id="'dd-' + localNode.id"
        :disabled="isRoot"
        v-model="localNode.type"
        :items="typeDropdownItems"
        size="condensed"
        @update:modelValue="type => typeChange(type)"
        ref="dropdown"
        @focus="focus"
      />
      
      <button @focus="focus" v-else title="Remove this answer set" class="remove" @click="removeAnswer()" @mouseenter="highlightRemoval = true" @mouseleave="highlightRemoval = false"></button>

      <div class="input-wrap" v-if="localNode.type === 'answer'">
        <FluidTextbox v-for="(item, index) in tempContent" :key="index"
          :removable="tempContent.length > 1"
          :maxWidth="320" :maxTotalCharacters="80"
           v-model="item.content"
           :placeholder="placeholder" 
           ref="inputs" 
           @blur="onAnswerItemBlur(index)"
        />
      </div>
      
      <FluidTextbox v-else-if="localNode.type" 
        :temp-type="localNode.type"
        :maxWidth="400" :maxTotalCharacters="201"
        v-model="tempContent"
        :placeholder="placeholder" 
        ref="inputs[0]"
        @focus="setSuggestions"
        :suggestions="suggestedQuestions"
        @blur="checkToUpdate(0)"
      />

      <button @focus="focus" v-if="localNode.type === 'question'" class="add" @click="addAnswer"></button>

      <button @focus="focus" v-if="localNode.type === 'answer'" @mouseenter="reveal = true" @mouseleave="reveal = false" class="add-answer" title="Add answer to set" @click="addAnswerItem"></button>
    </div>

    <transition-group v-if="filteredChildren.length" @beforeEnter="onBeforeEnter" @enter="onEnter" name="tree-list" tag="ul" class="tree-list list-container" :style="{'--connector-height': styles.connectorHeight }">
      <NodeEditor 
        :classes="{ 'tree-list-item': true, 'only-child': filteredChildren.length === 1 }" 
        v-for="(child, index) in filteredChildren" 
        :style="{ paddingTop: styles.listPaddingTop }"
        :key="child.id" :index="index" 
        :node="child" 
        @updateNode="updateNode"
        @removeNode="removeAnswer"
        :suggestQuestions="suggestQuestions" 
        ref="childRefs"
        :forPanel="forPanel"
      />  
    </transition-group>
  </div>
  </li>
</template>
  
<script>
import { computed, ref, watch, nextTick } from 'vue';
import { v4 as uuidv4 } from 'uuid';
import Select from './Select.vue';
import FluidTextbox from './FluidTextbox.vue';
import { useNodesStore } from '../stores/nodes'

export default {
  name: 'NodeEditor',
  props: ['node', 'index', 'classes', 'suggestQuestions', 'isRoot', 'forPanel'],
  emits: ['update-node', 'remove-node'],
  components: {
    Select,
    FluidTextbox
  },
  setup(props, { emit }) {
    const nodesStore = useNodesStore();
    
    const localNode = ref(props.node); // Reactive reference to props.node
    const isAnswer = props.node.type === 'answer';
    const tempContent = ref(isAnswer ? props.node.content.map(content => ({ content })) : props.node.content);

    // if (props.node.type === 'launchpad') 
      // console.log('launchpadcheck', props.node, tempContent.value)

    const suggestedQuestions = ref([]);
    const inputs = ref([]);
    const dropdown = ref(null);
    const childRefs = ref([]);
    const reveal = ref(false);
    const highlightRemoval = ref(false);
    const root = ref(null);

    const itemClasses = computed(() => ({
      ...props.classes,
      [localNode.value.type]: true,
      'highlight-removal': highlightRemoval.value,
    }));

    const focused = computed(() => nodesStore.focused === localNode.value.id);
    const filteredChildren = computed(() => {
      console.log('compute filtered', localNode.value, nodesStore.path);
      return props.forPanel ? localNode.value.children.filter(child => nodesStore.path.includes(child.id)) : localNode.value.children;
    });

    const styles = computed(() => {
      if (!root.value) return {};

      // console.log('checkroot', root)

      const currentHeight = root.value.querySelector('.config').getBoundingClientRect().height;

      const descendantsAtLevel = findParallelHierarchyNodes(root.value, '.tree-list-item');
      const largestHeight = descendantsAtLevel.reduce((maxHeight, descendant) => {
        const config = descendant.querySelector('.config');
        const height = config.getBoundingClientRect().height;
        return Math.max(maxHeight, height);
      }, currentHeight);

      const isQuestion = localNode.value.type === 'question';
      const heightDiff = largestHeight - currentHeight;

      // console.log('compareme', heightDiff)

      const listPaddingTop = !props.forPanel ? (heightDiff ? (heightDiff + 20) + 'px' : null) : null;
      const baseHeight = isQuestion ? 16 : 36;
      const connectorHeight = heightDiff ? (heightDiff + baseHeight) + 'px' : null;

      if (parseFloat(connectorHeight) < 0) {
        console.log('debug compare', { connectorHeight, heightDiff, largestHeight, currentHeight, descendantsAtLevel})
      }

      return { listPaddingTop, connectorHeight };
    });

    const typeItems = [
      { label: 'Select an action', value: '' },
      { label: 'Question', value: 'question' },
      { label: 'Roadblock', value: 'roadblock' },
      { label: 'Launchpad', value: 'launchpad' },
    ];

    const typeDropdownItems = computed(() => {
      return localNode.value.type ? typeItems.slice(1) : typeItems;
    });

    const placeholder = computed(() => {
      const type = localNode.value.type;
      return type === 'question' ? 'Ask a question...' :
             type === 'roadblock' ? 'Roadblock reason...' :
             type === 'launchpad' ? 'Launchpad details...' :
             type === 'answer' ? `Answer ${props.index + 1}...` : '';
    });

    watch(() => props.node, (newVal) => {
      console.log('localnode update', newVal)
      localNode.value = newVal; // Update the local node reactively
    }, { deep: true, immediate: true });

    const setSuggestions = () => {
      focus();

      //inputs.value[0].select();
      suggestedQuestions.value = props.suggestQuestions(localNode.value.id);
      console.log('set suggested', localNode.value.id, suggestedQuestions.value)
    };

    const updateNode = (value, bubbled=0) => {
      //console.log('update node', value, localNode.value, test, bubbled)
      if (bubbled === 1) {
        const index = localNode.value.children.findIndex(child => child.id === value.id);
        if (index !== -1) localNode.value.children[index] = value;
        else console.error('Could not find child to update', value);
      }
      emit('update-node', value, true);
      
    };

    const getDefaultAnswer = () => {
      return {
        type: 'answer',
        content: [''],
        id: uuidv4(),
        children: [
          { type: '', content: '', id: uuidv4(), children: [] }
        ]
      };
    }

    const defaultAnswers = [
      getDefaultAnswer(),
      getDefaultAnswer()
    ];

    const addAnswer = () => {
      localNode.value.children.push(getDefaultAnswer());
      updateNode(localNode.value);

      nextTick(() => {
        console.log('answermethis', childRefs.value[localNode.value.children.length - 1].inputs, childRefs.value)
        childRefs.value[localNode.value.children.length - 1].inputs[0].$el.focus();

        setTimeout(() => {
          console.log('try', childRefs.value[localNode.value.children.length - 1].$el);
          childRefs.value[localNode.value.children.length - 1].$el.scrollIntoView({ behavior: 'smooth' });
        }, 100);
      });
    };

    const addAnswerItem = () => {
      tempContent.value.push({ content: '' });
      localNode.value.content.push('');
      updateNode(localNode.value);

      nextTick(() => {
        console.log('answermethis', inputs.value[inputs.value.length-1].$el.firstElementChild, inputs.value, inputs.value.length-1)
        inputs.value[inputs.value.length-1].$el.firstElementChild.focus();
      });
    };

    const removeAnswer = (id) => {
      console.log('remove answer', id)
      const bubbled = !!id;
      if (bubbled) {
        const index = localNode.value.children.findIndex(child => child.id === id);
        console.log('caught bubble', index, id, localNode.value)
        if (index !== -1) {
          localNode.value.children.splice(index, 1);
          //this.$forceUpdate();
          console.log('bubble fix', localNode.value.children)
        }
      } else {
        const count = countDescendants(localNode.value);
        if (count > 1) {
          const reponse = confirm('Confirm removing all items nested within this existing answer')
          if (!reponse) {
            return
          }
        }
        // console.log('count', count);
      }
      emit('remove-node', id || localNode.value.id);
    };

    const countDescendants = (node) => {
      let count = 0;
      if (node.children && node.children.length > 0) {
        count += node.children.length;
        for (const child of node.children) {
          count += countDescendants(child);
        }
      }
      return count;
    };

    const typeChange = () => {
      // console.log('typechange', type, localNode.value.type, itemClasses)

      if (localNode.value.type === 'question') {
        localNode.value.children = defaultAnswers;
      } else {
        if (localNode.value.children.length) {
          const reponse = confirm('Confirm removing all items nested within this existing question')
          if (reponse) {
            localNode.value.children = [];
          } else {
            localNode.value.type = 'questions';
          }
        }
      }

      updateNode(localNode.value);

      nextTick(() => {
        inputs.value[0].focus();
      });
    };

    const onBeforeEnter = (el) => {
      console.log('beforeenter', el, el.previousElementSibling)
      
      const treeList = el.querySelector('.tree-list');
      treeList.style.zIndex = -1;
    };

    const onEnter = (el, done) => {
      console.log('onenter', el, el.previousElementSibling, performance.now())
      
      if (el.previousElementSibling) {
        console.log('hello neighbor', el.previousElementSibling)
        el.previousElementSibling.classList.add('has-next-neighbour')
      }

      const treeList = el.querySelector('.tree-list');

      const listener = treeList.addEventListener('transitionend', ({ propertyName }) => {
        console.log('caught', propertyName)
        if (propertyName === 'transform') {
          treeList.style.zIndex = 1;
          treeList.removeEventListener('transitionend', listener);
          done();
        }
      });

      //el.addEventListener('transitionend', done, { once: true });
    };

    const checkToUpdate = () => {
      console.log('checkToUpdate', JSON.parse(JSON.stringify(localNode.value)), JSON.parse(JSON.stringify(tempContent.value)))
      localNode.value.content = tempContent.value;

      updateNode(localNode.value);
    };

    

const findParallelHierarchyNodes = (root, selector) => {
  let currentElement = root;
  const matchingAncestors = [];

  // Traverse upwards to find matching ancestors
  while (currentElement.parentElement) {
    const closestMatch = currentElement.parentElement.closest(selector);

    // If a matching ancestor is found and it's not already included (to avoid duplicates)
    if (closestMatch && !matchingAncestors.includes(closestMatch)) {
      matchingAncestors.push(closestMatch);
      currentElement = closestMatch;
    } else {
      break;
    }
  }

  const parallelNodes = [];
  matchingAncestors.forEach((ancestor, index) => {
    // Use the index as the level to find descendants that match the selector
    const descendants = findDescendantsAtLevel(ancestor, selector, index);
      for (const descendant of descendants) {
        if (!parallelNodes.includes(descendant)) {
            parallelNodes.push(descendant);
        }
      }
  });

  return parallelNodes;
};

function findDescendantsAtLevel(ancestor, selector, level) {
  const allMatchingDescendants = [ ...ancestor.querySelectorAll(selector) ];
  const descendantsAtLevel = allMatchingDescendants.filter(descendant => {
    let depth = 0;
    let current = descendant;
    while (current.parentNode && current.parentElement.closest(selector) !== ancestor) {
      current = current.parentElement.closest(selector);
      depth++;
    }
      // console.log('checkdepth', {depth, current, ancestor})
    return depth === level;
  });

  return descendantsAtLevel;
}

  const focus = () => {
    console.log('FOCUS', localNode.value.id, nodesStore.focused)
    nodesStore.setFocused(localNode.value.id);
  };

  const onAnswerItemBlur = (idx) => {
    console.log('blur check', idx, tempContent.value[idx], tempContent.value)
    const tempValue = tempContent.value;
    if (tempValue.length > 1 && tempValue[idx].content === '') {
      tempValue.splice(idx, 1);
      localNode.value.splice(idx, 1);
      updateNode(localNode.value);
    }
  };

    return { 
      localNode, 
      itemClasses, 
      typeDropdownItems, 
      placeholder, 
      updateNode,
      addAnswer,
      removeAnswer,
      typeChange,
      checkToUpdate,
      tempContent,
      suggestedQuestions,
      setSuggestions,
      inputs,
      childRefs, 
      dropdown,
      reveal,
      addAnswerItem,
      onEnter,
      highlightRemoval, 
      root, styles,
      onBeforeEnter,
      focus, focused,
      filteredChildren,
      onAnswerItemBlur
    };
  }
};
  </script>
