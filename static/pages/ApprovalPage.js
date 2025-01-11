const ApprovalPage = {
    template: `
      <div
        class="approval-page-container p-5"
        style="background-image: url('/static/images/background-sponsor.jpg'); background-size: cover; background-position: center; min-height: 100vh; color: white;"
      >
        <h2 class="text-center mb-4" style="color: #FFD700;">Ads Negotiation & Payment Approval</h2>
  
        <!-- Negotiating Ads Section -->
        <div class="card shadow-lg p-4 mb-5" style="border-radius: 15px; background: linear-gradient(to right, #3f87a6, #141e30);">
          <h3 class="text-warning mb-3">Ads in Negotiation</h3>
          <div v-if="negotiatingAds.length > 0" class="ads-list">
            <ul class="list-group">
              <li v-for="ad in negotiatingAds" :key="ad.id" class="list-group-item mb-3 p-3 d-flex justify-content-between align-items-center" style="border-radius: 10px; background: #1e3c72;">
                <div>
                  <strong>Campaign:</strong> {{ ad.campaign_name }} | <strong>Influencer:</strong> {{ ad.influencer_name }} | <strong>Proposed Amount:</strong> {{ ad.negotiation_amount }}
                </div>
                <div>
                  <button class="btn btn-outline-success btn-sm ml-3" @click="acceptAd(ad.id)">Accept</button>
                  <button class="btn btn-outline-danger btn-sm ml-3" @click="rejectAd(ad.id)">Reject</button>
                </div>
              </li>
            </ul>
          </div>
          <div v-else>
            <p class="text-light">No ads available for negotiation.</p>
          </div>
        </div>
  
        <!-- Accepted Ads Section -->
        <div class="card shadow-lg p-4 mb-5" style="border-radius: 15px; background: linear-gradient(to right, #5f2c82, #49a09d);">
          <h3 class="text-warning mb-3">Accepted Ads (Pending Payment)</h3>
          <div v-if="acceptedAds.length > 0" class="ads-list">
            <ul class="list-group">
              <li v-for="ad in acceptedAds" :key="ad.id" class="list-group-item mb-3 p-3 d-flex justify-content-between align-items-center" style="border-radius: 10px; background: #1e3c72;">
                <div>
                  <strong>Campaign:</strong> {{ ad.campaign_name }} | <strong>Influencer:</strong> {{ ad.influencer_name }} | <strong>Amount:</strong> {{ ad.payment_amount }}
                </div>
                <div>
                  <button class="btn btn-outline-primary btn-sm ml-3" @click="payAd(ad.id)">Pay</button>
                </div>
              </li>
            </ul>
          </div>
          <div v-else>
            <p class="text-light">No ads pending payment.</p>
          </div>
        </div>
  
        <!-- Payment Modal -->
        <div class="modal fade" tabindex="-1" role="dialog" ref="paymentModal">
          <div class="modal-dialog" role="document">
            <div class="modal-content">
              <div class="modal-header" style="background: linear-gradient(to bottom right, #3f87a6, #ebf8e1);">
                <h5 class="modal-title" style="color: #1e3c72;">Payment Information</h5>
                <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                  <span aria-hidden="true">&times;</span>
                </button>
              </div>
              <div class="modal-body">
                <div class="form-group">
                  <label for="cardNumber" class="text-dark">Credit Card Number</label>
                  <input v-model="paymentDetails.cardNumber" type="text" class="form-control border-0 rounded" id="cardNumber" placeholder="Enter card number" />
                </div>
                <div class="form-group">
                  <label for="expiryDate" class="text-dark">Expiry Date (MM/YY)</label>
                  <input v-model="paymentDetails.expiryDate" type="text" class="form-control border-0 rounded" id="expiryDate" placeholder="MM/YY" />
                </div>
                <div class="form-group">
                  <label for="cvv" class="text-dark">CVV</label>
                  <input v-model="paymentDetails.cvv" type="password" class="form-control border-0 rounded" id="cvv" placeholder="CVV" />
                </div>
              </div>
              <div class="modal-footer" style="background: linear-gradient(to bottom right, #3f87a6, #ebf8e1);">
                <button type="button" class="btn btn-primary shadow-sm" style="background: #3f87a6; border: none; border-radius: 10px;" @click="completePayment">Pay</button>
                <button type="button" class="btn btn-secondary shadow-sm" data-dismiss="modal">Close</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    `,
    data() {
      return {
        negotiatingAds: [],
        acceptedAds: [],
        paymentDetails: {
          cardNumber: "",
          expiryDate: "",
          cvv: "",
        },
        selectedAdId: null,
      };
    },
    async mounted() {
      await this.fetchNegotiatingAds();
      await this.fetchAcceptedAds();
    },
    methods: {
      async fetchNegotiatingAds() {
        try {
          const response = await fetch(window.location.origin + "/ads/negotiating", {
            headers: {
              "Content-Type": "application/json",
              "Authentication-Token": sessionStorage.getItem("token"),
            },
          });
          if (response.ok) {
            this.negotiatingAds = await response.json();
          } else {
            console.error("Failed to fetch negotiating ads:", response.status, response.statusText);
          }
        } catch (error) {
          console.error("Error fetching negotiating ads:", error);
        }
      },
      async fetchAcceptedAds() {
        try {
          const response = await fetch(window.location.origin + "/ads/accepted", {
            headers: {
              "Content-Type": "application/json",
              "Authentication-Token": sessionStorage.getItem("token"),
            },
          });
          if (response.ok) {
            this.acceptedAds = await response.json();
          } else {
            console.error("Failed to fetch accepted ads:", response.status, response.statusText);
          }
        } catch (error) {
          console.error("Error fetching accepted ads:", error);
        }
      },
      async acceptAd(adId) {
        try {
          const response = await fetch(window.location.origin + `/ads/${adId}/accept`, {
            method: "PATCH",
            headers: {
              "Content-Type": "application/json",
              "Authentication-Token": sessionStorage.getItem("token"),
            },
          });
          if (response.ok) {
            alert("Ad accepted successfully.");
            await this.fetchNegotiatingAds();
            await this.fetchAcceptedAds();
          } else {
            console.error("Failed to accept ad:", response.status, response.statusText);
          }
        } catch (error) {
          console.error("Error accepting ad:", error);
        }
      },
      async rejectAd(adId) {
        try {
          const response = await fetch(window.location.origin + `/ads/${adId}/reject`, {
            method: "PATCH",
            headers: {
              "Content-Type": "application/json",
              "Authentication-Token": sessionStorage.getItem("token"),
            },
          });
          if (response.ok) {
            alert("Ad rejected successfully.");
            await this.fetchNegotiatingAds();
          } else {
            console.error("Failed to reject ad:", response.status, response.statusText);
          }
        } catch (error) {
          console.error("Error rejecting ad:", error);
        }
      },
      payAd(adId) {
        this.selectedAdId = adId;
        $(this.$refs.paymentModal).modal("show");
      },
      async completePayment() {
        if (!this.paymentDetails.cardNumber || !this.paymentDetails.expiryDate || !this.paymentDetails.cvv) {
          alert("Please fill in all payment details.");
          return;
        }
  
        try {
          const response = await fetch(window.location.origin + `/ads/${this.selectedAdId}/pay`, {
            method: "PATCH",
            headers: {
              "Content-Type": "application/json",
              "Authentication-Token": sessionStorage.getItem("token"),
            },
            body: JSON.stringify({
              status: "Paid",
            }),
          });
          if (response.ok) {
            alert("Payment completed successfully.");
            await this.fetchAcceptedAds();
            $(this.$refs.paymentModal).modal("hide");
          } else {
            console.error("Failed to complete payment:", response.status, response.statusText);
          }
        } catch (error) {
          console.error("Error completing payment:", error);
        }
      },
    },
  };
  
  export default ApprovalPage;