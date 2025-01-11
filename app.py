from flask import Flask
import views
from extensions import db, security, cache
from create_initial_data import create_data
from worker import celery_init_app 
import flask_excel as excel
from celery.schedules import crontab
from tasks import last_login_reminder, pending_ads_reminder

celery_app = None  

def create_app():
    app = Flask(__name__)
    app.config["SECRET_KEY"] = "should-not-be-exposed"
    app.config['SQLALCHEMY_DATABASE_URI'] = "sqlite:///data.db"
    app.config['SECURITY_PASSWORD_SALT'] = "salty_password"
    app.config['WTF_CSRF_ENABLED'] = False
    
    app.config['SECURITY_TOKEN_AUTHENTICATION_HEADER'] = 'Authentication-Token'
    app.config['SECURITY_TOKEN_MAX_AGE'] = 3600  # 1hr 
    app.config['SECURITY_LOGIN_WITHOUT_CONFIRMATION'] = True

    # Cache configuration
    app.config["DEBUG"] = True  # some Flask specific configs
    app.config["CACHE_TYPE"] = "RedisCache"  # Flask-Caching related configs
    app.config['CACHE_REDIS_HOST'] = 'localhost'
    app.config['CACHE_REDIS_PORT'] = 6379
    app.config['CACHE_REDIS_DB'] = 0
    app.config['CACHE_REDIS_URL'] = 'redis://localhost:6379/0'
    app.config["CACHE_DEFAULT_TIMEOUT"] = 300

    cache.init_app(app)
    db.init_app(app)

    # Initialize Celery with Flask app config
    global celery_app  
    
    with app.app_context():
        from models import User, Role
        from flask_security import SQLAlchemyUserDatastore

        user_datastore = SQLAlchemyUserDatastore(db, User, Role)

        security.init_app(app, user_datastore)

        db.create_all()
        create_data(user_datastore)

    views.create_view(app, user_datastore, cache)

    return app

app = create_app()
celery_app = celery_init_app(app) 
excel.init_excel(app)


@celery_app.on_after_configure.connect
def setup_periodic_tasks(sender, **kwargs):
    sender.add_periodic_task(
        crontab(hour=16, minute=40),
        last_login_reminder.s(),
    )   
    
    sender.add_periodic_task(
        crontab(hour=16, minute=40),
        pending_ads_reminder.s(),
    )   


if __name__ == "__main__":
    
    app.run(debug=True)
