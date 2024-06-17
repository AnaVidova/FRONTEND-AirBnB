
<template>
   <div class="main">
    <router-view></router-view>
    <h2>Camping-AirBnB</h2>

    <h3>Start your camping plan today</h3>
    <div class="filter-container">
        <div class="filter-row">
            <label for="Location">Where:</label>
            <input type="text" v-model="location_filter" class="my-picker-class" placeholder="Enter location" />
        </div>  

        
        <div class="filter-row">
            <label for="Check-in">Check-in:</label>
            <DatePicker v-model="checkin_filter" input-class ="my-picker-class" placeholder="Select check-in date"></DatePicker>
        </div>

        <div class="filter-row">
            <label for="Check-out">Check-out:</label>
            <DatePicker v-model="checkout_filter" input-class ="my-picker-class" placeholder="Select check-out date"></DatePicker>
        </div>
        
        <button @click="search" class="filter-row">Search</button>

    </div>
    <br>
    <div class="container2">
        <div class="price-type-row">
            <label for="Price">Price per night: </label>
            <input type="text" v-model="pricemax_filter" class="my-picker-class" placeholder="Max price" />
        </div>
        <br>
        <div class="price-type-row">
            <label for="Type">Type of camping: </label>
            <input type="text" v-model="type_filter" class="my-picker-class" placeholder="Camping type" />
        </div>
    </div>      

    <br>
    <br> 
    <button @click="toggleAmenities" class="amenities-button">{{ isFilterAmenities ? 'Cancel' : 'Filter Amenities' }}</button>
      <div v-if="isFilterAmenities" class="adding-amenities">
        <form @submit.prevent="submitAmenities">
              <label v-for="amenity in this.amenities" :key="amenity.am_id">
                  <input type="checkbox" :value="amenity.am_id" v-model="selectedAmenities" v-if="amenity ">
                  {{ amenity.amenity }}
              </label>
              <br>
        </form>
      </div>
      <br>
    

    <div v-if="searchHit && imageIsLoaded">
        <h3>Camping places</h3>
        <carousel :per-page="1" :navigation-enabled="true">
        <slide v-for="key in Object.keys(campingPlaces)" :key="key">
            <div @click="goToCampingPlace(key)" class="camping-place">
            <h4>{{ campingPlaces[key].name }}</h4>  
            <img v-if="imageUrls[key]" :src="imageUrls[key].image" class="camping-image" alt="Camping Image"/>                     
            </div>
        </slide>
        </carousel>
    </div> 
    
  </div>
</template>

