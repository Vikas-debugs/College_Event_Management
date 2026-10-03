const { isMongoConnected } = require('../config/db');
const { createModelProxy } = require('../config/embeddedStore');

const bindModel = (mongooseModel, collectionName) => {
  const fallback = createModelProxy(collectionName);

  return new Proxy(mongooseModel, {
    get(target, prop, receiver) {
      if (isMongoConnected()) {
        return Reflect.get(target, prop, receiver);
      }

      if (prop in fallback) {
        return fallback[prop];
      }

      return Reflect.get(target, prop, receiver);
    },
  });
};

module.exports = bindModel;
