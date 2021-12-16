module.exports = {
    apps: [
        {
            name: "ekhata-api",
            script: "index.js",
            time: true, // Prefix logs with time
            exec_mode: "cluster",
            instances: "max",
            autorestart: true,
            watch: true,
            env: {
                DEBUG: "khata:*",
                NODE_ENV: "development",
                PORT: 4000,
                DB_HOST: "localhost",
                DB_PORT: 5432,
                DB_NAME: "ekhata",
                DB_USER: "moeed",
                DB_PASSWORD: "abcd1234",
                DB_MAX_POOL: 2,
                DB_DIALECT: "postgres",
                redis_host: "localhost",
                redis_port: "6379",
                db_pagination_limit: 20,
                jwt_audience: "khata-audience",
                jwt_auth_key: "khata_auth_key",
                jwt_access_expiry: "5 mins",
                jwt_refresh_key: "refresh_key",
                jwt_refresh_expiry: "180 days"
            },
        },
    ],
};
