---
title: "附录B: Jenkinsfile/GitLab CI YAML 编写指南"
date: 2025-09-07
categories: [CICD]
tags: [jenkins, gitlab, pipeline, configuration, best-practices]
published: true
---
编写高质量的CI/CD流水线配置是实现高效软件交付的关键。无论是Jenkins的Jenkinsfile还是GitLab CI的.gitlab-ci.yml，都需要遵循一定的规范和最佳实践。本文将详细介绍这两种主流CI/CD配置文件的编写方法、语法结构和最佳实践，帮助开发者编写出更加健壮、可维护的流水线配置。

## Jenkinsfile 编写指南

Jenkinsfile是Jenkins Pipeline的配置文件，使用Groovy语言编写，支持声明式和脚本式两种语法。

### 声明式Pipeline语法

声明式Pipeline是Jenkins推荐的编写方式，语法结构清晰，易于理解和维护。

#### 基本结构
```groovy
pipeline {
    agent any
    stages {
        stage('Build') {
            steps {
                // 构建步骤
            }
        }
        stage('Test') {
            steps {
                // 测试步骤
            }
        }
        stage('Deploy') {
            steps {
                // 部署步骤
            }
        }
    }
}
```

#### 详细配置示例
```groovy
pipeline {
    // 指定运行代理
    agent {
        label 'docker'
    }
    
    // 定义环境变量
    environment {
        MAVEN_OPTS = '-Xmx2g'
        APP_VERSION = sh(script: "echo ${BUILD_NUMBER}", returnStdout: true).trim()
    }
    
    // 定义工具
    tools {
        maven 'Maven 3.8.4'
        jdk 'OpenJDK 11'
    }
    
    // 定义参数
    parameters {
        choice(
            choices: ['dev', 'staging', 'prod'],
            description: '选择部署环境',
            name: 'DEPLOY_ENV'
        )
        string(
            defaultValue: 'latest',
            description: 'Docker镜像标签',
            name: 'IMAGE_TAG'
        )
    }
    
    // 定义触发器
    triggers {
        pollSCM('H/15 * * * *')  // 每15分钟检查一次代码变更
        upstream(upstreamProjects: 'upstream-job', threshold: hudson.model.Result.SUCCESS)
    }
    
    // 定义选项
    options {
        timeout(time: 1, unit: 'HOURS')
        buildDiscarder(logRotator(numToKeepStr: '10'))
        disableConcurrentBuilds()
    }
    
    // 阶段定义
    stages {
        stage('Checkout') {
            steps {
                git branch: 'main', url: 'https://github.com/example/app.git'
            }
        }
        
        stage('Build') {
            parallel {
                stage('Compile') {
                    steps {
                        sh 'mvn compile'
                    }
                }
                stage('Unit Test') {
                    steps {
                        sh 'mvn test'
                    }
                    post {
                        always {
                            // 总是执行
                            junit 'target/surefire-reports/*.xml'
                            publishHTML([
                                allowMissing: false,
                                alwaysLinkToLastBuild: true,
                                keepAll: true,
                                reportDir: 'target/site/jacoco',
                                reportFiles: 'index.html',
                                reportName: 'Coverage Report'
                            ])
                        }
                        success {
                            // 构建成功时执行
                            echo '单元测试通过'
                        }
                        failure {
                            // 构建失败时执行
                            echo '单元测试失败'
                            slackSend channel: '#ci-cd', message: "Build failed: ${env.JOB_NAME} ${env.BUILD_NUMBER}"
                        }
                    }
                }
            }
        }
        
        stage('Security Scan') {
            agent {
                docker {
                    image 'sonarsource/sonar-scanner-cli'
                }
            }
            steps {
                withSonarQubeEnv('SonarQube') {
                    sh 'sonar-scanner'
                }
            }
            post {
                success {
                    script {
                        // 等待质量门禁结果
                        timeout(time: 1, unit: 'HOURS') {
                            def qg = waitForQualityGate()
                            if (qg.status != 'OK') {
                                error "Pipeline aborted due to quality gate failure: ${qg.status}"
                            }
                        }
                    }
                }
            }
        }
        
        stage('Build Docker Image') {
            steps {
                script {
                    docker.build("my-app:${params.IMAGE_TAG}")
                }
            }
            post {
                success {
                    script {
                        // 推送镜像到仓库
                        docker.withRegistry('https://registry.example.com', 'docker-registry-credentials') {
                            docker.image("my-app:${params.IMAGE_TAG}").push()
                            docker.image("my-app:${params.IMAGE_TAG}").push('latest')
                        }
                    }
                }
            }
        }
        
        stage('Deploy') {
            when {
                // 条件执行
                expression {
                    params.DEPLOY_ENV != 'dev'
                }
            }
            steps {
                script {
                    // 根据环境选择不同的部署脚本
                    if (params.DEPLOY_ENV == 'staging') {
                        sh './deploy-staging.sh'
                    } else if (params.DEPLOY_ENV == 'prod') {
                        // 生产环境需要手动确认
                        input message: '确认部署到生产环境?', ok: 'Deploy'
                        sh './deploy-production.sh'
                    }
                }
            }
        }
    }
    
    // 流水线后处理
    post {
        always {
            // 清理工作空间
            cleanWs()
        }
        success {
            // 发送成功通知
            slackSend channel: '#ci-cd', message: "Build successful: ${env.JOB_NAME} ${env.BUILD_NUMBER}"
        }
        failure {
            // 发送失败通知
            slackSend channel: '#ci-cd', message: "Build failed: ${env.JOB_NAME} ${env.BUILD_NUMBER}"
        }
        unstable {
            // 发送不稳定通知
            slackSend channel: '#ci-cd', message: "Build unstable: ${env.JOB_NAME} ${env.BUILD_NUMBER}"
        }
        changed {
            // 状态变更时通知
            slackSend channel: '#ci-cd', message: "Build status changed: ${env.JOB_NAME} ${env.BUILD_NUMBER}"
        }
    }
}
```

