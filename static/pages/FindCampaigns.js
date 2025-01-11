const FindCampaigns = {
    template: `
      <div
        class="find-campaigns-container vh-100 d-flex flex-column align-items-center"
        style="background-image: url('/static/images/background-influencer.jpg'); background-size: cover; background-position: center; padding: 2rem; overflow-y: auto;"
      >
        <div class="card p-5 shadow-lg" style="max-width: 800px; width: 100%; border-radius: 20px; background: linear-gradient(to bottom right, #1e3c72, #2a5298, #ff5f6d);">
          <h3 class="text-center mb-4" style="color: #fff;">Find Campaigns</h3>
  
          <!-- Filter Section -->
          <div class="form-group mb-4">
            <label for="nicheFilter" class="form-label text-light">Select Niche</label>
            <select v-model="selectedNiche" class="form-control border-0 rounded" id="nicheFilter" required>
              <option disabled value="">Please select a niche</option>
              <option v-for="niche in uniqueNiches" :key="niche" :value="niche">
                {{ niche }}
              </option>
            </select>
          </div>
  
          <button class="btn btn-primary w-100 shadow-sm" style="background: #3f87a6; border: none; border-radius: 10px;" @click="filterCampaigns">Filter Campaigns</button>
        </div>
  
        <!-- Campaign and Ads Section -->
        <div class="campaigns-list mt-5" v-if="filteredCampaigns.length > 0">
          <div v-for="campaign in filteredCampaigns" :key="campaign.id" class="card p-4 mb-4 shadow-lg" style="max-width: 600px; border-radius: 20px; background: linear-gradient(to bottom right, #1e3c72, #2a5298, #ff5f6d); color: white;">
            <h4 class="mb-3">{{ campaign.name }}</h4>
            <p><strong>Description:</strong> {{ campaign.description }}</p>
            <p><strong>Niche:</strong> {{ campaign.niche }}</p>
            <div class="ads-list mt-3">
              <h5 class="mb-3">Ads in this Campaign (Pending or Negotiating)</h5>
              <div v-if="campaign.ads && campaign.ads.length > 0">
                <div v-for="ad in campaign.ads" :key="ad.id" class="ad-card p-3 mb-3 shadow-sm" style="background: #ffffff; border-radius: 10px;">
                  <p style="color: black; background: white;"><strong>Requirements:</strong> {{ ad.requirements }}</p>
                  <p style="color: black; background: white;"><strong>Payment Amount:</strong> {{ ad.payment_amount }}</p>
                 <p style="color: black; background: white;"><strong>Status:</strong> {{ ad.status }}</p>
                  <button class="btn btn-warning" @click="negotiate(ad.id)">Negotiate</button>
                </div>
              </div>
              <div v-else>
                <p>No ads available for this campaign.</p>
              </div>
            </div>
          </div>
        </div>
        <div v-else-if="filteredCampaigns.length === 0 && showNoCampaignsMessage">
          <p class="text-light mt-5">No campaigns available for the selected niche.</p>
        </div>
      </div>
    `,
    data() {
      return {
        campaigns: [],
        selectedNiche: '',
        uniqueNiches: [],
        filteredCampaigns: [],
        showNoCampaignsMessage: false,
      };
    },
    async mounted() {
      await this.fetchCampaigns();
    },
    methods: {
      async fetchCampaigns() {
        try {
          const response = await fetch(window.location.origin + '/public-campaigns', {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              'Authentication-Token': sessionStorage.getItem('token'),
            },
          });
  
          if (response.ok) {
            const data = await response.json();
            this.campaigns = data.public_campaigns.map(campaign => ({
              ...campaign,
              ads: [], // Initializing ads as an empty array for each campaign
            }));
            this.uniqueNiches = [...new Set(this.campaigns.map(campaign => campaign.niche))];
          } else {
            console.error('Failed to fetch campaigns:', response.status, response.statusText);
          }
        } catch (error) {
          console.error('Error fetching campaigns:', error);
        }
      },
      async filterCampaigns() {
        if (this.selectedNiche) {
          this.filteredCampaigns = this.campaigns.filter(campaign => campaign.niche === this.selectedNiche);
          this.showNoCampaignsMessage = this.filteredCampaigns.length === 0;
  
          // Fetching ads for each filtered campaign concurrently
          await Promise.all(this.filteredCampaigns.map(async campaign => {
            try {
              const response = await fetch(window.location.origin + `/campaign/${campaign.id}/ads`, {
                method: 'GET',
                headers: {
                  'Content-Type': 'application/json',
                  'Authentication-Token': sessionStorage.getItem('token'),
                },
              });
  
              if (response.ok) {
                const ads = await response.json();
                // Attaching ads to the respective campaign object
                this.$set(campaign, 'ads', ads.filter(ad => ad.status === 'Pending' || ad.status === 'Negotiating'));
              } else {
                console.error(`Failed to fetch ads for campaign ${campaign.id}:`, response.status, response.statusText);
              }
            } catch (error) {
              console.error('Error fetching ads:', error);
            }
          }));
        }
      },
      negotiate(adId) {
        const newAmount = prompt('Enter the new payment amount for negotiation:');
        if (newAmount && !isNaN(newAmount) && parseFloat(newAmount) > 0) {
          // Triggering the new negotiation route
          this.negotiateAction(adId, 'negotiate', parseFloat(newAmount));
        } else {
          alert('Please enter a valid positive number for the payment amount.');
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
              negotiation_amount: amount,
            }),
          });
  
          if (response.ok) {
            alert('Action completed successfully!');
            await this.filterCampaigns(); // Refreshing campaigns and ads after negotiation
          } else {
            console.error('Failed to complete action:', response.status, response.statusText);
            alert('Failed to complete action. Please try again.');
          }
        } catch (error) {
          console.error('Error during action:', error);
          alert('An error occurred. Please try again.');
        }
      },
    },
  };
  
  export default FindCampaigns;