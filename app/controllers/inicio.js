/**
 * Responde a página inicial
 * 
 * @param {Application} application 
 * @param {Request} request 
 * @param {Response} response 
 */
module.exports.inicio = (application, request, response) =>
{
    /**
     * Configuração de conexão com o banco de dados
     */
    const connection = application.config.dbConnection;

    /**
     * Instância da classe DAO de conexão com o banco de dados com configuração de conexão pronta
     */
    const InicioDAO = new application.app.models.InicioDAO(connection);

    /**
     * Callback para a consulta no banco de dados
     * Faz tratativa de erros de acesso ao banco, reporta caso haja erro na consulta e
     * envia os dados recuperados durante a consulta
     * 
     * @param {Error} error 
     * @param {QueryResult} results 
     */
    const callback = (error, results) =>
    {
        /**
         * Responde se houve erro ou sucesso durante a requisição com o banco de dados e
         * faz log do erro
         */
        if (error)
        {
            response.send({status: "alert", title: "Erro!", msg: "Erro no servidor."});
            console.log("Erro na recuperação dos tipos de objeto:", error);
        } else
        {
            /**
             * Rendezia a página inicial
             */
            response.render("inicio",
                {
                    tiposObjetos: results.rows,
                    usuario: request.session.nome,
                    admin: request.session.admin,
                    autenticado: request.session.autorizado ? request.session.autorizado : false,
                    tempoSessao: parseInt(process.env.EXPRESS_COOKIE_MAXAGE)
                });
        }
    };
    
    /**
     * Efetua a consulta de tipos de objetos
     */
    InicioDAO.buscaTiposObjetos(callback);
};