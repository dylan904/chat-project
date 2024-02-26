<template>
    <div id="app" class="tree" :style="{width: fullWidth}">
        <ul>
            <NodeEditor
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
  import NodeEditor from './components/NodeEditor.vue';
  import convertDataForEditor from './utils/convertDataForEditor';
  import rawJourneyData from './assets/data/questionnaire-journey.json';
  import getSuggestedQuestions from './utils/getSuggestedQuestions';
    const journeyData = ref(convertDataForEditor(rawJourneyData));

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
* {
  margin: 0;
  padding: 0;
}

.tree {
  display: flex;
  justify-content: center;
  min-width: 100vw;
}

.tree ul {
  padding-top: 20px;
  position: relative;
  transition: all 0.5s;
  display: flex;
  justify-content: center;
}

.tree li {
  float: left;
  text-align: center;
  list-style-type: none;
  position: relative;
  padding: 20px 5px 0 5px;
  transition: all 0.5s;
}

.tree li::before, .tree li::after {
  content: "";
  position: absolute;
  top: 0;
  right: 50%;
  border-top: 1px solid #ccc;
  width: 50%;
  height: 20px;
}

.tree li::after {
  right: auto;
  left: 50%;
  border-left: 1px solid #ccc;
}

.tree li:only-child::after, .tree li:only-child::before {
  display: none;
}

.tree li:only-child {
  padding-top: 0;
}

.tree li:first-child::before, .tree li:last-child::after {
  border: none;
}

.tree li:last-child::before {
  border-right: 1px solid #ccc;
  border-radius: 0 5px 0 0;
}

.tree li:first-child::after {
  border-radius: 5px 0 0 0;
}

.tree ul ul::before {
  content: "";
  position: absolute;
  top: 0;
  left: 50%;
  border-left: 1px solid #ccc;
  width: 0;
  height: 20px;
}

.tree li .config {
  padding: 5px 10px;
  text-decoration: none;
  color: #666;
  font-family: arial, verdana, tahoma;
  font-size: 12px;
  display: inline-block;
  border-radius: 5px;
  transition: all 0.5s;
  padding-bottom: 12px;
  position: relative;
  border: 1px solid transparent;
  cursor: default;
}

.tree li a:hover, .tree li a:hover + ul li .config {
  background: #c8e4f8!important;
  color: #000;
  border-color: #94a0b4;
}

.tree li a:hover + ul li::after,
.tree li a:hover + ul li::before,
.tree li a:hover + ul::before,
.tree li a:hover + ul ul::before {
  border-color: #94a0b4;
}

.add, .remove {
  position: absolute;
  bottom: 0;
  left: 50%;
  transform: translate(-50%, 50%);
  border-radius: 50%;
  color: white;
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  line-height: 0.75;
  z-index: 2;
  cursor: pointer;
  outline: none;
  border: none;
}

.add {
  background: #0357FC;
}

.remove {
  background: #ED1515;
}

.add:after {
  content: "+";
  font-size: 16px
}

.remove:after {
  content: "-";
  font-size: 16px
}

.tree li > .config {
  background: #CAD1D7;
  color: black;
}

.tree li.question > .config {
  background: #C2C0FF;
}

/* CAD1D7 */

.tree li.answer > .config {
  background: #B0E6FA;
}


li:only-child {
  padding-left: 0;
  padding-right: 0;
}

.text {
  padding: 4px 8px;
    display: block;
    cursor: text;
    border: none;
    background: transparent;
    text-align: center;
}

.answer > .config {
  padding-bottom: 5px!important;
}

.answer > .config > .add, :not(.question) > .config > .add {
  display: none;
}

.tree .roadblock > .config {
    background: #ED1515;
  
}

.tree .roadblock > .config > input::placeholder, .tree .launchpad > .config > input::placeholder {
    color: white!important;
}

.tree .launchpad > .config {
  background: #55A85E;
  color: white;
}

[contenteditable][placeholder]:empty::before {
    content: attr(placeholder);
    color: #525252; 
}

[contenteditable][placeholder]:empty:focus::before {
    content: "";
}

.tree > ul > li > .config select {
  display: none;
}
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


