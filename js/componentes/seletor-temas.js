function iniciarSeletorTemas() {
    $('.seletor-temas').show();
    var temaAtual = getSuspendData('tema');
    if(temaAtual){
        $('body').addClass('tema-' + getSuspendData('tema'))
        $('.seletor-temas').find('option').prop('selected', false)
        $('.seletor-temas').find(`option[value=${temaAtual}]`).prop('selected', true)
    }
    $('.seletor-temas').find('select').on('change', function(e) {
        $('body')
        .removeClass(function (index, className) {
            return (className.match (/(^|\s)tema-\S+/g) || []).join(' ');
        })
        if(e.target.value){
            $('body').addClass(`tema-${e.target.value}`);
        }
        setSuspendData('tema', `${e.target.value}`);

    })
}