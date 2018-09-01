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
 * Responde os dados de um intervalo de cursos conforme os dados oriundos da requisição
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

    const ObjetosDAO = new application.app.models.ObjetosDAO(application.config.dbConnection);

    try {
        const consulta = request.session.admin ? 
        await ObjetosDAO.buscaIntervalo({ limit: dadosReq.limit,offset: dadosReq.offset,txConsulta: dadosReq.txConsulta })
        : await ObjetosDAO.buscaIntervaloPorPerfisDoUsuario(
            {
                usr: request.session.usr,
                limit: dadosReq.limit,
                offset: dadosReq.offset,
                txConsulta: dadosReq.txConsulta
            });

        const count = consulta.pop().count;
        const rows = consulta.map(row =>
        {
            return {
                objeto: { id: row.objid, descricao: row.objdescricao, ativo: row.objativo },
                tipoObjeto: { id: row.tipobjid, descricao: row.tipobjdescricao }
            }
        })
    
        response.send(JSON.stringify({ total: count, rows: rows }));
    } catch (error) {
        tratativaErrosConsultas(error);
    }
};

/**
 * Responde a particula de administração de objetos
 *  
 * @param {Application} application 
 * @param {Request} request 
 * @param {Response} response
 */
module.exports.administrar = async (application, request, response) =>
{
    const ObjetosDAO = new application.app.models.ObjetosDAO(application.config.dbConnection);

    try {
        const tiposObjetos = await ObjetosDAO.buscarTodosTiposObjetos();

        response.render("admin/objetos", { tiposObjetos: tiposObjetos });
    } catch (error) {
        tratativaErrosConsultas(error);
    }
};

/**
 * Cadastra um novo objeto
 * 
 * @param {Application} application 
 * @param {Request} request 
 * @param {Response} response 
 */
module.exports.inserir = async (application, request, response) =>
{
    if(typeof(request.body.descricao) === "undefined" || typeof(request.body.tipoObjeto) === "undefined" || typeof(request.body.ativo) === "undefined")
    {
        application.app.controllers.utils.tratativaRequisicaoFaltandoDados(application, request, response);
        return;
    }
    
    const dadosReq = { descricao: request.body.descricao, tipoObjeto: request.body.tipoObjeto, ativo: request.body.ativo };
    
    const ObjetosDAO = new application.app.models.ObjetosDAO(application.config.dbConnection);

    try {
        verificacaoDeUnicidade = await ObjetosDAO.verificarSeExiste({ descricao: dadosReq.descricao });

        if (verificacaoDeUnicidade[0].existe)
        {
            response.send({ status: "warning", title: "Erro!", msg: "Objeto já existe no banco." });
            return;
        }
        
        await ObjetosDAO.inserir({ descricao: dadosReq.descricao, tipoObjeto: dadosReq.tipoObjeto, ativo: dadosReq.ativo });
        
        response.send({ status: "success", title: "Sucesso!", msg: "Objeto cadastrado com sucesso!" });
    } catch (error) {
        tratativaErrosConsultas(error);
    }
};

/**
 * Atualiza um determinado objeto
 * 
 * @param {Application} application 
 * @param {Request} request 
 * @param {Response} response
 */
module.exports.atualizar = async (application, request, response) =>
{
    if(typeof(request.params.id)  === "undefined" || typeof(request.body.descricao) === "undefined" || typeof(request.body.tipoObjeto) === "undefined" ||
       typeof(request.body.ativo) === "undefined")
    {
        application.app.controllers.utils.tratativaRequisicaoFaltandoDados(application, request, response);
        return;
    }
    
    const dadosPost = 
    {
        id: request.params.id,
        descricao: request.body.descricao,
        tipoObjeto: request.body.tipoObjeto,
        ativo: JSON.parse(request.body.ativo)
    };
    
    const ObjetosDAO = new application.app.models.ObjetosDAO(application.config.dbConnection);

    try {
        const conflitoDeNome = await ObjetosDAO.verificaConflitoDeNome({ id: dadosPost.id, descricao: dadosPost.descricao });
        /* Evita atualização que cause conflito de nomes */
        if(conflitoDeNome[0].existe)
        {
            response.send({ status: "warning", title: "Erro!", msg: "Esta descrição já existe em outro objeto." });
            return;
        }

        const estadoObjeto = await ObjetosDAO.buscarEstado({ id: dadosPost.id });
        /* Desativa e atualiza ou somente atualiza */
        if(estadoObjeto[0].ativo && !dadosPost.ativo)
            await Promise.all(
                [
                    ObjetosDAO.desativacao({ objeto: dadosPost.id }),
                    ObjetosDAO.atualizar({ id: dadosPost.id, descricao: dadosPost.descricao, ativo: dadosPost.ativo, tipoObjeto: dadosPost.tipoObjeto })
                ]);
        else
            await ObjetosDAO.atualizar({ id: dadosPost.id, descricao: dadosPost.descricao, ativo: dadosPost.ativo, tipoObjeto: dadosPost.tipoObjeto });

        response.send({ status: "success", title: "Sucesso!", msg: `Objeto ${dadosPost.descricao} atualizado com sucesso!` });
    } catch (error) {
        tratativaErrosConsultas(error, response);
    }
};