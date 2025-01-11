import AdFormComponent from "../pages/AdFormComponent.js"; // Reusing AdFormComponent to display ads

const NegotiatingAds = {
  template: `
    <div 
      class="negotiating-ads-container vh-100 d-flex flex-column align-items-center justify-content-center"
      style="background-image: url('/static/images/background-sponsor.jpg'); background-size: cover; background-position: center; padding: 2rem;"
    >
      <h2 class="text-center mb-4" style="color: #FFD700;">Negotiating Ads</h2>

      <!-- Ads List Section -->
      <div v-if="ads.length > 0" class="w-100">
        <div 
          v-for="ad in ads" 
          :key="ad.id" 
          class="ad-card card shadow-lg p-4 mb-4 d-flex align-items-center justify-content-between"
          style="max-width: 800px; border-radius: 20px; background: linear-gradient(to right, #3f87a6, #ebf8e1); color: #2a5298;"
        >
          <div>
            <h4 class="text-dark mb-3">{{ ad.campaign_name }}</h4>
            <p><strong>Requirements:</strong> {{ ad.requirements }}</p>
            <p><strong>Payment Amount:</strong> {{ ad.payment_amount }}</p>
            <p><strong>Negotiation Amount:</strong> {{ ad.negotiation_amount }}</p>
            <p><strong>Influencer:</strong> {{ ad.influencer_name }}</p>
          </div>

          <!-- Action Buttons -->
          <div class="ml-4">
            <button class="btn btn-outline-success mb-2 w-100" @click="acceptNegotiation(ad)">Accept</button>
            <button class="btn btn-outline-danger w-100" @click="rejectNegotiation(ad)">Reject</button>
          </div>
        </div>
      </div>
      <div v-else>
        <p class="text-light mt-5">No ads are currently under negotiation.</p>
      </div>
    </div>
  `,
  data() {
    return {
      ads: [],
    };
  },
  async mounted() {
    await this.getNegotiatingAds();
  },
  methods: {
    async getNegotiatingAds() {
      try {
        // Getting all campaigns for the sponsor
        const campaignsResponse = await fetch(`${window.location.origin}/my-campaigns`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            "Authentication-Token": sessionStorage.getItem("token"),
          },
        });

        if (campaignsResponse.ok) {
          const campaigns = await campaignsResponse.json();
          
          // Iterating through each campaign to get ads
          for (let campaign of campaigns.campaigns) {
            const adsResponse = await fetch(`${window.location.origin}/campaign/${campaign.id}/ads`, {
              method: "GET",
              headers: {
                "Content-Type": "application/json",
                "Authentication-Token": sessionStorage.getItem("token"),
              },
            });

            if (adsResponse.ok) {
              const campaignAds = await adsResponse.json();
              
              // Filtering ads with status "Negotiating"
              const negotiatingAds = campaignAds.filter(ad => ad.status === "Negotiating");
              
              // Adding to the overall ads array
              this.ads = [...this.ads, ...negotiatingAds];
            } else {
              console.error(`Failed to fetch ads for campaign ${campaign.id}:`, adsResponse.status, adsResponse.statusText);
            }
          }
        } else {
          console.error("Failed to fetch campaigns:", campaignsResponse.status, campaignsResponse.statusText);
        }
      } catch (error) {
        console.error("Error fetching negotiating ads:", error);
      }
    },
    async acceptNegotiation(ad) {
      try {
        // Setting payment_amount to negotiation_amount and status to Accepted
        const response = await fetch(`${window.location.origin}/ads/${ad.id}/accept`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            "Authentication-Token": sessionStorage.getItem("token"),
          },
          body: JSON.stringify({
            payment_amount: ad.negotiation_amount,
            status: "Accepted",
          }),
        });

        if (response.ok) {
          alert("Ad negotiation accepted successfully!");
          await this.getNegotiatingAds(); // Refreshing list after action
        } else {
          console.error("Failed to accept negotiation:", response.status, response.statusText);
          alert("Failed to accept the negotiation. Please try again.");
        }
      } catch (error) {
        console.error("Error accepting negotiation:", error);
        alert("An error occurred while accepting the negotiation.");
      }
    },
    async rejectNegotiation(ad) {
      try {
        // Setting influencer_id to None and status to Pending
        const response = await fetch(`${window.location.origin}/ads/${ad.id}/reject`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            "Authentication-Token": sessionStorage.getItem("token"),
          },
          body: JSON.stringify({
            influencer_id: null,
            status: "Pending",
          }),
        });

        if (response.ok) {
          alert("Ad negotiation rejected successfully!");
          await this.getNegotiatingAds(); // Refreshing list after action
        } else {
          console.error("Failed to reject negotiation:", response.status, response.statusText);
          alert("Failed to reject the negotiation. Please try again.");
        }
      } catch (error) {
        console.error("Error rejecting negotiation:", error);
        alert("An error occurred while rejecting the negotiation.");
      }
    },
  },
};

export default NegotiatingAds;