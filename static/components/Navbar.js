import store from "../utils/store.js";

const Navbar = {
  template: `
    <nav class="navbar navbar-expand-lg navbar-dark" style="background: linear-gradient(to right, #1e3c72, #2a5298, #ff5f6d); box-shadow: 0px 4px 15px rgba(0,0,0,0.2); padding: 1rem;">
      <router-link to='/' class="navbar-brand text-light" style="font-weight: bold;">Home</router-link>
      <button class="navbar-toggler" type="button" data-toggle="collapse" data-target="#navbarNav" aria-controls="navbarNav" aria-expanded="false" aria-label="Toggle navigation">
        <span class="navbar-toggler-icon"></span>
      </button>
      <div class="collapse navbar-collapse justify-content-end" id="navbarNav">
        <ul class="navbar-nav">
          <li class="nav-item" v-if="isLoggedIn">
             <router-link to='/profile-page' class="nav-link text-light" style="font-weight: bold;">Profile</router-link>
          </li>
          <li class="nav-item" v-if="isLoggedIn && isSponsor">
            <router-link to='/dashboard-sponsor' class="nav-link text-light" style="font-weight: bold;">Dashboard</router-link>
          </li>
          <li class="nav-item" v-if="isLoggedIn && isAdmin">
            <router-link to='/dashboard-admin' class="nav-link text-light" style="font-weight: bold;">Dashboard</router-link>
          </li>
          <li class="nav-item" v-if="isLoggedIn && isSponsor">
            <router-link to='/find-influencers' class="nav-link text-light" style="font-weight: bold;">Find Influencer</router-link>
          </li>
          <li class="nav-item" v-if="isLoggedIn && isSponsor">
            <router-link to='/stats-sponsor' class="nav-link text-light" style="font-weight: bold;">Stats</router-link>
          </li>
          <li class="nav-item" v-if="isLoggedIn && isAdmin">
            <router-link to='/stats-admin' class="nav-link text-light" style="font-weight: bold;">Stats</router-link>
          </li>
          <li class="nav-item" v-if="isLoggedIn && isInfluencer">
            <router-link to='/dashboard-influencer' class="nav-link text-light" style="font-weight: bold;">Dashboard</router-link>
          </li>
          <li class="nav-item" v-if="isLoggedIn && isInfluencer">
            <router-link to='/find-campaigns' class="nav-link text-light" style="font-weight: bold;">Find Campaigns</router-link>
          </li>
          <li class="nav-item" v-if="isLoggedIn && isSponsor">
            <router-link to='/approval-page' class="nav-link text-light" style="font-weight: bold;">Approvals</router-link>
          </li>
          <li class="nav-item" v-if="isLoggedIn">
            <a href="#" @click.prevent="logout" class="nav-link text-light" style="font-weight: bold;">Logout</a>
          </li>
          <li class="nav-item" v-if="!isLoggedIn">
            <router-link to='/login' class="nav-link text-light" style="font-weight: bold;">Login</router-link>
          </li>
        </ul>
      </div>
    </nav>
  `,
  computed: {
    isLoggedIn() {
      return store.state.loggedIn; // Accessing Vuex state to check if the user is logged in
    },
    isSponsor() {
      return store.state.role === 'sponsor'; // Determining if the logged-in user is a sponsor
    },
    isInfluencer() {
      return store.state.role === 'influencer'; // Determining if the logged-in user is an influencer
    },
    isAdmin() {
      return store.state.role === 'admin'; // Determining if the logged-in user is an admin
    },
  },
  methods: {
    logout() {
      // Clear session storage on logout
      sessionStorage.removeItem('token');
      sessionStorage.removeItem('role');
      sessionStorage.removeItem('email');
      sessionStorage.removeItem('id');

      // Updating Vuex store
      store.commit('logout');
      store.commit('setRole', '');

      // Redirecting to login page
      this.$router.push("/login");
    },
  },
};

export default Navbar;