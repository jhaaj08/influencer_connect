const Home = {
  template: `
    <div class="home-container vh-100 d-flex align-items-center justify-content-center" 
         style="background: url('/static/images/awesome_background.jpg') no-repeat center center fixed; 
                background-size: cover;">
      <div class="card p-5 shadow-lg" 
           style="width: 400px; border-radius: 15px; background: linear-gradient(to bottom right, #1e3c72, #ff4b2b);">
        <h2 class="text-center mb-4 text-light">Welcome to {{ portalName }}</h2>
        <p class="text-center text-white mb-4">Connect with the best influencers and sponsors to grow your reach and brand.</p>

        <div class="text-center mb-3">
          <router-link to="/login" class="btn btn-outline-primary btn-lg stylish-btn w-100 mb-4">Login</router-link>
          <h5 class="text-light my-3">Or</h5>
          <div class="d-flex justify-content-center align-items-center gap-2">
            <router-link to="/signup-spo" class="btn btn-gradient w-100 stylish-btn mx-1">Signup as Sponsor</router-link>
            <router-link to="/signup-inf" class="btn btn-gradient w-100 stylish-btn mx-1">Signup as Influencer</router-link>
          </div>
        </div>
      </div>
    </div>
  `,
  data() {
    return {
      portalName: "InfluenceConnect"
    };
  },
};

export default Home;