<script>
    import DatePicker from 'vue2-datepicker';
    import { Carousel, Slide } from 'vue-carousel';
    export default {
        name: "PageHome",
        components: {
            DatePicker,
            Carousel,
            Slide
        },
        data() {
            return{
                location_filter: '',
                checkin_filter: null,
                checkout_filter: null,
                pricemax_filter: '',
                type_filter: '',
                place: null,
                filtered_places: [],
                campingPlaces: {},
                searchHit: false,
                amenities: null,
                selectedAmenities: [],
                isFilterAmenities: false,
                imageUrls: {},
                imageIsLoaded: false
            };
        },
        mounted() {
            this.fetchAmenities();
        },
        methods: {
            search() {
                const current = new Date();
                if(this.checkin_filter > current && this.checkout_filter < current) {
                    alert(`These dates aren't available `)
                }
                else{
                    if(this.location_filter == '' || this.pricemax_filter == '') {
                        alert(`Choose location and price, please`)
                    }
                    else{
                        this.fetchplace(),
                        this.searchHit = true;
                    }  
                }           
            },
            toggleAmenities()
            {
                this.isFilterAmenities = !this.isFilterAmenities;
            },
            async fetchplace() {

                const [country, city] = this.location_filter.split(',').map(part => part.trim());
                try {
                    const queryParams = new URLSearchParams({ country, city }).toString();
                    console.log(queryParams);
                    console.log(`http://localhost:5173/api/Camping_Place/location?${queryParams}`);
                    const response =  await fetch(`http://localhost:5173/api/Camping_Place/location?${queryParams}`);
                    if (!response.ok) {
                    throw new Error('Network response was not ok');
                    }
                    this.place = await response.json();
                    console.log(this.place);

                    this.fetchAvailability();

                } catch (error) {
                    console.error('There was a problem with the fetch operation:', error);
                }
                
            },
            async fetchAvailability(){
                console.log(this.place.map(place => place.place_id));
                for(const place of this.place){
                    await fetch(`http://localhost:5173/api/Camping_Place/availableplaces/${place.place_id}/${this.pricemax_filter}`)
                            .then((response) => response.json())
                            .then((_availability) => {
                                if(_availability != null){
                                    this.filtered_places.push(place.place_id);
                                    console.log(this.filtered_places);
                                }
                            })
                }
                if(this.type_filter != '' || this.selectedAmenities == null) {
                    this.fetchtype()
                }
                else{
                    console.log("gay");
                    this.fetchCampingPlaces();
                }
              
           
            },
            async fetchtype() {
                
                for(const place_id of this.filtered_places)
                {
                    await fetch(`http://localhost:5173/api/Camping_spot/campingplace/${place_id}`, {
                        method: 'GET',
                        headers: {
                            'Content-Type': 'application/json'
                        }
                        })
                        .then(response => response.json())
                        .then(spots => {
                            console.log(Array.isArray(spots));
                            
                            const matchingSpot = spots.some(spot => spot.type_name.toLowerCase() === this.type_filter.toLowerCase());
                            if (matchingSpot == false) {
                                this.filtered_places = this.filtered_places.filter(id => id !== place_id);
                            }
                        });   
                }
                if(this.selectedAmenities.length != null)
                {
                    
                    this.fetchcampamenities();
                }
                else{
                    console.log("gay")
                    this.fetchCampingPlaces();
                }
                
                          
            },
            async fetchcampamenities() {
                for(const place_id of this.filtered_places)
                {
                    await fetch(`http://localhost:5173/api/Amenities_camp/place/${place_id}`)
                        .then((response) => response.json())
                        .then((amenities) => {
                            this.place_amenities = amenities;
                            const placeAmenityIds = amenities.map(amenity => amenity.am_id);
                            const anyMissingAmenity = this.selectedAmenities.some(selectedAmenity =>
                                    !placeAmenityIds.includes(selectedAmenity)
                            );
                            console.log("selected amenities", this.selectedAmenities);
                            console.log("missingamenities", anyMissingAmenity)
                            if (anyMissingAmenity == true) {
                                console.log("gay amenities");
                                this.filtered_places = this.filtered_places.filter(id => id !== place_id);
                            }
                            
                            
                        })
                }
                console.log("this filtered places:", this.filtered_places);
                this.fetchCampingPlaces();
                    
            },
            async fetchCampingPlaces() {
                console.log("this filtered places:", this.filtered_places)
                if(this.filtered_places.length == 0){
                    alert("No found places");
                    this.campingPlaces = {};
                }
                else{
                    for(const place_id of this.filtered_places)
                    {
                        await fetch(`http://localhost:5173/api/Camping_Place/${place_id}`, {
                            method: 'GET',
                            headers: {
                                'Content-Type': 'application/json'
                            }
                            })
                            .then(response => response.json())
                            .then(places => {
                                this.$set(this.campingPlaces, places[0].place_id, {name: `${places[0].name}`})
                                console.log(places[0].name);
                                console.log("this camping places", this.campingPlaces);
                                
                            });
                        this.fetchpicture(place_id);
                    }
                    this.imageIsLoaded = true; 
                }
                    
            },
            fetchAmenities() {
                fetch(`http://localhost:5173/api/Amenities_camp/amenity_names`)
                    .then((response) => response.json())
                    .then((_amenities) => {
                        this.amenities = _amenities;
                        console.log(`This amenities: ${this.amenities}`);
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
                    console.log(data)

                    const imageUrl = `data:${data[0].contentType};base64,${data[0].data}`;
                    this.$set(this.imageUrls, placeId, {image: imageUrl});

                    this.imagesLoaded = true;
                } catch (error) {
                    console.error('Error fetching images:', error);
                    // Handle error if needed
                }
            },
            goToCampingPlace(id) {
                try {
                    console.log(id);
                    localStorage.setItem("user_checkin", this.checkin_filter.toISOString().split('T')[0]);
                    localStorage.setItem("user_checkout", this.checkout_filter.toISOString().split('T')[0]);
                    console.log(localStorage.getItem("user_checkin"))
                    this.$router.push('/place_user/' + id); 
                } catch (error) {
                    console.error('Error fetching camping place details:', error);
                }
            }
        }
    }


</script>

<style>
.main {
  max-width: 800px; /* Adjust as needed */
  margin: 0 auto;
  padding: 20px;
}

.filter-container {
  display: flex;
  align-items: flex-start;
}

.filter-row {
  display: flex;
  align-items: center;
  margin-bottom: 10px;
}

.filter-row label {
  margin-right: 10px;
}

.filter-row input[type="text"],
.filter-row .DatePicker {
  flex: 1;
}

.filter-row button {
  margin-top: 10px;
}

.my-picker-class {
  border: none !important;
  border-bottom: 1px solid #42b983 !important;
}

.container2 {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  margin-right: 20px;
}

.price-type-row {
  margin-bottom: 10px; /* Adjust spacing between rows */
}

.adding-amenities {
  display: flex;
  justify-content: flex-end;
  margin-right: 20px;
}

.amenities-button {
  display: flex;
  justify-content: flex-end;
  margin-right: 20px;
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

.camping-place {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
}

.camping-image {
  width: 100%; /* Ensure the image takes up the full width of the carousel */
  height: auto; /* Maintain the aspect ratio */
  max-height: 300px; /* Set a maximum height for the images */
  object-fit: cover; /* Ensure the image covers the area without stretching */
}
</style>