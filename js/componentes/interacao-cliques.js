function controleInteracao(p_configuracao) {
    var configuracaoPadrao = {
        itemAttr: 'data-interacao',
        classeVisitado: 'visitado',
        tempoLeitura: 3000
    };

    var config = $.extend({}, configuracaoPadrao, p_configuracao);

    var $targets = $('#areaConteudo').find('[' + config.itemAttr + ']');
    
    if ($targets.length !== 0) {
        $targets.on('click', function (e) {
            $(this).addClass(config.classeVisitado);
            $(this).attr(config.itemAttr, config.classeVisitado);

            var indexBloco;
            if (isLicaoOnepage()) {
                indexBloco = $(this).parents('[data-bloco]').index('[data-bloco]');
            }

            verificaInteracaoConcluida(config.itemAttr, config.classeVisitado, indexBloco);
        });

    } else { //finaliza com o tempo de leitura
        timeoutTempoLeitura = setTimeout(function () {
            $('body').trigger('interacoesConcluidas', {
                interacaoExistente: false
            });
        }, config.tempoLeitura);
    }
}

function verificaInteracaoConcluida(attrInteracao, attrInteragido, indexBloco) {
    var seletorInteracao = '[' + attrInteracao + ']';

    var totalInteracoes = $(seletorInteracao).length;
    var interacoesRealizadas = $(seletorInteracao).filter(function (index) {
        return $(this).attr(attrInteracao) === attrInteragido;
    }).length;

    if (typeof indexBloco !== 'undefined' && indexBloco >= 0) {
        var $bloco = $('[data-bloco]').eq(indexBloco);
        
        totalInteracoes = $bloco.find(seletorInteracao).length;
        interacoesRealizadas = $bloco.find(seletorInteracao).filter(function (index) {
            return $(this).attr(attrInteracao) === attrInteragido;
        }).length;
    }

    if (totalInteracoes == interacoesRealizadas) {
        $('body').trigger('interacoesConcluidas', {
            interacaoExistente: true,
            indexBloco: indexBloco
        });
    }
}
