let pg = require('pg');

connPg = () =>
{
    var config = 
    {
        user: 'postgres',
        database: 'reservas_v1',
        password: '1234',
        host: 'localhost',
        port: 5432,
        max: 10,
        idleTimeoutMillis: 2000
    };
    
    return new pg.Pool(config);
};

module.exports = () =>
{ 
    return connPg();
};
