<template>
    <div v-if="place" class="camping-place">
      <h2>{{ place[0].name }}</h2>
      <p>Description:</p>
      <p>{{ place[0].place_description }}</p>
      <p>Check_in and Check_out</p>
      <p>{{ place[0].check_in }} - {{ place[0].check_out }}</p>
      <p>Owner: {{ userName[0].name }} - email: {{ email }}</p>
      

      <div class="images" v-if="imagesLoaded">
        <carousel :perPage="1" :navigationEnabled="true">
          <slide v-for="(imageURL, index) in imageURLs" :key="index">
            <img :src="imageURL" :alt="'Image ' + (index + 1)" class="carousel-image">
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
                      Availability
                  </th>
                  <th>
                      Type
                  </th>
                  <th>
                      Price per night
                  </th>
                  <th> 
                     Spot reservation
                  </th>
              </tr> 
                <tr v-for="spot in spots" :key="spot.spot_id">
                    <td>
                      {{  spot.spot_name }}
                    </td>
                    <td>
                      {{ spotsAvailability[spot.spot_id] }}
                    </td>
                    <td>
                      {{spot.type_name}}
                    </td>
                    <td>
                      {{ spot.price_night }}
                    </td>
                    <td>
                      <button v-if="spotsAvailability[spot.spot_id]  == 'yes'" @click="ReserveSpot(spot.spot_id)" class="reserve" id="{spot.spot_id}">Reserve this spot</button>
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

        <br>
        <br> 

        <label>Reviews:</label>
        <div class="reviews" v-if="reviewsLoaded">
            <div v-for="review in reviews" :key="review.review_id">
                <label>Date Posted:</label>
                <label> {{ review.date_posted }}</label>
                <br>
                <!-- removed the this of this.userName and it worked, don't put this in front of the property when u use promise and load it in java -->
                <label>Review by:{{ userName[review.review_id].name }} </label>
                <br>
                
                <label>{{ review.description }}  </label> 
                <br>
                <label> Stars: {{ review.stars }}</label>
                <br>
                <br>
            </div>
        </div>

        <button @click="toggleReview">{{ isPostReview ? 'Cancel' : 'Post review' }}</button>
        <div v-if="isPostReview" class="post-review">

        <label for="description"> Description</label>
        <input type="text" v-model="descr_input">

        <label for="stars">Rate from 1 to 5</label>
        <input type="number" id="stars" v-model="stars_input" min="1" max="5" step="1">

        <button @click="postReview">Post review</button>
        
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
        amenities: null,
        place_amenities: null,
        reviews: null,
        userName: {},
        reviewsLoaded: false,
        isPostReview: false,
        descr_input: '',
        stars_input: null,
        spotsAvailability: {},
        spotsAvailabilityLoaded: false,
        imageURLs: [],
        imagesLoaded: false,
        email: ''
     
      };
    },
    created() {
      console.log(this.$route.params.id);
      this.id = this.$route.params.id;
      this.fetchingCampingPlace();
      this.campingSpots();
      this.fetchAmenities();
      this.fetchcampamenities();
      this.fetchReviews();
      this.fetchpicture(this.id);
    },
    methods: {
      async fetchingCampingPlace() {
        await fetch(`http://localhost:5173/api/Camping_Place/${this.id}`)
          .then((response) => response.json())
          .then((_place) => {
            this.place = _place;
            const owner_id = _place[0].owner_id;
            this.fetchUser(owner_id, 0);

            console.log(this.email);
          })
        
      },
      async campingSpots() {  
        await fetch( `http://localhost:5173/api/Camping_spot/campingplace/${this.id}`)
          .then((response) => response.json())
          .then((_spots) => {
              this.spots = _spots;
              console.log(this.spots);
              const availabilityPromises = this.spots.map(spot => this.fetchavailability(spot.spot_id));
              Promise.all(availabilityPromises)
                .then(() => {
                  this.spotsAvailabilityLoaded = true;
                  console.log("spots available", this.spotsAvailabilityLoaded);
                });         // promise we use to ensure that all the data loads before we do certain actions that help us load the template
          })
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
      async fetchavailability(spotId) {
          await fetch( `http://localhost:5173/api/Availability/spots/${spotId}`)
          .then((response) => response.json())
          .then((_availabilities) => {
            if(_availabilities.length == 0)
            {
              this.$set(this.spotsAvailability, spotId, 'yes');
              console.log(this.spotsAvailability);
            }
            else{
              _availabilities.forEach(_availability => {
                // Format the date as 'YYYY-MM-DD'
                const checkinDate = localStorage.getItem("user_checkin");
                const checkoutDate = localStorage.getItem("user_checkout");

                const reservationStart = new Date(_availability.date_start);
                const reservationEnd = new Date(_availability.date_end);
                console.log(checkinDate)
                console.log(checkoutDate);
                console.log(reservationEnd);
                console.log(reservationStart);
                if((checkinDate >= reservationStart && checkinDate <= reservationEnd) ||
                   (checkoutDate >= reservationStart && checkoutDate <= reservationEnd) ||
                    (checkinDate <= reservationStart && checkoutDate >= reservationEnd)
                  ){
                  this.$set(this.spotsAvailability, spotId, 'yes');
                }
                else{
                  this.$set(this.spotsAvailability, spotId, 'no');
                }
              })
            }
          })            
      },
      toggleSpots() {
        this.isAddingSpot = !this.isAddingSpot;
      },
      toggleAmenities() {
        this.isAddAmenities = !this.isAddAmenities;
      },
      async fetchAmenities() {
           await fetch(`http://localhost:5173/api/Amenities_camp/amenity_names`)
              .then((response) => response.json())
              .then((_amenities) => {
                  this.amenities = _amenities;
                  console.log(this.amenities);
              })
      },
      async fetchcampamenities() {
        await fetch(`http://localhost:5173/api/Amenities_camp/place/${this.id}`)
              .then((response) => response.json())
              .then((amenities) => {
                  this.place_amenities = amenities;
                  console.log(this.place_amenities.map(amenity => amenity.am_id));
              })
      },
      async fetchReviews()
      {
        await fetch(`http://localhost:5173/api/Reviews/place/${this.id}`)
              .then((response) => response.json())
              .then((_reviews) => {
                  this.reviews = _reviews;
                  console.log(this.reviews);

                  const reviewusername = this.reviews.map(review => this.fetchUser(review.user_id, review.review_id));
                  Promise.all(reviewusername)
                    .then(() => {
                      console.log(this.userName);
                      this.reviewsLoaded = true;
                      console.log("reviewsloaded", this.reviewsLoaded)
                      
                    });       
              })
      },
      async fetchUser(userId, reviewId) {
        await fetch(`http://localhost:5173/api/User/${userId}`)
              .then((response) => response.json())
              .then((_user) => {
                    const _name = `${_user[0].first_name} ${_user[0].last_name}`;
                    console.log(_name);
                    this.$set(this.userName, reviewId, {name: `${_name}`})
                    if(reviewId == 0){
                      this.email = _user[0].email;
                    }
              })
      },
      toggleReview() {
        this.isPostReview = !this.isPostReview;
      },
      postReview() {
        const currentDate = new Date();
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth() + 1;
        const day = currentDate.getDate();

        // Format the date as 'YYYY-MM-DD'
        const formattedDate = `${year}-${month < 10 ? '0' + month : month}-${day < 10 ? '0' + day : day}`;
        fetch("http://localhost:5173/api/Reviews", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                user_id: localStorage.getItem("user_id"),
                place_id: this.id,
                description: this.descr_input,
                date_posted: formattedDate,
                stars: this.stars_input
            })
        }).then(response => response.json())
        .then((newreview) => {
            console.log(newreview);
        })
        .catch(error => {
        console.error('Error:', error);
        });
        location.reload();
      },
      ReserveSpot(spotId)
      {
        console.log(spotId);
        this.$router.push('/booking/' + spotId); 

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
  background-color: #388e3c;
}

.adding-spot,
.adding-amenities {
  background-color: #66bb6a;
  color: #fff;
  padding: 10px 20px; /* Adjusted padding */
  border-radius: 10px;
  margin-bottom: 20px;
  width: 90%;
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
  background-color: #388e3c;
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

.availability table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 20px;
}

.availability th,
.availability td {
  padding: 10px;
  border: 1px solid #ddd;
  text-align: center; /* Align text center */
}

.availability th {
  background-color: #4caf50;
  color: #fff;
}

.availability tr:nth-child(even) {
  background-color: #f2f2f2;
}

.availability tr:hover {
  background-color: #ddd;
}

</style>
