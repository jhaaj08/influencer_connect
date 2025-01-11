const CampaignComponent = {
  template: `
    <div class="card shadow-sm p-4 mb-4 campaign-card">
      <div class="card-body d-flex flex-column">
        <h3 class="card-title text-light">{{ name }}</h3>
        <p class="card-text text-light campaign-description">{{ description }}</p>
        <div class="campaign-dates mt-3 text-light">
          <small>Start Date: {{ formattedStartDate }}</small><br>
          <small>End Date: {{ formattedEndDate }}</small>
        </div>
        <div class="button-container mt-4 d-flex flex-wrap justify-content-between">
          <button class="btn btn-warning btn-margin" @click="editCampaign">Edit Campaign</button>
          <button class="btn btn-danger btn-margin delete-button" @click="deleteCampaign">Delete Campaign</button>
        </div>
      </div>
    </div>
  `,
  props: {
    id: {
      type: Number,
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    startDate: {
      type: String,
      required: false,
      default: "N/A",
    },
    endDate: {
      type: String,
      required: false,
      default: "N/A",
    },
  },
  computed: {
    formattedStartDate() {
      return this.formatDate(this.startDate);
    },
    formattedEndDate() {
      return this.formatDate(this.endDate);
    },
  },
  methods: {
    addAd() {
      // Redirecting to add ad page for this campaign
      this.$router.push(`/campaign/${this.id}/add-ad`);
    },
    editCampaign() {
      // Redirecting to edit campaign page for this campaign
      this.$router.push(`/campaign/${this.id}`);
    },
    async deleteCampaign() {
      try {
        // Sending a request to delete the campaign
        const response = await fetch(window.location.origin + `/delete-campaign/${this.id}`, {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
            'Authentication-Token': sessionStorage.getItem('token'),
          },
        });

        if (response.ok) {
          alert('Campaign deleted successfully');
          // Emiting the 'campaign-deleted' event with the campaign ID
          this.$emit('campaign-deleted', this.id);
          this.$router.push("/dashboard-sponsor");
        } else {
          console.error('Failed to delete campaign:', response.status, response.statusText);
          alert('Failed to delete campaign. Please try again.');
        }
      } catch (error) {
        console.error('Error deleting campaign:', error);
        alert('An error occurred. Please try again.');
      }
    },
    formatDate(dateString) {
      if (!dateString || dateString === "N/A") return "Not Available";
      const date = new Date(dateString);
      return date.toLocaleDateString('en-GB'); // Formating as dd/mm/yyyy
    },
  },
  created() {
    const style = document.createElement("style");
    style.textContent = `
      .campaign-card {
        width: 320px;  
        height: auto; 
        margin: 15px;
        padding: 20px;
        border-radius: 15px;
        overflow: hidden;
        transition: transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out;
        background: linear-gradient(to bottom right, #1e3c72, #2a5298, #ff5f6d);
      }
      .campaign-card:hover {
        transform: scale(1.05);
        box-shadow: 0 10px 20px rgba(0, 0, 0, 0.15);
      }
      .card-body {
        display: flex;
        flex-direction: column;
        height: 100%;
      }
      .campaign-description {
        font-size: 0.9em;
        max-height: 60px;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: normal;
      }
      .campaign-dates {
        margin-top: auto;
        font-size: 0.8em;
      }
      .button-container {
        margin-top: 20px;
      }
      .btn-margin {
        margin: 5px 5px 5px 0; /* Adding margin around buttons to prevent overlap */
        flex: 1;
        white-space: nowrap;
        font-size: 0.8em; /* Adjusted for smaller button text */
      }
      .delete-button {
        margin-left: auto; /* Ensure the delete button is always aligned to the right */
      }
    `;
    document.head.appendChild(style);
  },
};

export default CampaignComponent;