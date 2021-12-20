module.exports = {
    apps: [
        {
            name: "<server-name>",
            script: "index.js",
            time: true, // Prefix logs with time
            exec_mode: "cluster",
            instances: "max",
            autorestart: true,
            watch: true,
            env: {
                DEBUG: "app:*",
                NODE_ENV: "development",
                PORT: 4000,
                DB_HOST: "<db-host>",
                DB_PORT: "<db-post>",
                DB_NAME: "<db_name>",
                DB_USER: "<db-user-name>",
                DB_PASSWORD: "<db-user-pass>",
                DB_MAX_POOL: "<db-pool>",
                DB_DIALECT: "<db-dialect>",
                redis_host: "<redist-host>",
                redis_port: "<redist-post>",
                db_pagination_limit: 20,
                jwt_audience: "<server-audience>",
                jwt_auth_key: "<server-auth-key>",
                jwt_access_expiry: "5 mins",
                jwt_refresh_key: "<refresh-key>",
                jwt_refresh_expiry: "180 days"
            },
        },
    ],
};
