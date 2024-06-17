<template>
  <div v-if="locationLoaded">
    <h4>Camping places</h4>
    <carousel :per-page="1" :navigation-enabled="true">
      <slide v-for="place in campingPlaces" :key="place.place_id">
        <div @click="goToCampingPlace(place.place_id)" class="camping-place">
          <h5>{{ place.name }}</h5>
          <h5> {{ locations[place.place_id].location_name }}</h5>
          
        </div>
      </slide>
    </carousel>
  </div>
</template>
  
<script>
import { Carousel, Slide } from 'vue-carousel';

export default {
  name: "OwnerPlaces",
  components: {
    Carousel,
    Slide
  },
  data() {
    return {
      user: {
        role: 'owner'
      },
      campingPlaces: null,
      locations: {},
      locationLoaded: false
    };
  },
  mounted() {
    this.fetchCampingPlaces();
  },
  methods: {
    async fetchCampingPlaces() {
      await fetch(`http://localhost:5173/api/Camping_Place/user/${localStorage.getItem("user_id")}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json'
          }
        })
        .then(response => response.json())
        .then(_places => {
            this.campingPlaces = _places;
            console.log(this.campingPlaces)
            const locations = _places.map(place => this.fetchLocation(place.location_id, place.place_id));
              Promise.all(locations)
                .then(() => {
                  console.log("location", this.locations);
                  this.locationLoaded = true;
                  
                });   
        });
    },
    async fetchLocation(locationId, placeId) {
        try {
            const response = await fetch(`http://localhost:5173/api/Location/${locationId}`);
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            const location = await response.json();
            console.log(location[0].full_address)
            this.$set(this.locations, placeId, { location_name: location[0].full_address });
            
        } catch (error) {
            console.error('Error fetching location:', error);
            // Handle error if needed
        }
    },
    goToCampingPlace(id) {
      try {
        console.log(id);
        this.$router.push('/campingplace/' + id); 
      } catch (error) {
        console.error('Error fetching camping place details:', error);
      }
    }
  }
};
</script>

  
  <style scoped>
  .camping-spot {
    padding: 16px;
    border: 1px solid #ddd;
    border-radius: 8px;
    background-color: #fff;
    cursor: pointer;
    text-align: center;
  }
  
  .camping-spot:hover {
    box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
  }
  
  .carousel {
    margin-top: 20px;
  }
  </style>
  