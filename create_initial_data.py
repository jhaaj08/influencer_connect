from flask_security import SQLAlchemyUserDatastore
from flask_security.utils import hash_password
from extensions import db

def create_data(user_datastore: SQLAlchemyUserDatastore):
    print("Creating the initial data...")

    # Create Roles
    user_datastore.find_or_create_role(name='admin', description='Administrator with full access')
    user_datastore.find_or_create_role(name='sponsor', description='Sponsor responsible for campaigns')
    user_datastore.find_or_create_role(name='influencer', description='Influencer responsible for promoting campaigns')

    # Create Admin User
    if not user_datastore.find_user(email='admin@platform.com'):
        user_datastore.create_user(
            email='admin@platform.com',
            password=hash_password('admin123'),
            active=True,
            fs_uniquifier='admin_unique_1',
            roles=[user_datastore.find_role('admin')],
            name='Admin User'
        )

    # Create Sponsor User
    if not user_datastore.find_user(email='sponsor@company.com'):
        user_datastore.create_user(
            email='sponsor@company.com',
            password=hash_password('sponsor123'),
            active=True,
            flag=False,
            fs_uniquifier='sponsor_unique_1',
            roles=[user_datastore.find_role('sponsor')],
            name='Sponsor User',
            company_name='TechCorp Ltd',
            industry='Technology',
            budget=50000.0
        )

    # Create Influencer User
    if not user_datastore.find_user(email='influencer@social.com'):
        user_datastore.create_user(
            email='influencer@social.com',
            password=hash_password('influencer123'),
            active=True,
            flag=False,
            fs_uniquifier='influencer_unique_1',
            roles=[user_datastore.find_role('influencer')],
            name='Influencer User',
            category='Tech',
            niche='Gadget Reviews',
            reach=10000
        )

    # Commit all changes to the database
    db.session.commit()
    print("Initial data created successfully.")
