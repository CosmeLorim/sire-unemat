class CursosDAO
{
    constructor(connection)
    {
        this._pool = connection;
        this._tabela = 'cursos';
    }
    /*         FUNÇÃO PARA RECUPERAR UM INTERVALO DE CURSOS NO BANCO                   */
    /*                 ['DESCRIAO', 'LIMIT', 'OFFSET']                                 */
    buscaIntervalo(adcionais, callback)
    {
        const text = `SELECT 
                        *
                    FROM
                        ${this._tabela}
                    WHERE
                        descricao ILIKE \'${adcionais.txconsulta}\'
                    ORDER BY
                        descricao ASC
                    LIMIT
                        ${adcionais.limit}
                    OFFSET
                        ${adcionais.offset};
                    SELECT 
                        COUNT(id)
                    FROM
                        ${this._tabela}
                    WHERE
                        descricao ILIKE \'${adcionais.txconsulta}\';`;
        this._pool.query(text, callback);
    }

    /*         FUNÇÃO PARA RECUPERAR TODOS OS CURSOS NO BANCO                   */
    buscarTodos(callback)
    {
        let text = `SELECT * FROM ${this._tabela};`;
        this._pool.query(text, callback);
    }
    /*         FUNÇÃO PARA RECUPERAR UM CURSO NO BANCO                   */
    /*                 ['DESCRIAO']                                      */
    busca(txBusca, callback)
    {
        let text = `SELECT * FROM ${this._tabela} WHERE descricao ILIKE \'${txBusca}\' LIMIT 1;`;
        this._pool.query(text, callback);
    }
    /*         FUNÇÃO PARA INSERIR UM NOVO CURSO NO BANCO                       */
    /*    A FUNÇÃO ESPERA UM ARRAY DE UM ÚNICO VALOR DO TIPO CARACTER           */
    /*                 DE NO MÁXIMO 120 CARACTERES                              */
    /*                     ['DESCRIAO']                                         */
    inserir(values, callback)
    {
        let text = `INSERT INTO ${this._tabela} (descricao, sigla, ativo) VALUES ($1, $2, $3)`;

        this._pool.query(text, values, callback);
    }
    /*         FUNÇÃO PARA ATUALIZAR UM CURSO NO BANCO                          */
    /*   A FUNÇÃO ESPERA UM ARRAY COM DOIS VALORES, UM DO TIPO                  */
    /*        CARACTER DE NO MÁXIMO 120 CARACTERES E UM                         */
    /*          INTEIRO NA SEGUNDA POSSIÇÃO DO ARRAY                            */
    /*                 ['DESCRIAO', 'ID']                                       */
    atualizar(values, callback)
    {
        let text = `UPDATE ${this._tabela} SET descricao = $2, sigla = $3, ativo = $4 WHERE ID = $1`;
        this._pool.query(text, values, callback);
    }
}

module.exports = () => CursosDAO;
