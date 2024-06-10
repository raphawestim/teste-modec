function iniciarMenu() {
    montarMenu();

    atualizarMenu();

    adicionarListenerBotoes();
}

function montarMenu() {
    var telaMenu = $('#telaMenu');
    var listaMenu = telaMenu.find('#listaMenu');
    var modeloItemMenu = listaMenu.find('li').clone();

    listaMenu.empty();

    var modulos = estrutura.modulos;
    var contModulos = 0;
    var countLicoes = 0;

    $.each(modulos, function(idModulo, modulo){

        if(!modulo.ignorar) {
            contModulos++;
            var licoes = modulo.licoes;
            var tamanhoLicoes = Object.keys(licoes).length;
            countLicoes = 0;

            $.each(licoes, function(idLicao, licao){
                countLicoes++;
                var itemLicao = modeloItemMenu.clone();
                
                itemLicao.find('[data-numero-licao]').html('<span>' + Format(countLicoes) + '</span>' + '/' + Format(tamanhoLicoes));
                itemLicao.find('[data-titulo-licao]').html(licao.nome);

                itemLicao.attr('data-sco', idModulo+idLicao);
                itemLicao.attr('data-tipo', estrutura.modulos[idModulo].licoes[idLicao].tipo);

                listaMenu.append(itemLicao);
            });
        }
    });

    listaMenu.slick({
        dots: false,
        infinite: false,
        centerMode: true,
        centerPadding: '16.5%',
        appendArrows: $('.nav-slider'),
        responsive: [
            {
                breakpoint: 769,
                settings: {
                    centerMode: false,
                }
            }
        ]
    });


    telaMenu.on('afterChange', function(event, slick, current) {
        var slideAtual = slick.$slides.eq(current);
        var slideAtualSco = $(slideAtual).attr('data-sco');
        var slideAtualTipo = $(slideAtual).attr('data-tipo');
        var slideAtualStatus = $(slideAtual).attr('data-status');

        slick.$slides.find('.wrap-item').attr('aria-hidden', true);
        slideAtual.find('.wrap-item').attr('aria-hidden', false);
        slideAtual.find('.wrap-item').focus();

        atualizarStatusBotaoMenu(slideAtualSco, slideAtualTipo, slideAtualStatus)

    })
}

function atualizarMenu() {
    var telaMenu = $('#telaMenu');
    var listaMenu = telaMenu.find('#listaMenu');
    var botoesMenu = telaMenu.find('#acessarLicao');
    var slidesMenu = telaMenu.find('.slick-slide');
    
    slidesMenu.each(function (i, slide) {
        var scoSlideAtual = $(slide).data('sco');
        var tipoSlideAtual = $(slide).data('tipo');
        var statusSlideAtual = $(slide).data('status');
        
        if(verificaSCOFinalizado(scoSlideAtual)) {
            $(slide).attr('data-status', 'finalizado')
        }else{
            $(slide).attr('data-status', 'bloqueado')
        }

        atualizarStatusBotaoMenu(scoSlideAtual, tipoSlideAtual, statusSlideAtual)
    });
    
    listaMenu.find('[data-status="bloqueado"]').first().attr('data-status', 'liberado')
    
    var indexUltimoSlideLiberado = slidesMenu.not('[data-status="bloqueado"]').last().index('.slick-slide');

    if(indexUltimoSlideLiberado >= 0){
        setTimeout(function(){
            listaMenu.slick('slickGoTo', indexUltimoSlideLiberado);
        }, 400);
    }

    if (isModoDesenvolvimento()) {
        slidesMenu.attr('data-status', 'liberado');
        botoesMenu.removeClass('status-bloqueado').prop('disabled', false);
    }
}

function atualizarStatusBotaoMenu(slide_sco, slide_tipo, slide_status){

    var btnAcessarLicao = $('#acessarLicao');

    var scoSlideAtual = slide_sco;
    var tipoLicaoSlideAtual = slide_tipo;
    var statusSlideAtual = slide_status;

    btnAcessarLicao.removeClass(function (index, className) {
        return (className.match (/(^|\s)status-\S+/g) || []).join(' ');
    });

    btnAcessarLicao.attr('data-sco', scoSlideAtual)
    btnAcessarLicao.attr('data-tipo', tipoLicaoSlideAtual)

    if(statusSlideAtual){
        btnAcessarLicao.addClass('status-' + statusSlideAtual)

        if (statusSlideAtual === 'bloqueado'){
            btnAcessarLicao.prop('disabled', true)
        } else {
            btnAcessarLicao.prop('disabled', false)
        }

    }
}

function adicionarListenerBotoes() {
    var telaMenu = $('#telaMenu');

    telaMenu.on('click', '#acessarLicao', function(){

        var scoClique = $(this).attr('data-sco');
        var tipoLicao = $(this).attr('data-tipo');
        
        if(tipoLicao == 'video'){
            abrirModalVideoMenu(scoClique);
        }else{
            ChangeSCO(scoClique);
        }
        
    });
}
