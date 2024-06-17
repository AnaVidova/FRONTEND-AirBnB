<template>
    <div class="account-page">
      <h2>Account Details</h2>
      <div class="profile-picture"> <img v-if="imageURL" :src="imageURL" alt="User Picture"> </div>
      
      <div class="account-details">
        <label for="name">First Name:</label>
        <input type="text" v-model="user.firstName" :disabled="!isEditing"/>

        <label for="name">Last Name:</label>
        <input type="text" v-model="user.lastName" :disabled="!isEditing"/>
  
        <label for="email">Email:</label>
        <input type="email" v-model="user.email" :disabled="!isEditing"/>
  
        <label for="phone">Phone:</label>
        <input type="text" v-model="user.phone" :disabled="!isEditing"/>
  
        <label for="role">Role:</label>
        <input type="text" v-model="user.role" :disabled="!isEditing"/>
      </div>
      

      <button @click="toggleEdit">{{ isEditing ? 'Save' : 'Edit' }}</button>
      
      
      <button @click="toggleChangePassword">
        {{ isChangingPassword ? 'Cancel' : 'Change Password' }}
      </button>
  
      <div v-if="isChangingPassword" class="change-password">
        <h3>Change Password</h3>
  
        <label for="old-password">Old Password:</label>
        <input type="password" v-model="oldPassword" placeholder="Enter old password" />
  
        <label for="new-password">New Password:</label>
        <input type="password" v-model="newPassword" placeholder="Enter new password" />
  
        <button @click="changePassword">Submit</button>
      </div>

      <button @click="toggleChangePicture">
        {{ isChangePicture ? 'Cancel' : 'Change Picture' }}
      </button>

      <div v-if="isChangePicture" class="change-picture">
        <h3>Change picutre</h3>
        <input type="file" @change="handleFileUpload">
        <button @click="changePicture">Change picture</button>
      </div>
      <div v-if="user.role === 'owner'">
        <h3>Owner Section</h3>
        <p>This section is only visible to owners.</p>
        <button @click="uploadcamping">Upload camping spot</button>
        <button @click="campingplaces">Check your camping places</button>
        <!-- Add more owner-specific content here -->
      </div>
  

      <br>
      
      <div class="My bookings" v-if="reservationPlaceLoaded">
        <br>
        <label>My bookings:</label>
        <carousel :per-page="1" :navigation-enabled="true">
        <slide v-for="reservation in this.reservations" :key="reservation.reservation_id">
            <div @click="goToCampingPlace(reservation.place_id)" class="camping-place">
              <h4>{{ reservation.place_name}}</h4>
              <h5>Check-in: {{ reservation.date_start }}</h5>
              <h5>Check-out: {{reservation.date_end}}</h5>
              <h5>Spot name: {{ reservation.spot_name }} </h5>
            </div>
        </slide>
        </carousel>
      </div>
    </div>
  </template>
  
<script>
   import { Carousel, Slide } from 'vue-carousel';
