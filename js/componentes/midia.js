var compMidiaInicializado = false;
var playerIds = [];



var chapters = [];
var captions = [];
var captionsLenght = 0;
var caption = -1;
var matches = [];
var query = "";
var cycle = -1;


// var search = document.getElementById('search');
// var match = document.getElementById('match');



function iniciarMidia(isStreaming, caminhoStreaming) {
    var $compMidia = $('#areaConteudo').find('[data-midia]');
    var totalCompMidia = $compMidia.length;
    var quantCompMidiaIniciados = 0;

    playerIds = [];
    compMidiaInicializado = false;

    jwplayer.key = "HdCX+EBRmpwX5L+wcY05X4GBuFM/umawuYbCBrgr06mG2MwI";

    if (totalCompMidia) {
        $compMidia.each(function (index) {
            var playerSrc = $(this).data('src');
            var playerPoster = $(this).data('poster');
            var playerTitle = $(this).data('title');
            var playerDescription = $(this).data('description');
            var playerCaptions = $(this).data('captions');
            var playerId = 'playerMidia-' + index;
            
            const $wrapVideoModal = $(this).parents('[data-video-modal]');
            const $btVideoModal = $wrapVideoModal.find('[data-play-video]');

            let transcriptInteractive = $(this).data('transcript-interactive')
            
            $(this).attr('id', playerId);
            playerIds.push(playerId);
        
            var jwplayerSetup = getJwplayerSetupObj(playerSrc, playerPoster, playerTitle, playerDescription, isStreaming, caminhoStreaming, playerCaptions);

            if($wrapVideoModal.length){
                totalCompMidia = totalCompMidia - 1;

                $btVideoModal.on('click', function(){
                    $.featherlight('<div class="area-video midia-wrapper midia-video"><div id="video_container"></div></div>', {
                        variant: 'limite-video',
                        closeOnClick: false,
                        afterContent: function(){
                            $('#'+playerId).appendTo($('#video_container'));
                        },
                        beforeClose: function(){
                            $('#'+playerId).appendTo($wrapVideoModal);
                            stopAllPlayers();
                        }
                    });
                });
            }
            jwplayer(playerId).setup(jwplayerSetup);
            
            jwplayer(playerId).on('ready', function (p1, p2) {
                quantCompMidiaIniciados++;

                verificaQuantMidiaIniciadas(totalCompMidia, quantCompMidiaIniciados);

                $('#' + this.id).attr('tabindex', '-1');
                $('#' + this.id).find('[tabindex]').attr('tabindex', '-1');
                $('#' + this.id).find('.jw-text').attr('aria-hidden', true);

                if(transcriptInteractive){
                    loadCaptions(estrutura.caminhoMidiaLocal + playerCaptions);
                }
                
            });

            jwplayer(playerId).on('play', function (e) {
                $('#' + this.id).attr('tabindex', '-1');
                $('#' + this.id).find('[tabindex]').attr('tabindex', '-1');
            });

            jwplayer(playerId).on('error', function (e) {
                console.log('Erro jwplayer:', e.message);
            });
            
            jwplayer(playerId).on('time', function (e) {
                captionsPodcast(e);
            });

            /* Setup para formatar a legenda */
            // jwplayer().setCaptions({
            //     backgroundColor: "#333",
            //     backgroundOpacity: 70,
            //     color: "#fff",
            //     edgeStyle: "raised",
            //     fontSize: 14,
            // });
        });

        agrupaCompMidia(playerIds);
        verificaQuantMidiaIniciadas(totalCompMidia, quantCompMidiaIniciados);

        ativarBotoesTranscricao();
    }

    controleMidia();
}

function captionsPodcast(temp) { 
    var p = temp.position; 
                    
    for(var j=0; j<captions.length; j++) {
        if(captions[j].begin < p && captions[j].end > p) {
            
            if(j != caption) {
                let c = document.getElementById('caption'+j);
                let cText = captions[j].text;
                let cTime = captions[j].timeAnimation;
                
                if(c.textContent == ''){                    
                    new TypeIt(c, {
                        strings: cText,
                        speed: 30,
                        afterComplete: function(TypeIt){
                            c.className="visto";
                        } 
                    }).go();
                }
                    
                // c.className = "";
                
                if(query == "") {
                    transcript.scrollTop = c.offsetTop - transcript.offsetTop - 40;
                }
                caption = j;
            }
            break;
        }
    }
}

function agrupaCompMidia(p_arrPlayerIds) {
    playerIds = p_arrPlayerIds;
    $.each(playerIds, function (index, id) {
        jwplayer(id).on('play', function () {
            $.each(playerIds, function (x, pid) {
                if (id === pid) {
                    return true;
                }

                jwplayer(pid).stop();
            });
        });
    });
}

function stopAllPlayers() {
    $.each(playerIds, function (index, id) {
        jwplayer(id).stop();
    });
}

function verificaQuantMidiaIniciadas(total, iniciados) {
    if (total == iniciados) {
        compMidiaInicializado = true;
    }
}

