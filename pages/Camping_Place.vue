<template>
    <div v-if="place" class="camping-place">
      <h2>{{ place[0].name }}</h2>
      <p>Description:</p>
      <p>{{ place[0].place_description }}</p>
      <p>Check_in and Check_out</p>
      <p>{{ place[0].check_in }} - {{ place[0].check_out }}</p>

      <div class="images" v-if="imagesLoaded">
        <carousel :perPage="1" :navigationEnabled="true">
          <slide v-for="(imageURL, index) in imageURLs" :key="index">
            <img :src="imageURL" :alt="'Image ' + (index + 1)" class="carousel-image">
          </slide>
        </carousel>    

      </div>
      
      <div class="reservations" v-if="place">
        <h3>All reservations</h3>
        <carousel :perPage="1" :navigationEnabled="true">
          <slide v-for="reservation in reservations" :key="reservation.place_id">
            <p>Dates: {{ reservation.date_start }} - {{ reservation.date_end }}</p>
            <p> By: {{ reserved_by[reservation.spot_id].email }}</p>
          </slide>
        </carousel>    
      </div>

      <div class="availability" v-if="spotsAvailabilityLoaded">
        <h4>Available spots: </h4>
        <table border="2">
              <tr>
                  <th>
                      Spot name
                  </th>
                  <th>
                      Type
                  </th>
                  <th>
                      Price per night
                  </th>
              </tr> 
                <tr v-for="spot in spots" :key="spot.spot_id">
                    <td>
                      {{  spot.spot_name }}
                    </td>
                    <td>
                      {{spot.type_name}}
                    </td>
                    <td>
                      {{ spot.price_night }}
                    </td>
                </tr>
          </table>
        </div>

      

        <div class="amenties_added">
          <table border="1">
            <tr>
              <th>
                Amenities
              </th>
            </tr>
            <tr v-for="amenity in place_amenities" :key="amenity.amenity_name">
                <td> {{ amenity.amenity_name }}</td>
            </tr>
          </table>
        </div>

      <button @click="toggleSpots">{{ isAddingSpot ? 'Cancel' : 'Add spot' }}</button>
      
      <div v-if="isAddingSpot" class="adding-spot">
        <label for="spot_name"> Spot name</label>
        <input type="text" v-model="spotname_input">

        <label for="price_spot"> Price night</label>
        <input type="int" v-model="price_input">

        <label for="type"> Type</label>
        <input type="text" v-model="type_input">

        <button @click="addSpots">Add the spot</button>
        
      </div>
      <button @click="toggleAmenities">{{ isAddAmenities ? 'Cancel' : 'Add amenities' }}</button>
      <div v-if="isAddAmenities" class="adding-amenities">
        <form @submit.prevent="submitAmenities">
              <label v-for="amenity in amenities" :key="amenity.am_id">
                  <input type="checkbox" :value="amenity.am_id" v-model="selectedAmenities" v-if="amenity ">
                  {{ amenity.amenity }}
              </label>
              <br>
              <button type="submit">Save Amenities</button>
        </form>
      </div>

      <div class="upload-picture">
        <input type="file" @change="handleFileUpload">
        <button @click="UploadPicture">UploadPicture</button>
      </div>
     

    </div>
  </template>
  
  <script>
   import { Carousel, Slide } from 'vue-carousel';
  export default {
    name: 'Camping_Place',
    components: {
      Carousel,
      Slide
    },
    data() {
      return {
        id: null,
        place: null,
        spots: null,
        spotname_input: '',
        type_input: '',
        price_input: 0,
        isAddingSpot: false,
        isAddAmenities: false,
        amenities: null,
        selectedAmenities: [],
        place_amenities: null,
        spotsAvailability: {},
        spotsAvailabilityLoaded: false,  
        reservations: null,
        reserved_by: {},
        file: null,
        imageURLs: [],
        imagesLoaded: false
      };
    },
    mounted() {
      console.log(this.$route.params.id);
      this.id = this.$route.params.id;
      this.fetchreservationplace(this.id);
      this.fetchingCampingPlace();
      this.campingSpots();
      this.fetchAmenities();
      this.fetchcampamenities();
      this.fetchpicture(this.id);

    },
    methods: {
      handleFileUpload() {
          this.file = event.target.files[0];
      },
      async UploadPicture() {
          const formData = new FormData();
          formData.append('file', this.file);
          formData.append('placeId', this.id);

          try {
            const response = await fetch(`http://localhost:5173/api/Picture/upload`, {
              method: 'POST',
              body: formData
            });

            if (!response.ok) {
              throw new Error('Failed to upload picture');
            }

            // Handle success
            
            console.log('Picture uploaded successfully');
          } catch (error) {
            // Handle error
            console.error('Error uploading picture:', error);
          }
          location.reload();
      },
      async fetchpicture(placeId) {
        try {
            // Make a request to fetch images from the backend
            const response = await fetch(`http://localhost:5173/api/Picture/place/${placeId}`);
            if (!response.ok) {
              throw new Error('Failed to fetch images');
            }
            const data = await response.json();
            data.forEach(picture => {
              const imageUrl = `data:${picture.contentType};base64,${picture.data}`;
              // Now you can use the 'imageUrl' to display the image
              this.imageURLs.push(imageUrl);
            });
            console.log(this.imageURLs);
            this.imagesLoaded = true;
          } catch (error) {
            console.error('Error fetching images:', error);
            // Handle error if needed
          }
      },
      async fetchingCampingPlace() {
        const response = await fetch(`http://localhost:5173/api/Camping_Place/${this.id}`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json"
          }
        })
        this.place = await response.json(); // Parse the JSON response
        console.log(this.place);
      },
      async campingSpots() {  
        fetch( `http://localhost:5173/api/Camping_spot/campingplace/${this.id}`)
          .then((response) => response.json())
          .then((_spots) => {
              this.spots = _spots;
              console.log(this.spots);

              const availabilityPromises = this.spots.map(spot => this.fetchavailability(spot.spot_id));
              Promise.all(availabilityPromises)
                .then(() => {
                  this.spotsAvailabilityLoaded = true;
                  console.log(this.spotsAvailabilityLoaded);
                });  
              const users = this.spots.map(spot => this.fetchreservations(spot.spot_id));
              Promise.all(users)
                .then(() => {
                  console.log(this.reserved_by);
                })       
          })
      },
      async fetchavailability(spotId) {
        await fetch( `http://localhost:5173/api/Availability/spots/${spotId}`)
          .then((response) => response.json())
          .then((_availability) => {
            if(_availability.length == 0)
            {
              this.$set(this.spotsAvailability, spotId, {available: 'yes', date_end: 'not defined'});
              console.log(this.spotsAvailability);
            }
            else{
              console.log(_availability[0].date_end);
              const currentDate = new Date();
              const year = currentDate.getFullYear();
              const month = currentDate.getMonth() + 1; 
              const day = currentDate.getDate();

              // Format the date as 'YYYY-MM-DD'
              const formattedDate = `${year}-${month < 10 ? '0' + month : month}-${day < 10 ? '0' + day : day}`;
              if(_availability[0].date_start >= formattedDate){
                this.$set(this.spotsAvailability, spotId, {available: 'yes', date_end: `rented for or last rent: ${_availability[0].date_end}`});
              }
              else{
                this.$set(this.spotsAvailability, spotId, {available: 'no', date_end: `until: ${formattedDate}`});
              }
            }  
          })
      },
      toggleSpots() {
        this.isAddingSpot = !this.isAddingSpot;
      },
      addSpots() {
        fetch("http://localhost:5173/api/Camping_spot", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                spot_name: this.spotname_input,
                price_night: this.price_input,
                type_name: this.type_input,
                place_id: this.id
            })
        }).then(response => response.json())
        .then((newSpot) => {
            console.log(newSpot);
        });
        location.reload();
      },
      toggleAmenities() {
        this.isAddAmenities = !this.isAddAmenities;
      },
      fetchAmenities() {
          fetch(`http://localhost:5173/api/Amenities_camp/amenity_names`)
              .then((response) => response.json())
              .then((_amenities) => {
                  this.amenities = _amenities;
                  console.log(`This amenities: ${this.amenities}`);
              })
      },
      submitAmenities() {          
          this.selectedAmenities.forEach(amenityId => {
              // Prepare data for the current selected amenity 
              console.log(amenityId);
                  if (this.place_amenities.some(amenity => amenity.am_id === amenityId)) {
                    console.log(amenityId);
                    return alert(`You already have ${amenityId}`);
                  }   
                  fetch("http://localhost:5173/api/Amenities_camp", {
                      method: "POST",
                      headers: {
                          "Content-Type": "application/json"
                      },
                      body: JSON.stringify({
                          am_id: amenityId,
                          place_id: this.id
                      })
                  }).then(response => response.json())
                  .then((newAmenity) => {
                      console.log(newAmenity);
                  });       
              });
          location.reload();
      },
      fetchcampamenities() {
        fetch(`http://localhost:5173/api/Amenities_camp/place/${this.id}`)
              .then((response) => response.json())
              .then((amenities) => {
                  this.place_amenities = amenities;
                  console.log(this.place_amenities);
                  console.log(`${this.place_amenities.map(amenity => amenity.am_id)}`);
              })
      },
      async fetchreservationplace(placeId){
          await fetch(`http://localhost:5173/api/Reservation/place/${placeId}`, {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json'
            }
          })
          .then(response => response.json())
          .then(_reservations => {    
            this.reservations = _reservations;
        })
      },
      async fetchreservations(spotId){
        await fetch(`http://localhost:5173/api/Reservation/spot/${spotId}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json'
          }
        })
        .then(response => response.json())
        .then(_reservations => {          
            if(_reservations.length != 0)
            {
              fetch(`http://localhost:5173/api/User/${_reservations[0].user_id}`)
                .then((response) => response.json())
                .then((_user) => {
                  console.log(`user: ${_user}`);
                  this.$set(this.reserved_by, spotId, { email: _user[0].email});
                  console.log(this.reserved_by);
                })
            }
            else{
              this.$set(this.reserved_by, spotId, { email: "no one"});
            }
                
        });
      }   
    }
  };
  </script>

