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