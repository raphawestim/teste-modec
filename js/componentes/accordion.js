function iniciarAccordion(){
    var $conjuntoAccordion = $('[data-accordion]');

    if($conjuntoAccordion.length) {
        $conjuntoAccordion.on('down.zf.accordion', function (e, data) {
            data.prevObject.addClass('seen');
        });

        $conjuntoAccordion.each(function(index, accordion) {
            var $accordion = $(accordion);
            var idAccordion = 'accordion' + index;

            $accordion.attr('id', idAccordion);
        });
    }
}
