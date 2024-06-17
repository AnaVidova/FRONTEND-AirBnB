Content-Security-Policy: style-src 'unsafe-inline';
<template>
    <div class="UploadPlace">
      <h2>Upload Camping Place</h2>
  
      <div class="input-row">
        <label for="country">Country:</label>
        <input type="text" v-model="country_input" placeholder="Enter country" />
      </div>
  
      <div class="input-row">
        <label for="city">City:</label>
        <input type="text" v-model="city_input" placeholder="Enter city" />
      </div>
  
      <div class="input-row">
        <label for="street">Street:</label>
        <input type="text" v-model="street_input" placeholder="Enter street" />
      </div>
  
      <div class="input-row">
        <label for="zipcode">Zipcode:</label>
        <input type="text" v-model="zipcode_input" placeholder="Enter zipcode" />
      </div>
  
      <div class="input-row">
        <label for="full_address">Full address:</label>
        <input type="text" v-model="fulladd_input" placeholder="Enter full address" />
      </div>
  
      <div class="input-row">
        <label for="name">Name:</label>
        <input type="text" v-model="placename_input" placeholder="Enter name" />
      </div>
  
      <div class="input-row">
        <label for="description">Description:</label>
        <input type="text" v-model="description_input" placeholder="Enter description" />
      </div>
  
      <div class="input-row">
        <label for="check_in">Check-in (hour, minute, second):</label>
        <input type="text" v-model="checkin_input" placeholder="Enter check-in time" />
      </div>
  
      <div class="input-row">
        <label for="check_out">Check-out (hour, minute, second):</label>
        <input type="text" v-model="checkout_input" placeholder="Enter check-out time" />
      </div>
  
      <br/>
      <button @click="post_camping">Post Camping</button>
      <br/>
    </div>
  </template>
  

<script>

export default {
        name: "UploadCamp",
        data() {
          return {
            country_input: '',
            city_input: '',
            street_input: '',
            zipcode_input: '',
            fulladd_input: '',
            placename_input: '',
            checkin_input: '',
            checkout_input: '',
            description_input: ''
          };
        },
        methods: {
           async post_camping() {
                if (!this.country_input || !this.city_input || !this.
                    street_input || !this.zipcode_input || !this.fulladd_input || !this.placename_input || !this.checkin_input || !this.checkout_input) {
                    alert('Please fill in all fields.');
                    return;
                }           
                  await fetch("http://localhost:5173/api/Location", {
                      method: "POST",
                      headers: {
                          "Content-Type": "application/json"
                      },
                      body: JSON.stringify({
                          country: this.country_input,
                          city: this.city_input,
                          street: this.street_input,
                          zipcode: this.zipcode_input,
                          full_address: this.fulladd_input
                      })
                  })
                  .then((response) => {
                    if (!response.ok) {
                      throw new Error(`Error fetching camping: ${response.status}`);
                    }
                    return response.json();
                  })
                  .then(location => {
                  console.log(location.location_id);
                  this.createCampingPlace(location.location_id)
                  })   
                this.$router.push('/ownerplaces') 
            },
            async createCampingPlace(locationId){
              console.log(locationId);
              await fetch("http://localhost:5173/api/Camping_Place", {
                      method: "POST",
                      headers: {
                          "Content-Type": "application/json"
                      },
                      body: JSON.stringify({
                          owner_id: localStorage.getItem("user_id"),
                          location_id: locationId,
                          name: this.placename_input,
                          check_in: this.checkin_input,
                          check_out: this.checkout_input,
                          place_description: this.description_input
                      })
                    })
                    .then((response) => response.json())
                    .then(campingplace => {
                      console.log(campingplace);
                    })
            }
        }   
    }
</script>

<style>
.register {
  max-width: 500px; /* Adjust as needed */
  margin: 0 auto;
  padding: 20px;
}

.input-row {
  display: flex;
  align-items: center;
  margin-bottom: 10px;
}

.input-row label {
  margin-right: 10px;
  width: 120px; /* Fixed width for labels */
}

.input-row input[type="text"] {
  flex: 1;
  padding: 8px;
  border: 1px solid #ccc;
  border-radius: 5px;
}

button {
  background-color: #42b983;
  color: white;
  cursor: pointer;
  padding: 10px 20px;
  border: none;
  border-radius: 5px;
}

</style>