import mysql.connector
from flask import Flask, request, jsonify
from flask_cors import CORS
import base64
import os

app = Flask(__name__)
CORS(app)

# Database Configuration
db_config = {
    'host': 'localhost',
    'user': 'root',
    'password': '',
    'database': 'ecom_app_db'
}

def get_db_connection():
    return mysql.connector.connect(**db_config)

# Initialize Database
def init_db():
    try:
        conn = mysql.connector.connect(
            host=db_config['host'],
            user=db_config['user'],
            password=db_config['password']
            
        )
        cursor = conn.cursor()
        cursor.execute(f"CREATE DATABASE IF NOT EXISTS {db_config['database']}")
        conn.close()

        conn = get_db_connection()
        cursor = conn.cursor()
        
        # Create users table matching user's schema but with LONGTEXT for photo
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS users (
                user_id INT AUTO_INCREMENT PRIMARY KEY,
                name VARCHAR(100) NOT NULL,
                email VARCHAR(100) UNIQUE NOT NULL,
                password VARCHAR(255) NOT NULL,
                address TEXT,
                contact_number VARCHAR(15),
                dob DATE,
                profile_photo LONGTEXT,
                status ENUM('active', 'inactive') DEFAULT 'active',
                role ENUM('admin', 'user') DEFAULT 'user',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        ''')
        
        # Check if we need to migrate profile_photo to LONGTEXT (if it exists)
        try:
            cursor.execute("ALTER TABLE users MODIFY COLUMN profile_photo LONGTEXT")
        except:
            pass
            
        # Insert default admin
        cursor.execute("SELECT * FROM users WHERE email = 'admin@shop.com'")
        if not cursor.fetchone():
            cursor.execute('''
                INSERT INTO users (name, email, password, address, contact_number, dob, role, status)
                VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
            ''', ('Admin User', 'admin@shop.com', 'admin123', 'Admin Office', '9999999999', '1990-01-01', 'admin', 'active'))
        
        conn.commit()
        conn.close()
        print("Database initialized successfully!")
    except Exception as e:
        print(f"Error initializing database: {e}")

init_db()

# REGISTER API
@app.route('/api/register', methods=['POST'])
def register():
    try:
        name = request.form.get('name')
        address = request.form.get('address')
        email = request.form.get('email')
        contact_number = request.form.get('contact_number')
        dob = request.form.get('dob')
        password = request.form.get('password')
        profile_photo = ''
        
        if 'profile_photo' in request.files:
            file = request.files['profile_photo']
            if file.filename:
                profile_photo = base64.b64encode(file.read()).decode('utf-8')
        
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute('''
            INSERT INTO users (name, address, email, contact_number, dob, profile_photo, password)
            VALUES (%s, %s, %s, %s, %s, %s, %s)
        ''', (name, address, email, contact_number, dob, profile_photo, password))
        
        conn.commit()
        conn.close()
        
        return jsonify({'success': True, 'message': 'Registration successful!'}), 201
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 400

# LOGIN API
@app.route('/api/login', methods=['POST'])
def login():
    data = request.json
    email = data.get('email')
    password = data.get('password')
    
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    cursor.execute('SELECT user_id, name, email, role, status FROM users WHERE email = %s AND password = %s', (email, password))
    user = cursor.fetchone()
    conn.close()
    
    if user:
        if user['role'] == 'user' and user['status'] != 'active':
            return jsonify({'success': False, 'error': 'Account is inactive. Contact admin.'}), 401
        
        return jsonify({
            'success': True,
            'user': user
        }), 200
    else:
        return jsonify({'success': False, 'error': 'Invalid credentials!'}), 401

# GET ALL USERS (Admin only)
@app.route('/api/users', methods=['GET'])
def get_users():
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    cursor.execute('SELECT user_id, name, address, email, contact_number, dob, profile_photo, role, status FROM users')
    users = cursor.fetchall()
    conn.close()
    
    return jsonify(users), 200

# GET SINGLE USER (Profile)
@app.route('/api/user/<int:user_id>', methods=['GET'])
def get_user(user_id):
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    cursor.execute('SELECT user_id, name, address, email, contact_number, dob, profile_photo, role, status FROM users WHERE user_id = %s', (user_id,))
    user = cursor.fetchone()
    conn.close()
    
    if user:
        return jsonify(user), 200
    return jsonify({'error': 'User not found'}), 404

# UPDATE USER STATUS
@app.route('/api/user/<int:user_id>/status', methods=['PUT'])
def update_status(user_id):
    data = request.json
    new_status = data.get('status')
    
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute('UPDATE users SET status = %s WHERE user_id = %s', (new_status, user_id))
    conn.commit()
    conn.close()
    
    return jsonify({'success': True, 'message': 'Status updated successfully!'}), 200

# UPDATE USER DETAILS (Admin/User)
@app.route('/api/user/<int:user_id>', methods=['PUT'])
def update_user(user_id):
    try:
        data = request.json
        name = data.get('name')
        address = data.get('address')
        email = data.get('email')
        contact_number = data.get('contact_number')
        dob = data.get('dob')
        
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute('''
            UPDATE users 
            SET name = %s, address = %s, email = %s, contact_number = %s, dob = %s
            WHERE user_id = %s
        ''', (name, address, email, contact_number, dob, user_id))
        
        conn.commit()
        conn.close()
        
        return jsonify({'success': True, 'message': 'User updated successfully!'}), 200
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 400

# DELETE USER
@app.route('/api/user/<int:user_id>', methods=['DELETE'])
def delete_user(user_id):
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute('DELETE FROM users WHERE user_id = %s', (user_id,))
        conn.commit()
        conn.close()
        
        return jsonify({'success': True, 'message': 'User deleted successfully!'}), 200
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 400

# START SERVER
if __name__ == '__main__':
    app.run(debug=True, port=5000)