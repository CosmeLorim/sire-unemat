/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

/*
 * API de autenticação
 */
module.exports = (application) =>
{
    application.post('/autenticar', (request, response) =>
    {
        application.app.controllers.autenticacao.autenticar(application, request, response);
    });
    application.get('/sair', (request, response) =>
    {
        application.app.controllers.autenticacao.sair(application, request, response);
    });
};
