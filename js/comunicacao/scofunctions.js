/*******************************************************************************
 **
 ** Filename: SCOFunctions.js
 **
 ** File Description: This file contains several JavaScript functions that are
 **                   used by the Sample SCOs contained in the Sample Course.
 **                   These functions encapsulate actions that are taken when the
 **                   user navigates between SCOs, or exits the Lesson.
 **
 ** Author: ADL Technical Team
 **
 ** Contract Number:
 ** Company Name: CTC
 **
 ** Design Issues:
 **
 ** Implementation Issues:
 ** Known Problems:
 ** Side Effects:
 **
 ** References: ADL SCORM
 **
 ********************************************************************************
 **
 ** Concurrent Technologies Corporation (CTC) grants you ("Licensee") a non-
 ** exclusive, royalty free, license to use, modify and redistribute this
 ** software in source and binary code form, provided that i) this copyright
 ** notice and license appear on all copies of the software; and ii) Licensee
 ** does not utilize the software in a manner which is disparaging to CTC.
 **
 ** This software is provided "AS IS," without a warranty of any kind.  ALL
 ** EXPRESS OR IMPLIED CONDITIONS, REPRESENTATIONS AND WARRANTIES, INCLUDING ANY
 ** IMPLIED WARRANTY OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE OR NON-
 ** INFRINGEMENT, ARE HEREBY EXCLUDED.  CTC AND ITS LICENSORS SHALL NOT BE LIABLE
 ** FOR ANY DAMAGES SUFFERED BY LICENSEE AS A RESULT OF USING, MODIFYING OR
 ** DISTRIBUTING THE SOFTWARE OR ITS DERIVATIVES.  IN NO EVENT WILL CTC  OR ITS
 ** LICENSORS BE LIABLE FOR ANY LOST REVENUE, PROFIT OR DATA, OR FOR DIRECT,
 ** INDIRECT, SPECIAL, CONSEQUENTIAL, INCIDENTAL OR PUNITIVE DAMAGES, HOWEVER
 ** CAUSED AND REGARDLESS OF THE THEORY OF LIABILITY, ARISING OUT OF THE USE OF
 ** OR INABILITY TO USE SOFTWARE, EVEN IF CTC  HAS BEEN ADVISED OF THE
 ** POSSIBILITY OF SUCH DAMAGES.
 **
 *******************************************************************************/
var startDate;
var exitPageStatus;

function loadPage() {
    var result = doLMSInitialize();

    if (result == "false") {
        return false;
    }

    var status = doLMSGetValue("cmi.core.lesson_status");

    if (status == "not attempted") {
        doLMSSetValue("cmi.core.lesson_status", "incomplete");
        doLMSSetValue("cmi.core.lesson_location", "");
    }

    //result = doLMSCommit();

    Tela = doLMSGetValue('cmi.core.lesson_location');
    Nome = doLMSGetValue('cmi.core.student_name');
    id_aluno = doLMSGetValue('cmi.core.student_id');
    Inputs = GetSuspendData();

    exitPageStatus = false;
    startTimer();
    return true;
}


function Commit() {
    doLMSCommit();

    if (doLMSGetLastError() != "0")
        alert("Não foi possível enviar seus dados para o servidor!");

}

function startTimer() {
    startDate = new Date().getTime();
}

function computeTime() {
    if (startDate != 0) {
        var currentDate = new Date().getTime();
        var elapsedSeconds = ((currentDate - startDate) / 1000);
        var formattedTime = convertTotalSeconds(elapsedSeconds);
    } else {
        formattedTime = "00:00:00.0";
    }

    doLMSSetValue("cmi.core.session_time", formattedTime);
}

function doBack() {
    doLMSSetValue("cmi.core.exit", "suspend");

    computeTime();
    exitPageStatus = true;

    var result;

    result = doLMSCommit();

    // NOTE: LMSFinish will unload the current SCO.  All processing
    //       relative to the current page must be performed prior
    //		 to calling LMSFinish.

    result = doLMSFinish();

}

function doContinue(status) {
    // Reinitialize Exit to blank
    doLMSSetValue("cmi.core.exit", "");

    var mode = doLMSGetValue("cmi.core.lesson_mode");

    if (mode != "review" && mode != "browse") {
        doLMSSetValue("cmi.core.lesson_status", status);
    }

    computeTime();
    exitPageStatus = true;

    var result;
    result = doLMSCommit();
    // NOTE: LMSFinish will unload the current SCO.  All processing
    //       relative to the current page must be performed prior
    //		 to calling LMSFinish.

    result = doLMSFinish();

}

