<template>
    <ChatBox title="Beeline Assistant" />
  </template>
  
  <script>
  import ChatBox from "../components/ChatBox.vue";
  
  export default {
    name: "App",
    components: {
      ChatBox,
    },
    data() {
      return {};
    },
  };
  </script>
  
  <style>
  *,
  *::before,
  *::after {
    box-sizing: border-box;
  }
  
  #app {
    font-family: Roboto, sans-serif;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    text-align: center;
    color: #2c3e50;
    margin-top: 40px;
  }
  </style>
  
  