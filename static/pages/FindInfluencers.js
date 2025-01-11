const FindInfluencers = {
  template: `
    <div 
      class="find-influencers-container vh-100 d-flex flex-column align-items-center justify-content-center"
      style="background-image: url('/static/images/background-sponsor.jpg'); background-size: cover; background-position: center; padding: 2rem;"
    >
      <h2 class="text-center mb-4" style="color: #FFD700;">Find Influencers</h2>

      <!-- Filter Section -->
      <div class="filters card shadow-lg p-5 mb-5" 
        style="max-width: 800px; width: 100%; border-radius: 20px; background: linear-gradient(to bottom right, #3f87a6, #141e30);"
      >
        <h4 class="text-center mb-3" style="color: #FFFFFF;">Filters</h4>
        <div class="form-row d-flex flex-wrap justify-content-between">
          <!-- Category Filter -->
          <div class="form-group col-md-4 mb-4">
            <label for="categoryFilter" class="text-white">Category</label>
            <select v-model="filters.category" id="categoryFilter" class="form-control border-0 rounded">
              <option value="">All Categories</option>
              <option v-for="category in uniqueCategories" :key="category" :value="category">{{ category }}</option>
            </select>
          </div>
          <!-- Niche Filter -->
          <div class="form-group col-md-4 mb-4">
            <label for="nicheFilter" class="text-white">Niche</label>
            <select v-model="filters.niche" id="nicheFilter" class="form-control border-0 rounded">
              <option value="">All Niches</option>
              <option v-for="niche in uniqueNiches" :key="niche" :value="niche">{{ niche }}</option>
            </select>
          </div>
          <!-- Reach Filter -->
          <div class="form-group col-md-4 mb-4">
            <label for="reachFilter" class="text-white">Reach: {{ filters.reach }}+</label>
            <input type="range" v-model="filters.reach" min="0" max="100000" step="5000" id="reachFilter" class="form-control-range" />
          </div>
        </div>
      </div>

      <!-- Influencers List Section -->
      <div class="influencers-list w-100 d-flex flex-wrap justify-content-center">
        <div 
          v-for="influencer in filteredInfluencers" 
          :key="influencer.id" 
          class="col-12 col-sm-6 col-md-4 col-lg-3 d-flex justify-content-center"
        >
          <div 
            class="card influencer-card shadow-lg p-4 mb-4 d-flex flex-column align-items-center"
            style="width: 100%; max-width: 300px; border-radius: 20px; background: linear-gradient(to bottom right, #eb3349, #f45c43); color: white;"
          >
            <h4 class="mb-3">{{ influencer.name }}</h4>
            <p><strong>Category:</strong> {{ influencer.category }}</p>
            <p><strong>Niche:</strong> {{ influencer.niche }}</p>
            <p><strong>Reach:</strong> {{ influencer.reach }}</p>
          </div>
        </div>
      </div>

      <!-- No Influencers Found -->
      <div v-if="filteredInfluencers.length === 0" class="w-100 mt-5">
        <p class="text-center text-light">No influencers available based on the selected filters. Please adjust the filters and try again.</p>
      </div>
    </div>
  `,
  data() {
    return {
      influencers: [],
      filters: {
        category: "",
        niche: "",
        reach: 0,
      },
    };
  },
  computed: {
    // Filtering influencers based on the selected filters
    filteredInfluencers() {
      return this.influencers.filter((influencer) => {
        const matchesCategory = this.filters.category ? influencer.category === this.filters.category : true;
        const matchesNiche = this.filters.niche ? influencer.niche === this.filters.niche : true;
        const matchesReach = influencer.reach >= this.filters.reach;

        return matchesCategory && matchesNiche && matchesReach;
      });
    },
    // Getting unique categories for filter options
    uniqueCategories() {
      return [...new Set(this.influencers.map((influencer) => influencer.category))];
    },
    // Getting unique niches for filter options
    uniqueNiches() {
      return [...new Set(this.influencers.map((influencer) => influencer.niche))];
    },
  },
  async mounted() {
    // Fetching all influencers from the backend
    try {
      const response = await fetch(window.location.origin + "/search-influencers", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Authentication-Token": sessionStorage.getItem("token"),
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
};

export default FindInfluencers;