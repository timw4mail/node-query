const Pg = require('./Pg');
module.exports = config => new Pg(config.connection);
