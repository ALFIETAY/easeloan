# mortgage-network

mortgage loan network

https://hyperledger.github.io/composer/latest/tutorials/developer-tutorial
1. *STARTING UP DEVELOPMENT ENVIRONMENT*

./startFabric.sh

2. Create Peers
./createPeerAdminCard.sh

Install Network to Peer
composer network install --card PeerAdmin@hlfv1 --archiveFile mortgage-network@0.0.1.bna

3. Start Business Network

composer network start --networkName mortgage-network --networkVersion 0.0.1 --networkAdmin admin --networkAdminEnrollSecret adminpw --card PeerAdmin@hlfv1 --file networkadmin.card

4. Import Network Administrator identity BNA Card
composer card import --file networkadmin.card

5. Check Business Network is Deployed Successfully

composer network ping --card admin@mortgage-network

*Package Business Network into .bna file*

composer archive create -t dir -n .

*TEARING DOWN DEVELOPMENT ENVIRONMENT*

./stopFabric.sh
./teardownFabric.sh
./teardownAllDocker.sh

*Running Google Authentication*
https://hyperledger.github.io/composer/latest/tutorials/google_oauth2_rest

Prerequsites: StartFabric Environment, Create PeerAdmin Card, Login to Easeloan Google Account

1. *Start the MongoDB Instance*

docker run -d --name mongo --network composer_default -p 27017:27017 mongo

2. *Navigate to temporary Directory and Run Docker File*
cd $HOME
cd dockertmp
docker build -t myorg/composer-rest-server . -f DockerFile

3. *Define Environment Variables in CLI*
cd Desktop/fabric-dev-servers/mortgage-network
source envvars.txt
echo $COMPOSER_CARD
echo $COMPOSER_PROVIDERS

4. *Deploy Business Network to REST client*
composer network install --card PeerAdmin@hlfv1 --archiveFile mortgage-network.bna
composer network start --networkName mortgage-network --networkVersion 0.0.1 --networkAdmin admin --networkAdminEnrollSecret adminpw --card PeerAdmin@hlfv1 --file networkadmin.card

5. *Import Business Network Card and Connect Cert to Wallet*
composer card import -f networkadmin.card
composer network ping -c admin@mortgage-network

6. *Create REST server admin for Composer REST server instance*
composer participant add -c admin@mortgage-network -d '{"$class":"org.hyperledger.composer.system.NetworkAdmin", "participantId":"restadmin"}'

composer identity issue -c admin@mortgage-network -f restadmin.card -u restadmin -a "resource:org.hyperledger.composer.system.NetworkAdmin#restadmin"

composer card import -f  restadmin.card
composer network ping -c restadmin@mortgage-network

*substitute the 'localhost' addresses with docker hostnames (new connection.json)*
sed -e 's/localhost:7051/peer0.org1.example.com:7051/' -e 's/localhost:7053/peer0.org1.example.com:7053/' -e 's/localhost:7054/ca.org1.example.com:7054/'  -e 's/localhost:7050/orderer.example.com:7050/'  < $HOME/.composer/cards/restadmin@mortgage-network/connection.json  > /tmp/connection.json && cp -p /tmp/connection.json $HOME/.composer/cards/restadmin@mortgage-network/

7. *Launch the Persistent REST server instance*
docker run \
-d \
-e COMPOSER_CARD=${COMPOSER_CARD} \
-e COMPOSER_NAMESPACES=${COMPOSER_NAMESPACES} \
-e COMPOSER_AUTHENTICATION=${COMPOSER_AUTHENTICATION} \
-e COMPOSER_MULTIUSER=${COMPOSER_MULTIUSER} \
-e COMPOSER_PROVIDERS="${COMPOSER_PROVIDERS}" \
-e COMPOSER_DATASOURCES="${COMPOSER_DATASOURCES}" \
-v ~/.composer:/home/composer/.composer \
--name rest \
--network composer_default \
-p 3000:3000 \
myorg/composer-rest-server

*Check REST server is running*
docker ps |grep rest
docker logs rest


