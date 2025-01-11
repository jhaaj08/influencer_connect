const EditCampaign = {
  template: `
    <div class="edit-campaign-container card shadow-sm p-4 mb-4" style="width: 600px; margin: auto; background: #2d4059; border-radius: 20px; color: #ffffff;">
      <h3 class="mb-4 text-light" style="text-align: center; font-weight: bold;">Edit Campaign Details</h3>
      
      <!-- Campaign Details Form -->
      <div class="form-group mb-3">
        <label for="campaignName" class="text-light" style="font-weight: bold;">Name</label>
        <input v-model="campaignData.name" type="text" id="campaignName" class="form-control form-control-styled" style="background: #4f5d75; color: #ffffff; border-radius: 10px;" />
      </div>

      <div class="form-group mb-3">
        <label for="campaignDescription" class="text-light" style="font-weight: bold;">Description</label>
        <textarea v-model="campaignData.description" id="campaignDescription" class="form-control form-control-styled" style="background: #4f5d75; color: #ffffff; border-radius: 10px;"></textarea>
      </div>

      <div class="form-group mb-3">
        <label for="campaignBudget" class="text-light" style="font-weight: bold;">Budget</label>
        <input v-model="campaignData.budget" type="number" id="campaignBudget" class="form-control form-control-styled" style="background: #4f5d75; color: #ffffff; border-radius: 10px;" />
      </div>

      <div class="form-group mb-3">
        <label for="campaignStartDate" class="text-light" style="font-weight: bold;">Start Date</label>
        <input v-model="campaignData.start_date" type="date" id="campaignStartDate" class="form-control form-control-styled" style="background: #4f5d75; color: #ffffff; border-radius: 10px;" />
      </div>

      <div class="form-group mb-3">
        <label for="campaignEndDate" class="text-light" style="font-weight: bold;">End Date</label>
        <input v-model="campaignData.end_date" type="date" id="campaignEndDate" class="form-control form-control-styled" style="background: #4f5d75; color: #ffffff; border-radius: 10px;" />
      </div>

      <div class="form-group mb-3">
        <label for="campaignVisibility" class="text-light" style="font-weight: bold;">Visibility</label>
        <select v-model="campaignData.visibility" id="campaignVisibility" class="form-control form-control-styled" style="background: #4f5d75; color: #ffffff; border-radius: 10px;">
          <option value="public">Public</option>
          <option value="private">Private</option>
        </select>
      </div>

      <div class="form-group mb-3">
        <label for="campaignGoals" class="text-light" style="font-weight: bold;">Goals</label>
        <input v-model="campaignData.goals" type="text" id="campaignGoals" class="form-control form-control-styled" style="background: #4f5d75; color: #ffffff; border-radius: 10px;" />
      </div>

      <div class="form-group mb-4">
        <label for="campaignNiche" class="text-light" style="font-weight: bold;">Niche</label>
        <input v-model="campaignData.niche" type="text" id="campaignNiche" class="form-control form-control-styled" style="background: #4f5d75; color: #ffffff; border-radius: 10px;" />
      </div>

      <button class="btn btn-light mt-4 w-100" @click="updateCampaign" style="background-color: #ff6b6b; color: #ffffff; border-radius: 15px; font-weight: bold;">Save Changes</button>
    </div>
  `,
  data() {
    return {
      campaignData: {
        name: '',
        description: '',
        budget: 0,
        start_date: '',
        end_date: '',
        visibility: 'public',
        goals: '',
        niche: ''
      },
    };
  },
  async mounted() {
    // Getting the campaign ID from the route parameters
    const campaignId = this.$route.params.id;

    try {
      // Fetching the current campaign data using the campaign ID from the route
      const response = await fetch(`${window.location.origin}/campaign/${campaignId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authentication-Token': sessionStorage.getItem('token'),
        },
      });

      if (response.ok) {
        const data = await response.json();
        // Populating campaignData with fetched details
        this.campaignData = {
          ...data,
          start_date: this.formatDate(data.start_date),
          end_date: this.formatDate(data.end_date),
        };
      } else {
        console.error('Failed to fetch campaign details:', response.status, response.statusText);
        alert('Unable to fetch campaign details. Please try again.');
      }
    } catch (error) {
      console.error('Error fetching campaign details:', error);
    }
  },
  methods: {
    formatDate(dateStr) {
      // Formating date from the backend to a suitable format for the input field
      const date = new Date(dateStr);
      return date.toISOString().split('T')[0];
    },
    async updateCampaign() {
      // Getting the campaign ID from the route parameters
      const campaignId = this.$route.params.id;

      try {
        const response = await fetch(`${window.location.origin}/campaign/${campaignId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authentication-Token': sessionStorage.getItem('token'),
          },
          body: JSON.stringify(this.campaignData),
        });

        if (response.ok) {
          alert('Campaign updated successfully!');
          // Redirecting to the campaign details page after successful update
          this.$router.push(`/campaign/${campaignId}`);
        } else {
          console.error('Failed to update campaign:', response.status, response.statusText);
          alert('Failed to update the campaign. Please try again.');
        }
      } catch (error) {
        console.error('Error updating campaign:', error);
        alert('An error occurred while updating the campaign. Please try again.');
      }
    }
  },
};

// Exporting the component
export default EditCampaign;