### 脚本式Pipeline语法

脚本式Pipeline提供更大的灵活性，但复杂度也更高：

```groovy
node('docker') {
    try {
        stage('Checkout') {
            git branch: 'main', url: 'https://github.com/example/app.git'
        }
        
        stage('Build') {
            withEnv(['MAVEN_OPTS=-Xmx2g']) {
                sh 'mvn clean package'
            }
        }
        
        stage('Test') {
            parallel(
                'Unit Tests': {
                    sh 'mvn test'
                    junit 'target/surefire-reports/*.xml'
                },
                'Integration Tests': {
                    sh 'mvn verify -P integration-test'
                    junit 'target/failsafe-reports/*.xml'
                }
            )
        }
        
        stage('Docker Build') {
            docker.build('my-app:latest')
        }
        
        stage('Deploy') {
            timeout(time: 30, unit: 'MINUTES') {
                input message: 'Deploy to production?', ok: 'Deploy'
            }
            
            sh './deploy.sh'
        }
        
        currentBuild.result = 'SUCCESS'
    } catch (Exception e) {
        currentBuild.result = 'FAILURE'
        throw e
    } finally {
        // 发送通知
        slackSend channel: '#ci-cd', 
                  message: "Build ${currentBuild.result}: ${env.JOB_NAME} ${env.BUILD_NUMBER}"
        
        // 清理
        cleanWs()
    }
}
```

## GitLab CI YAML 编写指南

GitLab CI使用YAML格式定义流水线，语法简洁明了。

### 基本结构

