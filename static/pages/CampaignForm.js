const CampaignForm = {
  template: `
    <div 
      class="campaign-form-container vh-100 d-flex align-items-center justify-content-center"
      style="background-image: url('/static/images/background-sponsor.jpg'); background-size: cover; background-position: center;"
    >
      <div class="card p-5 shadow-lg" style="width: 500px; border-radius: 20px; background: linear-gradient(to bottom right, #1e3c72, #2a5298, #ff5f6d);">
        <h3 class="text-center mb-4" style="color: #fff;">Create a New Campaign</h3>
        
        <div class="form-group mb-3">
          <label for="name" class="form-label text-light">Campaign Name</label>
          <input v-model="name" type="text" class="form-control border-0 rounded" id="name" placeholder="Enter campaign name" required />
        </div>
    
        <div class="form-group mb-3">
          <label for="description" class="form-label text-light">Campaign Description</label>
          <textarea v-model="description" class="form-control border-0 rounded" id="description" rows="3" placeholder="Enter campaign description"></textarea>
        </div>
    
        <div class="form-group mb-3">
          <label for="start_date" class="form-label text-light">Start Date</label>
          <input v-model="start_date" type="date" class="form-control border-0 rounded" id="start_date" required />
        </div>
    
        <div class="form-group mb-3">
          <label for="end_date" class="form-label text-light">End Date</label>
          <input v-model="end_date" type="date" class="form-control border-0 rounded" id="end_date" required />
        </div>
    
        <div class="form-group mb-3">
          <label for="budget" class="form-label text-light">Budget</label>
          <input v-model="budget" type="number" class="form-control border-0 rounded" id="budget" placeholder="Enter campaign budget" required />
        </div>
    
        <div class="form-group mb-3">
          <label for="visibility" class="form-label text-light">Visibility</label>
          <select v-model="visibility" class="form-control border-0 rounded" id="visibility" required>
            <option value="public">Public</option>
            <option value="private">Private</option>
          </select>
        </div>
    
        <div class="form-group mb-3">
          <label for="niche" class="form-label text-light">Campaign Niche</label>
          <input v-model="niche" type="text" class="form-control border-0 rounded" id="niche" placeholder="Enter campaign niche (e.g., Technology, Lifestyle)" />
        </div>
    
        <div class="form-group mb-3">
          <label for="goals" class="form-label text-light">Campaign Goals</label>
          <textarea v-model="goals" class="form-control border-0 rounded" id="goals" rows="2" placeholder="Enter campaign goals"></textarea>
        </div>
    
        <button class="btn btn-primary w-100 shadow-sm" style="background: #3f87a6; border: none; border-radius: 10px;" @click="submitCampaign">Create Campaign</button>
      </div>
    </div>
  `,
  data() {
    return {
      name: "",
      description: "",
      start_date: "",
      end_date: "",
      budget: 0,
      visibility: "public",
      niche: "",
      goals: ""
    };
  },
  methods: {
    async submitCampaign() {
      if (!this.name || !this.start_date || !this.end_date || !this.budget) {
        alert("Please fill in all required fields.");
        return;
      }
  
      try {
        const response = await fetch(window.location.origin + "/campaign", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authentication-Token": sessionStorage.getItem("token"), // Adding the Authentication Token
          },
          body: JSON.stringify({
            name: this.name,
            description: this.description,
            start_date: this.start_date,
            end_date: this.end_date,
            budget: this.budget,
            visibility: this.visibility,
            niche: this.niche,
            goals: this.goals,
          }),
        });
  
        if (response.ok) {
          const data = await response.json();
          console.log("Campaign Created Successfully:", data);
          alert("Campaign created successfully!");
          this.$router.push("/dashboard-sponsor"); // Redirecting to campaigns page
        } else {
          const errorData = await response.json();
          console.error("Failed to create campaign:", errorData);
          alert("Failed to create campaign. Please try again.");
        }
      } catch (error) {
        console.error("An error occurred while creating the campaign:", error);
        alert("An error occurred. Please try again later.");
      }
    },
  },
};

export default CampaignForm;
