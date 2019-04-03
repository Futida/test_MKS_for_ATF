const config = {
    user: 'atf_user',
    database: 'atf_demo',
    password: '1q2w3e4r5t',
    port: 5432
};
// postgres://${username}:${password}@${localhost}/${database}
const connectionString = "postgres://admin:admin@10.2.9.96/atf_demo";

module.exports = {
    config: config,
    connectionString: connectionString
};