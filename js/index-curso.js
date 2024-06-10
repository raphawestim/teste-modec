var SCORM = false;

var SCO = 'm00l00'; //SCO Inicial
var POSICAO = 0;
var MODULO;
var LICAO;

var $cabecalhoCurso = $('#cabecalho');
var $rodapeCurso = $('#rodape');
var $scrollDiv = $('#wrapperPagina');
var $indicadorScroll = $('#scrollIndicator');

var SCOParametro;
var moduloSCOParametro;
var licaoSCOParametro;

var primeiroAcesso = false;
var estrutura = {};
var objetoTelasVisitadas = {};

var timeoutTempoLeitura;

var timeoutScroll;
var posicaoScrollAnterior = 0;

var faixaFinalizacao;

//Carrega estrutura XML
function carregaEstrutura() {
    $.ajax({
        type: 'GET',
        url: 'xml/estrutura.xml',
        dataType: 'xml',
        success: function (xml) {            
            // var totalQuestoesAvaliacao = parseInt($(xml).find('configuracoes').find('totalQuestoesAvaliacao').text(), 10);
            // if(isNaN(totalQuestoesAvaliacao)) {
            //     totalQuestoesAvaliacao = 0;
            // }

            // estrutura.totalQuestoesAvaliacao = totalQuestoesAvaliacao;

            estrutura.nome = $(xml).find('curso').attr('nome');
            estrutura.id = $(xml).find('curso').attr('id');

            // estrutura.totalExerciciosQuiz = 0;

            estrutura.modulos = {};
            estrutura.totalModulos = 0;

            $(xml).find('modulo').each(function () {
                var idModulo = $(this).attr('id');

                if (moduloSCOParametro && idModulo != moduloSCOParametro) {
                    return true;
                }

                estrutura.modulos[idModulo] = {};
                estrutura.modulos[idModulo].nome = $(this).attr('nome');
                estrutura.modulos[idModulo].ignorar = $(this).attr('ignorar') == 'true' ? true : false;
                estrutura.modulos[idModulo].totalLicoes = 0;
                estrutura.modulos[idModulo].licoes = {};
                if (!estrutura.modulos[idModulo].ignorar) {
                    estrutura.totalModulos++;
                }

                $(this).find('licao').each(function () {
                    var idLicao = $(this).attr('id');

                    if (licaoSCOParametro && idLicao != licaoSCOParametro) {
                        return true;
                    }

                    if (!estrutura.modulos[idModulo].ignorar) {
                        estrutura.modulos[idModulo].totalLicoes++;
                    }

                    if (!$(this).attr('opcional')) {
                        objetoTelasVisitadas[idModulo + idLicao] = '';
                    } else {
                        objetoTelasVisitadas[idModulo + idLicao] = null;
                    }

                    estrutura.modulos[idModulo].licoes[idLicao] = {};
                    estrutura.modulos[idModulo].licoes[idLicao].nome = $(this).attr('nome');
                    estrutura.modulos[idModulo].licoes[idLicao].telas = [];
                    estrutura.modulos[idModulo].licoes[idLicao].tipo = $(this).attr('tipo');

                    $(this).find('tela').each(function () {
                        if (objetoTelasVisitadas[idModulo + idLicao] !== null) {
                            objetoTelasVisitadas[idModulo + idLicao] += 0;
                        }

                        var objetoTela = {};
                        objetoTela.nome = $(this).attr('nome');
                        objetoTela.tipo = $(this).attr('tipo');

                        estrutura.modulos[idModulo].licoes[idLicao].telas.push(objetoTela);
                    });
                });
            });

            carregaConfiguracoes();
        }
    });
}

function carregaConfiguracoes() {
    $.ajax({
        type: 'GET',
        url: 'xml/config.xml',
        dataType: 'xml',
        success: function (xml) {
            estrutura.modoDesenvolvimento = $(xml).find('configuracoes').find('modoDesenvolvimento').text() == 'true' ? true : false;
            estrutura.midiaStreaming = $(xml).find('configuracoes').find('midiaStreaming').text() == 'true' ? true : false;
            estrutura.caminhoStreaming = $(xml).find('configuracoes').find('caminhoStreaming').text();
            estrutura.caminhoMidiaLocal = $(xml).find('configuracoes').find('caminhoMidiaLocal').text();

            estrutura.plataforma = $(xml).find('configuracoes').find('plataforma').text();
            estrutura.mensagemFinalizacao = $(xml).find('configuracoes').find('mensagemFinalizacao').text();
            
            estruturaLoadedHandler();
        }

    });
}