export default {

  name: "AccountPage",
  components: {
    Carousel,
    Slide
  },
  data() {
    return {
      isEditing: false,
      isChangingPassword: false,
      oldPassword: '',
      newPassword: '',
      user: {
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        role: '' // 'user' or 'owner'
      },
      reservations: null,
      reservationPlaceLoaded: false,
      imageURL: null,
      isChangePicture: false
    };
  },
  mounted() {
    this.loadUserInfo();
    this.fetchReservations();
    this.fetchuserpicture();
  },
  methods: {
    loadUserInfo() {
      this.user.firstName = localStorage.getItem('first_name') || '';
      this.user.lastName = localStorage.getItem('last_name') || '';
      this.user.email = localStorage.getItem('email') || '';
      this.user.phone = localStorage.getItem('telephone') || '';
      this.user.role = localStorage.getItem('is_owner') === 'true' ? 'owner' : 'user';
    },
    toggleChangePicture() {
      this.isChangePicture = true;
    },
    handleFileUpload(){
      this.file = event.target.files[0];
    },
    async changePicture(){
        const formData = new FormData();

        console.log(this.file);
        if (this.file) {
                  formData.append('file', this.file);
        }

        fetch(`http://localhost:5173/api/User/update/picture/${localStorage.getItem("user_id")}`, {
            method: 'PUT',
            body: formData
          })
          .then(response => {
              if (!response.ok) {
                console.log(response.json());
                  throw new Error('Failed to update user');
               
              }
          })
          location.reload();
    },
    toggleEdit() {
      if (this.isEditing) {
        // Save changes (add your save logic here)
        console.log('Saving changes', this.user);
        console.log(this.user.role);
        console.log(this.user.firstName);
        console.log(this.user.lastName);
        console.log(this.user.email);
        console.log(this.user.phone);
        var isOwnerbool = '';
        if(this.user.role == 'owner')
        {
          isOwnerbool = true;
        }
        else{
          isOwnerbool = false;
        }
        console.log(isOwnerbool)
        fetch(`http://localhost:5173/api/User/update/${localStorage.getItem('email')}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            first_name: this.user.firstName,
            last_name: this.user.lastName,
            email: this.user.email,
            telephone: this.user.phone,
            is_owner: isOwnerbool 
          })
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Failed to update user');
            }
            return response.json();
        })
        .then(data => {
            console.log('User updated successfully:', data);
            // Update local storage if needed
            localStorage.setItem('email', this.user.email);
            localStorage.setItem('telephone', this.user.phone);  
            localStorage.setItem('is_owner', this.user.role);
            localStorage.setItem('first_name', this.user.firstname);
            localStorage.setItem('last_name', this.user.lastname);
        })
        .catch(error => {
            console.error('Error updating user:', error);
            // Handle error if needed
        });
      }
      this.isEditing = !this.isEditing;
    },
    toggleChangePassword() {
      this.isChangingPassword = !this.isChangingPassword;
    },
    changePassword() {
      if (!this.newPassword || !this.oldPassword) {
        alert('Please enter both old and new passwords.');
        return;
        
      }
      // Mock validation and update logic
      console.log(this.oldPassword);
      console.log(localStorage.getItem('password'));
      if (this.oldPassword === localStorage.getItem('password')) { // Replace this with actual old password validation logic
        const response = fetch(`http://localhost:5173/api/User/${localStorage.getItem('email')}/${this.newPassword}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json'
          }
        });
        if(!response.status == 200){
          console.log(response);
          throw new Error('Error changing');
        }
        alert('Password changed successfully.');
        this.oldPassword = '';
        this.newPassword = '';
        this.isChangingPassword = false;
      } else {
        alert('Old password is incorrect.');
      }
    },
    uploadcamping()
    {
      this.$router.push('/uploadcamping');
    },
    async campingplaces(){
        this.$router.push('/ownerplaces');
    },
    async fetchReservations() {
      await fetch(`http://localhost:5173/api/Reservation/userid/${localStorage.getItem("user_id")}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json'
          }
        })
        .then(response => response.json())
        .then(_reservations => {
              const currentDate = new Date();
              this.reservations = _reservations.filter(reservation => {
                  const endDate = new Date(reservation.date_end);
                  return endDate >= currentDate;
              });
              console.log(this.reservations);
              this.reservationPlaceLoaded = true; 
            });
    },
    async fetchuserpicture() {
        try {
            const response = await fetch(`http://localhost:5173/api/User/users/${localStorage.getItem("user_id")}/picture`);
            if (!response.ok) {
              throw new Error('Failed to fetch picture');
            }
            const blob = await response.blob();
            console.log("this is blob:", blob)
            this.imageURL = URL.createObjectURL(blob);
            console.log(this.imageURL)
          } catch (error) {
            console.error(error);
            // Handle error
          }
    },
    goToCampingPlace(placeId){
      this.$router.push('/place_user/' + placeId);
    }
      
  }
};
</script>

  
  <style scoped>
  .account-page {
    max-width: 600px;
    margin: 0 auto;
    padding: 20px;
    border: 1px solid #ccc;
    border-radius: 4px;
  }
  .profile-picture {
    text-align: center;
    margin-bottom: 20px;
  }

  .profile-picture img {
    max-width: 200px; /* Adjust the maximum width as needed */
    max-height: 200px; /* Adjust the maximum height as needed */
    border-radius: 50%; /* Make the image circular */
    border: 2px solid #ccc; /* Add a border around the image */
  }
  .account-details label {
    display: block;
    margin-top: 10px;
  }
  
  .account-details input {
    width: 100%;
    padding: 8px;
    margin-top: 5px;
    margin-bottom: 10px;
    border: 1px solid #ccc;
    border-radius: 4px;
  }
  
  button {
    margin-top: 20px;
    padding: 10px 15px;
    background-color: #42b983;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
  }
  
  button:hover {
  background-color: #ffbf7a;
  }
  
  .change-password {
    margin-top: 20px;
  }
  
  .change-password label {
    display: block;
    margin-top: 10px;
  }
  
  .change-password input {
    width: 100%;
    padding: 8px;
    margin-top: 5px;
    margin-bottom: 10px;
    border: 1px solid #ccc;
    border-radius: 4px;
  }
  </style>
  