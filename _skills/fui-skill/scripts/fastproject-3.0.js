const { createApp, createVNode, render, ref, reactive, computed, watch, defineComponent, resolveComponent, markRaw } = Vue
$awt = 'Bearer ' + getCookie('awt');
var frameWorkSettingDefault = {
    "V3": {
        mainLayout: `<v-form ref="form" @submit.prevent="formSubmit">
                        <v-layout>
                            <header-bar v-if="v_Set.menu || v_Set.menuLeft" :logo="v_Set.logo" :title="v_Set.title" :menu="v_Set.menu" :menu-left="v_Set.menuLeft" :component="v_Set.menuComponent" :user-profile="v_Set.userProfile" :menu-style="v_Set.menuStyle"></header-bar>
                            <v-main id="mainContainer" v-if="v_containerOn" ></v-main>
                        </v-layout>                        
                        <f-window v-for="(w,index) in v_OpenWindowList" :win-data="w"></f-window>
                    </v-form>`,
        layoutTag: "v-container",
        layoutTagAttr: ["fluid"],
        rowTag: "v-row",
        rowTagAttr: ["dense", "no-gutters"],
        colTag: "v-col",
        colWidthClass: "v-col-",
    },
    "A3": {
        mainLayout: `<a-layout><a-layout id="mainContainer" v-if="v_containerOn" ></a-layout></a-layout>`,
        layoutTag: "a-layout",
        layoutTagAttr: [],
        rowTag: "a-row",
        rowTagAttr: [],
        colTag: "a-col",
        colWidthClass: "ant-col-",
    }
}
var defaultControlAttr = {}
var frameWorkSetting = frameWorkSettingDefault[Framework];
var vueData = reactive({
    p_domain: extractHostname(window.location.origin),
    p_routers: [],
    p_params: null,
    p_urlReferrer: (typeof urlReferrer === 'undefined' ? "" : urlReferrer),
    p_router: window.location.href.replace(window.location.origin, "").replace(window.location.search, ""),
    user: {
        UserID: null,
        UserName: null,
        LastName: null,
        FirstName: null,
        Sex: null,
        Phone: null,
        Email: null,
        DepartmentID: null,
        GroupID: null,
        SystemRight: null,
        FunctionRight: null,
        LastLogin: null
    },
    v_Set: {
        title: null,
        apiDomain: "",
        login: false,
        menu: [],
        userInfo: ""
    }
});

var vueOBJ = {
    data() { return vueData },
    methods: {
        async formvalidate() {
            if (vueData.v_Set.disableValidate) return true;
            const { valid } = await app._instance.refs.form.validate()
            return valid
        },
        async formSubmit() {
            if (!await this.formvalidate()) {
                showMessage({ type: "red", title: "Hãy điền đầy đủ dữ liệu bắt buộc !" });
                return false;
            }
            return true;
        }
    }
};

//===========================================================================================
const app = createApp(vueOBJ);
app.config.globalProperties.vueData = vueData;
app.config.globalProperties = reactive({
    v_isMobile: $isMobile,
    v_Loading: false,
    v_LoadingOverlay: [],
    v_OpenWindowList: [],
    v_containerOn: true,
})

Vue.component = app.component;
Vue.$toast = VueToast.useToast();
//===========================================================================================
//===========================================================================================
$(document).ready(function () {
    try {
        loadModuleInfo();
    } catch (ex) {
        console.log("%cGet data error ", 'color: red; font-size: 30px; margin-top: 10px', ex);
    }
});
//===========================================================================================
function buildParamURL() {
    //-------- build param from url ----------------------------
    vueData.p_routers = vueData.p_router.split('/').filter(w => w != '');

    vueData.p_params = window.location.search;
    const urlParams = new URLSearchParams(vueData.p_params);

    for (const key of urlParams.keys()) {
        vueData[key] = urlParams.get(key);
    }
}
//===========================================================================================
function loadModuleInfo() {
    _.templateSettings.interpolate = /{{([\s\S]+?)}}/g; // thiet lap nay là cho lodash
    if (typeof $moduleUI == "undefined") $moduleUI = {};

    if (typeof $projectData == "undefined") {
        errorMess(1, "Chưa thiết lập cấu hình cho dự án");
        return
    }

    if (typeof $projectGroupSetting == "undefined") $projectGroupSetting = {}

    $.extend(vueData.v_Set, $projectGroupSetting, $projectData, $moduleUI.set);

    if (vueData.v_Set.domainSetting) {
        if (vueData.v_Set.domainSetting[vueData.p_domain]) {
            $.extend(vueData.v_Set, vueData.v_Set.domainSetting[vueData.p_domain]);
        }
        delete vueData.v_Set.domainSetting;
    }

    buildParamURL();

    //------- lay thong tin user nếu co ----------
    if (vueData.v_Set.userInfo && vueData.v_Set.userInfo != '') {
        $.ajax({
            type: "POST",
            headers: {
                authorization: $awt
            },
            url: fixURL(vueData.v_Set.userInfo),
            contentType: "application/json; charset=utf-8",
            dataType: "json",
            crossDomain: true,
            success: function (d) {
                vueData.user = d;
            },
            complete: function (data) {
                createModuleDom();
            }
        });
    } else createModuleDom();
}

