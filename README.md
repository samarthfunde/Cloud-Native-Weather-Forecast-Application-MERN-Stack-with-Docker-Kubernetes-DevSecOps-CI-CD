#  Weather Application – 3-Tier Architecture using Docker

##  Project Purpose

This project demonstrates a **real-world 3-tier application** implemented using **Docker**.  
It is designed to help beginners and interview candidates understand **frontend, backend, and database communication** using Docker networking, volumes, and environment variables.

The application fetches **weather data** from the backend API and displays it on the frontend UI while storing logs/data in the database.

---

##  Architecture Overview (3-Tier)

```
User Browser
      |   ( public ip or dns ) i used public ip to go user request from browser to frontend (nginx) because browser not in docker network so 
      v
Frontend (React + Nginx) - for communicate frontend to backend i used weather-backend container name(dns) for internal communication in docker network .. docker handle automatically
      |   http://weather-backend:5000
      v
Backend (Node.js / Express API) - for communicate backend to frontend i used weather-mongo container name(dns) for internal communication in docker network .. docker handle automatically
      |  mongodb://weather-mongo:27017
      v
Database (MongoDB)

................................

```
Docker (Local / VM)
Backend ↔ DB → container name
Frontend → Backend → IP / domain

Kubernetes
Pod ↔ Pod → Service name
Browser → App → Ingress / LB URL



| Tier         | Component | Responsibility                  |
|--------------|-----------|----------------------------------|
| Presentation | Frontend  | Shows weather data to users      |
| Application  | Backend   | Handles API requests & logic     |
| Data         | Database  | Stores data persistently         |

---

##  Frontend Preview

<img width="1914" height="888" alt="image" src="https://github.com/user-attachments/assets/74cc9a4f-4c84-4cb8-82aa-3968a47667c1" />

<img width="1914" height="944" alt="image" src="https://github.com/user-attachments/assets/4331d7d8-e005-4e93-b871-6891f2b179bc" />

---

##  Database Preview

<img width="1919" height="813" alt="image" src="https://github.com/user-attachments/assets/c7cbbb81-8213-4591-a3f6-39041f229074" />

<img width="1919" height="754" alt="image" src="https://github.com/user-attachments/assets/c10614d8-e5e7-47dc-85a5-880223b060ec" />

<img width="1919" height="756" alt="image" src="https://github.com/user-attachments/assets/184695c6-864b-4b60-a4f5-bbd3e237432b" />

---

##  Tech Stack

| Technology       | Usage                          |
|------------------|--------------------------------|
| React            | Frontend UI                    |
| Node.js + Express| Backend API                    |
| MongoDB          | Database                       |
| Docker           | Containerization               |
| Docker Compose   | Multi-container orchestration  |
| Bridge Network   | Inter-container networking     |
| Docker Volumes   | Persistent storage             |
| Docker Hub       | Image registry                 |
| Ubuntu (EC2)     | Hosting OS                     |

---

##  Project Structure

```
Weather_Application_Docker/
│
├── frontend/
│   ├── Dockerfile
│   ├── .env
│   └── src/
│
├── backend/
│   ├── Dockerfile
│   ├── .env
│   └── server.js
│
├── docker-compose.yml
└── README.md
```

---

##  Environment Variables

### Frontend `.env`

```env
REACT_APP_API_URL=http://public-ip:5000
```
>  Frontend talks to the backend **using the ip**, 

---

### Backend `.env`

```env
PORT=5000
MONGO_URI=mongodb://weather-db:27017/weatherdb
```
>  Backend talks to the database using the **service/container name**.

---

##  Dockerfiles

### Frontend `Dockerfile`

```dockerfile
FROM node:18
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

---

### Backend `Dockerfile`

```dockerfile
FROM node:18
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
EXPOSE 5000
CMD ["node", "server.js"]
```

---

##  docker-compose.yml

```yaml
version: "3.8"

services:
  weather-frontend:
    build: ./frontend
    container_name: weather-frontend
    ports:
      - "3000:3000"
    env_file:
      - ./frontend/.env
    depends_on:
      - weather-backend

  weather-backend:
    build: ./backend
    container_name: weather-backend
    ports:
      - "5000:5000"
    env_file:
      - ./backend/.env
    depends_on:
      - weather-db

  weather-db:
    image: mongo
    container_name: weather-db
    volumes:
      - mongo-data:/data/db

volumes:
  mongo-data:
```

---

##  Docker Networking

Docker Compose **automatically** creates a custom bridge network:

```
weather_application_default
```

All containers communicate using their **service names**:

| Container          | Name               |
|--------------------|--------------------|
| Frontend           | `weather-frontend` |
| Backend            | `weather-backend`  |
| Database           | `weather-db`       |

> 👉 This network is created automatically when `docker-compose up` is executed. DNS resolution is handled by Docker — **no IP hardcoding needed**.

---

##  Docker Volumes (Database Persistence)

A named volume ensures that **database data is not lost** when the container restarts.

```yaml
volumes:
  mongo-data:
```

MongoDB stores its data at:

```
/data/db
```

---

##  Running the Application

### Step 1: Clone the Repository

```bash
git clone https://github.com/your-username/weather-application.git
cd Weather_Application
```

### Step 2: Build & Start Containers

```bash
docker-compose up -d --build
```

### Step 3: Verify Everything is Running

```bash
docker ps
docker network ls
docker volume ls
```

---

##  Access the Application

| Service      | URL                                      |
|--------------|------------------------------------------|
| Frontend     | `http://<EC2-IP>:3000`                   |
| Backend API  | `http://<EC2-IP>:5000/weather/pune`      |

---

##  View Database Data (MongoDB)

```bash
# Enter the MongoDB container
docker exec -it weather-db mongosh

# List all databases
show dbs

# Switch to your database
use weatherdb

# List all collections
show collections

# View all weather documents
db.weather.find()
```

---

##  How Containers Communicate (Interview Answer)

1. Docker Compose creates a **custom bridge network** automatically.
2. Containers communicate using ** ip & service names** 
3. **DNS resolution** is handled by Docker internally.
4. No IP address is hardcoded anywhere in the project.

```
✔ Frontend  →  Backend  →  Database
✔ Secure & Scalable Architecture
```

---

##  Push Images to Docker Hub

### Login

```bash
docker login
```

### Tag Images

```bash
docker tag weather-frontend yourname/weather-frontend:v1
docker tag weather-backend  yourname/weather-backend:v1
```

### Push

```bash
docker push yourname/weather-frontend:v1
docker push yourname/weather-backend:v1
```

---
