import CampaignComponent from '../components/CampaignComponent.js';

const SponsorDashboard = {
  template: `
    <div class="sponsor-dashboard-container vh-100 d-flex flex-column" style="background-image: url('/static/images/background-sponsor.jpg'); background-size: cover; background-position: center; padding: 2rem;">
      <div class="add-campaign-button-container mb-5 text-center">
        <button class="btn btn-lg rounded-circle add-campaign-button" style="width: 70px; height: 70px; background: linear-gradient(to bottom right, #3f87a6, #ebf8e1); color: white; box-shadow: 0px 4px 15px rgba(0,0,0,0.2);" @click="addCampaign">
          +
        </button>
        <p style="color: #ebf8e1; font-size: 1.5rem; text-align: center;">
          Add Campaign
        </p>
      </div>

      <!-- Export Campaigns Button -->
      <div class="export-campaign-button-container mb-5 text-center">
        <button class="btn btn-lg export-campaign-button" style="background: linear-gradient(to bottom right, #f45c43, #eb3349); color: white; border-radius: 10px; box-shadow: 0px 4px 15px rgba(0,0,0,0.2); padding: 0.5rem 2rem;" @click="exportCampaigns">
          Export Campaigns as CSV
        </button>
      </div>
      
      <div v-if="campaigns.length === 0" class="no-campaigns-message d-flex justify-content-center align-items-center" style="background: rgba(0, 0, 0, 0.6); padding: 2rem; border-radius: 15px;">
        <p style="color: #ebf8e1; font-size: 1.5rem; text-align: center;">
          🚀 No campaigns added yet! <br /> Click the <span style="font-weight: bold;">"+" button</span> above to create your first campaign and start reaching more audiences.
        </p>
      </div>
      
      <div v-else class="campaigns-list row g-4 justify-content-center">
        <!-- Iterate through campaigns and pass props to CampaignComponent -->
        <div v-for="campaign in campaigns" :key="campaign.id" class="col-12 col-sm-6 col-md-4 col-lg-3 d-flex justify-content-center">
          <CampaignComponent
            :id="campaign.id"
            :name="campaign.name"
            :description="campaign.description"
            :budget="campaign.budget"
            :startDate="campaign.start_date"
            :endDate="campaign.end_date"
            @campaign-deleted="removeCampaign"
          />
        </div>
      </div>
    </div>
  `,
  components: {
    CampaignComponent,
  },
  data() {
    return {
      campaigns: [],
    };
  },
  async mounted() {
    await this.fetchCampaigns();
  },
  methods: {
    async fetchCampaigns() {
      try {
        const response = await fetch(window.location.origin + '/my-campaigns', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authentication-Token': sessionStorage.getItem('token'), 
          },
        });

        if (response.ok) {
          const data = await response.json();
          this.campaigns = data.campaigns;
        } else {
          console.error("Failed to fetch campaigns:", response.status, response.statusText);
        }
      } catch (error) {
        console.error("Error fetching campaigns:", error);
      }
    },
    addCampaign() {
      // Navigating to add campaign page or open a modal
      this.$router.push('/add-campaign');
    },
    async exportCampaigns() {
      try {
        const response = await fetch(window.location.origin + "/export-campaigns", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authentication-Token": sessionStorage.getItem("token"),
          },
        });

        if (response.ok) {
          alert("Campaign export initiated. You will receive an email once it is done.");
        } else {
          console.error("Failed to initiate export:", response.status, response.statusText);
          alert("Failed to initiate export. Please try again.");
        }
      } catch (error) {
        console.error("Error initiating export:", error);
        alert("An error occurred. Please try again.");
      }
    },
    removeCampaign(campaignId) {
      // Removing the deleted campaign from the campaigns list
      this.campaigns = this.campaigns.filter(campaign => campaign.id !== campaignId);
    },
  },
};

export default SponsorDashboard;