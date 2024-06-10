function initComponentes() {
    if ($('[data-match-height]')) {
        $('[data-match-height]').matchHeight();
    }
    

    iniciarTabs();

    iniciarAccordion();

    iniciarTooltip();

    iniciarModal();

    iniciarMidia(estrutura.midiaStreaming, estrutura.caminhoStreaming);

    iniciarFlipcard();
    
    iniciarComponenteSlider();

    iniciarSideDrawer();
    
    iniciarSVG();

    $('#areaConteudo').foundation();

    verificarImagens();
}

function verificarImagens() {
    var totalCarregadas = 0;

    $('img').each(function () {
        if (!this.complete) {
            $(this).on('load', function () {
                totalCarregadas++;

                verificarCarregamentoImagens(totalCarregadas);
            });
        } else {
            totalCarregadas++;

            verificarCarregamentoImagens(totalCarregadas);
        }
    });

    
}

function verificarCarregamentoImagens(totalCarregadas) {
    if (totalCarregadas == $('img').length) {
        atualizarAlturaComponentes();
        atualizaDadosScrollDiv();
    }
}

function atualizarAlturaComponentes() {
    igualarAlturasFlipcard();
    updateEqualHeight();
}

function updateEqualHeight() {
    $.fn.matchHeight._update();
}