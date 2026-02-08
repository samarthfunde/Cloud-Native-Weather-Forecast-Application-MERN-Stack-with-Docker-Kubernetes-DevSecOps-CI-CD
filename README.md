# Cloud-Native Weather Forecast Application | MERN Stack with Docker, Kubernetes & DevSecOps CI/CD

##  Project Purpose

The purpose of this project is to build a cloud-native 3-tier MERN stack Weather Application where users can search for any city and view real-time weather data. The application stores searched data in MongoDB and is deployed using a complete DevSecOps pipeline with Docker, Jenkins, SonarQube, Trivy, and Kubernetes to ensure automated build, security scanning, scalability, rolling updates, and rollback capability.

---

## Stepwise Documentation


## step 1: Dockerized Application

###  Architecture Overview (3-Tier)

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


```
Docker (Local / VM)
Backend ↔ DB → container name
Frontend → Backend → IP / domain

Kubernetes
Pod ↔ Pod → Service name
Browser → App → Ingress / LB URL



| Tier         | Component | Responsibility                   |
|--------------|-----------|----------------------------------|
| Presentation | Frontend  | Shows weather data to users      |
| Application  | Backend   | Handles API requests & logic     |
| Data         | Database  | Stores data persistently         |

---

###  Frontend Preview

<img width="1914" height="888" alt="image" src="https://github.com/user-attachments/assets/74cc9a4f-4c84-4cb8-82aa-3968a47667c1" />

<img width="1914" height="944" alt="image" src="https://github.com/user-attachments/assets/4331d7d8-e005-4e93-b871-6891f2b179bc" />

---

###  Database Preview

<img width="1919" height="813" alt="image" src="https://github.com/user-attachments/assets/c7cbbb81-8213-4591-a3f6-39041f229074" />

<img width="1919" height="754" alt="image" src="https://github.com/user-attachments/assets/c10614d8-e5e7-47dc-85a5-880223b060ec" />

<img width="1919" height="756" alt="image" src="https://github.com/user-attachments/assets/184695c6-864b-4b60-a4f5-bbd3e237432b" />

---

###  Tech Stack

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

###  Project Structure

```
Weather_Application_Docker/
│
├── frontend/
│   ├── Dockerfile
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

### Environment Variables Configuration

### Frontend nginx.conf

Frontend uses nginx reverse proxy configuration to communicate with backend.

Configuration file:
```nginx
server {
    listen 80;
    location / {
        root /usr/share/nginx/html;
        index index.html;
        try_files $uri /index.html;
    }
    location /api/ {
        proxy_pass http://backend-service:5000/;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

Frontend communicates with backend using nginx reverse proxy configuration instead of environment variables.

### Backend .env
```env
PORT=5000
MONGO_URI=mongodb://mongo-service:27017/weatherdb
```

Backend communicates with MongoDB using Kubernetes service name.

##  Dockerfiles

### Frontend `Dockerfile`

```dockerfile
# Build stage
FROM node:20-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# Runtime stage
FROM nginx:alpine3.23
RUN apk update && apk upgrade
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/build /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

---

### Backend `Dockerfile`

```dockerfile
FROM node:20.11-alpine3.1
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
EXPOSE 5000
CMD ["node", "index.js"]
```

---

###  docker-compose.yml

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

###  Docker Networking

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

- This network is created automatically when `docker-compose up` is executed. DNS resolution is handled by Docker — **no IP hardcoding needed**.

---

###  Docker Volumes (Database Persistence)

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

###  Running the Application

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

###  Access the Application

| Service      | URL                                      |
|--------------|------------------------------------------|
| Frontend     | `http://<EC2-IP>:3000`                   |
| Backend API  | `http://<EC2-IP>:5000/weather/pune`      |

---

###  View Database Data (MongoDB)

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

###  How Containers Communicate (Interview Answer)

1. Docker Compose creates a **custom bridge network** automatically.
2. Containers communicate using ** ip & service names** 
3. **DNS resolution** is handled by Docker internally.
4. No IP address is hardcoded anywhere in the project.

```
 Frontend  →  Backend  →  Database
 Secure & Scalable Architecture
```