function estruturaLoadedHandler() {
    var ultimaPosicao = getSuspendData('ultimaPosicao');
    primeiroAcesso = !ultimaPosicao;

    if (moduloSCOParametro) {
        if (licaoSCOParametro) {
            SCO = moduloSCOParametro + licaoSCOParametro;
        } else {
            SCO = moduloSCOParametro + 'l01';
        }
    }

    faixaFinalizacao = $('.faixa-finalizacao');

    if (primeiroAcesso) {
        if(!hasMenuCurso()){
            SCO = "m01l01";
            POSICAO = 1;
        }

    }else{
        var scoAnterior = ultimaPosicao.split('t')[0];

        var moduloAnterior = scoAnterior.split('l')[0];
        var licaoAnterior = scoAnterior.split(moduloAnterior)[1];
        var posicaoAnterior = parseInt(ultimaPosicao.split('t')[1], 10);

        if (estrutura.modulos.hasOwnProperty(moduloAnterior)) {
            if (estrutura.modulos[moduloAnterior].licoes.hasOwnProperty(licaoAnterior)) {
                SCO = scoAnterior;
                POSICAO = posicaoAnterior;

                recuperarTelasVisitadas();
            }
        }

        // Verificação caso de algum problema ao resgatar o valor de "ultimaPosicao" no SuspendData 
        if (scoAnterior == undefined || scoAnterior == "" || scoAnterior == null){
            if(hasMenuCurso()){
                SCO = "m00l00";
                POSICAO = 0;
            }else{
                SCO = "m01l01";
                POSICAO = 1
            }
        }

        if(getSuspendData('cursoFinalizado')){
            atualizarFaixaFinalizacaoManual(); 
        }else{
            if(getSuspendData('todasTelasFinalizadas')){
                exibirFaixaFinalizacaoManual();
            }
        };
    }

    if (window.location.hash) {
        if (window.location.hash.indexOf('t') != -1) {
            var tempSco = window.location.hash.split('t')[0].split('#').join('');

            if (tempSco.indexOf('m') != -1 && tempSco.indexOf('l') != -1) {
                SCO = tempSco;
                POSICAO = parseInt(window.location.hash.split('t')[1], 10);
            }
        }
    }

    // Verificar qual é a plataforma do curso para remover a faixa de finalização
    if(estrutura.plataforma != "Colab Play"){
        faixaFinalizacao.remove();
    }

    $(document).prop('title', estrutura.nome);

    iniciarComponentesIndex();

    ChangeSCO(SCO, POSICAO);
}

//Altera módulo e lição da tela
function ChangeSCO(p_sco, p_pos) {
    MODULO = (p_sco.split('l')[0]);
    LICAO = p_sco.split(MODULO)[1];

    if (isNaN(Number(p_pos))) {
        p_pos = 1;
    }

    if (!estrutura.modulos[MODULO]) {
        return;
    }

    if (!estrutura.modulos[MODULO].licoes[LICAO]) {
        return;
    }

    if (Number(p_pos) < 1 && p_sco != 'm00l00') {
        return;
    }

    var totalTelas = estrutura.modulos[MODULO].licoes[LICAO].telas.length;
    if (Number(p_pos) <= totalTelas) {
        SCO = p_sco;
        POSICAO = Number(p_pos);

        var arquivo = estrutura.id + '_' + MODULO.split('m').join('') + '_' + LICAO.split('l').join('') + '_' + Format(POSICAO) + '.html';

        var tipoLicao = verificaTipoLicaoAtual();
        switch (tipoLicao) {
            case 'infografico':
            case 'onepage':
                $cabecalhoCurso.fadeIn();
                $rodapeCurso.fadeOut();
                break;
            case 'menu':
                $cabecalhoCurso.fadeIn();
                // $rodapeCurso.fadeIn();
                break;
            case 'quiz':
                break;
            default:
                $cabecalhoCurso.fadeIn();
                $rodapeCurso.fadeOut();
                break;
        }

        $('#wrapperPagina').attr('data-tipo-licao', tipoLicao);
        $('#wrapperPagina').attr('data-tipo-tela', verificaTipoTelaAtual());

        carregaTela(arquivo);

    } else {
        return;
    }

    if (isModoDesenvolvimento()) {
        habilitarConsole(SCO, POSICAO);

        $('#btMenu').css('display', 'flex');
    }
}

