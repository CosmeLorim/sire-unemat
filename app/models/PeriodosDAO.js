/**
 * Classe DAO referente ao controller "periodos".
 * 
 * @class PeriodosDAO
 */
class PeriodosDAO
{
    /**
     * Cria uma instância de PeriodosDAO.
     * 
     * @param {ConnectionConfig} connection 
     * @memberof PeriodosDAO
     */
    constructor(connection)
    {
        this._pool = connection;
    }
        
    /**
     * Recupera um intervalo de períodos do banco.
     * Busca por: periodos.nome.
     * 
     * @param {Object} dados 
     * @param {String} dados.txConsulta
     * @param {Number} dados.offset
     * @param {Number} dados.limit
     * @param {function({error: Error}, {results: QueryResult})} callback
     * @memberof PeriodosDAO
     */
    buscaIntervalo(dados, callback)
    {
        const text = `SELECT `+
                        `id, data_inicio, data_fim, nome, ativo `+
                    `FROM `+
                        `periodos `+
                    `WHERE `+
                        `nome ILIKE '${dados.txConsulta}' `+
                    `ORDER BY `+
                        `nome ASC `+
                    `LIMIT `+
                        `${dados.limit} `+
                    `OFFSET `+
                        `${dados.offset};\n `+
                    `SELECT `+
                        `COUNT(0) `+
                    `FROM `+
                        `periodos `+
                    `WHERE `+
                        `nome ILIKE '${dados.txConsulta}';\n`;
        // console.log(text);

        this._pool.query(text, callback);
    }
    
    /**
     * Recupera o período ativo do banco.
     * 
     * @param {function({error: Error}, {results: QueryResult})} callback
     * @memberof PeriodosDAO
     */
    buscaAtivo(callback)
    {
        const text = `SELECT `+
                        `id, data_inicio, data_fim, nome, ativo `+
                    `FROM `+
                        `periodos `+
                    `WHERE `+
                        `ativo = TRUE `+
                    `ORDER BY `+
                        `nome ASC `+
                    `LIMIT `+
                        `1;`;             
        // console.log(text);

        this._pool.query(text, callback);
    }
    
    /**
     * Verifica se existe um periodo no banco.
     * Busca por: periodos.nome.
     * 
     * @param {Object} dados 
     * @param {String} dados.txConsulta
     * @param {Number} dados.dataInicio
     * @param {Number} dados.dataFim
     * @param {function({error: Error}, {results: QueryResult})} callback
     * @memberof ObjetosDAO
     */
    verificarSeExisteEConflito(dados, callback)
    {
        const text = `SELECT (SELECT COUNT(0) FROM periodos WHERE nome ILIKE '${dados.txConsulta}' LIMIT 1) > 0 AS existe;\n`+
                    `SELECT `+
                    `(`+
                        `SELECT `+
                            `COUNT(0) `+
                        `FROM `+
                            `periodos `+
                        `WHERE `+
                            `(data_inicio <= ${dados.dataInicio} AND data_fim >= ${dados.dataInicio}) `+
                        `OR `+
                            `(data_inicio <= ${dados.dataFim} AND data_fim >= ${dados.dataFim})`+
                    `) > 0 AS conflito`;
        // console.log(text);

        this._pool.query(text, callback);
    }