---

###  Push Images to Docker Hub

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



# Step 2: Kubernetes Implementation

## Prerequisites

Before deploying ensure the following:

- Docker images are built and pushed to DockerHub
- Kubernetes cluster is created using kubeadm
- kubectl is configured and working
- Worker nodes are in Ready state
- CNI network plugin like Calico is installed

Verify cluster status:
```bash
kubectl get nodes
```

### Project Structure
```
weather-k8s/
├── namespace.yaml
├── backend/
│   ├── backend-configmap.yaml
│   ├── backend-secret.yaml
│   ├── backend-deployment.yaml
│   └── backend-service.yaml
├── database/
│   ├── mongo-pv.yaml
│   ├── mongo-pvc.yaml
│   ├── mongo-deployment.yaml
│   └── mongo-service.yaml
└── frontend/
    ├── frontend-deployment.yaml
    └── frontend-service.yaml
```

### Deployment Steps

### Step 1: Create Namespace

Apply the namespace configuration:
```bash
kubectl apply -f namespace.yaml
```

Verify namespace creation:
```bash
kubectl get ns
```

### Step 2: Deploy MongoDB Database Layer

Create Persistent Volume:
```bash
kubectl apply -f database/mongo-pv.yaml
```

Create Persistent Volume Claim:
```bash
kubectl apply -f database/mongo-pvc.yaml
```

Deploy MongoDB:
```bash
kubectl apply -f database/mongo-deployment.yaml
```

Create MongoDB Service:
```bash
kubectl apply -f database/mongo-service.yaml
```

Verify database deployment:
```bash
kubectl get pods -n weather-app
kubectl get pvc -n weather-app
```

### Step 3: Deploy Backend Application Layer

Create ConfigMap for environment variables:
```bash
kubectl apply -f backend/backend-configmap.yaml
```

Create Secret for sensitive data:
```bash
kubectl apply -f backend/backend-secret.yaml
```

Deploy Backend application:
```bash
kubectl apply -f backend/backend-deployment.yaml
```

Create Backend Service:
```bash
kubectl apply -f backend/backend-service.yaml
```

Verify backend deployment:
```bash
kubectl get pods -n weather-app
kubectl get svc -n weather-app
```

### Step 4: Deploy Frontend Presentation Layer

Deploy Frontend application:
```bash
kubectl apply -f frontend/frontend-deployment.yaml
```

Create Frontend Service:
```bash
kubectl apply -f frontend/frontend-service.yaml
```

Verify frontend deployment:
```bash
kubectl get pods -n weather-app
kubectl get svc -n weather-app
```

## Access Application

Get service details:
```bash
kubectl get svc -n weather-app
```

If using NodePort service access via:
```
http://NODE_IP:NODE_PORT
```

Example:
```
http://192.168.1.100:30008
```

### Updating Application After New Docker Image Push

Update frontend image:
```bash
kubectl set image deployment/frontend frontend-container=username/weather-frontend:new-tag -n weather-app
```

Update backend image:
```bash
kubectl set image deployment/backend backend-container=username/weather-backend:new-tag -n weather-app
```

Check rollout status:
```bash
kubectl rollout status deployment/frontend -n weather-app
kubectl rollout status deployment/backend -n weather-app
```

### Rollback Deployment

Check deployment history:
```bash
kubectl rollout history deployment/frontend -n weather-app
```

Rollback to previous version:
```bash
kubectl rollout undo deployment/frontend -n weather-app
```

### Monitoring and Debugging

View all pods:
```bash
kubectl get pods -n weather-app
```

Describe specific pod:
```bash
kubectl describe pod POD_NAME -n weather-app
```

View pod logs:
```bash
kubectl logs POD_NAME -n weather-app
```

View live logs:
```bash
kubectl logs -f POD_NAME -n weather-app
```

Execute commands inside pod:
```bash
kubectl exec -it POD_NAME -n weather-app -- /bin/bash
```

### Delete All Resources

Delete entire namespace and all resources:
```bash
kubectl delete namespace weather-app
```

