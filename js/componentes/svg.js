function iniciarSVG(){
    $('[data-svg]').each(function(){
        var pathSvg = $(this).data('svg');
        $(this).attr('aria-hidden', true);
        $(this).load(pathSvg);
    });

    setTimeout(function(){
        updateEqualHeight();
    },500)
}