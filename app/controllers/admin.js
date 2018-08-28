module.exports.admin = (application, request, response) =>
{
    if (!application.app.controllers.autenticacao.verificarSeAutenticado(application, request, response))
    {
        response.redirect('/');
        return;
    }
    if (request.session.admin)
    {
        response.render('admin', {usuario: request.session.nome});
    } else {
        response.send('You are not administrator!');
    }
};