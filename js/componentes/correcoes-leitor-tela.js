function iniciarCorrecoesLeitorTela(){

    (function esconderElementosLeitorTela(){

        console.log('esconderElementosLeitorTela')
        const elements = ['<br>', '<hr>'];

        $.each(elements, function(i, el){
            $(el).attr('aria-hidden', true);
        });
    })();

};