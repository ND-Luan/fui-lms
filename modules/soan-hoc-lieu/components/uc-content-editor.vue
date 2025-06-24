<!-- === uc-content-editor (Đồng bộ Style) === -->
<template>
    <div class="content-editor-form"  v-if="internalItem">
        <v-text-field class="mb-4" label="Tên học liệu" v-model="internalItem.TenHocLieu" @update:modelValue="updateParent"
            variant="outlined" density="compact" hide-details="auto"></v-text-field>

        <v-row>
            <v-col cols="8">
                <v-select label="Loại học liệu" v-model="internalItem.LoaiHocLieu" :items="loaiHocLieuOptions"
                    @update:modelValue="updateParent" variant="outlined" density="compact"></v-select>
            </v-col>
            <v-col cols="4">
                <v-text-field label="Thứ tự" v-model.number="internalItem.ThuTu" type="number"
                    @update:modelValue="updateParent" variant="outlined" density="compact"></v-text-field>
            </v-col>
        </v-row>

        <div class="mt-4">
            <div v-show="isCodeEditorVisible" class="code-editor-wrapper mt-4">
                <textarea ref="codeEditor"></textarea>
            </div>
            <v-textarea v-show="!isCodeEditorVisible" label="Nội dung" v-model="internalItem.NoiDung"
                hint="Nhập link Youtube, link tài liệu hoặc mô tả ngắn..." @update:modelValue="updateParent"
                variant="outlined" rows="10"></v-textarea>
        </div>
    </div>
</template>

<script>
    // Phần SCRIPT giữ nguyên, không cần thay đổi
export default {
    name: 'uc-content-editor',
    props: {
        modelValue: { type: Object, default: null },
        loaiHocLieuOptions: { type: Array, default: () => [] },
    },
    emits: ['update:modelValue'],
    data() {
        return {
            editorInstance: null,
            internalItem: null
        }
    },
    computed: {
        isCodeEditorVisible() {
            if (!this.internalItem) return false;
            const codeTypes = ['HTML', 'INTERACTIVE'];
            return codeTypes.includes(this.internalItem.LoaiHocLieu);
        }
    },
    watch: {
        modelValue: {
            handler(newItem) {
                if (newItem) {
                    this.internalItem = JSON.parse(JSON.stringify(newItem));
                } else {
                    this.internalItem = null;
                }
            },
            deep: true,
            immediate: true
        },
        isCodeEditorVisible(isVisible) {
            Vue.nextTick(() => {
                if (isVisible) {
                    this.initCodeMirror();
                } else {
                    this.destroyCodeMirror();
                }
            });
        }
    },
    methods: {
        updateParent() {
            this.$emit('update:modelValue', this.internalItem);
        },
        initCodeMirror() {
            if (this.$refs.codeEditor && !this.editorInstance) {
                this.editorInstance = CodeMirror.fromTextArea(this.$refs.codeEditor, {
                    lineNumbers: true,
                    mode: 'htmlmixed',
                    theme: 'default'
                });
                this.editorInstance.on('change', (cm) => {
                    if (this.internalItem) {
                        this.internalItem.NoiDung = cm.getValue();
                        this.updateParent();
                    }
                });
                vueData.editorInstance = this.editorInstance;
            }
            if (this.editorInstance) {
                const currentValue = this.editorInstance.getValue();
                const newValue = this.internalItem.NoiDung || '';
                if (currentValue !== newValue) {
                    this.editorInstance.setValue(newValue);
                }
                setTimeout(() => this.editorInstance.refresh(), 100);
            }
        },
        destroyCodeMirror() {
            if (this.editorInstance) {
                this.editorInstance.toTextArea();
                this.editorInstance = null;
                vueData.editorInstance = null;
            }
        }
    },
    beforeUnmount() {
        this.destroyCodeMirror();
    }
}
</script>

<style scoped>
    .form-label {
        font-weight: 500;
        margin-bottom: 8px;
        display: block;
    }

    .code-editor-wrapper {
        border: 1px solid #ccc;
        border-radius: 4px;
    }

    .code-editor-wrapper .CodeMirror {
        height: 250px;
    }
</style>