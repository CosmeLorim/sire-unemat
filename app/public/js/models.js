/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

var Admin = function () {
    this.dialog = function (titulo, conteudo, callback) {
        metroDialog.create({
            title: titulo,
            content: conteudo,
            actions: [
                {
                    title: "Sim",
                    onclick: function (el) {
                        callback();
                        $(el).data('dialog').close();
                    }
                },
                {
                    title: "Não",
                    cls: "js-dialog-close"
                }
            ],
            options: {
                color: 'success',
                overlayColor: 'op-dark',
                overlayClickClose: true,
                overlay: true
            }
        });
    };

    /*
     * 
     * @param {title: string, content: string, color: string} options
     * @param {function} callback
     * @returns {undefined}
     */
    this.dialogOk = function (options, callback) {
        metroDialog.create({
            title: options.titulo,
            content: options.conteudo,
            actions: [
                {
                    title: "Ok",
                    onclick: function (el) {
                        if (callback !== undefined)
                            callback();
                        $(el).data('dialog').close();
                    }
                }
            ],
            options: {
                color: options.color,
                overlayColor: 'op-dark',
                overlayClickClose: true,
                overlay: true
            }
        });
    };
};

var Curso = function ()
{
    this.id = null; //integer
    this.descricao = ''; //char[120]
    this.ativo = null; //boolean

    this.validaDescricao = function (descricao)
    {
        if (descricao.length === 0)
        {
            $.Notify({
                caption: 'Erro',
                content: 'O campo nome do curso não deve estar vazio!',
                timeout: 10000,
                type: 'alert'
            });
            return false;
        }
        if (descricao.length > 120)
        {
            $.Notify({
                caption: 'Erro',
                content: 'O campo nome do curso não deve ultrapassar 120 caracteres!',
                timeout: 10000,
                type: 'alert'
            });
            return false;
        }
        return true;
    };

    this.validaSigla = function (sigla)
    {
        if (sigla.length === 0)
        {
            $.Notify({
                caption: 'Erro',
                content: 'O campo sigla do curso não deve estar vazio!',
                timeout: 10000,
                type: 'alert'
            });
            return false;
        }
        if (sigla.length > 120)
        {
            $.Notify({
                caption: 'Erro',
                content: 'O campo sigla do curso não deve ultrapassar 10 caracteres!',
                timeout: 10000,
                type: 'alert'
            });
            return false;
        }
        return true;
    };
};

var Disciplina = function ()
{
    this.id = null; //integer
    this.descricao = ''; //char[100]
    this.sigla = ''; //char[10]
    this.curso = null; //integer
    this.ativo = null; //boolean
    this.carga_horaria = null; //integer
    this.semestre = ''; //integer

    this.validaDescricao = function (descricao)
    {
        if (descricao.length === 0)
        {
            $.Notify({
                caption: 'Erro',
                content: 'O campo nome do curso não deve estar vazio!',
                timeout: 10000,
                type: 'alert'
            });
            return false;
        }
        if (descricao.length > 100)
        {
            $.Notify({
                caption: 'Erro',
                content: 'O campo nome do curso não deve ultrapassar 100 caracteres!',
                timeout: 10000,
                type: 'alert'
            });
            return false;
        }
        return true;
    };
    this.validaSigla = function (sigla)
    {
        if (sigla.length === 0)
        {
            $.Notify({
                caption: 'Erro',
                content: 'O campo sigla do curso não deve estar vazio!',
                timeout: 10000,
                type: 'alert'
            });
            return false;
        }
        if (sigla.length > 10)
        {
            $.Notify({
                caption: 'Erro',
                content: 'O campo nome do curso não deve ultrapassar 10 caracteres!',
                timeout: 10000,
                type: 'alert'
            });
            return false;
        }
        return true;
    };
    this.validaCargaHoraria = function (descricao)
    {
        if (descricao.length === 0)
        {
            $.Notify({
                caption: 'Erro',
                content: 'O campo carga horária não deve estar vazio!',
                timeout: 10000,
                type: 'alert'
            });
            return false;
        }
        return true;
    };
};

