TiposObjetosDAO = function (connection)
{
    this._pool = connection;
    this._tabela = 'tipos_objeto';

    /*   FUNÇÃO PARA RECUPERAR UM INTERVALO DE TIPOS DE OBJETOS NO BANCO               */
    /*                 ['DESCRIAO', 'LIMIT', 'OFFSET']                                 */
    this.buscaIntervalo = (adcionais, callback) =>
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
//        console.log(text);
        this._pool.query(text, callback);
    };

    /*       FUNÇÃO PARA RECUPERAR TODOS OS TIPOS DE OBJETOS DO BANCO                 */
    this.buscarTodos = (callback) =>
    {
        let text = `SELECT * FROM ${this._tabela};`;
        this._pool.query(text, callback);
    };
    
    /*   FUNÇÃO PARA RECUPERAR UM TIPOS DE OBJETO NO BANCO               */
    /*                 ['DESCRIAO']                                      */
    this.busca = (dados, callback) =>
    {        
        let text = `SELECT * FROM ${this._tabela} WHERE descricao ILIKE \'${dados}\';`;
        this._pool.query(text, callback);
    };

    /*       FUNÇÃO PARA INSERIR UM NOVO TIPOS DE OBJETO NO BANCO               */
    /*    A FUNÇÃO ESPERA UM ARRAY DE UM ÚNICO VALOR DO TIPO CARACTER           */
    /*                 DE NO MÁXIMO 30 CARACTERES                              */
    /*                     ['DESCRIAO']                                         */
    this.inserir = (values, callback) =>
    {
        let text = `INSERT INTO ${this._tabela} (descricao, ativo) VALUES ($1, $2)`;

        this._pool.query(text, values, callback);
    };

    /*     FUNÇÃO PARA ATUALIZAR UM TIPOS DE OBJETO NO BANCO                    */
    /*   A FUNÇÃO ESPERA UM ARRAY COM DOIS VALORES, UM DO TIPO                  */
    /*        CARACTER DE NO MÁXIMO 30 CARACTERES E UM                         */
    /*          INTEIRO NA SEGUNDA POSSIÇÃO DO ARRAY                            */
    /*                 ['DESCRIAO', 'ID']                                       */
    this.atualizar = (values, callback) =>
    {
        let text = `UPDATE ${this._tabela} SET descricao = $2, ativo = $3 WHERE ID = $1 `;
        this._pool.query(text, values, callback);
    };
};

module.exports = () => TiposObjetosDAO;
