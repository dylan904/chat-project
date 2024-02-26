export default function getSuggestedQuestions(data, targetId) {
    let found = false;
    let parentLevel = null;
    let siblings = [];

    // Recursive function to search the tree
    const searchTree = (nodes, level = 0) => {
        for (let node of nodes) {
            if (node.id === targetId) {
                // If the target node is found, mark as found and store the current level
                found = true;
                parentLevel = level;
                break; // Stop searching once the target is found
            }
            
            // If the node has children, recursively traverse them
            if (node.children && node.children.length > 0) {
                searchTree(node.children, level + 1);
            }
        }
    };

    // Start the tree traversal to find the target node and its level
    searchTree(data);

    // If the target node was found, find its siblings
    if (found) {
        const findLevelSiblings = (nodes, level = 0) => {
            for (let node of nodes) {
                // Only add questions at the same level as the target node
                if (level === parentLevel && node.type === 'question' && node.id !== targetId) {
                    siblings.push(node.content);
                }

                // Recursively search the children
                if (node.children && node.children.length > 0) {
                    findLevelSiblings(node.children, level + 1);
                }
            }
        };

        // Start the second traversal to collect all siblings at the same level
        findLevelSiblings(data);
    }

    return [ ...new Set(siblings) ];
}
