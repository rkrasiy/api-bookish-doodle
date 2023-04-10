# Usage
To use this project make sure you have [Docker](https://www.docker.com/get-started) intalled then run the following command on your terminal:

```bash
docker-compose up
```

And go to [http://localhost:3000]()

## Installing Docker

Once you have Docker installed let's make sure that it works.  When you type:

```bash
docker --version
```

## Creating a Node App

Let's build a small web app we can use to help demonstrate some of the more advanced features of Docker.  We're going to build a simple web server in Node.js, Express and PostgreSQL:

I've created a new empty directory called `docker-nodejs-postgresql` and initialized an NPM repo inside of it.  

```bash
mkdir docker-nodejs-postgresql
cd docker-nodejs-postgresql
npm init
npm install express
```

We would like to enable file watching and automatic reloading of the server whenever the file is changed.

The easiest way to do that is a tool called [nodemon](https://www.npmjs.com/package/nodemon).

```bash
npm install nodemon --save-dev
```

Then add a `start` script to your `package.json` file:

`package.json`
```json
{
  "name": "server",
  "version": "1.0.0",
  "description": "",
  "main": "server.js",
  "scripts": {
    "start": "nodemon server.js"
  },
  "author": "me",
  "license": "ISC",
  "dependencies": {
    "express": "^4.17.2",
  },
  "devDependencies": {
    "nodemon": "^2.0.15"
  }
}
```


`docker-nodejs-postgresql/server.js`
```js
const express = require("express");
const app = express();
const port = 3000;

app.get("/", async (req, res) => {
  res.setHeader("Content-Type", "text/html");
  res.status(200);
  res.send("<h1>Hello world</h1>");
});

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});
```

Run your app with:

```bash
npm run start
```

And go to [http://localhost:3000]() to see:
![Node Hello World](https://res.cloudinary.com/dqse2txyi/image/upload/v1640125011/blogs/docker-node/docker-hello-world_gdeltv.png)


Enter Docker.

## Creating a Dockerfile

With Docker we can use code to generate the environment that our app runs in.  We'll begin by searching Docker hub for a Node.js image.  The official Node image is just called [node](https://hub.docker.com/_/node).

You'll notice when you look at supported tags there are a lot of versions.  Just like having a certain version on your machine, there's Docker images for pretty much every version you could want.  Of course Node itself needs to be installed on some kind of operating system so that's usually the other part of the tag.

The default Node image runs on [Debian](https://wiki.debian.org/DebianReleases), however one of the most popular versions runs on something called [Alpine Linux](https://alpinelinux.org/).

The main reason Alpine is popular is because of its small size, it's a distro of Linux designed to strip out all but the most necessary parts.  This means it will be faster and more cost effective to run and distribute our app on this image (assuming it meets our needs).

For our simple app, it does.

We can pull the image in advance with `docker pull node:18-alpine` just like we did with `hello-world`, but it's not necessary.  By adding it to our `Dockerfile` Docker will automatically pull it from Docker Hub if it doesn't find it on our machine.

Let's create a file called `Dockerfile` (no extension) in the root of our project next to `server.js`:

`Dockerfile`
```Dockerfile
# select your base image to start with
FROM node:14-alpine3.12
# Create app directory
# this is the location where you will be inside the container
WORKDIR /usr/src/app
# Install app dependencies
# A wildcard is used to ensure both package.json AND package-lock.json are copied
# where available (npm@5+)
# copying packages first helps take advantage of docker layers
COPY package*.json ./
RUN npm install
# If you are building your code for production
# RUN npm ci --only=production
# Bundle app source
COPY . .
# Make this port accessible from outside the container
# Necessary for your browser to send HTTP requests to your Node app
EXPOSE 3000
# Command to run when the container is ready
# Separate arguments as separate values in the array
CMD [ "npm", "run", "start"]
```

I've added a lot of comments to help explain each piece of the Dockerfile.  You can learn more about [Dockerfiles here](https://docs.docker.com/engine/reference/builder/), I would highly encourage you to skim through that page to get familiar with the commands that are available. 

Before we continue I would like to touch briefly on Docker's layers & cache because they are very important topics!

## Docker Layers and Cache

One common question for a simple Dockerfile like this is: 

> "Why are you using the COPY command twice?  Isn't the first COPY unnecessary since the second one copies the whole directory?"
The answer is actually "no" and the reason is because of one of Docker's best features called _layers_.  

Every time you use one of FROM, COPY, RUN, CMD it creates another image which is based off the previous layer.  That image can be cached and only needs to be created again if something changes.  

So by creating a specific COPY line on `package-*.json` we are creating a layer that is based off the content of that file before we run `npm install`.  That means that unless we _change_ `package.json`, the next time we build Docker will use the cache layer where `npm install` has already been run and we don't have to install all dependencies every time we run `docker build`.  That will save us an enormous amount of time.  

The next COPY looks at every file in our project directory, so that layer will be rebuilt on any file change (basically any time we update anything OTHER than `package.json` in our app).  But that's exactly what we want.  

This is just one example of efficiencies you can take advantage of when working with Docker, but I would encourage you to read the whole [list of best practices for Dockerfiles](https://docs.docker.com/develop/develop-images/dockerfile_best-practices/).

## Building the App Container

Now that your Dockerfile is created we have just one last thing we need to do before we build.

Similar to `.gitignore` that you're probably familiar with (used to prevent committing auto-generated files and private secrets to public repositories), Docker has a similar concept to keep you from unnecessarily copying files that your container doesn't need.

Let's create a `.dockerignore` file now:

`.dockerignore`
```
node_modules
npm-debug.log
```

Both of those will be generated inside the container, so we don't want to copy our local versions of them over.

At this point we are ready to build.  Run the following command:

```bash
docker build . -t my-node-app
```
That will build the _image_ describe by the Dockerfile in the current directory `.` and give it a name called `my-node-app`.  When it's done you can see the image and all its details with:

## What is Docker-Compose?

Best described in [their own words](https://docs.docker.com/compose/):

> Compose is a tool for defining and running multi-container Docker applications. With Compose, you use a YAML file to configure your application’s services. Then, with a single command, you create and start all the services from your configuration.
The process is to define the instructions for each of your services with Dockerfiles, and then use Docker Compose to run all those containers together and facilitate network communications between them.

In this tutorial we are going to connect our Node app to a PostgreSQL database.  Before we can connect them of course we need to establish the database container.

## Adding a Database

Similar to Node, Docker Hub has a super simple easy to use image for [PostgreSQL](https://www.postgresql.org/).  Of course theres also images for MySQL, Mongo, Redis, etc, etc.  There's no reason you couldn't substitute your favourite out if you want (though if you're still new to Docker I'd suggest you stick with the tutorial for now).

We search Docker Hub for the official [postgres](https://hub.docker.com/_/postgres) image.  We don't need anything beyond the bare minimum so once again we'll choose the version running on Alpine.  Image `postgres:15`.

Unlike our Node image, we don't need to copy any files or run any installation scripts, so we don't actually need a Dockerfile for our PostgreSQL installation.  There are some configurations that we do need (like password and ports for example) but we can manage those with our upcoming `docker-compose.yml` file.

So aside from deciding which image you are going to use, there is really nothing else we need to do before we create our config file.  

## Connecting the App to the Database

Before we create the Docker Compose configure file to link the database container, we need to update our app to actually use it.  

Our goal here is going to be to create a database with some very simple data (like a list of employees), see it with some sample data, and then query that data with our Node app.  

We'll also create a simple frontend to display that data.

First we need to install the PostgreSQL NPM package:

```bash
npm install pg
```

Next we are going to create a `.sql` file that will automatically seed out database with some sample data to read from.  In the root of the project create the following file:

`docker-nodejs-postgresql/database-seed.sql`
```sql
CREATE TABLE users
(
    id SERIAL,
    fullName text,
    email text,
    phone text,
    CONSTRAINT userID PRIMARY KEY (id)
);
INSERT INTO users(fullName, email, phone) VALUES
 ('Meadow Crystalfreak', 'meadow@example.com' , '658 887 977'),
 ('Winny Affron', 'winny@example.com' , '625 221 014'),
 ('Emily Gregoretti', 'egregoretti3@1und1.de', '687 877 778' )
 ('Trudie Myatt', 'meadow@example.com' , '698 025 332');
```
## Creating a Docker Compose YML File

For a brief intro to compose see [here](https://docs.docker.com/compose/),  and for more details than you can ever handle about the compose file spec see [here](https://github.com/compose-spec/compose-spec/blob/master/spec.md).

We're going to be creating a simple `docker-compose.yml` file to link our Node app with our PostgreSQL database.  Let's jump right in and create the file in our project root directory.  I'll use lots of comments to explain everything:

`docker-compose.yml`
```yml
version: "3"

services:
  backend:
    container_name: app
    build: .
    depends_on:
      # Our app does not work without our database
      # so this ensures our database is loaded first
      - postgres
    ports:
      - "3000:8080"
    volumes: 
      # Maps our current project directory `.` to
      # our working directory in the container
      - ./:/usr/src/app/
      # node_modules workaround for volumes
      # https://stackoverflow.com/a/32785014
      - /usr/src/app/node_modules
    restart: unless-stopped  
  postgres:
    image: postgres:15
    container_name: postgres_bd
    environment:
      # You can set the value of environment variables
      # in your docker-compose.yml file
      # Our Node app will use these to connect
      # to the database
      - POSTGRES_USER=root
      - POSTGRES_PASSWORD=root
      - POSTGRES_DB=root
    volumes:
      # When the PostgresSQL container is started it will run any scripts
      # provided in the `docker-entrypoint-initdb.d` directory, this connects
      # our seed file to that directory so that it gets run
      - ./database-seed.sql:/docker-entrypoint-initdb.d/database-seed.sql
    restart: unless-stopped
    ports:
      # Standard port for PostgreSQL databases
      - "5432:5432"
  panel:
    image: dpage/pgadmin4
    container_name: admin_panel
    environment:
        PGADMIN_DEFAULT_EMAIL: "admin@admin.com"
        PGADMIN_DEFAULT_PASSWORD: "admin123!"
    ports:
        - "16543:80"
    depends_on:
        - postgres
```

So with that `docker-compose.yml` file in place we are finally ready to run our new and highly improved application "suite" that includes a backend, frontend and database.

From the root directory of the project, all your have to do is type:

```bash
docker-compose up --build
```

_(Note the `--build` flag is used to force Docker to rebuild the images when you run `docker-compose up` to make sure you capture any new changes.  If you simply want to restart existing containers that haven't changed you can omit it)_

To stop all the containers at once, or view each one individually.  If you are using the command line you can stop both containers with this simple command (run from the project root directory for context):

```bash
docker-compose down
```

Notice the pgAdmin panel configuration added at the bottom.

When you run `docker-compose up --build` now and go to:

[http://localhost:16543/]()

You'll be greeted with the pgAdmin panel.  Enter the `PGADMIN_DEFAULT_EMAIL` and `PGADMIN_DEFAULT_PASSWORD` credentials from the `docker-compose.yml` file to access it.

Once inside click `Add New Server`.

For `General -> Name` pick a name.  Can be whatever you want.

On the `Connection` tab values must match the `docker-compose.yml` file:

* Host: `postgres`
* Username: `root`
* Password: `root`

Now you can navigate from the left bar:

`Servers -> whatever-you-want -> Databases -> root -> Schemas -> public -> Tables -> employees`

Right click `users` an Query Tool:

```sql
SELECT * FROM users;
```