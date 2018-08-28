/*              RECUPERAÇÃO DE DADOS DE PERIODOS                                */
module.exports.recuperarObjetos = (application, request, response) =>
{
    const txconsulta = request.query.txconsulta === undefined ? '%' : '%' + request.query.txconsulta % '%';
    const limit = request.query.limit;
    const offset = request.query.offset;

    const callback = (error, results) =>
    {
        if (error)
        {
            response.send({status: 'alert', title: 'Erro!', msg: 'Erro no servidor.'});
            console.log('Erro: na recuperação dos objetos', error);
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

    const connection = application.config.dbConnection;
    const PeriodosDAO = new application.app.models.PeriodosDAO(connection);

    PeriodosDAO.buscaIntervalo(txconsulta, limit, offset, callback);
};

/*              ADMINISTRAÇÃO DOS PERIODOS                                */
module.exports.administrar = (application, request, response) =>
{
    if (!application.app.controllers.autenticacao.verificarSeAutenticado(application, request, response))
    {
        application.app.controllers.autenticacao.tratativaRotaAdminNaoAutenticado(application, request, response);
        return;
    }
    
    response.render('admin/periodos');
};
/*               CADASTRO DE PERIODOS                                */
module.exports.inserir = (application, request, response) =>
{
    if (!application.app.controllers.autenticacao.verificarSeAutenticado(application, request, response))
    {
        application.app.controllers.autenticacao.tratativaRequisicoesNaoAutenticadas(application, request, response);
        return;
    }
    
    const callbackVerificacao = (error, results) =>
    {
        if (error)
        {
            response.send({status: 'alert', title: 'Erro!', msg: 'Erro no servidor.'});
            console.log('Erro na verificação de períodos: ', error);
        } else
        {
            if (results.rowCount === 0)
            {
                if (dadosForm.ativo === 'true')
                    PeriodosDAO.inserirAtivo(dadosForm.nome, dadosForm.data_inicio, dadosForm.data_fim, callbackInsercao);
                else
                    PeriodosDAO.inserirInativo(dadosForm.nome, dadosForm.data_inicio, dadosForm.data_fim, callbackInsercao);
            } else
                response.send({status: 'alert', title: 'Erro!', msg: 'Período já existe no banco.'});
        }
    };

    const callbackInsercao = (error, results) =>
    {
        if (error)
        {
            response.send({status: 'alert', title: 'Erro!', msg: 'Erro no servidor.'});
            console.log('Erro no cadastro de período: ', error);
        } else
            response.send({status: 'success', title: 'Sucesso!', msg: 'Período cadastrado com sucesso!'});
    };

    const dadosForm = request.body;
    const connection = application.config.dbConnection;
    const PeriodosDAO = new application.app.models.PeriodosDAO(connection);

    PeriodosDAO.busca(dadosForm.nome, callbackVerificacao);
};
/*              ATUALIZAÇÃO DE PERIODOS                                */
module.exports.atualizar = (application, request, response) =>
{
    if (!application.app.controllers.autenticacao.verificarSeAutenticado(application, request, response))
    {
        application.app.controllers.autenticacao.tratativaRequisicoesNaoAutenticadas(application, request, response);
        return;
    }
    
    const dadosForm = request.body;
    const connection = application.config.dbConnection;
    const PeriodosDAO = new application.app.models.PeriodosDAO(connection);

    const callback = (error, results) =>
    {
        if (error)
        {
            response.send({status: 'alert', title: 'Erro!', msg: 'Erro no servidor.'});
            console.log('Erro ao atualizar período: ', error);
        } else
            response.send({status: 'success', title: 'Sucesso!', msg: 'Período ' + dadosForm.nome + ' atualizado com sucesso!'});
    };
    PeriodosDAO.atualizar(dadosForm.id, dadosForm.nome, dadosForm.data_inicio, dadosForm.data_fim, dadosForm.ativo, callback);
};