/**
 * Classe DAO referente ao controller "operacoes".
 *  
 * @class OperacoesDAO
 */
class OperacoesDAO
{
    /**
     * Cria uma instância de OperacoesDAO.
     * 
     * @param {ConnectionConfig} connection 
     * @memberof OperacoesDAO
     */
    constructor(connection)
    {
        this._pool = connection;
    }
    
    /**
     * Recupera um intervalo definido de registros do banco.
     * Busca por: operacoes.descricao, usuarios.nome, usuario.usr, disciplinas.descricao, disciplinas.sigla, objetos.descricao.
     * 
     * @param {Object} dados
     * @param {String} dados.txConsulta 
     * @param {Number} dados.limit
     * @param {Number} dados.offset
     * @param {function({error: Error}, {results: QueryResult}} callback 
     * @memberof OperacoesDAO
     */
    buscaIntervalo(dados, callback)
    {
        const admin = dados.admin ? `AND usr.usr = '${dados.admin}' ` : '';
        
        const text = `SELECT DISTINCT `+
                        `op.id AS id, op.descricao AS operacao_descricao, usr.nome AS usuario, disc.sigla AS disciplina, `+
                        `disc.descricao AS disciplina_descricao, cur.sigla AS curso, obj.descricao AS objeto `+
                    `FROM `+
                        `oferecimentos ofer `+
                    `LEFT JOIN `+
                        `disciplinas disc ON disc.id = ofer.disciplina `+
                    `RIGHT JOIN `+
                        `operacoes op ON op.oferecimento = ofer.id `+
                    `INNER JOIN `+
                        `usuarios usr ON usr.id = ofer.usuario `+
                    `INNER JOIN `+
                        `periodos per ON per.id = ofer.periodo `+
                    `INNER JOIN `+
                        `reservas res ON res.operacao = op.id `+
                    `INNER JOIN `+
                        `objetos obj ON obj.id = res.objeto `+
                    `INNER JOIN `+
                        `cursos cur ON cur.id = disc.curso `+
                    `WHERE `+
                    `(`+
                            `op.descricao ILIKE '${dados.txConsulta}' `+
                        `OR `+
                            `usr.nome ILIKE '${dados.txConsulta}' `+
                        `OR `+
                            `usr.usr ILIKE '${dados.txConsulta}' `+
                        `OR `+
                            `disc.descricao ILIKE '${dados.txConsulta}' `+
                        `OR `+
                            `disc.sigla ILIKE '${dados.txConsulta}' `+
                        `OR `+
                            `cur.descricao ILIKE '${dados.txConsulta}' `+
                        `OR `+
                            `cur.sigla ILIKE '${dados.txConsulta}' `+
                        `OR `+
                            `obj.descricao ILIKE '${dados.txConsulta}' `+
                    `) `+
                    `AND `+
                        `per.ativo = true `+
                    `AND `+
                        `op.ativo = true `+
                    admin +
                    `LIMIT `+
                        `${dados.limit} `+
                    `OFFSET `+
                        `${dados.offset};\n`+
                    `SELECT `+
                        `COUNT(0) `+
                    `FROM `+
                    `(`+
                        `SELECT DISTINCT `+
                            `op.id AS id, op.descricao AS descricao, usr.nome AS usuario, disc.sigla AS disciplina, cur.sigla AS curso, obj.descricao AS objeto `+
                        `FROM `+
                            `oferecimentos ofer `+
                        `LEFT JOIN `+
                            `disciplinas disc ON disc.id = ofer.disciplina `+
                        `RIGHT JOIN `+
                            `operacoes op ON op.oferecimento = ofer.id `+
                        `INNER JOIN `+
                            `usuarios usr ON usr.id = ofer.usuario `+
                        `INNER JOIN `+
                            `periodos per ON per.id = ofer.periodo `+
                        `INNER JOIN `+
                            `reservas res ON res.operacao = op.id `+
                        `INNER JOIN `+
                            `objetos obj ON obj.id = res.objeto `+
                        `INNER JOIN `+
                            `cursos cur ON cur.id = disc.curso `+
                        `WHERE `+
                        `(`+
                                `op.descricao ILIKE '${dados.txConsulta}' `+
                            `OR `+
                                `usr.nome ILIKE '${dados.txConsulta}' `+
                            `OR `+
                                `usr.usr ILIKE '${dados.txConsulta}' `+
                            `OR `+
                                `disc.descricao ILIKE '${dados.txConsulta}' `+
                            `OR `+
                                `disc.sigla ILIKE '${dados.txConsulta}' `+
                            `OR `+
                                `cur.descricao ILIKE '${dados.txConsulta}' `+
                            `OR `+
                                `cur.sigla ILIKE '${dados.txConsulta}' `+
                            `OR `+
                                `obj.descricao ILIKE '${dados.txConsulta}' `+
                        `) `+
                        `AND `+
                            `per.ativo = true `+
                        `AND `+
                            `op.ativo = true `+
                        admin +
                    `) AS count;`;

        // console.log(text);
        this._pool.query(text, callback);
    }

    /**
     * Recupera todos os períodos do banco.
     * 
     * @param {function({error: Error}, {results: QueryResult})} callback
     */
    buscarTodosPeriodos(callback)
    {
        const text = `SELECT id, data_inicio, data_fim, nome, ativo FROM periodos;`;

        this._pool.query(text, callback);
    }

    /**
     * Verifica se um se uma operação pertence a um usuário
     * Busca por: usuario.usr, operacao.id
     * 
     * @param {Object} dados
     * @param {String} dados.usr 
     * @param {Number} dados.operacao
     * @param {function({error: Error}, {results: QueryResult}} callback 
     * @memberof OperacoesDAO
     */
    verificarUsuarioDaOperacao(dados, callback)
    {
        const subConsulta = `SELECT `+
                                `us.id `+
                            `FROM `+
                                `operacoes op `+
                            `INNER JOIN `+
                                `oferecimentos of ON of.id = op.oferecimento `+
                            `INNER JOIN `+
                                `usuarios us ON us.id = of.usuario `+
                            `INNER JOIN `+
                                `periodos p ON p.id = of.periodo `+
                            `WHERE `+
                                `us.usr ILIKE '${dados.usr}' `+
                            `AND `+
                                `p.ativo = TRUE `+
                            `AND `+
                                `op.id = ${dados.operacao} `


        const text = `SELECT (${subConsulta}) > 0 AS pertence;`

        // console.log(text);
        this._pool.query(text, callback);
    }

    /**
     * Desativa uma operação.
     * 
     * @param {Object} dados 
     * @param {Number} dados.id
     * @param {function({error: Error}, {results: QueryResult}} callback
     * @memberof OperacoesDAO
     */
    desativarOperacao(dados, callback)
    {
        const text = `UPDATE operacoes SET ativo = FALSE WHERE id = ${dados.id};\n` +
                     `UPDATE reservas SET ativo = FALSE WHERE operacao = ${dados.id}`;

        // console.log(text);
        this._pool.query(text, callback);
    }
}

module.exports = () => OperacoesDAO;