//===========================================================================================
function createModuleDom() {

    //=========== kiem tra đang nhap ================
    if (_.isString(vueData.v_Set.login) && vueData.v_Set.login != "") {
        if ($awt == 'Bearer ' || !vueData.user.UserID) {
            loginFUN();
            return
        }
    }


    //===============================================    
    if (!$moduleUI.watch) $moduleUI.watch = {};

    //========= day la moi ================
    console.log(`FUI 3.0 Editor : https://fui.vn/fp/module?pid=${ProjectID}&mid=${ModuleID}&pageurl=${encodeURI(location.href)}`)

    console.log("DATA", vueData);

    //--------------------------------------------------------------------------------
    //---------- create data opject and load api data --------------------------------
    //--------------------------------------------------------------------------------

    runAction($moduleUI.data);

    //-------------------- build DOM for VUE -----------------------------------------
    var vue2MainLayout = $(frameWorkSetting.mainLayout)

    $("#mainContainer", vue2MainLayout).prepend(buildModuleUI($moduleUI.controls, vueData))
    $("#fastProjectAPP").prepend(vue2MainLayout)
    //============ websocket ===========================
    if (vueData.webSocket) {
        vueData.webSocketState = { code: 0, text: "" };
        if (_.isPlainObject(vueData.webSocket)) {
            let objW = {}
            _.forEach(vueData.webSocket, function (value, key) {
                objW[bindDataToString(key, vueData)] = value;
            });
            vueData.webSocket = objW;
        }
        webSocketConnection('https://ws.fui.vn/signalr', vueData.webSocket, vueData.webSocketState);
        webSocketJoinGroup(vueData.webSocket);
    }

    //============ run UI ====================================================

    if (Framework == 'V3') {
        vueData.v_Set.themeStyle = $.extend({}, vuetifyDefaultSetting, vueData.v_Set.themeStyle)
        app.use(Vuetify.createVuetify(vueData.v_Set.themeStyle));
    }
    if (Framework == 'A3') app.use(antd);

    app.mount('#fastProjectAPP');

    //=========== add watch ================
    createWatch($moduleUI.watch);

    //=============== lay du lieu tu iframe ==============================================
    window.onmessage = function (event) {
        var evt = event || window.event;

        // console.log("on message", evt.data)
        switch (evt.data.cmd) {
            case "setData":
                setWindowData(evt.data.value.key, evt.data.value.data);
                break;
            case "getData":
                let data = { key: evt.data.value.key, data: getWindowData(evt.data.value.val) };
                windowSendMessage(evt.source, "sendData", data);
                break;
            case "openWindow":
                openWindow(evt.data.value);
                break;
            case "LOGIN":
                setCookie('awt', evt.data.token, 365, (vueData.v_Set.authDomain ? vueData.v_Set.authDomain : ''));
                location.assign(location.href);
                break;
            default:
            // code block
        }
    };
}
//===========================================================================================
//===========================================================================================
function buildAttr(P, tagAttr) {
    var returnObj = {}
    if (!P) return {};
    if (typeof P == 'string') {
        var d = $(`<div ${P}>`)
        $.each(Object.assign({}, d[0].attributes), (i, a) => {
            if (a.value == "" && tagAttr.indexOf(a.name) == -1) {
                d.addClass(a.name)
                d.removeAttr(a.name)
            }
        })
        $.each(d[0].attributes, (i, a) => {
            returnObj[a.name] = a.value;
        })
        return returnObj;
    } else return P;
}
//===========================================================================================
function buildModuleUI(controlsList, target) {
    var container = $("<div>");

    _.forEach(controlsList, function (C) {
        //var cont;
        // if(C.prop == undefined) C.prop = "";
        // if (_.isString(C.prop)) {
        // console.log("xxxxxxxxx", buildAttr(C.prop, frameWorkSetting.layoutTagAttr))
        //     cont = $(`<${frameWorkSetting.layoutTag} ${C.prop}>`);            
        // }
        // else cont = $(`<${frameWorkSetting.layoutTag}>`).attr(C.prop);

        var cont = $(`<${frameWorkSetting.layoutTag}>`).attr(buildAttr(C.prop, frameWorkSetting.layoutTagAttr));

        _.forEach(C.rows, function (R) {
            // var row;
            // if(R.prop == undefined) R.prop = "";
            // if (_.isString(R.prop)) row = $(`<${frameWorkSetting.rowTag} ${R.prop}>`);
            // else row = $(`<${frameWorkSetting.rowTag}>`).attr(R.prop);

            var row = $(`<${frameWorkSetting.rowTag}>`).attr(buildAttr(R.prop, frameWorkSetting.rowTagAttr));

            row.append(buildControl(R.cols, true, target));
            cont.append(row);
        });
        container.append(cont);
    });

    return container.children();
}
//===========================================================================================
function buildControl(controlsList, flex, target) {
    var container = $("<div>");

    _.forEach(controlsList, function (c) {
        if (typeof (c.el) != "undefined" && c.el != "") {
            if (c.el == 'layout') c.el = frameWorkSetting.rowTag

            if (!c.attr) c.attr = {}

            var defCom = defaultControlAttr[c.el];

            if (defCom) {
                if (defCom.attr) c.attr = $.extend(true, _.cloneDeep(defCom.attr), c.attr);
            }

            //---------------- chuyen doi du lieu thanh biến -------------
            buildVisualValForObj(c.attr, target);

            if (!c.attr[":required"]) delete c.attr[":rules"];
            var ctl = $("<" + c.el + ">").attr(c.attr);

            if (c.innerHTML) {
                if (_.isString(c.innerHTML)) ctl.html(c.innerHTML);
                else if (_.isArray(c.innerHTML)) {
                    if (c.el == frameWorkSetting.rowTag) {
                        ctl.append(buildControl(c.innerHTML, true, target));
                    } else {
                        ctl.append(buildControl(c.innerHTML, false, target));
                    }
                }
            }

            // if (flex) {
            //     if (!_.isPlainObject(c.col)) c.col = {};
            //     if (c.w) {
            //         if (!c.col["cols"]) c.col["cols"] = c.w;
            //     } else {
            //         if ($isMobile && !c.col["cols"]) c.col["cols"] = 12;
            //     }

            //     if (c.el == 'v-col') ctl.attr(_.assignIn({}, c.col, c.attr));
            //     else ctl = $("<v-col>").attr(c.col).append(ctl);
            // }

            if (flex) {
                // if(c.col == undefined) c.col = ""
                // if (c.el == frameWorkSetting.colTag) ctl.attr(buildAttr(c.col));
                // else if (_.isString(c.col)) ctl = $(`<${frameWorkSetting.colTag} ${c.col}>`).append(ctl);
                // else ctl = $(`<${frameWorkSetting.colTag}>`).attr(c.col).append(ctl);


                if (c.el == frameWorkSetting.colTag) ctl.attr(buildAttr(c.col, []));
                else ctl = $(`<${frameWorkSetting.colTag}>`).attr(buildAttr(c.col, [])).append(ctl);

                if (c.w) {
                    if (c.w > 24) ctl.css("flex-basis", c.w + "px");
                    else ctl.addClass(frameWorkSetting.colWidthClass + c.w);
                }
                if ($isMobile) ctl.addClass(frameWorkSetting.colWidthClass + "12");
            }


            container.append(ctl);
        }
    });
    return container.children();
}

