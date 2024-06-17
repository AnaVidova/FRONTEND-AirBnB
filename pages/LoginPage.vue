<template>
    <div class="login">
      <div class="form-group">
        <label for="email">Email</label>
        <input type="text" v-model="email_input" placeholder="Email" />
      </div>

      <div class="form-group">
        <label for="password">Password</label>
        <input type="password" v-model="password_input" placeholder="Password" />
      </div>

      <div class="form-group">
        <button @click="login">Login</button>
      </div>
  </div>


</template>

<script>

export default {
  name: "LoginPage",
  data() {
    return {
      email_input: '',
      password_input: '',
    };
  },
  methods: {
    login() {
      fetch(`http://localhost:5173/api/User/login/${this.email_input}/${this.password_input}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json"
        }
      })
      .then(response => response.json())
      .then(user => {

        console.log(user);
        if (user != null) {
          localStorage.setItem('email', this.email_input);
          localStorage.setItem('telephone', user.telephone);
          localStorage.setItem('password', this.password_input);
          localStorage.setItem('user_id', user.user_id);
          localStorage.setItem('is_owner', user.is_owner);
          localStorage.setItem('first_name', user.first_name);
          localStorage.setItem('last_name', user.last_name);
          localStorage.setItem('userToken', user.token);
          this.$router.push('/account')
          .catch(err => {
            if (err.name !== 'NavigationDuplicated') {
              throw err;
            }
          });         
        } else {
          alert('Login failed: Invalid email or password.');
        }
      })
      .catch(error => {
        console.error('Login error:', error);
        alert('An error occurred during login. Please try again.');
      });
    }
  }
};
</script>

<style scoped>
html, body {
  height: 100%;
  margin: 0;
}

.login {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  height: 50vh;
  max-width: 300px;
  margin: 0 auto;
  padding: 20px;
}

.form-group {
  width: 100%;
  margin-bottom: 20px;
  
}

label {
  display: block;
  margin-bottom: 5px;
  font-weight: bold;
}

input[type="text"],
input[type="password"],
button {
  width: 100%;
  padding: 10px;
  border: none;
  border-bottom: 1px solid #ccc;
  border-radius: 3px;
  box-sizing: border-box;
  margin-bottom: 10px;
}

button {
  background-color: #42b983;
  color: white;
  cursor: pointer;
  border: none;
}

button:hover {
  background-color: #ffbf7a;
}
</style>