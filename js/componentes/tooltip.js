function iniciarTooltip() {
    var $tooltips = $('[data-tooltipster]');

    if ($tooltips.length) {
        $tooltips.attr('tabindex', 0);

        $tooltips.tooltipster({
            maxWidth: 400,
            contentCloning: true,
            theme: 'tooltipster-custom',
            functionInit: function (instance, helper) {
                var idConteudoTooltip = helper.origin.getAttribute('aria-describedby');
                var conteudo = document.querySelector('#' + idConteudoTooltip).innerHTML;
                instance.content(conteudo);

                document.querySelector('#' + idConteudoTooltip).setAttribute('aria-hidden', true);
            },
            functionReady: function (instance, helper) {
                var idConteudoTooltip = helper.origin.getAttribute('aria-describedby');
                document.querySelector('#' + idConteudoTooltip).setAttribute('aria-hidden', false);
            },
            functionAfter: function (instance, helper) {
                var idConteudoTooltip = helper.origin.getAttribute('aria-describedby');
                document.querySelector('#' + idConteudoTooltip).setAttribute('aria-hidden', true);
            }
        });

        $tooltips
            .focus(function () {
                $(this).tooltipster('open');
            })
            .blur(function () {
                $(this).tooltipster('close');
            });
    }
}