//===========================================================================================
//===========================================================================================
//===========================================================================================
//===========================================================================================
function createWatch(obj) {
    if (obj) {
        if (_.isPlainObject(obj)) {
            _.forEach(obj, function (value, key) {
                if (!vueData.hasOwnProperty(key)) setValue(vueData, key, undefined);
            });

            if (obj['deep-watch']) {
                _.forEach(obj['deep-watch'], function (value, key) {
                    key = bindDataToString(key, vueData);
                    console.log("ADD Deep Watch : " + key);
                    watch(key, function (newValue, oldValue) {
                        runAction(value);
                    }, { deep: true });
                });
                delete obj['deep-watch'];
            }
            //----------------------------

            _.forEach(obj, function (value, key) {
                key = bindDataToString(key, vueData);
                console.log("ADD Watch : " + key);
                watch(() => vueData[key], function (newValue, oldValue) {
                    runAction(value);
                }, { deep: false });
            });
        }
    }
}
//===========================================================================================
function buildVisualValForObj(controlAttr, target) {
    _.forEach(controlAttr, function (val, key) {
        if (_.isObjectLike(val)) {
            controlAttr[key] = JSON.stringify(val);
        } else if (target) {
            if (key == "v-model") {
                if (val.indexOf('vueData.') < 0 && getVueData(val, target) == undefined) {
                    let mapObj = {};
                    mapObj[val] = undefined;

                    mapData(mapObj, target, {});
                }
            } else if (_.isString(val) && key[0] == ":") {
                let regexValCheck = /^[a-zA-Z0-9$_\[\]\-\.]*$/gm;

                if (val.indexOf('vueData.') < 0 && regexValCheck.test(val) && getVueData(val, target) == undefined) {
                    let mapObj = {};
                    if (key == ":items") mapObj[val] = [];
                    else mapObj[val] = undefined;

                    mapData(mapObj, target, {});
                }
            }

        }
    });
}
//===========================================================================================
function runAction(obj, includeData) {
    if (!obj) return;

    let dataSrc = _.assignIn({}, vueData, includeData);
    if (_.isString(obj)) obj = getVueData(obj, dataSrc);

    if (!obj) {
        console.log("Action Undefined");
        return;
    }

    if (!_.isArray(obj)) obj = _.castArray(obj);
    //-------------------------------------------------
    _.forEach(obj, function (value) {
        if (value.CONFIRM) {
            confirm({
                title: bindDataToString(value.CONFIRM, dataSrc),
                action: function () {
                    let action = _.cloneDeep(value);
                    delete action.CONFIRM;
                    delete action.CANCEL;
                    vueAction(action, includeData);
                },
                cancel: function () {
                    if (value.CANCEL) vueAction(value.CANCEL, includeData);
                    else if (includeData && _.isFunction(includeData.cancelConfirm)) includeData.cancelConfirm();
                }
            });
        } else vueAction(value, includeData);
    });
}
//===========================================================================================
function vueAction(objAction, includeData, callBack) {
    var obj = _.cloneDeep(objAction);
    var dataSrc = _.assignIn({}, vueData, includeData);

    if (!obj) return;

    if (obj.IN) {
        if (_.isString(obj.IN)) mapData({ "IN": obj.IN }, obj, dataSrc);
        else {
            var objIN = {};
            mapData(obj.IN, objIN, dataSrc);
            obj.IN = objIN;
        }
        //}
    }
    //--------------------------------------------------------------
    if (obj.API) {
        obj.API = bindDataToString(obj.API, dataSrc);

        if (obj.HEADER) {
            if (_.isString(obj.HEADER)) mapData({ "HEADER": obj.HEADER }, obj, dataSrc);
            else mapData(obj.HEADER, obj.HEADER, dataSrc);
        }

        defProp(obj.OUT);
        callAPI(obj, function (d) {
            if (_.isFunction(callBack)) callBack(d);
            runAction(obj.CALLBACK, includeData);
        }, includeData);
        return;
    }

    if (obj.CALL) {
        runAction(obj.CALL, includeData);
        return;
    }

    if (obj.EXE) {
        templateCompiled(`<% ${obj.EXE} %>`), { ...includeData, ...vueData }
        return;
    }

    if (obj.FUN) {
        obj.FUN = bindDataToString(obj.FUN, dataSrc);
        runFunction(obj, function (d) {
            mapData(obj.OUT, vueData, d);

            if (_.isFunction(callBack)) callBack(d);
            runAction(obj.CALLBACK, includeData);
        });
        return;
    }

    if (obj.IF) {
        if (templateCompiled(`<%- ${obj.IF} %>`, { ...includeData, ...vueData }) == 'true') {
            if (_.isString(obj.THEN)) templateCompiled(`<% ${obj.THEN} %>`, { ...includeData, ...vueData });
            else runAction(obj.THEN, includeData);
        } else {
            if (_.isString(obj.ELSE)) templateCompiled(`<% ${obj.ELSE} %>`, { ...includeData, ...vueData });
            else runAction(obj.ELSE, includeData);
        }
        return;
    }

    if (obj.MESS) {
        obj.MESS = bindDataToString(obj.MESS, dataSrc);
        Vue.$toast.success(obj.MESS, { position: 'top' });
        return;
    }

    if (obj.MESSBOX) {
        obj.MESSBOX = bindDataToString(obj.MESSBOX, dataSrc);
        showMessage({ title: obj.MESSBOX })
        return;
    }

    mapData(obj, vueData, vueData, includeData);
}
//===========================================================================================
function mapData(map, target, src, includeData) {
    if (_.isString(map)) {
        setValue(target, map, src);
    } else {
        if (_.isPlainObject(map)) {
            _.forEach(map, function (value, key) {
                if (includeData) src = _.assignIn({}, vueData, includeData);
                //Get data of window
                if (_.isString(value) && value[0] == "#") {
                    let windowData;
                    try {
                        if (window != top) windowData = parent.getWindowData(value);
                        setValue(target, key, windowData);
                    }
                    catch (err) {
                        let patternBlocked = /Blocked(.*)cross-origin(.*)/g;
                        // Khi bi Blocked ko cho set du lieu vi khac ten mien
                        if (patternBlocked.test(err)) windowSendMessage('#PARENT', "getData", { key: key, val: value });
                        else console.log("Set value error:", key, err);
                    }
                } else
                    if (key[0] == "#") {// Set data to Window
                        try {
                            if (window != top) parent.setWindowData(key, getVueData(value, src));
                            else setWindowData(key, getVueData(value, src));
                        }
                        catch (err) {
                            let patternBlocked = /Blocked(.*)cross-origin(.*)/g;
                            // Khi bi Blocked ko cho set du lieu vi khac ten mien                               
                            if (patternBlocked.test(err)) windowSendMessage('#PARENT', "setData", { key: key, data: getVueData(value, src) });
                            else console.log("Set value error:", key, err);
                        }
                    } else {
                        setValue(target, key, getVueData(value, src), src);
                    }
            });
        }
    }
}
//===========================================================================================
function defProp(obj) {
    if (_.isString(obj)) {
        if (typeof vueData[obj] == "undefined") vueData[obj] = [];
    } else
        if (_.isPlainObject(obj))
            for (k in obj) {
                if (typeof vueData[k] == "undefined")
                    vueData[k] = undefined;
            }
}
//===========================================================================================
function bindData(obj) {
    if (_.isObjectLike(obj)) return obj;
    else return getVueData(obj, vueData);
}
//===========================================================================================
function getVueData(key, src) {
    if (_.isString(key)) {
        if (key == "") return "";
        key = _.replace(key, 'vueData.', '').trim();

        if (key[0] == "`") {
            return _.trim(bindDataToString(key, src), "`");
        } else {
            if ((/^{{.*}}$/gm).test(key)) key = key.replace(/^{{|}}$/gm, ''); // bo cap {{ }} dau va cuoi

            try {
                templateCompiled(`<% ReturnValue = ${key} %>`, src);
                return ReturnValue;
            } catch (err) {
                let pattern = /Blocked(.*)cross-origin(.*)/g;
                if (pattern.test(err)) throw err;
                else {
                    if ((/({{.*}}|[ ])/gm).test(key)) return _.trim(bindDataToString(key, src), "`");
                    else {
                        if (err.name != "ReferenceError") console.log("%cGet data error ", 'color: red; font-size: 16px; margin-top: 10px', key, err);
                    }
                }
                //console.log("Error ", err);
            }

            return undefined;
            //console.log("ERROR", key)         
        }

    } else if (_.isPlainObject(key) && key.ARRAY && key.COL) {
        return _.map(_.at(src, key.ARRAY)[0], _.property(key.COL));
    }

    return key;
}
//===========================================================================================
function setValue(target, key, value, srcData, index) {
    if (_.isArray(key)) {
        let k = key[index];
        if (k[k.length - 1] == ']') {
            k = k.replaceAll("]", "");
            if ((/^[0-9]*$/gm).test(k)) k = parseInt(k); // kiem tra xem chuoi la numner
            else {
                if (k[0] == "'") k = k.replaceAll("'", "");
                else {
                    k = getVueData(k, srcData);
                }
            }
        }

        if (key.length - 1 == index) {
            target[k] = value;
            return;
        }

        if (typeof target[k] == "undefined") {
            let kn = key[index + 1];
            if (kn[kn.length - 1] == ']') target[k] = [];
            else target[k] = {};
        }
        setValue(target[k], key, value, srcData, index + 1);
    } else {
        if (key[0] == "`" || key[0] == "'") {
            key = key.replaceAll("'", "").replaceAll("`", "");
            setValue(target, [key], value, srcData, 0);
        }
        else setValue(target, _.words(key, /[^.\[]+/g), value, srcData, 0);
    }
}
//===========================================================================================
function bindDataToString(str, data) {
    if (!_.isString(str)) return str;

    let compiled = _.template(str);
    return compiled(data);
}
//===========================================================================================
function templateCompiled(str, data) {
    var compiled = _.template(str);
    return compiled(data);
}
//===========================================================================================
function getWindowData(value) {
    let winName = _.split(value, '.', 1)[0];
    let key = _.replace(value, winName + '.', '');

    if (winName == '#PARENT') return bindData(key);

    let win = $('iframe' + winName)[0];

    if (win) return win.contentWindow.bindData(key);
    else console.log("Window ID not found", winName);

    return undefined;
}
//===========================================================================================
function setWindowData(key, value) {
    let W = _.split(key, '.', 1)[0];
    let K = _.replace(key, W + '.', '');

    if (W == '#PARENT') {
        if (K == W) {
            runAction(value);
        }
        else setValue(vueData, K, value);
        return
    }
    let win = $('iframe' + W)[0];

    if (win) win.contentWindow.setWindowData(_.replace(key, W, '#PARENT'), value);
    else console.log("Window ID not found", W);
}

//===========================================================================================
function runFunction(obj, callback) {
    console.log("Run function", obj)
    let fn = window[obj.FUN];
    if (_.isFunction(fn)) {
        callback(fn(obj.IN));
    } else console.log("Func:", obj.FUN, "not found");
}
//===========================================================================================
function tableActionEvent(ctrl) {
    let action = ctrl["action"]
    if (!action) action = ctrl[":action"];

    // let oldValue = ctrl.modelValue;
    // console.log("oldValue",oldValue);
    // if (!_.isUndefined(ctrl.ctlValue)) ctrl.$emit('input', ctrl.ctlValue);
    if (action) {
        console.log("Table Action", ctrl);
        runAction(action, {
            item: ctrl['item'],
            cancelConfirm: function () {
                // if (!_.isUndefined(oldValue)) ctrl.ctlValue = oldValue;
                // if (!_.isUndefined(ctrl.ctlValue)) ctrl.$emit('input', ctrl.ctlValue);
            }
        });
    }
}
//===========================================================================================
function callAPI(objApi, callBack, includeData) {
    if (objApi.API) {
        let loadingID = generateID();
        app.config.globalProperties.v_LoadingOverlay.push(loadingID);
        app.config.globalProperties.v_Loading = true;

        $.ajax({
            type: (objApi.METHOD ? objApi.METHOD : "POST"),
            headers: (objApi.HEADER ? objApi.HEADER : {
                authorization: $awt
            }),
            url: fixURL(objApi.API),
            data: JSON.stringify(objApi.IN),
            contentType: "application/json; charset=utf-8",
            dataType: "json",
            crossDomain: true,
            success: function (d) {
                //---- convert to json object ------------
                json_data_parse(d, 0);
                //--------------------------------
                console.log("API:", _.cloneDeep(objApi.API), "IN:", objApi.IN ? _.cloneDeep(objApi.IN) : "");
                console.log("OUT:", _.cloneDeep(d));
                //--------------------------------------
                if (objApi.OUT) {
                    if (_.isString(objApi.OUT) && Object.keys(d).length == 1 && d.data) d = d.data;
                    mapData(objApi.OUT, vueData, d);
                }
                if (objApi.MESS) Vue.$toast.success(bindDataToString(objApi.MESS, vueData), { position: 'top' })
                if (_.isFunction(callBack)) callBack(d);
            },
            error: function (xhr, ajaxOptions, thrownError) {
                console.log("API:", objApi.API, "IN:", objApi.IN ? objApi.IN : "");
                if (objApi.ERROROUT) {
                    mapData(objApi.ERROROUT, vueData, xhr);
                }
                if (objApi.ERRORCALLBACK) {
                    runAction(objApi.ERRORCALLBACK, includeData);
                }
                if (objApi.ERROROUT) return;

                if (xhr.status == 200) {
                    console.log("Error XHR:", xhr);
                    mapData(objApi.OUT, vueData, xhr.responseText);
                } else {
                    console.log("Error XHR:", xhr);
                    errorMess(xhr.status, (_.isString(xhr.responseJSON) ? xhr.responseJSON : (_.isPlainObject(xhr.responseJSON) ? xhr.responseJSON.Message : "")))
                }
            },
            complete: function (data) {
                app.config.globalProperties.v_LoadingOverlay = _.without(app.config.globalProperties.v_LoadingOverlay, loadingID);
                if (app.config.globalProperties.v_LoadingOverlay.length == 0) app.config.globalProperties.v_Loading = false;
            }
        });
    }
}
//===========================================================================================
function loginFUN() {
    if (!vueData.v_Set.login || vueData.v_Set.login == "") return;
    // if (vueData.v_Set.login.indexOf('login.fui.vn') >= 0) {
    //     openWindow({
    //         headerbar: false,
    //         transition: 'fade-transition',
    //         title: 'Đăng nhập',
    //         url: vueData.v_Set.login,
    //         onclose: function () {
    //             location.assign(location.href);
    //         }
    //     });
    // }
    // else 
    location.assign(vueData.v_Set.login);
}

//===========================================================================================
function errorMess(code, message) {
    let errorText = {
        "400": ["Bad Request", "The server did not understand the request"],
        "401": ["Unauthorized", "The requested page needs a username and a password"],
        "402": ["Payment Required", "You can not use this code yet"],
        "403": ["Forbidden", "Access is forbidden to the requested page"],
        "404": ["Not Found", "The server can not find the requested page"],
        "405": ["Method Not Allowed", "The method specified in the request is not allowed"],
        "406": ["Not Acceptable", "The server can only generate a response that is not accepted by the client"],
        "407": ["Proxy Authentication Required", "You must authenticate with a proxy server before this request can be served"],
        "408": ["Request Timeout", "The request took longer than the server was prepared to wait"],
        "411": ["Length Required", "The 'Content-Length' is not defined. The server will not accept the request without it"],
        "413": ["Request Entity Too Large", ""],
        "414": ["Request-url Too Long", ""],
        "415": ["Unsupported Media Type", ""],
        "500": ["Internal Server Error", "The request was not completed. The server met an unexpected condition"],
        "501": ["Not Implemented", "The request was not completed. The server did not support the functionality required"],
        "502": ["Bad Gateway", ""],
        "503": ["Service Unavailable", "The request was not completed. The server is temporarily overloading or down"],
        "504": ["Gateway Timeout", "The gateway has timed out"],
    };
    let err = errorText[code];
    let title;

    if (code == "403") {
        if (message == '') title = 'Bạn chưa được phân quyền tính năng này.';
        else {
            title = message;
            message = '';
        }
        app.config.globalProperties.v_containerOn = false;
    } else if (code == "401") {
        if (vueData.v_Set.login && ($awt == 'Bearer ' || message.toLowerCase().indexOf('token') >= 0)) {
            loginFUN();
            return
        } else {
            if (!vueData.v_Set.login || vueData.v_Set.login == "") {
                title = 'Hãy đăng nhập lại';
                message = "Chứng thực của bạn không còn hiệu lực";
            } else {
                confirm({
                    title: message,
                    message: 'Bạn có muốn đăng nhập lại hay không ?',
                    action: function () {
                        loginFUN();
                    }
                });
                return;
            }
        }
    } else if (!err) {
        title = "Error " + code + ': Hãy kiểm tra kết nối mạng';
    } else {
        if (code == '400') title = '';
        else title = code + ": " + err[0];

        if (!message) message = err[1];
    }

    //---------------------------------------------------------------------------------------------------------------------------
    showMessage({
        icon: 'mdi mdi-alert-circle-outline',
        title: title,
        message: message,
        type: 'red'
    });
}
//===========================================================================================
//===========================================================================================
