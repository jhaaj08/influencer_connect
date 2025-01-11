const ProfilePage = {
    template: `
      <div class="profile-page-container p-5" style="background: linear-gradient(to bottom right, #1e3c72, #2a5298); min-height: 100vh; color: white;">
        <h2 class="mb-4">User Profile</h2>
  
        <!-- Profile Information Section -->
        <div class="profile-info card shadow-sm p-4 mb-4" style="background: linear-gradient(to right, #3f87a6, #ebf8e1); border-radius: 15px;">
          <h4 class="text-dark">Profile Information</h4>
          <p><strong>Name:</strong> {{ user.name }}</p>
          <p><strong>Email:</strong> {{ user.email }}</p>
          <p><strong>Role:</strong> {{ user.roles[0] }}</p>
        </div>
  
        <!-- Password Change Section -->
        <div class="password-change card shadow-sm p-4 mb-4" style="background: linear-gradient(to right, #eb3349, #f45c43); border-radius: 15px;">
          <h4>Change Password</h4>
          <div class="form-group">
            <label for="currentPassword">Current Password</label>
            <input type="password" v-model="passwordForm.currentPassword" id="currentPassword" class="form-control" />
          </div>
          <div class="form-group mt-3">
            <label for="newPassword">New Password</label>
            <input type="password" v-model="passwordForm.newPassword" id="newPassword" class="form-control" />
          </div>
          <div class="form-group mt-3">
            <label for="confirmNewPassword">Confirm New Password</label>
            <input type="password" v-model="passwordForm.confirmNewPassword" id="confirmNewPassword" class="form-control" />
          </div>
          <button class="btn btn-primary mt-4" @click="changePassword">Change Password</button>
        </div>
      </div>
    `,
    data() {
      return {
        user: {},
        passwordForm: {
          currentPassword: '',
          newPassword: '',
          confirmNewPassword: '',
        },
      };
    },
    async mounted() {
      try {
        const response = await fetch(`${window.location.origin}/current_user_info`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authentication-Token': sessionStorage.getItem('token'),
          },
        });
  
        if (response.ok) {
          this.user = await response.json();
        } else {
          console.error('Failed to fetch user profile:', response.status, response.statusText);
        }
      } catch (error) {
        console.error('Error fetching user profile:', error);
      }
    },
    methods: {
      async changePassword() {
        if (this.passwordForm.newPassword !== this.passwordForm.confirmNewPassword) {
          alert('New passwords do not match.');
          return;
        }
  
        try {
          const response = await fetch(`${window.location.origin}/change-password`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authentication-Token': sessionStorage.getItem('token'),
            },
            body: JSON.stringify({
              currentPassword: this.passwordForm.currentPassword,
              newPassword: this.passwordForm.newPassword,
              confirmNewPassword: this.passwordForm.confirmNewPassword,

            }),
          });
  
          if (response.ok) {
            alert('Password changed successfully!');
            this.passwordForm.currentPassword = '';
            this.passwordForm.newPassword = '';
            this.passwordForm.confirmNewPassword = '';
          } else {
            const errorData = await response.json();
            alert(`Error: ${errorData.message}`);
          }
        } catch (error) {
          console.error('Error changing password:', error);
          alert('An error occurred while changing the password.');
        }
      },
    },
  };
  
  export default ProfilePage;
  