function doJump(dest) {
    // Reinitialize Exit to blank
    doLMSSetValue("cmi.core.exit", "");

    var mode = doLMSGetValue("cmi.core.lesson_mode");

    if (mode != "review" && mode != "browse") {
        doLMSSetValue("cmi.core.lesson_status", "incomplete");
    }

    computeTime();
    exitPageStatus = true;

    var result;
    result = doLMSCommit();
    // NOTE: LMSFinish will unload the current SCO.  All processing
    //       relative to the current page must be performed prior
    //		 to calling LMSFinish.

    result = doLMSFinish("jump=" + dest);

}



function doQuit() {
    doLMSSetValue("cmi.core.exit", "logout");

    computeTime();
    exitPageStatus = true;

    var result;

    result = doLMSCommit();

    // NOTE: LMSFinish will unload the current SCO.  All processing
    //       relative to the current page must be performed prior
    //		 to calling LMSFinish.

    result = doLMSFinish();
}

/*******************************************************************************
 ** The purpose of this function is to handle cases where the current SCO may be
 ** unloaded via some user action other than using the navigation controls
 ** embedded in the content.   This function will be called every time an SCO
 ** is unloaded.  If the user has caused the page to be unloaded through the
 ** preferred SCO control mechanisms, the value of the "exitPageStatus" var
 ** will be true so we'll just allow the page to be unloaded.   If the value
 ** of "exitPageStatus" is false, we know the user caused to the page to be
 ** unloaded through use of some other mechanism... most likely the back
 ** button on the browser.  We'll handle this situation the same way we
 ** would handle a "quit" - as in the user pressing the SCO's quit button.
 *******************************************************************************/
function unloadPage() {
    if (exitPageStatus != true) {
        //		doQuit();
        doEncerra();
    }
    // NOTE:  don't return anything that resembles a javascript
    //		  string from this function or IE will take the
    //		  liberty of displaying a confirm message box.

}

/*******************************************************************************
 ** this function will convert seconds into hours, minutes, and seconds in
 ** CMITimespan type format - HHHH:MM:SS.SS (Hours has a max of 4 digits &
 ** Min of 2 digits
 *******************************************************************************/
function convertTotalSeconds(ts) {
    var sec = (ts % 60);

    ts -= sec;
    var tmp = (ts % 3600); //# of seconds in the total # of minutes
    ts -= tmp; //# of seconds in the total # of hours

    // convert seconds to conform to CMITimespan type (e.g. SS.00)
    sec = Math.round(sec * 100) / 100;

    var strSec = new String(sec);
    var strWholeSec = strSec;
    var strFractionSec = "";

    if (strSec.indexOf(".") != -1) {
        strWholeSec = strSec.substring(0, strSec.indexOf("."));
        strFractionSec = strSec.substring(strSec.indexOf(".") + 1, strSec.length);
    }

    if (strWholeSec.length < 2) {
        strWholeSec = "0" + strWholeSec;
    }
    strSec = strWholeSec;

    if (strFractionSec.length) {
        strSec = strSec + "." + strFractionSec;
    }


    if ((ts % 3600) != 0)
        var hour = 0;
    else var hour = (ts / 3600);
    if ((tmp % 60) != 0)
        var min = 0;
    else var min = (tmp / 60);

    if ((new String(hour)).length < 2)
        hour = "0" + hour;
    if ((new String(min)).length < 2)
        min = "0" + min;

    var rtnVal = hour + ":" + min + ":" + strSec;

    return rtnVal;
}


/*******************************************************************************
 ** this function will close the SCO without login out
 *******************************************************************************/

function doEncerra() {

    computeTime();
    exitPageStatus = true;

    var result;

    result = doLMSCommit();

    // NOTE: LMSFinish will unload the current SCO.  All processing
    //       relative to the current page must be performed prior
    //		 to calling LMSFinish.

    // Reinitialize Exit to blank
    doLMSSetValue("cmi.core.exit", "suspend");

    result = doLMSFinish();

    //   alert("encerrou");
}

/*******************************************************************************
 ** this function will set status to completed as soon the sco has ended
 *******************************************************************************/
