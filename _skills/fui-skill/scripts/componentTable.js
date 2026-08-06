Vue.component("f-table", {
    props: ['value', 'headers', 'updateForm', 'updateFormAttr', "updateApi", 'items', 'label', 'excel', 'showSearch', 'sumFormat', 'disabledHover', 'returnObject', "itemKey", 'itemsPerPage', "disabledUpdate", 'hideDefaultFooter', 'template', 'headercomponent', 'height', 'fixedHeader'],
    data: function () {
        var headersAttr = bindData(this.headers);
        var strTableTemplate = this.template || '';

        if (headersAttr) {
            _.forEach(headersAttr.filter(i => !!i.el), function (c) {
                var ctl = buildControl([c], false);

                ctl.attr("v-bind", "item.attr");
                ctl.attr(":item", "item");
                ctl.attr(":index", "items.indexOf(item)");
                ctl.attr("v-on:mouseover", "$emit('mouseover:row',item)");
                ctl.attr("v-on:mouseleave", "$emit('mouseleave:row',item)");

                if (!c.attr['v-model']) ctl.attr("v-model", `item['${c.value}']`);

                strTableTemplate += `<template v-slot:item.${c.value}="{item}">${ctl[0].outerHTML}</template>`
            });
        }

        this.$options.template = `
            <v-card outlined v-if="headerCols" ref="myTable">
                <v-card-title v-if="showSearch || label || ((newAPI() || newAction()) && !disabledUpdate)" align="end" class="py-2 px-3">
                    <div class="primary--text text-left" v-html="label" style="font-weight: 500; font-size: 1.1rem;"></div>
                    <v-spacer></v-spacer><component :is="headercomponent"></component>
                    <v-btn v-if="excel" icon color="primary" @click="toExcel"><v-icon>mdi-microsoft-excel</v-icon></v-btn>
                    <div v-if="showSearch" class="d-flex align-center ml-3">
                        <v-btn icon color="primary" @mousedown.prevent @click="toggleSearch"><v-icon>mdi-magnify</v-icon></v-btn>
                        <v-expand-x-transition>
                            <v-text-field v-if="searchOpen" ref="searchField" dense @input="updateSearch" label="" single-line hide-details autofocus style="width: 300px;" @blur="onSearchBlur" class="ml-1"></v-text-field>
                        </v-expand-x-transition>
                    </div>
                    <v-btn v-if="(newAPI() || newAction()) && !disabledUpdate" class="ml-3" outlined x-small fab dark color="primary" @click="newBtnClick"><v-icon dark>mdi-plus</v-icon></v-btn>
                </v-card-title>
    
                <v-data-table class="tTable" :class="{tTableNoHover: disabledHover}" v-bind="$attrs" :height="tableHeight" :fixed-header="tableFixedHeader" :items="items" :item-key="itemKey" :headers="headerCols" :items-per-page="itemsPerPage" :hide-default-footer="_hideDefaultFooter" v-model="itemselected" calculate-widths  v-on:click:row="$emit('click:row', $event)" v-on:item-selected="itemSelect()" v-on:toggle-select-all="itemSelect()" :search="search" :custom-filter="customSearch">
                    <template v-for="(h, index) in headerCols" :key="index" v-slot:['header.'+h.value]="{ header }"><span v-html="header.text"></span></template>
                    ${strTableTemplate}
                    <template v-if="!disabledUpdate" v-slot:item.ctrl-update="{item}">
                        <div class="d-flex justify-center" v-if="item['ctrl-update'] != 0">
                            <v-btn v-if="deleteAPI()" @click="deleteItem(item, deleteAPI())" x-small fab icon><v-icon color="red darken-3">mdi-trash-can-outline</v-icon></v-btn>
                            <v-btn v-if="editAPI() || editAction()" @click="editItem(item)" x-small fab icon><v-icon color="green darken-2">mdi-square-edit-outline</v-icon></v-btn>
                        </div>
                    </template>
                    <template v-if="sumFormat && typeof sumFormat === 'object'" v-slot:body.append="{ headers }">
                        <tr>
                            <td v-for="h in headers" :key="'sum-'+h.value" class="text-right font-weight-medium">
                                <span v-if="sumFormat[h.value]">{{ sumByColumn(h.value) }}</span>
                            </td>
                        </tr>
                    </template>
                </v-data-table>
    
                <v-divider v-if="sumFormat && typeof sumFormat === 'string'"></v-divider>
                <v-card-actions v-if="sumFormat && typeof sumFormat === 'string'">
                    <v-spacer></v-spacer><span class="title font-weight-light">{{sumText}}</span>
                </v-card-actions>
                <f-dialog v-model="editDialog" v-bind="updateFormAttr" :data.sync="editData" :data-out.sync="vueData[dataOut]" :title="formTitle" :button="updateButton" :controls="updateForm"></f-dialog>
            </v-card>
            `;
        //----------------------------------------------------------------------       

        return {
            editDialog: false,
            search: '',
            searchOpen: false,
            itemselected: [],
            returnValue: [],
            editData: {},
            editedIndex: -1,
            fillHeight: 0,
            autoHeaders: this.headers ? null : this.buildAutoHeaders(this.items || []),
            updateButton: [
                {
                    "v-if": "title=='Cập nhật'",
                    label: "Lưu",
                    getoutdata: true,
                    action: () => {
                        this.save(this.editAPI());
                    }
                },
                {
                    "v-if": "title=='Thêm mới'",
                    label: "Thêm mới",
                    getoutdata: true,
                    action: () => {
                        this.addnew(this.newAPI())
                    }
                }
            ],
            newAction: function () {
                if (this.updateApi) return this.updateApi['new-action']
                else return null;
            },
            newAPI: function () {
                if (this.updateApi) return this.updateApi.new;
                else return null;
            },
            editAction: function () {
                if (this.updateApi) return this.updateApi['edit-action']
                else return null;
            },
            editAPI: function () {
                if (this.updateApi) return this.updateApi.edit;
                else return null;
            },
            deleteAPI: function () {
                if (this.updateApi) return this.updateApi.delete;
                else return null;
            },
            defaultItem: function () {
                if (this.updateApi) {
                    if (typeof this.updateApi['default-item'] === 'undefined') return {};
                    var dataItem = {}
                    mapData(this.updateApi['default-item'], dataItem, vueData);
                    return dataItem;
                }
                else return {};
            },
        }
    },
    mounted: function () {
        this.editData = Object.assign({}, this.defaultItem())
        this.editedIndex = -1
        this.itemSelectRebuild(this.value);

        if (this.heightNum !== null && this.heightNum <= 0) {
            this.updateFillHeight();
            this.resizeHandler = this.updateFillHeight.bind(this);
            window.addEventListener('resize', this.resizeHandler);
        }
    },
    beforeDestroy: function () { this.removeResize(); },
    beforeUnmount: function () { this.removeResize(); },
    watch: {
        editDialog(val) {
            if (!val) {
                _.forEach(this.editData, (v, k) => {
                    this.editData[k] = undefined;
                });
                this.editedIndex = -1
            } else {
                this.editData.dialogModel = (this.edit ? 'edit' : 'new')
            }
        },
        value(newVal, oldVal,) {
            t = this;
            if (t.returnValue != newVal) this.itemSelectRebuild(newVal);
        },
        items(newVal) {
            if (!this.headers) this.autoHeaders = this.buildAutoHeaders(newVal || []);
            if (this.resizeHandler) this.updateFillHeight();
        }
    },
    computed: {
        // null = không khai height → bảng tự giãn theo số dòng (mặc định của v-data-table)
        heightNum() {
            if (this.height === undefined || this.height === null || this.height === '') return null;
            var n = Number(this.height);
            return isNaN(n) ? null : n;
        },
        tableHeight() {
            if (this.heightNum === null) return undefined;
            if (this.heightNum > 0) return this.heightNum;
            return this.fillHeight || undefined;
        },
        tableFixedHeader() {
            if (this.fixedHeader !== undefined) return this.fixedHeader;
            return this.tableHeight ? true : undefined;
        },
        headerCols() {
            var h = this.headers || this.autoHeaders;
            if (_.isBoolean(this.disabledUpdate) && this.disabledUpdate) {
                _.remove(h, function (n) {
                    return n.value == 'ctrl-update';
                });
            };

            return h;
        },
        _hideDefaultFooter() {
            if (this.items) {
                if (this.itemsPerPage > 0 && this.itemsPerPage < this.items.length) return false;
            }
            if (this.hideDefaultFooter) return this.hideDefaultFooter;
            return false;
        },
        edit() {
            return this.editedIndex >= 0;
        },
        formTitle() {
            return this.edit ? 'Cập nhật' : 'Thêm mới';
        },
        dataOut() {
            if (this.updateApi) return this.updateApi['data-out']
            else return null;
        },
        sumText() {
            var items = this.items;
            return _.replace(this.sumFormat, /\[\[(.*?)\]\]/gm, function (s, key) {
                return numeral(_.sumBy(items, key)).format('0,0');
            });
        }
    },
    methods: {
        removeResize() {
            if (this.resizeHandler) {
                window.removeEventListener('resize', this.resizeHandler);
                this.resizeHandler = null;
            }
        },
        updateFillHeight() {
            var t = this;
            t.$nextTick(function () {
                requestAnimationFrame(function () {
                    var root = t.$refs.myTable && t.$refs.myTable.$el;
                    if (!root) return;
                    var wrapper = root.querySelector('.v-data-table__wrapper');
                    if (!wrapper) return;
                    var rootRect = root.getBoundingClientRect();
                    var wrapRect = wrapper.getBoundingClientRect();
                    // phần nằm dưới vùng cuộn (footer phân trang, dòng tổng, viền card)
                    var below = Math.max(0, rootRect.bottom - wrapRect.bottom);
                    var margin = Math.abs(t.heightNum);
                    t.fillHeight = Math.max(150, window.innerHeight - wrapRect.top - below - margin);
                });
            });
        },
        buildAutoHeaders(items) {
            var arrHeaders = buildHeader(items);
            var hasEditOrDelete = this.updateApi && (this.updateApi.edit || this.updateApi.delete);
            if (arrHeaders.length > 0 && hasEditOrDelete && !this.disabledUpdate) {
                arrHeaders.push({ "text": "", "value": "ctrl-update", "divider": true });
            }
            return arrHeaders;
        },
        sumByColumn(key) {
            return numeral(_.sumBy(this.items, key)).format(this.sumFormat[key]);
        },
        toggleSearch() {
            this.searchOpen = !this.searchOpen;
            if (this.searchOpen) {
                var t = this;
                this.$nextTick(function () {
                    t.$refs.searchField && t.$refs.searchField.focus();
                });
            }
        },
        onSearchBlur() {
            if (!this.search) this.searchOpen = false;
        },
        itemSelect() {
            var t = this;

            setTimeout(function () {
                if (!t.returnObject) t.returnValue = _.map(t.itemselected, t.itemKey);
                else t.returnValue = t.itemselected;

                t.$emit('input', t.returnValue);
            }, 10);
        },

        itemSelectRebuild(newVal) {
            var t = this;
            if (t.returnObject) t.itemselected = newVal;
            else {
                t.itemselected = [];

                _.forEach(newVal, function (val) {
                    t.itemselected.push(_.find(t.items, [t.itemKey, val]));
                });
            }
        },
        newBtnClick() {
            if (this.newAction()) runAction(this.newAction());
            if (this.newAPI()) {
                Object.assign(this.editData, this.defaultItem());
                this.editDialog = true;
            }
        },
        editItem(item) {

            if (this.editAction()) runAction(this.editAction(), { item: item });

            if (this.editAPI()) {
                this.editedIndex = this.items.indexOf(item);
                Object.assign(this.editData, this.defaultItem());
                this.editData = Object.assign({}, item);
                this.editDialog = true;
            }
        },

        deleteItem(item, deleteAPI) {
            const items = this.items;
            var actionAPI = deleteAPI;
            var indexDelete = items.indexOf(item)
            confirm({
                title: (actionAPI.CONFIRM ? bindDataToString(actionAPI.CONFIRM, _.assignIn({ $row: item, item: item }, vueData)) : "Bạn có chắc chắn muốn xoá ?"),
                action: function () {
                    vueAction(actionAPI, { $row: item, item: item }, function () {
                        items.splice(indexDelete, 1);
                    });
                }
            });
        },

        save(actionAPI) {
            var diaCtl = this;
            if (diaCtl.editedIndex > -1) {
                if (actionAPI) {
                    if (actionAPI.CONFIRM) {
                        confirm({
                            title: bindDataToString(actionAPI.CONFIRM, _.assignIn({ $row: diaCtl.editData, item: diaCtl.editData }, vueData)),
                            action: function () {
                                vueAction(actionAPI, { $row: diaCtl.editData, item: diaCtl.editData }, function (d) {
                                    if (!d.Message) {
                                        if (_.isArray(d.data)) {
                                            if (d.data[0]) {
                                                _.forEach(d.data[0], function (value, key) {
                                                    diaCtl.editData[key] = value;
                                                });
                                            }
                                        }
                                    }
                                    _.assignIn(diaCtl.items[diaCtl.editedIndex], diaCtl.editData);
                                    diaCtl.editDialog = false;
                                });
                            },
                            cancel: function () { }
                        });
                    } else {
                        vueAction(actionAPI, { $row: diaCtl.editData, item: diaCtl.editData }, function (d) {
                            if (!d.Message) {
                                if (_.isArray(d.data)) {
                                    if (d.data[0]) {
                                        _.forEach(d.data[0], function (value, key) {
                                            diaCtl.editData[key] = value;
                                        });
                                    }
                                }
                            }
                            _.assignIn(diaCtl.items[diaCtl.editedIndex], diaCtl.editData);
                            diaCtl.editDialog = false;
                        });
                    }
                } else {
                    _.assignIn(diaCtl.items[diaCtl.editedIndex], diaCtl.editData);
                    diaCtl.editDialog = false;
                }
            }
        },

        addnew(actionAPI) {
            var diaCtl = this;
            if (diaCtl.editedIndex == -1) {
                if (actionAPI) {
                    if (actionAPI.CONFIRM) {
                        confirm({
                            title: bindDataToString(actionAPI.CONFIRM, _.assignIn({ $row: diaCtl.editData, item: diaCtl.editData }, vueData)),
                            action: function () {
                                vueAction(actionAPI, { $row: diaCtl.editData, item: diaCtl.editData }, function (d) {
                                    if (d) {
                                        if (_.isArray(d.data)) {
                                            if (d.data[0]) {
                                                _.forEach(d.data[0], function (value, key) {
                                                    diaCtl.editData[key] = value;
                                                });
                                            }
                                        }
                                    }
                                    diaCtl.items.push(_.cloneDeep(diaCtl.editData));
                                    diaCtl.editDialog = false;
                                });
                            },
                            cancel: function () { }
                        });
                    } else {
                        vueAction(actionAPI, { $row: diaCtl.editData, item: diaCtl.editData }, function (d) {
                            if (d) {
                                if (_.isArray(d.data)) {
                                    if (d.data[0]) {
                                        _.forEach(d.data[0], function (value, key) {
                                            diaCtl.editData[key] = value;
                                        });
                                    }
                                }
                            }
                            diaCtl.items.push(_.cloneDeep(diaCtl.editData));
                            diaCtl.editDialog = false;
                        });
                    }
                } else {
                    diaCtl.items.push(_.cloneDeep(diaCtl.editData));
                    diaCtl.editDialog = false;
                }
            }
        },
        updateSearch: _.debounce(function (text) {
            this.search = text;
        }, 300),
        customSearch(value, search, item) {
            return Object.values(item).some(v => v && v.toString().toLowerCase().includes(search.toLowerCase()))
        },
        toExcel() {
            jsonToExcel({ data: this.items, filename: (this.label && this.label != '' ? this.label : 'tableFP') + '.xlsx' });
            Vue.$toast.success("Đã xuất Excel", { position: 'top' });
        },
    }
});
//===========================================================================================
//===========================================================================================
//===========================================================================================

