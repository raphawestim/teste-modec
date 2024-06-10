var Avaliacao;
(function () {
    "use strict";

    Avaliacao = function (p_cfg) {
        //o segundo parametro dessa chamada são os dados de execução anterior.
        this.configAval = new Avaliacao.ConfiguracaoAval(p_cfg, {});

        var idAvaliacao = this.configAval.idAval();

        var avalIniciada = getSuspendData(idAvaliacao + '-iniciada') ? true : false;
        if (avalIniciada) {
            var dadosAnteriores = this.configAval.recuperarDadosAnteriores();
            this.configAval = new Avaliacao.ConfiguracaoAval(p_cfg, dadosAnteriores);
        }

        this.questoes = [];
        this.init();

        setSuspendData(idAvaliacao + '-iniciada', 'true');
    }

    Avaliacao.prototype = {
        init: function () {
            this.carregaQuestoes();
        },

        carregaQuestoes: function () {
            var $this = this;
            $.ajax({
                type: "GET",
                url: this.configAval.xmlQuestoes(),
                dataType: "xml",
                success: function (xml) {
                    $this.ParseAvaliacao(xml);
                }
            });
        },

        ParseAvaliacao: function (xmlDoc) {
            var $this = this;
            $(xmlDoc).find("questao").each(function () {
                var questao = new Avaliacao.ModelQuestao(this);

                $this.questoes.push(questao);
            })
            console.log(questoes)
            this.IniciaAvaliacao();
        },

        IniciaAvaliacao: function () {
            var idAvaliacao = this.configAval.idAval();

            //# controla uma nova tentativa para avaliação
            this.configAval.novaTentativaAvaliacao();

            var ordemAnterior = getSuspendData(idAvaliacao + '-ordem');
            if (ordemAnterior) {
                ordemAnterior = ordemAnterior.split(',');

                var arrQuestoesAux = [];
                for (var i = 0; i < ordemAnterior.length; i++) {
                    arrQuestoesAux.push(this.getQuestaoByID(ordemAnterior[i]));
                }
                this.questoes = arrQuestoesAux;
            } else {
                //# Verifica se é necessário embaralhar as questões
                if (this.configAval.perguntasRandomicas()) {
                    $.shuffle(this.questoes);
                }
            }

            //Salva a ordem das questões para recuperar numa execução posterior
            //caso o aluno abandone a avaliação no meio.
            var ordemQuestoes = [];
            $.each(this.questoes, function (key, value) {
                ordemQuestoes.push(value.id);
            });
            setSuspendData(idAvaliacao + '-ordem', ordemQuestoes.join());

            var objEvent = {
                totalPerguntas: this.configAval.totalPerguntasExibir(),
                perguntaAtual: this.configAval.getPerguntaAtual()
            };
            $('body').trigger('iniciaAval', objEvent);

            //# chama nova pergunta
            this.proximaPergunta();
        },

        novaTentativaAvaliacao: function () {
            var idAvaliacao = this.configAval.idAval();
            this.configAval.reiniciaRespostasUsuario();
            this.configAval.perguntaAtual(0);

            setSuspendData(idAvaliacao + '-ordem', '');

            this.IniciaAvaliacao();
        },

        proximaPergunta: function () {
            //# Verifica se já chegou na ultima pergunta
            if (this.configAval.getPerguntaAtual() < this.configAval.totalPerguntasExibir()) {
                //# Verifica se existe mais tentativas para a pergunta atual
                if (this.configAval.tentativaAtual().pergunta > 0 && this.configAval.tentativaAtual().pergunta < this.configAval.maxTentativas().pergunta && !this.configAval.listaRespostasUsuario()[this.configAval.listaRespostasUsuario().length - 1].correto) {
                    //Não deve fazer outra tentativa
                } else {
                    //# Atribiu proxima pergunta
                    this.configAval.perguntaAtual(this.configAval.getPerguntaAtual() + 1);

                    //# Reinicia contador de tentativas para pergunta
                    this.configAval.reiniciaTentativaPergunta();
                }

                //# Registra uma nova tentativa para a pergunta
                this.configAval.novaTentativaPergunta();

                //# Cria objeto que será enviado para o front, contendo a pergunta e a tentativa da questão
                var objEvent = {
                    pergunta: this.questoes[this.configAval.getPerguntaAtual() - 1],
                    tentativaAtual: this.configAval.tentativaAtual().pergunta,
                    totalPerguntas: this.configAval.totalPerguntasExibir(),
                    perguntaAtual: this.configAval.getPerguntaAtual()
                }

                //# Dispara evento com a pergunta
                $('body').trigger('atualizaQuestao', objEvent);
            } else {
                //# Quando termina as perguntas é processado o final da avaliação
                var posTentativa = this.configAval.tentativaAtual().avaliacao - 1;
                var resultadoAnterior = this.configAval.configExecucao.desempenhoAvaliacao[posTentativa];
                if (!resultadoAnterior) {
                    //# Cria objeto com o desempenho da avaliação
                    var intTotalPerguntas = this.configAval.totalPerguntasExibir();
                    var intAproveitamento = 100 / intTotalPerguntas * this.calculaAcertos()

                    var objResultadoAvaliacao = {
                        tentativa: this.configAval.tentativaAtual().avaliacao,
                        maxTentativas: this.configAval.maxTentativas().avaliacao,
                        perguntasRespondidas: intTotalPerguntas,
                        aproveitamento: intAproveitamento,
                        notaCorte: this.configAval.notaCorte(),
                        aprovado: intAproveitamento >= this.configAval.notaCorte(),
                        totalAcertos: this.calculaAcertos()
                    }

                    //# registra o resultado da avaliação
                    this.configAval.registraDesempenhoAvaliacao(objResultadoAvaliacao);

                    //# dispara evento de encerramento da avaliação
                    $('body').trigger('avaliacaoEncerrada', objResultadoAvaliacao);
                } else {
                    $('body').trigger('avaliacaoEncerrada', resultadoAnterior);
                }

            }
        },

        //# Esse método pega a resposta do usuário e registra com os outros dados de execução
        respostaUsuario: function (idResposta) {
            var objRespostaUsuario = {
                idPergunta: this.questoes[this.configAval.getPerguntaAtual() - 1].id,
                respostaUsuario: idResposta,
                respostaCorreta: parseInt(this.questoes[this.configAval.getPerguntaAtual() - 1].respostaCorreta),
                correto: idResposta == this.questoes[this.configAval.getPerguntaAtual() - 1].respostaCorreta,
                tentativa: this.configAval.tentativaAtual().pergunta
            }

            this.configAval.registraRespostaUsuario(objRespostaUsuario);

            this.processaQuestao();
        },

        //# Esse método processa as informações da execução da avaliação e disponibiliza para o front
        processaQuestao: function () {
            //# Busca informações
            var arrRespostasUsuario = this.configAval.listaRespostasUsuario();
            var intTotalPerguntasExibir = this.configAval.totalPerguntasExibir();
            var intPerguntaAtual = this.configAval.getPerguntaAtual();
            var intAproveitamentoParcial = 0;
            var intAproveitamentoTotal = 0;
            var intTotalAcertos = this.calculaAcertos();

            //# Calcula aproveitamento
            //# parcial = calcula levando em consideração as perguntas respondidas até o momento
            //# total = calcula levando em consideração todas as perguntas
            intAproveitamentoParcial = 100 / arrRespostasUsuario.length * intTotalAcertos;
            intAproveitamentoTotal = 100 / intTotalPerguntasExibir * intTotalAcertos;

            //# Cria objeto que será repassado
            var objEvent = {
                respostasUsuario: arrRespostasUsuario,
                totalPerguntasExibir: intTotalPerguntasExibir,
                perguntaAtual: intPerguntaAtual,
                totalAcertos: intTotalAcertos,
                aproveitamentoParcial: intAproveitamentoParcial,
                aproveitamentoTotal: intAproveitamentoTotal,
                ultimaPergunta: {
                    tentativaAtual: this.configAval.tentativaAtual().pergunta,
                    correto: arrRespostasUsuario[arrRespostasUsuario.length - 1].correto,
                    feedback: {
                        individual: {
                            exibir: this.configAval.feedbackIndividual(),
                            conteudo: this.questoes[this.configAval.getPerguntaAtual() - 1].feedback
                        },
                        final: {
                            exibir: this.configAval.feedbackFinal()
                        }
                    }
                }
            }

            //# Dispara os dados processados
            $('body').trigger('questaoProcessada', objEvent);
        },

        //# Função que calcula o total de acertos do usuário para a tentativa atual da avaliação
        calculaAcertos: function () {
            //# Zera contador
            var tmpRespostasCorretas = 0;
            //# Acessa as respostas do usuario
            var arrRespostasUsuario = this.configAval.listaRespostasUsuario();
            //# Varre as respostas e incrementa contador em caso de resposta correta
            for (var i = 0; i < arrRespostasUsuario.length; i++) {
                if (arrRespostasUsuario[i].correto) {
                    tmpRespostasCorretas++;
                }
            }

            //# Retorna resultado
            return tmpRespostasCorretas
        },

        //# recupera questão;
        getQuestaoByID: function (id) {
            var objReturn = "";
            $.each(this.questoes, function (key, value) {
                if (value.id == id) {
                    objReturn = value;
                }
            })
            return objReturn;
        },

        getRespostas: function () {
            return this.configAval.listaRespostasUsuario();
        }
    }
}());



