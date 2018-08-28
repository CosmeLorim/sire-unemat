/**
 * Classe DAO referente ao controller "operacoes"
 * 
 * @class OperacoesDAO
 */
class OperacoesDAO {

    constructor(connection)
    {
        this._pool = connection;
        this._tabela = 'operacoes';
    }
    
    /*
     * Insere uma nova operação e retorna a ID do tupla criada
     * @param {descricaoOperacao: char} dados
     * @param {function} callback
     * @returns {undefined}
     */
    inserirRecuperandoUltimoId(dados, callback)
    {
        const text =`INSERT INTO\n`+
                    `    ${this._tabela} (descricao)\n`+
                    `VALUES\n`+
                    `    (\'${dados.descricaoOperacao}\')\n`+
                    `RETURNING\n`+
                    `    id;`;

    //    console.log(text);
        this._pool.query(text, callback);
    }
    
    /**
     * Busca um intervalo de operações recuperando 
     * Descrição, usuário, disciplina, curso e objeto atribuido a reserva da operação
     * @param {txconsulta: char, limit: integer, offset: integer} dados 
     * @param {function} callback 
     * @returns {undefined}
     * @memberof OperacoesDAO
     */
    buscaIntervalo(dados, callback)
    {
        const text =`SELECT DISTINCT\n`+
                    `   op.id AS id, op.descricao AS descricao, usr.nome AS usuario, disc.sigla AS disciplina, cur.sigla AS curso, obj.descricao AS objeto\n`+
                    `FROM operacoes op\n`+
                    `INNER JOIN reservas res       ON res.operacao = op.id\n`+
                    `INNER JOIN objetos obj        ON obj.id = res.objeto\n`+
                    `INNER JOIN oferecimentos ofer ON ofer.id = res.oferecimento\n`+
                    `INNER JOIN disciplinas disc   ON disc.id = ofer.disciplina\n`+
                    `INNER JOIN periodos per       ON per.id = ofer.periodo\n`+
                    `INNER JOIN usuarios usr       ON usr.id = ofer.usuario\n`+
                    `INNER JOIN cursos cur         ON cur.id = disc.curso\n`+
                    `WHERE\n`+
                    `    op.descricao ILIKE \'${dados.txconsulta}\'\n`+
                    `OR\n`+
                    `    usr.nome ILIKE \'${dados.txconsulta}\'\n`+
                    `OR\n`+
                    `    disc.descricao ILIKE \'${dados.txconsulta}\'\n`+
                    `OR\n`+
                    `    disc.sigla ILIKE \'${dados.txconsulta}\'\n`+
                    `OR\n`+
                    `    cur.descricao ILIKE \'${dados.txconsulta}\'\n`+
                    `OR\n`+
                    `    cur.sigla ILIKE \'${dados.txconsulta}\'\n`+
                    `OR\n`+
                    `    obj.descricao ILIKE \'${dados.txconsulta}\'\n`+
                    `AND\n`+
                    `    per.ativo = true\n`+
                    `AND\n`+
                    `    per.ativo = true\n`+
                    `LIMIT\n`+
                    `    ${dados.limit}\n`+
                    `OFFSET\n`+
                    `    ${dados.offset};\n`+
                    `SELECT\n`+
                    `    COUNT(id)\n`+
                    `FROM\n`+
                    `    (SELECT DISTINCT \n`+
                    `        op.id\n`+
                    `    FROM operacoes op\n`+
                    `    INNER JOIN reservas res       ON res.operacao = op.id\n`+
                    `    INNER JOIN objetos obj        ON obj.id = res.objeto\n`+
                    `    INNER JOIN oferecimentos ofer ON ofer.id = res.oferecimento\n`+
                    `    INNER JOIN disciplinas disc   ON disc.id = ofer.disciplina\n`+
                    `    INNER JOIN periodos per       ON per.id = ofer.periodo\n`+
                    `    INNER JOIN usuarios usr       ON usr.id = ofer.usuario\n`+
                    `    INNER JOIN cursos cur         ON cur.id = disc.curso\n`+
                    `    WHERE\n`+
                    `        op.descricao ILIKE \'${dados.txconsulta}\'\n`+
                    `    OR\n`+
                    `        usr.nome ILIKE \'${dados.txconsulta}\'\n`+
                    `    OR\n`+
                    `        disc.descricao ILIKE \'${dados.txconsulta}\'\n`+
                    `    OR\n`+
                    `        cur.descricao ILIKE \'${dados.txconsulta}\'\n`+
                    `    OR\n`+
                    `        obj.descricao ILIKE \'${dados.txconsulta}\'\n`+
                    `    AND\n`+
                    `        per.ativo = true\n`+
                    `    AND\n`+
                    `        per.ativo = true) AS id`;

        // console.log(text);
        this._pool.query(text, callback);
    }

    /**
     * Desativa uma operação
     * 
     * @param {id: integer} dados 
     * @param {function} callback 
     * @returns {undefined}
     * @memberof OperacoesDAO
     */
    desativarOperacao(dados, callback)
    {
        const text =`UPDATE\n`+
                    `    ${this._tabela}\n`+
                    `SET\n`+
                    `    ativo = 'false'\n`+
                    `WHERE\n`+
                    `    id = ${dados.id};`;

        // console.log(text);
        this._pool.query(text, callback);
    }
}

module.exports = () => OperacoesDAO;