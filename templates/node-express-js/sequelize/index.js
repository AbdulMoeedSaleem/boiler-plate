"use strict";

const fs = require("fs");
const path = require("path");
const Sequelize = require("sequelize");
const dbConfig = require("../sequelize");
const fileNamePostfix = "Model.js";
const fileNameFilter = (name) => {
    return (
        name.indexOf(".") !== 0 &&
        name.lastIndexOf(fileNamePostfix) === name.length - fileNamePostfix.length
    );
};

const sequelize = new Sequelize(dbConfig);

const db = {};

sequelize
    .authenticate()
    .then(function (success) {
        console.info("Database connection OK!");
        console.info(dbConfig.database);
    })
    .catch(function (error) {
        console.error("Unable to connect to the database:");
        console.error(error.message);
        process.exit(1);
    });

const defineWrapper = function () {
    const modelParams = arguments[2];
    const model = sequelize.define.apply(sequelize, arguments);

    if (modelParams && "classMethods" in modelParams) {
        const { classMethods, instanceMethods } = modelParams;
        Object.assign(model, classMethods);
        Object.assign(model.prototype, instanceMethods);
    }
    return model;
};

const v4ComplianceWrapper = { ...sequelize };
v4ComplianceWrapper.define = defineWrapper;

const loadModel = (file) => {
    const filePath = path.join(__dirname, "models", file);
    const modelFunc = require(filePath);
    const model = modelFunc(v4ComplianceWrapper);
    Object.assign(db, { [model.name]: model });
};

const applyModelAssociations = (modelName) => {
    if ("associate" in db[modelName]) {
        console.info(`Execute the association of ${modelName}`);
        db[modelName].associate(db);
    }
};

const modelsList = fs
    .readdirSync(path.join(__dirname, "models"))
    .filter(fileNameFilter);

modelsList.forEach(loadModel);

Object.keys(db).forEach(applyModelAssociations);

db.sequelize = sequelize;
db.Sequelize = Sequelize;

module.exports = db;
