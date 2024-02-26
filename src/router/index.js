import { createRouter, createWebHistory } from 'vue-router'

import BotView from '../views/Bot.vue'
import TreeView from '../views/Tree.vue'
import TreeSimpleView from '../views/TreeSimple.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: BotView
    },
    {
      path: '/bot',
      name: 'bot',
      // route level code-splitting
      // this generates a separate chunk (About.[hash].js) for this route
      // which is lazy-loaded when the route is visited.
      component: BotView
    },
    {
      path: '/tree',
      name: 'tree',
      component: TreeView
    }
    ,
    {
      path: '/tree-simple',
      name: 'tree-simple',
      component: TreeSimpleView
    }
  ]
})

export default router
