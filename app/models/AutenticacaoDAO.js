/**
 * Classe DAO referente ao controller "autenticacao".
 * 
 * @class AutenticacaoDAO
 */
class AutenticacaoDAO
{
    /**
     * Cria uma Instância de AutenticacaoDAO.
     * 
     * @param {ConnectionConfig} connection 
     * @memberof AutenticacaoDAO
     */
    constructor(connection)
    {
        this._pool = connection;
    }

    /**
     * Busca dos dados necessários do usuário para autenticação e criação da sessão.
     * Busca por: usuarios.usr
     * 
     * @param {Object} dados 
     * @param {String} dados.usr
     * @returns {Promise(resolve, results)} Promise
     * @memberof AutenticacaoDAO
     */
    buscarUsuario(dados)
    {
        const text = `SELECT id, nome, usr, passwd, admin, primeiro_login FROM usuarios WHERE usr ILIKE '${dados.usr}' LIMIT 1;`;
        // console.log(text);
        
        return this._query(text, 'application.app.models.AutenticacaoDAO.buscarUsuario');
    }

    /**
     * Verifica se o usuário possui oferecimento ativo no período ativo.
     * Busca por: usuarios.usr
     * 
     * @param {Object} dados 
     * @param {String} dados.usr
     * @returns {Promise(resolve, results)} Promise
     * @memberof AutenticacaoDAO
     */
    verificarOferecimento(dados)
    {
        const subConsulta = `SELECT `+
                                `count(0) `+
                            `FROM `+
                                `oferecimentos of `+
                            `INNER JOIN `+
                                `periodos p ON p.id = of.periodo `+
                            `INNER JOIN `+
                                `usuarios us ON us.id = of.usuario `+
                            `WHERE `+
                                `us.usr ilike '${dados.usr}' `+
                            `AND `+
                                `p.ativo = TRUE `+
                            `AND `+
                                `of.ativo = TRUE `+
                            `LIMIT 1`;
                            
        const text = `SELECT `+
                        `(${subConsulta}) > 0 AS possui, nome, admin `+
                    `FROM `+
                        `usuarios `+
                    `WHERE `+
                        `usr ILIKE '${dados.usr}';`;
        // console.log(text);
        
        return this._query(text, 'application.app.models.AutenticacaoDAO.verificarOferecimento');
    }

    /**
     * Metodo interno para execução da query.
     * 
     * @param {Object} dados 
     * @param {String} dados.sql 
     * @param {String} dados.metodo
     * @returns {Promise(resolve, results)} Promise
     * @memberof AutenticacaoDAO
     */
    _query(sql, metodo)
    {
        return new Promise((resolve, reject) =>
        {
            this._pool.query(sql, (error, results) =>
            {
                if (error)
                {
                    error.metodo = metodo;
                    error.sql = sql;
                    reject(error);
                } else
                    resolve(results.rows);
            });
        });
    }
}

module.exports = () => AutenticacaoDAO;