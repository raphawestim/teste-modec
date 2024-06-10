var $boxConteudoLateral = $('.box-conteudo-lateral');
var $boxConteudo = $('#conteudo');

function iniciarSideDrawer(){

    inicializarItens();

    $("[data-item-conteudo]").on('click', function(e){
        e.preventDefault();

        inserirConteudo($(this));
    });

    $('#btFecharBox').off('click').on('click', function(){
        $('body').removeClass('conteudo-lateral-aberto');

        $('#areaConteudo').focus();
    });
}

function inicializarItens(){
    $('[data-item-conteudo]').each(function(i, el){
        $(this).attr('data-item-conteudo', i);
    });

    $('[data-conteudo]').each(function(i, el){
        $(this).attr('data-conteudo', i);
    });
};

function inserirConteudo(el){
    // Limpar o box conteudo na index
    $boxConteudoLateral.find('#conteudo').empty();

    $('body').addClass('conteudo-lateral-aberto');

    var item = $(el).data('item-conteudo');
    var conteudo =  $('[data-conteudo="'+item+'"]').html();

    $boxConteudo.append(conteudo);

    // Acessibilidade
    $('#boxConteudoLateral').find('h5').attr('id', 'tituloSidedrawer');    
    $('#boxConteudoLateral').attr('role', 'alertdialog');
    $('#boxConteudoLateral').attr('aria-labelledby', 'tituloSidedrawer');
    $('#boxConteudoLateral').attr('tabindex', '0');

    

    var scrollbarWidth = getScrollBarWidth($boxConteudoLateral);
    var headerBoxConteudo = $boxConteudoLateral.find('.item-wrap-header').innerHeight();
    var topItemWrapHeader = $boxConteudoLateral.find('.item-wrap-header').position().top;

    $boxConteudoLateral.find('.btn-fechar-conteudo-lateral').css('right', 'calc(8px + '+scrollbarWidth+'px)');

    // Funcionadade que deixa o header do Sidedrawer fixo ao utilizar o scroll
    $boxConteudoLateral.on('scroll', function(e){

        if($(this).scrollTop() >= topItemWrapHeader){
            if(!$boxConteudoLateral.find('.item-wrap-header').hasClass('fixed')){
                
                $boxConteudoLateral.find('.item-wrap-header').addClass('fixed').css('max-width', 'calc(100% - '+scrollbarWidth+'px)');

                $boxConteudoLateral.find('.item-wrap-body').css('margin-top', headerBoxConteudo+'px');
            }
        }else{
            $boxConteudoLateral.find('.item-wrap-header').removeClass('fixed').css('max-width', '100%');
            $boxConteudoLateral.find('.item-wrap-body').css('margin-top', '0px');
        }
    });

    $('#boxConteudoLateral').focus();
}