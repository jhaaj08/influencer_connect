import router from "../static/utils/router.js";
import store from "./utils/store.js";
import Navbar from "./components/navbar.js";

new Vue({
    el: "#app",
    template: `
      <div>
        <Navbar v-if="!isHomeOrLogin" />
        <router-view />
      </div>
    `,
    router,
    store, // Directly reference the global Vuex store
    components: { Navbar },
    computed: {
      isHomeOrLogin() {
        // Hide the navbar on the home and login pages
        return this.$route.path === '/' || this.$route.path === '/login' || this.$route.path === '/signup-spo' || this.$route.path === '/signup-inf' ;
      }
    }
  });