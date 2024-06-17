<template>
    <div v-if="allisloaded" class="booking">
      <div class="camping-place">
        <h1> Place name: {{ this.place[0].name }}</h1>
        <h2> Spot name: {{ spots[0].spot_name }}</h2>
        <h3> Spot type: {{spots[0].type_name}}</h3>
      </div>

      <div class="formfilling">

        <label>Your names: {{ first_name}} {{ last_name }}</label>
        <br>
        <label>Confirm dates: <br></label>
        <label> Check-in: {{ user_checkin }} </label>
        <br>
        <label>  Check-out: {{ user_checkout }} </label>
        <br>
        <label> Total sum: {{ total_sum }} euros</label>
        <br>
        <button @click="bookSpot"> Book the spot </button>

      </div> 
    </div>
  </template>
  
  <script>
  
  export default {
    name: 'Booking_page',
    
    data() {
      return {
        id: null,
        spots: null,
        place: null,
        allisloaded: false,
        first_name: localStorage.getItem('first_name'),
        last_name: localStorage.getItem('last_name'),
        user_checkin: localStorage.getItem('user_checkin'),
        user_checkout: localStorage.getItem('user_checkout'),
        total_sum: 0
      };
    },
    created() {
      console.log(this.$route.params.id);
      this.id = this.$route.params.id;
      this.fetchingCampingSpot();
    },
    methods: {
      async fetchingCampingSpot() {
        await fetch( `http://localhost:5173/api/Camping_spot/${this.id}`)
          .then((response) => response.json())
          .then((_spots) => {
              this.spots = _spots;
              console.log(this.spots);
              console.log(this.user_checkin);
              const checkin = new Date(this.user_checkin);
              const checkout = new Date(this.user_checkout);
              const timeDifference = checkout.getTime() - checkin.getTime();

              this.total_sum = Math.ceil(timeDifference / (1000 * 60 * 60 * 24));
              console.log(this.total_sum);
              this.total_sum = this.total_sum * this.spots.map(spot => spot.price_night)
              console.log(this.total_sum);
              const campingplaces = this.spots.map(spot => this.fetchCampingPlace(spot.place_id));
              Promise.all(campingplaces)
                .then(() => {
                  this.allisloaded = true;
                  console.log(this.allisloaded);
                  console.log(this.place)
                  console.log(this.spots)
                });
          })
      },
      async fetchCampingPlace(placeId)
      {
          await fetch(`http://localhost:5173/api/Camping_Place/${placeId}`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json"
          }
        })
        .then(response => response.json())
        .then((_place) => {
            this.place = _place;
            console.log(this.place);
        })
        
      },
      bookSpot() {
          console.log(this.place.place_id)
          fetch("http://localhost:5173/api/Reservation", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    user_id: localStorage.getItem("user_id"),
                    spot_id: this.id,
                    price_total: this.total_sum,
                    place_id: this.spots[0].place_id,
                    date_start: this.user_checkin,
                    date_end: this.user_checkout
                })
            }).then(response => response.json())
            .then((_newreservation) => {
                console.log(_newreservation);
            })
            .catch(error => {
            console.error('Error:', error);
            });
            this.updateavailability();
            this.addavailability();
            this.$router.push('/main')    
      },
      updateavailability()
      {
        const response = fetch(`http://localhost:5173/api/Availability/updateavailability/${this.id}`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json'
            }
          });
          if(!response.status == 200){
            console.log(response);
          }
          else{
            console.log("Successful change of av")
          }
      },
      addavailability() {
          fetch("http://localhost:5173/api/Availability", {
              method: "POST",
              headers: {
                  "Content-Type": "application/json"
              },
              body: JSON.stringify({
                  spot_id: this.id,
                  date_start: this.user_checkin,
                  date_end: this.user_checkout,
                  cur_ind: 1
              })
          }).then(response => response.json())
          .then((_added) => {
              console.log(_added);
          })
          .catch(error => {
          console.error('Error:', error);
          });
      }
    }
  };
  </script>

<style scoped>
.camping-place {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.camping-place h2,
.camping-place p {
  margin: 10px 0;
}

</style>
