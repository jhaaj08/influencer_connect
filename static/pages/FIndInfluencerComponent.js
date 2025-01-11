const FindInfluencerComponent = {
    template: `
      <div class="find-influencer-container">
        <h3 class="text-primary mb-4">Select an Influencer</h3>
        <div v-for="influencer in influencers" :key="influencer.id" class="influencer-card card p-3 mb-3 shadow-sm">
          <p><strong>Name:</strong> {{ influencer.name }}</p>
          <p><strong>Category:</strong> {{ influencer.category }}</p>
          <button class="btn btn-info" @click="selectInfluencer(influencer)">Select Influencer</button>
        </div>
      </div>
    `,
    data() {
      return {
        influencers: [],
      };
    },
    async mounted() {
      try {
        const response = await fetch(window.location.origin + `/search-influencers`, {
          headers: {
            "Content-Type": "application/json",
            "Authentication-Token": sessionStorage.getItem("token"),
          },
        });
  
        if (response.ok) {
          this.influencers = await response.json();
          console.log({"influencers": this.influencers})
        } else {
          console.error("Failed to fetch influencers:", response.status, response.statusText);
        }
      } catch (error) {
        console.error("Error fetching influencers:", error);
      }
    },
    methods: {
      selectInfluencer(influencer) {
        // Navigating back to the ad form with influencer data as query params
        this.$router.push({
          path: `/campaign/${this.$route.params.id}/create-ad`
        });
      },
    }
  };
  
  export default FindInfluencerComponent;