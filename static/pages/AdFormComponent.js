const AdFormComponent = {
  template: `
    <div 
      class="ad-form-container vh-100 d-flex align-items-center justify-content-center"
      style="background-image: url('/static/images/background-sponsor.jpg'); background-size: cover; background-position: center; min-height: 100vh;"
    >
      <div class="card p-5 shadow-lg" style="width: 600px; border-radius: 20px; background: linear-gradient(to bottom right, #1e3c72, #2a5298, #ff5f6d);">
        <h3 class="text-center mb-4 text-light">Create New Ad for Campaign</h3>
        
        <!-- Ad Details Form -->
        <div class="form-group mb-3">
          <label for="requirements" class="form-label text-light">Requirements</label>
          <input v-model="requirements" type="text" id="requirements" class="form-control border-0 rounded" placeholder="Enter ad requirements" required />
        </div>

        <div class="form-group mb-3">
          <label for="paymentAmount" class="form-label text-light">Payment Amount</label>
          <input v-model="paymentAmount" type="number" id="paymentAmount" class="form-control border-0 rounded" placeholder="Enter payment amount" required />
        </div>

        <div class="form-group mb-3">
          <label for="influencer" class="form-label text-light">Select Influencer</label>
          <select v-model="selectedInfluencer" id="influencer" class="form-control border-0 rounded" @change="onInfluencerChange" required>
            <option disabled value="">Please select an influencer</option>
            <option v-for="influencer in influencers" :key="influencer.id" :value="influencer">
              {{ influencer.name }} | {{ influencer.niche }} | Reach: {{ influencer.reach }}
            </option>
          </select>
        </div>

        <div class="button-container mt-4 d-flex flex-wrap justify-content-between">
          <button class="btn btn-primary btn-margin shadow-sm" 
                  style="border-radius: 10px; flex: 1; white-space: nowrap; font-size: 0.8em;" 
                  @click="submitAd">
            Create Ad
          </button>
        </div>
      </div>
    </div>
  `,
  data() {
    return {
      requirements: '',
      paymentAmount: '',
      selectedInfluencer: null, // Stores the selected influencer details
      influencers: [], // Stores the list of influencers
    };
  },
  async mounted() {
    console.log("Mounted AdFormComponent");

    // Fetching all influencers for the dropdown
    try {
      const response = await fetch(window.location.origin + '/search-influencers', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authentication-Token': sessionStorage.getItem('token'),
        },
      });
      
      if (response.ok) {
        this.influencers = await response.json();
        console.log("Influencers fetched:", this.influencers);
      } else {
        console.error("Failed to fetch influencers:", response.status, response.statusText);
      }
    } catch (error) {
      console.error("Error fetching influencers:", error);
    }
  },
  methods: {
    onInfluencerChange(event) {
      // Logging when the influencer selection changes
      console.log("Influencer changed:", this.selectedInfluencer);
    },
    async submitAd() {
      // Ensuring that paymentAmount and selectedInfluencer are provided
      if (!this.selectedInfluencer) {
        alert("Please select an influencer before creating the ad.");
        return;
      }
    
      if (!this.paymentAmount) {
        alert("Please enter a valid payment amount.");
        return;
      }
      
      // Correctly parsing campaign ID and payment amount to ensure correct types
      const campaignId = parseInt(this.$route.params.id, 10);
      const paymentAmount = parseFloat(this.paymentAmount);

      try {
        const response = await fetch(window.location.origin + `/campaign/${campaignId}/create-ad`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authentication-Token': sessionStorage.getItem('token'),
          },
          body: JSON.stringify({
            requirements: this.requirements,
            paymentAmount: paymentAmount,
            influencer_id: this.selectedInfluencer.id,
          }),
        });

        if (response.ok) {
          const responseData = await response.json();
          alert("Ad created successfully!");
          this.$router.push(`/campaign/${campaignId}`);
        } else {
          const errorText = await response.text();
          alert("Failed to create ad. Please try again.");
        }
      } catch (error) {
        alert("An error occurred while creating the ad. Please try again.");
      }
    },
  },
};

export default AdFormComponent;