```yaml
# 定义流水线阶段
stages:
  - build
  - test
  - deploy

# 定义变量
variables:
  MAVEN_OPTS: "-Dhttps.protocols=TLSv1.2"
  DOCKER_DRIVER: overlay2

# 定义缓存
cache:
  paths:
    - .m2/repository/
    - node_modules/

# 定义前置脚本
before_script:
  - echo "Starting job: $CI_JOB_NAME"
  - date

# 定义后置脚本
after_script:
  - echo "Finishing job: $CI_JOB_NAME"
  - date

# 定义作业
build-job:
  stage: build
  image: maven:3.8.4-openjdk-11
  script:
    - mvn compile
  artifacts:
    paths:
      - target/classes/
    expire_in: 1 week

test-job:
  stage: test
  image: maven:3.8.4-openjdk-11
  script:
    - mvn test
  artifacts:
    reports:
      junit: target/surefire-reports/TEST-*.xml
  coverage: '/TOTAL.*\s+(\d+%)$/'

deploy-job:
  stage: deploy
  image: docker:latest
  services:
    - docker:dind
  script:
    - docker build -t my-app:$CI_COMMIT_SHA .
    - docker push my-app:$CI_COMMIT_SHA
  only:
    - main
```

### 高级配置示例

```yaml
# 定义包含文件
include:
  - template: Security/SAST.gitlab-ci.yml
  - local: '/ci/templates/.gitlab-ci-template.yml'
  - project: 'my-group/my-project'
    file: '/templates/docker.gitlab-ci.yml'
    ref: main

# 定义默认配置
default:
  image: alpine:latest
  before_script:
    - echo "Running default before_script"
  retry:
    max: 2
    when:
      - runner_system_failure
      - stuck_or_timeout_failure

# 定义复杂的作业
build-and-test:
  stage: test
  image: maven:3.8.4-openjdk-11
  services:
    - mysql:5.7
  
  variables:
    MYSQL_ROOT_PASSWORD: rootpass
    MYSQL_DATABASE: testdb
    MYSQL_USER: testuser
    MYSQL_PASSWORD: testpass
  
  cache:
    key: maven
    paths:
      - .m2/repository/
  
  before_script:
    - apt-get update && apt-get install -y curl
    - export MAVEN_OPTS="-Xmx2g"
    - mysql -h mysql -u root -p"$MYSQL_ROOT_PASSWORD" -e "CREATE DATABASE IF NOT EXISTS testdb;"
  
  script:
    - mvn clean compile
    - mvn test -Dspring.profiles.active=test
    - mvn verify -P integration-test
  
  artifacts:
    reports:
      junit: 
        - target/surefire-reports/TEST-*.xml
        - target/failsafe-reports/TEST-*.xml
      cobertura: target/site/cobertura/coverage.xml
    paths:
      - target/*.jar
    expire_in: 1 week
  
  coverage: '/Line coverage:\s+(\d+\.\d+)%/'
  
  parallel:
    matrix:
      - PROVIDER: [aws, azure, gcp]
        REGION: [us-east-1, eu-west-1]
  
  rules:
    - if: '$CI_PIPELINE_SOURCE == "merge_request_event"'
      changes:
        - src/**/*
        - pom.xml
    - if: '$CI_COMMIT_BRANCH == "main"'
      when: manual

# 定义模板作业
.docker-build-template:
  stage: build
  image: docker:latest
  services:
    - docker:dind
  variables:
    DOCKER_TLS_CERTDIR: "/certs"
  before_script:
    - docker login -u $CI_REGISTRY_USER -p $CI_REGISTRY_PASSWORD $CI_REGISTRY
  script:
    - |
      docker build \
        --build-arg COMMIT_SHA=$CI_COMMIT_SHA \
        --build-arg BUILD_DATE=$(date -u +"%Y-%m-%dT%H:%M:%SZ") \
        --tag $CI_REGISTRY_IMAGE:$CI_COMMIT_SHA \
        --tag $CI_REGISTRY_IMAGE:latest \
        .
    - docker push $CI_REGISTRY_IMAGE:$CI_COMMIT_SHA
    - docker push $CI_REGISTRY_IMAGE:latest
  after_script:
    - docker logout $CI_REGISTRY

# 使用模板
build-app:
  extends: .docker-build-template
  only:
    - main
    - merge_requests
  except:
    - schedules

# 定义依赖关系
integration-test:
  stage: test
  image: maven:3.8.4-openjdk-11
  needs:
    - job: build-app
      artifacts: true
  script:
    - mvn verify -P integration-test
  artifacts:
    reports:
      junit: target/failsafe-reports/TEST-*.xml

# 定义触发器
trigger-downstream:
  stage: deploy
  trigger:
    include:
      - artifact: downstream.yaml
        job: generate-config
    strategy: depend
  only:
    - main

# 定义定时任务
scheduled-test:
  stage: test
  script:
    - echo "Running scheduled test"
    - mvn test
  only:
    - schedules

# 定义多项目流水线
trigger-security-scan:
  stage: test
  trigger:
    project: security/dependency-scanner
    branch: main
    strategy: depend
  variables:
    TARGET_PROJECT: $CI_PROJECT_PATH
    TARGET_BRANCH: $CI_COMMIT_REF_NAME
  allow_failure: true
```

