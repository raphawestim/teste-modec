/**
 * Função para exercícios de seleção de itens (alternativas, múltipla escolha)
 * @param  {String} p_seletor Id do exercício - passado como parâmetro para casos que possuem mais de um exercício na mesma tela
 * @param  {Array} p_gabarito Vetor com as respostas do exercício
 * @param  {Boolean} p_multiplaEscolha Se o usuário pode selecionar mais de 1 alternativa
 * @param  {Number} p_tentativas Número de tentativas possíveis para acertar o exercício
 * @return {void} Não possui valor de retorno
 */
function exercicioAlternativas(p_seletor, p_gabarito, p_multiplaEscolha, p_tentativas, p_temFeedback) {
    var seletor = p_seletor;
    var elemento = $("#" + seletor + "[data-tipo='alternativas']");
    var gabarito = p_gabarito;
    var multiplaEscolha = p_multiplaEscolha;
    var tentativas = (typeof p_tentativas !== 'undefined') ? p_tentativas : 1;
    var tentativasRealizadas = 0;
    var temFeedback = (typeof p_temFeedback !== 'undefined') ? p_temFeedback : true;

    var respostaAnterior = getSuspendData('exResp-' + seletor);
    var primeiroAcessoExercicio = respostaAnterior ? false : true;

    var objResposta = {
        acertou: false,
        avaliativo: true,
        id: seletor
    };

    iniciarExercicio();

    function iniciarExercicio() {
        montarAlternativas();

        elemento.find('#btConfirmar').attr('disabled', true);
        elemento.find('#btReverFeedback').hide();

        if(elemento.hasClass('fixacao')) {
            objResposta.avaliativo = false;
        }

        if (respostaAnterior) {
            respostaAnterior = respostaAnterior.split(',');

            $.each(respostaAnterior, function(index, value) {
                elemento.find('.alternativa input[value="' + value + '"]').prop('checked', true);
            });

            bloquearExercicio();

            if (temFeedback) {
                mostrarGabarito();
            }
        } else {
            elemento.find(':radio, :checkbox').on('change', function() {
                elemento.find('.alternativa').removeClass('selecionada');
                elemento.find('.alternativa input:checked').parents('.alternativa').addClass('selecionada');

                if (elemento.find('.alternativa input:checked').length > 0) {
                    elemento.find('#btConfirmar').attr('disabled', false);
                }
                else {
                    elemento.find('#btConfirmar').attr('disabled', true);
                }
            });

            elemento.on("click", '#btConfirmar', function() {
                tentativasRealizadas++;
                verificarExercicio();
            });
        }
    }

    function montarAlternativas() {
        elemento.find('.alternativa').each(function(index, element) {
            if(multiplaEscolha) {
                $(this).find('input').attr('type', 'checkbox');
                $(this).find('input').attr('name', seletor + '-q' + index);
            }
            else {
                $(this).find('input').attr('type', 'radio');
                $(this).find('input').attr('name', seletor + '-q');
            }

            $(this).find('input').attr('id', seletor + '-a' + index);
            $(this).find('input').attr('value', index + 1);
            $(this).find('label').attr('for', seletor + '-a' + index);
        });

        elemento.find('.alternativa input').checkboxradio();

        embaralharAlternativas();
    }

    function verificarExercicio() {
        var respostas = [];
        var quantRespostasCorretas = 0;
        var quantRespostasErradas = 0;
        var copiaGabarito = gabarito.slice();

        elemento.find('.alternativa input:checked').each(function(index, element) {
            respostas.push(Number($(this).val()));
        });

        objResposta.selecao = respostas.slice();

        $.each(respostas, function(index, value) {
            if (copiaGabarito.indexOf(value) >= 0) {
                quantRespostasCorretas++;
                copiaGabarito.splice(copiaGabarito.indexOf(value), 1);
            } else {
                quantRespostasErradas++;
            }
        });

        if(quantRespostasErradas == 0 && copiaGabarito.length == 0) {
            objResposta.acertou = true;
            exibirFeedback('#feedPos_' + seletor, 'positivo', verificarFimExercicio);
        }
        else {
            exibirFeedback('#feedNeg_' + seletor, 'negativo', verificarFimExercicio);
        }
    }

    function verificarFimExercicio(){
		if ( respostaAnterior ) return;

        if (tentativasRealizadas == tentativas) {
            finalizarExercicio();
        } else {
            reiniciarExercicio();
        }
    }

    function exibirFeedback(p_idFeedback, p_tipoFeedback, p_callback) {
        var callback = p_callback;

        var modalFeedback = {
            url: "data/modais/feedbacks.html",
            modalId: p_idFeedback,
            cssClass: p_tipoFeedback,
            callback: {
                aoAbrir: undefined,
                aoFechar: undefined
                // aoFechar: (callback != undefined && typeof callback == "function") ? callback : undefined
            }
        };

        if(temFeedback) {
            abreModal(modalFeedback);
        }

        if(callback != undefined && typeof callback == "function") {
            callback();
        }
    }

    function mostrarGabarito() {
        $.each(gabarito, function(index, value) {
            var alternativaCorreta = elemento.find('.alternativa input[value="' + gabarito[index] + '"]');
            alternativaCorreta.parents('.alternativa').addClass('certo');
        });

        elemento.find('.alternativa input:checked').parents('.alternativa').addClass('selecionada');
        elemento.find('.alternativa').not('.certo').addClass('errado');
    }

    function finalizarExercicio() {
        gravarDados();
        bloquearExercicio();

        if(temFeedback) {
            mostrarGabarito();
        }

        $('body').trigger('exercicioFinalizado', objResposta);

        var indexBloco = elemento.parents("[data-bloco]").index("[data-bloco]");
        $("body").trigger("interacoesConcluidas", { interacaoExistente: true, indexBloco: indexBloco });
    }

    function reiniciarExercicio() {
        elemento.find('#btConfirmar').attr('disabled', true);
        elemento.find('.alternativa input').prop('checked', false);
        elemento.find('.alternativa input').checkboxradio('refresh');
    }

    function bloquearExercicio() {
        elemento.find('#btConfirmar').hide();
        elemento.find('.alternativa input').checkboxradio('disable');
		elemento.find('.alternativa input').checkboxradio('refresh');
        elemento.find('.alternativa').addClass('bloqueado');
        elemento.addClass('finalizado');

        if (temFeedback) {
            elemento.find('#btReverFeedback').show();
            elemento.off('click').on("click", '#btReverFeedback', function() {
                verificarExercicio();
            });
        }
    }

    function gravarDados() {
        var respostas = [];
        elemento.find('.alternativa input:checked').each(function(index, element) {
            respostas.push(Number($(this).val()));
        });

        setSuspendData('exResp-' + seletor, respostas.join());
    }

    function embaralharAlternativas() {
        var parent = elemento.find('.lista-alternativas');
        var divs = parent.children();
        while (divs.length) {
            parent.append(divs.splice(Math.floor(Math.random() * divs.length), 1)[0]);
        }
    }
}
