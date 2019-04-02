const config = {
    user: 'admin',
    database: 'test',
    password: 'admin',
    port: 5432
};
// postgres://${username}:${password}@${localhost}/${database}
const connectionString = "postgres://admin:admin@localhost:5432/test";

module.exports = {
    config: config,
    connectionString: connectionString
};