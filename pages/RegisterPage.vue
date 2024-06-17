 Content-Security-Policy: style-src 'unsafe-inline';
 <template>
  <div class="login">
    <h2>Register</h2>

    <div class="form-group">
      <input type="file" @change="handleFileUpload" class="file-input" />
    </div>

    <div class="form-group">
      <label for="firstName">First Name</label>
      <input type="text" v-model="fn_input" placeholder="Enter first name" />
    </div>

    <div class="form-group">
      <label for="lastName">Last Name</label>
      <input type="text" v-model="ln_input" placeholder="Enter last name" />
    </div>

    <div class="form-group">
      <label for="email">Email</label>
      <input type="text" v-model="email_input" placeholder="Enter email" />
    </div>

    <div class="form-group">
      <label for="telephone">Telephone</label>
      <input type="text" v-model="telephone_input" placeholder="Enter telephone" />
    </div>

    <div class="form-group">
      <label for="password">Password</label>
      <input type="password" v-model="password_input" placeholder="Enter password" />
    </div>

    <div class="form-group">
      <label for="password2">Repeat Password</label>
      <input type="password" v-model="password2_input" placeholder="Repeat password" />
    </div>

    <div class="form-group">
      <label for="owner">Would you like to rent out?</label>
      <select v-model="owner_input">
        <option disabled value="">Please select one</option>
        <option>true</option>
        <option>false</option>
      </select>
    </div>

    <div class="form-group">
      <button @click="register">Register</button>
    </div>
  </div>
</template>

<script>

export default {
        name: "RegisterPage",
        data() {
          return {
            selectedFile: null,
            fn_input: '',
            ln_input: '',
            email_input: '',
            telephone_input: '',
            password_input: '',
            password2_input: '',
            owner_input: '',
            file: null
          };
        },
        methods: {
          handleFileUpload() {
            // eslint-disable-next-line no-undef
            this.file = event.target.files[0];
          },

          register() {
            if (!this.fn_input || !this.ln_input || !this.email_input || !this.telephone_input || !this.password_input || !this.password2_input || !this.owner_input) {
                 alert('Please fill in all fields.');
                 return;
             }           
             const formData = new FormData();

              // Append form fields to the FormData object
              formData.append('first_name', this.fn_input);
              formData.append('last_name', this.ln_input);
              formData.append('email', this.email_input);
              formData.append('telephone', this.telephone_input);
              formData.append('password', this.password_input);
              formData.append('is_owner', this.owner_input);

              // Append the file to the FormData object if it exists
              if (this.file) {
                  formData.append('file', this.file);
                  console.log(this.file);
              }
              else{
                formData.append('pic_data', "null");
                formData.append('content_type', "image/jpeg");
              }
             fetch("http://localhost:5173/api/User", {
               method: "POST",
               body: formData
             })
             .then(response => {
                  if (!response.ok) {
                      throw new Error('Network response was not ok');
                  }
                  return response.json();
              })
              .then(data => {
                  console.log('User registered successfully', data);
                  this.$router.push('/login');
              })
              .catch(error => {
                  console.error('Error registering user', error);
              });
          }
        },
        
      }
      

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
  height: 110vh;
  max-width: 300px;
  margin: 0 auto;
  padding: 20px;
}

.form-group {
  width: 100%;
  margin-bottom: 20px;
  display: flex;
  flex-direction: column;
}

label {
  margin-bottom: 5px;
  font-weight: bold;
}

input[type="text"],
input[type="password"],
select,
button,
.file-input {
  width: 100%;
  padding: 10px;
  border: none;
  border-bottom: 1px solid #ccc;
  border-radius: 3px;
  box-sizing: border-box;
  margin-bottom: 10px;
}

input[type="text"]:focus,
input[type="password"]:focus,
select:focus {
  outline: none;
  border-bottom: 1px solid #42b983;
}

button {
  background-color: #42b983;
  color: white;
  cursor: pointer;
  border: none;
  border-radius: 3px;
}

button:hover {
  background-color: #ffbf7a;
}
</style>