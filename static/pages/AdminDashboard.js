import store from '../utils/store.js';

const AdminDashboard = {
  template: `
    <div class="admin-dashboard-container p-5" style="background: linear-gradient(to bottom right, #343a40, #212529); min-height: 100vh; color: white;">
      <h2 class="text-center mb-4" style="color: #FFD700;">Admin Dashboard</h2>

      <!-- Section 1: All Campaigns -->
      <div class="card shadow p-4 mb-5" style="border-radius: 15px; background: linear-gradient(to right, #8ec5fc, #e0c3fc);">
        <h3 class="text-warning mb-3">All Campaigns</h3>
        <div v-if="campaigns.length > 0" class="campaigns-list">
          <ul class="list-group">
            <li v-for="campaign in campaigns" :key="campaign.id" class="list-group-item bg-dark text-white mb-2">
              <strong>Name:</strong> {{ campaign.name }} 
            </li>
          </ul>
        </div>
        <div v-else>
          <p class="text-muted">No campaigns available.</p>
        </div>
      </div>

      <!-- Section 2: All Ad Requests -->
      <div class="card shadow p-4 mb-5" style="border-radius: 15px; background: linear-gradient(to right, #8ec5fc, #e0c3fc);">
        <h3 class="text-warning mb-3">All Ad Requests</h3>
        <div v-if="adRequests.length > 0" class="ad-requests-list">
          <ul class="list-group">
            <li v-for="ad in adRequests" :key="ad.id" class="list-group-item bg-dark text-white mb-2">
              <strong>Campaign:</strong> {{ ad.campaign_name }} | <strong>Influencer:</strong> {{ ad.influencer_name }} | <strong>Status:</strong> {{ ad.status }}
            </li>
          </ul>
        </div>
        <div v-else>
          <p class="text-muted">No ad requests available.</p>
        </div>
      </div>

      <!-- Section 3: Sponsors to be Approved -->
      <div class="card shadow p-4 mb-5" style="border-radius: 15px; background: linear-gradient(to right, #8ec5fc, #e0c3fc);">
        <h3 class="text-warning mb-3">Sponsors Awaiting Approval</h3>
        <div v-if="sponsorsToApprove.length > 0" class="sponsors-list">
          <ul class="list-group">
            <li v-for="sponsor in sponsorsToApprove" :key="sponsor.id" class="list-group-item bg-dark text-white mb-2 d-flex justify-content-between align-items-center">
              <div>
                <strong>Name:</strong> {{ sponsor.name }} | <strong>Email:</strong> {{ sponsor.email }}
              </div>
              <button class="btn btn-outline-success btn-sm ml-3" @click="approveSponsor(sponsor.id)">Approve</button>
            </li>
          </ul>
        </div>
        <div v-else>
          <p class="text-muted">No pending sponsors.</p>
        </div>
      </div>

      <!-- Section 4: All Users (Flag/Unflag) -->
      <div class="card shadow p-4 mb-5" style="border-radius: 15px; background: linear-gradient(to right, #8ec5fc, #e0c3fc);">
        <h3 class="text-warning mb-3">All Users</h3>
        <div v-if="allUsers.length > 0" class="users-list">
          <ul class="list-group">
            <li v-for="user in allUsers" :key="user.id" class="list-group-item bg-dark text-white mb-2 d-flex justify-content-between align-items-center">
              <div>
                <strong>Name:</strong> {{ user.name }} | <strong>Email:</strong> {{ user.email }} | <strong>Role:</strong> {{ user.role }}
              </div>
              <div>
                <button 
                  v-if="user.flag === true" 
                  class="btn btn-outline-success btn-sm ml-3" 
                  @click="toggleFlag(user.id)">Unflag</button>
                <button 
                  v-else 
                  class="btn btn-outline-danger btn-sm ml-3" 
                  @click="toggleFlag(user.id)">Flag</button>
              </div>
            </li>
          </ul>
        </div>
        <div v-else>
          <p class="text-muted">No users available.</p>
        </div>  
      </div>
    </div>
  `,
  data() {
    return {
      campaigns: [],
      adRequests: [],
      sponsorsToApprove: [],
      allUsers: [],
    };
  },
  async mounted() {
    await this.fetchCampaigns();
    await this.fetchAdRequests();
    await this.fetchSponsorsToApprove();
    await this.fetchAllUsers();
  },
  methods: {
    async fetchCampaigns() {
      try {
        const response = await fetch(window.location.origin + '/all-campaigns', {
          headers: {
            'Content-Type': 'application/json',
            'Authentication-Token': sessionStorage.getItem('token'),
          },
        });
        if (response.ok) {
          this.campaigns = await response.json();
        } else {
          console.error('Failed to fetch campaigns:', response.status, response.statusText);
        }
      } catch (error) {
        console.error('Error fetching campaigns:', error);
      }
    },
    async fetchAdRequests() {
      try {
        const response = await fetch(window.location.origin + '/all-ad-requests', {
          headers: {
            'Content-Type': 'application/json',
            'Authentication-Token': sessionStorage.getItem('token'),
          },
        });
        if (response.ok) {
          this.adRequests = await response.json();
        } else {
          console.error('Failed to fetch ad requests:', response.status, response.statusText);
        }
      } catch (error) {
        console.error('Error fetching ad requests:', error);
      }
    },
    async fetchSponsorsToApprove() {
      try {
        const response = await fetch(window.location.origin + '/sponsors-pending', {
          headers: {
            'Content-Type': 'application/json',
            'Authentication-Token': sessionStorage.getItem('token'),
          },
        });
        if (response.ok) {
          this.sponsorsToApprove = await response.json();
        } else {
          console.error('Failed to fetch sponsors pending approval:', response.status, response.statusText);
        }
      } catch (error) {
        console.error('Error fetching sponsors pending approval:', error);
      }
    },
    async fetchAllUsers() {
      try {
        console.log("Fetching all users...");
        const token = sessionStorage.getItem('token');
        if (!token) {
          console.error("No token found in sessionStorage.");
          alert("You must be logged in to access this data.");
          return;
        }
        const response = await fetch(window.location.origin + '/all-users', {
          headers: {
            'Content-Type': 'application/json',
            'Authentication-Token': token,
          },
        });
        if (response.ok) {
          console.log("Successfully fetched all users.");
          this.allUsers = await response.json();
          this.allUsers = this.allUsers.flagged_users;
          console.log("Fetched Users:", this.allUsers);
        } else {
          console.error('Failed to fetch users:', response.status, response.statusText);
        }
      } catch (error) {
        console.error('Error fetching users:', error);
      }
    },
    async approveSponsor(sponsorId) {
      try {
        const response = await fetch(window.location.origin + `/approve-sponsor/${sponsorId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authentication-Token': sessionStorage.getItem('token'),
          },
        });
        if (response.ok) {
          alert('Sponsor approved successfully.');
          await this.fetchSponsorsToApprove(); // Refresh the sponsors list
        } else {
          console.error('Failed to approve sponsor:', response.status, response.statusText);
          alert('Failed to approve sponsor. Please try again.');
        }
      } catch (error) {
        console.error('Error approving sponsor:', error);
        alert('An error occurred. Please try again.');
      }
    },
    async toggleFlag(userId) {
      try {
        const response = await fetch(window.location.origin + `/resolve-flag/${userId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authentication-Token': sessionStorage.getItem('token'),
          },
        });
        if (response.ok) {
          alert('User flag status updated successfully.');
          await this.fetchAllUsers(); // Refreshing the users list
        } else {
          console.error('Failed to update flag status:', response.status, response.statusText);
          alert('Failed to update flag status. Please try again.');
        }
      } catch (error) {
        console.error('Error updating flag status:', error);
        alert('An error occurred. Please try again.');
      }
    },
  },
};

export default AdminDashboard;