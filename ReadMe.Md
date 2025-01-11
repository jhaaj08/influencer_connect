Influencer Engagement & Sponsorship Coordination Platform (IESCP) - V2

## Project Overview

The Influencer Engagement & Sponsorship Coordination Platform (IESCP) is a platform designed to connect **Sponsors** and **Influencers** for seamless collaboration. Sponsors can promote their products/services, while Influencers can gain monetary benefits by leveraging their social media presence.

This platform supports:

- Campaign creation and management by Sponsors.
- Advertisement requests and collaboration between Sponsors and Influencers.
- Admin monitoring and statistics to ensure proper usage and accountability.

## Frameworks Used

This project uses the following mandatory frameworks:

- **SQLite**: For data storage.
- **Flask**: For building APIs.
- **VueJS**: For UI development.
- **Bootstrap**: For HTML generation and styling.
- **Redis**: For caching and background task management.
- **Celery**: For scheduling and executing batch jobs asynchronously.

## Roles

The platform supports three user roles:

1. **Admin**:
   - Root access to monitor all activities.
   - Approves sponsors, flags inappropriate content, and views statistics.
2. **Sponsors**:
   - Create and manage campaigns.
   - Search for influencers and send advertisement requests.
   - Monitor campaign progress and performance.
3. **Influencers**:
   - Manage incoming advertisement requests.
   - Search for campaigns, negotiate terms, and track personal profile visibility.

## Key Features

### Core Functionalities

1. **Authentication and Role-Based Access Control (RBAC):**

   - Login/registration for Admin, Sponsors, and Influencers.
   - Role-based access using Flask security or JWT token-based authentication.

2. **Admin Dashboard:**

   - Statistics on active users, campaigns, flagged accounts, etc.
   - Automatic addition of Admin upon database creation.
   - Sponsor sign-up approval by Admin.

3. **Campaign Management:**

   - Sponsors can create, update, and delete campaigns.
   - Campaigns can be public or private.

4. **Advertisement Request Management:**

   - Sponsors can create and modify ad requests for campaigns.
   - Influencers can accept, reject, or negotiate ad requests.

5. **Search Functionality:**

   - Sponsors can search influencers based on niche, reach, and relevance.
   - Influencers can search public campaigns based on category and budget.

6. **Backend Jobs:**

   - **Daily Reminders:** Notifications for pending ad requests sent via email or Google Chat Webhooks.
   - **Monthly Activity Report:** Auto-generated HTML reports summarizing campaign performance sent via email.
   - **Export Campaigns as CSV:** Sponsors can export campaign data via a batch job and receive alerts once complete.

7. **Performance Optimization:**
   - Implemented caching with Redis for faster response times.
   - Cache expiration for maintaining data accuracy.

## Database Design

The database includes the following key entities and their relationships:

1. **Users:** Stores details for Admins, Sponsors, and Influencers.
2. **Campaigns:** Tracks campaigns created by sponsors with attributes like name, description, start_date, end_date, budget, and visibility.
3. **Ad Requests:** Links campaigns and influencers for ad collaborations.
4. **Profiles:** Influencer-specific details like name, category, niche, and reach.

ER Diagram: Included in the project report.

## Project Execution

1. **Setup Instructions:**

   - Install dependencies listed in `requirements.txt`.
   - Configure Redis and Celery for background jobs.
   - Use SQLite as the database and apply migrations using Flask-Migrate.

2. **Demonstration:**
   - Ensure all features (core and optional) are functional on the local machine.