Or delete individually:
```bash
kubectl delete -f frontend/
kubectl delete -f backend/
kubectl delete -f database/
kubectl delete -f namespace.yaml
```

### Architecture Overview

- MongoDB uses Persistent Volume for data storage and durability
- Backend connects to MongoDB using ClusterIP service
- Frontend connects to Backend using internal service DNS
- All components run inside weather-app namespace for isolation
- Rolling updates enabled for zero downtime deployments
- Horizontal scaling possible by increasing replicas

### Security Implementations

- Namespace isolation for resource separation
- Kubernetes Secrets for sensitive environment variables
- ConfigMaps for non-sensitive configuration
- ClusterIP services for internal communication
- NodePort or LoadBalancer for external access only where needed
- Image pull policies configured for production use

### Troubleshooting Common Issues

If pods are not starting check:
```bash
kubectl describe pod POD_NAME -n weather-app
```

If service is not accessible check:
```bash
kubectl get endpoints -n weather-app
```

If persistent volume claim is pending check:
```bash
kubectl describe pvc PVC_NAME -n weather-app
```

### Notes

- Replace NODE_IP with actual Kubernetes node IP address
- Replace username with your DockerHub username
- Replace new-tag with actual image tag version
- Ensure all YAML files use correct image names from DockerHub
- PersistentVolume path must exist on worker nodes
- ConfigMap and Secret must be created before deployments



# Step 3: Route53 ACM HTTPS TLS and Load Balancer Configuration

This step explains how the application is exposed securely to end users using AWS Route 53 for DNS, AWS ACM for HTTPS TLS certificates, and AWS Load Balancer to route traffic to Kubernetes services.

## Architecture Overview
```
User Browser
     |
     | https://weather.example.com
     ↓
Route 53 DNS
     ↓
AWS Application Load Balancer HTTPS 443
     ↓
Kubernetes Service Frontend NodePort
     ↓
Frontend Pod → Backend Service → Backend Pod → MongoDB
```

### Prerequisites

Before starting ensure:

- Domain is registered example: example.com
- Kubernetes cluster is running on AWS EC2 instances
- Frontend service is exposed via NodePort
- IAM permissions for Route53, ACM, ELB, EC2

### Step 3.1: Create ACM Certificate for HTTPS

### Purpose

ACM provides SSL TLS certificates to enable HTTPS on the Load Balancer

### Steps to Create Certificate

Open AWS Certificate Manager console

Click on Request a certificate button

Choose certificate type:
```
Public certificate
```

Add domain name:
```
weather.example.com
```

Choose validation method:
```
DNS validation recommended
```

Click Request button to submit

Certificate status will show Pending validation

### Step 3.2: Validate Certificate Using Route53

### Steps to Validate

Open the ACM certificate details page

Click Create records in Route 53 button

AWS automatically adds CNAME validation records to Route 53

Wait for certificate status to change to:
```
Issued
```

Validation typically takes 5 to 10 minutes

Certificate is now ready to use with HTTPS

### Step 3.3: Create Application Load Balancer

### Steps to Create ALB

Open EC2 console and navigate to Load Balancers

Click Create Load Balancer button

Choose load balancer type:
```
Application Load Balancer
```

Configure basic settings:

- Name: weather-app-alb
- Scheme: Internet-facing
- IP address type: IPv4

Select VPC and availability zones:

- Choose your VPC
- Select at least 2 public subnets in different availability zones

Configure security groups:

- Create or select security group
- Allow inbound traffic on ports 80 and 443

### Step 3.4: Configure Listeners for HTTP and HTTPS

### Listener Configuration

Add two listeners:

Listener 1 HTTP:
```
Protocol: HTTP
Port: 80
```

Listener 2 HTTPS:
```
Protocol: HTTPS
Port: 443
```

### HTTPS Listener Settings

Select ACM certificate created in Step 3.1

Choose SSL policy:
```
ELBSecurityPolicy-2016-08 recommended
```

### HTTP to HTTPS Redirect

Configure HTTP listener default action:
```
Redirect to HTTPS
Status code: 301 Permanent Redirect
```

This ensures all HTTP traffic redirects to HTTPS