Vue.component('t-html', {
    template: `<div class="my-3" v-bind="$attrs" v-html="$attrs['value']"></div>`,
});
//-----------------------------------------------------------------------------------------------------------
Vue.component('t-label', {
    template: `<div class="text-no-wrap" v-bind="$attrs">{{$attrs['value']}}</div>`,
});
//-----------------------------------------------------------------------------------------------------------
Vue.component('t-num', {
    props: {
        value: {
            type: Number,
            default: 0
        },
        hidezero: {
            type: Boolean,
            default: true
        },
        format: {
            type: String,
            default: ''
        }
    },
    template: `<div v-if="!_.isNull(value) && !(hidezero && value==0)" class="text-no-wrap text-end" v-bind="$attrs">{{ format != ''? numeral(value).format(format) : Number.isInteger(value)?numeral(value).format('0,0'): numeral(value).format('0,0.0') }}</div>`,
});
//-----------------------------------------------------------------------------------------------------------
Vue.component('t-time', {
    props: {
        format: {
            type: String,
            default: 'DD/MM/YYYY'
        }
    },
    template: `<div v-if="$attrs['value']" class="text-no-wrap" v-bind="$attrs">{{ moment($attrs['value']).format(format) }}</div>`,
});
//-----------------------------------------------------------------------------------------------------------
Vue.component('t-boolean', {
    props: {
        value: {
            default: null
        },
        colorTrue: {
            default: "primary"
        },
        colorFalse: {
            default: "red"
        },
        iconTrue: {
            default: "mdi-check"
        },
        iconFalse: {
            default: "mdi-close"
        },
    },
    template: `<v-icon v-bind="$attrs" :color="value?colorTrue:colorFalse">{{value?iconTrue:iconFalse}}</v-icon>`,
});
//-----------------------------------------------------------------------------------------------------------
Vue.component('t-check', {
    props: {
        value: {
            default: null
        },
        falseValue: {
            default: false
        }
    },
    template: `<v-checkbox v-model="ctlValue" v-bind="$attrs" :false-value="falseValue" hide-details class="d-inline-flex ma-1 pa-1" v-on:change="onchange($event)" />`,
    data: function () {
        return {
            ctlValue: this.value
        }
    },
    watch: {
        value(newVal) {
            this.ctlValue = newVal
        }
    },
    methods: {
        onchange: function (e) {
            if (!e) this.ctlValue = false;
            tableActionEvent(this);
        }
    }
});
//-----------------------------------------------------------------------------------------------------------
Vue.component('t-text', {
    props: ['value'],
    template: `<v-text-field v-model="ctlValue" v-bind="$attrs" v-on:change="onchange($event)" dense outlined hide-details/>`,
    data: function () {
        return {
            ctlValue: this.value
        }
    },
    watch: {
        value(newVal) {
            this.ctlValue = newVal
        }
    },
    methods: {
        onchange: function (e) {
            console.log(e)
            tableActionEvent(this);
        }
    }
});

