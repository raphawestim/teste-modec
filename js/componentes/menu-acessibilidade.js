function montarMenuAcessibilidade(){

    let tamanhoFonte = 0;
    let porcentagemFonte = 100;
    let textoPorcentagemFonte = $('#porcentagemTamanhoFonte')

    textoPorcentagemFonte.text(porcentagemFonte + '%');

    $('#closeMenuAcessibilidade').on('click', function(){
        fecharMenuAcessibilidade();
    });

    $('#toggleContrast').change(function(){
        if($(this).prop('checked')){
            $('#wrapperPagina').addClass('alto-contraste');
        } else {
            $('#wrapperPagina').removeClass('alto-contraste');
        }
    })

    $('#toggleDyslexia').change(function(){
        if($(this).prop('checked')){
            $('#wrapperPagina').addClass('font-family-dyslexia');
        } else {
            $('#wrapperPagina').removeClass('font-family-dyslexia');
        }
    })

    $('#btAumentaFonte').on('click', function(){

        $('#btDiminuiFonte').prop('disabled', false);

        if(tamanhoFonte < 3) {
            tamanhoFonte++;
            porcentagemFonte += 25;
            textoPorcentagemFonte.text(porcentagemFonte + '%');
        }

        if(tamanhoFonte === 2){
            $(this).prop('disabled', true);
        }

        $('body').attr('data-tamanho-fonte', tamanhoFonte);

        atualizarAlturaComponentes();
    })

    $('#btDiminuiFonte').on('click', function(){

        $('#btAumentaFonte').prop('disabled', false);

        if(tamanhoFonte > 0) {
            tamanhoFonte--;
            porcentagemFonte -= 25;
            textoPorcentagemFonte.text(porcentagemFonte + '%');
        }

        if (tamanhoFonte === 0){
            $('body').removeAttr('data-tamanho-fonte');
            $(this).prop('disabled', true);
        } else {
            $('body').attr('data-tamanho-fonte', tamanhoFonte);
        }


        atualizarAlturaComponentes();
    })
}