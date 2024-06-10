function iniciarComponenteSlider() {
    if ($(".content-slider").length) {
        $(".content-slider").each(function (index, slider) {
            var isSliderVisivel = $(this).is(":visible");

            var isSliderIniciado = $(this).hasClass("slick-initialized");
            if (isSliderVisivel && !isSliderIniciado){
                var idSlider = 'slider' + index;

                var botaoVoltarSlide = '<button class="slick-prev" aria-label="Voltar slide" aria-controls="' + idSlider + '" type="button">Anterior</button>';
                var botaoAvancarSlide = '<button class="slick-next" aria-label="Avançar slide" aria-controls="' + idSlider + '" type="button">Próximo</button>';

                $(slider).attr('id', idSlider);

                $(slider).after($('<div/>', {
                    'class': 'nav-slider',
                    'data-for': idSlider
                }));

                var sliderConfig = {
                    infinite: false,
                    dots: true,
                    arrows: true,
                    appendDots: $('.nav-slider[data-for="' + idSlider + '"'),
                    prevArrow: botaoVoltarSlide,
                    nextArrow: botaoAvancarSlide
                };

                if ($(slider).parent('.slide-cards').length) {
                    configBreakpoint = [{
                        breakpoint: 991,
                        settings: {
                            slidesToShow: 1,
                            slidesToScroll: 1
                        }
                    }];

                    sliderConfig['fade'] = false;
                    sliderConfig['slidesToShow'] = 2;
                    sliderConfig['slidesToScroll'] = 1;
                    sliderConfig['responsive'] = configBreakpoint;
                }

                $(slider).on('init', function(e, slick) {
                    var slider = slick.$slider;

                    slider.parents('.slider-wrapper').find('.slick-dots').attr('aria-hidden', true);
                    atualizarAlturaCardsSlider(slider);
                });

                $(slider).slick(sliderConfig);
                
            }
        });

        controleSliders();
    }
}

function controleSliders() {
    var $target = $("#areaConteudo");

    if ($target.find(".content-slider").length) {

        var $totalSliders = $target.find(".content-slider").length;
        var $arrSlidersConcluidos = [];

        $target.find(".content-slider").each(function (i) {
            $slider = $(this);
            var $totalSliderItens = $(this).find(".slide").length;
            var arrSliderItens = [1];
            $(this).attr('slider-id', 'slider' + i);

            $(this).on('init', function(e, slick) {
                $(this).find('.slick-slide').each(function(i) {
                    if($(this).hasClass('slick-active') || $(this).hasClass('slick-current')) {
                        arrSliderItens[i] = 1;
                    }
                })
            });

            for (var j = 1; j < $totalSliderItens; j++) {
                if(!arrSliderItens[j]){
                    arrSliderItens[j] = 0;
                }
            }

            $target.find(".content-slider").eq(i).on("afterChange", function ($event, $slick, $currentSlide) {
                $(this).find('.slick-slide').each(function(i) {
                    if($(this).hasClass('slick-active') || $(this).hasClass('slick-current')) {
                        arrSliderItens[i] = 1;
                    }
                })

                var $sliderIndex = i;

                if (String(arrSliderItens).indexOf(0) == -1) {
                    var indexBlocoAtual = $(this).parents("[data-bloco]").index("[data-bloco]");
                    $("body").trigger("interacoesConcluidas", { interacaoExistente: true, indexBloco: indexBlocoAtual });
                }
            });
        });
    } else {
        $("body").trigger("interacoesConcluidas", { interacaoExistente: false });
    }
}

function atualizarAlturaCardsSlider(slider) {
    if ($(slider).parent('.slide-cards').length) {
        $(slider).find('.card').attr('data-mh', 'card-' + $(slider).attr('id')).matchHeight({
            byRow: false
        });
    }
}
