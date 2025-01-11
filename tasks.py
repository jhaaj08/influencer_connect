from celery import shared_task
from flask_excel import make_response_from_query_sets
import time
from mail_service import send_email
from models import User, AdRequest, Campaign
from datetime import datetime
from io import StringIO
import csv
import os


@shared_task()
def last_login_reminder():
    from app import create_app
    app = create_app()  
    
    with app.app_context():  
        try:
            influencers = User.query.join(User.roles).filter_by(name='influencer').all()
            today_date = datetime.now().date()

            for influencer in influencers:
                if influencer.last_login and influencer.last_login.date() != today_date:
                    message = f"Hello {influencer.name}, you haven't logged in since yesterday. Please log in today to stay updated."
                    
                    send_email(influencer.email, 'Influencer Connect - You are been missed', message)

        except Exception as e:
            print(f"Error fetching influencers: {e}")
            return {"error": "Failed to fetch influencers."}, 500

@shared_task()
def pending_ads_reminder():
    from app import create_app
    app = create_app()  
    
    with app.app_context():  
        try:
            pending_ads = AdRequest.query.filter_by(status='Pending').all()

            for ad in pending_ads:
               
                influencer = User.query.filter(User.id == ad.influencer_id).join(User.roles).filter_by(name='influencer').first()

                if influencer:
                    
                    message = f"Hello {influencer.name}, you have pending ad requests that need your attention. Please visit your dashboard to accept or negotiate the ads."

                    
                    send_email(influencer.email, 'Influencer Connect - Pending Ad Requests', message)

        except Exception as e:
            print(f"Error fetching pending ads with influencer details: {e}")

@shared_task()
def generate_campaign_csv(sponsor_id):
    try:
        output_dir = '/tmp/'

        output = StringIO()
        writer = csv.writer(output)
        
        if not os.path.exists(output_dir):
            os.makedirs(output_dir)

        file_path = f'{output_dir}campaign_export_sponsor_{sponsor_id}.csv'

        with open(file_path, mode='w', newline='') as csv_file:
            writer = csv.writer(csv_file)
            writer.writerow(['Campaign Name', 'Description', 'Start Date', 'End Date', 'Budget', 'Visibility', 'Goals'])

            campaigns = Campaign.query.filter_by(sponsor_id=sponsor_id).all()
            for campaign in campaigns:
                writer.writerow([
                    campaign.name,
                    campaign.description,
                    campaign.start_date,
                    campaign.end_date,
                    campaign.budget,
                    campaign.visibility,
                    campaign.goals,
                ])

        sponsor = User.query.get(sponsor_id)
        if sponsor:
            send_email(sponsor.email,"your file is downloaded", file_path)

        output.close()
        
        return {"message": "CSV generated successfully", "filename": file_path}
    except Exception as e:
        print(f"Error generating CSV: {e}")
        return {"error": "Failed to generate CSV"}

        return file_path
    except Exception as e:
        print(f"Error generating CSV: {e}")
        return None

