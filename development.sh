#./update.sh
sudo docker build --pull -f ./Dockerfile -t searxng-dev:latest .
sudo docker run -it --rm -p 8888:8888 --name searxng searxng-dev:latest