var Objeto = function ()
{
    this.id = null; //integer
    this.tipo_objeto = null; //integer
    this.descricao = ''; //char[30]
    this.ativo = null; //boolean

    this.validaDescricao = function (descricao)
    {
        if (descricao.length === 0)
        {
            $.Notify({
                caption: 'Erro',
                content: 'O campo nome do objeto não deve estar vazio!',
                timeout: 10000,
                type: 'alert'
            });
            return false;
        }
        if (descricao.length > 30)
        {
            $.Notify({
                caption: 'Erro',
                content: 'O campo nome do curso não deve ultrapassar 30 caracteres!',
                timeout: 10000,
                type: 'alert'
            });
            return false;
        }
        return true;
    };
};

var Oferecimento = function ()
{
    this.id = null; //integer
    this.usuario = null; //integer
    this.disciplina = null; //integer
    this.periodo = null; //integer
    this.ativo = null; //booblean

    this.validaOferecimentoSelecionado = function (id)
    {
        if (id === "")
        {
            $.Notify({
                caption: 'Erro',
                content: 'Você não selecionou um oferecimento!',
                timeout: 10000,
                type: 'alert'
            });
            return false;
        }
        return true;
    };
};

var Operacao = function ()
{
    this.id = null; //integer
    this.descricao = ''; //char[255]
    this.ativo = null; //boolean
};

var Perfil = function () {
    this.id = null; //integer
    this.usuario = null; //integer
    this.tipo_objeto = null; //integer
    this.ativo = null; //boolean
};

var Periodo = function () {
    this.id = null; // integer
    this.data_inicio = null; //bigint
    this.data_fim = null; //bigint
    this.nome = ''; //char[6]

    this.formatarData = function (ms)
    {
        var dataFinal = '';
        var data = new Date(parseInt(ms) * 1000);

        dataFinal += data.getDay() + '\/';
        dataFinal += data.getMonth() + '\/';
        dataFinal += data.getFullYear();

        return dataFinal;
    };

    this.copiarDados = function (objeto)
    {
        this.id = objeto.id;
        this.data_inicio = objeto.data_inicio;
        this.data_fim = objeto.data_fim;
        this.nome = objeto.nome;
    };

    this.validaNome = function (nome)
    {

        if (nome.length !== 6)
        {
            $.Notify({
                caption: 'Erro',
                content: 'O campo nome não está no formato adequado. Ex: 2017/1!',
                timeout: 10000,
                type: 'alert'
            });
            return false;
        }
        var expressaoRegulgarNome = /1+9+[7-9]+[0-9]+\/+1|2/;
        if (!expressaoRegulgarNome.test(nome))
        {
            $.Notify({
                caption: 'Erro',
                content: 'O campo nome não está no formato adequado. Ex: 2017/1!',
                timeout: 10000,
                type: 'alert'
            });
            return false;
        }
        return true;
    };

    this.validaDatas = function (inicio, fim)
    {
        if ((inicio > fim) || (inicio == '') || (fim == ''))
        {
            $.Notify({
                caption: 'Erro',
                content: 'O período foi definido incorretamente!',
                timeout: 10000,
                type: 'alert'
            });
            return false;
        }
        return true;
    };
};

