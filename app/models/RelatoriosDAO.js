/**
 * Classe DAO referente ao controller "relatorios".
 * 
 * @class RelatoriosDAO
 */
class RelatoriosDAO
{
    /**
     * Cria uma Instância de RelatoriosDAO.
     * 
     * @param {ConnectionConfig} connection 
     * @memberof RelatoriosDAO
     */
    constructor(connection)
    {
        this._pool = connection;
    }

    /**
     * Consulta dados para relatórios das reservas de um objeto em um determinado período de tempo.
     * 
     * @param {Object} dados 
     * @param {Number} dados.objeto
     * @param {Number} dados.dataInicio
     * @param {Number} dados.dataFim
     * @returns {Promise(resolve, results)} Promise
     * @memberof RelatoriosDAO
     */
    relatorioObjeto(dados)
    {
        const text = `SELECT res.id As reservaid, `+
                        `res.mat_aula_1, res.mat_aula_2, res.mat_aula_3, res.mat_aula_4, res.almoco, `+
                        `res.vesp_aula_1, res.vesp_aula_2, res.vesp_aula_3, res.vesp_aula_4, res.janta, `+
                        `res.not_aula_1, res.not_aula_2, res.not_aula_3, res.not_aula_4, res.data, `+
                        `op.descricao AS operacaodescricao, `+
                        `usr.nome AS usuarionome, `+
                        `disc.descricao AS disciplinadescricao, `+
                        `obj.descricao AS objetodescricao `+
        
                    `FROM oferecimentos ofer `+
        
                    `INNER JOIN usuarios usr ON usr.id = ofer.usuario `+
                    `LEFT JOIN disciplinas disc ON disc.id = ofer.disciplina `+
                    `INNER JOIN operacoes op ON op.oferecimento = ofer.id `+
                    `INNER JOIN reservas res ON res.operacao = op.id `+
                    `INNER JOIN objetos obj ON obj.id = res.objeto `+
        
                    `WHERE obj.id = ${dados.objeto} AND res.data >= ${dados.dataInicio} AND res.data <= ${dados.dataFim} `+
                    `AND res.ativo = TRUE `+

                    `ORDER BY res.data ASC, disc.descricao ASC, usr.nome ASC;`;
        // console.log(text);

        return this._query(text, 'application.app.models.RelatoriosDAO.relatorioObjeto');
    }
    
    /**
     * Consulta dados para relatórios das reservas de um usuário em um determinado período de tempo.
     * 
     * @param {Object} dados 
     * @param {Number} dados.usuario
     * @param {Number} dados.dataInicio
     * @param {Number} dados.dataFim
     * @returns {Promise(resolve, results)} Promise
     * @memberof RelatoriosDAO
     */
    relatorioUsuario(dados)
    {
        const text = `SELECT res.id As reservaid, `+
                        `res.mat_aula_1, res.mat_aula_2, res.mat_aula_3, res.mat_aula_4, res.almoco, `+
                        `res.vesp_aula_1, res.vesp_aula_2, res.vesp_aula_3, res.vesp_aula_4, res.janta, `+
                        `res.not_aula_1, res.not_aula_2, res.not_aula_3, res.not_aula_4, res.data, `+
                        `op.descricao AS operacaodescricao, `+
                        `usr.nome AS usuarionome, `+
                        `disc.descricao AS disciplinadescricao, `+
                        `obj.descricao AS objetodescricao `+

                    `FROM oferecimentos ofer `+

                    `INNER JOIN usuarios usr ON usr.id = ofer.usuario `+
                    `LEFT JOIN disciplinas disc ON disc.id = ofer.disciplina `+
                    `INNER JOIN operacoes op ON op.oferecimento = ofer.id `+
                    `INNER JOIN reservas res ON res.operacao = op.id `+
                    `INNER JOIN objetos obj ON obj.id = res.objeto `+
                    `AND res.ativo = TRUE `+
        
                    `WHERE usr.id = ${dados.usuario} AND res.data >= ${dados.dataInicio} AND res.data <= ${dados.dataFim} `+
                    `ORDER BY obj.descricao ASC, res.data ASC, disc.descricao ASC;`;
        // console.log(text);

        return this._query(text, 'application.app.models.RelatoriosDAO.relatorioUsuario');
    }

    /**
     * Consulta dados para relatórios das reservas de uma disciplina em um determinado período de tempo.
     * 
     * @param {Object} dados 
     * @param {Number} dados.disciplina
     * @param {Number} dados.dataInicio
     * @param {Number} dados.dataFim
     * @returns {Promise(resolve, results)} Promise
     * @memberof RelatoriosDAO
     */
    relatorioDisciplina(dados)
    {
        const text = `SELECT res.id As reservaid, `+
                        `res.mat_aula_1, res.mat_aula_2, res.mat_aula_3, res.mat_aula_4, res.almoco, `+
                        `res.vesp_aula_1, res.vesp_aula_2, res.vesp_aula_3, res.vesp_aula_4, res.janta, `+
                        `res.not_aula_1, res.not_aula_2, res.not_aula_3, res.not_aula_4, res.data, `+
                        `op.descricao AS operacaodescricao, `+
                        `usr.nome AS usuarionome, `+
                        `disc.descricao AS disciplinadescricao, `+
                        `obj.descricao AS objetodescricao `+

                    `FROM oferecimentos ofer `+

                    `INNER JOIN usuarios usr ON usr.id = ofer.usuario `+
                    `LEFT JOIN disciplinas disc ON disc.id = ofer.disciplina `+
                    `INNER JOIN operacoes op ON op.oferecimento = ofer.id `+
                    `INNER JOIN reservas res ON res.operacao = op.id `+
                    `INNER JOIN objetos obj ON obj.id = res.objeto `+
                    `AND res.ativo = TRUE `+
        
                    `WHERE disc.id = ${dados.disciplina} AND res.data >= ${dados.dataInicio} AND res.data <= ${dados.dataFim} `+
                    `ORDER BY obj.descricao ASC, res.data ASC, usr.nome ASC;`;
        // console.log(text);

        return this._query(text, 'application.app.models.RelatoriosDAO.relatorioDisciplina');
    }

    /**
     * Metodo interno para execução da query.
     * 
     * @param {Object} dados 
     * @param {String} dados.sql 
     * @param {String} dados.metodo
     * @returns {Promise(resolve, results)} Promise
     * @memberof RelatoriosDAO
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

module.exports = () => RelatoriosDAO;