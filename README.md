# Project README

### Jezicko language learning platform

Ovo je full-stack web aplikacija koja korisnicima omogucaća učenje stranih jezika pohađanjem raznih lekcija sa različitm tipovima zadataka, pregled statistike i administraciju lekcija.

### 🛠 Tehnologije

    Frontend: React, Vite, Axios
    Backend: Django
    Baza podataka: PostgreSQL
    Autentifikacija: JWT
    Testiranje: Django built-in testiranje
    CI/CD: GitHub Actions
    Containerizacija: Docker, Docker Compose
    Cloud: Google Cloud VM
    
### ⚙️ Konfiguracija okruženja

Pre pokretanja aplikacije potrebno je definisati .env fajl na backend-u.

### U Backend (backend/.env)

Tajni ključ za Django (koristi bilo koji random string)

    SECRET_KEY=super_secret_random_string

Takođe je potrebno i skinuti sve dependency-e. 

Potrebno je ukucati sledeću komandu u bash terminalu projekta:

    cd backend/

pa zatim:

    pip install requirements.txt

### Na frontend-u (vite.config.js)  

    target: "http://localhost:8000"

### 🚀 Pokretanje aplikacije, bez Docker-a

Prvo je potrebno aktivirati virtuelno okruženje.

U folderu projekta u bash terminalu uraditi:

    source env/bin/activate

Potom za backend u bash terminalu uraditi:

    cd backend/
    python manage.py runserver

U drugom bash terminalu za frontend uraditi:

    cd frontend/
    npm run dev

### 🚀 Pokretanje aplikacije pomocu Docker-a

Pre pokretanja aplikacije potrebno je definisati .env fajl u folderu projekta.

### U Projektu (naziv_projekta/.env)

    POSTGRES_DB=naziv_db
    POSTGRES_USER=naziv_korisnika
    POSTGRES_PASSWORD=sifra

    DJANGO_SECRET_KEY='super_secret_random_string'
    DEBUG=True
    ALLOWED_HOSTS=localhost,127.0.0.1

### Na frontend-u (vite.config.js)  

    target: "http://backend:8000"

U folderu projekta u bash terminalu uraditi:

    docker compose up --build

Nakon što se završi build-ovanje zaustaviti proces detachovanjem i uraditi:

    docker-compose exec backend python manage.py createsuperuser

i uneti podatke za user-a (datum u formatu YYYY-MM-DD i obavezno staviti za user type: "admin")

Alternativno u bash terminalu se može uraditi:

    docker-compose exec backend python manage.py loaddata backup.json

čime se učitavaju postojeci početni podaci (email i šifra za admin-a: admin@admin.com, admin)

Dodatno, ovo se sve može preskočiti i u okviru docker-compose fajla samo dodati komanda u okviru buildovanja backend koja će automatski učitati početne podatke pri pravljenju kontejnera.

U tom slučaju u docker-compose fajlu treba dodati:

    python manage.py loaddata backup.json

u okviru command dela u backend-a

Na kraju samo ponovo pokrenuti docker:

    docker compose up
