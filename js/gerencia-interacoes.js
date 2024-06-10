var arrInteracoesObrigatorias = ["data-interacao", "video", "slider"];

function verificarInteracoes() {

    var $arrInteracoesTela = arrInteracoesObrigatorias;
    var $totalTiposInteracoes = $arrInteracoesTela.length;
    var $totalTiposConcluidos = 0;

    var $totalExercicios = $("#areaConteudo").find("[data-exercicio]").length;

    $("body").off("interacoesConcluidas").on("interacoesConcluidas", function (e, data) {
        if (isLicaoOnepage()) {
            if (data && data.hasOwnProperty('interacaoExistente')) {
                if (data.interacaoExistente) {
                    if (data.hasOwnProperty('indexBloco')) {
                        atualizarBloqueioOnepage(data.indexBloco);
                    } else {
                        console.log('O número do bloco não foi passado como parâmetro.');
                    }
                }else{
                    $scrollDiv.data('interacoesFinalizadas', true);
                }
            } else {
                console.log('Faltam parametros do evento.');
            }
        } else {
            $totalTiposConcluidos++;
            if ($totalTiposConcluidos == ($totalTiposInteracoes + $totalExercicios)) {
                $("body").trigger("interacoesTelaFinalizadas");
            }
        }
    });

    for (var i = 0; i < $totalTiposInteracoes; i++) {
        if ($arrInteracoesTela[i] == "data-interacao") {
            var $tempoLeitura = $("#areaConteudo").find(".pagina").data("tempo-leitura");
            controleInteracao({
                tempoLeitura: $tempoLeitura
            });
        }

        if ($arrInteracoesTela[i] == "slider") {
            controleSliders();
        }
    }
}
