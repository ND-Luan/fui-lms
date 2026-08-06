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
            vueData: vueData,
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
//=============================================================================================
//=============================================================================================
//=============================================================================================
Vue.component('FSheet', {
    template: `<div class="f-sheet-root"> <div class="d-flex align-center mb-2"> <span v-if="label" class="text-subtitle-1 font-weight-bold text-primary">{{ label }}</span> <v-spacer></v-spacer> <span v-if="changedCount > 0" class="text-caption text-orange mr-3">{{ changedCount }} dòng thay đổi</span> <v-btn v-if="allowDelete && selectedRows.length > 0" icon density="comfortable" variant="outlined" color="error" class="mr-2" title="Xoá dòng đã chọn" @click="deleteSelected"> <v-icon>mdi-delete</v-icon> </v-btn> <v-btn v-if="allowAdd" icon density="comfortable" variant="outlined" color="primary" class="mr-2" title="Thêm dòng" @click="addRow"> <v-icon>mdi-plus</v-icon> </v-btn> <v-btn v-if="changedCount > 0" icon density="comfortable" variant="outlined" color="success" :loading="saving" :disabled="!updateApi" class="mr-2" title="Lưu thay đổi" @click="saveAll"> <v-icon>mdi-content-save</v-icon> </v-btn> <v-btn v-if="changedCount > 0" icon density="comfortable" variant="outlined" class="mr-2" title="Huỷ thay đổi" @click="discardAll"> <v-icon>mdi-close</v-icon> </v-btn> <v-btn icon density="comfortable" color="primary" title="Xuất Excel" @click="exportExcel"> <v-icon>mdi-microsoft-excel</v-icon> </v-btn> </div> <div ref="gridEl" class="ag-theme-alpine" :style="gridStyle"></div> </div>`, props: {
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