//Carrega tela
function carregaTela(arquivo) {
    if (SCORM) {
        if (Number(get_param(SCO)) < POSICAO) {
            set_location(SCO, POSICAO);
        }
    }

    setSuspendData('ultimaPosicao', SCO + 't' + Format(POSICAO));

    arquivo = 'data/' + arquivo;

    $('.loader').fadeIn(200);

    $('#areaConteudo').empty();
    $('#areaConteudo').hide();
    $('#areaConteudo').load(arquivo, function () {
        iniciarCorrecoesLeitorTela();

        $scrollDiv.scrollTop(0);
        
        if (POSICAO === 0) {
            POSICAO = 1;
        }
        
        
        atualizarNomeElementosCurso();
        
        $('#areaConteudo').show();

        if (MODULO && LICAO) {
            var objetoTela = estrutura.modulos[MODULO].licoes[LICAO].telas[POSICAO - 1];

            if (objetoTela) {
                iniciarTela(objetoTela);
            }
            
            verificarNavegacao();
        }

        $('#areaConteudo').focus();
        $('.loader').fadeOut();

        atualizarStatusTela();
        atualizarBarraProgresso(true);
        removerLarguraBarraRolagem();
        controlarIndicacaoRolagem();
    });
}

//Avançar tela
function Avancar() {
    clearTimeout(timeoutTempoLeitura);

    $('#btAvancar').removeClass('destaque');

    var pos = POSICAO;
    if (Number(objetoTelasVisitadas[SCO].charAt(pos - 1)) != 1 && !isModoDesenvolvimento()) {
        return;
    }
    pos++;

    ChangeSCO(SCO, pos);
}

//Voltar tela
function Voltar() {
    clearTimeout(timeoutTempoLeitura);

    var pos = POSICAO;
    pos--;

    ChangeSCO(SCO, pos);
}

function verificarNavegacao() {
    var totalTelasLicao = estrutura.modulos[MODULO].licoes[LICAO].telas.length;

    if (POSICAO < totalTelasLicao && verificaTelaFinalizada(SCO, POSICAO)) {
        $('#btAvancar').removeClass('disabled').removeAttr('disabled');
    } else {
        $('#btAvancar').addClass('disabled').attr('disabled', 'disabled');
    }

    if (POSICAO <= 1) {
        $('#btVoltar').addClass('disabled').attr('disabled', 'disabled');
    } else {
        $('#btVoltar').removeClass('disabled').removeAttr('disabled');
    }

    $('[data-num-tela-atual]').text(Format(POSICAO));
    $('[data-num-total-telas]').text(Format(totalTelasLicao));

    var contadorTelas = $('#contadorTelas').clone();
    contadorTelas.find('#telaAtual').text(Format(POSICAO));
    contadorTelas.find('#totalTelas').text(Format(totalTelasLicao));
    $('#contadorTelas').html(contadorTelas.html());
}

function atualizarNomeElementosCurso() {
    $('[data-nome-curso]').html(estrutura.nome);
    $('[data-nome-modulo]').html(estrutura.modulos[MODULO].nome);
    $('[data-nome-licao]').html(estrutura.modulos[MODULO].licoes[LICAO].nome);

    if (POSICAO > 0) {
        $('[data-nome-tela]').html(estrutura.modulos[MODULO].licoes[LICAO].telas[POSICAO - 1].nome);
    } else {
        $('[data-nome-tela]').html(estrutura.modulos[MODULO].licoes[LICAO].telas[POSICAO].nome);
    }
}

