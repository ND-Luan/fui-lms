var vuetifyDefaultSetting = {
    global: {
        ripple: false, // Tắt hiệu ứng ripple trên toàn bộ ứng dụng
    },
    options: {
        customProperties: true, // Kích hoạt CSS Variables
        "--v-medium-emphasis-opacity": 1, // Kích hoạt CSS Variables
    },
    defaults: {
        VBtn: {
            variant: "outlined",
        },
        VTextField: {
            variant: "outlined",
            density: "compact",
            hideDetails: true,
        },
        VTextarea: {
            variant: "outlined",
            density: "compact",
            hideDetails: true,
        },
        VCombobox: {
            variant: "outlined",
            density: "compact",
            hideDetails: true,
            returnObject: false
        },
        VSelect: {
            variant: "outlined",
            density: "compact",
            hideDetails: true,
            returnObject: false,
        },
        VAutocomplete: {
            variant: "outlined",
            density: "compact",
            hideDetails: true,
            returnObject: false,
            autoSelectFirst: true
        },
        VCheckbox: {
            hideDetails: true,
            density: "compact"
        },
        VSwitch: {
            density: "compact",
            hideDetails: true,
        },
        VCard: {
        },
        VToolbar: {
            density: "compact",
        },
        VCardActions: {
            density: "compact",
        },
        VAlert: {
            density: "compact",
            hideDetails: true,
        },
        VDataTable: {
            density: "compact",
            showSearch: true,
        },
        VDateInput: {
            variant: "outlined",
            density: "compact",
            hideDetails: true,
        },
    }
}

var defaultControlAttr = {
    "v-text-field": {
        attr: {
            ":required": true,
            ":rules": "[v => (!!v || !isNaN(parseFloat(v)))]"
        }
    },
    "v-combobox": {
        attr: {
            ":required": true,
            ":rules": "[v => (!!v || !isNaN(parseFloat(v)))]",
        }
    },
    "v-select": {
        attr: {
            ":required": true,
            ":rules": "[v => (!!v || !isNaN(parseFloat(v)))]",
        }
    },
    "v-autocomplete": {
        attr: {
            ":required": true,
            ":rules": "[v => (!!v || !isNaN(parseFloat(v)))]",
        }
    },
    //----------------------------------------------
    "v-jsoneditor": {
        import: ["/include/jsonEditor/v-jsoneditor.min.js"]
    },

    "f-button": {
        col: {
            align: ($isPhone ? "end" : null)
        },
    },

    "f-radiobox": {
        attr: {
            ":required": true,
            ":rules": "[v => (!!v || !isNaN(parseFloat(v)))]"
        }
    },
    "f-menu": {
        col: {
            align: ($isPhone ? "end" : null)
        },
    },
    "f-sheet": {
        import: ["/include/ag-grid/ag-grid.min.css", "/include/ag-grid/ag-theme-alpine.min.css", "/include/ag-grid/ag-grid-community.min.js"]
    },
    "f-pdfmake": {
        attr: {
            "width": "100%",
            "height": "500px"
        },
        import: ['/include/pdfmake/pdfmake.min.js', '/include/pdfmake/print.min.js', '/include/pdfmake/vfs_fonts.js']
    },
    "f-chart": {
        import: ["/include/chart/chart.min.js"]
    },
    "f-echart": {
        import: ["/include/chart/echarts.min.js", "/include/chart/fechart.js"]
    },
    "f-code-editor": {
        import: [
            "/include/monaco-editor/min/vs/loader.js",
        ]
    },
    "f-qrcode": {
        import: [
            "/include/qrcode/qrcode.min.js",
        ],
    },
    "f-qrcode-reader": {
        import: [
            "/include/qrcode/qrcode-reader.min.js",
        ],
    },

    "f-file-upload": {
        import: [
            "/include/plupload-2.3.7/plupload.full.min.js",
        ],
    },
    "f-image-update": {
        import: [
            "https://unpkg.com/vue-advanced-cropper@^1.0.0/dist/index.umd.js",
            "https://unpkg.com/vue-advanced-cropper@^2.0.0/dist/style.css",
        ],
    },
    "f-q-and-a": {
        import: [
            "https://cdnjs.cloudflare.com/ajax/libs/mathjax/2.7.5/MathJax.js?config=TeX-MML-AM_CHTML",
            "/include/QandA/q-and-a-ckedit.css",
            "/include/vue-context-menu.js",
            "/include/layoutEditor/Sortable.min.js",
            "/include/layoutEditor/vuedraggable.umd.min.js",
            "/include/ckeditor5/build/ckeditor.js",
            "/include/plupload-2.3.7/plupload.full.min.js",
            "/include/audio/vueaudio.js",
            "/include/QandA/QandA.js",
        ],
    },
    "f-etest-review": {
        import: [
            "https://cdnjs.cloudflare.com/ajax/libs/mathjax/2.7.5/MathJax.js?config=TeX-MML-AM_CHTML",
            "/include/QandA/q-and-a-ckedit.css",
            "/include/vue-context-menu.js",
            "/include/audio/vueaudio.js",
            "/include/QandA/QandA.js",
        ],
    },
    "f-audio": {
        import: [
            "/include/audio/vueaudio.js",
        ],
    },
    "f-audio-recorder": {
        import: [
            "/include/audio/vueaudio.js",
        ],
    },
    "f-editor": {
        import: [
            "/include/ckeditor5/build/ckeditor.js"
        ],
    },
    "f-editor-dialog": {
        import: [
            "/include/ckeditor5/build/ckeditor.js"
        ],
    },
    "f-excel-reader": {
        col: {
            align: ($isPhone ? "end" : null),
        }
    },
    "f-google-login": {
        import: [
            "https://apis.google.com/js/platform.js"
        ],
    }
};
//===========================================================================================
//===========================================================================================
//===========================================================================================
Vue.component("FDynamicComponent", {
    template: `<component :is="dynamicComponent" @update:innerDataOut="updateDataOut"></component>`,
    props: {
        componentData: {
            type: Object,
            default: () => ({}),
        },
        data: {
            type: Object,
            default: {},
        },
    },
    methods: {
        updateDataOut(newValue) {
            this.$emit('update:dataOut', newValue);
        }
    },
    computed: {
        dynamicComponent() {
            return { ...this.componentData }
        },
    },

});
// //===========================================================================================
// Vue.component("FOpenwindowControl", {
//     template: `<component v-for="(w,index) in windowList" v-bind:is="w.el" v-bind="w.attr">{{w.innerHTML}}</component>`,
//     props: {
//         windowList: {
//             default: [],
//             required: true
//         },
//     },
// });

//===========================================================================================
Vue.component('FLabel', {
    props: ['items', "text", "color", 'iconText'],
    template: `
        <div>
            <v-chip v-bind="$attrs" class="mr-2" v-if="text">
                <v-icon v-if="iconText" left>{{iconText}}</v-icon>{{text}}
            </v-chip>
            <v-chip v-bind="$attrs" v-for="(chip, k) in (typeof items === 'string'?JSON.parse(items):items)" :key="k" :color="(color ? color : chip.color)" class="mr-2" >
                <v-icon v-if="chip['icon-text']" left>{{chip['icon-text']}}</v-icon>{{chip.text}}
            </v-chip>
        </div>
        `
});

//===========================================================================================
Vue.component('FBox', {
    props: ['rowFormat', 'items', 'label', 'edit', 'saveclick'],
    template: `
        <v-card v-bind="$attrs">
            <v-list-item>
                <v-list-item-title v-if="label" class="headline mb-2">{{label}}</v-list-item-title><br>
                <table style="flex: initial; width:100%;" v-for="R in itemsObj">
                    <tr v-for="c in rowFormatArray">
                        <td class="py-1 text-no-wrap text-left">{{c.text}}</td>
                        <td class="py-1 px-2 text-center"><span v-if="!(edit && !c.noEdit)" >:</span></td>
                        <td v-if="!(edit && !c.noEdit)" class="py-1 text-left" style="width: 100%"><b>{{R[c.value]}}</b></td>
                        <td v-if="edit && !c.noEdit" class="py-1 text-left" style="width: 100%">
                            <v-text-field density="compact" variant="outlined" hide-details v-model="R[c.value]"></v-text-field>
                        </td>
                    </tr>
                </table>
            </v-list-item>
        </v-card>
        `,
    data: function () {
        return {
            rowFormatArray: [],
            itemsObj: [],
            itemsIsArray: _.isArray(this.items)
        }
    },
    mounted: function () {
        this.buildDataItems();
    },
    watch: {
        items: function (newVal, oldVal) {
            this.buildDataItems();
        },
        rowFormat: function (newVal, oldVal) {
            this.buildDataItems();
        },
        itemsObj: function (newVal, oldVal) {
            if (this.itemsIsArray) this.$emit('update:modelValue', this.itemsObj);
            else if (this.itemsObj.length > 0) this.$emit('update:modelValue', this.itemsObj[0]);
            else this.$emit('update:modelValue', null);
        }
    },
    methods: {
        buildDataItems: function () {
            if (this.items) {
                if (!_.isArray(this.items)) this.itemsObj = _.castArray(this.items);
                else this.itemsObj = this.items;
            }

            if (this.rowFormat) this.rowFormatArray = this.rowFormat;
            else this.rowFormatArray = this.buildHeader(this.itemsObj);
        },
        buildHeader: function (obj) {
            var datatable = {};
            var header = [];
            if (obj && _.isArray(obj)) datatable = obj[0];
            else if (obj && _.isArray(obj.data)) datatable = obj.data[0];

            if (datatable) {
                _.forEach(datatable, function (value, key) {
                    if (_.isNumber(value)) header.push({ "el": "t-num", "text": key, "value": key, "divider": true });
                    else header.push({ "text": key, "value": key, "divider": true });
                });
            }
            return header;
        }
    }
});
//===========================================================================================

