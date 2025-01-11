const InfluencerDashboard = {
  template: `
    <div 
      class="influencer-dashboard-container vh-100 p-5" 
      style="background-image: url('/static/images/background-influencer.jpg'); background-size: cover; background-position: center; min-height: 100vh; color: white;"
    >
      <!-- All Ads Section -->
      <div class="card mb-5 p-4 shadow-lg" style="border-radius: 20px; background: linear-gradient(to bottom right, #1e3c72, #2a5298, #ff5f6d);">
        <h3 class="text-center mb-4" style="color: #FFD700;">All Ads</h3>
        <div v-if="allAds.length > 0" class="ads-list">
          <div v-for="ad in allAds" :key="ad.id" class="card ad-card shadow-sm p-3 mb-4" style="background: #343a40; color: white; border-radius: 15px;">
            <p><strong>Campaign:</strong> {{ ad.campaign_name }}</p>
            <p><strong>Requirements:</strong> {{ ad.requirements }}</p>
            <p><strong>Payment Amount:</strong> {{ ad.payment_amount }}</p>
            <p><strong>Status:</strong> {{ ad.status }}</p>
          </div>
        </div>
        <div v-else>
          <p class="text-center text-warning">No ads available at the moment.</p>
        </div>
      </div>

      <!-- My Requests Section -->
      <div class="card mb-5 p-4 shadow-lg" style="border-radius: 20px; background: linear-gradient(to bottom right, #1e3c72, #2a5298, #ff5f6d);">
        <h3 class="text-center mb-4" style="color: #FFD700;">My Requests (Pending)</h3>
        <div v-if="myRequests.length > 0" class="ads-list">
          <div v-for="ad in myRequests" :key="ad.id" class="card ad-card shadow-sm p-3 mb-4" style="background: #343a40; color: white; border-radius: 15px;">
            <p><strong>Campaign:</strong> {{ ad.campaign_name }}</p>
            <p><strong>Requirements:</strong> {{ ad.requirements }}</p>
            <p><strong>Payment Amount:</strong> {{ ad.payment_amount }}</p>
            <p><strong>Status:</strong> {{ ad.status }}</p>
            <div class="d-flex justify-content-around mt-3">
              <button class="btn btn-success btn-margin" @click="takeAction(ad.id, 'accept')">Accept</button>
              <button class="btn btn-danger btn-margin" @click="takeAction(ad.id, 'reject')">Reject</button>
              <button class="btn btn-warning btn-margin" @click="negotiate(ad.id)">Negotiate</button>
            </div>
          </div>
        </div>
        <div v-else>
          <p class="text-center text-warning">No pending ads available.</p>
        </div>
      </div>

      <!-- Open Ads Section -->
      <div class="card mb-5 p-4 shadow-lg" style="border-radius: 20px; background: linear-gradient(to bottom right, #1e3c72, #2a5298, #ff5f6d);">
        <h3 class="text-center mb-4" style="color: #FFD700;">Open Ads</h3>
        <div v-if="openAds.length > 0" class="ads-list">
          <div v-for="ad in openAds" :key="ad.id" class="card ad-card shadow-sm p-3 mb-4" style="background: #343a40; color: white; border-radius: 15px;">
            <p><strong>Campaign:</strong> {{ ad.campaign_name }}</p>
            <p><strong>Requirements:</strong> {{ ad.requirements }}</p>
            <p><strong>Payment Amount:</strong> {{ ad.payment_amount }}</p>
            <div class="text-center mt-3">
              <button class="btn btn-warning" @click="negotiate(ad.id)">Negotiate</button>
            </div>
          </div>
        </div>
        <div v-else>
          <p class="text-center text-warning">No open ads available.</p>
        </div>
      </div>
    </div>
  `,
  data() {
    return {
      allAds: [],
      myRequests: [],
      openAds: [],
    };
  },
  async mounted() {
    await this.fetchAllAds();
    await this.fetchMyRequests();
    await this.fetchOpenAds();
  },
  methods: {
    async fetchAllAds() {
      try {
        console.log(sessionStorage.getItem("token"))  
        const response = await fetch(window.location.origin + "/influencer/ads", {
          headers: {
            "Content-Type": "application/json",
            "Authentication-Token": sessionStorage.getItem("token"),
          },
        });
        if (response.ok) {
          this.allAds = await response.json();
        } else {
          console.error("Failed to fetch ads:", response.status, response.statusText);
        }
      } catch (error) {
        console.error("Error fetching ads:", error);
      }
    },
    async fetchMyRequests() {
      try {
        const response = await fetch(window.location.origin + "/ads/pending", {
          headers: {
            "Content-Type": "application/json",
            "Authentication-Token": sessionStorage.getItem("token"),
          },
        });
        if (response.ok) {
          this.myRequests = await response.json();
        } else {
          console.error("Failed to fetch pending ads:", response.status, response.statusText);
        }
      } catch (error) {
        console.error("Error fetching pending ads:", error);
      }
    },
    async fetchOpenAds() {
      try {
        const response = await fetch(window.location.origin + "/ads/open", {
          headers: {
            "Content-Type": "application/json",
            "Authentication-Token": sessionStorage.getItem("token"),
          },
        });
        if (response.ok) {
          this.openAds = await response.json();
        } else {
          console.error("Failed to fetch open ads:", response.status, response.statusText);
        }
      } catch (error) {
        console.error("Error fetching open ads:", error);
      }
    },
    async takeAction(adId, action) {
      try {
        const response = await fetch(window.location.origin + `/ads/${adId}/action`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            "Authentication-Token": sessionStorage.getItem("token"),
          },
          body: JSON.stringify({ action }),
        });
        if (response.ok) {
          alert(`Ad ${action} successfully`);
          // Refreshing all relevant sections
          await this.fetchAllAds();
          await this.fetchMyRequests();
          await this.fetchOpenAds();
        } else {
          console.error(`Failed to ${action} ad:`, response.status, response.statusText);
        }
      } catch (error) {
        console.error(`Error trying to ${action} ad:`, error);
      }
    },
    negotiate(adId) {
      const newAmount = prompt("Enter the new payment amount for negotiation:");
      if (newAmount && !isNaN(newAmount) && parseFloat(newAmount) > 0) {
        // Triggering the new negotiation route
        this.negotiateAction(adId, "negotiate", parseFloat(newAmount));
      } else {
        alert("Please enter a valid positive number for the payment amount.");
      }
    },
    async negotiateAction(adId, actionType, amount = null) {
      try {
        const response = await fetch(window.location.origin + `/ads/${adId}/negotiate`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authentication-Token': sessionStorage.getItem('token'),
          },
          body: JSON.stringify({
            action: actionType,
            negotiation_amount: amount,  // Passing the new negotiation amount for the negotiation action
          }),
        });
    
        if (response.ok) {
          alert("Action completed successfully!");
          // Refreshing all relevant sections after negotiation
          await this.fetchAllAds();
          await this.fetchMyRequests();
          await this.fetchOpenAds();
        } else {
          console.error("Failed to complete action:", response.status, response.statusText);
          alert("Failed to complete action. Please try again.");
        }
      } catch (error) {
        console.error("Error during action:", error);
        alert("An error occurred. Please try again.");
      }
    },
  },
};

export default InfluencerDashboard;