### Step 3.5: Create Target Group

### Target Group Configuration

Click Create target group

Choose target type:
```
Instances
```

Configure settings:

- Name: weather-frontend-tg
- Protocol: HTTP
- Port: NodePort of frontend service example 30008
- VPC: Select your VPC

Configure health checks:
```
Health check protocol: HTTP
Health check path: /
```

Advanced health check settings:

- Healthy threshold: 2
- Unhealthy threshold: 2
- Timeout: 5 seconds
- Interval: 30 seconds

### Register Targets

Select Kubernetes worker nodes EC2 instances

Click Include as pending below button

Click Create target group button

### Step 3.6: Attach Target Group to Load Balancer

Go back to Load Balancer configuration

For HTTPS listener:
```
Default action: Forward to target group
Target group: weather-frontend-tg
```

Review all settings

Click Create load balancer button

Wait for load balancer state to become Active

Note the DNS name:
```
weather-app-alb-1234567890.region.elb.amazonaws.com
```

### Step 3.7: Configure Route53 DNS Record

### Steps to Create DNS Record

Open Route 53 console

Click Hosted zones

Select your domain:
```
example.com
```

Click Create record button

Configure record settings:

Record name:
```
weather
```

Record type:
```
A - Routes traffic to an IPv4 address and some AWS resources
```

Enable Alias toggle:
```
Yes
```

Route traffic to:
```
Alias to Application and Classic Load Balancer
```

Choose region where ALB was created

Select the Application Load Balancer from dropdown

Routing policy:
```
Simple routing
```

Click Create records button

Wait for DNS propagation typically 5 to 10 minutes

### Access Application

Application is now accessible at:
```
https://weather.example.com
```

Verification checklist:

- Browser shows HTTPS lock icon
- Certificate is valid and issued by Amazon
- Application loads successfully
- HTTP traffic redirects to HTTPS

### Traffic Flow Summary
```
User Request → Route 53 DNS Resolution → ALB HTTPS 443 → Target Group → Kubernetes Worker Node NodePort → Frontend Service → Frontend Pod
```

### Security Benefits

- End to end TLS encryption
- AWS managed SSL certificates
- Automatic certificate renewal by ACM
- No direct exposure of Kubernetes nodes
- Centralized traffic routing and management
- DDoS protection via AWS Shield Standard
- Security group level access control

### Verification Commands

Check Kubernetes services:
```bash
kubectl get svc -n weather-app
```

Check pods status:
```bash
kubectl get pods -n weather-app
```

Check ALB target health in AWS console:
```
EC2 → Target Groups → weather-frontend-tg → Targets tab
```

All targets should show healthy status

### Troubleshooting

If application is not accessible:

Check target group health status in AWS console

Verify security group allows traffic on NodePort

Confirm DNS record is correctly configured in Route 53

Check ACM certificate status is Issued

Verify load balancer state is Active

Check Kubernetes service is running:
```bash
kubectl get svc frontend-service -n weather-app
```



#  Step 4: Jenkins CI/CD Setup (Jenkins Server)

This project uses Jenkins to automate CI/CD for a MERN Weather Application deployed on Kubernetes (kubeadm cluster).

---

##  Architecture Overview

GitHub → Jenkins → Docker → SonarQube → Trivy → DockerHub → Kubernetes (Master Node)

Jenkins communicates with:

- GitHub (via Webhook)
- SonarQube (for code quality analysis)
- DockerHub (for image push)
- Kubernetes Master Node (via kubeconfig)

---

### Step 4.1: Jenkins Installation (On EC2 / Ubuntu Server)

Install:

- Java (Required for Jenkins)
- Jenkins
- Docker
- Trivy
- kubectl
- NodeJS (via Jenkins tool configuration)

Start Jenkins:

```
sudo systemctl start jenkins
sudo systemctl enable jenkins
```

---

### Step 4.2: Required Jenkins Plugins

Install these plugins:

- Git Plugin
- Pipeline Plugin
- Docker Pipeline Plugin
- SonarQube Scanner
- Kubernetes CLI Plugin
- NodeJS Plugin

---

