	pipeline {
    agent any 
    tools {
        nodejs 'nodejs'
    }
    environment  {
        SCANNER_HOME=tool 'sonar-scanner'
        DOCKER_REPO_NAME = credentials('DOCKERHUB_BACKEND_REPO')
    }
    stages {
        stage('Cleaning Workspace') {
            steps {
                cleanWs()
            }
        }
        stage('Checkout from Git') {
            steps {
                git credentialsId: 'GITHUB-APP', url: 'https://github.com/otie16/task-tracking-app-backend.git'
            }
        }
        
        stage('Get Git SHA') {
            steps {
                script {
                    env.GIT_SHA = sh(script: 'git rev-parse --short HEAD', returnStdout: true).trim()
                }
            }
        }
        
stage('Sonarqube Analysis') {
    steps {
        dir('Application-Code/frontend') {
            withSonarQubeEnv('sonar-server') {
                withCredentials([string(credentialsId: 'SONAR_TOKEN', variable: 'SONAR_TOKEN')]) {
                    sh ''' 
                      $SCANNER_HOME/bin/sonar-scanner \
                      -Dsonar.projectName=three-tier-app-backend \
                      -Dsonar.projectKey=three-tier-app-backend \
                      -Dsonar.login=$SONAR_TOKEN
                    '''
                }
            }
        }
    }
}

        stage('Quality Check') {
            steps {
                script {
                    waitForQualityGate abortPipeline: false, credentialsId: 'SONAR_TOKEN' 
                }
            }
        }
         stage('OWASP Dependency-Check Scan') {
            steps {
                dir('Application-Code/frontend') {
                    withCredentials([string(credentialsId: 'NVD_API_KEY', variable: 'NVD_API_KEY')]){
                      dependencyCheck additionalArguments: '--scan ./ --disableYarnAudit --disableNodeAudit', odcInstallation: 'DP-Check'
                      dependencyCheckPublisher pattern: '**/dependency-check-report.xml'
                        
                    }
                }
            }
        }
        stage('Trivy File Scan') {
            steps {
                dir('Application-Code/frontend') {
                    sh 'trivy fs . > trivyfs.txt'
                }
            }
        }
        stage("Docker Image Build & Tag") {
            steps {
                script {
                    dir('Application-Code/frontend') {
                            sh 'docker system prune -f'
                            sh 'docker container prune -f'
                            sh 'docker build -t ${DOCKER_REPO_NAME}:${GIT_SHA} .'
                    }
                }
            }
        }
        stage("Dockerhub Image Pushing") {
            steps {
               withCredentials([usernamePassword(credentialsId: 'DOCKERHUB-CREDS', usernameVariable: 'DOCKER_USER', passwordVariable: 'DOCKER_PASS')]) {
               sh '''
               		echo "$DOCKER_PASS" | docker login -u "$DOCKER_USER" --password-stdin
               		docker push ${DOCKER_REPO_NAME}:${GIT_SHA}
               '''
               }
            }
        }
        stage("TRIVY Image Scan") {
            steps {
                sh 'trivy image ${DOCKER_REPO_NAME}:${GIT_SHA} > trivyimage.txt' 
            }
        }
        
    }
}