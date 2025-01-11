import Home from "../pages/Home.js";
import Login from "../pages/Login.js";
import SignupInfluencer from "../Pages/SignupInf.js";
import SignupSponsor from "../Pages/SignupSpo.js";
import SponsorDashboard from "../pages/SponsorDashboard.js";
import CampaignForm from "../pages/CampaignForm.js";
import AdComponent from "../components/AdComponent.js";
import AdFormComponent from "../pages/AdFormComponent.js";
import FindInfluencerComponent from "../pages/FIndInfluencerComponent.js";
import InfluencerDashboard from "../pages/InfluencerDashboard.js";
import EditCampaign from "../pages/EditCampaign.js";
import FindInfluencers from "../pages/FindInfluencers.js";
import NegotiatingAds from "../pages/NegotatingAds.js";
import StatsSponsor from "../pages/StatsSponsor.js";
import StatsAdmin from "../pages/StatsAdmin.js";
import AdminDashboard from "../pages/AdminDashboard.js";
import FindCampaigns from "../pages/FindCampaigns.js";
import ApprovalPage from "../pages/ApprovalPage.js";
import ProfilePage from "../pages/ProfilePage.js";


const routes = [
    {path: '/', component: Home},
    {path: '/login', component: Login},
    {path: '/signup-inf', component: SignupInfluencer},
    {path: '/signup-spo', component: SignupSponsor},
    {path: '/dashboard-sponsor', component: SponsorDashboard},
    {path: '/add-campaign', component: CampaignForm},
    { path: "/campaign/:id", component: AdComponent },
    {path: "/campaign/:id/add-ad", component: AdFormComponent},
    {path: "/select-influencer", component: FindInfluencerComponent},
    {path: "/dashboard-influencer", component: InfluencerDashboard},
    {path: "/dashboard-admin", component: AdminDashboard},
    {path: "/edit-campaign/:id", component: EditCampaign},
    {path: "/find-influencers", component: FindInfluencers},
    {path: "/negotiations", component: NegotiatingAds},
    {path: "/stats-sponsor", component: StatsSponsor},
    {path: "/stats-admin", component: StatsAdmin},
    {path: "/find-campaigns", component: FindCampaigns},
    {path: "/approval-page", component: ApprovalPage},
    {path: "/profile-page", component: ProfilePage},
];

const router = new VueRouter({
    routes,
  });
  
export default router;