function controleMidia() {
    var playerIds = [];
    var compMidiaVisitados = [];
    var verificaInicializacao;

    if ($('#areaConteudo').find('[data-midia]').length || $('#areaConteudo').find('.jwplayer').length) {

        verificaInicializacao = setInterval(function () {
            if (compMidiaInicializado) {
                verMidiaFinalizado();
            }
        }, 500);
    } else {
        $('body').trigger('interacoesConcluidas', {
            interacaoExistente: false
        });
    }

    function verMidiaFinalizado() {
        clearInterval(verificaInicializacao);

        if ($('#areaConteudo').find('.jwplayer').length) {
            $('#areaConteudo').find('.jwplayer').each(function (index) {
                var playerId = $(this).attr('id');
                var $playerIndex = Number($(this).attr('id').split('playerMidia-')[1]);

                compMidiaVisitados[index] = 0;

                playerIds.push(playerId);

                jwplayer(playerId).on('complete', function () {
                    compMidiaVisitados[$playerIndex] = 1;

                    // if (String(compMidiaVisitados).indexOf(0) == -1) {
                        var indexBlocoAtual = $('#' + playerId).parents('[data-bloco]').index('[data-bloco]');

                        $('body').trigger('interacoesConcluidas', {
                            interacaoExistente: true,
                            indexBloco: indexBlocoAtual
                        });
                    // }

                    if($('wrapperPagina').attr('data-tipo-licao') == 'podcast') {
                        finalizarTela();
                    }
                });
            });
        }
    }
}

function getJwplayerSetupObj(playerSrc, playerPoster, playerTitle, playerDescription, isStreaming, caminhoStreaming, playerCaptions) {
    var jwplayerSetupObj = {
        width: '100%',
        skin: {
            name: 'custom'
        }
    };

    if(playerSrc.indexOf('.mp3') > 0) {
        jwplayerSetupObj['height'] = 200;
        jwplayerSetupObj['title'] = playerTitle;
        jwplayerSetupObj['description'] = playerDescription;
    } else {
        jwplayerSetupObj['aspectratio'] = '16:9';
        jwplayerSetupObj['image'] = estrutura.caminhoMidiaLocal + playerPoster;
    }

    if (playerSrc.indexOf('.mp4') > 0 && isStreaming) {
        jwplayerSetupObj['file'] = caminhoStreaming + playerSrc + '/playlist.m3u8';

        if(playerCaptions){
            jwplayerSetupObj['tracks'] = [
                {
                  kind: "captions",
                  file: caminhoStreaming + playerCaptions,
                  label: "PT-BR",
                },
            ]
        }
    } else {
        jwplayerSetupObj['file'] = estrutura.caminhoMidiaLocal + playerSrc;
        if(playerCaptions){
            jwplayerSetupObj['tracks'] = [
                {
                  kind: "captions",
                  file: estrutura.caminhoMidiaLocal + playerCaptions,
                  label: "PT-BR",
                },
            ]
        }
    }

    jwplayerSetupObj['height'] = 40;

    return jwplayerSetupObj;
}

function ativarBotoesTranscricao() {
    $('[data-transcricao]').each(function(index, transcricao) {
        $transcricao = $(transcricao);
        $botaoTranscricao = $transcricao.parent().find('[data-botao-transcricao]');

        idTranscricao = 'transcricao' + index;

        $transcricao.children().eq(0).attr('id', idTranscricao);
        $botaoTranscricao.attr('data-transcricao-id', '#' + idTranscricao);
    });

    $('[data-botao-transcricao]').on('click', function(e){
        var modalTranscricao = {
            url: '',
            modalId: $(this).attr('data-transcricao-id')
        };

        abreModal(modalTranscricao);

        var indexBlocoAtual = $(this).parents('[data-bloco]').index('[data-bloco]');

        $('body').trigger('interacoesConcluidas', {
            interacaoExistente: true,
            indexBloco: indexBlocoAtual
        });
    });
}

// Load chapters / captions

function loadCaptions(srcCaption){
    captions = [];
    caption = -1;

    let r = new XMLHttpRequest();
    r.onreadystatechange = function() {
        if (r.readyState == 4 && r.status == 200) {
            var t = r.responseText.split("\n\n");
            t.shift();
            var h = "<p>";
            var s = 0;
            var tLenght = t.length;
            for(var i=0; i< tLenght; i++) {
                var c = parse(t[i]);
                // h += "<span id='caption"+i+"'>"+c.text+"</span>";
                h += "<span id='caption"+i+"'></span>";
                captions.push(c);
            }

            const transcript = document.getElementById('transcript');
            transcript.innerHTML = h + "</p>";
            }
            
    };
    r.open('GET',srcCaption,true);
    r.send();
};

function parse(d) {
    
    var a = d.split("\n");
    var i = a[0].indexOf(' --> ');
    var t = a[1];
    if (a[2]) {  t += " " + a[2]; }
    t = t.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    return {
      begin: seconds(a[0].substr(0,i)),
      btext: a[0].substr(3,i-7),
      timeAnimation: Math.round((seconds(a[0].substr(i+5)) - seconds(a[0].substr(0,i))) * 1000),
      end: seconds(a[0].substr(i+5)),
      text: t
    }
};
function seconds(s) {
  var a = s.split(':');
  var r = Number(a[a.length-1]) + Number(a[a.length-2]) * 60;
  if(a.length > 2) { r+= Number(a[a.length-3]) * 3600; }
  return r;
};



// Highlight current caption and chapter



// Hook up interactivity
// transcript.addEventListener("click",function(e) {
//   if(e.target.id.indexOf("caption") == 0) {
//     var i = Number(e.target.id.replace("caption",""));
//     jwplayer().seek(captions[i].begin);
//   }
// });
// search.addEventListener('focus',function(e){
//   setTimeout(function(){search.select();},100);
// });
// search.addEventListener('keydown',function(e) {
//   if(e.keyCode == 27) {
//     resetSearch();
//   } else if (e.keyCode == 13) {
//     var q = this.value.toLowerCase();
//     if(q.length > 0) {
//       if (q == query) {
//         if(cycle >= matches.length - 1) {
//           cycleSearch(0);
//         } else {
//           cycleSearch(cycle + 1);
//         }
//       } else {
//         resetSearch();
//         searchTranscript(q);
//       }
//     } else {
//       resetSearch();
//     }
//   }
// });