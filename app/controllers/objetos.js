/*              RECUPERAÇÃO DE DADOS DE OBJETOS                                */
module.exports.recuperarObjetos = (application, request, response) =>
{
    const txconsulta = request.query.txconsulta === undefined ? '' : request.query.txconsulta;

    const adcionais =
            {
                limit: request.query.limit === undefined ? 10 : request.query.limit,
                offset: request.query.offset === undefined ? 0 : request.query.offset,
                txconsulta: '%' + txconsulta + '%'
            };

    const connection = application.config.dbConnection;
    const ObjetosDAO = new application.app.models.ObjetosDAO(connection);

    let callback = (error, results) =>
    {
        if (error)
        {
            response.send({status: 'alert', title: 'Erro!', msg: 'Erro no servidor.'});
            console.log('Erro na recuperação de objetos: ', error);
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

    ObjetosDAO.buscaIntervalo(adcionais, callback);
};

/*              RECUPERAÇÃO DE OBJETOS                             */
module.exports.administrar = (application, request, response) =>
{
    if (!application.app.controllers.autenticacao.verificarSeAutenticado(application, request, response))
    {
        application.app.controllers.autenticacao.tratativaRotaAdminNaoAutenticado(application, request, response);
        return;
    }
    
    const connection = application.config.dbConnection;
    let TiposObjetosDAO = new application.app.models.TiposObjetosDAO(connection);

    let callback = (error, results) =>
    {
        if (error)
            response.send(error);
        else
        {
            let dados =
                    {
                        tiposObjetos: results.rows
                    };
            response.render('admin/objetos', {dados: dados});
        }
    }
    ;

    TiposObjetosDAO.buscarTodos(callback);
};
/*              CADASTRO DE OBJETOS                                */
module.exports.inserir = (application, request, response) =>
{
    if (!application.app.controllers.autenticacao.verificarSeAutenticado(application, request, response))
    {
        application.app.controllers.autenticacao.tratativaRequisicoesNaoAutenticadas(application, request, response);
        return;
    }
    
    let dados = request.body;
    const connection = application.config.dbConnection;
    let ObjetosDAO = new application.app.models.ObjetosDAO(connection);

    let callbackVerificacao = (error, results) =>
    {
        if (error)
        {
            response.send({status: 'alert', title: 'Erro!', msg: 'Erro no servidor.'});
            console.log('Erro na verificação do objeto: ', error);
        } else
        {
            if (results.rowCount === 0)
                ObjetosDAO.inserir([dados.descricao, dados.ativo, dados.tipo_objeto], callbackInsercao);
            else
                response.send({status: 'alert', title: 'Erro!', msg: 'Objeto já existe no banco.'});
        }
    };

    let callbackInsercao = (error, results) =>
    {
        if (error)
        {
            response.send({status: 'alert', title: 'Erro!', msg: 'Erro no servidor.'});
            console.log('Erro no cadastro de objeto: ', error);
        } else
            response.send({status: 'success', title: 'Sucesso!', msg: 'Objeto cadastrado com sucesso!'});
    };

    ObjetosDAO.buscar(dados.descricao, callbackVerificacao);
};
/*              ATUALIZAÇÃO DE OBJETOS                            */
module.exports.atualizar = (application, request, response) =>
{
    if (!application.app.controllers.autenticacao.verificarSeAutenticado(application, request, response))
    {
        application.app.controllers.autenticacao.tratativaRequisicoesNaoAutenticadas(application, request, response);
        return;
    }
    
    const dados = request.body;
    const connection = application.config.dbConnection;
    const ObjetosDAO = new application.app.models.ObjetosDAO(connection);

    const callback = (error, results) =>
    {
        if (error)
        {
            response.send({status: 'alert', title: 'Erro!', msg: 'Erro no servidor.'});
            console.log('Erro ao atualizar objeto: ', error);
        } else
            response.send({status: 'success', title: 'Sucesso!', msg: 'Objeto ' + dados.descricao + ' atualizado com sucesso!'});
    };
    ObjetosDAO.atualizar([dados.id, dados.descricao, dados.ativo, dados.tipo_objeto], callback);
};