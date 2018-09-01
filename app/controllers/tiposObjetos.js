/**
 * Trata erros de chamadas assíncronas.
 * 
 * @param {String} error
 */
const tratativaErrosConsultas = (error, response) =>
{
    console.error(error);
    response.send({ status: "alert", title: "Erro!", msg: "Erro no servidor." });
}

/**
 * Responde os dados de um intervalo de tipos de objetos conforme os dados oriundos da requisição.
 * 
 * @param {Application} application 
 * @param {Request} request 
 * @param {Response} response
 */
module.exports.buscar = async (application, request, response) =>
{
    const dadosReq =
    {
        txConsulta: typeof(request.query.txConsulta) === "undefined" ? "%" : `%${request.query.txConsulta}%`,
        limit: request.query.limit,
        offset: request.query.offset,
    };

    if(typeof(dadosReq.txConsulta) === "undefined" || typeof(dadosReq.limit) === "undefined" || typeof(dadosReq.offset) === "undefined")
    {
        application.app.controllers.utils.tratativaRequisicaoFaltandoDados(application, request, response);
        return;
    }

    const TiposObjetosDAO = new application.app.models.TiposObjetosDAO(application.config.dbConnection);

    try {
        const tiposObjetoConsulta = await TiposObjetosDAO.buscaIntervalo(
            {
                order: dadosReq.order,
                limit: dadosReq.limit,
                offset: dadosReq.offset,
                txConsulta: dadosReq.txConsulta
            });

        const count = tiposObjetoConsulta.pop().count;
        const tiposObjeto = tiposObjetoConsulta.map(tipoObjeto => { return { tipoObjeto } })

        response.send(JSON.stringify({ total: count, rows: tiposObjeto }));
    } catch (error) {
        tratativaErrosConsultas(error);
    }
};

/**
 * Responde a particula de administração de tipos de objetos.
 * 
 * @param {Application} application 
 * @param {Request} request 
 * @param {Response} response 
 */
module.exports.administrar = (application, request, response) => { response.render('admin/tiposobjetos') };

/**
 * Cadastra um novo tipo de objeto.
 * 
 * @param {Application} application 
 * @param {Request} request 
 * @param {Response} response 
 */
module.exports.inserir = async (application, request, response) =>
{
    if(typeof(request.body.tipoObjeto.descricao) === "undefined")
    {
        application.app.controllers.utils.tratativaRequisicaoFaltandoDados(application, request, response);
        return;
    }

    const dadosReq = 
    {
        tipoObjeto: { descricao: request.body.tipoObjeto.descricao }
    };

    const TiposObjetosDAO = new application.app.models.TiposObjetosDAO(application.config.dbConnection);

    try {
        const buscaTipoObjeto = await TiposObjetosDAO.verificarSeExiste({ descricao: dadosReq.tipoObjeto.descricao });

        if (buscaTipoObjeto[0].existe)
        {
            response.send({ status: 'warning', title: 'Erro!', msg: 'Categoria já existe no banco.' });
            return;
        }
        
        await TiposObjetosDAO.inserir({ descricao: dadosReq.tipoObjeto.descricao });

        response.send({status: 'success', title: 'Sucesso!', msg: 'Categoria cadastrada com sucesso!'});
    } catch (error) {
        tratativaErrosConsultas(error);
    }
};

/**
 * Atualiza um tipo de objeto no banco de dados.
 * 
 * @param {Application} application 
 * @param {Request} request 
 * @param {Response} response 
 */
module.exports.atualizar = async (application, request, response) =>
{
    if(request.params.id === "undefined" || typeof(request.body.tipoObjeto.descricao) === "undefined")
    {
        application.app.controllers.utils.tratativaRequisicaoFaltandoDados(application, request, response);
        return;
    }

    const dadosReq = {
        tipoObjeto: { id: request.params.id, descricao: request.body.tipoObjeto.descricao }
    };
    
    const TiposObjetosDAO = new application.app.models.TiposObjetosDAO(application.config.dbConnection);

    try {
        let conflitoDeNome;

        conflitoDeNome = await TiposObjetosDAO.verificaConflitoDeNome({ id: dadosReq.tipoObjeto.id, descricao: dadosReq.tipoObjeto.descricao });
        /* Evita atualização que cause conflito de nomes */
        if(conflitoDeNome[0].existe)
        {
            response.send({ status: "warning", title: "Erro!", msg: "Esta descrição já existe em outra categoria." });
            return;
        }

        await TiposObjetosDAO.atualizar({ id: dadosReq.tipoObjeto.id, descricao: dadosReq.tipoObjeto.descricao });
    
        response.send({ status: 'success', title: 'Sucesso!', msg: `Categoria ${dadosReq.tipoObjeto.descricao} atualizado com sucesso!` });
    } catch (error) {
        tratativaErrosConsultas(error, response);
    }
};