pipeline {
    agent any

    environment {
        DOCKERHUB_REPO = "samarthfunde"
        FRONTEND_IMAGE = "weather-frontend-image"
        BACKEND_IMAGE  = "weather-backend-image"
        NAMESPACE      = "weather-app"
        SONARQUBE_ENV  = "sonar-server"
        IMAGE_TAG      = "${BUILD_NUMBER}"
    }

    tools {
        nodejs "nodejs"
    }

    stages {

        stage('Checkout Code') {
            steps {
                checkout scm
            }
        }

        // ---------------- SONARQUBE ----------------

        stage('SonarQube Analysis') {
            steps {
                withSonarQubeEnv("${SONARQUBE_ENV}") {
                    sh """
                    sonar-scanner \
                    -Dsonar.projectKey=weather-app \
                    -Dsonar.projectName=weather-app \
                    -Dsonar.projectVersion=${BUILD_NUMBER} \
                    -Dsonar.sources=.
                    """
                }
            }
        }

        stage('Quality Gate') {
            steps {
                timeout(time: 5, unit: 'MINUTES') {
                    waitForQualityGate abortPipeline: true
                }
            }
        }

        // ---------------- DOCKER LOGIN ----------------

        stage('Docker Login') {
            steps {
                withCredentials([usernamePassword(
                    credentialsId: 'dockerhub-creds',
                    usernameVariable: 'DOCKER_USER',
                    passwordVariable: 'DOCKER_PASS'
                )]) {
                    sh """
                    echo $DOCKER_PASS | docker login -u $DOCKER_USER --password-stdin
                    """
                }
            }
        }

        // ---------------- BUILD ----------------

        stage('Build Docker Images') {
            steps {
                sh """
                docker build -t $DOCKERHUB_REPO/$FRONTEND_IMAGE:${IMAGE_TAG} ./frontend
                docker build -t $DOCKERHUB_REPO/$BACKEND_IMAGE:${IMAGE_TAG} ./backend

                docker tag $DOCKERHUB_REPO/$FRONTEND_IMAGE:${IMAGE_TAG} $DOCKERHUB_REPO/$FRONTEND_IMAGE:latest
                docker tag $DOCKERHUB_REPO/$BACKEND_IMAGE:${IMAGE_TAG} $DOCKERHUB_REPO/$BACKEND_IMAGE:latest
                """
            }
        }

        // ---------------- TRIVY ----------------

        stage('Trivy Scan Images') {
            steps {
                sh """
                trivy image --exit-code 1 --severity HIGH,CRITICAL \
                $DOCKERHUB_REPO/$FRONTEND_IMAGE:${IMAGE_TAG}

                trivy image --exit-code 1 --severity HIGH,CRITICAL \
                $DOCKERHUB_REPO/$BACKEND_IMAGE:${IMAGE_TAG}
                """
            }
        }

        // ---------------- PUSH ----------------

        stage('Push Images') {
            steps {
                sh """
                docker push $DOCKERHUB_REPO/$FRONTEND_IMAGE:${IMAGE_TAG}
                docker push $DOCKERHUB_REPO/$BACKEND_IMAGE:${IMAGE_TAG}

                docker push $DOCKERHUB_REPO/$FRONTEND_IMAGE:latest
                docker push $DOCKERHUB_REPO/$BACKEND_IMAGE:latest
                """
            }
        }

        // ---------------- DEPLOY ----------------

        stage('Deploy to Kubernetes') {
            steps {
                sh """
                kubectl set image deployment/frontend \
                frontend-container=$DOCKERHUB_REPO/$FRONTEND_IMAGE:${IMAGE_TAG} \
                -n $NAMESPACE

                kubectl set image deployment/backend \
                backend-container=$DOCKERHUB_REPO/$BACKEND_IMAGE:${IMAGE_TAG} \
                -n $NAMESPACE

                kubectl rollout status deployment/frontend -n $NAMESPACE
                kubectl rollout status deployment/backend -n $NAMESPACE
                """
            }
        }

        // ---------------- AUTO ROLLBACK ----------------

        stage('Rollback If Failed') {
            when {
                expression { currentBuild.currentResult == 'FAILURE' }
            }
            steps {
                sh """
                kubectl rollout undo deployment/frontend -n $NAMESPACE
                kubectl rollout undo deployment/backend -n $NAMESPACE
                """
            }
        }
    }

    post {
        always {
            sh "docker system prune -f"
        }
    }
}