(function () {
    "use strict";
    /*
     * Aqui inicia as configurações da avaliação
     * p_cfg -> Dados de configuração para avaliação
     * p_configExecucao -> Dados anteriores de execução da avaliação
     */

    var ConfiguracaoAval = Avaliacao.ConfiguracaoAval = function (p_cfg, p_configExecucao) {
        var cfgDefault = {
            idAval: 'av',
            /*
             * Controle de maximo tentativas para a pergunta e para a avalição
             * 0 - Tentativas ilimitadas para qualquer um dos
             * 1 - Default para os dois valores
             */
            tentativas: {
                pergunta: 1,
                avaliacao: 1
            },

            /*
             * Quantas perguntas serão exibidas
             */
            perguntasExibir: 10,

            /*
             * Randomizar perguntas
             */
            perguntasRandomicas: true,

            /*
             * Nota de corte
             */
            notaCorte: 70,

            /*
             * Feedback individual
             * Podemos ter feedback individual e final
             */
            feedbackIndividual: null,

            /*
             * Feedback final
             * Podemos ter feedback individual e final
             */
            feedbackFinal: null,

            /*
             * Arquivo com as perguntas
             */
            xmlQuestoes: "../xml/aval.xml"

        }

        //# Sobreescreve valores default pelo que veio de parametro.
        this.cfg = $.extend({}, cfgDefault, p_cfg);

        var cfgExecucaoDefault = {
            /*
             * Controle de tentativa atual
             */
            tentativaAtual: {
                pergunta: 0,
                avaliacao: 0
            },

            /*
             * Controle de qual pergunta esta sendo exibida
             */
            perguntaAtual: 0,

            /*
             * Respostas usuario
             * array com todos os dados de resposta do usuario
             * {idPergunta:N(Number), respostaUsuario:N(Number), respostaCorreta:N(Number), correto:N(Boolean)}
             */
            RespostasUsuario: [],

            /*
             * Desempenho na avaliação
             * array com todos os dados do desempenho da avaliação
             * {tentativa:N(Number), perguntasRespondidas:N(Number), aproveitamento:N(Number), notaCorte:N(Number), aprovado:N(Boolean)}
             */
            desempenhoAvaliacao: []
        }

        //# Sobreescreve valores default pelo que veio de parametro.
        this.configExecucao = $.extend({}, cfgExecucaoDefault, p_configExecucao);

        this.init();
    }


    ConfiguracaoAval.prototype = {
        init: function (p_cfg) {
            // console.log(this.cfg)
        },

        idAval: function() {
            return this.cfg.idAval;
        },

        /*
         * Métodos para expor os dados de configuração
         */
        maxTentativas: function () {
            return this.cfg.tentativas;
        },

        totalPerguntasExibir: function () {
            return this.cfg.perguntasExibir;
        },

        perguntasRandomicas: function () {
            return this.cfg.perguntasRandomicas;
        },

        notaCorte: function () {
            return this.cfg.notaCorte;
        },

        feedbackIndividual: function () {
            return this.cfg.feedbackIndividual;
        },

        feedbackFinal: function () {
            return this.cfg.feedbackFinal;
        },

        xmlQuestoes: function () {
            return this.cfg.xmlQuestoes;
        },

        getData: function (p_strData) {
            if (this.cfg.hasOwnProperty(p_strData)) {
                return this.cfg[p_strData]
            } else {
                return "Não é possivel resgatar essa configuração :: " + p_strData;
            }
        },

        /*******************
         * Dados de execução
         *******************/

        /*
         * Tentativa Atual
         */
        tentativaAtual: function () {
            return this.configExecucao.tentativaAtual;
        },

        /*
         * Incrementa nova tentativa para a pergunta
         */
        novaTentativaPergunta: function () {
            this.configExecucao.tentativaAtual.pergunta++;
            this.salvarDadosConfiguracao();
        },

        /*
         * Incrementa nova tentativa para a pergunta
         */
        novaTentativaAvaliacao: function () {
            this.configExecucao.tentativaAtual.avaliacao++;
            this.salvarDadosConfiguracao();
        },

        /*
         * Reinicia nova tentativa para a pergunta
         */
        reiniciaTentativaPergunta: function () {
            this.configExecucao.tentativaAtual.pergunta = 0;
            this.salvarDadosConfiguracao();
        },

        /*
         * Incrementa nova tentativa para a pergunta
         */
        reiniciaTentativaAvaliacao: function () {
            this.configExecucao.tentativaAtual.avaliacao = 0;
            this.salvarDadosConfiguracao();
        },


        /*
         * retorna pergunta Atual
         */
        getPerguntaAtual: function () {
            return this.configExecucao.perguntaAtual;
        },

        /*
         * retorna pergunta Atual
         */
        getDesempenho: function () {
            return this.configExecucao.desempenhoAvaliacao;
        },

        /*
         * Atualiza pergunta atual
         */
        perguntaAtual: function (p_PerguntaAtual) {
            this.configExecucao.perguntaAtual = p_PerguntaAtual;
            this.salvarDadosConfiguracao();
        },

        /*
         * Função para registrar as respostas do usuario
         */
        registraRespostaUsuario: function (objResposta) {
            var idAvaliacao = this.cfg.idAval;

            //# Antes de armazenar a resposta do usuário verificamos se já existe algum registro para a pergunta respondida
            //# Essa verificação atente a mecânica de tentativas das perguntas
            var blnSobreescreveRegistro = false;
            for (var i = 0; i < this.configExecucao.RespostasUsuario.length; i++) {
                if (this.configExecucao.RespostasUsuario[i].idPergunta == objResposta.idPergunta) {
                    blnSobreescreveRegistro = true;
                    this.configExecucao.RespostasUsuario[i] = objResposta;
                    break;
                }
            }

            if (!blnSobreescreveRegistro) {
                this.configExecucao.RespostasUsuario.push(objResposta);
            }

            // salvar tracking
            // o número da questão é considerado com base na ordem salva em aval-ordem
            // formato: respostaCorreta, respostaUsuario, tentativa | respostaCorreta, respostaUsuario, tentativa ...
            var arrRespostas = [];
            $.each(this.configExecucao.RespostasUsuario, function (index, resposta) {
                arrRespostas.push([resposta.respostaCorreta, resposta.respostaUsuario, resposta.tentativa].join(','));
            });
            setSuspendData(idAvaliacao + '-respostas', arrRespostas.join('|'));
        },

        /*
         * Função para registrar o desempenho após o final da avaliação
         */
        registraDesempenhoAvaliacao: function (objDesempenho) {
            var idAvaliacao = this.cfg.idAval;

            this.configExecucao.desempenhoAvaliacao.push(objDesempenho);

            // salvar tracking
            // formato: aproveitamento, perguntasRespondidas, tentativa, totalAcertos | aproveitamento, perguntasRespondidas, ...
            var arrDesempenho = [];
            $.each(this.configExecucao.desempenhoAvaliacao, function (index, desempenho) {
                var arrAux = [];
                arrAux.push(desempenho.aproveitamento);
                arrAux.push(desempenho.perguntasRespondidas);
                arrAux.push(desempenho.tentativa);
                arrAux.push(desempenho.totalAcertos);
                arrDesempenho.push(arrAux.join(','));
            });
            setSuspendData(idAvaliacao + '-aproveitamento', arrDesempenho.join('|'));
        },

        /*
         * Retorna todas as respostas do usuario
         */
        listaRespostasUsuario: function () {
            return this.configExecucao.RespostasUsuario;
        },

        /*
         * Reiniciar repostas do usuario
         */
        reiniciaRespostasUsuario: function () {
            var idAvaliacao = this.cfg.idAval;

            this.configExecucao.RespostasUsuario = [];
            setSuspendData(idAvaliacao + '-respostas', '');
        },

        salvarDadosConfiguracao: function () {
            var idAvaliacao = this.cfg.idAval;

            var arrDadosExecucao = [];
            arrDadosExecucao.push(this.configExecucao.perguntaAtual);
            arrDadosExecucao.push(this.configExecucao.tentativaAtual.avaliacao);
            arrDadosExecucao.push(this.configExecucao.tentativaAtual.pergunta);
            setSuspendData(idAvaliacao + '-dadosExecucao', arrDadosExecucao.join());
        },

        recuperarDadosAnteriores: function () {
            var idAvaliacao = this.cfg.idAval;

            var strOrdemQuestoesAnt = getSuspendData(idAvaliacao + '-ordem');
            var strRespAnt = getSuspendData(idAvaliacao + '-respostas');
            var strExecAnt = getSuspendData(idAvaliacao + '-dadosExecucao');
            var strAproveitamentoAnt = getSuspendData(idAvaliacao + '-aproveitamento');

            var objRetorno = {};

            if (strOrdemQuestoesAnt) {
                var ordemQuestoes = strOrdemQuestoesAnt.split(',');

                if (strRespAnt) {
                    var arrRespostas = strRespAnt.split('|');
                    $.each(arrRespostas, function (index, resposta) {
                        var arrResposta = resposta.split(',');
                        var objAux = {};
                        objAux.idPergunta = Number(ordemQuestoes[index]);
                        objAux.respostaCorreta = Number(arrResposta[0]);
                        objAux.respostaUsuario = Number(arrResposta[1]);
                        objAux.correto = objAux.respostaCorreta == objAux.respostaUsuario;
                        objAux.tentativa = Number(arrResposta[2]);

                        arrRespostas[index] = objAux;
                    });

                    objRetorno.RespostasUsuario = arrRespostas;
                }
            }

            if (strExecAnt) {
                var arrExecAnt = strExecAnt.split(',');
                objRetorno.perguntaAtual = Number(arrExecAnt[0]);
                objRetorno.tentativaAtual = {};
                objRetorno.tentativaAtual.avaliacao = Number(arrExecAnt[1]) - 1;
                objRetorno.tentativaAtual.pergunta = Number(arrExecAnt[2]);

                if (objRetorno.RespostasUsuario && objRetorno.RespostasUsuario.length == this.cfg.perguntasExibir) {
                    // continua com os mesmos valores
                } else {
                    if (objRetorno.perguntaAtual <= this.cfg.perguntasExibir) {
                        objRetorno.perguntaAtual--;
                    }
                }
            }

            if (strAproveitamentoAnt) {
                var arrAproveitamento = strAproveitamentoAnt.split('|');
                var quantPerguntas = this.cfg.perguntasExibir;
                var maxTentativas = this.cfg.tentativas.avaliacao;
                var notaCorte = this.cfg.notaCorte;

                $.each(arrAproveitamento, function (index, resultado) {
                    var arrResultado = resultado.split(',');
                    var objAux = {};
                    objAux.aproveitamento = Number(arrResultado[0]);
                    objAux.maxTentativas = maxTentativas;
                    objAux.notaCorte = notaCorte;
                    objAux.perguntasRespondidas = Number(arrResultado[1]);
                    objAux.tentativa = Number(arrResultado[2]);
                    objAux.totalAcertos = Number(arrResultado[3]);
                    objAux.aproveitamento = 100 / quantPerguntas * objAux.totalAcertos;
                    objAux.aprovado = objAux.aproveitamento >= objAux.notaCorte;

                    arrAproveitamento[index] = objAux;
                });

                objRetorno.desempenhoAvaliacao = arrAproveitamento;
            }

            return objRetorno;
        }
    }

    /*
     * Aqui inicia o model para questão
     */
    var ModelQuestao = Avaliacao.ModelQuestao = function (p_xmlNode) {
        this.id = "";
        this.enunciado = "";
        this.alternativas = [];
        this.respostaCorreta = 0;

        this.init(p_xmlNode);
    }

    ModelQuestao.prototype = {
        init: function (p_xmlNode) {
            //# Armazena dados da questão
            this.id = $(p_xmlNode).attr("id");
            this.enunciado = $(p_xmlNode).find("pergunta titulo").text();
            this.respostaCorreta = $(p_xmlNode).find("corretas resposta").attr("id");
            this.feedback = new Avaliacao.ModelFeedback($(p_xmlNode).find("feedbacks"));

            ///# Varre alternativas e cria obj de controle de cada uma
            var $this = this;
            $(p_xmlNode).find("respostas resposta").each(function () {
                var alternativa = new Avaliacao.ModelAlternativa(this);

                $this.alternativas.push(alternativa);
            })
        }
    }

    /*
     * Aqui inicia os models para alternativa
     */
    var ModelAlternativa = Avaliacao.ModelAlternativa = function (p_xmlNode) {
        this.id = "";
        this.enunciado = "";

        this.init(p_xmlNode);
    }

    ModelAlternativa.prototype = {
        init: function (p_xmlNode) {
            //# Armazena dados da alternativa
            this.id = $(p_xmlNode).attr("id");
            this.enunciado = $(p_xmlNode).find("titulo").text();
        }
    }

    /*
     * Aqui inicia os models para alternativa
     */
    var ModelFeedback = Avaliacao.ModelFeedback = function (p_xmlNode) {
        this.feedbackCorreto = "";
        this.feedbackIncorreto = "";

        this.init(p_xmlNode);
    }

    ModelFeedback.prototype = {
        init: function (p_xmlNode) {
            //# Armazena dados dos feedback
            this.feedbackCorreto = $(p_xmlNode).find("correto").text();
            this.feedbackIncorreto = $(p_xmlNode).find("incorreto").text();
        }
    }
}());


/*
 * Função auxiliar para embaralhar itens
 */
(function ($) {

    $.fn.shuffle = function () {
        return this.each(function () {
            var items = $(this).children();
            return (items.length) ? $(this).html($.shuffle(items)) : this;
        });
    }

    $.shuffle = function (arr) {
        for (var j, x, i = arr.length; i; j = parseInt(Math.random() * i), x = arr[--i], arr[i] = arr[j], arr[j] = x);
        return arr;
    }

})(jQuery);