Vue.component('FHeader', {
    props: ['label'],
    template: `<div class="text-h4 text-center text-blue-darken-3" v-html="label"></div>`
});

//===========================================================================================

Vue.component('FTitle', {
    props: ['label'],
    template: `<div class="text-h6 text-center text-blue-darken-2" v-html="label"></div>`
});

//===========================================================================================

Vue.component('FRadiobox', {
    props: {
        label: {
            type: String,
            default: undefined
        },
        items: {
            type: Array,
            default: []
        },
        itemValue: {
            type: String,
            default: 'value'
        },
        itemText: {
            type: String,
            default: 'text'
        }
    },
    template: `<v-radio-group v-bind="$attrs" v-on:change="$emit('update:modelValue', $event)"><template v-slot:label><div class="text-body-1">{{label}}</div></template><v-radio v-for="n in items" :key="n[itemValue]" :label="n[itemText]" :value="n[itemValue]"></v-radio></v-radio-group>`,
});
//===========================================================================================

Vue.component('FMenu', {
    props: {
        label: {
            type: String,
            default: undefined
        },
        items: {
            type: Array,
            default: []
        },
        iconText: {
            type: String,
            default: undefined
        },
        origin: {
            type: String,
            default: "top center"
        }
    },
    template: `<v-menu offset-y :origin="origin" transition="slide-y-transition" max-height = 500>
                <template v-slot:activator="{ props }"><v-icon color="primary" v-bind="props" :icon="iconText"></v-icon></template>
                <v-list >
                    <v-list-item v-bind="$attrs" v-for="(item, index) in items" :key="index" @click="onSelect(item)" >
                        <template v-slot:prepend><v-icon :color="item.color" :icon="item['icon-text']"></v-icon></template>
                        <v-list-item-title v-text="item.text"></v-list-item-title>
                    </v-list-item>
                </v-list>
            </v-menu>`,
    data: function () {
        return {
            dataList: this.dataFix(this.items)
        }
    },
    watch: {
        items: function (newVal) {
            this.dataList = this.dataFix(newVal)
        }
    },
    methods: {
        buttonclick: function (e) {
            if (e.action) runAction(e.action);
        },
        dataFix: function (d) {
            _.forEach(d, function (o) {
                if (_.isUndefined(o.visible)) {
                    o.visible = true;
                }
                mapData(o, o, vueData);
            });
            return d;
        }

    }
});

//===========================================================================================
Vue.component('FSearch', {
    props: {
        api: {
            type: String,
            default: undefined
        },
        apiData: {
            type: Object,
            default: {}
        },
        items: {
            type: Array,
            default: []
        },
    },
    template: `<v-autocomplete v-bind="$attrs" :loading="loading" :items="dataItems" @update:search="onChange"></v-autocomplete>`,
    data: function () {
        return {
            loading: false,
            dataItems: this.items,
            getDataFormAPI: _.debounce((search) => {
                if (search && search.length > 1) {
                    var self = this;
                    this.loading = true

                    if (typeof this.apiData != 'object') this.apiData = JSON.parse(this.apiData);

                    let inputdata = {}
                    mapData(this.apiData, inputdata, _.assignIn({}, vueData, { TEXT: search }));

                    ajaxCALL(this.api, inputdata, function (d) {
                        if (_.isArray(d.data)) self.dataItems = d.data;
                        else self.dataItems = d;

                        self.loading = false
                    }, function (e) {
                        console.log("API Error", e);
                    })
                }
            }, 500)
        }
    },
    watch: {
        items(val) {
            this.dataItems = val
        },
    },
    methods: {
        onChange(e) {
            this.getDataFormAPI(e);
        },
    },
});
//===========================================================================================
Vue.component('FButton', {
    props: {
        label: {
            type: String,
            default: 'OK'
        },
        checkvalid: {
            type: Boolean,
            default: true
        },
        ctrlhotkey: {
            type: Number,
            default: 0
        },
        iconText: {
            default: undefined
        },
        action: {
            default: undefined
        },
        includeData: {
            default: undefined
        }
    },
    template: `<v-btn v-on:click="buttonclick" :prepend-icon="iconText" :text="label" v-bind="$attrs"></v-btn>`,
    mounted: function () {
        if (this.ctrlhotkey > 0) {
            document.addEventListener("keydown", this.keydownHotKey, false);
        }
    },
    destroyed() {
        document.removeEventListener("keydown", this.keydownHotKey, false);
    },
    methods: {
        buttonclick: _.debounce(async function (e) {
            var attr = this.$attrs;
            if (attr.target == 'dialog') {
                console.log("dialog onclose", attr.onclose)
                openWindow({
                    id: attr.wid,
                    title: attr.title,
                    url: attr.url,
                    onclose: attr.onclose
                });
                return
            }

            if (this.checkvalid && !await app._component.methods.formvalidate()) {
                if (attr.type != 'submit') showMessage({ icon: 'mdi mdi-alert-outline', type: "red", title: "Hãy điền đầy đủ dữ liệu bắt buộc !" })
                return;
            }

            if (this.action) runAction(this.action, this.includeData);
            else console.log("action:", this.action);

        }, 500, { leading: true, trailing: false }),
        keydownHotKey: (e) => {
            if ((window.navigator.platform.match("Mac") ? e.metaKey : e.ctrlKey) && e.keyCode == this.ctrlhotkey) {
                e.preventDefault();
                this.buttonclick();
                console.log("Button hotkey :", this.label);
            }
        }
    }
});

//===========================================================================================