    /**
     * Verifica se existe um periodo no banco, para funções com assinatura "async".
     * Busca por: periodos.nome.
     * 
     * @param {Object} dados 
     * @param {Number} dados.id
     * @param {String} dados.nome
     * @returns {Promise(resolve, results)} Promise
     * @memberof ObjetosDAO
     */
    verificarConflitoDeNomeEDataAsync(dados)
    {
        const consultaPorId = typeof(dados.id) !== 'undefined' ? `AND id <> ${dados.id}` : '';

        const text = `SELECT (SELECT COUNT(0) FROM periodos WHERE nome ILIKE '${dados.nome}' ${consultaPorId} LIMIT 1) > 0 AS existe, `+
                    `(`+
                        `SELECT `+
                            `COUNT(0) `+
                        `FROM `+
                            `periodos `+
                        `WHERE `+
                        `(`+
                            `(data_inicio <= ${dados.dataInicio} AND data_fim >= ${dados.dataInicio}) `+
                        `OR `+
                            `(data_inicio <= ${dados.dataFim} AND data_fim >= ${dados.dataFim})`+
                        `)`+
                        ` ${consultaPorId} `+
                    `)`+
                    ` > 0 AS conflito;`;
        // console.log(text);

        return this._queryAsync(text, 'application.app.models.PeriodosDAO.verificarConflitoDeNomeAsync');
    }
    
    /**
     * Insere um novo período no banco.
     * 
     * @param {Object} dados 
     * @param {String} dados.nome
     * @param {Number} dados.dataInicio
     * @param {Number} dados.dataFim
     * @param {function({error: Error}, {results: QueryResult})} callback
     * @memberof ObjetosDAO
     */
    inserir(dados, callback)
    {
        const text = `INSERT INTO `+
                        `periodos (nome, data_inicio, data_fim, ativo) `+
                    `VALUES `+
                        `('${dados.nome}', ${dados.dataInicio}, ${dados.dataFim}, FALSE) `+
                    `RETURNING `+
                        `id;`;

        // console.log(text);
        this._pool.query(text, callback);
    }
    
    /**
     * Atualiza um período sem alterar o atributo "periodos.ativo", para funções com assinatura "async".
     * Busca por: periodos.id.
     * 
     * @param {Object} dados 
     * @param {Number} dados.id
     * @param {String} dados.nome
     * @param {Number} dados.dataInicio
     * @param {Number} dados.dataFim
     * @returns {Promise(resolve, results)} Promise
     * @memberof ObjetosDAO
     */
    atualizarAsync(dados)
    {
        const text = `UPDATE `+
                        `periodos `+
                    `SET `+
                        `nome = '${dados.nome}', data_inicio = ${dados.dataInicio}, data_fim = ${dados.dataFim} `+
                    `WHERE `+
                        `id = ${dados.id};`;
        // console.log(text);

        return this._queryAsync(text, 'application.app.models.PeriodosDAO.atualizarAsync');
    }

    /**
     * Troca o período ativo do sistema.
     * Busca por: periodos.ativo.
     * 
     * @param {Object} dados
     * @param {Number} dados.id
     * @param {function({error: Error}, {results: QueryResult})} callback 
     * @memberof PeriodosDAO
     */
    AlterarPeriodoAtivo(dados, callback)
    {
        const text = `UPDATE `+
                        `periodos `+
                    `SET `+
                        `ativo = FALSE `+
                    `WHERE `+
                        `ativo = TRUE;\n`+
                    `UPDATE `+
                        `periodos `+
                    `SET `+
                        `ativo = TRUE `+
                    `WHERE `+
                        `id = ${dados.id};`;
        // console.log(text);

        this._pool.query(text, callback);
    }

    /**
     * Troca o período ativo do sistema, para funções com assinatura "async".
     * Busca por: periodos.ativo.
     * 
     * @param {Object} dados
     * @param {Number} dados.id
     * @returns {Promise(resolve, results)} Promise
     * @memberof PeriodosDAO
     */
    alterarPeriodoAtivoAsync(dados, callback)
    {
        const text = `UPDATE `+
                        `periodos `+
                    `SET `+
                        `ativo = FALSE `+
                    `WHERE `+
                        `ativo = TRUE;\n`+
                    `UPDATE `+
                        `periodos `+
                    `SET `+
                        `ativo = TRUE `+
                    `WHERE `+
                        `id = ${dados.id};`;
        // console.log(text);

        return this._queryAsync(text, 'application.app.models.PeriodosDAO.alterarPeriodoAtivoAsync');
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

module.exports = () => PeriodosDAO;
