function iniciarBloqueioOnepage() {
    inicializarBlocos();

    var ultimoBlocoLiberado = getProgressoBloco(SCO, POSICAO);
    if (ultimoBlocoLiberado <= 0) {
        var primeiroDesbloqueio = $("[data-bloco-pausa]:first").index("[data-bloco]");

        if (primeiroDesbloqueio >= 0) {
            ultimoBlocoLiberado = primeiroDesbloqueio;

            exibirBlocos(ultimoBlocoLiberado);
        } else {
            ultimoBlocoLiberado = $("[data-bloco]").length - 1;

            exibirBlocos(ultimoBlocoLiberado);

            atualizarBloqueioOnepage(ultimoBlocoLiberado);
        }
    } else {
        exibirBlocos(ultimoBlocoLiberado);
    }
}

function inicializarBlocos() {
    var tiposInteracao = ["[data-interacao]", "[data-midia]", ".content-slider", "[data-exercicio]"];

    $('.bloco').each(function (index, bloco) {
        $(bloco).hide();
        $(bloco).attr('data-bloco', index);

        for (var i = 0; i < tiposInteracao.length; i++) {
            if ($(bloco).find(tiposInteracao[i]).length) {
                $(bloco).attr('data-bloco-pausa', '');
                break;
            }
        }
    });
}

function setProgressoBloco(numeroBloco, scoPagina, posicaoPagina) {
    var idPagina = (scoPagina + 't' + posicaoPagina);
    var valorProgresso = idPagina + ':' + numeroBloco;
    numeroBloco = Number(numeroBloco);

    var dataBlocosAnterior = getSuspendData('ultimo-bloco-liberado');
    var dataBlocosFinal;

    if (dataBlocosAnterior) {
        var valorAtualizado = false;
        var vetorDataBlocos = dataBlocosAnterior.split(',');

        $.each(vetorDataBlocos, function (index, valorBloco) {
            if (valorBloco.indexOf(idPagina) >= 0) {
                var numeroBlocoAnterior = Number(valorBloco.split(':')[1]);
                if (numeroBlocoAnterior < numeroBloco) {
                    vetorDataBlocos[index] = valorProgresso;
                }

                valorAtualizado = true;

                return false;
            }
        });

        if (!valorAtualizado) {
            vetorDataBlocos.push(valorProgresso);
        }

        dataBlocosFinal = vetorDataBlocos.join(',');
    } else {
        dataBlocosFinal = valorProgresso;
    }

    setSuspendData('ultimo-bloco-liberado', dataBlocosFinal);
}

function getProgressoBloco(scoPagina, posicaoPagina) {
    var numeroBloco = 0;
    var idPagina = (scoPagina + 't' + posicaoPagina);

    var dataBlocosAnterior = getSuspendData('ultimo-bloco-liberado');

    if (dataBlocosAnterior) {
        var vetorDataBlocos = dataBlocosAnterior.split(',');

        $.each(vetorDataBlocos, function (index, valorBloco) {
            if (valorBloco.indexOf(idPagina) >= 0) {
                numeroBloco = Number(valorBloco.split(':')[1]);

                return false;
            }
        });
    }

    return numeroBloco;
}

function exibirBlocos(indexBloco) {
    if (indexBloco != null) {
        $('[data-bloco]').eq(indexBloco).show();

        $("[data-bloco]:lt(" + (indexBloco) + ")").show();

        removerMensagensInstrucao(indexBloco);

        controlarIndicacaoRolagem();

        if($('[data-bloco]').eq(indexBloco).find('.content-slider').length){
            iniciarComponenteSlider();
        }

        if($('[data-bloco]').eq(indexBloco).find('[flip-card-item]').length){
            igualarAlturasFlipcard();
        }
    }
}

function removerMensagensInstrucao(indexBloco) {
    if (typeof indexBloco !== 'undefined') {
        $("[data-bloco]:lt(" + (indexBloco) + ")").find('[data-instrucao-navegacao]').hide();
    } else {
        $('[data-instrucao-navegacao]').hide();
    }
}

function atualizarBloqueioOnepage(indexBlocoInteracao) {
    if (SCO != 'm00l00') {
        var indexUltimoBlocoVisivel = $("[data-bloco]:visible").last().index('[data-bloco]');

        if (indexUltimoBlocoVisivel == indexBlocoInteracao) {
            var indexProximoBloco = $("[data-bloco-pausa]:not(:visible)").first().index('[data-bloco]');

            if (indexProximoBloco < 0) { // não existem mais bloqueios na página
                indexProximoBloco = $("[data-bloco]:not(:visible)").last().index('[data-bloco]');
                exibirBlocos(indexProximoBloco);

                $("body").trigger("interacoesTelaFinalizadas");
            } else {
                exibirBlocos(indexProximoBloco);
            }

            if (indexProximoBloco) {
                setProgressoBloco(indexProximoBloco, SCO, POSICAO);
            }
        }
    }
}
