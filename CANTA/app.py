from flask import Flask, render_template, redirect, url_for, request, flash, session
from flask_sqlalchemy import SQLAlchemy
from flask_login import LoginManager, UserMixin, login_user, login_required, logout_user, current_user
from flask_babel import Babel, gettext as _
from werkzeug.security import generate_password_hash, check_password_hash
import os

app = Flask(__name__)
app.config['SECRET_KEY'] = 'your_secret_key_here'
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///database.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['BABEL_DEFAULT_LOCALE'] = 'ar'
app.config['UPLOAD_FOLDER'] = 'static/uploads'

from models import db, User, Product
db.init_app(app)
login_manager = LoginManager(app)
babel = Babel(app)

@login_manager.user_loader
def load_user(user_id):
    return User.query.get(int(user_id))

@app.route('/')
def index():
    lang = session.get('lang', 'ar')
    products = Product.query.all()
    return render_template('index.html', products=products, lang=lang)

@app.route('/set_lang/<lang>')
def set_lang(lang):
    session['lang'] = lang
    return redirect(request.referrer or url_for('index'))

@app.route('/register', methods=['GET', 'POST'])
def register():
    if request.method == 'POST':
        username = request.form['username']
        email = request.form['email']
        password = request.form['password']
        confirm = request.form['confirm']
        if password != confirm:
            flash(_('Passwords do not match'), 'danger')
            return redirect(url_for('register'))
        hashed_pw = generate_password_hash(password)
        role = 'admin' if User.query.count() == 0 else 'user'
        user = User(username=username, email=email, password=hashed_pw, role=role)
        db.session.add(user)
        db.session.commit()
        flash(_('Account created successfully'), 'success')
        return redirect(url_for('login'))
    return render_template('register.html')

@app.route('/login', methods=['GET', 'POST'])
def login():
    if request.method == 'POST':
        email = request.form['email']
        password = request.form['password']
        user = User.query.filter_by(email=email).first()
        if user and check_password_hash(user.password, password):
            login_user(user)
            flash(_('Logged in successfully'), 'success')
            if user.role == 'admin':
                return redirect(url_for('admin_dashboard'))
            else:
                return redirect(url_for('index'))
        else:
            flash(_('Invalid credentials'), 'danger')
    return render_template('login.html')

@app.route('/logout')
@login_required
def logout():
    logout_user()
    flash(_('Logged out successfully'), 'success')
    return redirect(url_for('index'))

@app.route('/admin')
@login_required
def admin_dashboard():
    if current_user.role != 'admin':
        flash(_('Access denied'), 'danger')
        return redirect(url_for('index'))
    users_count = User.query.count()
    products_count = Product.query.count()
    products = Product.query.all()
    return render_template('admin_dashboard.html', users_count=users_count, products_count=products_count, products=products)

@app.route('/add_product', methods=['GET', 'POST'])
@login_required
def add_product():
    if current_user.role != 'admin':
        flash(_('Access denied'), 'danger')
        return redirect(url_for('index'))
    if request.method == 'POST':
        name_ar = request.form['name_ar']
        name_tr = request.form['name_tr']
        description_ar = request.form['description_ar']
        description_tr = request.form['description_tr']
        price = float(request.form['price'])
        image = request.files['image']
        image_filename = image.filename
        image.save(os.path.join(app.config['UPLOAD_FOLDER'], image_filename))
        product = Product(name_ar=name_ar, name_tr=name_tr, description_ar=description_ar, description_tr=description_tr, price=price, image=image_filename)
        db.session.add(product)
        db.session.commit()
        flash(_('Product added successfully'), 'success')
        return redirect(url_for('admin_dashboard'))
    return render_template('add_product.html')

@app.route('/edit_product/<int:product_id>', methods=['GET', 'POST'])
@login_required
def edit_product(product_id):
    if current_user.role != 'admin':
        flash(_('Access denied'), 'danger')
        return redirect(url_for('index'))
    product = Product.query.get_or_404(product_id)
    if request.method == 'POST':
        product.name_ar = request.form['name_ar']
        product.name_tr = request.form['name_tr']
        product.description_ar = request.form['description_ar']
        product.description_tr = request.form['description_tr']
        product.price = float(request.form['price'])
        if 'image' in request.files and request.files['image'].filename:
            image = request.files['image']
            image_filename = image.filename
            image.save(os.path.join(app.config['UPLOAD_FOLDER'], image_filename))
            product.image = image_filename
        db.session.commit()
        flash(_('Product updated successfully'), 'success')
        return redirect(url_for('admin_dashboard'))
    return render_template('edit_product.html', product=product)

@app.route('/delete_product/<int:product_id>', methods=['POST'])
@login_required
def delete_product(product_id):
    if current_user.role != 'admin':
        flash(_('Access denied'), 'danger')
        return redirect(url_for('index'))
    product = Product.query.get_or_404(product_id)
    db.session.delete(product)
    db.session.commit()
    flash(_('Product deleted successfully'), 'success')
    return redirect(url_for('admin_dashboard'))

@app.errorhandler(404)
def page_not_found(e):
    return render_template('404.html'), 404

if __name__ == '__main__':
    if not os.path.exists('database.db'):
        with app.app_context():
            db.create_all()
    app.run(debug=True)