## 最佳实践

### 1. 配置可重用性

#### Jenkinsfile 模板
```groovy
// vars/buildApp.groovy
def call(Map config = [:]) {
    pipeline {
        agent any
        stages {
            stage('Build') {
                steps {
                    script {
                        def buildTool = config.buildTool ?: 'maven'
                        def buildCommand = config.buildCommand ?: 'clean package'
                        
                        if (buildTool == 'maven') {
                            sh "mvn ${buildCommand}"
                        } else if (buildTool == 'gradle') {
                            sh "gradle ${buildCommand}"
                        }
                    }
                }
            }
        }
    }
}
```

#### GitLab CI 模板
```yaml
# .gitlab-ci/templates/java-app.yml
.java-app-template:
  image: maven:3.8.4-openjdk-11
  cache:
    key: "$CI_COMMIT_REF_SLUG"
    paths:
      - .m2/repository/
  before_script:
    - export MAVEN_OPTS="-Xmx2g"
  artifacts:
    reports:
      junit: target/surefire-reports/TEST-*.xml

build-app:
  extends: .java-app-template
  stage: build
  script:
    - mvn clean compile

test-app:
  extends: .java-app-template
  stage: test
  script:
    - mvn test
```

### 2. 安全最佳实践

#### 敏感信息管理
```groovy
// Jenkinsfile
environment {
    // 使用凭证绑定
    DOCKER_REGISTRY_CREDENTIALS = credentials('docker-registry')
    DATABASE_PASSWORD = credentials('database-password')
}

steps {
    withCredentials([
        usernamePassword(
            credentialsId: 'nexus-credentials',
            usernameVariable: 'NEXUS_USER',
            passwordVariable: 'NEXUS_PASSWORD'
        )
    ]) {
        sh 'mvn deploy -Dnexus.user=$NEXUS_USER -Dnexus.password=$NEXUS_PASSWORD'
    }
}
```

```yaml
# .gitlab-ci.yml
build:
  script:
    - echo $NEXUS_PASSWORD | docker login -u $NEXUS_USER --password-stdin nexus.example.com
  secrets:
    NEXUS_USER:
      vault: production/nexus@user
    NEXUS_PASSWORD:
      vault: production/nexus@password
```

### 3. 性能优化

#### 缓存策略
```groovy
// Jenkinsfile
options {
    // 限制并发构建
    disableConcurrentBuilds()
    // 构建超时
    timeout(time: 1, unit: 'HOURS')
}

stages {
    stage('Build') {
        steps {
            // 使用缓存
            script {
                sh 'docker run -v $HOME/.m2:/root/.m2 maven:3.8.4 mvn clean package'
            }
        }
    }
}
```

```yaml
# .gitlab-ci.yml
cache:
  key: ${CI_COMMIT_REF_SLUG}
  paths:
    - .m2/repository/
    - node_modules/
    - .gradle/

variables:
  MAVEN_OPTS: "-Dmaven.repo.local=.m2/repository"
```

通过遵循这些指南和最佳实践，开发者可以编写出更加健壮、可维护的CI/CD流水线配置，提升软件交付效率和质量。