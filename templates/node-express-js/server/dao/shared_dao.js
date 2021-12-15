const models = require("../sequelize/index");
const Model = require('sequelize/lib/model');
const { DateTime } = require("luxon");
/*
0 is sunday
and 
6 saturday
luxon logic
Get the day of the week. 1 is Monday and 7 is Sunday
*/


const currentDayOfWeek = (time_zone) => {
    const dayMapper = DateTime.local({ zone: time_zone }).weekday;
    if (dayMapper === 7) { return 0 }
    else { return dayMapper }
}

function subQueryForProductVisiblities(time_zone) {
    const queryOptions = {
        include: [
            {
                model: models.product_visibility_configs,
                where: {
                    is_active: true,
                    is_deleted: false,
                    start_time: {
                        [models.Sequelize.Op.lte]: DateTime.local({ zone: time_zone }).toFormat("HH:mm:ss")
                    },
                    end_time: {
                        [models.Sequelize.Op.gte]: DateTime.local({ zone: time_zone }).toFormat("HH:mm:ss")
                    },
                    day: currentDayOfWeek(time_zone)
                },
                as: 'product_visibility_configs',
                attributes: [],
                required: true,
            }
        ],
        where: {
            is_active: true,
            is_deleted: false,
            valid_from: {
                [models.Sequelize.Op.lte]: DateTime.local({ zone: time_zone })
            },
            valid_till: {
                [models.Sequelize.Op.gte]: DateTime.local({ zone: time_zone })
            }
        },
        attributes: ["id"]
    };
    Model._validateIncludedElements.bind(models.product_visibilities)(queryOptions);
    return models.sequelize.dialect.queryGenerator.selectQuery('product_visibilities', queryOptions, models.product_visibilities).slice(0, -1);
}

function subQueryForOpeningHour(time_zone) {
    const queryOptions = {
        include: [
            {
                model: models.opening_hour_configs,
                where: {
                    is_active: true,
                    is_deleted: false,
                    start_time: {
                        [models.Sequelize.Op.lte]: DateTime.local({ zone: time_zone }).toFormat("HH:mm:ss")
                    },
                    end_time: {
                        [models.Sequelize.Op.gte]: DateTime.local({ zone: time_zone }).toFormat("HH:mm:ss")
                    },
                    day: currentDayOfWeek(time_zone)
                },
                as: 'configs',
                attributes: [],
                required: true,
            }
        ],
        where: {
            is_active: true,
            is_deleted: false,
        },
        attributes: ["id"]
    };
    Model._validateIncludedElements.bind(models.opening_hours)(queryOptions);
    return models.sequelize.dialect.queryGenerator.selectQuery('opening_hours', queryOptions, models.opening_hours).slice(0, -1);
}

function subQueryForUserPrograms(user_id, app_id) {
    const queryOptions = {
        include: [
            {
                model: models.programs,
                as: "program",
                where: {
                    deleted_at: null,
                    is_active: true,
                    start_date: {
                        [models.Sequelize.Op.lte]: DateTime.now()
                    },
                    end_date: {
                        [models.Sequelize.Op.gte]: DateTime.now()
                    },
                },
                attributes: [],
                required: true,
            }
        ],
        where: {
            user_id, app_id,
            expires_on: {
                [models.Sequelize.Op.gte]: DateTime.now()
            },
            [models.Sequelize.Op.or]: [
                {
                    '$program.is_purchase$': true
                },
                {
                    user_id
                },
            ],
        },
        attributes: [["program_id", "id"]]
    };
    Model._validateIncludedElements.bind(models.payment_logs)(queryOptions);
    return models.sequelize.dialect.queryGenerator.selectQuery('payment_logs', queryOptions, models.payment_logs).slice(0, -1);
}

function subQueryForProductOrderTimes(time_zone) {
    const queryOptions = {
        include: [
            {
                model: models.product_order_time_slot_configs,
                where: {
                    is_active: true,
                    is_deleted: false,
                    start_time: {
                        [models.Sequelize.Op.lte]: DateTime.local({ zone: time_zone }).toFormat("HH:mm:ss")
                    },
                    end_time: {
                        [models.Sequelize.Op.gte]: DateTime.local({ zone: time_zone }).toFormat("HH:mm:ss")
                    },
                    day: currentDayOfWeek(time_zone)
                },
                as: 'configs',
                attributes: [],
                required: true,
            }
        ],
        where: {
            is_active: true,
            is_deleted: false,
        },
        attributes: ["id"]
    };
    Model._validateIncludedElements.bind(models.product_order_time_slots)(queryOptions);
    return models.sequelize.dialect.queryGenerator.selectQuery('product_order_time_slots', queryOptions, models.product_order_time_slots).slice(0, -1);
}

function subQueryForProductBookingAssociationWithOutlet(time_zone) {
    const model_name = "product_bookings"
    const queryOptions = {
        include: [
            {
                model: models.outlet_product_bookings,
                where: {
                    is_deleted: false,
                },
                as: 'outlet_product_bookings',
                attributes: [],
                required: true,
                include: [
                    {
                        model: models.outlets,
                        as: "outlet",
                        where: {
                            is_active: true,
                            deleted_at: null
                        },
                        attributes: [],
                        required: true,
                        include: [
                            {
                                model: models.outlet_configs,
                                as: "config",
                                where: {
                                    is_deleted: false,
                                    booking_opening_hour_id: {
                                        [models.Sequelize.Op.or]: {
                                            [models.Sequelize.Op.in]: models.Sequelize.literal(`(${subQueryForOpeningHour(time_zone)})`),
                                            [models.Sequelize.Op.eq]: null
                                        }
                                    },
                                },
                                attributes: [],
                                required: true,
                            },
                            {
                                model: models.merchants,
                                as: "merchant",
                                where: {
                                    is_active: true, deleted_at: null,
                                },
                                attributes: [],
                                required: true,
                            },
                        ]
                    }
                ],
            }
        ],
        group: [`${model_name}.id`],
        where: {
            is_active: true,
            is_deleted: false,
        },
        attributes: ["id"]
    };
    Model._validateIncludedElements.bind(models[model_name])(queryOptions);
    return models.sequelize.dialect.queryGenerator.selectQuery(model_name, queryOptions, models[model_name]).slice(0, -1);
}

function subQueryForOutletAssociationWithProductBooking() {
    const model_name = "outlets"
    const queryOptions = {
        include: [
            {
                model: models.outlet_product_bookings,
                where: {
                    is_deleted: false,
                },
                as: 'outlet_booking_associations',
                attributes: [],
                required: true,
                include: [
                    {
                        model: models.product_bookings,
                        as: "product_booking",
                        where: {
                            is_active: true,
                            is_deleted: false
                        },
                        attributes: [],
                        required: true,
                    }
                ],
            },
            {
                model: models.merchants,
                as: "merchant",
                where: {
                    is_active: true, deleted_at: null,
                },
                attributes: [],
                required: true,
            },
        ],
        group: [`${model_name}.id`],
        where: {
            is_active: true,
            deleted_at: null,
        },
        attributes: ["id"]
    };
    Model._validateIncludedElements.bind(models[model_name])(queryOptions);
    return models.sequelize.dialect.queryGenerator.selectQuery(model_name, queryOptions, models[model_name]).slice(0, -1);
}

module.exports = {
    subQueryForOpeningHour,
    subQueryForProductVisiblities,
    subQueryForUserPrograms,
    subQueryForProductOrderTimes,
    subQueryForProductBookingAssociationWithOutlet,
    subQueryForOutletAssociationWithProductBooking
}