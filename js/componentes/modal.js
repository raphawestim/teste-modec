function iniciarModal() {
    var $botoesModal = $('[data-modal]');

    if($botoesModal.length) {
        $botoesModal.off('click').on('click', function (e) {
            var configModal = {
                modalId: $(this).attr('data-modal')
            };
    
            abreModal(configModal);
        });
    }
}

function abreModal(p_configuracao) {
    var configPadrao = {
        url: "data/modais/modais.html",
        modalId: "#padrao",
        cssClass: '',
        callback: {
            aoAbrir: null,
            aoFechar: null
        }
    };
    
    var configuracaoModal = $.extend({}, configPadrao, p_configuracao);
    
    var modalContent = (configuracaoModal.url + " " + configuracaoModal.modalId).trim();
    
    if(configuracaoModal.conteudo) {
        modalContent = configuracaoModal.conteudo;
    }

    var botaoFechar = '<button class="featherlight-close btn" aria-label="Fechar modal">Continuar o curso</button>';

    $.featherlight(modalContent, {
        variant: configuracaoModal.cssClass,
        root: '#wrapperPagina',
        afterContent: function () {
            $(this.$content).find('[data-titulo]').attr('id', 'tituloModal');
            $(this.$content).find('[data-conteudo]').attr('id', 'conteudoModal');
            $(this.$content).find('.wrap-conteudo').append(botaoFechar);
            
            $(this.$instance).attr('role', 'alertdialog');
            $(this.$instance).attr('aria-describedby', 'conteudoModal');
            $(this.$instance).attr('aria-labelledby', 'tituloModal');
            $(this.$instance).attr('tabindex', '0');
        },
        afterOpen: function () {
            this.$instance.focus();

            if (typeof configuracaoModal.callback.aoAbrir !== undefined && typeof configuracaoModal.callback.aoAbrir === "function") {
                configuracaoModal.callback.aoAbrir();
            }
        },
        afterClose: function () {
            if (typeof configuracaoModal.callback.aoFechar !== undefined && typeof configuracaoModal.callback.aoFechar === "function") {
                configuracaoModal.callback.aoFechar();
            }
        }
    });
}
