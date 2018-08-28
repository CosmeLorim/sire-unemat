module.exports = function(application)
{
    application.get('/', (request, response) =>
    {
        application.app.controllers.inicio.index(application, request, response);
    });

    application.post('/autenticar', (request, response) =>
    {
        application.app.controllers.index.autenticar(application, request, response);
    });
};