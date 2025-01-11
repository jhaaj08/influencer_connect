from extensions import db
from flask_security import UserMixin, RoleMixin
from flask_security.models import fsqla_v3 as fsq
from sqlalchemy.orm import relationship
from datetime import datetime

fsq.FsModels.set_db_info(db)

# User Model
class User(db.Model, UserMixin):
    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String, nullable=False, unique=True)
    password = db.Column(db.String, nullable=False)
    active = db.Column(db.Boolean)
    flag = db.Column(db.Boolean)
    last_login = db.Column(db.DateTime, nullable=True)
    fs_uniquifier = db.Column(db.String, nullable=False)
    roles = db.relationship('Role', secondary='user_roles')

    # Common Fields for All Users
    name = db.Column(db.String, nullable=False)

    # Sponsor-specific Fields
    company_name = db.Column(db.String, nullable=True)  # Nullable if user is not a sponsor
    industry = db.Column(db.String, nullable=True)
    budget = db.Column(db.Float, nullable=True)  # Nullable if user is not a sponsor

    # Influencer-specific Fields
    category = db.Column(db.String, nullable=True)  # e.g., Lifestyle, Tech, Fitness
    niche = db.Column(db.String, nullable=True)  # e.g., Photography, Product Reviews
    reach = db.Column(db.Integer, nullable=True)  # Calculated based on followers or activities

    # Admin-specific Fields (If needed, e.g., permissions or tracking info)
    admin_notes = db.Column(db.String, nullable=True)

    # Relationships
    campaigns = db.relationship('Campaign', back_populates='sponsor', lazy=True)  # Campaigns created by this sponsor
    received_ads = db.relationship('AdRequest', back_populates='influencer_user', lazy=True, foreign_keys='AdRequest.influencer_id')

    def __repr__(self):
        return f"<User {self.email}>"

# Role Model
class Role(db.Model, RoleMixin):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String, nullable=False, unique=True)  # e.g., 'admin', 'sponsor', 'influencer'
    description = db.Column(db.String, nullable=False)

    def __repr__(self):
        return f"<Role {self.name}>"

# UserRoles Model (Association Table for Many-to-Many Relationship)
class UserRoles(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'))
    role_id = db.Column(db.Integer, db.ForeignKey('role.id'))

    def __repr__(self):
        return f"<UserRoles user_id={self.user_id}, role_id={self.role_id}>"

# Campaign Model
class Campaign(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    sponsor_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)  # Link to the sponsor user
    name = db.Column(db.String, nullable=False)
    description = db.Column(db.String)
    start_date = db.Column(db.Date, nullable=False)
    end_date = db.Column(db.Date, nullable=False)
    budget = db.Column(db.Float, nullable=False)
    visibility = db.Column(db.String, nullable=False, default="public")  # public or private
    goals = db.Column(db.String)
    niche = db.Column(db.String)  # Category of the campaign (e.g., Technology, Lifestyle, etc.)

    # Relationship with AdRequest
    ads = db.relationship('AdRequest', back_populates='related_campaign',cascade="all, delete",lazy=True, overlaps="related_campaign")

    # Relationship with User (Sponsor)
    sponsor = db.relationship('User', back_populates='campaigns')

    def __repr__(self):
        return f"<Campaign {self.name}, Sponsor: {self.sponsor_id}>"

    # Method to convert Campaign to dictionary
    def to_dict(self):
        return {
            "id": self.id,
            "sponsor_id": self.sponsor_id,
            "name": self.name,
            "description": self.description,
            "start_date": self.start_date.strftime('%Y-%m-%d') if self.start_date else None,
            "end_date": self.end_date.strftime('%Y-%m-%d') if self.end_date else None,
            "budget": self.budget,
            "visibility": self.visibility,
            "goals": self.goals,
            "niche": self.niche
        }

# AdRequest Model
class AdRequest(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    campaign_id = db.Column(db.Integer, db.ForeignKey('campaign.id'), nullable=False)  # Link to the campaign
    influencer_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)  # Link to the influencer user
    requirements = db.Column(db.Text, nullable=False)
    payment_amount = db.Column(db.Float, nullable=False)
    negotiation_amount = db.Column(db.Float, nullable=True)
    status = db.Column(db.String, default="Pending")  # Status could be: Pending, Accepted, Rejected, Negotiating
    messages = db.Column(db.Text)  # Messages between sponsor and influencer

    # Relationships
    related_campaign = db.relationship('Campaign', back_populates='ads', overlaps="ads")
    influencer_user = db.relationship('User', back_populates='received_ads')

    def to_dict(self):
        return {
            "id": self.id,
            "campaign_id": self.campaign_id,
            "influencer_id": self.influencer_id,
            "requirements": self.requirements,
            "payment_amount": self.payment_amount,
            "status": self.status,
            "messages": self.messages
        }

    def __repr__(self):
        return f"<AdRequest Campaign: {self.campaign_id}, Influencer: {self.influencer_id}, Payment: {self.payment_amount}>"