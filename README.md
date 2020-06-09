# multiple-files-form
A project which receives files from client side by using Multer lib from Node with multer-s3 + aws-sdk from Amazon to upload our files to Amazon S3 (CDN) instead of using local storage (or using it, is up to you). The template engine used in this project is HandlebarsJs!

The database used here is MongoDB. But instead of use Atlas MongoDb (remote server to store databases), i decided to use a docker container with Mongo:latest image (3.14) on the current time. To do this, i've executed the following commands with Docker Toolbox ( although i use windows 10, is not a compatible version to use Docker "main" engine):

# Download MongoDb image from Docker hub
docker pull image mongo:latest (or mongo:3.14)

# Create a docker container with a custom name 'mongo_db_handlebars' and connect my linux virtual machine port 27017 with the docker container port 27017 and run on mode daemon (background)
docker container run -d --name mongo_db_handlebars -p 27017:27017 mongo

# In case you wanna check, run the command
docker container ps

# Just to be clear, since i use Docker Toolbox, my dockers containers don't run on my host windows processes, but in a virtual linux machine created by Docker toolbox. To make a connection between my windows host and such virtual linux machine, Docker toolbox provide an IP that can be seen by executing the command:
docker-machine env

# I believe that, by default, the IP will be presented like that
SET DOCKER_HOST=tcp://192.168.99.100:2376

# So, to connect to the database, the url connection to mongo database at Docker's image, would be something like:
mongodb://192.168.99.100:27017/dbname

# But, if you use mac, linux or windows 10 pro or another compatible version to Docker "main" application, you can connect to localhost like this:
mongodb://localhost:27017/db_name

# To see if data is being inserted into it, try this
# Get into docker image terminal
docker container exec -it mongo_db_handlebars bash

# Access the database you created, and see collection documents
mongo
use dbname
db.posts.find().pretty()

