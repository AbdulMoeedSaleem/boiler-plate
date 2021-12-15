const db = require("../../library/db");
const logCat = require("../../library/logger")("app");
const { decrypt } = require("../../library/encryption");

const getDefaultCity = async (req) => {
    // remaining to add user_program condition for existing user
    return db("programs")
        .innerJoin("program_cities", "programs.id", "program_cities.program_id")
        .innerJoin("app_programs", "programs.id", "app_programs.program_id")
        .where(req.programWhere)
        .where({ "app_programs.app_id": req.app_id })
        .where("programs.end_date", ">=", db.fn.now())
        .where({ "programs.is_active": true, "programs.deleted_at": null })
        .select(["program_cities.city_id as id"])
}

// const userPrograms = async (req) => {
//     return db("user_programs").where({"user_id": req.user.id}).select("*")
// }
const userPrograms = async (req) => {
    /* Middleware checks for expires on else, will return empty array.
    Adding Expires on in Purchase flow and Subscription Flow
    */
    return db("payment_logs")
        .where({ "user_id": req.user.id, "is_active": true, "app_id": req.app_id })
        .where("expires_on", ">=", db.fn.now())
        .groupBy(["user_id", "program_id", "expires_on"])
        .orderBy("expires_on", "desc")
        .select(["user_id", "program_id"])
}

module.exports = async (req, res, next) => {
    let dev_loc = (req.get('mbq_dlc') || req.headers['mbq_dlc'] || 'undefined').toString();
    req.lat = 0;
    req.lng = 0;
    if (dev_loc !== 'undefined') {
        dev_loc = JSON.parse(decrypt(dev_loc));
        if (dev_loc.lat && dev_loc.lng) {
            req.lat = dev_loc.lat;
            req.lng = dev_loc.lng;
        }
    }
    res.set("app_id", req.app_id)
    req.programWhere = { "programs.is_purchase": true };

    // Apps that allows users to show offers either user is subscribe or not
    const allowedApps = [1, 10]
    if (!allowedApps.includes(Number(req.app_id))) {
        req.programWhere = {};
    }

    if (req.user) {
        res.set("user_id", req.user.id)
        const _prog = await userPrograms(req);
        if (_prog.length > 0) {
            req.programWhere = function () {
                this.whereIn("programs.id", _prog.map((p) => {
                    return p.program_id
                }))
                if (req.app_id == 1) {
                    this.orWhere({ "programs.is_purchase": true })
                }
            }
        }
    }
    let _city = [];
    if (dev_loc.city !== undefined) {
        _city = await db("cities")
            .select(["cities.id as id"])
            .innerJoin("program_cities", "cities.id", "program_cities.city_id")
            .innerJoin("programs", "program_cities.program_id", "programs.id")
            .innerJoin("app_programs", "programs.id", "app_programs.program_id")
            .where({ "app_programs.app_id": req.app_id })
            .where("programs.end_date", ">=", db.fn.now())
            .where(req.programWhere)
            .where({ "cities.is_active": true, "cities.deleted_at": null, "programs.is_active": true, "programs.deleted_at": null })
            .whereRaw(`LOWER(cities.name) = '${dev_loc.city.toLowerCase()}'`)
        if (_city.length < 1) {
            _city = await getDefaultCity(req);
        }
    } else {
        _city = await getDefaultCity(req);
    }
    req.city = _city.map(item => item.id);
    next();
}