<style scoped>



.carousel-image {
  max-width: 100%; /* Ensure the image doesn't exceed the container width */
  max-height: 400px; /* Set a maximum height for the images */
  display: block; /* Ensure the image is displayed as a block element */
  margin: 0 auto; /* Center the image horizontally within the container */
  border-radius: 10px; /* Add rounded corners to the image */
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1); /* Add a subtle shadow to the image */
}

.camping-place {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.camping-place h2,
.camping-place p {
  margin: 10px 0;
}

.button {
  margin-top: 20px;
  padding: 10px 15px;
  background-color: #66bb6a;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.button:hover {
  background-color: #ffbf7a;
}

.adding-spot,
.adding-amenities {
  background-color: #66bb6a;
  color: #fff;
  padding: 10px 20px; /* Adjusted padding */
  margin-bottom: 20px;
  width: 10%;
}

.adding-amenities label {
  display: block;
  margin-top: 10px;
}

.adding-amenities input[type="checkbox"] {
  margin-right: 10px;
}

.adding-amenities button {
  margin-top: 10px;
  padding: 10px 15px;
  background-color: #66bb6a;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.adding-amenities button:hover {
  background-color: #ffbf7a;
}

.adding-spot label,
.adding-amenities label {
  display: block;
  margin-top: 10px;
}

.adding-spot input,
.adding-amenities input {
  width: calc(100% - 40px);
  padding: 10px;
  margin: 10px 0;
  border: none;
  border-radius: 5px;
}

.adding-spot button,
.adding-amenities button {
  width: calc(100% - 40px);
}

.availability,
.reserved-spots {
  width: 90%;
}

.availability table,
.reserved-spots table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 20px;
}

.availability th,
.availability td,
.reserved-spots th,
.reserved-spots td {
  padding: 10px;
  border: 1px solid #ddd;
}

.availability th,
.reserved-spots th {
  background-color: #4caf50;
  color: #fff;
}

.availability tr:nth-child(even),
.reserved-spots tr:nth-child(even) {
  background-color: #f2f2f2;
}

.availability tr:hover,
.reserved-spots tr:hover {
  background-color: #ddd;
}

.upload-picture {
  display: flex;
  align-items: center;
}

.upload-picture input[type="file"] {
  margin-right: 10px;
  margin-top: 30px;
}
.upload-picture button {
  background-color: #42b983;
  color: white;
  border: none;
  padding: 10px 15px;
  cursor: pointer;
  border-radius: 3px;
}
.upload-picture button :hover{
  background-color: #ffbf7a;
}
</style>
