import { defineStore } from 'pinia'

export const useNodesStore = defineStore('nodes', {
    state: () => ({
        focused: null,
        path: [],
        nodes: [], // Assuming this is your tree structure
    }),
    actions: {
        setNodes(nodes) {
            this.nodes = nodes
        },
        setFocused(id) {
            this.focused = id
            const path = this.findPath(this.nodes, id)
            this.setPath(path)
        },
        setPath(path) {
            this.path = path
        },
        findPath(nodes, targetId, currentPath = []) {
            console.log('findpath', nodes, targetId, currentPath)
            for (const node of nodes) {
                // Check if the current node is the target node
                if (node.id === targetId) {
                    // Return the path including the current node's ID
                    return [...currentPath, node.id];
                }

                // If the node has children, recursively search them
                if (node.children && node.children.length) {
                    const pathFound = this.findPath(node.children, targetId, [...currentPath, node.id]);
                    // If a path is found in the children, return it
                    if (pathFound.length) return pathFound;
                }
            }

            // Return an empty array if the target ID is not found in the current path
            return [];
        }
    },
});