Vue.component('FFileUpload', {
    props: {
        label: {
            type: String,
            default: 'file upload'
        },
        url: {
            type: String,
            default: ''
        },
        autoclose: {
            type: Boolean,
            default: true
        },
        iconText: {
            type: String,
            default: "mdi-cloud-upload-outline"
        },
        filters: {
            type: Object,
            default: {
                max_file_size: '5mb',
                mime_types: [{ title: "All files", extensions: "*" }]
            }
        },
        resize: {
            type: Object,
            default: {
                width: 1900,
                height: 1600,
                quality: 80
            }
        },
        onclose: {
            default: undefined
        },

    },
    template: `
            <v-btn :id="elID" v-bind="$attrs">
                <v-icon v-if="iconText" :left="label != ''">{{iconText}}</v-icon>{{label}}
                <v-dialog v-model="dialog" persistent width="450">
                    <v-card>
                        <v-card-actions>
                            Upload file
                            <v-spacer></v-spacer>
                            <v-btn :loading="loading" icon="mdi-close" @click="dialog = false; UploadingError = []; UploadingFile = [];" ></v-btn>
                        </v-card-actions>
                        <v-sheet v-if="UploadingError.length>0" color="error" dark class="py-2">
                            <v-card-text class="py-1 px-4" v-for="(t, i) in UploadingError" :key="i">
                                <div><b>{{t.file.name}}</b></div>
                                <div>{{t.message}}</div>
                            </v-card-text>
                        </v-sheet>
                        <v-sheet v-if="UploadingFile.length>0" class="pb-2">
                            <v-card-text class="py-1 px-4" v-for="(t, i) in UploadingFile" :key="i">
                                <v-card-subtitle class="pa-0" >{{t.percent}}% - {{t.name}}</v-card-subtitle>
                                <v-progress-linear :value="t.percent" class="mb-2 mt-1"></v-progress-linear>                            
                            </v-card-text>
                        </v-sheet>
                    </v-card>
                </v-dialog>                
            </v-btn>
        `,
    data: function () {
        return {
            dialog: false,
            loading: true,
            UploadingFile: [],
            UploadingError: [],
            elID: generateID(),
            uploader: null,
            filesUploaded: []
        }
    },
    mounted: function () {
        this.uploaderInit();
    },
    methods: {
        uploaderInit: function () {
            var thisObj = this;

            var uploader = new plupload.Uploader({
                runtimes: 'html5,html4',
                browse_button: thisObj.elID,
                headers: {
                    authorization: 'Bearer ' + getCookie('awt'),
                    uploaddata: Date.now()
                },
                resize: thisObj.resize,
                filters: thisObj.filters,
                init: {
                    PostInit: function () { },
                    OptionChanged: function (up, name, value, oldValue) { },
                    BeforeUpload: function (up, file) {
                        uploader.settings.url = thisObj.url;
                    },
                    FilesAdded: function (up, files) {
                        thisObj.dialog = true;
                        thisObj.UploadingFile = files;
                        thisObj.filesUploaded = [];
                        uploader.start();
                    },
                    FileUploaded: function (up, file, result) {
                        result = JSON.parse(result.response);
                        json_data_parse(result, 0);
                        thisObj.filesUploaded = result;
                    },
                    UploadComplete: function (up, files) {
                        if (thisObj.filesUploaded) thisObj.$emit('update:modelValue', thisObj.filesUploaded);
                        else thisObj.$emit('update:modelValue', files);

                        if (thisObj.UploadingError.length == 0 && thisObj.autoclose) thisObj.dialog = false;
                        thisObj.loading = false;
                    },
                    UploadProgress: function (up, file) { },
                    Error: function (up, err) {
                        thisObj.loading = false;
                        if (err.status == 500) {
                            err.message = JSON.parse(err.response).message;
                        }
                        console.log(err);
                        thisObj.dialog = true;
                        thisObj.UploadingError.push(err);
                    }
                }
            });
            uploader.init();
            thisObj.uploader = uploader;
        }
    },
    watch: {
        dialog: function (newVal, oldVal) {
            if (!newVal && this.onclose) {
                runAction(this.onclose);
            }
        },
        filters: {
            deep: true,
            handler(newVal) {
                this.uploader.setOption("filters", newVal)
                var ext = newVal.mime_types[0].extensions.replace(/([ ]*)/gm, "")
                ext = "." + ext.replace(/,+/gm, ",.")
                $('#' + this.elID).parent().find('.moxie-shim > input[type="file"]').attr("accept", ext);
            }
        }
    }
});
//=========================================================================================================
Vue.component('FImageUpdate', {
    props: {
        modelValue: {
            default: null
        },
        label: {
            type: String,
            default: 'image upload'
        },
        title: {
            type: String,
            default: 'Cập nhật hình'
        },
        apiUpload: {
            type: String,
            default: ''
        },
        iconText: {
            type: String,
            default: "mdi-camera"
        },
        size: {
            type: Object,
            default: {
                height: 800,
                width: 800
            }
        },
        dialogWidth: {
            default: 450
        },
        imageBoxAttr: {
            type: Object,
            default: {
                "class": "d-flex flex-column align-center",
                "style": "position: relative;"
            },
        },
        imageAttr: {
            type: Object,
            default: {
                "class": "mb-2",
                "style": "outline: 1px solid #c0c0c0;"
            },
        },
        buttonAttr: {
            type: Object,
            default: {
                "depressed": "",
                "tile": "",
                "color": "primary",
            },
        },
        croperAttr: {
            type: Object,
            default: {
                "stencil-props": { aspectRatio: 3 / 4 },
                "transitions": true,
                "image-restriction": "fit-area",
            },
        },
    },
    template: `
        <v-dialog v-model="dialog" persistent :max-width="dialogWidth" :max-height="700" :key="cropperRerender">
            <template v-slot:activator="{ attrs }">
                <div v-bind="imageBoxAttr">
                    <img :src="modelValue" v-bind="imageAttr" />
                    <v-btn v-bind="buttonAttr"><v-icon v-if="iconText" :left="label != ''">{{iconText}}</v-icon>{{label}}</v-btn>
                </div>
            </template>
            <v-card>
                <v-toolbar elevation="0">
                    <v-toolbar-title>{{title}}</v-toolbar-title><v-spacer></v-spacer><v-btn icon @click="dialog = false"><v-icon>mdi-close</v-icon></v-btn>
                </v-toolbar>

                <v-card-text>
                    <cropper ref="cropper" :src="image" :canvas="size" v-bind="croperAttr"/>
                </v-card-text>

                <v-card-actions class="d-flex justify-space-around align-center">
                    <v-btn icon @click="flip(true, false)"><v-icon>mdi-flip-horizontal</v-icon></v-btn>
                    <v-btn icon @click="flip(false, true)"><v-icon>mdi-flip-vertical</v-icon></v-btn>
                    <v-btn icon @click="rotate(90)"><v-icon>mdi-rotate-right</v-icon></v-btn>
                    <v-btn icon @click="rotate(-90)"><v-icon>mdi-rotate-left</v-icon></v-btn>
                    <v-btn icon @click="onClickFileUpload"><v-icon>mdi-camera</v-icon></v-btn><input type="file" ref="fileUpload" @change="readFile" style="display: none;" accept="image/*" />
                    <v-divider vertical />
                    <v-btn @click="onSaved" color="primary" depressed><v-icon>mdi-cloud-upload-outline</v-icon></v-btn>
              </v-card-actions>
            </v-card>
            <v-overlay :value="overlay"><v-progress-circular indeterminate size="64"></v-progress-circular></v-overlay>
        </v-dialog>
        `,
    data: function () {
        return {
            dialog: false,
            overlay: false,
            image: this.modelValue,
            cropperRerender: 0,
        }
    },
    watch: {
        modelValue: function (newVal, oldVal) {
            this.image = newVal;
            this.cropperRerender = Math.floor(Math.random() * 1000);
        },
        dialog: function (newVal, oldVal) {
            if (newVal) {
                if ($isPhone && this.dialogWidth < 300) this.dialogWidth = 300;
                else if (this.dialogWidth < 450) this.dialogWidth = 450;
                this.image = this.modelValue;
            }
        }
    },
    methods: {
        flip(x, y) {
            if (this.$refs.cropper.imageTransforms.rotate % 180 !== 0) {
                this.$refs.cropper.flip(!x, !y);
            } else {
                this.$refs.cropper.flip(x, y);
            }
        },
        rotate(angle) {
            this.$refs.cropper.rotate(angle);
        },
        onClickFileUpload() {
            this.$refs.fileUpload.click();
        },
        readFile(event) {
            var self = this;
            var input = event.target;
            if (input.files && input.files[0]) {
                var reader = new FileReader();
                reader.onload = function (e) {
                    self.image = e.target.result;
                }
                reader.readAsDataURL(input.files[0]);
            } else {
                console.log("Sorry - you're device doesn't support the FileReader API");
            }
        },
        onSaved(e) {
            var self = this;
            self.overlay = true;

            this.$refs.cropper.getResult().canvas.toBlob(blobImage => {
                var fd = new FormData();
                fd.append('fname', 'image.jpg');
                fd.append('data', blobImage);

                $.ajax({
                    type: 'POST',
                    headers: {
                        authorization: $awt
                    },
                    url: self.apiUpload,
                    data: fd,
                    processData: false,
                    contentType: false,
                    success: function (data) {
                        self.$emit('update', { returnData: data, imageData: self.$refs.cropper.getResult().canvas.toDataURL() });
                        self.overlay = false;
                        self.dialog = false;
                    },
                    error: function (xhr) {
                        self.overlay = false;
                        console.log("Upload error: ", xhr.responseJSON.Message)
                    }
                });
            })
        },
    }
});

