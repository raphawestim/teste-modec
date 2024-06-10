var aproveitamentoExercicios = {};
var notaCorte = 70;

function iniciarGerenciamentoNota() {
    var configAvaliacao = {
        idAval: 'avC',
        perguntasExibir: estrutura.totalQuestoesAvaliacao || 10,
        notaCorte: notaCorte,
        feedbackIndividual: true,
        perguntasRandomicas: true,
        xmlQuestoes: "xml/avaliacao.xml",
        tentativas: {
            avaliacao: 100,
            pergunta: 1
        }
    };
    
    var configPreTeste = {
        idAval: 'preT',
        perguntasExibir: estrutura.totalQuestoesAvaliacao,
        notaCorte: notaCorte,
        feedbackIndividual: true,
        perguntasRandomicas: true,
        xmlQuestoes: "xml/avaliacao.xml",
        tentativas: {
            avaliacao: 1,
            pergunta: 1
        }
    };

    recuperarAproveitamentoExercicio();

    $('body').on('notaAvaliacaoFinalizada', function (e, data) {
        enviarNota(data.aproveitamento);
    });

    $('body').on('exercicioFinalizado', function (e, data) {
        if(data.avaliativo) {
            salvarAproveitamentoExercicio(data);
        }

        if(verificarFimExercicios()) {
            var nota = calcularNotaExercicios();

            enviarNota(nota);

            finalizarTela();
        }
    });

    $('body').on('click', '[data-iniciar-avaliacao]', function () {
        if (verificaTipoLicaoAtual() === 'preTeste') {
            iniciarAvaliacao(configPreTeste);

        } else if (verificaTipoLicaoAtual() === 'avaliacao') {
            iniciarAvaliacao(configAvaliacao);
        }
    });
}

function recuperarAproveitamentoExercicio() {
    var strSuspend = getSuspendData('apEx');

    if (strSuspend) {
        var arrSuspend = strSuspend.split('|');
        var objRespostas = {};

        for (var i = 0; i < arrSuspend.length; i++) {
            var arrExercicio = arrSuspend[i].split(',');

            objRespostas[arrExercicio[0]] = parseInt(arrExercicio[1], 10);
        }

        aproveitamentoExercicios = objRespostas;
    }
}

function salvarAproveitamentoExercicio(dados) {
    if (!aproveitamentoExercicios.hasOwnProperty(dados.id)) {
        aproveitamentoExercicios[dados.id] = dados.acertou ? 1 : 0;

        var arrDados = [];

        for (var idExercicio in aproveitamentoExercicios) {
            if (aproveitamentoExercicios.hasOwnProperty(idExercicio)) {
                var strDado = idExercicio + ',' + aproveitamentoExercicios[idExercicio];

                arrDados.push(strDado);
            }
        }

        setSuspendData('apEx', arrDados.join('|'));
    }
}

function verificarFimExercicios() {
    // todos os exercícios, independente de valer nota ou não, são obrigatórios para finalização da tela
    var exercicios = $('#areaConteudo').find('[data-exercicio]');
    var totalExercicios = exercicios.length;
    var totalExerciciosFinalizados = exercicios.filter('.finalizado').length;

    if(totalExercicios === totalExerciciosFinalizados) {
        return true;
    } else {
        return false;
    }
}

function calcularNotaExercicios() {
    var totalExercicios = 0;
    var totalAcertos = 0;
    var nota = 0;

    for (var idExercicio in aproveitamentoExercicios) {
        if (aproveitamentoExercicios.hasOwnProperty(idExercicio)) {
            totalExercicios++;

            if(aproveitamentoExercicios[idExercicio]) {
                totalAcertos++;
            }
        }
    }

    nota = Math.round((totalAcertos * 100) / totalExercicios);

    return nota;
}

function getNotaCurso() {
    var nota = parseInt(getSuspendData('notaFinal'), 10);

    nota = isNaN(nota) || nota == '' ? 0 : nota;

    return nota;
}

function enviarNota(notaAtual) {
    var notaAnterior = 0;

    if (SCORM) {
        notaAnterior = parseInt(GetScore());
    } else {
        notaAnterior = parseInt(getSuspendData('notaFinal'), 10);
    }

    notaAnterior = isNaN(notaAnterior) || notaAnterior == '' ? 0 : notaAnterior;

    var notaFinal = (notaAtual > notaAnterior) ? notaAtual : notaAnterior;

    setSuspendData('notaFinal', notaFinal);

    if (SCORM) {
        SetScore(notaFinal);
    }
}

function isAlunoAprovado() {
    if(getNotaCurso() >= notaCorte) {
        return true;
    } else {
        return false;
    }
}
