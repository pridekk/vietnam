## Haproxy - Socket.io - Redis Pubsub 처리 Example
---
### 폴더구조
* haproxy: websocket, api proxy, 부하분산 설정
* server: 채팅예제를 기반으로한 웹 pubsub 서버 
* publisher: 채널에 publish 하는 예제 

---

## 예제 웹 접속:

<a href="http://34.236.170.57">여기로 접속(방화벽 작업 진행해야함)</a>

|command | 설명 | 예제 |
|---|---|---|
|join| 채널 가입| join data|
|left| 채널 탈퇴| left data|


## ubuntu 초기 설정

``` bash
$ sudo apt-get update
$ sudo apt-get install \
    ca-certificates \
    curl \
    gnupg \
    lsb-release
$ curl -fsSL https://download.docker.com/linux/ubuntu/gpg |  sudo gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg
$ echo \
  "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/ubuntu \
  $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

$ sudo apt-get update 
$ sudo apt-get install docker-ce docker-ce-cli containerd.io -y

$ sudo groupadd docker

$ sudo usermod -aG docker $USER
$ sudo systemctl enable docker.service

$ sudo systemctl enable containerd.service

$ sudo curl -L "https://github.com/docker/compose/releases/download/1.29.2/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose

$ sudo chmod +x /usr/local/bin/docker-compose

```

### 서비스 구동 (재접속 필요) 

``` bash 
$ docker-compose up -d 
```
### 전체 서비스 재시작 

``` bash 
$ docker-compose restart 
```

### 로그 확인 
``` bash 
$ docker-compose logs -f 
```

### Pubsub Test 
```bash
curl --location --request POST 'http://34.236.170.57/publish' \
--header 'Content-Type: application/json' \
--header 'Cookie: serverid=paul' \
--data-raw '{
    "channel": "data",
    "data":  {
        "message": "hi"
    }
}'
```