function iniciarTela(dados) {
    var areaConteudo = $('#areaConteudo');
    var telaAtual = dados;

    var areaMensagemFim = areaConteudo.find('[data-instrucao-final-plataforma]');
    if (areaMensagemFim) {
        areaMensagemFim.append(estrutura.mensagemFinalizacao);
    }

    if (!verificaTelaFinalizada(SCO, POSICAO)) {
        if (telaAtual.tipo != 'menu') {
            verificarInteracoes();
        }

        if (isLicaoOnepage()) {
            if (!isModoDesenvolvimento()) {
                iniciarBloqueioOnepage();
            } else {
                removerMensagensInstrucao();
            }
        } else{
            $scrollDiv.data('interacoesFinalizadas', false);
        }
    }else{
        if (isLicaoOnepage()) {
            removerMensagensInstrucao();
        };
    };

    initComponentes();

    if (telaAtual.tipo == 'menu') {
        iniciarMenu();
        esconderIndicacaoRolagem();
    } else {
        controlarIndicacaoRolagem();
    }

    montarMenuSuspenso();

    // setAnimacaoEntrada();
}

//VERIFICA SE TELA FOI FINALIZADA
function finalizarTela() {
    var totalTelasLicao = estrutura.modulos[MODULO].licoes[LICAO].telas.length;

    if (POSICAO + 1 <= totalTelasLicao) {
        $('#btAvancar').addClass('destaque').removeClass('disabled').removeAttr('disabled');
    }

    visitaTela(SCO, POSICAO);
    atualizarStatusTela();
}

//SALVA E RECUPERAR TELAS VISITADAS
function visitaTela(sco, tela) {
    if (objetoTelasVisitadas[sco] && tela != 0) {
        objetoTelasVisitadas[sco] = objetoTelasVisitadas[sco].substr(0, tela - 1) + '1' + objetoTelasVisitadas[sco].substr(tela);

        salvarTelasVisitadas();
        finalizacaoCurso();
    }
}

function finalizacaoCurso() {
    var fim = true;

    for (var idModulo in estrutura.modulos) {
        if (estrutura.modulos.hasOwnProperty(idModulo)) {
            var modulo = estrutura.modulos[idModulo];

            if (!modulo.ignorar) {
                for (var idLicao in modulo.licoes) {
                    if (modulo.licoes.hasOwnProperty(idLicao)) {
                        var licao = modulo.licoes[idLicao];

                        if (!licao.opcional) {
                            if (!verificaSCOFinalizado(idModulo + idLicao)) {
                                fim = false;
                                break;
                            }
                        }
                    }
                }
            }
        }
    }

    if (fim) {
        if(estrutura.plataforma == "Colab Play"){
            setSuspendData('todasTelasFinalizadas', true);
            exibirFaixaFinalizacaoManual();
        }else{
            finalizarCurso();
        }
    }
}

function finalizarCurso(){
    if (SCORM) {
        finalizaIntro();
    }

    if (typeof finishContent == 'function') {
        finishContent();
    }
}

function salvarTelasVisitadas() {
    var arrTelasVisitadas = [];

    for (var sco in objetoTelasVisitadas) {
        if (objetoTelasVisitadas.hasOwnProperty(sco)) {
            var telasVisitadas = objetoTelasVisitadas[sco];
            arrTelasVisitadas.push(sco + ':' + telasVisitadas);
        }
    }

    var strTelasVisitadas = arrTelasVisitadas.join(',');

    setSuspendData('telasVisitadas', strTelasVisitadas);
}

function recuperarTelasVisitadas() {
    var strTelasVisitadas = getSuspendData('telasVisitadas');

    if (strTelasVisitadas) {
        var arrTelasVisitadas = strTelasVisitadas.split(',');

        for (var i = 0; i < arrTelasVisitadas.length; i++) {
            var infoTelasSco = arrTelasVisitadas[i];

            var scoTelas = infoTelasSco.split(':')[0];
            var telasVisitadas = infoTelasSco.split(':')[1];

            if (objetoTelasVisitadas.hasOwnProperty(scoTelas)) {
                if (objetoTelasVisitadas[scoTelas].length === telasVisitadas.length) {
                    objetoTelasVisitadas[scoTelas] = telasVisitadas;
                }
            }
        }
    }
}

function atualizarStatusTela() {
    if (verificaTelaFinalizada(SCO, POSICAO)) {
        if (isUltimaTelaLicao()) {
            $('#statusTela').text('Tela finalizada.');
        } else {
            $('#statusTela').text('Tela finalizada. Clique no botão Avançar para acessar a próxima tela.');
        }
    } else {
        $('#statusTela').text('');
    }
}

