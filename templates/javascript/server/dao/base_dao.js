const mapValues = require("lodash/mapValues");
const map = require("lodash/map");
const assign = require("lodash/assign");
const { Op, col, fn } = require("sequelize")

const models = require("../../sequelize/index");

const getNestedModelsWithData = ({ children, data, parentData }) => {
  return map(children, ({ bodyKey, modelName, inheritFromParent }, i) => {
    const transformedData = map(data[bodyKey], (row) =>
      assign(
        {},
        row,
        mapValues(inheritFromParent, (k) => parentData[k])
      )
    );
    return { modelName, data: transformedData };
  });
};

class BaseDao {
  constructor(modelName) {
    this.modelName = modelName;
    this.model = models[modelName];
  }

  transformSearchParams(filters) {
    try {
      for (const key in filters) {
        if (!this.checkIdKeyParam(key) && filters[key] !== 'true' && filters[key] !== 'false' && typeof filters[key] === 'string') {
          filters[key] = { [Op.iLike]: `%${filters[key]}%` }
        }
      }
      return filters;
    } catch (error) {
      return filters
    }
  }

  checkIdKeyParam(key) {
    return key.replace(/\$/g, '').slice(-2) === "id";
  }

  async create(data) {
    const transaction = await models.sequelize.transaction();
    try {
      const createdObj = await this.model.create(data, { transaction });
      const children = this.model.getChildren && this.model.getChildren();
      if (children) {
        const nestedPayload = { children, data, parentData: createdObj };
        const nestedModels = getNestedModelsWithData(nestedPayload);
        await Promise.all(
          map(nestedModels, ({ modelName, _data }) => {
            return models[modelName].bulkCreate(_data, { transaction });
          })
        );
      }
      transaction.commit();
      return createdObj;
    } catch (error) {
      console.error(error);
      transaction.rollback();
      return Promise.reject(error);
    }
  }

  async singleCreate(data, options = {}) {
    const transaction = await models.sequelize.transaction();
    try {
      const createData = await this.model.create(data, { ...options, returning: true });
      transaction.commit();
      return createData;
    } catch (error) {
      console.error(error);
      transaction.rollback();
      return Promise.reject(error);
    }
  }

  async multiCreate(data, options = {}) {
    const transaction = await models.sequelize.transaction();
    try {
      const bulkCreateData = await this.model.bulkCreate(data, { ...options, returning: true });
      transaction.commit();
      return bulkCreateData;
    } catch (error) {
      console.error(error);
      transaction.rollback();
      return Promise.reject(error);
    }
  }

  async update(id, data) {
    if (data.status === "completed")
      data.completed_at = models.Sequelize.literal("now()");

    const updatedObj = await this.model.update(data, {
      where: { id },
      returning: true,
    });
    return updatedObj;
  }

  async updateByFilter(filter, data) {
    if (data.status === "completed")
      data.completed_at = models.Sequelize.literal("now()");

    const updatedObj = await this.model.update(data, {
      where: filter,
      returning: true,
    });
    return updatedObj;
  }

  async destroy({ where }) {
    const updatedObj = await this.model.destroy({ where });
    return updatedObj;
  }

  async softDelete({ payload = {}, where }) {
    const data = { ...payload, deleted_at: models.Sequelize.literal("now()"), is_deleted: true }
    const updatedObj = await this.model.update(data, { where, returning: true });
    return updatedObj;
  }

  async getById(id) {
    const record = await this.model.findByPk(id);
    return record ? record : null;
  }

  async getOne(params) {
    const { filter, sort = [], subQuery = true } = params;
    const { include, attributes } = params;
    const searchParams = this.transformSearchParams(filter);
    const whereClause = Object.assign({}, searchParams);
    const _params = { where: whereClause, order: sort };
    if (include) _params.include = include;
    if (attributes) _params.attributes = attributes;
    if (subQuery === false) _params.subQuery = false
    const record = await this.model.findOne(_params);
    return record ? record : null;
  }

  async getAll(params) { // this Function can run without pagination
    const { filter, sort, offset, limit, groupBy } = params;
    const { includeAll = false, include, attributes } = params;
    const searchParams = this.transformSearchParams(filter);
    const whereClause = Object.assign({}, searchParams);
    const _params = { where: whereClause, limit, offset, order: sort };
    if (includeAll) _params.include = [{ all: true }];
    if (include) _params.include = include;
    if (attributes) _params.attributes = attributes;
    if (groupBy) _params.group = groupBy;
    const { count, rows } = await this.model.findAndCountAll(_params);
    if (!rows) return null;
    return { count, records: rows };
  }

  async getAllAndCount(params) {
    const { filter, sort, offset = 0, limit = 20, groupBy, subQuery = true, groupById = true } = params;
    const { includeAll = false, include, attributes } = params;
    const searchParams = this.transformSearchParams(filter);
    const whereClause = Object.assign({}, searchParams);
    const _params = { where: whereClause, limit, offset, order: sort };
    if (includeAll) _params.include = [{ all: true }];
    if (include) _params.include = include;
    if (attributes) _params.attributes = attributes;
    if (groupBy) _params.group = groupBy;
    if (subQuery === false) _params.subQuery = false
    const records = await this.model.findAll(_params);
    if (attributes) _params.attributes = { ...attributes, include: [fn("COUNT", col(`${this.modelName}.id`)), "count"] };
    if (groupById) _params.group = [`${this.modelName}.id`];
    delete _params.offset;
    delete _params.limit;
    delete _params.subQuery;
    const count = (await this.model.count(_params)).length;
    if (!records) return null;
    return { count, records };
  }
}

module.exports = BaseDao;
