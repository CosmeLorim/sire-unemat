/*              RECUPERAÇÃO DE DADOS DE TIPOS DE OBJETOS                                */
module.exports.recuperarObjetos = (application, request, response) =>
{
    let _aux = request.query.txconsulta === undefined ? '' : request.query.txconsulta;

    const adcionais =
            {
                ordem: request.query.order,
                limit: request.query.limit,
                offset: request.query.offset,
                txconsulta: '%' + _aux + '%'
            };

    const connection = application.config.dbConnection;
    let TiposObjetosDAO = new application.app.models.TiposObjetosDAO(connection);

    let callback = (error, results) =>
    {
        if (error)
        {
            response.send({status: 'alert', title: 'Erro!', msg: 'Erro no servidor.'});
            console.log('Erro em recuperar objetos:', error);
        } else
        {
            const count = results.rows[results.rows.length -1].count;
            results.rows.pop();
            
            response.send(JSON.stringify(
                    {
                        total: count,
                        rows: results.rows
                    }
            ));
        }
    };

    TiposObjetosDAO.buscaIntervalo(adcionais, callback);
};

/*              ADMINISTRAÇÃO DOS CATEGORIAS                                */
module.exports.administrar = (application, request, response) =>
{
    if (!application.app.controllers.autenticacao.verificarSeAutenticado(application, request, response))
    {
        application.app.controllers.autenticacao.tratativaRotaAdminNaoAutenticado(application, request, response);
        return;
    }
    
    response.render('admin/tiposobjetos');
};

/*               CADASTRO DE TIPOS DE OBJETOS                                */
module.exports.inserir = (application, request, response) =>
{
    if (!application.app.controllers.autenticacao.verificarSeAutenticado(application, request, response))
    {
        application.app.controllers.autenticacao.tratativaRequisicoesNaoAutenticadas(application, request, response);
        return;
    }
    
    let dados = request.body;
    const connection = application.config.dbConnection;
    let TiposObjetosDAO = new application.app.models.TiposObjetosDAO(connection);

    let callbackVerificacao = (error, results) =>
    {
        if (error)
        {
            response.send({status: 'alert', title: 'Erro!', msg: 'Erro no servidor.'});
            console.log('Erro na verificação de categoria: ', error);
        } else
        {
            if (results.rowCount === 0)
                TiposObjetosDAO.inserir([dados.descricao, dados.ativo], callbackInsercao);
            else
                response.send({status: 'alert', title: 'Erro!', msg: 'Categoria já existe no banco.'});
        }
    };

    let callbackInsercao = (error, results) =>
    {
        if (error)
        {
            response.send({status: 'alert', title: 'Erro!', msg: 'Erro no servidor.'});
            console.log('Erro no cadastro de categoria: ', error);
        } else
            response.send({status: 'success', title: 'Sucesso!', msg: 'Categoria cadastrada com sucesso!'});
    };
    TiposObjetosDAO.busca(dados.descricao, callbackVerificacao);
};

/*              ATUALIZAÇÃO DE TIPOS DE OBJETOS                                */
module.exports.atualizar = (application, request, response) =>
{
    if (!application.app.controllers.autenticacao.verificarSeAutenticado(application, request, response))
    {
        application.app.controllers.autenticacao.tratativaRequisicoesNaoAutenticadas(application, request, response);
        return;
    }
    
    let dados = request.body;
    const connection = application.config.dbConnection;
    let TiposObjetosDAO = new application.app.models.TiposObjetosDAO(connection);

    let callback = (error, results) =>
    {
        if (error)
        {
            response.send({status: 'alert', title: 'Erro!', msg: 'Erro no servidor.'});
            console.log('Erro: ', error);
        } else
            response.send({status: 'success', title: 'Sucesso!', msg: 'Categoria ' + dados.descricao + ' atualizado com sucesso!'});
    };
    
    TiposObjetosDAO.atualizar([dados.id, dados.descricao, dados.ativo], callback);
};