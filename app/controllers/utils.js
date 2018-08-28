/*
 * Função para conversão de data para timesTamp
 * @param {dia: integer, mes: integer, ano: integer} data
 * @returns {integer}
 */
module.exports.dataParaTimesTamp = (data) =>
{
    if (data === undefined || data.ano === undefined || data.mes === undefined || data.dia === undefined)
    {
        const hoje = new Date();
        return new Date(hoje.getFullYear() + '.' + (hoje.getMonth() + 1) + '.' + hoje.getDate()).getTime() / 1000;
    } else
        return new Date(data.ano + '.' + data.mes + '.' + data.dia).getTime() / 1000;
};
