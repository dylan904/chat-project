export default function convertDataForEditor(input) {
    // Helper function to navigate and convert the journey paths
    function navigatePath(path, questions) {
        const node = {};
  
        if (path.type === 'question') {
            const question = questions[path.q];
            node.type = 'question';
            console.log('convert question', question.text, path.q)
            node.content = question.text;
            node.children = [];
  
            if (question.type === 'dropdown' || question.type === 'radio') {
                const answerSets = question.items;
                console.log({answerSets})


                for (const answerSet of answerSets) {
                    const answerRef = question.ref || answerSet[0].value;
                    console.log('pathmatch', path.path, answerRef)
                    const pathMatch = path.path.find(p => p.option === answerRef)

                    if (pathMatch) {
                        const answers = answerSet.map(answer => answer.label);
                        node.children.push({
                            type: 'answer',
                            content: answers,
                            children: navigatePath(pathMatch, questions)
                        });
                    } else {
                        console.warn('no path match', answerRef, path.path)
                    }
                }
            }
        } else if (path.type === 'roadblock') {
            node.type = 'roadblock';
            node.content = [input.roadblocks[path.rb]];
            node.children = []; // Roadblocks do not have children in this context
        } else if (path.type === 'launchpad') {
            node.type = 'launchpad';
            console.log('convert launchpad', path.lp, input.launchpads)
            node.content = [input.launchpads[path.lp].details]; // Assuming launchpad details are not needed in the simplified structure
            node.children = []; // Launchpads do not have children in this context
        }
  
        return [node]; // Wrap the node in an array to match the expected format
    }
  
    const questions = input.questions;
    const journeyStart = input.journey.start;
  
    // Begin conversion from the journey start point
    const result = navigatePath(journeyStart, questions);
  console.log('converted', result)
    return result;
}
