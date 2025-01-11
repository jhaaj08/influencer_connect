const SignupSponsor = {
  template: `
    <div class="d-flex justify-content-center align-items-center vh-100" style="background: url('/static/images/awesome_background.jpg') no-repeat center center fixed; background-size: cover;">
      <div class="card p-5 shadow-lg" style="width: 500px; border-radius: 15px; background: linear-gradient(to bottom right, #1e3c72, #eb3349);">
        <h3 class="text-center mb-4 text-white">Sponsor Signup</h3>
        
        <!-- Name Field -->
        <div class="form-group mb-3">
          <label for="name" class="text-light">Name</label>
          <input v-model="name" type="text" class="form-control" id="name" placeholder="Your Name" required/>
          <div v-if="nameError" class="text-warning mt-1">{{ nameError }}</div>
        </div>

        <!-- Company Name Field -->
        <div class="form-group mb-3">
          <label for="company_name" class="text-light">Company Name</label>
          <input v-model="company_name" type="text" class="form-control" id="company_name" placeholder="Company Name" required/>
          <div v-if="companyNameError" class="text-warning mt-1">{{ companyNameError }}</div>
        </div>

        <!-- Industry Field -->
        <div class="form-group mb-3">
          <label for="industry" class="text-light">Industry</label>
          <input v-model="industry" type="text" class="form-control" id="industry" placeholder="Industry (e.g. Technology)" required/>
          <div v-if="industryError" class="text-warning mt-1">{{ industryError }}</div>
        </div>

        <!-- Email Field -->
        <div class="form-group mb-3">
          <label for="email" class="text-light">Email</label>
          <input v-model="email" type="email" class="form-control" id="email" placeholder="Email" required/>
          <div v-if="emailError" class="text-warning mt-1">{{ emailError }}</div>
        </div>

        <!-- Password Field -->
        <div class="form-group mb-3">
          <label for="password" class="text-light">Password</label>
          <input v-model="password" type="password" class="form-control" id="password" placeholder="Password" required/>
          <div v-if="passwordError" class="text-warning mt-1">{{ passwordError }}</div>
        </div>

        <!-- Budget Field -->
        <div class="form-group mb-3">
          <label for="budget" class="text-light">Budget</label>
          <input v-model="budget" type="number" class="form-control" id="budget" placeholder="Enter budget in USD" required/>
          <div v-if="budgetError" class="text-warning mt-1">{{ budgetError }}</div>
        </div>

        <!-- Sign Up Button -->
        <button class="btn btn-outline-light btn-lg w-100" @click="submitSponsorInfo" style="border-radius: 25px;">Sign Up</button>
      </div>
    </div>
  `,
  data() {
    return {
      name: "",
      company_name: "",
      industry: "",
      email: "",
      password: "",
      budget: 0,

      // Validation errors
      nameError: "",
      companyNameError: "",
      industryError: "",
      emailError: "",
      passwordError: "",
      budgetError: "",
    };
  },
  methods: {
    validateForm() {
      // Resetting all error messages
      this.nameError = this.companyNameError = this.industryError = this.emailError = this.passwordError = this.budgetError = "";

      let isValid = true;

      // Name validation
      if (!this.name) {
        this.nameError = "Name is required.";
        isValid = false;
      }

      // Company name validation
      if (!this.company_name) {
        this.companyNameError = "Company name is required.";
        isValid = false;
      }

      // Industry validation
      if (!this.industry) {
        this.industryError = "Industry is required.";
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

      // Budget validation
      if (!this.budget || this.budget <= 0) {
        this.budgetError = "Please enter a valid budget greater than 0.";
        isValid = false;
      }

      return isValid;
    },
    async submitSponsorInfo() {
      // Running form validation
      if (!this.validateForm()) {
        return;
      }

      try {
        const res = await fetch(window.location.origin + "/register-sponsor", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name: this.name,
            company_name: this.company_name,
            industry: this.industry,
            email: this.email,
            password: this.password,
            budget: this.budget,
            active: false,
          }),
        });

        if (res.ok) {
          alert("Sponsor signed up successfully!");
          this.$router.push("/");
        } else {
          alert("Error signing up. Please try again.");
        }
      } catch (error) {
        console.error("Error during sponsor signup:", error);
        alert("An error occurred. Please try again later.");
      }
    },
  },
};

export default SignupSponsor;