### Step 4.3: Configure Global Tools in Jenkins

Go to:

Manage Jenkins → Global Tool Configuration

Configure:

### 1️ NodeJS
Name: `node-18`

### 2️ SonarQube Scanner
Name: `sonar-scanner`

Install automatically from Maven Central.

---

### Step 4.4: SonarQube Integration

### Install SonarQube (on same or separate server)

Start SonarQube:

```
docker run -d -p 9000:9000 sonarqube:lts
```

Open:
```
http://<server-ip>:9000
```

Generate Token:
My Account → Security → Generate Token

---

### Add SonarQube in Jenkins

Manage Jenkins → Configure System → SonarQube Servers

- Name: sonar-server
- Server URL: http://<sonarqube-ip>:9000
- Add authentication token

---

### Step 4.5: DockerHub Credentials

Go to:

Manage Jenkins → Credentials → Add Credentials

Add:

- DockerHub Username
- DockerHub Password

ID example: `dockerhub-creds`

---

### Step 4.6: Jenkins ↔ Kubernetes Communication (kubeconfig Method)

Jenkins communicates with Kubernetes using `kubeconfig`.

### Step 1: Copy kubeconfig from Kubernetes Master Node

On Kubernetes Master:

```
cat ~/.kube/config
```

Copy the entire content.

---

### Step 2: Add kubeconfig in Jenkins

Manage Jenkins → Credentials → Add Credentials

- Kind: Secret file
- Upload kubeconfig file
- ID: `kubeconfig`

---

### Step 3: Use kubeconfig in Jenkins Pipeline

During deployment stage:

- Jenkins loads kubeconfig
- Uses `kubectl set image`
- Waits for rollout status

This allows Jenkins to:

- Update deployments
- Monitor rollout
- Perform rollback if needed

---

### Step 4.7: CI/CD Pipeline Flow

When code is pushed:

### 1️ Checkout Code
Jenkins pulls code from GitHub.

---

### 2️ SonarQube Analysis

- Static Code Analysis
- Checks bugs
- Code smells
- Security vulnerabilities
- Generates Quality Gate

If Quality Gate fails → Pipeline stops.

---

### 3️ Build Docker Images

- Frontend image
- Backend image
- Tagged using build number or commit SHA

Images are versioned (no latest tag for production).

---

### 4️ Trivy Security Scan

Trivy scans:

- OS vulnerabilities (Alpine packages)
- Node modules vulnerabilities
- Critical & High severity issues

If CRITICAL vulnerability found → Build fails.

Example output:

```
Total: 1 (CRITICAL: 1)
```

If no critical issues:

```
Total: 0 (CRITICAL: 0)
```

---

### 5️ Push Images to DockerHub

Successfully built images are pushed to:

```
docker.io/<username>/weather-frontend-image:<tag>
docker.io/<username>/weather-backend-image:<tag>
```

---

### 6️ Deploy to Kubernetes

Jenkins executes:

- `kubectl set image`
- `kubectl rollout status`

If deployment fails:

- Kubernetes triggers restart
- Jenkins can trigger rollback

---

###  Deployment Verification

Check pods:

```
kubectl get pods -n weather-app
```

Check rollout:

```
kubectl rollout status deployment/backend -n weather-app
```

---

###  Rollback Strategy

If deployment fails:

```
kubectl rollout undo deployment/backend -n weather-app
```

Kubernetes automatically rolls back to previous ReplicaSet.


---

### Security Layers in CI/CD

| Layer        | Tool        | Purpose |
|-------------|------------|----------|
| Code Quality | SonarQube | Static analysis |
| Image Scan   | Trivy     | Vulnerability scanning |
| Containerization | Docker | Immutable builds |
| Orchestration | Kubernetes | Deployment & scaling |



### Jenkins Snapshots

#### Error in CI/CD:

<img width="1919" height="945" alt="Screenshot 2026-02-04 155440" src="https://github.com/user-attachments/assets/ea213b5f-57c8-4e40-a1c5-50a36ad39031" />

#### Sonarqube Quality Gate:

