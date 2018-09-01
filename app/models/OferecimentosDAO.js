/**
 * Classe DAO referente ao controller "oferecimentos".
 * 
 * @class OferecimentosDAO
 */
class OferecimentosDAO
{
    /**
     * Cria uma instância de OferecimentosDAO.
     * 
     * @param {ConnectionConfig} connection 
     * @memberof OferecimentosDAO
     */
    constructor(connection)
    {
        this._pool = connection;
    }

    /**
     * Recupera um intervalo definido de registros do banco.
     * Busca por: disciplina.descricao, usuario.usr, usuario.nome.
     * 
     * @param {Object} dados
     * @param {String} dados.txConsulta
     * @param {Number} dados.offset
     * @param {Number} dados.limit
     * @param {function({error: Error}, {results: QueryResult})} callback
     * @memberof OferecimentosDAO
     */
    buscaIntervaloAtivo(dados, callback)
    {
        const admin = dados.admin ? `us.usr = '${dados.admin}' AND ` : '';

        const text = `SELECT `+
                        `ofer.id, us.nome AS usuarionome, us.usr AS usuariousr, p.nome AS periodonome, COALESCE(di.descricao, 'Não atribuído') AS disciplina, `+
                        `COALESCE(cur.sigla, 'Não atribuído') AS sigla `+
                    `FROM `+
                        `oferecimentos ofer `+
                    `INNER JOIN periodos p ON p.id = ofer.periodo `+
                    `LEFT JOIN disciplinas di ON di.id = ofer.disciplina `+
                    `LEFT JOIN cursos cur ON cur.id = di.curso `+
                    `INNER JOIN usuarios us ON us.id = ofer.usuario `+
                    `WHERE `+
                        `${admin}` +
                        `ofer.ativo = TRUE `+
                    `AND `+
                        `p.ativo = TRUE `+
                    `AND `+
                        `(`+
                            `di.descricao ILIKE '${dados.txConsulta}' `+
                        `OR `+
                            `us.usr ILIKE '${dados.txConsulta}' `+
                        `OR `+
                            `us.nome ILIKE '${dados.txConsulta}' `+
                        `) `+
                    `LIMIT `+
                        `${dados.limit} `+
                    `OFFSET `+
                        `${dados.offset};\n`+
                    `SELECT `+
                        `COUNT(ofer.id) `+
                    `FROM `+
                        `oferecimentos ofer `+
                    `INNER JOIN periodos p ON p.id = ofer.periodo `+
                    `LEFT JOIN disciplinas di ON di.id = ofer.disciplina `+
                    `LEFT JOIN cursos cur ON cur.id = di.curso `+
                    `INNER JOIN usuarios us ON us.id = ofer.usuario `+
                    `WHERE `+
                        `${admin}` +
                        `ofer.ativo = TRUE `+
                    `AND `+
                        `p.ativo = TRUE `+
                    `AND `+
                        `(`+
                            `di.descricao ILIKE '${dados.txConsulta}' `+
                        `OR `+
                            `us.usr ILIKE '${dados.txConsulta}' `+
                        `OR `+
                            `us.nome ILIKE '${dados.txConsulta}' `+
                        `);`;
                        
        // console.log(text);
        this._pool.query(text, callback);
    }
    
    /**
     * Verifica se existe um oferecimento para o usuário com disciplina, para funções com assinatura "async".
     * Busca por: oferecimentos.periodo, oferecimentos.disciplina.
     * 
     * @param {Object} dados
     * @param {Number} dados.periodo
     * @param {Number} dados.disciplina
     * @returns {Promise(resolve, results)} Promise
     * @memberof OferecimentosDAO
     */
    verificarOferecimentoComDisciplinaAsync(dados)
    {
        const text = `SELECT `+
                    `(`+
                        `SELECT `+
                            `COUNT(0) `+
                        `FROM `+
                            `oferecimentos `+
                        `WHERE `+
                            `periodo = ${dados.periodo} `+
                        `AND `+
                            `disciplina = ${dados.disciplina} `+
                        `AND `+
                            `ativo = TRUE `+
                        `LIMIT `+
                            `1`+
                    `) > 0 AS existe;`;
        // console.log(text);
        
        return this._queryAsync(text, 'application.app.models.OferecimentosDAO.verificarOferecimentoComDisciplinaAsync');
    }

