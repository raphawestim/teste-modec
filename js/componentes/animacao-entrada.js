function setAnimacaoEntrada() {
    
    $("[data-anima]").each(function () {
        $(this).addClass("wow");
        $(this).addClass(getAleatoryAnimateClassName());
    });
    
    var wow = new WOW({
        offset: 50,
        scrollContainer: '#' + $scrollDiv.attr('id')
    });
    wow.init();
}

function getAleatoryAnimateClassName() {
    var arrAnimationsType = ["fadeIn", "fadeInLeft", "fadeInRight", "fadeInUp"];
    
    if (is.mobile()) {
        arrAnimationsType = ["fadeIn"];
    }
    
    var totalAnimationsType = arrAnimationsType.length;
    var aleatoryNumber = parseInt(Math.random() * totalAnimationsType, 10);
    var aleatoryClassName = arrAnimationsType[aleatoryNumber];
    
    return aleatoryClassName;
}
