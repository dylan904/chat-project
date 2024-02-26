<template>
    <div id="app" class="tree" :style="{width: fullWidth}">
        <ul class="tree-list">
            <NodeEditor
                class="tree-list-item"
                v-if="journey"
                :index="0"
                :node="journey[0]"
                @updateNode="handleNodeUpdate"
                @removeNode="handleRemoveNode"
                :suggestQuestions="suggestQuestions"
            />
        </ul>

        <RouterView />
    </div>
  </template>
  
  <script>
  import { RouterView } from 'vue-router'
  import { v4 as uuidv4 } from 'uuid';
  import {ref} from 'vue';
  import NodeEditor from '../components/NodeEditor.vue';
  import getSuggestedQuestions from '../utils/getSuggestedQuestions';

    const journeyData = ref([{
        type: 'question',
        content: '',
        id: uuidv4(),
        children: [
            {
                type: 'answer',
                content: [''],
                id: uuidv4(),
                children: [{ type: '', content: '', id: uuidv4(), children: [] }]
            },
            {
                type: 'answer',
                content: [''],
                id: uuidv4(),
                children: [{ type: '', content: '', id: uuidv4(), children: [] }]
            }
        ]
    }]);

    function loopThroughJourney(journey) {
        journey.forEach((node) => {
            node.id = uuidv4();
            if (node.children) {
                loopThroughJourney(node.children)
            }
        })
    }

    loopThroughJourney(journeyData.value);
  
  export default {
    name: 'App',
    components: {
      NodeEditor,
      RouterView
    },
    data() {
      return {
        journey: journeyData,
        fullWidth: null,
        //questions: {}, // Will be populated with your questions
        //editableJourney: null // Will hold the converted journey
      };
    },
    created() {
      // Here you would load your JSON data into jsonData
      // For the sake of this example, we'll assume it's already loaded
  
      // Initialize questions and the journey
      this.questions = journeyData.value.questions;
      //this.editableJourney = this.convertJourney(journeyData.j);
    },
    mounted() {
      //console.log('test', this.journey)
      this.updateWidth();
      window.addEventListener('resize', this.updateWidth);

      this.$el.querySelector('.config').scrollIntoView({
            behavior: 'auto',
            block: 'center',
            inline: 'center'
        });
    },
    methods: {
      suggestQuestions(id) {
        return getSuggestedQuestions(this.journey, id);
      },
      updateWidth() {
        this.fullWidth = `${this.$el.children[0].scrollWidth}px`;
      },
      findAndUpdateJourneyItem(items, id, updatedNode, shouldRemove=false) {
        console.log('findandupdate', id, updatedNode, shouldRemove)
        for (const [index, item] of items.entries()) {
          console.log('test', id, item)
          if (item.id === id) {
            if (shouldRemove) {
              console.log('removing', index, items, item)
              items.splice(index, 1);
              //delete items[index];
            }
            else {
              items[index] = updatedNode;
            }
            console.log('updated', id, updatedNode, this.journey)
            return;
          }
          if (item.children) {
            this.findAndUpdateJourneyItem(item.children, id, updatedNode, shouldRemove);
          }
        }
        
      },
    //   convertJourney(node) {
    //     if (!node) return null;
    //     const { type, questions, roadblocks } = journeyData;
  
    //     let editableNode = {
    //       id: Math.random().toString(36).substring(2, 9), // Generate a unique ID
    //       type: type,
    //       content: type === 'question' ? questions[node.q] : type === 'launchpad' ? questions[node.lp] : type === 'roadblock' ? roadblocks[node.rb] : null,
    //       questionId: node.q || null,
    //       path: []
    //     };
  
    //     if (node.path) {
    //       for (const key in node.path) {
    //         editableNode.path.push({
    //           answer: key,
    //           node: this.convertJourney(node.path[key])
    //         });
    //       }
    //     }
  
    //     return editableNode;
    //   },
    handleRemoveNode(id) {
        console.log('remove node', id)
        this.findAndUpdateJourneyItem(this.journey, id, null, true);
        console.log('removed', this.journey)
      },
      handleNodeUpdate(updatedNode) {
        console.log('update node', updatedNode, )
        this.updateWidth();

        this.findAndUpdateJourneyItem(this.journey, updatedNode.id, updatedNode);
        // You would update the node within your journey structure here.
        // This may involve finding the node by its id and updating it,
        // which could be a complex operation depending on your data structure.
      }
    }
  };
  </script>
  
  <style> 
    @import '../assets/css/tree.scss';
  </style>
  






  function reverseConvertStructure(simplified) {
    let questionCounter = 1;
    let roadblockCounter = 1;
    let launchpadCounter = 1;

    const questions = {};
    const roadblocks = {};
    const launchpads = {};
    const journey = {};

    const ynItems = [
        { label: "Yes", value: "yes" },
        { label: "No", value: "no" },
      ];

    function processNode(node, parentPath = journey) {
        switch (node.type) {
            case 'question':
                const qId = findQuestion(questions, node.content) || `q${questionCounter++}`
                
                console.log('test', qId, typeof findQuestion(node.content), node.content)

                if (findQuestion(questions, node.content)) {
                    console.log('found existing q')
                } else {
                    console.log('create new q', node.children)
                    questions[qId] = {
                        text: node.content,
                        type: node.qType || 'unset', // Simplified, needs adjustment
                        items: node.children.map(child => ({
                            //value: item.value,
                            label: child.content,
                            value: child.content,
                        }))
                    };
                }
                
                parentPath.q = qId;
                parentPath.type = 'question';
                parentPath.path = [];
                node.children.forEach(child => {
                    if (child.type === 'answer') {
                        parentPath.path.push({ option: child.content });
                        processNode(child.children[0], parentPath.path[parentPath.path.length-1]);
                    }
                });
                break;
            case 'roadblock':
                const rbId = `rb${roadblockCounter++}`;
                roadblocks[rbId] = node.content;
                parentPath.type = 'roadblock';
                parentPath.rb = rbId;
                break;
            case 'launchpad':
                const lpId = `lp${launchpadCounter++}`;
                launchpads[lpId] = { type: 'Launchpad', details: node.content }; // Placeholder, adjust as necessary
                parentPath.type = 'launchpad';
                break;
        }
    }

    // Assuming the simplified structure is an array with a single root question node
    if (simplified.length > 0) {
        processNode(simplified[0]);
    }

    return {
        questions,
        roadblocks,
        launchpads,
        journey: { start: journey }
    };
}

function findQuestion(data, matchContent) {
  for (const key in data) {
      console.log('check', data[key], matchContent)
    if (data[key].text === matchContent) {
      return key;
    }
  }
  return null;
}


