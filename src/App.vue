<template>
  <div id="app">
    <nav>
      <ul>
        <Header></Header>
        <router-view></router-view>
      </ul>
    </nav>

    


  </div>
</template>

<script>
  // import Register from '../pages/RegisterPage.vue';
  // import Login from '../pages/LoginPage.vue';
  // import Main from '../pages/Main.vue';
  // import Account from '../pages/AccountPage.vue';
  import Header from '../pages/HeaderPage.vue';


 export default {
    name: 'App',
    components: {
      // Main,
      // Login,
      // Register,
      // Account,
      Header
    }
  }
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}
</style>
