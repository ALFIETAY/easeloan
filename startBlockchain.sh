fabricPath=/home/ubuntu/fabric-dev-servers
versionPath=/home/ubuntu/blockchain/version.txt
composerPath=/home/ubuntu/blockchain
adminCard=PeerAdmin@hlfv1

# Stop all hyperledger fabric composer serverices
sudo systemctl stop composer-playground
sudo systemctl stop composer-rest-server
$fabricPath/stopFabric.sh

# Destroy all docker containers
docker kill $(docker ps -q)
docker rm $(docker ps -aq)
docker rmi $(docker images dev-* -q)

# Start hyperledger fabric service
$fabricPath/startFabric.sh
if [ $? -eq 0 ]; then
    echo "Fabric started successfully"
else
    echo "Failed to start fabric"
    exit 1
fi

# Deploy new BNA
cd $composerPath
curVersion=$(cat $versionPath)
newVersion=$((curVersion+1))
echo $newVersion > $versionPath
sed -i 's/"version": "0.0.'"$curVersion"'/"version": "0.0.'"$newVersion"'/g' package.json
composer archive create -t dir -n .
if [ $? -ne 0 ]; then
    echo "Failed to create composer archive"
    exit 1
fi
composer network install --card $adminCard --archiveFile mortgage-network@0.0.$newVersion.bna
# start new BNA
composer network start --networkName mortgage-network --networkVersion 0.0.$newVersion --networkAdmin admin --networkAdminEnrollSecret adminpw --card PeerAdmin@hlfv1 --file networkadmin.card
# upgrade existing BNA
# composer network upgrade -c $adminCard -n mortgage-network -V 0.0.$newVersion
if [ $? -eq 0 ]; then
    echo "Blockchain version $newVersion deployed successfully"
else
    echo "Failed to deploy Blockchain version $newVersion"
    exit 1
fi

# Start hyperledger fabric composer services
# sudo systemctl start composer-playground
sudo systemctl start composer-rest-server