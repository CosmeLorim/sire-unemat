const pg = require('pg');

const connPg = () =>
{
    const config = 
    {
        user: process.env.POSTGRE_USER,
        database: process.env.POSTGRE_DATABASE,
        password: process.env.POSTGRE_PASSWORD,
        host: process.env.POSTGRE_HOST,
        port: process.env.POSTGRE_PORT,
        max: 10,
        idleTimeoutMillis: 2000
    };
    
    return new pg.Pool(config);
};

module.exports = () =>
{ 
    return connPg();
};
