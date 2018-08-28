module.exports = (application)=>
{
    application.get('/admin', (request, response) =>
    {
        application.app.controllers.admin.admin(application, request, response);
    });
};