//ATUALIZA BARRA DE PROGRESSO
function atualizarBarraProgresso(zerarBarra) {
    var $barraProgresso = $('.barra-progresso .barra');

    // if (SCO != 'm00l00' && objetoTelasVisitadas[SCO]) {
    //     var total = objetoTelasVisitadas[SCO].length;
    //     var qtdTelasVisitadas = POSICAO;
    //     var percentual = 100 * qtdTelasVisitadas / total;

    //     $barraProgresso.stop().animate({
    //         width: percentual + '%'
    //     }, 400);
    // }

    if(zerarBarra) {
        $barraProgresso.css('width', 0);
    }

    if ($('#wrapperPagina').attr('data-tipo-tela') != 'menu') {
        var alturaJanela = $(window).height();
        var alturaVisualizada = $scrollDiv.scrollTop();
        var alturaDocumento = $('#conteudoPrincipal').height();

        var percentualVisto = Math.round(100 * (alturaJanela + alturaVisualizada) / alturaDocumento);
        var strLarguraBarra = $barraProgresso.prop('style')['width']
        var larguraBarra = strLarguraBarra ? parseInt(strLarguraBarra, 10) : 0;

        if(larguraBarra < percentualVisto) {
            $barraProgresso.css('width', percentualVisto + '%');
        }

    } else {
        $barraProgresso.css('width', '100%');
    }
}

function iniciarComponentesIndex() {
    $('#btAvancar').on('click', function () {
        Avancar();
    });

    $('#btVoltar').on('click', function () {
        Voltar();
    });

    $('#btRever').on('click', function () {
        ChangeSCO(SCO, POSICAO);
    });

    if (hasMenuCurso()) {
        $('#btMenu').on('click', function () {
            ChangeSCO('m00l00', '00');
        });
    } else {
        $('#btMenu').hide();
    }

    if(isModoDesenvolvimento()) {
        iniciarSeletorTemas();
    }

    $('#btSair').on('click', function () {
        top.close();
    });

    $('#wrapperPagina').on('click', '.bt-abrir-menu', function () {
        ChangeSCO('m00l00', '00');
    });

    $('#wrapperPagina').on('click', '.bt-avancar-tela', function () {
        Avancar();
    });

    montarMenuAcessibilidade();

    $scrollDiv.on('scroll', function () {
        if (timeoutScroll) {
            clearTimeout(timeoutScroll);
            timeoutScroll = null;
        }
        timeoutScroll = setTimeout(executarAcoesRolagem, 250);

        // identificarDirecaoScroll();
        atualizarBarraProgresso();
    });

    $('body').on('interacoesTelaFinalizadas', function () {
        if (isLicaoOnepage()) {
            //força a ver todo o conteúdo da onepage que foi desbloqueado e não tem interação
            $scrollDiv.data('chegouFimTela', alcancouFimPagina());
        }

        $scrollDiv.data('interacoesFinalizadas', true);

        verificarFinalizacaoTela();
    });

    iniciarMenusSuspensos();

    $(window).on('resize', function() {
        removerLarguraBarraRolagem();
    });
}

function executarAcoesRolagem() {
    esconderIndicacaoRolagem();
    clearTimeout($.data(this, 'scrollCheck'));
    $.data(this, 'scrollCheck', setTimeout(function () {
        controlarIndicacaoRolagem();
    }, 4000));

    
    if (!$scrollDiv.data('chegouFimTela')) {
        $scrollDiv.data('chegouFimTela', alcancouFimPagina());
        verificarFinalizacaoTela();
    }
}

function verificarFinalizacaoTela() {
    if (!verificaTelaFinalizada(SCO, POSICAO)) {
        // Quando o curso não for bloqueado nas interações será finalizado ao chegar no final da página.
        // A linha abaixo foi comentada para mostrar como era antes.

        if ($scrollDiv.data('interacoesFinalizadas') && $scrollDiv.data('chegouFimTela')) {
        // if ($scrollDiv.data('chegouFimTela')) {
            finalizarTela();
        }
    }
}