    /**
     * Verifica se existe um oferecimento para o usuário sem disciplina, para funções com assinatura "async".
     * Busca por: oferecimentos.periodo, oferecimentos.usuario, oferecimentos.disciplina.
     * 
     * @param {Object} dados
     * @param {Number} dados.periodo
     * @param {Number} dados.usuario
     * @returns {Promise(resolve, results)} Promise
     * @memberof OferecimentosDAO
     */
    verificarOferecimentoSemDisciplinaAsync(dados)
    {
        const text = `SELECT `+
                    `(`+
                        `SELECT `+
                            `COUNT(0) `+
                        `FROM `+
                            `oferecimentos `+
                        `WHERE `+
                            `periodo = ${dados.periodo} `+
                        `AND `+
                            `usuario = ${dados.usuario} `+
                        `AND `+
                            `ativo = TRUE `+
                        `LIMIT `+
                            `1`+
                    `) > 0 AS existe;`;
        // console.log(text);

        return this._queryAsync(text, 'application.app.models.OferecimentosDAO.verificarOferecimentoSemDisciplinaAsync');
    }

    /**
     * Recupera o periodos ativo, para funções com assinatura "async".
     * 
     * @returns {Promise(resolve, results)} Promise
     * @memberof OferecimentosDAO
     */
    buscarPeriodoAtivoECursosAsync(callback)
    {
        const text = `SELECT id, nome FROM periodos WHERE ativo = TRUE limit 1;`+
                    `SELECT id, descricao FROM cursos;`;

        return this._queryAsync(text, 'application.app.models.OferecimentosDAO.buscarPeriodoAtivoECursosAsync');
    }

    /**
     *  Insere um novo oferecimento.
     * 
     * @param {Object} dados
     * @param {Number} dados.disciplina
     * @param {Number} dados.periodo
     * @param {Number} dados.usuario
     * @returns {Promise(resolve, results)} Promise
     * @memberof OferecimentosDAO
     */
    inserirAsync(dados, callback)
    {
        let text;
        
        if(dados.disciplina)
            text = `INSERT INTO oferecimentos (periodo, usuario, disciplina) VALUES (${dados.periodo}, ${dados.usuario}, ${dados.disciplina});`;
        else
            text = `INSERT INTO oferecimentos (periodo, usuario) VALUES (${dados.periodo}, ${dados.usuario});`;
        // console.log(text);

        return this._queryAsync(text, 'application.app.models.OferecimentosDAO.inserirAsync');
    }

    /**
     * Atualiza um oferecimento, para funções com assinatura "async".
     * 
     * @param {Object} dados
     * @param {Number} dados.id
     * @param {Number} dados.usuario
     * @returns {Promise(resolve, results)} Promise
     * @memberof OferecimentosDAO
     */
    atualizarAsync(dados)
    {
        const text = `UPDATE oferecimentos SET usuario = ${dados.usuario} WHERE id = ${dados.id};`;
        // console.log(text);

        return this._queryAsync(text, 'application.app.models.OferecimentosDAO.atualizarAsync');
    }

    /**
     * Desativa um oferecimento.
     * 
     * @param {Object} dados
     * @param {Number} dados.oferecimento
     * @param {function({error: Error}, {results: QueryResult})} callback
     * @memberof OferecimentosDAO
     */
    desativar(dados, callback)
    {
        const text = `SELECT desativar_oferecimentos(${dados.oferecimento});`;

        // console.log(text);
        this._pool.query(text, callback);
    }

    /**
     * Metodo interno para execução da query, para funções com assinatura "async".
     * 
     * @param {Object} dados 
     * @param {String} dados.sql 
     * @param {String} dados.metodo
     * @returns {Promise(resolve, results)} Promise
     * @memberof TiposObjetosDAO
     */
    _queryAsync(sql, metodo)
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

module.exports = () => OferecimentosDAO;