//-----------------------------------------------------------------------------------------------------------
Vue.component('t-select', {
    props: ['value'],
    template: `<v-select v-model="ctlValue" v-bind="$attrs" v-on:change="onchange($event)" dense hide-details append-icon="mdi-menu-swap"/>`,
    data: function () {
        return {
            ctlValue: this.value
        }
    },
    watch: {
        value(newVal) {
            this.ctlValue = newVal
        }
    },
    methods: {
        onchange: function (e) {
            console.log(e)
            tableActionEvent(this);
        }
    }
});
//-----------------------------------------------------------------------------------------------------------
Vue.component('t-combobox', {
    props: {
        value: {
            default: undefined
        },
        text: {
            default: undefined
        },
        items: {
            type: Array,
            default: []
        },
        api: {
            type: String,
            default: undefined
        },
        apiData: {
            type: Object,
            default: {}
        },

    },
    template: `<v-autocomplete refs="abc" v-model="ctlValue" v-bind="$attrs" :loading="loading" :items="dataItems" :search-input.sync="search" v-on:change="onchange($event)" hide-details dense></v-autocomplete>`,
    data: function () {
        return {
            dataItems: this.items,
            ctlValue: this.value,
            loading: false,
            search: null,
            getDataFormAPI: _.debounce((str) => {
                if ((this.search && this.search.length < 2) || !this.api) return;
                var self = this;
                this.loading = true

                if (typeof this.apiData != 'object') this.apiData = JSON.parse(this.apiData);

                mapData(this.apiData, this.apiData, _.assignIn({}, vueData, { TEXT: this.search }));

                console.log("API-CALL: ", this.api)
                ajaxCALL(this.api, this.apiData, function (d) {
                    if (_.isArray(d.data)) self.dataItems = d.data;
                    else self.dataItems = d;

                    self.loading = false
                }, function (e) {
                    console.log("API Error", e);
                })

            }, 500)
        }
    },
    watch: {
        search(newval, oldval) {
            newval && oldval && this.querySelections(newval)
        },
        items(val) {
            this.dataItems = val
        },
        value(newVal) {
            this.ctlValue = newVal
        }
    },
    methods: {
        querySelections(val) {
            this.getDataFormAPI(val);
        },
        onchange: function (e) {
            if (e) tableActionEvent(this);
        }
    },
});
//-----------------------------------------------------------------------------------------------------------
Vue.component('t-menu', {
    props: {
        iconText: {
            default: 'mdi-menu'
        },
        items: {
            default: []
        }
    },
    template: `
             <v-menu offset-y origin="center center" transition="slide-y-transition" max-height = 500>
                <template v-slot:activator="{ on }">                
                    <v-icon v-on="on">{{iconText}}</v-icon>
                </template>
                <v-list >
                    <v-list-item v-bind="$attrs" v-for="(item, index) in items" :key="index" @click="onSelect(item)" >
                        <v-list-item-icon v-if="item['icon-text']" class="mr-3">
                            <v-icon :color="item.color">{{item['icon-text']}}</v-icon>
                        </v-list-item-icon>
                        <v-list-item-content class="mr-2">
                            <v-list-item-title v-text="item.text"></v-list-item-title>
                        </v-list-item-content>
                    </v-list-item>
                </v-list>
            </v-menu> 
        `,
    data: function () {
        return {
        }
    },
    methods: {
        onSelect: function (e) {
            this.$attrs['action'] = e['action'];
            tableActionEvent(this);
        }
    }
});
//-----------------------------------------------------------------------------------------------------------
Vue.component('t-link', {
    props: ['id', 'target', 'url', 'title', 'onclose'],
    template: `<a :href="_url" :target="target" v-bind="$attrs" @click="onclick()"><v-icon v-if="$attrs['icon-text']" left color="primary">{{$attrs['icon-text']}}</v-icon> {{ $attrs['value']}}</a>`,
    computed: {
        _url: function () {
            if (this.target != 'dialog' && this.url) return this.url;
            return null;
        },
    },
    methods: {
        onclick: function (e) {
            if (this.target == 'dialog') {
                tableActionEvent(this);
                openWindow({
                    id: this.id,
                    title: this.title,
                    url: this.url,
                    onclose: this.onclose,
                });
            }
        }
    }
});
//-----------------------------------------------------------------------------------------------------------
Vue.component('t-button', {
    props: {
        text: {
            default: true
        },
        color: {
            default: "primary"
        },
        label: {
            default: null
        },
        iconText: {
            default: null
        },
        target: {
            default: null
        },
        wid: {
            default: null
        },
        url: {
            default: null
        },
        title: {
            default: null
        },
        onclose: {
            default: null
        },
        quset: {
            default: []
        },
    },
    template: `
            <v-btn class="custom-transform-class text-none" v-bind="$attrs" :text="text" :color="color" :target="target" :href="_url" @click="clickButton()">
                <v-icon v-if="iconText" :left="label" class="ml-0">{{iconText}}</v-icon>{{label}}
            </v-btn>`,
    computed: {
        _url: function () {
            if (this.target != 'dialog' && this.url) return this.url;
            return null;
        },
    },
    methods: {
        clickButton: function (e) {
            if (this.target == 'dialog') {
                console.log("dialog onclose", this.onclose)
                openWindow({
                    id: this.wid,
                    title: this.title,
                    url: this.url,
                    onclose: this.onclose
                });
            } else tableActionEvent(this);
        }
    }
});
//=============================================================================================
//=============================================================================================
//=============================================================================================
Vue.component('f-sheet', {
    template: `<div class="f-sheet-root"> <div class="d-flex align-center mb-2"> <span v-if="label" class="subtitle-1 font-weight-bold primary--text">{{ label }}</span> <v-spacer></v-spacer> <span v-if="changedCount > 0" class="caption orange--text mr-3">{{ changedCount }} dòng thay đổi</span> <v-btn v-if="allowDelete && selectedRows.length > 0" icon outlined color="error" class="mr-2" title="Xoá dòng đã chọn" @click="deleteSelected"> <v-icon>mdi-delete</v-icon> </v-btn> <v-btn v-if="allowAdd" icon outlined color="primary" class="mr-2" title="Thêm dòng" @click="addRow"> <v-icon>mdi-plus</v-icon> </v-btn> <v-btn v-if="changedCount > 0" icon outlined color="success" :loading="saving" :disabled="!updateApi" class="mr-2" title="Lưu thay đổi" @click="saveAll"> <v-icon>mdi-content-save</v-icon> </v-btn> <v-btn v-if="changedCount > 0" icon outlined class="mr-2" title="Huỷ thay đổi" @click="discardAll"> <v-icon>mdi-close</v-icon> </v-btn> <v-btn icon color="primary" title="Xuất Excel" @click="exportExcel"> <v-icon>mdi-microsoft-excel</v-icon> </v-btn> </div> <div ref="gridEl" class="ag-theme-alpine" :style="gridStyle"></div> </div>`, props: {
    label: {}, columns: {}, items: {}, rowKey: {},
    height: {},
    allowAdd: {}, allowDelete: {}, readonly: {},
    updateApi: {}, saveExtra: {}, defaultItem: {}, deleteApi: {}
  },
    data: function () {
      return {
        gridApi: null,
        changedRows: {},
        selectedRows: [],
        saving: false,
        localCounter: 0,
        fillHeight: 0
      }
    },
    computed: {
      changedCount: function () {
        return Object.keys(this.changedRows).length
      },
      // null = không khai height → lưới tự giãn theo số dòng (domLayout 'autoHeight')
      heightNum: function () {
        if (this.height === undefined || this.height === null || this.height === '') return null
        var n = Number(this.height)
        return isNaN(n) ? null : n
      },
      gridStyle: function () {
        if (this.heightNum === null) return { width: '100%' }
        var h = (this.heightNum > 0) ? this.heightNum : this.fillHeight
        if (!h) return { width: '100%' }
        return { height: h + 'px', width: '100%' }
      }
    },
    watch: {
      items: function (val) {
        if (this.gridApi) {
          this.buildOriginalData(val)
          if (!this.columns || !this.columns.length) {
            this.gridApi.setGridOption('columnDefs', this.buildColDefs(null))
          }
          this.gridApi.setGridOption('rowData', val || [])
          this.changedRows = {}
          this.selectedRows = []
          this.localCounter = 0
        }
      },
      columns: function (val) {
        if (this.gridApi) {
          this.gridApi.setGridOption('columnDefs', this.buildColDefs(val))
        }
      }
    },
    mounted: function () {
      this.initGrid()
      if (this.heightNum !== null && this.heightNum <= 0) {
        this.updateFillHeight()
        this.resizeHandler = this.updateFillHeight.bind(this)
        window.addEventListener('resize', this.resizeHandler)
      }
    },
    beforeDestroy: function () { this.destroyGrid() },
    beforeUnmount: function () { this.destroyGrid() },
    methods: {
      destroyGrid: function () {
        if (this.resizeHandler) {
          window.removeEventListener('resize', this.resizeHandler)
          this.resizeHandler = null
        }
        if (this.pasteHandler && this.$refs.gridEl) {
          this.$refs.gridEl.removeEventListener('paste', this.pasteHandler)
        }
        if (this.gridApi) {
          this.gridApi.destroy()
          this.gridApi = null
        }
      },
      updateFillHeight: function () {
        var self = this
        self.$nextTick(function () {
          requestAnimationFrame(function () {
            var el = self.$refs.gridEl
            if (!el) return
            var top = el.getBoundingClientRect().top
            var bottomMargin = Math.abs(self.heightNum)
            self.fillHeight = Math.max(200, window.innerHeight - top - bottomMargin)
          })
        })
      },
      buildOriginalData: function (rows) {
        var keyField = this.rowKey || 'id'
        this.originalData = {}
        this.originalRows = (rows || []).map(function (row) {
          var copy = Object.assign({}, row)
          var key = row[keyField]
          if (key !== undefined && key !== null) {
            this.originalData[String(key)] = copy
          }
          return copy
        }, this)
      },
      autoColDefs: function () {
        var sample = this.items && this.items[0]
        if (!sample) return []
        return Object.keys(sample).map(function (key) {
          return { field: key, headerName: key }
        })
      },
      changeCellStyle: function (params) {
        var self = this
        var keyField = self.rowKey || 'id'
        var field = params.colDef.field
        if (!field) return null
        var key = params.data && params.data[keyField]
        if (key === undefined || key === null) return null
        if (typeof key === 'number' && key < 0) {
          return { backgroundColor: '#e8f5e9' }
        }
        var orig = self.originalData && self.originalData[String(key)]
        if (orig && orig.hasOwnProperty(field) && params.value !== orig[field]) {
          return { backgroundColor: '#fff8e1' }
        }
        return null
      },
      parseByType: function (type, val) {
        if (type === 'number') {
          if (val === '' || val === null || val === undefined) return null
          if (typeof val === 'number') return val
          var num = Number(val)
          return isNaN(num) ? null : num
        }
        return val
      },
      buildColDefs: function (cols) {
        var self = this
        var source = (cols && cols.length) ? cols : self.autoColDefs()
        var defs = []
  
        if (self.allowDelete && !self.readonly) {
          defs.push({
            headerName: '',
            checkboxSelection: true,
            headerCheckboxSelection: true,
            width: 44,
            minWidth: 44,
            maxWidth: 44,
            sortable: false,
            filter: false,
            resizable: false,
            editable: false,
            pinned: 'left',
            cellClass: 'fsheet-cb-cell',
            headerClass: 'fsheet-cb-header'
          })
        }
  
        source.forEach(function (col) {
          var def = Object.assign({}, col)
          if (self.readonly) def.editable = false
          if (def.cellEditor === 'fsheetDate' && !def.valueFormatter) {
            def.valueFormatter = function (params) {
              return params.value ? String(params.value).substring(0, 10) : ''
            }
          }
          var userCellStyle = def.cellStyle
          var isNumber = def.type === 'number'
          def.cellStyle = function (params) {
            var change = self.changeCellStyle(params)
            var extra = (typeof userCellStyle === 'function') ? userCellStyle(params) : userCellStyle
            if (!extra && isNumber) extra = { textAlign: 'right' }
            if (change && extra) return Object.assign({}, extra, change)
            return change || extra || null
          }
          if (isNumber && !def.valueFormatter) {
            def.valueFormatter = function (params) {
              if (params.value === null || params.value === undefined || params.value === '') return ''
              var n = Number(params.value)
              if (isNaN(n)) return String(params.value)
              return n.toLocaleString('en-US', { maximumFractionDigits: 10 })
            }
          }
          if (isNumber && !def.valueParser) {
            def.valueParser = function (params) { return self.parseByType('number', params.newValue) }
          }
          defs.push(def)
        })
  
        return defs
      },
      initGrid: function () {
        var self = this
        var keyField = self.rowKey || 'id'
        self.buildOriginalData(self.items)
  
        self.pasteHandler = function (e) {
          e.preventDefault()
          var text = (e.clipboardData || window.clipboardData).getData('text')
          if (!text) return
          var focused = self.gridApi.getFocusedCell()
          if (!focused) return
  
          var rows = text.replace(/\r\n/g, '\n').replace(/\r/g, '\n').split('\n')
          while (rows.length && rows[rows.length - 1] === '') rows.pop()
  
          var allCols = self.gridApi.getAllDisplayedColumns()
          var dataCols = allCols.filter(function (col) {
            var f = col.getColDef().field
            return f && f !== '_del'
          })
          var startColIdx = dataCols.indexOf(focused.column)
          if (startColIdx < 0) return
  
          var startRow = focused.rowIndex
          rows.forEach(function (rowText, ri) {
            var cells = rowText.split('\t')
            var node = self.gridApi.getDisplayedRowAtIndex(startRow + ri)
            if (!node) return
            cells.forEach(function (val, ci) {
              var col = dataCols[startColIdx + ci]
              if (!col) return
              var def = col.getColDef()
              if (self.readonly || def.editable === false) return
              var field = def.field
              node.data[field] = self.parseByType(def.type, val)
              var key = node.data[keyField]
              if (key !== undefined && key !== null) {
                var next = {}
                for (var k in self.changedRows) {
                  if (Object.prototype.hasOwnProperty.call(self.changedRows, k)) next[k] = self.changedRows[k]
                }
                next[String(key)] = node.data
                self.changedRows = next
              }
              self.$emit('change', node.data, field, val)
            })
          })
          self.gridApi.refreshCells({ force: true })
        }
        self.$refs.gridEl.addEventListener('paste', self.pasteHandler)
  
        function FSheetDateEditor() { }
        FSheetDateEditor.prototype.init = function (params) {
          this._input = document.createElement('input')
          this._input.type = 'date'
          this._input.value = params.value ? String(params.value).substring(0, 10) : ''
          this._input.style.cssText = 'width:100%;height:100%;border:none;outline:none;padding:0 6px;font-family:inherit;font-size:inherit;background:transparent;box-sizing:border-box;'
          this._input.addEventListener('keydown', function (e) {
            if (e.key === 'Enter' || e.key === 'Tab') params.stopEditing()
            if (e.key === 'Escape') params.stopEditing(true)
          })
        }
        FSheetDateEditor.prototype.getGui = function () { return this._input }
        FSheetDateEditor.prototype.afterGuiAttached = function () {
          this._input.focus()
          if (this._input.showPicker) { try { this._input.showPicker() } catch (e) { } }
        }
        FSheetDateEditor.prototype.getValue = function () { return this._input.value || null }
        FSheetDateEditor.prototype.isPopup = function () { return false }
  
        self.gridApi = window.agGrid.createGrid(self.$refs.gridEl, {
          components: { fsheetDate: FSheetDateEditor },
          columnDefs: self.buildColDefs(self.columns),
          rowData: self.items || [],
          domLayout: (self.heightNum === null) ? 'autoHeight' : 'normal',
          columnTypes: {
            number: { filter: 'agNumberColumnFilter' }
          },
          rowSelection: (self.allowDelete && !self.readonly) ? 'multiple' : undefined,
          suppressRowClickSelection: true,
          defaultColDef: {
            // AG Grid mặc định editable=false; f-sheet là lưới NHẬP LIỆU nên bật sẵn,
            // cột nào chỉ đọc thì khai editable:false trong colDef.
            editable: !self.readonly,
            sortable: true,
            filter: true,
            resizable: true,
            flex: 1,
            minWidth: 80
          },
          rowHeight: 36,
          headerHeight: 36,
          animateRows: true,
          stopEditingWhenCellsLoseFocus: true,
          onSelectionChanged: function () {
            self.selectedRows = self.gridApi.getSelectedRows()
          },
          onCellValueChanged: function (params) {
            var field = params.colDef.field
            if (field && params.colDef.type === 'number') {
              var coerced = self.parseByType('number', params.newValue)
              if (coerced !== params.newValue) {
                params.data[field] = coerced
                params.newValue = coerced
              }
            }
            var key = params.data[keyField]
            if (key !== undefined && key !== null) {
              var next = {}
              for (var k in self.changedRows) {
                if (Object.prototype.hasOwnProperty.call(self.changedRows, k)) next[k] = self.changedRows[k]
              }
              next[String(key)] = params.data
              self.changedRows = next
            }
            self.gridApi.refreshCells({ force: true })
            self.$emit('change', params.data, params.colDef.field, params.newValue)
          }
        })
      },
      getChangedList: function () {
        var rows = []
        for (var k in this.changedRows) {
          if (Object.prototype.hasOwnProperty.call(this.changedRows, k)) rows.push(this.changedRows[k])
        }
        return rows
      },
      addRow: function () {
        if (!this.gridApi) return
        this.localCounter--
        var newRow = {}
        mapData(this.defaultItem || {}, newRow, vueData)
        newRow[this.rowKey || 'id'] = this.localCounter
        this.gridApi.applyTransaction({ add: [newRow], addIndex: 0 })
        var next = {}
        for (var k in this.changedRows) {
          if (Object.prototype.hasOwnProperty.call(this.changedRows, k)) next[k] = this.changedRows[k]
        }
        next[String(this.localCounter)] = newRow
        this.changedRows = next
        this.gridApi.refreshCells({ force: true })
      },
      deleteRow: function (row) {
        var self = this
        var keyField = self.rowKey || 'id'
        var key = row[keyField]
        var isNew = typeof key === 'number' && key < 0
  
        function removeFromGrid() {
          self.gridApi.applyTransaction({ remove: [row] })
          var next = {}
          for (var k in self.changedRows) {
            if (Object.prototype.hasOwnProperty.call(self.changedRows, k) && k !== String(key)) next[k] = self.changedRows[k]
          }
          self.changedRows = next
          if (self.originalData) delete self.originalData[String(key)]
        }
  
        if (isNew) { removeFromGrid(); return }
        if (!self.deleteApi) { removeFromGrid(); return }
        var extra = {}
        mapData(self.saveExtra || {}, extra, vueData)
        ajaxCALL(self.deleteApi, Object.assign({}, extra, row), function (res) {
          var r = res && res.data && res.data[0] ? res.data[0] : null
          if (r && r.Message) {
            if (r.Success) { Vue.$toast.success(r.Message, { position: 'top' }); removeFromGrid() }
            else Vue.$toast.error(r.Message, { position: 'top' })
          } else {
            removeFromGrid()
          }
        }, function () {
          Vue.$toast.error('Lỗi khi xoá dữ liệu', { position: 'top' })
        })
      },
      deleteSelected: function () {
        var self = this
        var rows = self.selectedRows.slice()
        if (!rows.length) return
        var hasApi = self.deleteApi
        var newRows = rows.filter(function (r) {
          return typeof r[self.rowKey || 'id'] === 'number' && r[self.rowKey || 'id'] < 0
        })
        var existRows = rows.filter(function (r) {
          return !(typeof r[self.rowKey || 'id'] === 'number' && r[self.rowKey || 'id'] < 0)
        })
  
        newRows.forEach(function (r) { self.deleteRow(r) })
  
        if (!existRows.length) return
        if (hasApi) {
          confirm({
            title: 'Xoá dữ liệu',
            message: 'Xoá ' + existRows.length + ' dòng đã chọn?',
            action: function () {
              existRows.forEach(function (r) { self.deleteRow(r) })
              self.selectedRows = []
            }
          })
        } else {
          existRows.forEach(function (r) { self.deleteRow(r) })
          self.selectedRows = []
        }
      },
      saveAll: function () {
        var self = this
        var keyField = self.rowKey || 'id'
        var rows = self.getChangedList()
        self.$emit('save', rows)
        if (!self.updateApi || rows.length === 0) return
        self.saving = true
        var pending = rows.length
        var hasError = false
  
        rows.forEach(function (row) {
          var extra = {}
          mapData(self.saveExtra || {}, extra, vueData)
          var payload = Object.assign({}, extra, row)
          if (typeof payload[keyField] === 'number' && payload[keyField] < 0) payload[keyField] = 0
          ajaxCALL(self.updateApi, payload, function (res) {
            pending--
            var r = res && res.data && res.data[0] ? res.data[0] : null
            if (r && r.Message) {
              if (r.Success) Vue.$toast.success(r.Message, { position: 'top' })
              else { Vue.$toast.error(r.Message, { position: 'top' }); hasError = true }
            }
            if (pending === 0) {
              self.saving = false
              if (!hasError) {
                var current = []
                self.gridApi.forEachNode(function (node) {
                  current.push(Object.assign({}, node.data))
                })
                self.buildOriginalData(current)
                self.gridApi.setGridOption('rowData', current)
                self.changedRows = {}
                self.localCounter = 0
                self.$emit('saved')
              }
            }
          }, function () {
            pending--
            hasError = true
            Vue.$toast.error('Lỗi khi lưu dữ liệu', { position: 'top' })
            if (pending === 0) self.saving = false
          })
        })
      },
      discardAll: function () {
        this.changedRows = {}
        this.localCounter = 0
        this.selectedRows = []
        if (this.gridApi) {
          var restored = (this.originalRows || []).map(function (r) { return Object.assign({}, r) })
          this.gridApi.setGridOption('rowData', restored)
          this.gridApi.refreshCells({ force: true })
        }
      },
      refresh: function () {
        if (this.gridApi) {
          this.buildOriginalData(this.items)
          this.gridApi.setGridOption('rowData', this.items || [])
          this.changedRows = {}
          this.selectedRows = []
          this.localCounter = 0
        }
      },
      getChangedRows: function () {
        return this.getChangedList()
      },
      exportExcel: function () {
        var self = this
        var cols = self.gridApi.getAllDisplayedColumns().filter(function (col) {
          var f = col.getColDef().field
          return f && f !== '_del'
        })
        var rows = []
        self.gridApi.forEachNode(function (node) {
          var row = {}
          cols.forEach(function (col) {
            var def = col.getColDef()
            row[def.headerName || def.field] = node.data[def.field]
          })
          rows.push(row)
        })
        jsonToExcel({
          data: rows,
          filename: self.label || 'export',
          worksheet: self.label || 'Sheet1'
        })
      }
    }
  });