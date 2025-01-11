from flask import render_template, request, jsonify, render_template_string, session
from flask_security import auth_required,roles_required, SQLAlchemyUserDatastore, logout_user, login_user, current_user,roles_accepted
from flask_security.utils import hash_password, verify_password
from extensions import db, cache
from models import Campaign, AdRequest, User, Role
from datetime import datetime
from sqlalchemy.exc import SQLAlchemyError
from tasks import generate_campaign_csv
import uuid

def create_view(app, user_datastore: SQLAlchemyUserDatastore, cache):

    @app.route('/logout', methods=['POST'])
    def logout():
        logout_user()
        session.clear()  
        return jsonify({"message": "Logged out successfully"}), 200

    @app.route('/')
    def home():
        return render_template("index.html")
    
    @app.route('/user-login', methods=['POST'])
    def user_login():
        # Log in a user
        data = request.get_json()
        email = data.get('email')
        password = data.get('password')

        user = user_datastore.find_user(email=email)

        # Check if the user exists
        if not user:
            return jsonify({
                "meta": {"code": 400},
                "response": {
                    "errors": ["Invalid email"],
                    "field_errors": {"email": ["Invalid email"]}
                }
            }), 400

        # Verify password
        if not verify_password(password, user.password):
            return jsonify({
                "meta": {"code": 400},
                "response": {
                    "errors": ["Invalid password"],
                    "field_errors": {"password": ["Invalid password"]}
                }
            }), 400

        # Generate an authentication token
        token = user.get_auth_token()
        login_user(user)

        # Update last login time
        if user and verify_password(password, user.password):
            user.last_login = datetime.now()
            db.session.commit()

        return jsonify({
            "token": token,
            "role": user.roles[0].name,
            "id": user.id,
            "email": user.email,
            "flag": user.flag,
            "active": user.active,
        }), 200
    
    @app.route('/campaign', methods=['POST'])
    @auth_required()
    @roles_required('sponsor')
    def create_campaign():
        data = request.get_json()
        name = data.get('name')
        description = data.get('description')
        start_date = data.get('start_date')
        end_date = data.get('end_date')
        budget = data.get('budget')
        visibility = data.get('visibility', 'public')
        goals = data.get('goals')
        niche = data.get('niche')

        if not all([name, start_date, end_date, budget]):
            return jsonify({"message": "Missing required fields"}), 400

        campaign = Campaign(
            sponsor_id=current_user.id,
            name=name,
            description=description,
            start_date=datetime.strptime(start_date, '%Y-%m-%d'),
            end_date=datetime.strptime(end_date, '%Y-%m-%d'),
            budget=budget,
            visibility=visibility,
            goals=goals,
            niche=niche
        )
        db.session.add(campaign)
        db.session.commit()

        cache.delete(f"user_campaigns_{current_user.id}")

        return jsonify({"message": "Campaign created successfully", "campaign_id": campaign.id}), 201

    @app.route('/all-campaigns', methods=['GET'])
    @auth_required()
    @roles_accepted('admin', 'sponsor')
    def get_all_campaigns():
        try:
            campaigns = Campaign.query.all()  # Gets all campaigns
            campaign_list = [{
                "id": campaign.id,
                "name": campaign.name,
                "description": campaign.description,
                "budget": campaign.budget,
                "visibility": campaign.visibility,
                "start_date": campaign.start_date,
                "end_date": campaign.end_date,
            } for campaign in campaigns]
            return jsonify(campaign_list), 200
        except Exception as e:
            return jsonify({"error": "Failed to fetch campaigns."}), 500

    @app.route('/campaign', methods=['GET'])
    @auth_required()
    def get_campaigns():
        """
        Endpoint to get all campaigns associated with the logged-in user (if sponsor)
        or all campaigns (if admin).
        """
        try:
            # Get campaigns for the current user if they're a sponsor
            campaigns = Campaign.query.all()

            # Prepare campaign list for response
            campaign_list = [{
                "id": campaign.id,
                "name": campaign.name,
                "description": campaign.description,
                "budget": campaign.budget,
                "visibility": campaign.visibility,
                "start_date": campaign.start_date.strftime("%Y-%m-%d"),
                "end_date": campaign.end_date.strftime("%Y-%m-%d"),
                "goals": campaign.goals,
                "niche": campaign.niche
            } for campaign in campaigns]

            return jsonify({"campaigns": campaign_list}), 200

        except Exception as e:
            print(f"Error fetching campaigns: {e}")
            return jsonify({"message": "An error occurred while fetching campaigns"}), 500


    @app.route('/campaign/<int:id>/create-ad', methods=['POST'])
    @auth_required()
    @roles_required('sponsor')
    def create_ad_request(id):
        print("Entered create_ad_request function") 
        data = request.get_json()
        print(data)
        campaign_id = id
        influencer_id = data.get('influencer_id')
        requirements = data.get('requirements')
        payment_amount = data.get('paymentAmount')

        if not all([campaign_id, influencer_id, requirements, payment_amount]):
            return jsonify({"message": "Missing required fields"}), 400

        if not isinstance(payment_amount, (int, float)) or payment_amount <= 0:
            return jsonify({"message": "Invalid payment amount"}), 400

        try:
            ad_request = AdRequest(
                campaign_id=campaign_id,
                influencer_id=influencer_id,
                requirements=requirements,
                payment_amount=payment_amount,
            )
            db.session.add(ad_request)
            db.session.commit()

            return jsonify({"message": "Ad request created successfully", "ad_request_id": ad_request.id}), 201

        except SQLAlchemyError as e:
            db.session.rollback()
            print(f"Error while creating ad request: {str(e)}")
            return jsonify({"message": "An error occurred while creating the ad request"}), 500
        
    @app.route('/campaign/<int:campaign_id>/ads', methods=['GET'])
    @auth_required()
    def get_campaign_ads(campaign_id):
        """
        Get all ads associated with a specific campaign.
        """
        try:
            # Fetch the campaign using the provided campaign ID
            campaign = Campaign.query.get(campaign_id)

            if not campaign:
                return jsonify({'message': 'Campaign not found'}), 404


            # Fetch all ads associated with the given campaign ID
            ads = AdRequest.query.filter_by(campaign_id=campaign_id).all()
            
            # Prepare the response data for each ad
            ads_data = []
            for ad in ads:
                influencer = User.query.get(ad.influencer_id)
                influencer_name = influencer.name if influencer else "Unknown"
                
                ads_data.append({
                    'id': ad.id,
                    'influencer_name': influencer_name,
                    'status': ad.status,
                    'requirements': ad.requirements,
                    'payment_amount': ad.payment_amount,
                })

            return jsonify(ads_data), 200

        except Exception as e:
            print(f"Error fetching ads for campaign {campaign_id}: {e}")
            return jsonify({"message": "An error occurred while fetching ads"}), 500  

    @app.route('/influencer/ads', methods=['GET'])
    @auth_required()  # Ensures the user is logged in
    @roles_required('influencer')  # Ensures the user has the role of 'influencer'
    def get_influencer_ads():
        """
        Get all ads assigned to the logged-in influencer.
        """
        try:
            # Get the current user's ID
            influencer_id = current_user.id

            # Query for all ads where the influencer is tagged
            ads = AdRequest.query.filter_by(influencer_id=influencer_id).all()

            # Prepare the response data
            ad_data = []
            for ad in ads:
                # Assuming there is a relationship to fetch campaign information
                campaign_name = ad.related_campaign.name if ad.related_campaign else "N/A"
                ad_data.append({
                    'id': ad.id,
                    'campaign_name': campaign_name,
                    'status': ad.status,
                    'requirements': ad.requirements,
                    'payment_amount': ad.payment_amount,
                    'negotiation_amount': ad.negotiation_amount,
                })

            return jsonify(ad_data), 200

        except Exception as e:
            print(f"Error fetching ads for influencer {influencer_id}: {e}")
            return jsonify({'error': 'An error occurred while fetching ads.'}), 500

    @app.route('/ads/pending', methods=['GET'])
    @auth_required()  # Ensures the user is logged in
    @roles_required('influencer')  # Ensures the user has the role of 'influencer'
    def get_pending_ads():
        """
        Get all pending ads for the logged-in influencer.
        """
        try:
            # Get the current user's ID
            influencer_id = current_user.id

            # Query for all ads where the influencer is tagged but the status is 'Pending'
            ads = AdRequest.query.filter_by(influencer_id=influencer_id, status='Pending').all()

            # Prepare the response data
            ad_data = []
            for ad in ads:
                # Assuming there is a relationship to fetch campaign information
                campaign_name = ad.related_campaign.name if ad.related_campaign else "N/A"
                ad_data.append({
                    'id': ad.id,
                    'campaign_name': campaign_name,
                    'status': ad.status,
                    'requirements': ad.requirements,
                    'payment_amount': ad.payment_amount,
                    'negotiation_amount': ad.negotiation_amount,
                })

            return jsonify(ad_data), 200

        except Exception as e:
            print(f"Error fetching pending ads for influencer {influencer_id}: {e}")
            return jsonify({'error': 'An error occurred while fetching pending ads.'}), 500

    @app.route('/ads/<int:ad_id>/action', methods=['PATCH'])
    @auth_required()  # Ensures the user is logged in
    @roles_required('influencer')  # Ensures the user has the role of 'influencer'
    def action_on_ad(ad_id):
        """
        Perform an action on a specific ad (accept, reject, or negotiate).
        """
        try:
            # Parse the request data
            data = request.get_json()
            action = data.get('action')

            # Fetch the ad request by ID
            ad_request = AdRequest.query.get(ad_id)
            if not ad_request:
                return jsonify({'message': 'Ad not found'}), 404

            # Perform the specified action
            if action == 'accept':
                ad_request.status = 'Accepted'
            elif action == 'reject':
                ad_request.status = 'Rejected'
            elif action == 'negotiate':
                new_amount = data.get('negotiation_amount')
                if new_amount is None:
                    return jsonify({'message': 'Negotiation amount required'}), 400
                ad_request.status = 'Negotiating'
                ad_request.negotiation_amount = new_amount
            else:
                return jsonify({'message': 'Invalid action'}), 400

            # Commit the changes to the database
            db.session.commit()
            return jsonify({'message': f'Ad request {action} successfully'}), 200

        except Exception as e:
            print(f"Error performing action on ad {ad_id}: {e}")
            return jsonify({'error': 'An error occurred while performing the action on the ad.'}),    

    @app.route('/ads/<int:ad_id>/negotiate', methods=['PUT'])
    @auth_required()  # Ensures the user is logged in
    @roles_required('influencer')  # Ensures the user has the role of 'influencer'
    def negotiate_ad(ad_id):
        """
        Negotiate a specific ad by updating the negotiation amount.
        """
        try:
            # Parse the request data
            data = request.get_json()
            new_amount = data.get('negotiation_amount')

            # Fetch the ad request by ID
            ad_request = AdRequest.query.get(ad_id)
            if not ad_request:
                return jsonify({'message': 'Ad not found'}), 404

            # Ensure that the negotiation amount is provided
            if new_amount is None:
                return jsonify({'message': 'Negotiation amount required'}), 400

            # Update the ad request with the new negotiation amount
            ad_request.status = 'Negotiating'
            ad_request.negotiation_amount = new_amount
            ad_request.influencer_id = current_user.id
            # Commit the changes to the database
            db.session.commit()
            return jsonify({'message': 'Negotiation amount updated successfully'}), 200

        except Exception as e:
            print(f"Error negotiating ad {ad_id}: {e}")
            return jsonify({'error': 'An error occurred while negotiating the ad.'}), 500

    @app.route('/ads/open', methods=['GET'])
    @auth_required()  # Ensures the user is logged in
    @roles_required('influencer')  # Ensures the user has the role of 'influencer'
    def get_open_ads():
        """
        Get all open ads that do not have an influencer assigned or have been rejected.
        """
        try:
            # Query for all ads where no influencer is tagged (open ads) or where the status is 'Rejected'
            ads = AdRequest.query.filter((AdRequest.influencer_id == None) | (AdRequest.status == 'Rejected')).all()

            # Prepare the response data
            ad_data = []
            for ad in ads:
                # Assuming there is a relationship to fetch campaign information
                campaign_name = ad.related_campaign.name if ad.related_campaign else "N/A"
                ad_data.append({
                    'id': ad.id,
                    'campaign_name': campaign_name,
                    'status': ad.status,
                    'requirements': ad.requirements,
                    'payment_amount': ad.payment_amount,
                    'negotiation_amount': ad.negotiation_amount,
                })

            return jsonify(ad_data), 200

        except Exception as e:
            print(f"Error fetching open ads: {e}")
            return jsonify({'error': 'An error occurred while fetching open ads.'}), 500

    # Route to delete an ad request
    @app.route('/ad-request/<int:id>', methods=['DELETE'])
    @auth_required()  # Ensuring the user is authenticated
    @roles_required('sponsor')  # Only sponsors are allowed to delete an ad request
    def delete_ad_request(id):
        try:
            # Fetch the ad request using the provided ID
            ad_request = AdRequest.query.get_or_404(id)

            # Delete the ad request
            db.session.delete(ad_request)
            db.session.commit()

            return jsonify({"message": "Ad request deleted successfully"}), 200
        
        except SQLAlchemyError as e:
            db.session.rollback()
            print(f"Error while deleting ad request: {str(e)}")
            return jsonify({"message": "An error occurred while deleting the ad request"}), 500


    @app.route('/register-influencer', methods=['POST'])
    def register_influencer():
        """
        Register a new influencer with the provided details.
        """
        try:
            # Parse the request data
            data = request.get_json()
            email = data.get('email')
            password = data.get('password')
            name = data.get('name')
            category = data.get('category')
            niche = data.get('niche')
            reach = data.get('reach')

            # Validate required fields
            if not email or not password or not name or not category:
                return jsonify({'message': 'Missing required fields'}), 400

            # Check if the user already exists
            existing_user = User.query.filter_by(email=email).first()
            if existing_user:
                return jsonify({'message': 'User already exists'}), 409

            # Create a new influencer user
            influencer_role = Role.query.filter_by(name='influencer').first()
            new_user = User(
                email=email,
                password=hash_password(password),
                name=name,
                category=category,
                niche=niche,
                reach=reach,
                active=True,  # Influencer is active by default
                fs_uniquifier=str(uuid.uuid4())  # Generate a unique value for fs_uniquifier
            )
            new_user.roles.append(influencer_role)

            # Add the new user to the database
            db.session.add(new_user)
            db.session.commit()

            return jsonify({'message': 'Influencer registered successfully'}), 201

        except Exception as e:
            print(f"Error registering influencer: {e}")
            return jsonify({'error': 'An error occurred while registering the influencer.'}), 500


    @app.route('/approve-sponsor/<int:user_id>', methods=['PUT'])
    @auth_required()  # Ensures the user is logged in
    @roles_required('admin')  # Ensures the user has the role of 'admin'
    def approve_sponsor(user_id):
        """
        Approve a sponsor by setting their active status to True.
        """
        try:
            # Fetch the user by ID
            user = User.query.get(user_id)
            if not user:
                return jsonify({'message': 'User not found'}), 404

            # Ensure the user is a sponsor
            if not any(role.name == 'sponsor' for role in user.roles):
                return jsonify({'message': 'User is not a sponsor'}), 400

            # Update the active status to True
            user.active = True

            # Commit the changes to the database
            db.session.commit()
            return jsonify({'message': 'Sponsor approved successfully'}), 200

        except Exception as e:
            print(f"Error approving sponsor {user_id}: {e}")
            return jsonify({'error': 'An error occurred while approving the sponsor.'}), 500


    @app.route('/ad-request/<int:id>', methods=['PUT'])
    @auth_required()
    @roles_required('sponsor')
    def update_ad_request(id):
        """
        Update the ad request with the specified ID.
        """
        try:
            # Fetch the ad request by ID
            ad_request = AdRequest.query.get_or_404(id)

            # Ensure the current user is the sponsor of the related campaign
            campaign = Campaign.query.get(ad_request.campaign_id)
            if campaign.sponsor_id != current_user.id:
                return jsonify({"message": "Unauthorized"}), 403

            # Parse request data
            data = request.get_json()

            # Update fields if provided in the request
            ad_request.requirements = data.get('requirements', ad_request.requirements)
            ad_request.payment_amount = data.get('payment_amount', ad_request.payment_amount)
            ad_request.status = data.get('status', ad_request.status)

            # Commit changes to the database
            db.session.commit()

            return jsonify({"message": "Ad request updated successfully"}), 200

        except SQLAlchemyError as e:
            # Rollback in case of an error
            db.session.rollback()
            print(f"Error while updating ad request: {str(e)}")
            return jsonify({"message": "An error occurred while updating the ad request"}), 500
        except Exception as e:
            print(f"General error while updating ad request: {str(e)}")
            return jsonify({"message": "An unexpected error occurred"}), 500      

    @app.route('/campaign/<int:id>', methods=['PUT'])
    @auth_required()
    @roles_required('sponsor')
    def update_campaign(id):
        campaign = Campaign.query.get_or_404(id)
        if campaign.sponsor_id != current_user.id:
            return jsonify({"message": "Unauthorized"}), 403

        data = request.get_json()
        campaign.name = data.get('name', campaign.name)
        campaign.description = data.get('description', campaign.description)
        campaign.start_date = datetime.strptime(data.get('start_date', campaign.start_date.strftime('%Y-%m-%d')), '%Y-%m-%d')
        campaign.end_date = datetime.strptime(data.get('end_date', campaign.end_date.strftime('%Y-%m-%d')), '%Y-%m-%d')
        campaign.budget = data.get('budget', campaign.budget)
        campaign.visibility = data.get('visibility', campaign.visibility)
        campaign.goals = data.get('goals', campaign.goals)
        campaign.niche = data.get('niche', campaign.niche)

        db.session.commit()
        return jsonify({"message": "Campaign updated successfully"}), 200

    @app.route('/delete-campaign/<int:id>', methods=['DELETE'])
    @auth_required()
    @roles_required('sponsor')
    def delete_campaign(id):
        campaign = Campaign.query.get_or_404(id)
        if campaign.sponsor_id != current_user.id:
            return jsonify({"message": "Unauthorized"}), 403

        db.session.delete(campaign)
        db.session.commit()
        cache.delete(f"user_campaigns_{current_user.id}")
        return jsonify({"message": "Campaign deleted successfully"}), 200
    
    @app.route('/export-campaigns', methods=['POST'])
    @auth_required()
    def export_campaigns():
        try:
            # Get the current user ID using Flask-Security's `current_user`
            user_id = current_user.id

            # Use Celery to handle the generation of the CSV file asynchronously
            result = generate_campaign_csv.apply_async(args=[user_id])

            # Respond to the client indicating that the job has been started
            return jsonify({
                "message": "Export job has been started",
                "task_id": result.id
            }), 202

        except Exception as e:
            return jsonify({"error": "Failed to trigger export job"}), 500
    
    # Route to get current user information
    @app.route('/current_user_info', methods=['GET'])
    @auth_required()  # Ensure the user is authenticated to access this endpoint
    def get_current_user_info():
        if current_user.is_authenticated:
            user_info = {
                "id": current_user.id,
                "email": current_user.email,
                "name": current_user.name,
                "roles": [role.name for role in current_user.roles],
                "category": getattr(current_user, 'category', None),
                "niche": getattr(current_user, 'niche', None),
                "reach": getattr(current_user, 'reach', None),
                "company_name": getattr(current_user, 'company_name', None),
                "industry": getattr(current_user, 'industry', None),
                "budget": getattr(current_user, 'budget', None),
            }
            return jsonify(user_info), 200
        else:
            return jsonify({"message": "User is not authenticated"}), 401

    # Route to change user's password
    @app.route('/change-password', methods=['POST'])
    @auth_required()  # Ensure the user is authenticated to access this endpoint
    def change_password():
        try:
            data = request.get_json()
            print(data)
            old_password = data.get('currentPassword')
            new_password = data.get('newPassword')
            confirm_password = data.get('confirm_password')

            if not old_password or not new_password:
                return jsonify({"message": "All fields are required."}), 400
            
            # Verify old password
            if not verify_password(old_password, current_user.password):
                return jsonify({"message": "Old password is incorrect."}), 401

            # Update password
            current_user.password = hash_password(new_password)
            db.session.commit()

            return jsonify({"message": "Password updated successfully."}), 200
        except Exception as e:
            print(f"Error changing password: {str(e)}")
            return jsonify({"message": "An error occurred while changing the password."}), 500


    @app.route('/public-campaigns', methods=['GET'])
    @cache.cached(timeout=60 * 60)  # Cache public campaigns for 1 hour
    def get_public_campaigns():
        try:
            niche_filter = request.args.get('niche', None)

            query = Campaign.query.filter_by(visibility='public')
            
            if niche_filter:
                query = query.filter(Campaign.niche.ilike(f"%{niche_filter}%"))
            
            public_campaigns = query.all()

            campaigns_data = [
                {
                    'id': campaign.id,
                    'name': campaign.name,
                    'description': campaign.description,
                    'budget': campaign.budget,
                    'start_date': campaign.start_date.strftime('%Y-%m-%d'),
                    'end_date': campaign.end_date.strftime('%Y-%m-%d'),
                    'niche': campaign.niche,
                    'visibility': campaign.visibility
                } for campaign in public_campaigns
            ]
            
            return jsonify({'public_campaigns': campaigns_data}), 200
        except Exception as e:
            print(f"Error occurred while fetching public campaigns: {e}")
            return jsonify({'error': 'Failed to fetch public campaigns'}), 500

    @app.route('/search-influencers', methods=['GET'])
    @roles_required('sponsor')
    @cache.cached(timeout=60 * 60)  # Cache influencer search results for 1 hour
    def search_influencers():
        niche = request.args.get('niche')
        reach_min = request.args.get('reach_min')

        try:
            if reach_min is None or reach_min == "":
                reach_min = 0
            else:
                reach_min = int(reach_min)

            query = User.query.filter(User.roles.any(Role.name == 'influencer'))

            if niche:
                query = query.filter(User.niche == niche)

            query = query.filter(User.reach >= reach_min)

            influencers = query.all()

            return jsonify([{
                "id": influencer.id,
                "name": influencer.name,
                "niche": influencer.niche,
                "reach": influencer.reach,
                "category": influencer.category
            } for influencer in influencers]), 200

        except ValueError:
            return jsonify({"message": "Invalid reach value. It must be a number."}), 400
        except Exception as e:
            print(f"Error during search influencers: {e}")
            return jsonify({"message": "Error in searching influencers"}), 500

    @app.route('/my-campaigns', methods=['GET'])
    @auth_required()
    @cache.cached(timeout=60 * 5,key_prefix=lambda: f"user_campaigns_{current_user.id}") 
    def get_user_campaigns():
        user_id = current_user.id
        campaigns = Campaign.query.filter_by(sponsor_id=user_id).all()

        campaigns_list = [{
            "id": campaign.id,
            "name": campaign.name,
            "description": campaign.description,
            "budget": campaign.budget,
            "visibility": campaign.visibility,
            "end_date": campaign.end_date,
            "start_date": campaign.start_date,
        } for campaign in campaigns]

        return jsonify({"campaigns": campaigns_list}), 200
    
    

    @app.route('/campaign/<int:campaign_id>', methods=['GET'])
    @auth_required()
    @cache.cached(timeout=60 * 5)
    def get_campaign_details(campaign_id):
        campaign = Campaign.query.get(campaign_id)
        
        if not campaign:
            return jsonify({'message': 'Campaign not found'}), 404
        
        if campaign.sponsor_id != current_user.id:
            return jsonify({'message': 'Unauthorized'}), 403

        campaign_data = {
            'id': campaign.id,
            'name': campaign.name,
            'description': campaign.description,
            'start_date': campaign.start_date.strftime("%Y-%m-%d"),
            'end_date': campaign.end_date.strftime("%Y-%m-%d"),
            'budget': campaign.budget,
            'visibility': campaign.visibility,
            'goals': campaign.goals,
            'niche': campaign.niche,
        }
        return jsonify(campaign_data), 200

    @app.route('/influencers', methods=['GET'])
    @auth_required()
    @cache.cached(timeout=60 * 60)  
    def get_all_influencers():
        try:
            influencers = User.query.join(User.roles).filter_by(name='inf').all()

            influencer_list = [
                {
                    'id': influencer.id,
                    'name': influencer.name,
                    'category': influencer.category,
                    'reach': influencer.reach,
                } for influencer in influencers
            ]

            return jsonify(influencer_list), 200
        except Exception as e:
            print("Error fetching influencers:", str(e))
            return jsonify({'message': 'Error fetching influencer details'}), 500

    @app.route('/ads/negotiating', methods=['GET'])
    def get_negotiating_ads():
        try:
            negotiating_ads = AdRequest.query.filter_by(status='Negotiating').all()
            ads_list = [
                {
                    "id": ad.id,
                    "requirements": ad.requirements,
                    "payment_amount": ad.payment_amount,
                    "negotiation_amount": ad.negotiation_amount,
                    "status": ad.status,
                } for ad in negotiating_ads
            ]
            return jsonify(ads_list), 200
        except Exception as e:
            print(f"Error fetching negotiating ads: {e}")
            return jsonify({"error": "Unable to fetch negotiating ads."}), 500

    @app.route('/ads/accepted', methods=['GET'])
    def get_accepted_ads():
        try:
            accepted_ads = AdRequest.query.filter_by(status='Accepted').all()
            ads_list = [
                {
                    "id": ad.id,
                    "requirements": ad.requirements,
                    "payment_amount": ad.payment_amount,
                    "negotiation_amount": ad.negotiation_amount,
                    "status": ad.status,
                } for ad in accepted_ads
            ]
            return jsonify(ads_list), 200
        except Exception as e:
            print(f"Error fetching accepted ads: {e}")
            return jsonify({"error": "Unable to fetch accepted ads."}), 500
        
    @app.route('/ads/<int:ad_id>/accept', methods=['PATCH'])
    @auth_required()  # Ensures the user is logged in
    @roles_required('sponsor') 
    def accept_ad(ad_id):
        """
        Accept a specific ad by setting its status to 'Accepted'.
        """
        try:
            # Fetch the ad request by ID
            ad_request = AdRequest.query.get(ad_id)
            if not ad_request:
                return jsonify({'message': 'Ad not found'}), 404

            # Update the status to 'Accepted'
            ad_request.status = 'Accepted'

            # Commit the changes to the database
            db.session.commit()
            return jsonify({'message': 'Ad request accepted successfully'}), 200

        except Exception as e:
            print(f"Error accepting ad {ad_id}: {e}")
            return jsonify({'error': 'An error occurred while accepting the ad.'}), 500

    @app.route('/register-sponsor', methods=['POST'])
    def register_sponsor():
        """
        Register a new sponsor with the provided details.
        """
        try:
            # Parse the request data
            data = request.get_json()
            email = data.get('email')
            password = data.get('password')
            name = data.get('name')
            company_name = data.get('company_name')
            industry = data.get('industry')
            budget = data.get('budget')

            # Validate required fields
            if not email or not password or not company_name:
                return jsonify({'message': 'Missing required fields'}), 400

            # Check if the user already exists
            existing_user = User.query.filter_by(email=email).first()
            if existing_user:
                return jsonify({'message': 'User already exists'}), 409

            # Create a new sponsor user
            sponsor_role = Role.query.filter_by(name='sponsor').first()
            new_user = User(
                email=email,
                password=hash_password(password),
                name=name,
                company_name=company_name,
                industry=industry,
                budget=budget,
                active=False,  # Initially inactive, needs admin approval
                fs_uniquifier=str(uuid.uuid4())  # Generate a unique value for fs_uniquifier
            )
            new_user.roles.append(sponsor_role)

            # Add the new user to the database
            db.session.add(new_user)
            db.session.commit()

            return jsonify({'message': 'Sponsor registered successfully'}), 201
        except Exception as e:
            print(f"Error registering sponsor: {e}")
            return jsonify({'error': 'An error occurred while registering the sponsor.'}), 500
                

    @app.route('/ads/<int:ad_id>/pay', methods=['PATCH'])
    @auth_required()  # Ensures the user is logged in
    @roles_required('sponsor')  # Ensures the user has the role of 'sponsor'
    def pay_ad(ad_id):
        """
        Pay for a specific ad by updating its status to 'Paid'.
        """
        try:
            # Fetch the ad request by ID
            ad_request = AdRequest.query.get(ad_id)
            if not ad_request:
                return jsonify({'message': 'Ad not found'}), 404

            # Ensure that the ad is in 'Accepted' status before paying
            if ad_request.status != 'Accepted':
                return jsonify({'message': 'Ad must be in Accepted status to be paid'}), 400

            # Update the status to 'Paid'
            ad_request.status = 'Paid'

            # Commit the changes to the database
            db.session.commit()
            return jsonify({'message': 'Ad request paid successfully'}), 200

        except Exception as e:
            print(f"Error paying for ad {ad_id}: {e}")
            return jsonify({'error': 'An error occurred while paying for the ad.'}), 500

    @app.route('/all-ad-requests', methods=['GET'])
    @auth_required()
    @roles_accepted('sponsor', 'admin')
    @cache.cached(timeout=60 * 5)  
    def get_all_ad_requests():
        try:
            all_ads = AdRequest.query.all()

            ad_requests = [
                {
                    'id': ad.id,
                    'campaign_id': ad.campaign_id,
                    'influencer_id': ad.influencer_id,
                    'requirements': ad.requirements,
                    'payment_amount': ad.payment_amount,
                    'negotiation_amount': ad.negotiation_amount,
                    'status': ad.status,
                    'messages': ad.messages
                } for ad in all_ads
            ]

            return jsonify(ad_requests), 200
        except Exception as e:
            print(f"Error fetching ad requests: {e}")
            return jsonify({"error": "Unable to fetch ad requests"}), 500

    @app.route('/resolve-flag/<int:user_id>', methods=['PUT'])
    @auth_required()
    @roles_required('admin')
    def resolve_flag(user_id):
        print("this is working")
        """Toggle the flag status of a user."""
        try:
            user = User.query.get(user_id)
            if not user:
                return jsonify({"message": "User not found"}), 404
            print(user.flag)
            # Toggle the user's flag status
            user.flag = not user.flag
            print(user.flag)
            db.session.commit()
            return jsonify({"message": "User flag status updated successfully", "new_flag_status": user.flag}), 200
        except Exception as e:
            return jsonify({"error": str(e)}), 500
        
    @app.route('/ads/<int:ad_id>/reject', methods=['PATCH'])
    @auth_required()  # Ensures the user is logged in
    @roles_required('sponsor')  
    def reject_ad(ad_id):
        """
        Reject a specific ad by setting its status to 'Rejected'.
        """
        try:
            # Fetch the ad request by ID
            ad_request = AdRequest.query.get(ad_id)
            if not ad_request:
                return jsonify({'message': 'Ad not found'}), 404

            # Update the status to 'Rejected'
            ad_request.status = 'Pending'

            # Commit the changes to the database
            db.session.commit()
            return jsonify({'message': 'Ad request rejected successfully'}), 200

        except Exception as e:
            print(f"Error rejecting ad {ad_id}: {e}")
            return jsonify({'error': 'An error occurred while rejecting the ad.'}), 500    

    @app.route('/sponsors-pending', methods=['GET'])
    @roles_required('admin')
    @auth_required()
    def get_pending_sponsors():
        try:
            pending_sponsors = User.query.filter_by(active=False).all()

            pending_sponsors_data = [
                {
                    "id": sponsor.id,
                    "name": sponsor.name,
                    "email": sponsor.email,
                    "company_name": sponsor.company_name,
                    "industry": sponsor.industry,
                    "budget": sponsor.budget,
                    "active": sponsor.active
                } for sponsor in pending_sponsors if any(role.name == 'sponsor' for role in sponsor.roles)
            ]
            
            return jsonify(pending_sponsors_data), 200
        except Exception as e:
            return jsonify({"error": str(e)}), 500

    @app.route('/all-users', methods=['GET'])
    @auth_required()
    @roles_required('admin')
    def all_users():
        try:
            flagged_users = User.query.all()

            users_data = [
                {
                    "id": user.id,
                    "name": user.name,
                    "email": user.email,
                    "role": [role.name for role in user.roles],
                    "flag": user.flag,
                } for user in flagged_users
            ]

            return jsonify({"flagged_users": users_data}), 200
        except Exception as e:
            return jsonify({"message": "An error occurred while fetching flagged users.", "error": str(e)}), 500
    


    if __name__ == "__main__":
        app.run(debug=True)