function verificaModuloFinalizado(modulo) {
    for (var i in estrutura.modulos[modulo].licoes) {
        if (objetoTelasVisitadas[modulo + i].indexOf(0) != -1) {
            return false;
        }
    }
    return true;
}

function verificaSCOFinalizado(p_sco) {
    if (objetoTelasVisitadas[p_sco].indexOf(0) != -1) {
        return false;
    }
    return true;
}

function verificaTelaFinalizada(p_sco, p_posicao) {
    if (objetoTelasVisitadas[p_sco].charAt(p_posicao - 1) == '0') {
        return false;
    }
    return true;
}

function verificaTipoLicaoAtual() {
    var tipoLicao = estrutura.modulos[MODULO].licoes[LICAO].tipo;

    return tipoLicao;
}

function verificaTipoTelaAtual() {
    var licao = estrutura.modulos[MODULO].licoes[LICAO];

    if (POSICAO > 0) {
        return licao.telas[POSICAO - 1].tipo;
    } else {
        return licao.telas[POSICAO].tipo;
    }
}

function isLicaoOnepage() {
    var tipoLicao = verificaTipoLicaoAtual();
    var ehOnepage = false;

    switch (tipoLicao) {
        case 'onepage':
        case 'infografico':
            ehOnepage = true;
            break;
        default:
            ehOnepage = false;
            break;
    }

    return ehOnepage;
}

function isModoDesenvolvimento() {
    return estrutura.modoDesenvolvimento;
}

function isUltimaTelaLicao() {
    return (POSICAO == estrutura.modulos[MODULO].licoes[LICAO].telas.length);
}

function hasMenuCurso() {
    var hasMenu = false;
    var modulos = estrutura.modulos;

    for (var idModulo in modulos) {
        if (modulos.hasOwnProperty(idModulo)) {
            var modulo = modulos[idModulo];
            var licoes = modulo.licoes;

            for (var idLicao in licoes) {
                if (licoes.hasOwnProperty(idLicao)) {
                    var licao = licoes[idLicao];
                    if (licao.tipo == 'menu') {
                        hasMenu = true;
                        break;
                    }
                }
            }
        }
    }

    return hasMenu;
}

function voltarTelaInicialLicao() {
    ChangeSCO(SCO, '01');
}

function identificarDirecaoScroll() {
    var posicaoScroll = $scrollDiv.scrollTop();

    if (posicaoScroll == 0) {
        $scrollDiv.removeClass('scroll-up scroll-down fim-pagina');
        return;
    }

    if (posicaoScroll > posicaoScrollAnterior && !$scrollDiv.hasClass('scroll-down')) {
        $scrollDiv.removeClass('scroll-up');
        $scrollDiv.addClass('scroll-down');
    } else if (posicaoScroll < posicaoScrollAnterior && $scrollDiv.hasClass('scroll-down')) {
        $scrollDiv.removeClass('scroll-down');
        $scrollDiv.addClass('scroll-up');
    }

    if (!alcancouFimPagina() && $scrollDiv.hasClass('fim-pagina')) {
        $scrollDiv.removeClass('fim-pagina');
    } else if (alcancouFimPagina() && !$scrollDiv.hasClass('fim-pagina')) {
        $scrollDiv.addClass('fim-pagina');
    }

    posicaoScrollAnterior = posicaoScroll;
}

function alcancouFimPagina() {
    var windowHeight = $(window).height();
    var totalScrolled = $scrollDiv.scrollTop();
    var $ultimoBloco = $('.bloco').last();
    var offsetUltimoBlobo = $ultimoBloco.length > 0 ? $ultimoBloco[0].offsetTop : 0;
    

    if($ultimoBloco.is(':visible')){
        if ((windowHeight + totalScrolled) >= offsetUltimoBlobo) {
            return true;
        }
    }

    return false;
}

function controlarIndicacaoRolagem() {
    // if (alcancouFimPagina() || verificaTelaFinalizada(SCO, POSICAO)) {
    if (alcancouFimPagina()) {
        esconderIndicacaoRolagem();
    } else {
        exibirIndicacaoRolagem();
    }
}

function esconderIndicacaoRolagem() {
    $indicadorScroll.addClass('hidden');
}

function exibirIndicacaoRolagem() {
    $indicadorScroll.removeClass('hidden');
}