function finalizaIntro(args) {
    //var result = doLMSInitialize();
    var result = doLMSGetValue("cmi.core.lesson_status");
    if (doLMSGetLastError() != "0") {
        alert("Não foi possível encerrar a lição!");
    } else if (result != "completed") {
        computeTime();
        //			if (typeof(args) != null)
        //				doLMSSetValue( "cmi.core.lesson_location", args );

        doLMSSetValue("cmi.core.lesson_status", "completed");
        result = doLMSCommit();
    }
}

/*******************************************************************************
 ** this function will set status_locaiton to the last page of the sco
 *******************************************************************************/
function doLocation(status) {
    //var result = doLMSInitialize();

    var result = doLMSGetValue("cmi.core.lesson_status");
    Tela = doLMSGetValue("cmi.core.lesson_location");

    if (doLMSGetLastError() != "0") {
        alert("Não foi possível marcar sua posição!");
    } else if (result != "completed") {
        doLMSSetValue("cmi.core.lesson_location", status);
        //result = doLMSCommit();
        //			   alert("Gravou: " + status + " Resultado: " + result);
    }
}

/*******************************************************************************
 ** this function will get the location of the sco
 *******************************************************************************/
function get_param(licao) {
    P_LICAO = 0;
    Q_LICAO = 0;
    Tela = doLMSGetValue("cmi.core.lesson_location");
    if (doLMSGetLastError() != "0")
        alert("Não foi possível recuperar seus dados!");
    else if (Tela != 0) {
        var bookmark = unescape(Tela);
        //		alert("Inicio: " + bookmark);
        if (bookmark.length > 0) {
            var mst = bookmark.split(',');
            for (var f = 0; f < mst.length; f++) {
                var telas = mst[f].split(':');
                if (licao == telas[0])
                    return telas[1];
            }
            //			alert("escape: " + escape(bookmark));
        }
    }
}

/*******************************************************************************
 ** this function will set location of the sco
 *******************************************************************************/
function set_location(licao, telas) {
    Tela = doLMSGetValue("cmi.core.lesson_location");

    if (doLMSGetLastError() != "0")
        alert("Não foi possível gravar sua lição!");
    else if (Tela.length < 1) {
        Tela = licao + ":" + telas;
    } else {
        ind = Tela.indexOf(licao);
        if (ind < 0) {
            Tela = Tela + "," + licao + ":" + telas;
        } else {
            //divide a string em duas partes, uma antes da licao referida (temp) e outra apos a licao referida se houver (temp1)
            temp = Tela.substr(0, ind);
            //retorna a posicao do proximo divisor da string apos o indice da licao referida, neste caso uma ","
            ind_proxdiv = Tela.indexOf(",", ind);

            if (ind_proxdiv >= 0) {
                temp1 = Tela.substr(ind_proxdiv);
            } else {
                temp1 = "";
            }
            //
            // junta as duas partes com o novo valor da tela
            Tela = temp + licao + ":" + telas + temp1;
        }
    }

    doLocation(Tela);
}

/*******************************************************************************
 ** this function will get the data of the POP in the sco
 *******************************************************************************/
function getObjectives(objective) {
    if (objective != null) {
        var total = doLMSGetValue("cmi.objectives._count");
        if (total != 0)
            for (i = 0; i < total; i++) {
                var p_acao = "cmi.objectives." + i + ".id";
                var p_resu = doLMSGetValue(p_acao);
                if (p_resu == objective) {
                    var p_acao1 = "cmi.objectives." + i + ".score.raw";
                    P_STATUS = doLMSGetValue(p_acao1);
                    //					alert(p_resu + " " + P_STATUS);
                }
            }
    }
}

/*******************************************************************************
 ** this function will set the data of the POP in the sco
 *******************************************************************************/
function setObjectives(objective, status) {
    if (objective != null) {
        var total = doLMSGetValue("cmi.objectives._count");
        if (total != 0)
            for (i = 0; i < total; i++) {
                var p_acao = "cmi.objectives." + i + ".id";
                //				alert(p_acao);
                var p_resu = doLMSGetValue(p_acao);
                if (p_resu == objective) {
                    p_acao = "cmi.objectives." + i + ".score.raw";
                    //					alert(p_acao1 + " " + status);
                    doLMSSetValue(p_acao, status);
                    //					alert(p_resu + " " + status);
                }
            }
    }
}

/*******************************************************************************
 ** this function will prepare the data to set comments into the sco
 *******************************************************************************/
