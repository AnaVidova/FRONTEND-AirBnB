<template>

<nav class="nav">
    <ul>
        
        <li><router-link to="/main">Main</router-link></li>
        <li><router-link to="/account">Account</router-link></li>
        <li><router-link to="/login">Login</router-link></li>
        <li><router-link to="/register">Register</router-link></li>

    </ul>
</nav>

</template>

<script>
export default {}
</script>

<style>
.nav {
  display: flex;
  justify-content: center; /* Align items horizontally in the center */
}

.nav ul {
  display: flex;
  list-style-type: none; /* Remove bullet points */
  padding: 0;
}

.nav li {
  margin-right: 10px; /* Adjust spacing between items */
}

</style>