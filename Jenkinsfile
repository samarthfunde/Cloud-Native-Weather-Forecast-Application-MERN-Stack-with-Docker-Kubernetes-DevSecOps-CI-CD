pipeline {
    agent any

    environment {
        DOCKERHUB_REPO = "samarthfunde"
        FRONTEND_IMAGE = "weather-frontend-image"
        BACKEND_IMAGE  = "weather-backend-image"
        NAMESPACE      = "weather-app"
        IMAGE_TAG      = "${BUILD_NUMBER}"
    }

    tools {
        nodejs "node-18"
    }

    //stage: 1
      stages {

        stage('Checkout Code') {
            steps {
                checkout scm
            }
        }

        //stage: 2
        stage('SonarQube Analysis') {
            steps {
                script {
                    def scannerHome = tool 'sonar-scanner'
                    withSonarQubeEnv('sonar-server') {
                        sh """
                        ${scannerHome}/bin/sonar-scanner \
                        -Dsonar.projectKey=weather-app \
                        -Dsonar.projectName=weather-app \
                        -Dsonar.projectVersion=${BUILD_NUMBER} \
                        -Dsonar.sources=.
                        """
                    }
                }
            }
        }

        //stage: 3
        stage('Quality Gate') {
            steps {
                timeout(time: 5, unit: 'MINUTES') {
                    waitForQualityGate abortPipeline: true
                }
            }
        }

        //stage: 4
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

        //stage: 5
        stage('Build Docker Images') {
            steps {
                sh """
                docker build -t $DOCKERHUB_REPO/$FRONTEND_IMAGE:${IMAGE_TAG} ./frontend
                docker build -t $DOCKERHUB_REPO/$BACKEND_IMAGE:${IMAGE_TAG} ./backend
                """
            }
        }

        // following code we use for if developer change in the frontend then only build the frontend image not backend backend at that time
        // stage('Build Frontend') {
        //     when {
        //         changeset "frontend/**"
        //       }
        // steps {
        //     sh """
        //     docker build -t $DOCKERHUB_REPO/$FRONTEND_IMAGE:${IMAGE_TAG} ./frontend
        //     """
        //  }
        // }
        
        // following code we use for if developer change in the backend then only build the backend image not frontend build at that time
        // stage('Build Backend') {
        //     when {
        //         changeset "backend/**"
        //      }
        // steps {
        //       sh """
        //       docker build -t $DOCKERHUB_REPO/$BACKEND_IMAGE:${IMAGE_TAG} ./backend
        //       """
        //     }
        //   }


    
        //stage: 6
        stage('Trivy Scan Images') {
            steps {
                sh """
                trivy image --exit-code 1 --severity CRITICAL \
                --skip-version-check \
                $DOCKERHUB_REPO/$FRONTEND_IMAGE:${IMAGE_TAG}

                trivy image --exit-code 1 --severity CRITICAL \
                --skip-version-check \
                $DOCKERHUB_REPO/$BACKEND_IMAGE:${IMAGE_TAG}
                """
            }
        }

        //stage: 7
        stage('Push Images') {
            steps {
                sh """
                docker push $DOCKERHUB_REPO/$FRONTEND_IMAGE:${IMAGE_TAG}
                docker push $DOCKERHUB_REPO/$BACKEND_IMAGE:${IMAGE_TAG}
                """
            }
        }

        //stage: 8
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
    }

    post {
        always {
            sh "docker system prune -f"
        }
    }
}
