//===========================================================================================
Vue.component("FTableItemComponent", {
    template: `<component :is="dynamicComponent"></component>`,
    props: {
        template: {
            required: true
        },
        data: {
            type: Object,
            default: () => ({}),
        },
    },
    data() {
        return {
        }
    },
    computed: {
        dynamicComponent() {
            return {
                template: this.buildTemplateString(this.template),
                data: () => { return this.data },
            }
        },
    },
    methods: {
        buildTemplateString(jObj) {
            if (Array.isArray(jObj)) {
                var templateString = '';
                jObj.forEach((o) => {
                    templateString = templateString + this.buildTemplateString(o)
                });
                return templateString;
            }

            if (typeof jObj === 'object') {
                if (!jObj.attr) jObj.attr = {}
                jObj.attr[":item"] = "item"
                let d = $(`<${jObj.el}>`, this.fixAttrValueObject(jObj.attr)).append(this.buildTemplateString(jObj.innerHTML));
                return $('<div>').append(d).html();
            }
            if (typeof jObj === 'string') return jObj;
            return ""
        },
        fixAttrValueObject(jObj) {
            let returnObj = {}
            if (jObj) {
                for (const [key, value] of Object.entries(jObj)) {
                    if (typeof value === 'object') returnObj[key] = JSON.stringify(value);
                    else returnObj[key] = value;
                }
            }
            return returnObj
        }
    }
});
//===========================================================================================
Vue.component("FTable", {
    props: {
        modelValue: {
            default: null
        },
        headers: {
            default: null
        },
        updateForm: {
            default: null
        },
        updateApi: {
            default: null
        },
        items: {
            default: null
        },
        label: {
            default: null
        },
        sumFormat: {
            default: null
        },
        returnObject: {
            default: null
        },
        itemKey: {
            default: null
        },
        disabledUpdate: {
            default: null
        },
        template: {
            default: null
        },
        excel: {
            default: true
        },
        hover: {
            default: true
        },
        showSearch: {
            default: true
        },
        returnObject: {
            default: true
        },
        fixedHeader: {
            default: true
        },
        // null/bỏ trống = bảng tự giãn theo số dòng; <=0 = fill tới đáy màn hình chừa
        // abs(n) px (tự đo vị trí thật, theo dõi resize); >0 = px cố định.
        height: {
            default: null
        },
        disableSort: {
            default: false
        },
        density: {
            default: 'compact'
        },
        hideDefaultFooter: {
            default: true
        },
        returnObject: {
            default: true
        },
        itemsPerPage: {
            default: 50
        },
        footerProps:
        {
            default: "{'items-per-page-options':[50, 100, 150, 200, -1]}"
        },
        updateFormAttr: {
            default: null
        },
        slots: {
            default: null
        },
        groupTemplate: {
            default: null
        },
    },
    template: `
            <v-card ref="myTable" variant="outlined" v-if="headersArray" class="border" style="text-align: initial;">
                <v-card-actions>
                    <div v-if="showSearch || label || ((newAPI() || newAction()) && !disabledUpdate)" class="text-primary text-darken-2 text-left w-66 pl-2 text-h6" v-html="label"></div>
                    <v-spacer></v-spacer>
                    <v-btn v-if="excel" class="mr-4" small icon density="compact" color="primary" @click="toExcel"><v-icon>mdi-microsoft-excel</v-icon></v-btn>
                    <div v-if="showSearch" class="d-flex align-center">
                        <v-btn icon density="compact" color="primary" @click="toggleSearch"><v-icon>mdi-magnify</v-icon></v-btn>
                        <v-expand-x-transition>
                            <v-text-field v-if="searchOpen" ref="searchField" density="compact" @update:modelValue="updateSearch" label="" variant="underlined" hide-details autofocus style="width: 300px;" @blur="onSearchBlur" class="ml-1"></v-text-field>
                        </v-expand-x-transition>
                    </div>
                    <v-btn v-if="(newAPI() || newAction()) && !disabledUpdate" class="ml-5 mr-2" density="compact" variant="outlined" icon="mdi-plus" color="primary" @click="newBtnClick"></v-btn>
                </v-card-actions>
                <v-data-table class="tTable" v-bind="$attrs" :height="tableHeight" :fixed-header="tableFixedHeader" :hover="hover" :items="items" :item-key="itemKey" :return-object="returnObject" :headers="headersArray" :density="density" :items-per-page="itemsPerPage" :hide-default-footer="hideDefaultFooter_cacl" v-model="itemselected" calculate-widths  v-on:click:row="$emit('click:row', $event)" v-on:item-selected="itemSelect()" v-on:toggle-select-all="itemSelect()" :search="search" :custom-filter="customSearch">
                    <template v-slot:headers="{ headers, isSorted, getSortIcon, toggleSort, allSelected, selectAll, someSelected, groupHeaders }">
                        <tr v-for="columns in headers">
                            <template v-for="column in columns" :key="column.key">
                                <th v-if="column.key=='data-table-select'" class="px-2" :colspan="column.colspan || 1" :rowspan="column.rowspan || 1">
                                    <v-checkbox-btn :indeterminate="someSelected && !allSelected" :model-value="allSelected" color="primary" @update:model-value="selectAll(!allSelected)" ></v-checkbox-btn>
                                </th>
                                <th v-else-if="column.key=='data-table-group'" v-bind="column.headerProps" :colspan="column.colspan || 1" :rowspan="column.rowspan || 1" style="width:40px" class="px-0 text-center">
                                    <VIcon icon="mdi-format-list-group" size="small"></VIcon>
                                </th>
                                <th v-else v-bind="column.headerProps" :colspan="column.colspan || 1" :rowspan="column.rowspan || 1">
                                    <div :class="['cursor-pointer', 'd-flex', 'justify-' + column.align]" @click="() => toggleSort(column)"><span v-html="column.title"></span><template v-if="isSorted(column)"><v-icon class="ml-1"  :icon="getSortIcon(column)"></v-icon></template></div>
                                </th>
                            </template>
                        </tr>
                    </template>

                    <template v-slot:group-header="{ item, columns, toggleGroup, isGroupOpen }">
                        <tr><td :colspan="columns.length" class="px-0">
                            <VBtn :icon="isGroupOpen(item) ? '$expand' : '$next'" size="small" variant="text" @click="toggleGroup(item)"></VBtn>
                            <FDynamicComponent :componentData="{template:groupTemplate,data: () => { return { vueData, ...this.$props, item, columns, toggleGroup, isGroupOpen } }}"/>
                        </td></tr>
                    </template>

                    <template v-for="(c, index) in headersArray.filter(i => !!i.el)" :key="index" v-slot:['item.'+c.key]="{item}">
                        <FTableItemComponent :template="c" :data="{item, vueData}" />
                    </template>

                    <template v-if="!disabledUpdate" v-slot:item.ctrl-update="{item}">
                        <div style="min-width: 70px;" v-if="item['ctrl-update'] != 0">
                            <v-btn v-if="deleteAPI()" @click="deleteItem(item, deleteAPI())" icon="mdi-trash-can-outline" size="small" color="red-darken-1" density="comfortable" variant="plain"></v-btn>
                            <v-btn v-if="editAPI() || editAction()" @click="editItem(item)" icon="mdi-square-edit-outline" size="small" color="green-darken-2" density="comfortable" variant="plain"></v-btn>
                        </div>
                    </template>

                    <template v-for="(sData, index) in slots" :key="'dynamic-slot-' + index" v-slot:[sData.name]="{item, columns}">
                        <FDynamicComponent :componentData="{template:sData.html,data: () => { return { vueData, ...this.$props, item, columns} }}"/>
                    </template>

                    <template v-if="sumFormat && typeof sumFormat === 'object'" v-slot:body.append="{ columns }">
                        <tr class="tTableSumRow">
                            <td v-for="col in columns" :key="'sum-' + col.key" class="text-right font-weight-medium">
                                <span v-if="sumFormat[col.key]">{{ sumByColumn(col.key) }}</span>
                            </td>
                        </tr>
                    </template>
                </v-data-table>

                <v-divider v-if="sumFormat && typeof sumFormat === 'string'"></v-divider>
                <v-card-actions v-if="sumFormat && typeof sumFormat === 'string'">
                    <v-spacer></v-spacer><span class="text-h6 font-weight-light">{{sumText}}</span>
                </v-card-actions>
                <f-dialog v-model="editDialog" v-model:data="editData"  v-bind="updateFormAttr" :title="formTitle" :button="updateButton" :controls="updateForm"></f-dialog>
            </v-card>
            `,
    data: function () {
        return {
            editDialog: false,
            search: '',
            searchOpen: false,
            fillHeight: 0,
            itemselected: [],
            returnValue: [],
            editData: {},
            editedIndex: -1,
            updateButton: [
                {
                    "v-if": "title=='Cập nhật'",
                    label: "Lưu",
                    type: "submit",
                    action: () => {
                        this.save(this.editAPI());
                    }
                },
                {
                    "v-if": "title=='Thêm mới'",
                    label: "Thêm mới",
                    type: "submit",
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
        this.itemSelectRebuild(this.modelValue);

        if (this.heightNum !== null && this.heightNum <= 0) {
            this.updateFillHeight();
            this.resizeHandler = this.updateFillHeight.bind(this);
            window.addEventListener('resize', this.resizeHandler);
        }
    },
    beforeUnmount: function () { this.removeResize(); },
    beforeDestroy: function () { this.removeResize(); },
    watch: {
        items() {
            if (this.resizeHandler) this.updateFillHeight();
        },
        editDialog(val) {
            if (!val) {
                _.forEach(this.editData, (v, k) => {
                    this.editData[k] = undefined;
                });
                this.editedIndex = -1
            } else {
                this.editData.dMode = (this.edit ? 'edit' : 'new')
            }
        },
        modelValue(newVal, oldVal,) {
            t = this;
            if (t.returnValue != newVal) this.itemSelectRebuild(newVal);
        },
    },
    computed: {
        bindAttr(attr, item) {
            var attrTmp = {}
            if (attr && attr['v-model']) attrTmp.modelvalue = eval(attr['v-model'])
            return attrTmp
        },
        headersArray() {
            var headersBuild = [];
            if (this.headers) {
                headersBuild = this.headerSetDefaultProps(bindData(this.headers));
            }
            else if (this.items.length > 0) headersBuild = this.buildHeaderData(this.items[0]);
            return headersBuild;
        },
        hideDefaultFooter_cacl() {
            if (this.items) {
                if (this.itemsPerPage > 0 && this.itemsPerPage < this.items.length) return false;
            }
            if (this.hideDefaultFooter) return this.hideDefaultFooter;
            return false;
        },
        // null = không khai height → bảng tự giãn theo số dòng
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
            return this.tableHeight ? this.fixedHeader : false;
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
        // Đo vị trí thật của vùng cuộn sau khi layout xong rồi fill tới đáy màn hình.
        // Footer phân trang / dòng tổng nằm NGOÀI wrapper nên phải trừ phần dưới đó ra.
        updateFillHeight() {
            var t = this;
            t.$nextTick(function () {
                requestAnimationFrame(function () {
                    var root = t.$refs.myTable && t.$refs.myTable.$el;
                    if (!root) return;
                    var wrapper = root.querySelector('.v-table__wrapper, .v-data-table__wrapper');
                    if (!wrapper) return;
                    var rootRect = root.getBoundingClientRect();
                    var wrapRect = wrapper.getBoundingClientRect();
                    var below = Math.max(0, rootRect.bottom - wrapRect.bottom);
                    var margin = Math.abs(t.heightNum);
                    t.fillHeight = Math.max(150, window.innerHeight - wrapRect.top - below - margin);
                });
            });
        },
        // NEW: sum theo từng cột, format riêng cho mỗi cột theo sumFormat[key] (dùng khi sumFormat là object)
        sumByColumn(key) {
            return numeral(_.sumBy(this.items, key)).format(this.sumFormat[key]);
        },
        itemSelect() {
            var t = this;

            setTimeout(function () {
                if (!t.returnObject) t.returnValue = _.map(t.itemselected, t.itemKey);
                else t.returnValue = t.itemselected;

                t.$emit('input', t.returnValue);
            }, 10);
        },
        isDateValid(dateStr) {
            return typeof dateStr == 'string' && !isNaN(new Date(dateStr));
        },
        toggleSearch() {
            this.searchOpen = !this.searchOpen;
            if (this.searchOpen) {
                this.$nextTick(() => {
                    this.$refs.searchField && this.$refs.searchField.focus();
                });
            }
        },
        onSearchBlur() {
            if (!this.search) this.searchOpen = false;
        },
        buildHeader(item_0) {
            var header = [];

            if (item_0) {
                _.forEach(item_0, (value, key) => {
                    if (_.isNumber(value)) header.push({ "el": "t-num", "title": key, "key": key, headerProps: { class: "divider" }, cellProps: { class: "divider" }, attr: { "v-model": "item." + key } });
                    else if (this.isDateValid(value)) header.push({ "el": "t-time", "title": key, "key": key, headerProps: { class: "divider" }, cellProps: { class: "divider" }, attr: { "v-model": "item." + key } });
                    else header.push({ "title": key, "key": key, headerProps: { class: "divider" }, cellProps: { class: "divider" }, });
                });
            }
            console.log("Build Header: ", header)
            return header;
        },
        buildHeaderData(item_0) {
            var arrHeaders = this.buildHeader(item_0);
            // NEW: chỉ tự thêm cột ctrl-update khi có khai báo edit hoặc delete API (đồng bộ với bản Vue 2)
            var hasEditOrDelete = this.updateApi && (this.updateApi.edit || this.updateApi.delete);
            if (arrHeaders.length > 0 && this.items && hasEditOrDelete && _.isBoolean(this.disabledUpdate) && !this.disabledUpdate) arrHeaders.push({ "title": "update", "key": "ctrl-update" });

            return arrHeaders;
        },
        headerSetDefaultProps(col) {
            _.forEach(col, (c) => {
                if (c.divider) {
                    if (c.headerProps) {
                        if (c.headerProps.class) c.headerProps.class = c.headerProps.class + ' divider'
                        else c.headerProps.class = "divider";
                    }
                    else c.headerProps = { class: "divider" }

                    if (c.cellProps) {
                        if (c.cellProps.class) c.cellProps.class = c.cellProps.class + ' divider'
                        else c.cellProps.class = "divider";
                    }
                    else c.cellProps = { class: "divider" }

                    if (c.children) c.children = this.headerSetDefaultProps(c.children);
                }
            });
            return col
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
                            content: '',
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
            return Object.values(item.columns).some(v=>v&&v.toString().toLowerCase().includes(search.toLowerCase()))
        },
        toExcel() {
            jsonToExcel({ data: this.items, filename: (this.label && this.label != '' ? this.label : 'tableFP') + '.xlsx' });
            Vue.$toast.success("Đã xuất Excel", { position: 'top' });
        },
    }
});

//===========================================================================================

Vue.component('THtml', {
    props: {
        modelValue: {
            default: null
        },
    },
    template: `<div class="my-2" v-bind="$attrs" v-html="modelValue"></div>`,
});
//-----------------------------------------------------------------------------------------------------------
Vue.component('TLabel', {
    props: {
        modelValue: {
            default: null
        },
    },
    template: `<div class="text-no-wrap" v-bind="$attrs">{{modelValue}}</div>`,
});
//-----------------------------------------------------------------------------------------------------------
Vue.component('TNum', {
    props: {
        modelValue: {
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
    template: `<div v-if="showData" class="text-no-wrap text-end" v-bind="$attrs">{{ format != ''? numeral(modelValue).format(format) : Number.isInteger(modelValue)?numeral(modelValue).format('0,0'): numeral(modelValue).format('0,0.0') }}</div>`,
    data: function () {
        return {
            numeral: numeral
        }
    },
    computed: {
        showData: function () {
            return !_.isNull(this.modelValue) && !(this.hidezero && this.modelValue == 0);
        },
    },
});
//-----------------------------------------------------------------------------------------------------------
Vue.component('TTime', {
    props: {
        format: {
            type: String,
            default: 'DD/MM/YYYY'
        }
    },
    template: `<div v-if="$attrs['modelValue']" class="text-no-wrap" v-bind="$attrs">{{ dayjs($attrs['modelValue']).format(format) }}</div>`,
    data: function () {
        return {
            dayjs: dayjs
        }
    },
});
//-----------------------------------------------------------------------------------------------------------
Vue.component('TCheck', {
    props: {
        modelValue: {
            default: null
        },
        falseValue: {
            default: false
        },
    },
    template: `<v-checkbox v-bind="$attrs" v-model="ctlValue" :false-value="falseValue" @change="onchange($event)" class="d-inline-flex" hide-details />`,
    data: function () {
        return {
            ctlValue: Boolean(this.modelValue)
        }
    },
    watch: {
        modelValue(newVal) {
            this.ctlValue = Boolean(newVal)
        },
    },
    methods: {
        onchange: function (e) {
            console.log("onchange", this)
            tableActionEvent(this.$attrs);
        }
    }
});
//-----------------------------------------------------------------------------------------------------------
Vue.component('TSelect', {
    props: ['modelValue'],
    template: `<v-select v-model="ctlValue" v-bind="$attrs" @update:modelValue="onchange" variant="plain" density="compact" hide-details menu-icon="mdi-menu-swap"></v-select>`,
    data: function () {
        return {
            ctlValue: this.modelValue
        }
    },
    watch: {
        modelValue(newVal) {
            this.ctlValue = newVal
        },
    },
    methods: {
        onchange: function (e) {
            tableActionEvent(this.$attrs);
        }
    }
});
//-----------------------------------------------------------------------------------------------------------
Vue.component('TCombobox', {
    props: {
        modelValue: {
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
    template: `<v-autocomplete v-model="ctlValue" v-bind="$attrs" @update:modelValue="onchange" :loading="loading" :items="dataItems" @update:search="querySelections" auto-select-first density="compact" hide-details></v-autocomplete>`,
    data: function () {
        return {
            dataItems: this.items,
            ctlValue: this.modelValue,
            loading: false,
            getDataFormAPI: _.debounce((searchText) => {
                if ((searchText && searchText.length < 2) || !this.api) return;
                var self = this;
                this.loading = true

                if (typeof this.apiData != 'object') this.apiData = JSON.parse(this.apiData);

                mapData(this.apiData, this.apiData, _.assignIn({}, vueData, { TEXT: searchText }));

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
        items(val) {
            this.dataItems = val
        },
        modelValue(newVal) {
            this.ctlValue = newVal
        }
    },
    methods: {
        querySelections(val) {
            if (!val) return false
            this.getDataFormAPI(val);
        },
        onchange: function (e) {
            if (e) tableActionEvent(this.$attrs);
        }
    },
});
//-----------------------------------------------------------------------------------------------------------
Vue.component('TMenu', {
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
                <template v-slot:activator="{ props }"><v-icon color="primary" v-bind="props" :icon="iconText"></v-icon></template>
                <v-list >
                    <v-list-item v-bind="$attrs" v-for="(item, index) in items" :key="index" @click="onSelect(item)" >
                        <template v-slot:prepend><v-icon :color="item.color" :icon="item['icon-text']"></v-icon></template>
                        <v-list-item-title v-text="item.text"></v-list-item-title>
                    </v-list-item>
                </v-list>
            </v-menu> 
        `,
    methods: {
        onSelect: function (e) {
            tableActionEvent({ action: e.action, ...this.$attrs });
        }
    }
});
//-----------------------------------------------------------------------------------------------------------
Vue.component('TLink', {
    props: ['id', 'target', 'url', 'title', 'onclose'],
    template: `<a :href="iURL" :target="target" v-bind="$attrs" @click="onclick()"><v-icon v-if="$attrs['icon-text']" left color="primary">{{$attrs['icon-text']}}</v-icon>{{$attrs['modelValue']}}</a>`,
    data: function () {
        return {}
    },
    computed: {
        iURL: function () {
            if (this.target != 'dialog' && this.url) return this.url;
            return null;
        },
    },
    methods: {
        onclick: function (e) {
            if (this.target == 'dialog') {
                tableActionEvent(this.$attrs);
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
Vue.component('TButton', {
    props: {      
        label: {
            default: null
        },
        variant: {
            default: "text"
        },
        color: {
            default: "primary"
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
        density: {
            default: 'compact'
        },
        onclose: {
            default: null
        },
    },
    template: `<v-btn v-bind="$attrs" :variant="variant" :text="label" :color="color" :density="density" @click="clickButton"></v-btn>`,
    methods: {
        clickButton: function (e) {
            if (this.url) {
                console.log("dialog onclose", this.onclose)
                openWindow({
                    id: this.wid,
                    title: this.title,
                    url: this.url,
                    onclose: this.onclose
                });
            } else tableActionEvent(this.$attrs);
        }
    }

});
