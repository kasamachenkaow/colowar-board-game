sudo docker build -t colo-peer https://github.com/peers/peerjs-server.git
sudo docker run -p 9000:9000 -d colo-peer
sudo ngrok http 9000