//===========================================================================================
Vue.component('FDate', {
    template: `<v-menu v-model="showDatePicker" :close-on-content-click="false" offset-y max-width="330px" min-width="330px" :activator="$refs.dateInput">
            <template v-slot:activator="{ props }">
                <v-text-field ref="dateInput" v-model="displayValue" :label="label" v-bind="$attrs" :required="required" :rules="dateRules" @keydown="handleKeydown" @keypress="restrictToNumbers" @paste="handlePaste" @click="handleClick" @focus="handleFocus"
                maxlength="10" @click:append-inner="showDatePicker = true" append-inner-icon="mdi-calendar-text"></v-text-field>
            </template>
            <v-date-picker v-if="showDatePicker" v-model="pickerDate" no-title show-adjacent-months scrollable @update:modelValue="handleDatePickerInput"></v-date-picker>
        </v-menu>`,
    props: {
        modelValue: {
            type: String,
            default: null,
        },
        label: {
            type: String,
            default: null,
        },
        dateAdd: {
            type: [Number, String],
            default: null,
        },
        required: {
            type: Boolean,
            default: true,
        },
    },
    data() {
        return {
            inputRef: null,
            internalValue: ['', '', ''], // [day, month, year]
            displayValue: 'dd/mm/yyyy',
            cursorPosition: 0,
            selectedField: null,
            isEditingField: false,
            showDatePicker: false,
            pickerDate: null,
            dateRules: [
                (v) => !v || this.isValidDate(v) || 'Ngày không hợp lệ (dd/mm/yyyy)',
            ],
        };
    },
    computed: {
        formattedDate() {
            const [day, month, year] = this.internalValue;
            return `${day.padStart(2, '0')}/${month.padStart(2, '0')}/${year.padStart(4, '0')}`;
        },
    },
    methods: {
        restrictToNumbers(event) {
            // Chỉ cho phép nhập số (0-9)
            const charCode = event.which ? event.which : event.keyCode;
            if (charCode < 48 || charCode > 57) {
                event.preventDefault();
            }
        },
        handlePaste(event) {
            // Chặn dán nếu dữ liệu chứa ký tự không phải số
            const pastedData = event.clipboardData.getData('text');
            if (!/^[0-9/]*$/.test(pastedData)) {
                event.preventDefault();
            }
        },
        handleKeydown(event) {
            this.showDatePicker = false;
            this.cursorPosition = this.inputRef.selectionStart;
            const key = event.key;
            const fields = { day: 0, month: 1, year: 2 };
            const maxLengths = { day: 2, month: 2, year: 4 };
            const allowedKeys = ['Backspace', 'Delete', 'ArrowLeft', 'ArrowRight'];
            const isDigit = /^[0-9]$/.test(key);
            const isAllowedSystemKey = /^F([1-9]|1[0-2])$/.test(key) || key === 'Tab';
            if (isDigit) {
                event.preventDefault();
                const fieldIndex = fields[this.selectedField];
                let fieldValue = this.internalValue[fieldIndex];
                if (!this.isEditingField) {
                    fieldValue = '';
                    this.isEditingField = true;
                }
                if (fieldValue == '0') fieldValue = key;
                else fieldValue += key;
                fieldValue = fieldValue.slice(-maxLengths[this.selectedField]);
                this.internalValue[fieldIndex] = fieldValue;
                if (fieldValue.length === maxLengths[this.selectedField]) {
                    if (this.selectedField === 'day') this.selectedField = 'month';
                    else if (this.selectedField === 'month') this.selectedField = 'year';
                    this.isEditingField = false;
                }
                this.updateDisplayValue();
                this.$nextTick(() => this.selectField());
                return;
            }
            if (key === 'Backspace' || key === 'Delete') {
                event.preventDefault();
                const fieldIndex = fields[this.selectedField];
                this.internalValue[fieldIndex] = '';
                this.isEditingField = false;
                this.updateDisplayValue();
                this.$nextTick(() => this.selectField());
                return;
            }
            if (key === 'ArrowLeft') {
                event.preventDefault();
                if (this.selectedField === 'year') this.selectedField = 'month';
                else if (this.selectedField === 'month') this.selectedField = 'day';
                this.isEditingField = false;
                this.$nextTick(() => this.selectField());
                return;
            }
            if (key === 'ArrowRight') {
                event.preventDefault();
                if (this.selectedField === 'day') this.selectedField = 'month';
                else if (this.selectedField === 'month') this.selectedField = 'year';
                this.isEditingField = false;
                this.$nextTick(() => this.selectField());
                return;
            }
            if (!isDigit && !allowedKeys.includes(key) && !isAllowedSystemKey) {
                event.preventDefault();
            }
        },
        handleClick(event) {
            this.cursorPosition = this.inputRef.selectionStart;
            if (this.cursorPosition <= 2) {
                this.selectedField = 'day';
            } else if (this.cursorPosition <= 5) {
                this.selectedField = 'month';
            } else {
                this.selectedField = 'year';
            }
            this.isEditingField = false;
            this.$nextTick(() => {
                this.selectField();
            });
        },
        handleFocus() {
            if (!this.selectedField) {
                this.selectedField = 'day';
            }
            this.isEditingField = false;
            this.$nextTick(() => {
                this.selectField();
            });
        },
        selectField() {
            if (this.selectedField === 'day') {
                this.inputRef.setSelectionRange(0, 2);
                this.cursorPosition = 2;
            } else if (this.selectedField === 'month') {
                this.inputRef.setSelectionRange(3, 5);
                this.cursorPosition = 5;
            } else if (this.selectedField === 'year') {
                this.inputRef.setSelectionRange(6, 10);
                this.cursorPosition = 10;
            }
        },
        updateDisplayValue() {
            const [day, month, year] = this.internalValue;
            this.displayValue = `${day.padStart(2, (day ? '0' : '_')) || 'dd'}/${month.padStart(2, (month ? '0' : '_')) || 'mm'}/${year.padStart(4, (year ? '0' : '_')) || 'yyyy'}`;
            if (this.isValidDate(this.formattedDate)) {
                let date = `${year.padStart(4, '0')}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
                this.pickerDate = new Date(date);
                this.$emit('update:modelValue', date);
            } else
                this.$emit('update:modelValue', null);
        },
        isValidDate(value) {
            // Cho phép giá trị rỗng hoặc placeholder
            if (!this.required && (!value || value === '__/__/____' || value === 'dd/mm/yyyy' || value === 'yyyy/mm/dd' || value === 'dd-mm-yyyy' || value === 'yyyy-mm-dd')) return true;
            // Regex cho các định dạng
            const ddmmyyyySlashRegex = /^(\d{2})\/(\d{2})\/(\d{4})$/; // dd/mm/yyyy
            const yyyymmddSlashRegex = /^(\d{4})\/(\d{2})\/(\d{2})$/; // yyyy/mm/dd
            const ddmmyyyyDashRegex = /^(\d{2})-(\d{2})-(\d{4})$/;   // dd-mm-yyyy
            const yyyymmddDashRegex = /^(\d{4})-(\d{2})-(\d{2})$/;   // yyyy-mm-dd
            let day, month, year;
            // Kiểm tra định dạng dd/mm/yyyy
            if (ddmmyyyySlashRegex.test(value)) {
                [day, month, year] = value.split('/').map(Number);
            }
            // Kiểm tra định dạng yyyy/mm/dd
            else if (yyyymmddSlashRegex.test(value)) {
                [year, month, day] = value.split('/').map(Number);
            }
            // Kiểm tra định dạng dd-mm-yyyy
            else if (ddmmyyyyDashRegex.test(value)) {
                [day, month, year] = value.split('-').map(Number);
            }
            // Kiểm tra định dạng yyyy-mm-dd
            else if (yyyymmddDashRegex.test(value)) {
                [year, month, day] = value.split('-').map(Number);
            }
            // Nếu không khớp định dạng nào
            else {
                return false;
            }
            // Tạo đối tượng Date và kiểm tra tính hợp lệ
            const date = new Date(year, month - 1, day);
            return (
                date.getDate() === day &&
                date.getMonth() + 1 === month &&
                date.getFullYear() === year
            );
        },
        handleDatePickerInput(date) {
            if (date) {
                const year = String(date.getFullYear())
                const month = String(date.getMonth() + 1).padStart(2, '0')
                const day = String(date.getDate()).padStart(2, '0')
                this.internalValue = [day, month, year];
                this.updateDisplayValue();
                this.showDatePicker = false;
            }
        },
        initializeDate() {
            // Regex cho các định dạng
            const yyyymmddSlashRegex = /^(\d{4})\/(\d{2})\/(\d{2})$/; // yyyy/mm/dd
            const yyyymmddDashRegex = /^(\d{4})-(\d{2})-(\d{2})$/;   // yyyy-mm-dd
            var modelValue = this.modelValue
            // Nếu có chuỗi dạng ISO có chứa 'T' (ví dụ: "2024-12-28T12:30:00")
            if (modelValue && typeof modelValue === 'string' && modelValue.includes('T')) {
                modelValue = modelValue.split('T')[0]; // Cắt phần thời gian, giữ lại yyyy-mm-dd
            }
            // Nếu có giá trị từ prop value
            if (modelValue && this.isValidDate(modelValue)) {
                let day, month, year;
                // Kiểm tra định dạng yyyy/mm/dd
                if (yyyymmddSlashRegex.test(modelValue)) {
                    [year, month, day] = modelValue.split('/').map(Number);
                }
                // Kiểm tra định dạng yyyy-mm-dd
                else if (yyyymmddDashRegex.test(modelValue)) {
                    [year, month, day] = modelValue.split('-').map(Number);
                }
                // Chuyển đổi sang chuỗi với định dạng 2 chữ số
                day = String(day).padStart(2, '0');
                month = String(month).padStart(2, '0');
                year = String(year);
                this.internalValue = [day, month, year];
                this.pickerDate = new Date(`${year}-${month}-${day}`);
                this.updateDisplayValue();
            }
            // Nếu không có value và dateAdd khác null
            else if (this.dateAdd !== null) {
                const date = new Date();
                date.setDate(date.getDate() + parseInt(this.dateAdd));
                const day = String(date.getDate()).padStart(2, '0');
                const month = String(date.getMonth() + 1).padStart(2, '0');
                const year = String(date.getFullYear());
                this.internalValue = [day, month, year];
                this.pickerDate = new Date(`${year}-${month}-${day}`);
                this.updateDisplayValue();
            }
        }
    },
    watch: {
        modelValue(newVal) {
            if (newVal && this.isValidDate(newVal)) {
                if (newVal != this.pickerDate) {
                    this.initializeDate();
                }
            } else {
                if (this.isValidDate(this.formattedDate)) {
                    this.internalValue = ['', '', ''];
                    this.displayValue = 'dd/mm/yyyy';
                    this.pickerDate = null;
                }
            }
        }
    },
    created() {
        this.initializeDate();
    },
    mounted() {
        this.inputRef = this.$refs.dateInput.$el.querySelector('input');
    }
});

//===========================================================================================
Vue.component('FTime', {
    template: `<v-menu v-model="showTimePicker" :close-on-content-click="false" offset-y max-width="330px" min-width="330px" :activator="$refs.timeInput">
    <template v-slot:activator="{ props }">
      <v-text-field ref="timeInput" v-model="displayValue" :label="label" :rules="timeRules" v-bind="$attrs" :required="required" @keydown="handleKeydown" @keypress="restrictToNumbers" @paste="handlePaste"
        @click="handleClick" @focus="handleFocus" maxlength="5" append-inner-icon="mdi-clock-outline"></v-text-field>
    </template>
    <v-time-picker v-if="showTimePicker" v-model="pickerTime" format="24hr" scrollable @update:modelValue="handleTimePickerInput"></v-time-picker>
  </v-menu>`,
    props: {
        modelValue: {
            type: String,
            default: null, // Expected format: HH:MM
        },
        label: {
            type: String,
            default: "Select Time",
        },
        timeAdd: {
            type: [Number, String],
            default: null, // Number of minutes to add to current time
        },
        required: {
            type: Boolean,
            default: true,
        },
    },
    data() {
        return {
            inputRef: null,
            internalValue: ["", ""], // [hour, minute]
            displayValue: "HH:MM",
            cursorPosition: 0,
            selectedField: null,
            isEditingField: false,
            showTimePicker: false,
            pickerTime: null,
            timeRules: [
                (v) => !v || this.isValidTime(v) || 'Thời gian không hợp lệ (HH:MM)',
            ],
        };
    },
    computed: {
        formattedTime() {
            const [hour, minute] = this.internalValue;
            return `${hour.padStart(2, hour ? "0" : "x")}:${minute.padStart(2, minute ? "0" : "X")}`;
        },
    },
    methods: {
        restrictToNumbers(event) {
            const charCode = event.which ? event.which : event.keyCode;
            if (charCode < 48 || charCode > 57) {
                event.preventDefault();
            }
        },
        handlePaste(event) {
            const pastedData = event.clipboardData.getData("text");
            if (!/^[0-9:]*$/.test(pastedData)) {
                event.preventDefault();
            }
        },
        handleKeydown(event) {
            this.showTimePicker = false;
            this.cursorPosition = this.inputRef.selectionStart;
            const key = event.key;
            const fields = { hour: 0, minute: 1 };
            const maxLengths = { hour: 2, minute: 2 };
            const allowedKeys = ["Backspace", "Delete", "ArrowLeft", "ArrowRight"];
            const isDigit = /^[0-9]$/.test(key);
            const isAllowedSystemKey = /^F([1-9]|1[0-2])$/.test(key) || key === "Tab";

            if (isDigit) {
                event.preventDefault();
                const fieldIndex = fields[this.selectedField];
                let fieldValue = this.internalValue[fieldIndex];
                if (!this.isEditingField) {
                    fieldValue = "";
                    this.isEditingField = true;
                }
                if (fieldValue === "0") fieldValue = key;
                else fieldValue += key;
                fieldValue = fieldValue.slice(-maxLengths[this.selectedField]);
                this.internalValue[fieldIndex] = fieldValue;

                if (fieldValue.length === maxLengths[this.selectedField]) {
                    if (this.selectedField === "hour") this.selectedField = "minute";
                    this.isEditingField = false;
                }
                this.updateDisplayValue();
                this.$nextTick(() => this.selectField());
                return;
            }

            if (key === "Backspace" || key === "Delete") {
                event.preventDefault();
                const fieldIndex = fields[this.selectedField];
                this.internalValue[fieldIndex] = "";
                this.isEditingField = false;
                this.updateDisplayValue();
                this.$nextTick(() => this.selectField());
                return;
            }

            if (key === "ArrowLeft" && this.selectedField === "minute") {
                event.preventDefault();
                this.selectedField = "hour";
                this.isEditingField = false;
                this.$nextTick(() => this.selectField());
                return;
            }

            if (key === "ArrowRight" && this.selectedField === "hour") {
                event.preventDefault();
                this.selectedField = "minute";
                this.isEditingField = false;
                this.$nextTick(() => this.selectField());
                return;
            }

            if (!isDigit && !allowedKeys.includes(key) && !isAllowedSystemKey) {
                event.preventDefault();
            }
        },
        handleClick(event) {
            this.cursorPosition = this.inputRef.selectionStart;
            if (this.cursorPosition <= 2) {
                this.selectedField = "hour";
            } else {
                this.selectedField = "minute";
            }
            this.isEditingField = false;
            this.$nextTick(() => this.selectField());
        },
        handleFocus() {
            if (!this.selectedField) {
                this.selectedField = "hour";
            }
            this.isEditingField = false;
            this.$nextTick(() => this.selectField());
        },
        selectField() {
            if (this.selectedField === "hour") {
                this.inputRef.setSelectionRange(0, 2);
                this.cursorPosition = 2;
            } else if (this.selectedField === "minute") {
                this.inputRef.setSelectionRange(3, 5);
                this.cursorPosition = 5;
            }
        },
        updateDisplayValue() {
            const [hour, minute] = this.internalValue;
            this.displayValue = `${hour.padStart(2, hour ? "0" : "_") || "HH"}:${minute.padStart(2, minute ? "0" : "_") || "MM"}`;
            if (this.isValidTime(this.formattedTime)) {
                this.pickerTime = `${hour.padStart(2, '0')}:${minute.padStart(2, '0')}`;
                this.$emit("update:modelValue", this.pickerTime);
            } else {                
                this.$emit("update:modelValue", null);
            }
        },
        isValidTime(value) {
            if (!this.required && (!value || value === '__:__' || value === 'HH:MM')) return true;
            const timeRegex = /^(\d{2}):(\d{2})$/;
            if (!timeRegex.test(value)) return false;
            const [hour, minute] = value.split(":").map(Number);
            return hour >= 0 && hour <= 23 && minute >= 0 && minute <= 59;
        },
        handleTimePickerInput(time) {
            if (time) {
                const [hour, minute] = time.split(":");
                this.internalValue = [hour, minute];
                this.updateDisplayValue();
                this.showTimePicker = false;
            }
        },
        initializeTime() {
            if (this.modelValue && this.isValidTime(this.modelValue)) {
                const [hour, minute] = this.modelValue.split(":");
                this.internalValue = [hour, minute];
                this.pickerTime = this.modelValue;
                this.updateDisplayValue();
            } else if (this.timeAdd !== null) {
                const date = new Date();
                date.setMinutes(date.getMinutes() + parseInt(this.timeAdd));
                const hour = String(date.getHours()).padStart(2, "0");
                const minute = String(date.getMinutes()).padStart(2, "0");
                this.internalValue = [hour, minute];
                this.pickerTime = `${hour}:${minute}`;
                this.updateDisplayValue();
            }
        },
    },
    watch: {
        modelValue(newVal) {
            console.log("modelValue", newVal, this.displayValue, this.formattedTime)

            if (newVal && this.isValidTime(newVal)) {
                if (newVal !== this.pickerTime) {
                    this.initializeTime();
                }
            } else {
                if (this.isValidTime(this.formattedTime)) {
                    console.log("hhhhhhhhhh", this.formattedTime)

                    this.internalValue = ["", ""];
                    this.displayValue = "HH:MM";
                    this.pickerTime = null;
                }
            }
        },
    },
    created() {
        this.initializeTime();
    },
    mounted() {
        this.inputRef = this.$refs.timeInput.$el.querySelector("input");
    },
});
//===========================================================================================
Vue.component('FpProfile', {
    props: {
        urlAppList: {
            default: null
        },
        urlSignout: {
            default: null
        },
        urlChangePassword: {
            default: null
        },
        urlAccount: {
            default: null
        },
        urlAvatar: {
            default: null
        },
        color: {
            default: "primary"
        }
    },
    template: `
            <v-menu v-if="userInfo.UserID" v-model="menu" :close-on-content-click="false" offset-y slide-y transition="slide-y-transition">
                <template v-slot:activator="{ props }">         
                    <v-avatar v-bind="props" size="36" class="mx-2 cursor-pointer">                    
                        <v-img v-if="urlAvatar" :src="avatarImg"></v-img>
                        <v-icon v-else :color="color">mdi-card-account-details</v-icon>
                    </v-avatar>
                </template>

                <v-card width=350>
                    <v-list-item><h4 class="">Thông tin người dùng</h4></v-list-item>
                    <v-list>
                        <v-list-item>
                            <template v-slot:prepend>
                                <v-avatar color="grey lighten-2" size="56">
                                    <v-img v-if="urlAvatar" :src="avatarImg"></v-img>
                                    <v-icon v-else>mdi-account-tie</v-icon>
                                </v-avatar>
                            </template>
                            
                            <div v-if="userInfo">
                                <v-list-item-title><v-btn color="primary" variant="text" :href="urlAccount">{{userInfo.FirstName}} {{userInfo.LastName}}</v-btn></v-list-item-title>
                                <v-list-item-subtitle class="ml-4"><b style="color: #000; font-size: larger;">{{userInfo.UserName}}</b> - {{userInfo.UserID}} - {{userInfo.DepartmentID}}</v-list-item-subtitle>
                            </div>
                        </v-list-item>
                    </v-list>

                    <v-card-actions>
                        <v-spacer></v-spacer> 
                        <v-btn v-if="urlChangePassword" color="primary" text @click="clickChangePass" prepend-icon="mdi-key-arrow-right">Đổi mật khẩu</v-btn>
                        <v-btn v-if="urlSignout" color="warning" text @click="clickSignout" prepend-icon="mdi-logout">Đăng xuất</v-btn>
                    </v-card-actions>

                    <v-list-item v-if="appList.length > 0"><h4 class="">Ứng dụng của tôi</h4></v-list-item>
                    <v-list v-if="appList.length > 0" class="fpScrollbar" style="display: grid; grid-template-columns: auto auto auto;  max-height: 400px; ">
                        <v-list-item v-for="(item, i) in appList" :key="i" :value="item" :href="item.URL" color="primary" class="pa-2" style="display: inline-block; text-align: center; cursor: pointer;">                            
                            <v-icon :icon="item.Icon" color="primary" style="font-size: 30px;"></v-icon>
                            <v-list-item-title v-text="item.AppName" class="mt-1" style="font-size: 11px; text-wrap: wrap;"></v-list-item-title>
                        </v-list-item>
                    </v-list>
                </v-card>
            </v-menu>
        `,
    data: function () {
        return {
            userInfo: vueData.user,
            menu: false,
            appList: [],
            firstLoad: false
        }
    },
    computed: {
        avatarImg: function () {
            return this.urlAvatar + this.userInfo.UserID + ".jpg"
        }
    },
    watch: {
        menu: function (e) {
            if (!this.firstLoad && this.urlAppList) {
                this.firstLoad = true
                ajaxCALL(this.urlAppList, {}, (d) => {
                    this.appList = d.data;
                });
            }
        },
    },
    methods: {
        clickChangePass: function (e) {
            this.menu = false
            location.assign(this.urlChangePassword)
        },
        clickSignout: function (item) {
            this.menu = false
            location.assign(this.urlSignout)
        }
    },
});
//===========================================================================================
Vue.component('HeaderBar', {
    props: {
        menu: {
            default: null
        },
        menuLeft: {
            default: null
        },
        title: {
            default: ''
        },
        logo: {
            default: ""
        },
        expand: {
            default: true
        },
        menuStyle: {
            default: {
                topmenu: {
                    bgcolor: "primary",
                    textcolor: "white"
                },
                leftmenu: {
                    bgcolor: "primary",
                    textcolor: "white"
                }
            }
        },
        component: {
            default: null
        },
        userProfile: {
            default: null
        },
        activeColor: {
            default: "rgba(255,255,255,0.15)"
        }
    },
    template: `
        <div>          
            <v-app-bar v-if="isMobile || menu" light app density="compact" flat clipped-left :color="menuStyle.topmenu.bgcolor" :style="{ 'box-shadow': 'rgba(0, 0, 0, 0.5) 0px 0px '+ boxShadow +'px 0px !important'}">
                <v-img class="ml-2" v-if="logo" :src="logo" height="30" width="30" max-height="30" max-width="30" contain></v-img>
                <v-toolbar-title v-if="title" :class="['text-' + menuStyle.topmenu.textcolor,'ml-2']">{{title}}</v-toolbar-title>
                <v-spacer></v-spacer>
                <v-toolbar-items class="hidden-sm-and-down" v-if="menu">
                    <v-menu offset-y v-for="(item, index) in menu.filter(info => checkright(info))" :key="index">
                        <template v-slot:activator="{ props }">
                            <v-btn v-bind="props" :prepend-icon="item.icon" :append-icon="!!item.submenu?'mdi-chevron-down':''" :href="(!item.submenu?item.url:'')" :target="item.target" text :class="['text-' + menuStyle.topmenu.textcolor]">{{ item.name }}</v-btn>
                        </template>
                        <v-list v-if="!!item.submenu">
                            <v-list-item v-for="(i, index) in item.submenu.filter(info => checkright(info))" :key="index" :prepend-icon="i.icon" :title="i.name" :href="i.url" :target="i.target"></v-list-item>
                        </v-list>
                    </v-menu>
                </v-toolbar-items>
                <component v-if="!isMobile && component" v-for="(c, index) in component" :key="index" v-bind:is="c.el" v-bind="c.attr"></component>
                <fp-profile v-if="!isMobile && userProfile" v-bind="userProfile"></fp-profile>
                <v-app-bar-nav-icon v-if="isMobile && leftMenuAndMobile" :color="menuStyle.topmenu.textcolor" @click.stop="openLeftMenu=!openLeftMenu"></v-app-bar-nav-icon>
            </v-app-bar>

            <v-navigation-drawer 
                v-if="leftMenuAndMobile" 
                :color="menuStyle.leftmenu.bgcolor" 
                :class="['text-' + menuStyle.leftmenu.textcolor, 'fp-custom-scrollbar']" 
                v-model="openLeftMenu" 
                app 
                clipped 
                :location="isMobile?'right':'left'" 
                :permanent="!isMobile" 
                :rail="pinLeftMenu && !isMobile" 
                :expand-on-hover="pinLeftMenu && !isMobile">
                <template v-slot:prepend v-if="!isMobile && !menu">
                    <v-list-item class="mr-2 px-0 pt-3 pl-3">
                        <template v-slot:prepend v-if="logo">
                            <v-img :src="logo" height="30" width="30" max-height="30" max-width="30" contain></v-img>
                        </template>
                        <template v-slot:title v-if="title">
                            <v-toolbar-title :class="['text-' + menuStyle.topmenu.textcolor]">{{title}}</v-toolbar-title>
                        </template>                        
                    </v-list-item>
                </template>
                <v-list v-if="leftMenuAndMobile" v-model:opened="openedGroups">
                    <template v-for="(item, index) in leftMenuAndMobile.filter(info => checkright(info))" :key="index">
                        <v-list-item 
                            v-if="!item.submenu" 
                            :href="item.url" 
                            :target="item.target" 
                            :title="item.name" 
                            :class="['text-' + menuStyle.leftmenu.textcolor]"
                            :data-active="isActiveUrl(item.url) ? 'true' : null"
                            :style="isActiveUrl(item.url) ? {backgroundColor: activeColor} : {}">
                            <template v-slot:prepend v-if="item.icon">
                                <v-icon :icon="item.icon" class="opacity-100"></v-icon>
                            </template>
                        </v-list-item>
                        <v-list-group v-else :value="item.name">
                            <template v-slot:activator="{ props }">
                                <v-list-item v-bind="props" :title="item.name" :class="['text-' + menuStyle.leftmenu.textcolor]">
                                    <template v-slot:prepend v-if="item.icon"><v-icon :icon="item.icon" class="opacity-100"></v-icon></template>
                                </v-list-item>
                            </template>

                            <v-list-item 
                                v-for="(i, index) in item.submenu.filter(info => checkright(info))" 
                                :key="index" 
                                :href="i.url" 
                                :target="i.target"
                                class="fp-submenu-item"
                                :data-active="isActiveUrl(i.url) ? 'true' : null"
                                :style="isActiveUrl(i.url) ? {backgroundColor: activeColor} : {}">
                                <template v-slot:prepend v-if="i.icon"><v-icon :icon="i.icon" class="opacity-100"></v-icon></template>
                                <v-list-item-title :class="['text-' + menuStyle.leftmenu.textcolor]" style="font-size: 0.9em;">{{ i.name }}</v-list-item-title>
                            </v-list-item>
                        </v-list-group>
                    </template>
                </v-list>
                <template v-slot:append>
                    <component v-if="!menu && component || isMobile" v-for="(c, index) in component" :key="index" v-bind:is="c.el" v-bind="c.attr"></component>
                    <v-list-item class="px-0 py-2">
                        <template v-slot:prepend v-if="!menu && userProfile || isMobile">
                            <fp-profile v-bind="userProfile"></fp-profile>
                        </template>
                        <template v-slot:append>
                            <v-btn v-if="(menu || leftMenuAndMobile) && !isMobile" @click.stop="on_of_menu" density="compact" variant="text" :color="menuStyle.leftmenu.textcolor" :icon="pinLeftMenu?'mdi-pin-outline':'mdi-pin-off-outline'"></v-btn>
                        </template>
                    </v-list-item>
                </template>
            </v-navigation-drawer>                   
        </div>
        `,
    data: function () {
        var leftMenuAndMobile = [];
        var display = Vuetify.useDisplay();
        var smAndDown = display.smAndDown;
        
        if (smAndDown.value) {
            _.forEach(_.union(this.menu, this.menuLeft), function (value) {
                if (rightTest(value.right)) leftMenuAndMobile.push(value);
            });

            if (leftMenuAndMobile.length == 0) leftMenuAndMobile = null;
        }
        else leftMenuAndMobile = this.menuLeft;

        var currentFullUrl = window.location.pathname + window.location.search;
        var openedGroups = [];
        
        if (leftMenuAndMobile && leftMenuAndMobile.length > 0) {
            _.forEach(leftMenuAndMobile, function (item) {
                if (item.submenu) {
                    var hasActiveChild = _.some(item.submenu, function (subItem) {
                        return subItem.url && currentFullUrl === subItem.url;
                    });
                    if (hasActiveChild) {
                        openedGroups.push(item.name);
                    }
                }
            });
        }

        return {
            smAndDown: smAndDown,
            leftMenuAndMobile: leftMenuAndMobile,
            openLeftMenu: this.isMobile,
            pinLeftMenu: (sessionStorage.getItem("fpOpenmenuAppBar") == null ? !this.expand : sessionStorage.getItem("fpOpenmenuAppBar") == 'true'),
            boxShadow: 0,
            currentFullUrl: currentFullUrl,
            openedGroups: openedGroups
        };
    },
    computed: {
        isMobile: function() {
            if (this.smAndDown) return true;
            else return false;
        }
    },
    methods: {
        on_of_menu: function (e) {
            this.pinLeftMenu = !this.pinLeftMenu;
            sessionStorage.setItem("fpOpenmenuAppBar", this.pinLeftMenu);
        },
        checkright: function (item) {
            if (!item) return true;
            if (!item.right) return true;
            if (!vueData.user) return false;

            return rightTest(item.right);
        },
        isActiveUrl: function (url) {
            if (!url) return false;
            return this.currentFullUrl === url;
        },
        scrollToActiveMenu: function () {
            if (!this.leftMenuAndMobile || this.leftMenuAndMobile.length === 0) return;
            
            var self = this;
            this.$nextTick(function() {
                setTimeout(function() {
                    var activeEl = self.$el.querySelector('[data-active="true"]');
                    if (activeEl) {
                        // Fallback cho trình duyệt cũ không hỗ trợ options
                        if ('scrollBehavior' in document.documentElement.style) {
                            activeEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
                        } else {
                            activeEl.scrollIntoView(true);
                        }
                    }
                }, 300);
            });
        },
        injectScrollbarStyles: function () {
            if (!this.leftMenuAndMobile || this.leftMenuAndMobile.length === 0) return;
            
            var styleId = 'fp-custom-scrollbar-style';
            if (document.getElementById(styleId)) return;
            
            var thumbColor = 'rgba(255,255,255,0.3)';
            var thumbHoverColor = 'rgba(255,255,255,0.5)';
            var trackColor = 'rgba(0,0,0,0.1)';
            
            var style = document.createElement('style');
            style.id = styleId;
            style.textContent = [
                '.fp-custom-scrollbar .v-navigation-drawer__content::-webkit-scrollbar {',
                '    width: 5px;',
                '}',
                '.fp-custom-scrollbar .v-navigation-drawer__content::-webkit-scrollbar-track {',
                '    background: ' + trackColor + ';',
                '}',
                '.fp-custom-scrollbar .v-navigation-drawer__content::-webkit-scrollbar-thumb {',
                '    background: ' + thumbColor + ';',
                '    border-radius: 3px;',
                '}',
                '.fp-custom-scrollbar .v-navigation-drawer__content::-webkit-scrollbar-thumb:hover {',
                '    background: ' + thumbHoverColor + ';',
                '}',
                '.fp-custom-scrollbar .v-navigation-drawer__content {',
                '    scrollbar-width: thin;',
                '    scrollbar-color: ' + thumbColor + ' ' + trackColor + ';',
                '}',
                '.fp-custom-scrollbar .v-list-group__items .fp-submenu-item {',
                '    padding-left: 32px !important;',
                '}',
                '.fp-custom-scrollbar .v-list-group__items .v-list-item__prepend {',
                '    width: auto;',
                '    margin-right: 8px;',
                '}'
            ].join('\n');
            document.head.appendChild(style);
        }
    },
    created: function() {
        if (!this.$isServer) {
            var self = this;
            this._scrollListener = function() {
                self.boxShadow = Math.round(window.pageYOffset) / 10;
                if (self.boxShadow > 10) self.boxShadow = 10;
            };
            this._scrollListener();
            window.addEventListener('scroll', this._scrollListener);
        }
    },
    mounted: function() {
        if (this.leftMenuAndMobile && this.leftMenuAndMobile.length > 0) {
            this.injectScrollbarStyles();
            this.scrollToActiveMenu();
        }
    },
    beforeDestroy: function() {
        window.removeEventListener('scroll', this._scrollListener);
    }
});

//===========================================================================================
Vue.component('f-chart', {
    props: ["data", "type", "options", "reverseData"],
    template: `<canvas ref="myChart"></canvas>`,
    data: function () {
        return {
            myChart: null,
            config: {
                type: this.type,
                data: this.data,
                options: this.options
            },
            chart_color: [
                "#1e90ff",
                "#ffa64d",
                "#6fdc6f",
                "#f14aff",
                "#9966ff",
                "#02e8e8",
                "#402b58",
                "#3b8d74",
                "#095fa4",
                "#b63639",
                "#c84f7a",
                "#a8b236",
                "#90692f",
                "#b42e89",
                "#ff9966",
                "#4db8ff",
                "#1c8540",
                "#ff6699",
                "#5666ad",
                "#b2b266",
                "#e2976b",
                "#84c887",
                "#4d9dd0",
                "#a187f7",
                "#d9745b",
                "#862929",
                "#ea80fc",
                "#8c4391",
                "#ff8c00",
                "#53915b",
                "#6dcbab",
                "#7b7353",
                "#d4e157",
                "#cc242f",
                "#c69e31",
                "#fdd835",
                // Tableau20
                "#4E79A7",
                "#A0CBE8",
                "#F28E2B",
                "#FFBE7D",
                "#59A14F",
                "#8CD17D",
                "#B6992D",
                "#F1CE63",
                "#499894",
                "#86BCB6",
                "#E15759",
                "#FF9D9A",
                "#79706E",
                "#BAB0AC",
                "#D37295",
                "#FABFD2",
                "#B07AA1",
                "#D4A6C8",
                "#9D7660",
                "#D7B5A6",
            ]
        }
    },
    mounted() {
        this.buildChart(this);
    },
    watch: {
        data: {
            deep: true,
            handler(newValue) {
                this.myChart.destroy();
                this.config.data = newValue;
                this.buildChart(this);
            }
        }
    },
    methods: {

        buildChart(self) {
            if (self.reverseData && self.config.data.labels) self.config.data.labels = _.reverse(self.config.data.labels);
            let n = parseInt(Math.random() * 45);
            _.forEach(self.config.data.datasets, function (v, k) {
                if (self.reverseData && v.data) v.data = _.reverse(v.data);
                if (!v.type) v.type = self.config.type;

                if (v.type == 'pie' || v.type == 'doughnut' || v.type == 'polarArea') {
                    if (!v.backgroundColor) v.backgroundColor = self.chart_color;
                } else {
                    if (!v.borderColor) v.borderColor = self.chart_color[k + n % self.chart_color.length];
                    if (!v.backgroundColor) v.backgroundColor = transparentize(v.borderColor, 0.6);
                    if (v.type && v.type != 'line') if (!v.borderWidth) v.borderWidth = 1;
                }
            });

            self.myChart = new Chart(self.$refs.myChart, self.config);
        },
    }
});
//===========================================================================================
Vue.component('FWindow', {
    props: ['winData'],
    template: `
       <v-dialog v-model="dialogOpen" :fullscreen="(prop.width || prop.height != '100%'?false:true)" :width="prop.width" :max-width="prop.width" :height="prop.height" :max-height="prop.height" scrollable persistent :transition="prop.transition">
          <v-card height="100%">
            <v-toolbar v-if="prop.headerbar" density="compact" :color="prop.toolbarcolor">
              <v-toolbar-title class="font-weight-medium" v-html="prop.title" style="max-height: 48px; font-size: 18px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;"></v-toolbar-title>
              <f-button :checkvalid=false v-for="(item,i) in prop.button" :key="i" text v-bind="item"></f-button>
              <v-btn icon @click="closeDialog" class="ml-4"><v-icon>mdi-close</v-icon></v-btn>
            </v-toolbar>
            <iframe :src="url" v-bind="$attrs" :id="prop.id" name='frameName' height="100%" width="100%" style="border:none;" allow="fullscreen"></iframe>
          </v-card>
        </v-dialog>
    `,
    data: function () {
        var propInit = _.cloneDeep(this.winData)

        if (!propInit.id) propInit.id = "Window" + generateID();
        if (typeof propInit.height == 'undefined') propInit.height = '100%';
        if (_.isInteger(propInit.height)) propInit.height = propInit.height + 'px';
        if (typeof propInit.toolbarcolor == 'undefined' && !(propInit.height != '100%' || propInit.width)) propInit.toolbarcolor = 'primary';

        if (typeof propInit.headerbar == 'undefined') propInit.headerbar = true;
        if (typeof propInit.transition == 'undefined') propInit.transition = 'scale-transition';

        if (propInit.button && _.isPlainObject(propInit.button)) propInit.button = [propInit.button];

        return {
            prop: propInit,
            url: null,
            dialogOpen: true,
        }
    },
    mounted: function () {
        var self = this;
        setTimeout(function () {
            // console.log(self.prop.url);
            self.url = self.prop.url;
        }, 250);
        $('html').css({
            'cssText': 'overflow: hidden !important'
        });
    },
    methods: {
        closeDialog() {
            var selfProp = this.prop;
            $('html').css({ "overflow": "" });

            setTimeout(() => {
                if (selfProp.onclose) runAction(selfProp.onclose, selfProp);
                _.remove(app.config.globalProperties.v_OpenWindowList, function (n) {
                    return n.uuid == selfProp.uuid;
                });
            }, 10);
            this.dialogOpen = false;
        },
    },
    destroyed() {
        console.log("window destroyed : ", this.$attrs.uuid)
    }
});

//===========================================================================================
Vue.component('FEditor', {
    props: {
        modelValue: {
            type: String,
            default: null,
        },
        imageapi: {
            type: String,
            default: 'https://fap.vn',
        },
        height: {
            type: [Number, String],
            default: null,
        },
        toolbar: {
            type: Array,
            default: null,
        },
    },
    template: `<div ref="elID" v-bind="$attrs"></div>`,
    data: function () {
        return {
            emitData: true,
            Editor: null
        }
    },
    watch: {
        modelValue: function (newVal, oldVal) {
            this.$nextTick(() => {
                if (!this.emitData && newVal && this.Editor) this.Editor.setData(newVal);
                this.emitData = false;
            });
        }
    },
    mounted: function () {
        setTimeout(() => {
            ClassicEditor.create(this.$refs.elID, {                
                toolbar: {
                    shouldNotGroupWhenFull: true,
                    items: (this.toolbar ? this.toolbar : [
                        'undo',
                        'redo',
                        'removeFormat',
                        'heading',
                        'fontFamily',
                        'fontSize',
                        '|',
                        'fontColor',
                        'fontBackgroundColor',
                        'highlight',
                        '|',
                        'horizontalLine',
                        'subscript',
                        'superscript',
                        'blockQuote',
                        '|',
                        'MathType',
                        'ChemType',
                        'specialCharacters',
                        '|',
                        'bulletedList',
                        'numberedList',
                        'outdent',
                        'indent',
                        '|',
                        'alignment',
                        'bold',
                        'italic',
                        'underline',
                        'strikethrough',
                        '|',
                        'imageUpload',
                        'link',
                        'insertTable',
                        'mediaEmbed',
                    ])
                },
                language: 'en',
                mediaEmbed: {
                    toolbar: ['mediaEmbed']
                },
                image: {
                    toolbar: [
                        'imageStyle:alignLeft', 'imageStyle:alignCenter', 'imageStyle:alignRight',
                        '|',
                        'resizeImage',
                        '|',
                        'imageTextAlternative',
                        'linkImage'
                    ],
                    styles: [
                        'alignLeft', 'alignCenter', 'alignRight'
                    ],
                },
                table: {
                    contentToolbar: [
                        'tableColumn',
                        'tableRow',
                        'mergeTableCells',
                        'tableCellProperties',
                        'tableProperties'
                    ]
                },
                licenseKey: '',
                simpleUpload: {
                    // The URL that the images are uploaded to.
                    uploadUrl: this.imageapi,
                    // Enable the XMLHttpRequest.withCredentials property.
                    withCredentials: false,
                    // Headers sent along with the XMLHttpRequest to the upload server.
                    headers: {
                        //'X-CSRF-TOKEN': 'CSRF-Token',
                        Authorization: 'Bearer ' + getCookie('awt')
                    }
                },

            }).then(editor => {
                this.Editor = markRaw(editor);

                if (this.modelValue) editor.setData(this.modelValue);

                editor.editing.view.change(writer => {
                    if (!this.height) this.height = 200;
                    writer.setStyle({ 'height': this.height + 'px' }, editor.editing.view.document.getRoot());
                });

                editor.model.document.on('change:data', () => {
                    if (this.modelValue != editor.getData()) {
                        this.emitData = true;
                        this.$emit('update:modelValue', editor.getData());
                    }
                });

                this.$emit('update:modelValue', editor.getData());
            }).catch(error => {
                console.log(error);
            });
        }, 100);
    },
    methods: {}
});
//===========================================================================================
Vue.component('FEditorDialog', {
    props: {
        modelValue: {
            type: Object,
            default: null,
        },
        imageapi: {
            type: String,
            default: 'https://fap.vn',
        },
        label: {
            type: String,
            default: null,
        },
    },
    template: `
        <v-overlay v-model="modelValue.open" persistent class="align-center justify-center">
            <v-card light elevation="10" width="800" style="position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%); -webkit-transform: translate(-50%, -50%); ">
                <v-toolbar flat>
                    <v-toolbar-title>{{label}}</v-toolbar-title>
                    <v-spacer></v-spacer>
                    <v-btn text color="orange darken-2" @click="closeDialog(0)" class="mr-6">
                        <v-icon left>mdi-close</v-icon>Cancel
                    </v-btn>
                    <v-btn text color="primary" @click="closeDialog(1)">
                        <v-icon left>mdi-check</v-icon>OK
                    </v-btn>
                </v-toolbar>
                <v-container text-left fluid class="pt-0">
                    <v-layout>
                        <v-col class="pa-0" :style="{height: windowHeight + 'px'}">
                            <f-editor v-model="textData" :imageapi="imageapi" :height="windowHeight - 80"></f-editor>
                        </v-col>
                    </v-layout>
                    
                </v-container>
            </v-card>
        </v-overlay>
        `,
    data: function () {
        return {
            textData: this.getData(this.modelValue),
            windowHeight: $(window).height() * 0.9 - 70,
        }
    },
    watch: {
        'modelValue.text': {
            handler(newVal, oldVal) {
                this.textData = this.getData(this.modelValue);
            }
        },
        'modelValue.object': {
            deep: true,
            handler(newVal, oldVal) {
                this.textData = this.getData(this.modelValue);
            }
        },
    },
    methods: {
        getData(d) {
            if (!d) return "";
            if (d.object) return d.object[d.text];
            else return d.text;
        },
        closeDialog(e) {
            if (e == 1) {
                if (this.modelValue.object) this.modelValue.object[this.modelValue.text] = this.textData;
                else this.modelValue.text = this.textData;

                this.modelValue.ok = true;
            } else this.modelValue.ok = false;
            this.modelValue.open = false;
        },
    },
});
//===========================================================================================
Vue.component('FDialog', {
    props: {
        modelValue: {
            type: Boolean,
            default: false
        },
        data: {
            type: Object,
            default: {}
        },
        title: {
            type: String,
            default: ''
        },
        controls: {
            type: Array,
            default: []
        },
        watch: {
            type: Object,
            default: {}
        },
        button: {
            default: []
        },
        disableValidate: {
            type: Boolean,
            default: false
        },
        width: {
            type: Number,
            default: 800
        },
        dialogModel: {
            type: String,
            default: ''
        },
        openAction: {
            type: Object,
            default: null
        },
    },
    template: `
            <v-dialog v-model="modelValue" :width="width" persistent>                
                <v-card>
                    <v-toolbar color="white" density="compact"><v-toolbar-title class="ml-4">{{ title }}</v-toolbar-title><v-spacer></v-spacer><v-btn @click="$emit('update:modelValue', false)" icon="mdi-close"></v-btn></v-toolbar>
                    <FDynamicComponent :componentData="dynData" @update:dataOut="updateDataOut"/>
                </v-card>                
            </v-dialog>
            `,
    data: function () {
        var controlsForm = [{
            prop: {
                class: "grid-list-lg py-2"
            },
            rows: []
        }];

        var row = {
            prop: "",
            cols: []
        };

        var updateUI = bindData(this.controls);

        if (_.isArray(updateUI) && updateUI.length > 0) {
            if (updateUI[0].rows) controlsForm = updateUI;
            else {
                _.forEach(updateUI, function (c) {
                    if (!c.w) c.w = 12
                    row.cols.push(c);
                    if (c.br) {
                        controlsForm[0].rows.push(_.cloneDeep(row));
                        row = {
                            prop: "",
                            cols: []
                        };
                    }
                });
                if (row.cols.length > 0) controlsForm[0].rows.push(_.cloneDeep(row));
            }
        };

        var comData = {};
        var controlsFormDOM = buildModuleUI(controlsForm, comData);
        //------------------------------------------------------------------------------------------------------------
        return {
            dynData: {
                template: `<v-form ref="form" @submit.prevent>${controlsFormDOM[0].outerHTML}<v-card-actions><v-spacer></v-spacer>${this.buildButton(this.button)}</v-card-actions></v-form>`,
                props: {
                    innerDataOut: {
                        type: Object,
                        default: {}
                    },
                },
                data: () => { return { vueData, ...comData, ...this.data, ...this.$props, v_outData: {} } },
                mounted: function () {
                    _.forEach(Object.keys(this.data), (k) => {
                        this.v_outData[k] = computed(() => this[k]);
                    });

                    _.forEach(Object.keys(comData), (k) => {
                        if (!this.v_outData[k]) this.v_outData[k] = computed(() => this[k]);
                    });

                    this.watchDialog(this.watch);
                    if (this.openAction) runAction(this.openAction, this.v_outData);
                    console.log("Dialog Data:", this.v_outData)
                },
                methods: {
                    async formValidate() {
                        if (this.disableValidate) return true;
                        const { valid } = await this.$refs.form.validate()
                        return valid
                    },
                    watchDialog(obj) {
                        if (_.isPlainObject(obj)) {
                            _.forEach(obj, (value, key) => {
                                console.log("ADD dialog watch : " + key);
                                if (typeof (this[key]) == "undefined") this[key] = undefined;
                                this.$watch(key, (newValue, oldValue) => {
                                    runAction(value, this.v_outData);
                                });
                            });
                        }
                    },
                    buttonclick: _.debounce(async function (e) {
                        if (e.type == 'submit' || e.checkvalid) {
                            if (!await this.formValidate()) {
                                showMessage({ icon: 'mdi mdi-alert-outline', type: "red", title: "Hãy điền đầy đủ dữ liệu bắt buộc !" })
                                return;
                            }
                        }

                        console.log("Dialog Action", e.action, this.v_outData)

                        if (e.type == 'submit') {
                            this.$emit('update:innerDataOut', this.v_outData);
                        }

                        if (_.isFunction(e.action)) e.action();
                        else
                            if (e.action) {
                                runAction(e.action, this.v_outData);
                            }

                    }, 500, { leading: true, trailing: false }),
                },
            },
        }
    },
    methods: {
        updateDataOut(newValue) {
            this.$emit('update:data', _.cloneDeep(newValue));
        },
        buildButton(buttonArray) {
            var buttonContainer = $("<div>");
            _.forEach(buttonArray, function (C, index) {
                C = _.assignIn({
                    elevation: 0,
                    color: "primary",
                    text: true,
                }, C);

                delete C.action;

                var btn = $("<v-btn>").attr(C);
                btn.attr({ "v-on:click": "buttonclick(button[" + index + "])" });

                if (C['icon-text']) btn.append("<v-icon left>" + C['icon-text'] + "</v-icon>" + C['label']);
                else btn.append(C['label']);

                buttonContainer.append(btn);
            });

            return buttonContainer[0].innerHTML;
        },
    }
});

//===========================================================================================
Vue.component('FPdfmake', {
    props: ['data'],
    template: `
        <v-card elevation="0">
            <v-overlay v-model="overlay" persistent class="align-center justify-center"><v-progress-circular indeterminate color="white"></v-progress-circular></v-overlay>
            <iframe id="pdfmakeViewer" v-bind="$attrs" style="border: thin solid rgba(0,0,0,.12); margin:0;"></iframe>        
        </v-card>
    `,
    data: function () {
        return {
            overlay: true
        }
    },
    mounted: function () {
        var obj = this;
        printPDF({
            data: _.cloneDeep(obj.data),
            viewer: '#pdfmakeViewer',
            callBack: function () {
                obj.overlay = false;
            }
        });
    },
    watch: {
        data: {
            deep: true,
            handler(newVal) {
                printPDF({ data: _.cloneDeep(newVal), viewer: '#pdfmakeViewer' });
            }
        }
    },

});

//===========================================================================================
Vue.component('FExcelReader', {
    props: {
        dateFormat: {
            type: String,
            default: null
        },    
        headerFormat: {
            type: String,
            default: null
        },    
        rawFormat: {
            type: String,
            default: null
        },    
        action: {
            type: Object,
            default: null
        },
        label: {
            type: String,
            default: 'Load Excel'
        },
        iconText: {
            type: String,
            default: 'mdi-grid'
        },
    },
    template: `
        <div>
            <v-btn :text="label" v-bind="$attrs" :prepend-icon="iconText" :loading="isSelecting" @click="onButtonClick"></v-btn>
            <input ref="uploader" style="display:none;" type="file" multiple="false" :accept="SheetJSFT" @change="onchange" onclick="this.value=null;">
        </div>
    `,
    data: function () {
        return {
            SheetJSFT: ".xlsx,.xlsb,.xlsm,.xls,.xml,.csv,.txt,.ods,.fods,.uos,.sylk,.dif,.dbf,.prn,.html,.htm",
            isSelecting: false
        }
    },
    methods: {
        onButtonClick() {
            this.isSelecting = true
            window.addEventListener('focus', () => {
                this.isSelecting = false
            }, { once: true })
            this.$refs.uploader.click()
        },
        onchange: function (evt) {
            const ctrl = this;
            const files = evt.target.files;
            if (!files || files.length === 0) return;
            const file = files[0];
            if (typeof XLSX === 'undefined') {
                const loader = new Loader();
                loader.require(["/include/excel/xlsx.full.min.js"], function () {
                    if (typeof XLSX !== 'undefined') {
                        ctrl.readExcelFile(file);
                    } else {
                        console.error('Failed to load XLSX library');
                    }
                });
            } else {
                ctrl.readExcelFile(file);
            }
            evt.target.value = '';
        },
        async readExcelFile(file) {
            var ctrl = this;
            var reader = new FileReader();
            reader.onload = function (e) {
                var dateFormat = ctrl.dateFormat;
                if (!dateFormat) dateFormat = 'FMT 14';

                var headerFormat = ctrl.headerFormat;
                if (!headerFormat) headerFormat = null;

                var rawFormat = ctrl.rawFormat;
                if (!rawFormat) rawFormat = false;

                // pre-process data
                var binary = "";
                var bytes = new Uint8Array(e.target.result);
                var length = bytes.byteLength;
                for (var i = 0; i < length; i++) {
                    binary += String.fromCharCode(bytes[i]);
                }

                /* read workbook */
                var wb = XLSX.read(binary, { type: 'binary' });

                /* grab first sheet */
                var wsname = wb.SheetNames[0];
                var ws = wb.Sheets[wsname];

                /* generate HTML */
                var EXCELJSON = XLSX.utils.sheet_to_json(ws, { header: headerFormat, raw: rawFormat, dateNF: dateFormat, defval: "" });
                //---------------------------------
                ctrl.$emit('update:modelValue', EXCELJSON);

                if (ctrl.action) CALL(ctrl.action);
            };

            reader.readAsArrayBuffer(file);
        },      
    }
});