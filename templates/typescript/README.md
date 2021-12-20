# GETTING STARTED

## Installation & Usage

### Create database

1. For PostgreSQL

```bash
psql
CREATE DATABASE <databasename>;
```

2. For MySQL

```bash
mysql -u username
CREATE DATABASE <databasename>;
```

### Fill-up Environment Variables

1. For  NODE/.env

```bash
1. Create a new file named ".env"
2. Copy all content from "sample.env" to ".env" file
3. Change variable values to required ones
```

2. For PM2/Ecosystem

```bash
1. Create a new file named "ecosystem.config.js"
2. Copy all content from "sample.ecosystem.config.js" to "ecosystem.config.js" file
3. Change variable values to required ones
```

### Install Dependencies

```bash
npm i
```

### Default Data Setup

Since We are using Sequelize in this Server kindly follow https://sequelize.org/ for further Documentation.

Check Migration Files inside _migrations_ folder before running migration.

Change tables and columns scripts accordingly (Change Model desings _(inside sequelize/models/*)_ as well if you want to change migration scripts).

1. For running Migration

```bash
npm run migration:latest
```

2. For Creating new migration Script

```bash
npm run migration:generate -- --name "script-name"
```

### Database Migrations

1. For  NODE/.env

```bash
npm start
```

2. For PM2/Ecosystem

```bash
pm2 start && pm2 logs
```


## Miscellaneous

We have created two different caching system for you. Depending on your application scalling.

1. Redis _For large Scale Application (i-e Multiple Instances)_

If you want to use Redis please functions from file _server/common/cache.js_

2. Node-cache _For Small Application (i-e Single Instance Server)_

If you want to use Node-Cache please functions from file _server/common/cache_lite.js_

## Contact-us

If you have any query feel free to contact me at moeedsalfi@gmail.com

Thanks Have a wonderfull day :)
