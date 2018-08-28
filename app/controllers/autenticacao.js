/*
 * Efetua a autenticação de usuário
 */
module.exports.autenticar = (application, request, response) =>
{
    const dadosForm = request.body;

    const callbackBuscaUsuario = (error, results) =>
    {
        if (error)
        {
            response.send({status: 'alert', title: 'Erro!', msg: 'Erro no servidor.'});
            console.log('Erro: ', error);
        } else
        {
            if (results.rows.length === 0)
            {
//                console.log('usuário ' + dadosForm.usr + ' não encontrado');
                response.send({status: 'alert', title: 'Erro!', msg: 'Usuário não encontrado.'});
                return;
            }
            if (results.rows[0].ativo === 'false')
            {
//                console.log('usuário ' + dadosForm.usr + ' inativo');
                response.send({status: 'alert', title: 'Erro!', msg: 'Usuário inativo.'});
                return;
            }
            if (results.rows[0].passwd !== dadosForm.passwd)
            {
//                console.log('senha incorreta');
                response.send({status: 'alert', title: 'Erro!', msg: 'Senha incorreta.'});
                return;
            } else
            {
//                console.log('acesso permitido para ' + dadosForm.usr + ', redirecionando para área administrativa.');
                request.session.autorizado = true;
                request.session.usr = dadosForm.usr;
                request.session.nome = results.rows[0].nome;
                request.session.admin = results.rows[0].admin;
                response.send({status: 'success'});
            }
        }
    };

    const connection = application.config.dbConnection;
    const UsuariosDAO = new application.app.models.UsuariosDAO(connection);

    UsuariosDAO.buscarPorUsr(dadosForm.usr, callbackBuscaUsuario);
};

/*
 * Efetua o logoff de usuário
 */
module.exports.sair = (application, request, response) =>
{
    request.session.destroy((error) =>
    {
        response.redirect('/');
    });
};

/*
 * Verifica se quem requisitou está autenticado
 */
module.exports.verificarSeAutenticado = (application, request, response) =>
{
    return request.session.autorizado;
};

/*
 * Trata a requisição de rotas administrativas quando não está logado
 */
module.exports.tratativaRotaAdminNaoAutenticado = (application, request, response) =>
{
    response.send('<center><h2>Você não está logado, retorne a <a href="/">página inicial</a> e faça login</h2></center>');
};

/*
 * Trata as requisições não autenticadas
 */
module.exports.tratativaRequisicoesNaoAutenticadas = (application, request, response) =>
{
    response.send({status: 'alert', title: 'Erro de autenticação!', msg: 'Você não pode fazer essa ação sem estar logado, faça login e tente novamente!'});
};