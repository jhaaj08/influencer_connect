const AdsComponent = {
  template: `
    <div class="ads-component-container p-5" style="background: linear-gradient(to bottom right, #1e3c72, #2a5298); min-height: 100vh;">
      <!-- Campaign Details Section -->
      <div class="campaign-details card shadow-sm p-4 mb-4" style="background: linear-gradient(to right, #3f87a6, #ebf8e1); border-radius: 15px; color: #ffffff;">
        <h2 class="text-white">{{ campaign.name }}</h2>
        <p class="text-white">{{ campaign.description }}</p>
        <div class="d-flex flex-wrap">
          <p class="text-light mr-4"><strong>Start Date:</strong> {{ formatDate(campaign.start_date) }}</p>
          <p class="text-light mr-4"><strong>End Date:</strong> {{ formatDate(campaign.end_date) }}</p>
          <p class="text-light mr-4"><strong>Budget:</strong> {{ campaign.budget }}</p>
          <p class="text-light"><strong>Visibility:</strong> {{ campaign.visibility }}</p>
        </div>
        <button class="btn btn-warning mt-4" @click="editCampaign" style="color: #ffffff;">Edit Campaign</button>
      </div>

      <!-- Ads List Section -->
      <div class="ads-list mt-5">
        <div class="d-flex justify-content-between align-items-center mb-3">
          <h3 class="text-white mb-0">Ads for Campaign</h3>
          <button class="btn btn-success" @click="addAd" style="border-radius: 10px;">+ Add Ad</button>
        </div>
        <div v-if="ads.length > 0">
          <div v-for="ad in ads" :key="ad.id" class="ad-card card shadow-sm p-3 mb-4" style="background: linear-gradient(to right, #eb3349, #f45c43); border-radius: 15px; color: #ffffff;">
            <p><strong>Campaign:</strong> {{ campaign.name }}</p>
            <p><strong>Requirements:</strong> {{ ad.requirements }}</p>
            <p><strong>Influencer:</strong> {{ ad.influencer_name }}</p>
            <p><strong>Status:</strong> {{ ad.status }}</p>
            <div class="button-container mt-3 d-flex justify-content-between">
              <button class="btn btn-primary" @click="openEditAdModal(ad)" style="border-radius: 10px;">Edit Ad</button>
              <button class="btn btn-danger" @click="deleteAd(ad.id)" style="border-radius: 10px;">Delete Ad</button>
            </div>
          </div>
        </div>
        <div v-else>
          <p class="text-muted text-white">No ads have been created yet. Click on "+ Add Ad" to create one.</p>
        </div>
      </div>

      <!-- Edit Ad Modal -->
      <div v-if="showEditModal" class="modal" tabindex="-1" role="dialog" style="display: block; background: rgba(0,0,0,0.5);">
        <div class="modal-dialog" role="document">
          <div class="modal-content">
            <div class="modal-header">
              <h5 class="modal-title">Edit Ad</h5>
              <button type="button" class="close" @click="closeEditAdModal" aria-label="Close">
                <span aria-hidden="true">&times;</span>
              </button>
            </div>
            <div class="modal-body">
              <div class="form-group mb-3">
                <label for="requirements" class="form-label">Requirements</label>
                <input v-model="editAdData.requirements" type="text" id="requirements" class="form-control" placeholder="Enter ad requirements" required />
              </div>
              <div class="form-group mb-3">
                <label for="paymentAmount" class="form-label">Payment Amount</label>
                <input v-model="editAdData.payment_amount" type="number" id="paymentAmount" class="form-control" placeholder="Enter payment amount" required />
              </div>
              <div class="form-group mb-3">
                <label for="status" class="form-label">Status</label>
                <input v-model="editAdData.status" type="text" id="status" class="form-control" placeholder="Enter ad status" required />
              </div>
            </div>
            <div class="modal-footer">
              <button type="button" class="btn btn-primary" @click="submitEditAd">Save changes</button>
              <button type="button" class="btn btn-secondary" @click="closeEditAdModal">Close</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  data() {
    return {
      campaign: {},
      ads: [],
      showEditModal: false,
      editAdData: {
        id: null,
        requirements: '',
        payment_amount: '',
        status: ''
      },
    };
  },
  async mounted() {
    const campaignId = this.$route.params.id; // Getting campaign ID from this route

    // Here we are Fetching Campaign Details
    try {
      const campaignRes = await fetch(window.location.origin + `/campaign/${campaignId}`, {
        headers: {
          "Content-Type": "application/json",
          "Authentication-Token": sessionStorage.getItem("token"),
        },
      });
      if (campaignRes.ok) {
        this.campaign = await campaignRes.json();
      } else {
        console.error("Failed to fetch campaign:", campaignRes.status, campaignRes.statusText);
      }
    } catch (error) {
      console.error("Error fetching campaign:", error);
    }

    // Fetching Ads for a particular Campaign
    try {
      const adsRes = await fetch(window.location.origin + `/campaign/${campaignId}/ads`, {
        headers: {
          "Content-Type": "application/json",
          "Authentication-Token": sessionStorage.getItem("token"),
        },
      });
      if (adsRes.ok) {
        this.ads = await adsRes.json();
      } else {
        console.error("Failed to fetch ads:", adsRes.status, adsRes.statusText);
      }
    } catch (error) {
      console.error("Error fetching ads:", error);
    }
  },
  methods: {
    addAd() {
      // Navigating to the create ad page
      this.$router.push(`/campaign/${this.$route.params.id}/add-ad`);
    },
    editCampaign() {
      // Navigating to the edit campaign page
      this.$router.push(`/edit-campaign/${this.$route.params.id}`);
    },
    openEditAdModal(ad) {
      // This will Open the edit ad modal and fill in the ad data
      this.editAdData = { ...ad };
      this.showEditModal = true;
    },
    closeEditAdModal() {
      // Here to close the edit ad modal
      this.showEditModal = false;
    },
    async submitEditAd() {
      try {
        const response = await fetch(window.location.origin + `/ad-request/${this.editAdData.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authentication-Token': sessionStorage.getItem('token'),
          },
          body: JSON.stringify({
            requirements: this.editAdData.requirements,
            payment_amount: this.editAdData.payment_amount,
            status: this.editAdData.status,
          }),
        });

        if (response.ok) {
          alert("Ad updated successfully!");
          // Updating the ad in the local ads list
          this.ads = this.ads.map(ad => ad.id === this.editAdData.id ? this.editAdData : ad);
          this.closeEditAdModal();
        } else {
          alert("Failed to update ad. Please try again.");
        }
      } catch (error) {
        alert("An error occurred while updating the ad. Please try again.");
      }
    },
    async deleteAd(adId) {
      try {
        const response = await fetch(window.location.origin + `/ad-request/${adId}`, {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
            'Authentication-Token': sessionStorage.getItem('token'),
          },
        });

        if (response.ok) {
          alert("Ad deleted successfully!");
          this.ads = this.ads.filter(ad => ad.id !== adId);
        } else {
          alert("Failed to delete ad. Please try again.");
        }
      } catch (error) {
        alert("An error occurred while deleting the ad. Please try again.");
      }
    },
    formatDate(dateStr) {
      if (!dateStr) return "N/A";
      const date = new Date(dateStr);
      return date.toLocaleDateString("en-GB"); // Formating date to 'dd/mm/yyyy'
    },
  },
};

export default AdsComponent;