var Reserva = function () {
    this.id = null; //integer
    this.periodo = {id: null, descricao: ''}; //{integer, char[6]
    this.objeto = null; //integer
    this.oferecimento = null; //integer
    this.datas = []; //bigint
    this.horarios = []; //{checked: null, campo: ''}{boolean, char}[14]
    this.descricaoOperacao = ''; //char[255]

    this.validaOferecimento = function (oferecimento)
    {
        if (oferecimento === '')
        {
            $.Notify({
                caption: 'Erro',
                content: 'Você não selecionou oferecimento!',
                timeout: 10000,
                type: 'alert'
            });
            return false;
        }
        return true;
    };

    this.validaObjeto = function (objeto)
    {
        if (objeto === '')
        {
            $.Notify({
                caption: 'Erro',
                content: 'Você não selecionou um objeto!',
                timeout: 10000,
                type: 'alert'
            });
            return false;
        }
        return true;
    };

    this.validaHorarios = function (horarios)
    {
        for (var i = 0; i < horarios.length; i++)
        {
            if (horarios[i].checked)
                return true;
        }
        $.Notify({
            caption: 'Erro',
            content: 'Você não selecionou aulas!',
            timeout: 10000,
            type: 'alert'
        });
        return false;
    };

    this.validaDatas = function (datas)
    {

        if (datas.length === 0)
        {
            $.Notify({
                caption: 'Erro',
                content: 'Você não selecionou datas!',
                timeout: 10000,
                type: 'alert'
            });
            return false;
        }
        return true;
    };

    this.validaDescricaoOperacao = function (descricaoOperacao)
    {
        if (descricaoOperacao.length > 120)
        {
            $.Notify({
                caption: 'Erro',
                content: 'A descrição da operação deve ultrapassar 255 caracteres!',
                timeout: 10000,
                type: 'alert'
            });
            return false;
        }
        return true;
    };
};

var TipoObjeto = function () {
    this.id = null; //integer
    this.descricao = ''; //char[30]
    this.ativo = null; //boolean

    this.validaDescricao = function (descricao)
    {
        if (descricao.length === 0)
        {
            $.Notify({
                caption: 'Erro',
                content: 'O campo nome da categoria não deve estar vazio!',
                timeout: 10000,
                type: 'alert'
            });
            return false;
        }
        if (descricao.length > 30)
        {
            $.Notify({
                caption: 'Erro',
                content: 'O campo nome da categoria não deve ultrapassar 30 caracteres!',
                timeout: 10000,
                type: 'alert'
            });
            return false;
        }
        return true;
    };
};

var Usuario = function () {

    this.id = null; //integer
    this.nome = ''; //char[120]
    this.usr = ''; //char[60]
    this.passwd = null; //char[25]
    this.ativo = null; //boolean
    this.admin = null; //boolean
    this.perfil = []; //TipoObjeto[]

    this.validaNome = function (nome)
    {
        if (nome.length === 0)
        {
            $.Notify({
                caption: 'Erro',
                content: 'O campo nome não deve estar vazio!',
                timeout: 10000,
                type: 'alert'
            });
            return false;
        }
        if (nome.length > 120)
        {
            $.Notify({
                caption: 'Erro',
                content: 'O campo nome da categoria não deve ultrapassar 120 caracteres!',
                timeout: 10000,
                type: 'alert'
            });
            return false;
        }
        return true;
    };

    this.validaUsr = function (usr)
    {
        if (usr.length === 0)
        {
            $.Notify({
                caption: 'Erro',
                content: 'O campo usuário não deve estar vazio!',
                timeout: 10000,
                type: 'alert'
            });
            return false;
        }
        if (usr.length > 60)
        {
            $.Notify({
                caption: 'Erro',
                content: 'O campo usuário não deve ultrapassar 60 caracteres!',
                timeout: 10000,
                type: 'alert'
            });
            return false;
        }
        if (usr.indexOf(' ') !== -1)
        {
            $.Notify({
                caption: 'Erro',
                content: 'O campo usuário não deve conter espaços em branco!',
                timeout: 10000,
                type: 'alert'
            });
            return false;
        }
        return true;
    };

    this.validaSenha = function (passwd1, passwd2)
    {
        if (passwd1 !== passwd2) {
            $.Notify({
                caption: 'Erro',
                content: 'As senhas digitadas devem ser iguais',
                timeout: 10000,
                type: 'alert'
            });
            return false;
        }
        if (passwd1.length < 5)
        {
            $.Notify({
                caption: 'Erro',
                content: 'O campo senha não pode conter menos de 6 digitos!',
                timeout: 10000,
                type: 'alert'
            });
            return false;
        }
        return true;
    };
};
