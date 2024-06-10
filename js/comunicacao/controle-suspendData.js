function getAllSuspendData() {
    var str = "";
    if (SCORM) {
        str = GetSuspendData();
    } else {

        str = Cookies.get("suspendData");
    }
    return str;
}

function getSuspendData(value) {
    var str = "";
    var arr;
    var i;
    var arrItem;

    if (SCORM) {
        arr = GetSuspendData().split("||");

        for (i = 0; i < arr.length; i++) {
            arrItem = arr[i].split("=");
            if (arrItem[0] == value) {
                str = arrItem[1];
            }
        }
    } else if (Cookies.get('suspendData')) {
        arr = Cookies.get("suspendData").split("||");

        for ( i = 0; i < arr.length; i++) {
            arrItem = arr[i].split("=");
            if (arrItem[0] == value) {
                str = arrItem[1];
            }
        }
    }
    return str;
}

function setAllSuspendData(value) {
    if (SCORM) {
        SetSuspendData(value);
    } else {
        Cookies.set('suspendData', value, { path: '', sameSite: 'strict' });
    }
}

function setSuspendData(item, value) {

    var arr;
    var str;
    var i;
    var arrItem;

    if (SCORM) {
        arr = GetSuspendData().split("||");

        for (i = 0; i < arr.length; i++) {
            arrItem = arr[i].split("=");
            if (arrItem[0] == item) {
                arrItem[1] = value;

                arr[i] = arrItem.join("=");

                str = arr.join("||");

                SetSuspendData(str);
                return;
            }
        }

        arr.push(item + "=" + value);

        str = arr.join("||");

        SetSuspendData(str);
    } else {

        var date = new Date();
        var d = 365;
        date.setTime(date.getTime() + (d * 24 * 60 * 60 * 1000));

        if (Cookies.get('suspendData')) {
            arr = Cookies.get('suspendData').split("||");

            for (i = 0; i < arr.length; i++) {
                arrItem = arr[i].split("=");
                if (arrItem[0] == item) {
                    arrItem[1] = value;

                    arr[i] = arrItem.join("=");

                    str = arr.join("||");

                    Cookies.set('suspendData', str, { expires: date, path: '', sameSite: 'strict' });
                    return;
                }
            }
        } else {
            arr = [];
        }
        arr.push(item + "=" + value);

        str = arr.join("||");

        Cookies.set('suspendData', str, { expires: date, path: '', sameSite: 'strict' });
    }
}