function habilitarConsole(SCO, POSICAO) {
    if ($('#console').length == 0) {
        $('body').append('<div id="console" class="console"></div>');
    }
    $('#console').text(SCO + 't' + Format(POSICAO));
}

function forcarFinalizacaoModulo(modulo) {
    for (var sco in objetoTelasVisitadas) {
        if (objetoTelasVisitadas.hasOwnProperty(sco)) {

            if(sco.indexOf(modulo) >= 0) {

                var statusTelas = objetoTelasVisitadas[sco];
                var novoStatus = '';
                
                for(var i = 0; i < statusTelas.length; i++) {
                    if(statusTelas.charAt(i) === '0') {
                        novoStatus += '2';
                    } else {
                        novoStatus += statusTelas.charAt(i);
                    }
                }

                objetoTelasVisitadas[sco] = novoStatus;
            }

        }
    }
}

function removerLarguraBarraRolagem() {
    var larguraJanela = $(window).width();
    var larguraConteudo = $cabecalhoCurso.width() + $('#conteudoPrincipal').width();
    var larguraBarra = larguraJanela - larguraConteudo;

    if(larguraBarra >= 0) {
        $cabecalhoCurso.find('.logo').css('right', larguraBarra);
        $indicadorScroll.css('right', larguraBarra);
        $rodapeCurso.find('.limite-progresso').css('width', 'calc(100% - ' + larguraBarra + 'px)');
    }
}

function abrirModalVideoMenu(scoClique){

    var jwplayerSetup = getJwplayerSetupObj(scoClique + '.mp4', 'poster.jpg', '', '', estrutura.midiaStreaming, estrutura.caminhoStreaming, false);

    $.featherlight('<div class="area-video"><div id="video_container"></div></div>', {
        variant: 'limite-video',
        closeOnClick: false,
        afterContent: function(){
            jwplayer("video_container").setup(jwplayerSetup);
            jwplayer("video_container").on('complete', function(){
                $.featherlight.close();
                if(!verificaTelaFinalizada(scoClique, 1)){
                    setTimeout(function(){
                        visitaTela(scoClique, 1);
                        atualizarMenu();
                    }, 500);
                }
            });
        },
    });
}

function atualizaDadosScrollDiv(){
    if (!verificaTelaFinalizada(SCO, POSICAO)) {
        if (verificaTipoTelaAtual() != 'menu') {
            
            if(isLicaoOnepage()){
                if(!$scrollDiv.data('interacoesFinalizadas')){
                    $scrollDiv.data('interacoesFinalizadas', false);
                }
            }
            
            // Essa condição é necessária caso o HTML e todas as imagens da tela tenham sido carregadas e a tela não possuir scroll, assim a tela deverá ser finalizada.
            if(alcancouFimPagina()){
                finalizarTela();
            }else{
                $scrollDiv.data('chegouFimTela', false);
            }
        }
    }
}

function proximoConteudo() {
    let novaPosicao = POSICAO + 1;
    if(estrutura.modulos[MODULO].licoes[LICAO].telas[novaPosicao - 1]){
        ChangeSCO(SCO, novaPosicao);
        return;
    }
    
    let novaLicao = "l" + Format(Number(LICAO.replace('l', '')) + 1);
    if(estrutura.modulos[MODULO].licoes[novaLicao]){ 
        novoSCO = MODULO + novaLicao; 
        ChangeSCO(novoSCO, 1);
        return;
    }
    
    let novoModulo = 'm' + Format(Number(MODULO.replace('m', '')) + 1);
    if(estrutura.modulos[novoModulo]){ 
        novoSCO = novoModulo + 'l01'; 
        ChangeSCO(novoSCO, 1);
        return;
    }
}

//JQUERY PAGE LOAD
$(document).ready(function () {
    SCORM = loadPage();

    if (SCORM) {
        $(window).on('unload', function () {
            unloadPage();
        });
    };

    SCOParametro = getParameterByName('SCO');
    if (SCOParametro) {
        SCOParametro = SCOParametro.toLowerCase();
        moduloSCOParametro = SCOParametro.toLowerCase().split('l')[0];
        licaoSCOParametro = SCOParametro.toLowerCase().split(moduloSCOParametro)[1];
    };
    
    carregaEstrutura();
});