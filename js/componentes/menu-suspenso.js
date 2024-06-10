function iniciarMenusSuspensos() {
    $('#btMenuSuspenso').on('click', function () {
        var menuAberto = $(this).attr('aria-expanded') == 'true' ? true : false;

        if (!menuAberto) {
            abrirMenuSuspenso();
        } else {
            fecharMenuSuspenso();
        }
    });
    
    $('#btMenuAcessibilidade').on('click', function () {
        var menuAberto = $(this).attr('aria-expanded') == 'true' ? true : false;

        if (!menuAberto) {
            abrirMenuAcessibilidade();
        } else {
            fecharMenuAcessibilidade();
        }
    });
}

function montarMenuSuspenso() {
    var $listaMenuSuspenso = $('.menu-suspenso__items');
    var $secoes = $('#areaConteudo').find('[data-secao]');

    fecharMenuSuspenso();
    $listaMenuSuspenso.empty();

    if($secoes.length) {
        var listaLinks = $('<ol />');

        $secoes.each(function(index, secao) {
            var nomeSecao = $(secao).attr('data-secao');
            var idSecao = 'secao' + index;
            var ariaLabelSecao = nomeSecao.replace(/(<([^>]+)>)/ig, "").trim();

            $(secao).attr('id', idSecao);
            $(secao).attr('aria-label', ariaLabelSecao);

            listaLinks.append($('<li />', {
                html: '<a href="#' + idSecao + '" class="item-ancora"><span class="numero">' + Format(index + 1) + '.</span> ' + nomeSecao + '</a>'
            }));
        });

        // Inserir o botão para fechar o menu de ancoragem. Esse menu não precisará aparecer no leitor portanto não terá os atributos necessários.

        $listaMenuSuspenso.append(listaLinks);
    }

    adicionarListenerBotoesMenuSuspenso();
}

function adicionarListenerBotoesMenuSuspenso() {
    var $listaMenuSuspenso = $('#listaMenuSuspenso');

    $('#closeMenuAnchor').on('click', function(){
        fecharMenuSuspenso();
    });

    $listaMenuSuspenso.find('.item-ancora').on('click', function (e) {
        e.preventDefault();

        var $target = $(this.hash);

        $scrollDiv.animate({
            scrollTop: $target.position().top
        }, 800, function () {
            $target.focus();

            if ($target.is(":focus")) {
                return false;
            } else {
                $target.attr('tabindex', '-1');
                $target.focus();
            }
        });

        fecharMenuSuspenso();
    });
}

function abrirMenuSuspenso() {
    var $listaMenuSuspenso = $('#listaMenuSuspenso');
    var $botaoMenuSuspenso = $('#btMenuSuspenso');

    $('body').addClass('menu-anchor-open');
    $botaoMenuSuspenso.attr('aria-expanded', true);
    $listaMenuSuspenso.attr('aria-hidden', false);
}

function fecharMenuSuspenso() {
    var $listaMenuSuspenso = $('#listaMenuSuspenso');
    var $botaoMenuSuspenso = $('#btMenuSuspenso');
    
    $('body').removeClass('menu-anchor-open');
    $botaoMenuSuspenso.attr('aria-expanded', false);
    $listaMenuSuspenso.attr('aria-hidden', true);
}

function abrirMenuAcessibilidade() {
    var $listaMenuSuspenso = $('#listaMenuAcessibilidade');
    var $botaoMenuSuspenso = $('#btMenuAcessibilidade');

    $('body').addClass('menu-acessibilidade-open');
    $botaoMenuSuspenso.attr('aria-expanded', true);
    $listaMenuSuspenso.attr('aria-hidden', false);
}

function fecharMenuAcessibilidade() {
    var $listaMenuSuspenso = $('#listaMenuAcessibilidade');
    var $botaoMenuSuspenso = $('#btMenuAcessibilidade');

    $('body').removeClass('menu-acessibilidade-open');
    $botaoMenuSuspenso.attr('aria-expanded', false);
    $listaMenuSuspenso.attr('aria-hidden', true);
}