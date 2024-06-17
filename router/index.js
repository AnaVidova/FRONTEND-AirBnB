import App from '../src/App.vue';
import MainPage from '../pages/Main.vue';
import LoginPage from '../pages/LoginPage.vue';
import AccountPage from '../pages/AccountPage.vue';
import RegisterPage from '../pages/RegisterPage.vue';
import UploadCamping from '../pages/UploadCamp.vue';
import OwnerPlaces from '../pages/OwnerPlaces.vue';
import Camping_place from '../pages/Camping_Place.vue';
import Place_user from '../pages/Place_user.vue';
import Booking from '../pages/Booking_page.vue';

export default [
  {
    path: '/main',
    component: MainPage
  },
  {
    path: '/app',
    component: App
  },
  {
    path: '/login',
    component: LoginPage
  },
  {
    path: '/register',
    component: RegisterPage
  },
  {
    path: '/account',
    component: AccountPage
  },
  {
    path: '/uploadcamping',
    component: UploadCamping
  },
  {
    path: '/ownerplaces',
    component: OwnerPlaces
  },
  {
    path: '/campingplace/:id',
    component: Camping_place,
    props: true
  },
  {
    path: '/place_user/:id',
    component: Place_user,
    props: true
  },
  {
    path: '/booking/:id',
    component: Booking,
    props: true
  }
]