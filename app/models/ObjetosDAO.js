ObjetosDAO = function (connection)
{
    this._pool = connection;
    this._tabela = 'objetos';

    /*      FUNÇÃO PARA RECUPERAR UM INTERVALO DE OBJETOS NO BANCO              */
    /*                 ['DESCRIAO', 'LIMIT', 'OFFSET']                          */
    this.buscaIntervalo = (adcionais, callback) =>
    {
        const text = `SELECT
                        o.id AS objetoId, o.descricao AS objetoDescricao, o.ativo AS objetoAtivo, t.descricao AS tipoObjetoDescricao, t.id AS tipoObjetoId
                    FROM
                        ${this._tabela} o
                    INNER JOIN
                        tipos_objeto t
                    ON
                        o.tipo_objeto = t.id
                    WHERE
                        o.descricao ILIKE \'${adcionais.txconsulta}\'
                    ORDER BY
                        o.descricao ASC
                    LIMIT
                        ${adcionais.limit}
                    OFFSET
                        ${adcionais.offset};
                    SELECT
                        COUNT(o.id)
                    FROM
                        ${this._tabela} o
                    INNER JOIN
                        tipos_objeto t
                    ON
                        o.tipo_objeto = t.id
                    WHERE
                        o.descricao ILIKE \'${adcionais.txconsulta}\';`;

        this._pool.query(text, callback);
    };

    /*    FUNÇÃO PARA RECUPERAR UM OBJETO DO BANCO               */
    this.buscar = (txBusca, callback) =>
    {
        const text = `SELECT * FROM ${this._tabela} WHERE descricao ILIKE \'${txBusca}\' LIMIT 1;`;
        this._pool.query(text, callback);
    };

    this.listarObjetosAtivosEmOrdemAlfabetica = (callback) =>
    {
        const text = `SELECT
                        *
                    FROM
                        ${this._tabela}
                    WHERE
                        ativo = 'true'
                    ORDER BY
                        descricao;`;

        this._pool.query(text, callback);
    };

    /*         FUNÇÃO PARA INSERIR UM NOVO OBJETO NO BANCO                      */
    /*  A FUNÇÃO ESPERA UM ARRAY COM TRÊS VALORES: DESCRICAO COM 30 CARACTERES  */
    /*       NO MÁXIMO, UM BOOLEAN PARA ATIVO E A REFERENCIA                    */
    /*                   PARA O TIPO DO OBJETO                                  */
    /*          ['DESCRICAO', 'ATIVO', 'TIPO_OBJETO']                           */
    this.inserir = (values, callback) =>
    {
        let text = `INSERT INTO ${this._tabela} (descricao, ativo, tipo_objeto) VALUES ($1, $2, $3)`;
        this._pool.query(text, values, callback);
    };

    /*         FUNÇÃO PARA ATUALIZAR UM OBJETO NO BANCO                         */
    /*   A FUNÇÃO ESPERA UM ARRAY COM QUATRO VALORES, O ID DO OBJETO            */
    /*        UM DO TIPO CARACTER DE NO MÁXIMO 30 CARACTERES                    */
    /*     O PARAMETRO ATIVO DO TIPO BOOLEAN E O TIPO DO OBJETO                 */
    /*          ['ID', 'DESCRIAO', 'ATIVO, 'TIPO_OBJETO']                       */
    this.atualizar = (values, callback) =>
    {
        let text = `UPDATE ${this._tabela} SET descricao = $2, ativo = $3, tipo_objeto = $4 WHERE ID = $1 `;
        this._pool.query(text, values, callback);
    };
};

module.exports = () => ObjetosDAO;
