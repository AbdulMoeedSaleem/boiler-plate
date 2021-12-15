const app = require("./server/app");
const config = require("./config/app");

const defaultPort = 4000;
const _argv = process.argv.splice(2);
const appListingPort = Number(config.PORT || _argv[0] || defaultPort);

const server = app.listen(appListingPort, function () {
    const port = server.address().port;
    const msg = "App listening at port %s with %s environment at process id %s";
    console.info(msg, port, config.ENVIRONMENT, process.pid);
});


// handle the error safely
process.on("uncaughtException", (err) => {
    console.error("handle the uncaughtException safely", err);
});

// handle the error safely
process.on("error", (err) => {
    console.error("handle the error safely", err);
});

const unhandledRejections = new Map();
process.on("unhandledRejection", (reason, promise) => {
    console.error("unhandledRejection", { reason });
    unhandledRejections.set(promise, reason);
});
process.on("rejectionHandled", (promise) => {
    console.error("rejectionHandled", { promise });
    unhandledRejections.delete(promise);
});

// handle signal for graceful restart
process.on("SIGINT", function () {
    server.close(function () {
        const msg = "Server is closing gracefully through SIGINT at process id %s";
        console.info(msg, process.pid);
        process.exit();
    });
});
