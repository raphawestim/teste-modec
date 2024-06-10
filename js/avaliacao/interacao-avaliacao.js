function iniciarAvaliacao(config) {

    var elementoAvaliacao = $('[data-tipo="avaliacao"]');
    var blocoIntroducao = elementoAvaliacao.find('[data-introducao]');
    var blocoPerguntas = elementoAvaliacao.find('[data-perguntas]');
    var blocoFeedbackFinal = elementoAvaliacao.find('[data-feedback-final]');

    //# Adiciona listeners dos eventos da avaliação
    //# Quando a avaliação é iniciada
    $('body').off('iniciaAval').on('iniciaAval', function (event, eventData) {
        blocoIntroducao.addClass('oculto');
        blocoPerguntas.removeClass('oculto');
        blocoFeedbackFinal.addClass('oculto');

        $scrollDiv.data('interacoesFinalizadas', false);
    });

    //# Quando a avaliação é encerrada
    $('body').off('avaliacaoEncerrada').on('avaliacaoEncerrada', function (event, eventData) {
        var tentativaAtual = eventData.tentativa;
        var tentativasMax = eventData.maxTentativas;
        var tentativasRestantes = tentativasMax - tentativaAtual;
        var aproveitamento = Math.round(eventData.aproveitamento);
        var totalAcertos = eventData.totalAcertos;
        var totalQuestoes = eventData.perguntasRespondidas;
        var notaCorte = eventData.notaCorte;
        var aprovado = eventData.aprovado;

        blocoFeedbackFinal.find('[data-total-tentativas]').text(tentativasMax);
        blocoFeedbackFinal.find('[data-tentativas-realizadas]').text(tentativaAtual);
        blocoFeedbackFinal.find('[data-tentativas-restantes]').text(tentativasRestantes);
        blocoFeedbackFinal.find('[data-total-questoes]').text(totalQuestoes);
        blocoFeedbackFinal.find('[data-total-acertos]').text(totalAcertos);
        blocoFeedbackFinal.find('[data-nota-corte]').text(notaCorte);
        blocoFeedbackFinal.find('[data-nota-final]').text(aproveitamento);
        
        blocoFeedbackFinal.find('[data-feedback]').hide();

        //pode refazer a avaliação
        if (tentativasRestantes > 0 && !aprovado) { 
            blocoFeedbackFinal.find("[data-feedback-1]").show();

            blocoFeedbackFinal.find("#btReiniciarAvaliacao").show();

        //avaliação finalizada
        } else { 
            if (aprovado) {
                blocoFeedbackFinal.find("[data-feedback-2]").show();
                $scrollDiv.data('interacoesFinalizadas', true);
                finalizarTela();
            } else {
                blocoFeedbackFinal.find("[data-feedback-3]").show();
            }

            blocoFeedbackFinal.find("#btReiniciarAvaliacao").hide();

        }

        $('body').trigger('notaAvaliacaoFinalizada', {
            aproveitamento: aproveitamento
        });

        blocoIntroducao.addClass('oculto');
        blocoPerguntas.addClass('oculto');
        blocoFeedbackFinal.removeClass('oculto');
    });

    //# Listener, sempre que for atualizada uma questão é chamada essa função.
    //# Ela atualiza os dados na tela
    $('body').off('atualizaQuestao').on('atualizaQuestao', function (event, eventData) {
        blocoPerguntas.find(".exercicio").attr('aria-hidden', true);
        blocoPerguntas.find("#btContinuar").hide();
        blocoPerguntas.find("#btConfirmar").show();
        blocoPerguntas.find("#btConfirmar").attr('disabled', true);

        //# atualiza campo com o enunciado da questão
        blocoPerguntas.find("#numQuestao").html(Format(eventData.perguntaAtual));
        blocoPerguntas.find("#questao").html('<p>' +eventData.pergunta.enunciado + '</p>');        

        //# Popula as alternativas
        blocoPerguntas.find("#alternativas").empty();
        $(eventData.pergunta.alternativas).each(function (i) {
            var idAlternativa = 'alternativa_' + this.id;
            var idInput = 'q-' + eventData.perguntaAtual + '-a-' + this.id;

            var inputAlternativa = '<input type="radio" aria-label="' + this.enunciado + '" name="q-' + eventData.perguntaAtual + '" id="' + idInput + '">';
            var labelAternativa = '<label class="texto" aria-hidden="true" for="' + idInput + '">' + this.enunciado + '</label></div>';

            var textoAlternativa = inputAlternativa + labelAternativa;

            jQuery('<div/>', {
                "id": idAlternativa,
                "class": 'alternativa',
                //"class": 'alternativa ' + ((eventData.pergunta.respostaCorreta == this.id) ? " correta" : ""),
                "data-id": this.id,
                "html": textoAlternativa
            }).appendTo(blocoPerguntas.find("#alternativas"));
        });

        embaralharAlternativas();

        blocoPerguntas.find(".alternativa input").checkboxradio();
        blocoPerguntas.find(".exercicio").attr('aria-hidden', false);
        blocoPerguntas.find(".enunciado").focus();
    });

    //# Quando uma pergunta é respondida
    $('body').off('questaoProcessada').on('questaoProcessada', function (event, eventData) {
        blocoPerguntas.find("#btConfirmar").hide();
        
        blocoPerguntas.find('.alternativa input').checkboxradio('disable');
        blocoPerguntas.find('.alternativa input').checkboxradio('refresh');
        blocoPerguntas.find('.alternativa').addClass('bloqueado');

        if (!eventData.ultimaPergunta.feedback.individual.exibir) {
            aval.proximaPergunta();

        } else {
            var strFeed;
            var tipoFeedback;

            if (eventData.ultimaPergunta.correto) {
                strFeed = eventData.ultimaPergunta.feedback.individual.conteudo.feedbackCorreto;
                tipoFeedback = 'positivo';
                blocoPerguntas.find("#feedbackQuestao [data-titulo]").html('Muito bem!');
            } else {
                strFeed = eventData.ultimaPergunta.feedback.individual.conteudo.feedbackIncorreto;
                tipoFeedback = 'negativo';
                blocoPerguntas.find("#feedbackQuestao [data-titulo]").html('Atenção!');
            }
            
            blocoPerguntas.find("#feedbackQuestao [data-conteudo]").html(strFeed);
            
            var alternativaCorreta = eventData.respostasUsuario[eventData.perguntaAtual - 1].respostaCorreta;
            gabaritaExercicio(alternativaCorreta);

            mostrarFeedbackQuestao(blocoPerguntas.find("#feedbackQuestao"), tipoFeedback);

            // blocoPerguntas.find("#btContinuar").show();
        }
    });

    //# Seleção da alternativa
    blocoPerguntas.on('change', ':radio, :checkbox', function () {
        blocoPerguntas.find('.alternativa').removeClass('selecionada');
        $(this).parents('.alternativa').addClass('selecionada');

        if (blocoPerguntas.find('.alternativa input:checked').length > 0) {
            blocoPerguntas.find('#btConfirmar').attr('disabled', false);
        } else {
            blocoPerguntas.find('#btConfirmar').attr('disabled', true);
        }
    });

    //# Botão confirmar
    blocoPerguntas.on("click", "#btConfirmar", function () {
        $('.enunciado').focus();
        aval.respostaUsuario(elementoAvaliacao.find("#alternativas .alternativa.selecionada").data('id'));
    });

    //# Botao continuar
    blocoPerguntas.on("click", "#btContinuar", function () {
        aval.proximaPergunta();
    });

    //# Botao reiniciar
    blocoFeedbackFinal.on("click", "#btReiniciarAvaliacao", function () {
        reiniciarAvaliacao();
    });

    function gabaritaExercicio(alternativaCorreta) {
        $.each(blocoPerguntas.find("#alternativas .alternativa"), function () {
            /* marca todas as alternativas como corretas ou incorretas */
            // if ($(this).attr("data-id") == alternativaCorreta) {
            //     $(this).addClass('certo');
            // } else {
            //     $(this).addClass('errado');
            // }

            /* marca apenas a selecionada como correta ou incorreta */
            if($(this).hasClass('selecionada')) {
                if ($(this).attr("data-id") == alternativaCorreta) {
                    $(this).addClass('certo');
                } else {
                    $(this).addClass('errado');
                }
            }
        });
    }

    function mostrarFeedbackQuestao(feedback, tipo) {
        // $.featherlight(feedback, {
        //     variant: tipo,
        //     afterClose: function() {
        //         // aval.proximaPergunta();
        //     }
        // });

        var modalFeedback = {
            url: '',
            modalId: '',
            cssClass: tipo,
            conteudo: feedback,
            callback: {
                aoAbrir: function() {
                    $('.featherlight-close').attr('aria-hidden', false);
                },
                aoFechar: function() {
                    aval.proximaPergunta();
                }
            }
        };

        abreModal(modalFeedback);
    }

    function reiniciarAvaliacao() {
        aval.novaTentativaAvaliacao();

        blocoIntroducao.addClass('oculto');
        blocoFeedbackFinal.addClass('oculto');
        blocoPerguntas.removeClass('oculto');
    }

    function embaralharAlternativas() {
        var parent = elementoAvaliacao.find('.lista-alternativas');
        var divs = parent.children();
        while (divs.length) {
            parent.append(divs.splice(Math.floor(Math.random() * divs.length), 1)[0]);
        }
    }

    var aval = new Avaliacao(config);
}
