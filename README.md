# POPO Admin Web

<p align="center">
  <a href="http://popo.postech.ac.kr">
    <img src="https://raw.githubusercontent.com/PoApper/POPO-nest-api/master/assets/popo.svg" alt="Logo" height="150">
  </a>
  <p align="center">
    Public Web for POPO @ <a href="https://github.com/PoApper">PoApper</a>
    <br />
    POPO, POstechian's POrtal
    <br />
    👉 <a href="http://popo.postech.ac.kr">POPO</a>
  </p>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Docker-2CA5E0?style=flat-square&logo=Docker&logoColor=white"/>
  <img src="https://img.shields.io/badge/Node.js-20.x-339933?logo=node.js&logoColor=white">
  <img src="https://img.shields.io/badge/Next.js-14.x-000000?logo=nextdotjs&logoColor=white">
  <img src="https://img.shields.io/badge/React-18.x-61DAFB?logo=react&logoColor=black">
</p>

## About

POPO는 PoApper에서 개발하고, POSTECH 총학생회에서 운영하는 포털 사이트입니다. POPO를 통해 교내의 장소/장비를 예약하고, 자치단체 및 동아리 정보를 열람할 수 있습니다.

## How to Deploy

POPO 어플리케이션은 Docker Container로 실행되고 있으며, [Docker Swarm](https://docs.docker.com/engine/swarm/)을 통해 오케스트레이션 되고 있다. [Portainer](https://www.portainer.io/)라는 웹 도구를 사용해 컨테이너 환경을 제어하고 모니터링 하고 있다.
Dev-Prod의 two-stage 배포 정책을 가지고 있으며, 각 stage에 배포하기 위한 조건은 아래와 같다.

- Dev Stage
  - POPO 도커 이미지의 `latest` 버전을 업데이트 한다.
  - 이때, Web 어플리케이션의 경우는 도커 이미지 빌드 때 `NEXT_PUBLIC_ENV=dev`로 설정해줘야 한다.
  - `latest` 버전이 업데이트 되면, Github Action을 통해 Auto-deploy 해준다.
    - Github Action은 remote push로는 트리거되지 않고, PR을 생성해야 트리거된다. [참고](https://github.com/PoApper/popo-admin-web/blob/main/.github/workflows/github-action.yaml)
- Prod Stage
  - POPO 도커 이미지의 특정 태그를 업데이트 한다. (ex. `v1.2.3`)
  - 이때, Web 어플리케이션의 경우는 도커 이미지 빌드 때 `NEXT_PUBLIC_ENV=prod`로 설정해줘야 한다.
  - Portainer 웹에서 "직접" Prod stage의 버전을 바꿔준다.

## Contributors & Maintainer

- Seokyun Ha ([@bluehorn07](https://github.com/BlueHorn07))
- Jeongwon Choi ([@jjeongone](https://github.com/jjeongone))
- Hyojeong Yun ([@hyojeongyunn](https://github.com/hyojeongyunn))
- Gwanho Kim ([@khkim6040](https://github.com/khkim6040))
