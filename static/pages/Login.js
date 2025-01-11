import store from '../utils/store.js'; // Import the Vuex store

const Login = {
  template: `
    <div class="login-container vh-100 d-flex justify-content-center align-items-center" style="background: url('/static/images/awesome_background.jpg') no-repeat center center fixed; background-size: cover;">
      <div class="card shadow-lg p-5" style="width: 400px; background: linear-gradient(to bottom right, #1e3c72, #eb3349); border-radius: 15px;">
        <h3 class="text-center mb-4 text-white">Login to Your Account</h3>
        
        <div class="form-group mb-3">
          <label for="email" class="text-light">Email</label>
          <input v-model="email" type="email" class="form-control" id="email" placeholder="Enter your email" required />
        </div>

        <div class="form-group mb-4">
          <label for="password" class="text-light">Password</label>
          <input v-model="password" type="password" class="form-control" id="password" placeholder="Enter your password" required />
        </div>

        <button class="btn btn-outline-light w-100" @click="submitLogin" style="border-radius: 25px;">Login</button>

        <div class="text-center mt-3">
          <router-link to="/signup-spo" class="btn btn-link text-white">Signup as Sponsor</router-link> |
          <router-link to="/signup-inf" class="btn btn-link text-white">Signup as Influencer</router-link>
        </div>
      </div>
    </div>
  `,
  data() {
    return {
      email: "",
      password: "",
    };
  },
  methods: {
    async submitLogin() {
      if (!this.email || !this.password) {
        alert("Please enter both email and password.");
        return;
      }

      try {
        const response = await fetch(window.location.origin + "/user-login", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: this.email,
            password: this.password,
          }),
          credentials: "same-origin",
        });

        console.log("Fetch Response:", response);

        if (response.ok) {
          const data = await response.json();
          console.log("Login successful:", data);
          
          // Checking if the user is active
          if (!data.active) {
            alert("Please wait until the admin approves your account.");
            return;
          }
          if (data.flag) {
            alert("Your account has been flagged, please wait for admin review.");
            return;
          }
          // Setting session storage
          sessionStorage.setItem("token", data.token);
          sessionStorage.setItem("role", data.role);
          sessionStorage.setItem("email", data.email);
          sessionStorage.setItem("id", data.id);
          
          // Setting Vuex store state
          store.commit('setLogin'); // Set loggedIn to true
          store.commit('setRole', data.role); // Set role in the store

          // Redirecting to the correct dashboard based on role
          if (data.role === "sponsor") {
            this.$router.push("/dashboard-sponsor");
          } else if (data.role === "influencer") {
            this.$router.push("/dashboard-influencer");
          } else if (data.role === "admin") {
            this.$router.push("/dashboard-admin");
          } else {
            console.error("Unknown role:", data.role);
            alert("Unknown user role. Please contact support.");
          }

        } else {
          const errorDetails = await response.json();
          console.error("Login failed with response:", errorDetails);
          alert("Invalid credentials. Please try again.");
        }
      } catch (error) {
        console.error("Login error:", error);
        alert("An error occurred during login. Please try again later.");
      }
    },
  },
};

export default Login;