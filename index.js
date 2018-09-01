let application = require(`${__dirname}/config/server.js`);

const port = process.env.PORT || 8080;

application.listen(port, () =>
{
    console.log(`\nServidor online na porta: ${port}`);
});
