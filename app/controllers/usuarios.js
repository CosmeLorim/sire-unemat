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
 * Responde os dados de um intervalo de usuarios conforme os dados oriundos da requisição
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
    
    const UsuariosDAO = new application.app.models.UsuariosDAO(application.config.dbConnection);

    try {
        const buscaUsuarios = await UsuariosDAO.buscaIntervalo(
            {
                order: dadosReq.order,
                limit: dadosReq.limit,
                offset: dadosReq.offset,
                txConsulta: dadosReq.txConsulta
            });

        const count = buscaUsuarios.pop().count;
        
        response.send(JSON.stringify({ total: count, rows: buscaUsuarios }));
    } catch (error) {
        tratativaErrosConsultas(error);
    }
};

/**
 * Recupera o perfil do usuário
 * 
 * @param {Application} application 
 * @param {Request} request 
 * @param {Response} response 
 */
module.exports.buscarUm = async (application, request, response) =>
{
    if(typeof(request.params.id) === "undefined")
    {
        application.app.controllers.utils.tratativaRequisicaoFaltandoDados(application, request, response);
        return;
    }
    
    const dadosReq = { id: request.params.id };
    
    const UsuariosDAO = new application.app.models.UsuariosDAO(application.config.dbConnection);

    try {
        const buscaUsuarios = await UsuariosDAO.buscarPerfisPorUsuario({ id: dadosReq.id });

        const usuariosFormatados = buscaUsuarios.map(us => { return { id: us.id, ativo: us.ativo, tipoObjeto: us.tipo_objeto, usuario: us.usuario } });

        response.send(JSON.stringify(usuariosFormatados));
    } catch (error) {
        tratativaErrosConsultas(error);
    }
};

/**
 * Responde a particula de administração de usuário
 * 
 * @param {Application} application 
 * @param {Request} request 
 * @param {Response} response 
 */
module.exports.administrar = async (application, request, response) =>
{
    const UsuariosDAO = new application.app.models.UsuariosDAO(application.config.dbConnection);

    try {
        const buscaTiposObjetos = await UsuariosDAO.buscarTodosTiposObjetos();

        response.render("admin/usuarios", { tiposObjetos: buscaTiposObjetos });
    } catch (error) {
        tratativaErrosConsultas(error);
    }
};

/**
 * Cadastra um novo usuário
 * 
 * @param {Application} application 
 * @param {Request} request 
 * @param {Response} response 
 */
module.exports.inserir = async (application, request, response) =>
{
    if(typeof(request.body.usr)   === "undefined" || typeof(request.body.nome)  === "undefined" || typeof(request.body.passwd) === "undefined" ||
       typeof(request.body.admin) === "undefined")
    {
        application.app.controllers.utils.tratativaRequisicaoFaltandoDados(application, request, response);
        return;
    }

    const dadosReq = 
    {
        usr: request.body.usr,
        nome: request.body.nome,
        passwd: request.body.passwd,
        admin: JSON.parse(request.body.admin),
        perfil: request.body.perfil.map(
            perfil => { return { tipoObjeto: parseInt(perfil.tipoObjeto), ativo: JSON.parse(perfil.ativo) } })
    };

    const UsuariosDAO = new application.app.models.UsuariosDAO(application.config.dbConnection);

    try {
        const verificaUnicidade = await UsuariosDAO.verificarSeExiste({ usr: dadosReq.usr });

        if (verificaUnicidade[0].existe && dadosReq.usr !== '99999999999')
        {
            response.send({ status: "warning", title: "Erro!", msg: "Usuário já existe no banco." });
            return;
        }
        
        const idUsuarioCriado = await UsuariosDAO.inserir({ nome: dadosReq.nome, usr: dadosReq.usr, passwd: dadosReq.passwd, admin: dadosReq.admin });

        const tiposObjetos = dadosReq.perfil.filter(
            perfil => perfil.ativo).map(
                perfil => perfil.tipoObjeto);
                
        if (tiposObjetos.length === 0)
        {
            response.send({ status: "success", title: "Sucesso!", msg: "Usuário cadastrado com sucesso!" });
            return;
        }

        await UsuariosDAO.inserirPerfis({ tiposObjetos: tiposObjetos, usuario: idUsuarioCriado[0].id });

        response.send({ status: "success", title: "Sucesso!", msg: "Usuário cadastrado com sucesso!" });
    } catch (error) {
        tratativaErrosConsultas(error);
    }
};

/**
 * Atualiza um usuário no banco de dados
 * 
 * @param {Application} application 
 * @param {Request} request 
 * @param {Response} response 
 */
module.exports.atualizar = async (application, request, response) =>
{
    if(typeof request.params.usr === 'undefined')
    {
        application.app.controllers.utils.tratativaRequisicaoFaltandoDados(application, request, response);
        return;
    }

    const dadosReq = 
    {
        usr: request.params.usr,
        nome: request.body.nome,
        passwd: request.body.passwd,
        primeiro_login: request.body.primeiroLogin,
        admin: request.body.admin ? JSON.parse(request.body.admin) : request.body.admin,
        perfil: request.body.perfil
            ? request.body.perfil.map(perfil => { return { tipoObjeto: parseInt(perfil.tipoObjeto), ativo: JSON.parse(perfil.ativo) } })
            : request.body.perfil
    };
    
    const UsuariosDAO = new application.app.models.UsuariosDAO(application.config.dbConnection);

    try {
        const listaAtualizacoes = [];
        const dadosOriginais = await UsuariosDAO.buscarUsuarioPorUsr({ usr: dadosReq.usr });

        /* Filtra os atributos que o requisitante deseja atualizar */
        const atributosParaAtualizar = [];
        for(atributo in dadosOriginais[0])
        {
            if(dadosOriginais[0][atributo] !== dadosReq[atributo] && typeof dadosReq[atributo] !== 'undefined')
                atributosParaAtualizar.push({ chave: atributo, valor: dadosReq[atributo] });
        }
        
        if(atributosParaAtualizar.length)
            listaAtualizacoes.push(UsuariosDAO.atualizar({ atributos: atributosParaAtualizar, id: dadosOriginais[0].id }));

        if(dadosReq.perfil)
        {
            const perfisUsuario = await UsuariosDAO.buscarPerfisPorUsuario({ id: dadosOriginais[0].id });

            /* Captura os perfis para atualizar e monta na estrutura correta para atualização */
            const perfisParaAtualizar = perfisUsuario.filter(
                row => dadosReq.perfil.some(
                    perfil => perfil.tipoObjeto === row.tipo_objeto && perfil.ativo !== row.ativo
                )
            ).map(array => { return { id: array.id, ativo: !array.ativo } });

            if(perfisParaAtualizar.length !== 0)
                listaAtualizacoes.push(UsuariosDAO.alternarPerfis({ perfis: perfisParaAtualizar }));
                
            /* Encontra perfis para criar e monta na estrutura correta para cadastro */
            const perfisParaCriar = dadosReq.perfil.filter(
                perfil => (perfisUsuario.length === 0 && (!perfil.ativo)) ? false : perfisUsuario.every(
                    row => perfil.tipoObjeto !== row.tipo_objeto && perfil.ativo)).map(array => array.tipoObjeto);

            if(perfisParaCriar.length !== 0)
                listaAtualizacoes.push(UsuariosDAO.inserirPerfis({ tiposObjetos: perfisParaCriar, usuario: dadosOriginais[0].id }));
        }

        await Promise.all(listaAtualizacoes);
        response.send({ status: "success", title: "Sucesso!", msg: "Usuário atualizado com sucesso!" });
    } catch (error) {
        tratativaErrosConsultas(error, response);
    }
};
