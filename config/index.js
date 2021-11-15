var schema = require('./schema/schema');

var environmentConfig = require('./environments/'+schema.get('environment')+'.json');

schema.load(environmentConfig);
schema.validate({
	strict: true
});
module.exports = schema;