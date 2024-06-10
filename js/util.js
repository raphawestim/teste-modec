function decodeHTMLEntities(text) {
    var entities = [
        ['amp', '&'],
        ['apos', '\''],
        ['#x27', '\''],
        ['#x2F', '/'],
        ['#39', '\''],
        ['#47', '/'],
        ['lt', '<'],
        ['gt', '>'],
        ['nbsp', ' '],
        ['quot', '"']
    ];

    for (var i = 0, max = entities.length; i < max; ++i)
        text = text.replace(new RegExp('&' + entities[i][0] + ';', 'g'), entities[i][1]);

    return text;
}

//FORMATA NÚMERO, INSERINDO "0"
function Format(num) {
    var str;
    if (Number(num) < 10) {
        if (Number(num) >= 0)
            str = "0" + Number(num);
        else if (Number(num) > -10)
            str = "-0" + Number(Math.abs(num));
        else
            str = num;
    } else {
        str = num;
    }
    return str;
}

//IMPLEMENTA INDEXOF EM VERSÕES ANTIGAS DO IE
if (!Array.prototype.indexOf) {
    Array.prototype.indexOf = function (elt /*, from*/) {
        var len = this.length >>> 0;

        var from = Number(arguments[1]) || 0;
        from = (from < 0) ? Math.ceil(from) : Math.floor(from);
        if (from < 0)
            from += len;

        for (; from < len; from++) {
            if (from in this &&
                this[from] === elt)
                return from;
        }
        return -1;
    };
}

/**
 * Recupera parâmetros passados pela url
 * @param  {String} nomeParametro Nome do parâmetro
 * @param  {String} url           Valor da URL. Por padrão recupera a URL da página atual
 * @return {String}               valor recuperado
 */
function getParameterByName(nomeParametro, url) {
    if (!url) url = window.location.href;
    nomeParametro = nomeParametro.replace(/[\[\]]/g, "\\$&");
    var regex = new RegExp("[?&]" + nomeParametro + "(=([^&#]*)|&|#|$)"),
        results = regex.exec(url);
    if (!results) return null;
    if (!results[2]) return '';
    return decodeURIComponent(results[2].replace(/\+/g, " "));
}

/**
 * Remove acentos de caracteres
 * @param  {String} stringComAcento [string que contem os acentos]
 * @return {String}                 [string sem acentos]
 */
function removerAcentos(newStringComAcento) {
    var string = newStringComAcento;
    var mapaAcentosHex = {
        a: /[\xE0-\xE6]/g,
        A: /[\xC0-\xC6]/g,
        e: /[\xE8-\xEB]/g,
        E: /[\xC8-\xCB]/g,
        i: /[\xEC-\xEF]/g,
        I: /[\xCC-\xCF]/g,
        o: /[\xF2-\xF6]/g,
        O: /[\xD2-\xD6]/g,
        u: /[\xF9-\xFC]/g,
        U: /[\xD9-\xDC]/g,
        c: /\xE7/g,
        C: /\xC7/g,
        n: /\xF1/g,
        N: /\xD1/g
    };

    for (var letra in mapaAcentosHex) {
        var expressaoRegular = mapaAcentosHex[letra];
        string = string.replace(expressaoRegular, letra);
    }

    return string;
}

if (!Array.prototype.fill) {
    Array.prototype.fill = function (value) {

        // Passo 1-2.
        if (this == null) {
            throw new TypeError('this is null or not defined');
        }

        var O = Object(this);

        // Passo 3-5.
        var len = O.length >>> 0;

        // Passo 6-7.
        var start = arguments[1];
        var relativeStart = start >> 0;

        // Passo 8.
        var k = relativeStart < 0 ?
            Math.max(len + relativeStart, 0) :
            Math.min(relativeStart, len);

        // Passo 9-10.
        var end = arguments[2];
        var relativeEnd = end === undefined ?
            len : end >> 0;

        // Passo 11.
        var final = relativeEnd < 0 ?
            Math.max(len + relativeEnd, 0) :
            Math.min(relativeEnd, len);

        // Passo 12.
        while (k < final) {
            O[k] = value;
            k++;
        }

        // Passo 13.
        return O;
    };
}

function getScrollBarWidth(el){
    return el[0].offsetWidth - el[0].clientWidth
}