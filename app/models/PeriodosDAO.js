class PeriodosDAO
{
    constructor(connection)
    {
        this._pool = connection;
        this._tabela = 'periodos';
    }
    
    /*
     * Função para recuperar um intervalo de períodos do banco
     * @param {char} txconsulta
     * @param {integer} limit
     * @param {integer} offset
     * @param {function} callback
     * @returns {undefined}
     */
    buscaIntervalo(txconsulta, limit, offset, callback)
    {
        const text = `SELECT
                        *
                    FROM
                        ${this._tabela}
                    WHERE
                        nome ILIKE \'${txconsulta}\'
                    ORDER BY
                        nome ASC
                    LIMIT
                        ${limit}
                    OFFSET
                        ${offset};
                    SELECT
                        COUNT(id)
                    FROM
                        ${this._tabela}
                    WHERE
                        nome ILIKE \'${txconsulta}\';`;
//        console.log(text);
        this._pool.query(text, callback);
    }
    
        /*
     * Função para recuperar um intervalo de períodos do banco
     * @param {function} callback
     * @returns {undefined}
     */
    buscaAtivo(callback)
    {
        const text = `SELECT
                        id, data_inicio, data_fim, nome
                    FROM
                        ${this._tabela}
                    WHERE
                        ativo = TRUE
                    ORDER BY
                        nome ASC
                    LIMIT
                        1;`;
//        console.log(text);
        this._pool.query(text, callback);
    }
    
    /*
     * função para recuperar todos os períodos do banco
     * @param {function} callback
     * @returns {undefined}
     */
    buscarTodos(callback)
    {
        const text = `SELECT * FROM ${this._tabela};`;
        this._pool.query(text, callback);
    }
    
    /*
     * função para recuperar um período do banco
     * @param {char} txBusca
     * @param {function} callback
     * @returns {undefined}
     */
    busca(txBusca, callback)
    {
        const text = `SELECT
                        *
                    FROM
                        ${this._tabela}
                    WHERE
                        nome
                    ILIKE
                        \'${txBusca}\'
                    LIMIT
                        1;`;
        this._pool.query(text, callback);
    }
    
    /*
     * função para inserir um novo período no banco
     * @param {char} nome
     * @param {bigint} data_inicio
     * @param {bigint} data_fim
     * @param {function} callback
     * @returns {undefined}
     */
    inserirAtivo(nome, data_inicio, data_fim, callback)
    {
        const text = `UPDATE
                        ${this._tabela}
                    SET
                        ativo = 'FALSE'
                    WHERE
                        ativo = TRUE;
                    INSERT INTO
                        ${this._tabela} (nome, data_inicio, data_fim, ativo)
                    VALUES
                        (\'${nome}\', ${data_inicio}, ${data_fim}, true);`;
//        console.log(text);
        this._pool.query(text, callback);
    }
    
        /*
     * função para inserir um novo período no banco
     * @param {char} nome
     * @param {bigint} data_inicio
     * @param {bigint} data_fim
     * @param {function} callback
     * @returns {undefined}
     */
    inserirInativo(nome, data_inicio, data_fim, callback)
    {
        const text = `INSERT INTO
                        ${this._tabela} (nome, data_inicio, data_fim, ativo)
                    VALUES
                        (\'${nome}\', ${data_inicio}, ${data_fim}, false);`;
//        console.log(text);
        this._pool.query(text, callback);
    }
    
    /*
     * função para atualizar um período no banco
     * @param {type} id
     * @param {type} nome
     * @param {type} data_inicio
     * @param {type} data_fim
     * @param {type} ativo
     * @param {type} callback
     * @returns {Generator}
     */
    atualizar(id, nome, data_inicio, data_fim, ativo, callback)
    {
        const text = `UPDATE
                        ${this._tabela}
                    SET
                        nome = \'${nome}\', data_inicio = ${data_inicio}, data_fim = ${data_fim}, ativo = ${ativo}
                    WHERE
                        id = ${id}`;
        this._pool.query(text, callback);
    }
}

module.exports = () => PeriodosDAO;
