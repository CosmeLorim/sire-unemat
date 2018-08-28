//  =====   RECUPERAÇÃO DE DADO   =====
module.exports.recuperarObjetos = (application, request, response) =>
{
    const txBusca = request.query.txBusca === undefined ? '%' : '%' + request.query.txBusca + '%';
    const limit = request.query.limit;
    const offset = request.query.offset;

    const callback = (error, results) =>
    {
        if (error)
        {
            response.send({status: 'alert', title: 'Erro!', msg: 'Erro no servidor.'});
            console.log('Erro na recuperação dos oferecimentos', error);
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
    const OferecimentosDAO = new application.app.models.OferecimentosDAO(connection);

    OferecimentosDAO.buscaIntervaloAtivo({txBusca: txBusca, limit: limit, offset: offset}, callback);
};

//  =====   ADMINISTRAÇÃO   =====
module.exports.administrar = (application, request, response) =>
{
    if (!application.app.controllers.autenticacao.verificarSeAutenticado(application, request, response))
    {
        application.app.controllers.autenticacao.tratativaRotaAdminNaoAutenticado(application, request, response);
        return;
    }

    const callbackPeriodos = (error, results) =>
    {
        if (error)
        {
            console.log('Erro na recuperação dos oferecimentos', error);
        } else
        {
            dados.periodos = results.rows;
            const UsuariosDAO = new application.app.models.UsuariosDAO(connection);
            UsuariosDAO.buscaTodosAtivo(callbackUsuarios);
        }
    };

    const callbackUsuarios = (error, results) =>
    {
        if (error)
        {
            console.log('Erro na recuperação do usuários ativos', error);
        } else
        {
            dados.usuarios = results.rows;
            response.render('admin/oferecimentos', {dados: dados});
        }
    };

    let dados = {periodos: [], usuarios: [], disciplinas: []};
    const connection = application.config.dbConnection;
    const PeriodosDAO = new application.app.models.PeriodosDAO(connection);
    PeriodosDAO.buscarTodos(callbackPeriodos);
};

//  =====   CADASTRO   =====
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
            console.log('Erro na verificação de oferecimentos por período e disciplina: ', error);
        } else
        {
            if (results.rowCount === 0)
            {
                OferecimentosDAO.inserirComDisciplina(dadosForm.disciplina, dadosForm.periodo, dadosForm.usuario, callbackInsercao);
            } else
            if (!results.rows[0].ativo)
                OferecimentosDAO.reativativar(results.rows[0].id, callbackInsercao);
            else
                response.send({status: 'alert', title: 'Erro!', msg: 'Oferecimento já existe no banco.'});
        }
    };

    const callbackInsercao = (error, results) =>
    {
        if (error)
        {
            response.send({status: 'alert', title: 'Erro!', msg: 'Erro no servidor.'});
            console.log('Erro no cadastro de oferecimento: ', error);
        } else
            response.send({status: 'success', title: 'Sucesso!', msg: 'Oferecimento cadastrado com sucesso!'});
    };

    const dadosForm = request.body;
    const connection = application.config.dbConnection;
    const OferecimentosDAO = new application.app.models.OferecimentosDAO(connection);

    OferecimentosDAO.busca(dadosForm.periodo, dadosForm.usuario, dadosForm.disciplina, callbackVerificacao);
};

//  =====   CANCELAMENTO   =====
module.exports.desativar = (application, request, response) =>
{
    if (!application.app.controllers.autenticacao.verificarSeAutenticado(application, request, response))
    {
        application.app.controllers.autenticacao.tratativaRequisicoesNaoAutenticadas(application, request, response);
        return;
    }

    const dadosForm = request.body;
    const connection = application.config.dbConnection;
    const OferecimentosDAO = new application.app.models.OferecimentosDAO(connection);

    const callback = (error, results) =>
    {
        if (error)
        {
            response.send({status: 'alert', title: 'Erro!', msg: 'Erro no servidor.'});
            console.log('Erro ao atualizar oferecimento: ', error);
        } else
            response.send({status: 'success', title: 'Sucesso!', msg: 'Oferecimento atualizado com sucesso!'});
    };

    OferecimentosDAO.desativar(dadosForm.id, callback);
};