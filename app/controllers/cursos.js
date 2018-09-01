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
    if(typeof(request.query.limit) === "undefined" || typeof(request.query.offset) === "undefined")
    {
        application.app.controllers.utils.tratativaRequisicaoFaltandoDados(application, request, response);
        return;
    }

    const dadosReq =
    {
        txConsulta: typeof(request.query.txConsulta) === "undefined" ? "%" : `%${request.query.txConsulta}%`,        
        limit: request.query.limit,
        offset: request.query.offset
    };

    const CursosDAO = new application.app.models.CursosDAO(application.config.dbConnection);
    
    try {
        const consulta = await CursosDAO.buscaIntervalo(
            {
                order: dadosReq.order,
                limit: dadosReq.limit,
                offset: dadosReq.offset,
                txConsulta: dadosReq.txConsulta
            });
            
        const count = consulta.pop();
        const rows = consulta.map(curso => { return { curso } });
        
        response.send(JSON.stringify({ total: count, rows: rows }));
    } catch (error) {
        tratativaErrosConsultas(error);
    }
};

/**
 * Responde a particula de administração de cursos
 * 
 * @param {Application} application 
 * @param {Request} request 
 * @param {Response} response 
 */
module.exports.administrar = (application, request, response) => { response.render("admin/cursos") };

/**
 * Cadastra um novo curso
 * 
 * @param {Application} application 
 * @param {Request} request 
 * @param {Response} response 
 */
module.exports.inserir = async (application, request, response) =>
{
    if(typeof(request.body.curso.descricao) === "undefined" || typeof(request.body.curso.sigla) === "undefined")
    {
        application.app.controllers.utils.tratativaRequisicaoFaltandoDados(application, request, response);
        return;
    }
    
    const dadosReq = 
    {
        curso: { descricao: request.body.curso.descricao, sigla: request.body.curso.sigla }
    };
    
    const CursosDAO = new application.app.models.CursosDAO(application.config.dbConnection);

    try {
        const conflitoDeNome = await CursosDAO.verificarConflitoDeNome({ descricao: dadosReq.curso.descricao });
        /* Evita conflito de nomes */
        if(conflitoDeNome[0].existe)
        {
            response.send({ status: "warning", title: "Erro!", msg: "Curso já existe no banco." });
            return;
        }

        await CursosDAO.inserir({ descricao: dadosReq.curso.descricao,  sigla: dadosReq.curso.sigla });
        response.send({ status: "success", title: "Sucesso!", msg: "Curso cadastrado com sucesso!" });
    } catch (error) {
        tratativaErrosConsultas(error, response);
    }
};

/**
 * Atualiza um curso no banco de dados
 * 
 * @param {Application} application 
 * @param {Request} request 
 * @param {Response} response 
 */
module.exports.atualizar = async (application, request, response) =>
{
    if(request.params.id === undefined || typeof(request.body.curso.descricao) === "undefined" || typeof(request.body.curso.sigla) === "undefined")
    {
        application.app.controllers.utils.tratativaRequisicaoFaltandoDados(application, request, response);
        return;
    }

    const dadosReq = 
    {
        curso: { id: request.params.id, descricao: request.body.curso.descricao, sigla: request.body.curso.sigla }
    };
    
    const CursosDAO = new application.app.models.CursosDAO(application.config.dbConnection);

    try {
        const conflitoDeNome = await CursosDAO.verificarConflitoDeNome({ id: dadosReq.curso.id, descricao: dadosReq.curso.descricao });
        /* Evita conflito de nomes */
        if(conflitoDeNome[0].existe)
        {
            response.send({ status: "warning", title: "Erro!", msg: "Curso já existe no banco." });
            return;
        }

        CursosDAO.atualizar({ id: dadosReq.curso.id, descricao: dadosReq.curso.descricao, sigla: dadosReq.curso.sigla });

        response.send({ status: "success", title: "Sucesso!", msg: "Curso " + dadosReq.curso.descricao + " atualizado com sucesso!" });
    } catch (error) {
        tratativaErrosConsultas(error, response)
    }
};