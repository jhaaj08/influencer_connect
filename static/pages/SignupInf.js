const SignupInfluencer = {
  template: `
    <div class="d-flex justify-content-center align-items-center vh-100" style="background: url('/static/images/awesome_background.jpg') no-repeat center center fixed; background-size: cover;">
      <div class="card p-5 shadow-lg" style="width: 500px; border-radius: 15px; background: linear-gradient(to bottom right, #1e3c72, #eb3349);">
        <h3 class="text-center mb-4 text-white">Influencer Signup</h3>

        <!-- Name Field -->
        <div class="form-group mb-3">
          <label for="name" class="text-light">Name</label>
          <input v-model="name" type="text" class="form-control" id="name" placeholder="Your Name" required />
          <div v-if="nameError" class="text-warning mt-1">{{ nameError }}</div>
        </div>

        <!-- Email Field -->
        <div class="form-group mb-3">
          <label for="email" class="text-light">Email</label>
          <input v-model="email" type="email" class="form-control" id="email" placeholder="Email" required />
          <div v-if="emailError" class="text-warning mt-1">{{ emailError }}</div>
        </div>

        <!-- Password Field -->
        <div class="form-group mb-3">
          <label for="password" class="text-light">Password</label>
          <input v-model="password" type="password" class="form-control" id="password" placeholder="Password" required />
          <div v-if="passwordError" class="text-warning mt-1">{{ passwordError }}</div>
        </div>

        <!-- Category Field -->
        <div class="form-group mb-3">
          <label for="category" class="text-light">Category</label>
          <input v-model="category" type="text" class="form-control" id="category" placeholder="Category (e.g. Fitness, Travel)" required />
          <div v-if="categoryError" class="text-warning mt-1">{{ categoryError }}</div>
        </div>

        <!-- Niche Field -->
        <div class="form-group mb-3">
          <label for="niche" class="text-light">Niche</label>
          <input v-model="niche" type="text" class="form-control" id="niche" placeholder="Niche (e.g. Vegan Lifestyle)" required />
          <div v-if="nicheError" class="text-warning mt-1">{{ nicheError }}</div>
        </div>

        <!-- Reach Field -->
        <div class="form-group mb-3">
          <label for="reach" class="text-light">Reach</label>
          <input v-model="reach" type="number" class="form-control" id="reach" placeholder="Number of followers" required />
          <div v-if="reachError" class="text-warning mt-1">{{ reachError }}</div>
        </div>

        <!-- Sign Up Button -->
        <button class="btn btn-outline-light btn-lg w-100" @click="submitInfluencerInfo" style="border-radius: 25px;">Sign Up</button>
      </div>
    </div>
  `,
  data() {
    return {
      name: "",
      email: "",
      password: "",
      category: "",
      niche: "",
      reach: 0,

      // Validation errors
      nameError: "",
      emailError: "",
      passwordError: "",
      categoryError: "",
      nicheError: "",
      reachError: "",
    };
  },
  methods: {
    validateForm() {
      // Resetting all error messages
      this.nameError = this.emailError = this.passwordError = this.categoryError = this.nicheError = this.reachError = "";

      let isValid = true;

      // Name validation
      if (!this.name) {
        this.nameError = "Name is required.";
        isValid = false;
      }

      // Email validation
      if (!this.email) {
        this.emailError = "Email is required.";
        isValid = false;
      } else if (!/\S+@\S+\.\S+/.test(this.email)) {
        this.emailError = "Please enter a valid email address.";
        isValid = false;
      }

      // Password validation
      if (!this.password) {
        this.passwordError = "Password is required.";
        isValid = false;
      } else if (this.password.length < 6) {
        this.passwordError = "Password must be at least 6 characters.";
        isValid = false;
      }

      // Category validation
      if (!this.category) {
        this.categoryError = "Category is required.";
        isValid = false;
      }

      // Niche validation
      if (!this.niche) {
        this.nicheError = "Niche is required.";
        isValid = false;
      }

      // Reach validation
      if (!this.reach || this.reach <= 0) {
        this.reachError = "Please enter a valid reach greater than 0.";
        isValid = false;
      }

      return isValid;
    },
    async submitInfluencerInfo() {
      // Running form validation
      if (!this.validateForm()) {
        return;
      }

      try {
        const res = await fetch(window.location.origin + "/register-influencer", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name: this.name,
            email: this.email,
            password: this.password,
            category: this.category,
            niche: this.niche,
            reach: this.reach,
          }),
        });

        if (res.ok) {
          alert("Influencer signed up successfully!");
          this.$router.push("/");
        } else {
          alert("Error signing up. Please try again.");
        }
      } catch (error) {
        console.error("Error during influencer signup:", error);
        alert("An error occurred. Please try again later.");
      }
    },
  },
};

export default SignupInfluencer;