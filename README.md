# Blood-Bridge
Blood Bridge is a backend-focused web application that streamlines blood donation processes across the Philippines. It connects voluntary donors with hospitals and patients in urgent need of blood, starting with Cebu City as the pilot area.

## List all technologies, frameworks, and tools used:

Frontend: HTML, CSS, JavaScript

Backend: Django

Database: Supabase

Other Tools/Services: GitHub

## Setup

### Installation

1.  **Clone the repository.**
    ```bash
    git clone https://github.com/your-username/your-repository.git](https://github.com/thatguyKire/CSIT327-G2-BloodBridge.git
    ```
2.  **Setup the virtual environment.**
    ```bash
    # i. Navigate to project root directory.
    cd CSIT327-G2-BloodBridge
    
    # ii. Create a virtual env.
    # On macOS and Linux
    python3 -m venv venv
    # On Windows
    python -m venv venv
    
    # iii. Activate the virtual env.
    # On macOS and Linux
    source venv/bin/activate
    # On Windows (Command Prompt)
    venv\Scripts\activate
    # On Windows (PowerShell)
    venv\Scripts\Activate.ps1
    ```
3.  **Install dependencies.**
    ```bash
    pip install -r requirements.txt
    ```

If you want to use a database that uses PostgreSQL like Supabase:

4.  **Setup PostgreSQL database connection**
    ```bash
    # i. Create a .env file.
    # ii. Copy and paste this into your file and replace it with your database credentials:
    DATABASE_URL=postgresql://[user]:[password]@[host]:[port]/[dbname]
    ```   
5.  **Migrate models in database**
    ```bash
    # i. Navigate to the project (bloodbridge) directory.
    cd bloodbridge
    # ii. Migrate models.
    python manage.py migrate
    ```
6. **Create a Superuser/Admin**
   ```bash
   python manage.py createsuperuser
   ```

### Run

7. **Start the server**
   ```bash
   python manage.py runserver
   ```

## Team Members
- Luezyl Dominic C. Escasinas | Lead Developer | luezyldominic.escasinas@cit.edu
- John Lawrence L. Dioquino | Frontend Develpoper | johnlawrence.dioquino@cit.edu
- Irian Haryll C. Becera | Backend Developer |  irianharyll.becera@cit.edu

