function exibirFaixaFinalizacaoManual(){
    $('.faixa-finalizacao').show();
    $('.faixa-finalizacao').find('.mensagem-finalizacao').show();

    $('#finalizarCurso').on('click', function(){
        setSuspendData('cursoFinalizado', true);
        finalizarCurso();
        atualizarFaixaFinalizacaoManual();
    });
}

function atualizarFaixaFinalizacaoManual(){
    $('.faixa-finalizacao').show();
    $('.faixa-finalizacao').find('.mensagem-finalizacao').hide();
    $('.faixa-finalizacao').addClass('mensagem-atualizada');
}