<img width="1919" height="711" alt="image" src="https://github.com/user-attachments/assets/20d642f9-c6a0-4df3-8988-4248b6e16240" />

<img width="1448" height="603" alt="image" src="https://github.com/user-attachments/assets/546e3cf2-831e-463f-8741-24d306caabd5" />


<img width="1914" height="951" alt="Screenshot 2026-02-04 181451" src="https://github.com/user-attachments/assets/d1ea4e31-154e-4520-a984-cd270eaf1f86" />

#### Trivy Scan:

<img width="1919" height="965" alt="Screenshot 2026-02-07 013951" src="https://github.com/user-attachments/assets/4f27f45e-726f-4ba8-84c9-121d831a5037" />

<img width="1917" height="905" alt="Screenshot 2026-02-05 005527" src="https://github.com/user-attachments/assets/0346799d-c419-4a9c-b485-10463f81533c" />

<img width="1919" height="941" alt="Screenshot 2026-02-05 005549" src="https://github.com/user-attachments/assets/b6191c5b-5cb2-4c43-9125-987efc38fc0c" />

<img width="1919" height="946" alt="Screenshot 2026-02-05 005737" src="https://github.com/user-attachments/assets/37ecb425-8a81-440b-b44a-47b087423139" />

<img width="780" height="247" alt="image" src="https://github.com/user-attachments/assets/f0688581-3344-4aed-87f4-2cda1871765e" />


#### Success Images of CI/CD

<img width="1918" height="692" alt="image" src="https://github.com/user-attachments/assets/4ac8ac59-25f2-443c-8b72-6210ecc59945" />

<img width="1919" height="855" alt="image" src="https://github.com/user-attachments/assets/2e409c7f-ff86-4cab-879c-1ce943a5d1ff" />

---



# Step 5: GitHub Webhook Setup (GitHub ↔ Jenkins)

## Goal: 
Webhook allows automatic pipeline trigger on code push.

---

### Step 5.1: Get Jenkins Public URL

Example:

```
http://<jenkins-public-ip>:8080/github-webhook/
```

Make sure port 8080 is open in Security Group.

---

### Step 5.2: Configure Webhook in GitHub

Go to:

GitHub Repository → Settings → Webhooks → Add Webhook

### Add:

- Payload URL:
```
http://<jenkins-ip>:8080/github-webhook/
```

- Content Type:
```
application/json
```

- Trigger:
```
Just the push event
```

Save.

---

### Step 5.3: Enable GitHub Hook Trigger in Jenkins

In Jenkins Job:

Configure → Build Triggers

Enable:

```
GitHub hook trigger for GITScm polling
```

Now every Git push automatically triggers Jenkins pipeline.

---

### Complete CI/CD Flow

1. Developer pushes code to GitHub
2. GitHub Webhook triggers Jenkins
3. Jenkins pulls code
4. SonarQube analyzes code
5. Docker images are built
6. Trivy scans images
7. Images pushed to DockerHub
8. Kubernetes deployment updated
9. Rollout status verified
10. Application updated without downtime

---

### Final Result

- Automated CI/CD  
- Secure image scanning  
- Versioned deployments  
- Zero-downtime rollout  
- Automatic rollback support  
- Production-ready DevSecOps pipeline  

---

###  Project Status

This project successfully implements:

- MERN 3-tier architecture
- Docker containerization
- Kubernetes (kubeadm cluster)
- Jenkins CI/CD
- SonarQube code analysis
- Trivy security scanning
- GitHub Webhook automation
- Version-controlled deployments

### Snapshot after change frontend code by developer

### Before:

<img width="1912" height="969" alt="Screenshot 2026-02-07 022834" src="https://github.com/user-attachments/assets/3b9137ce-7861-41c3-9ef5-7fb8cfcd6e52" />

### After ( means updated version of image in the k8s frontend deployment through the jenkins ci/cd)

<img width="1919" height="965" alt="Screenshot 2026-02-07 023930" src="https://github.com/user-attachments/assets/6ec7aa37-7930-41d9-bb9e-da68cb312311" />

---




# Author
Development + Devops :- Samarth Funde

# Contact
samarthf28@gmail.com