function setComments(comments, status) {

    //var resulta = doLMSInitialize();

    var result = doLMSGetValue("cmi.comments");

    if (doLMSGetLastError() != "0") {
        alert("Não foi possível recuperar seus dados!");
    } else if (result.length < 1) {
        result = comments + "s" + status;
    } else {
        ind = result.indexOf(comments);
        comp = comments.length + 1;
        if (ind < 0) {
            result = result + "," + comments + "s" + status;
        } else {
            // divide a string em duas partes, uma antes da tela da idx referida
            temp = result.substr(0, (ind + comp));
            //							alert("pp = " + temp);
            // e outra apos o valor da tela da idx referida -- para telas ate 10 e maior que 10
            if (status <= 10) {
                temp1 = result.substr((ind + comp + 1), (result.length - ind));
            } else {
                temp1 = result.substr((ind + comp + 2), (result.length - ind));
            }

            // 							alert("sp = " + temp1);
            // junta as duas partes com o novo valor da tela
            result = temp + status + temp1;
            //							 alert("resultado=" + result);
        }
    }
    doComments(result);
}

/*******************************************************************************
 ** this function will set comments into the sco
 *******************************************************************************/
function doComments(comments) {
    //var result = doLMSInitialize();

    var result = doLMSGetValue("cmi.comments");

    if (doLMSGetLastError() != "0") {
        alert("Não foi possível marcar sua posição!");
    } else if (comments != null) {

        doLMSSetValue("cmi.comments", comments);
        result = doLMSCommit();
    }
}

/*******************************************************************************
 ** this function will get the comments of the sco
 *******************************************************************************/
function get_Comments(comments) {

    result = doLMSGetValue("cmi.comments");

    if (doLMSGetLastError() != "0")
        alert("Não foi possível recuperar seus dados!");
    else {
        var bookmark = unescape(result);
        //		alert("Inicio: " + bookmark);
        if (bookmark.length > 0) {
            var mst = bookmark.split(',');
            for (var f = 0; f < mst.length; f++) {
                var status = mst[f].split('s');

                if (comments == status[0])
                    P_STATUS = status[1]; //se achar uma licao igual a requerida atribuo o status para minha variavel global
            }
            //			alert("escape: " + escape(bookmark));
        }
    }
}


/*******************************************************************************
 ** this function will set the score of the sco
 *******************************************************************************/
function SetScore(nota) {
    result = doLMSGetValue("cmi.core.score.raw");
    if ((parseInt(nota, 10) >= (parseInt(result, 10))) || !result)
        doLMSSetValue("cmi.core.score.raw", String(nota));

    if (doLMSGetLastError() != "0")
        alert("Não foi possível gravar seus dados!");

}

function SetScoreMin(nota) {
    doLMSSetValue("cmi.core.score.min", String(nota));
}

function SetScoreMax(nota) {
    doLMSSetValue("cmi.core.score.max", String(nota));
}
/*******************************************************************************
 ** this function will get the score of the sco
 *******************************************************************************/
function GetScore() {

    result = doLMSGetValue("cmi.core.score.raw");

    if (parseInt(result, 10) <= 0)
        result = "";

    if (doLMSGetLastError() != "0")
        alert("Não foi possível recuperar a Nota!");

    return result;
}
//-------------
//obtem os valores de bookmark armazenados
function GetLocation() {
    bookmark = doLMSGetValue("cmi.core.lesson_location");

    if (doLMSGetLastError() != "0") {
        alert("Erro na API. Não foi possível obter o bookmark.");
        return "";
    } else {
        return bookmark;
    }
}
//-------------
//obtem os valores de adicionais armazenados
function GetSuspendData() {
    texto = doLMSGetValue("cmi.suspend_data");

    if (doLMSGetLastError() != "0") {
        alert("Ocorreu um erro e seus dados não puderam ser recuperados. Por favor, reinicie o curso.");
        return "";
    } else {
        return texto;
    }
}
//
function SetSuspendData(dados) {
    doLMSSetValue("cmi.suspend_data", String(dados));

    if (doLMSGetLastError() != "0") {
        alert("Ocorreu um erro e seus dados não puderam ser gravados. Por favor, reinicie o curso.");
    }
}
//
function GetStatus() {
    var status = doLMSGetValue("cmi.core.lesson_status");

    if (doLMSGetLastError() != "0") {
        alert("Erro na API. Não foi possível obter o Status.");
        return "";
    } else {
        return status;
    }
}
