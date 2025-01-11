const StatsAdmin = {
  template: `
    <div class="stats-admin-container container p-5" style="background: linear-gradient(to bottom right, #1e3c72, #2a5298); min-height: 100vh;">
      <h2 class="text-white mb-4">All Campaigns Statistics</h2>

      <!-- Bar Chart Section -->
      <div class="card shadow-sm p-4 mb-4" style="background: #ffffff; border-radius: 15px; height: 400px; max-width: 800px; margin: 0 auto;">
        <h4 class="text-center">Number of Ads per Campaign</h4>
        <div style="position: relative; height: 300px; width: 100%;">
          <canvas id="barChart"></canvas>
        </div>
      </div>

      <!-- Pie Chart Section -->
      <div class="card shadow-sm p-4 mb-4" style="background: #ffffff; border-radius: 15px; height: 400px; max-width: 800px; margin: 0 auto;">
        <h4 class="text-center">Ads Status Distribution</h4>
        <div style="position: relative; height: 300px; width: 100%;">
          <canvas id="pieChart"></canvas>
        </div>
      </div>
    </div>
  `,
  async mounted() {
    const campaignIds = [];
    const campaignNames = [];
    const adsCounts = [];
    const token = sessionStorage.getItem('token');
    const adsStatusCounts = {
      Pending: 0,
      Negotiating: 0,
      Accepted: 0,
      Paid: 0,
    };

    try {
      // Fetching all campaigns
      const campaignsResponse = await fetch(window.location.origin + '/campaign', {
        headers: {
          'Content-Type': 'application/json',
          'Authentication-Token': token,
        },
      });

      if (campaignsResponse.ok) {
        const campaignsData = await campaignsResponse.json();

        // Populating campaign IDs and names
        campaignsData.campaigns.forEach((campaign) => {
          campaignIds.push(campaign.id);
          campaignNames.push(campaign.name);
        });

        // Fetching ads for each campaign and store the count
        for (const campaignId of campaignIds) {
          const adsResponse = await fetch(`${window.location.origin}/campaign/${campaignId}/ads`, {
            headers: {
              'Content-Type': 'application/json',
              'Authentication-Token': token,
            },
          });

          if (adsResponse.ok) {
            const adsData = await adsResponse.json();
            adsCounts.push(adsData.length);

            // Counting ads based on status
            adsData.forEach((ad) => {
              if (adsStatusCounts.hasOwnProperty(ad.status)) {
                adsStatusCounts[ad.status]++;
              }
            });
          } else {
            console.error(`Failed to fetch ads for campaign ${campaignId}:`, adsResponse.status, adsResponse.statusText);
          }
        }

        // Rendering the Bar Chart
        this.renderBarChart(campaignNames, adsCounts);
        // Rendering the Pie Chart
        this.renderPieChart(adsStatusCounts);
      } else {
        console.error('Failed to fetch campaigns:', campaignsResponse.status, campaignsResponse.statusText);
      }
    } catch (error) {
      console.error('Error fetching campaign data:', error);
    }
  },
  methods: {
    renderBarChart(campaignNames, adsCounts) {
      const barChartCanvas = document.getElementById('barChart').getContext('2d');
      
      new Chart(barChartCanvas, {
        type: 'bar',
        data: {
          labels: campaignNames,
          datasets: [
            {
              label: 'Number of Ads',
              data: adsCounts,
              backgroundColor: '#3f87a6', 
              borderColor: '#1e3c72',
              borderWidth: 1,
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          scales: {
            x: {
              beginAtZero: true,
              title: {
                display: true,
                text: 'Campaigns',
              },
            },
            y: {
              beginAtZero: true,
              max: Math.max(...adsCounts) + 2, 
              ticks: {
                stepSize: 1, 
              },
              title: {
                display: true,
                text: 'Number of Ads',
              },
            },
          },
          plugins: {
            legend: {
              display: false,
            },
          },
        },
      });
    },
    renderPieChart(adsStatusCounts) {
      const pieChartCanvas = document.getElementById('pieChart').getContext('2d');
      
      new Chart(pieChartCanvas, {
        type: 'pie',
        data: {
          labels: ['Pending', 'Negotiating', 'Accepted', 'Paid'],
          datasets: [
            {
              data: [
                adsStatusCounts.Pending, 
                adsStatusCounts.Negotiating, 
                adsStatusCounts.Accepted, 
                adsStatusCounts.Paid
              ],
              backgroundColor: ['#FF6347', '#FFA500', '#32CD32', '#4682B4'], 
              borderColor: ['#FF6347', '#FFA500', '#32CD32', '#4682B4'],
              borderWidth: 1,
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              position: 'top',
              labels: {
                color: '#333',
              },
            },
          },
        },
      });
    },
  },
};

export default StatsAdmin;
