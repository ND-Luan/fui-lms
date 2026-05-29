<template>
    <div>

        <!-- Dialog -->
        <v-dialog v-model="dialog" max-width="600px" persistent>
            <v-card>
                <v-card-title class="bg-primary d-flex py-0">
                    <span class="text-white">Chọn nhóm kĩ năng</span>
                    <v-spacer></v-spacer>
                    <v-btn class="text-white" icon variant="text" @click="$emit('update:dialog', false)"><v-icon>mdi-close</v-icon></v-btn>
                </v-card-title>

                <v-card-text class="pt-6">
                    <!-- Bước 1: Chọn nhóm kỹ năng -->
                    <v-select v-model="selectedGroup" :items="skillGroups" item-title="NhomKyNang"
                        item-value="KyNang_MonHocID" label="Chọn nhóm kĩ năng" variant="outlined" density="comfortable"
                        prepend-inner-icon="mdi-tag-multiple" :return-object="true" clearable>
                        <template v-slot:item="{ props, item }">
                            <v-list-item v-bind="props">
                                <template v-slot:prepend>
                                    <v-icon :color="getGroupColor(item.raw.NhomKyNang)">
                                        mdi-tag
                                    </v-icon>
                                </template>
                            </v-list-item>
                        </template>
                    </v-select>

                    <!-- Bước 2: Hiển thị thông tin nhóm đã chọn -->
                    <v-expand-transition>
                        <v-card v-if="selectedGroup" class="mt-4 mb-4" variant="outlined"
                            :color="getGroupColor(selectedGroup.NhomKyNang)">
                            <v-card-text>
                                <div class="d-flex align-center mb-2">
                                    <v-icon :color="getGroupColor(selectedGroup.NhomKyNang)" class="mr-2">
                                        mdi-information
                                    </v-icon>
                                    <span class="font-weight-bold">Danh sách kĩ năng:</span>
                                </div>
                                <v-divider class="mb-3"></v-divider>
                                <v-select color="primary" v-model="skillSelected" :items="skillDetails"
                                    item-title="TenKyNang" item-value="KyNang_MonHoc_ChiTietID" label="Kĩ năng" chips
                                    multiple return-object></v-select>
                            </v-card-text>
                        </v-card>
                    </v-expand-transition>

                    <!-- Thông báo khi chưa chọn -->
                    <v-alert v-if="!selectedGroup" type="info" variant="tonal" density="compact" class="mt-4">
                        Vui lòng chọn nhóm kỹ năng để áp dụng cho câu hỏi
                    </v-alert>
                </v-card-text>

                <v-divider></v-divider>

                <v-card-actions class="pa-4">
                    <v-spacer></v-spacer>
                  
                    <v-btn prepend-icon="mdi-content-save-outline" color="primary" variant="outlined" :disabled="!selectedGroup" @click="applySkill">
                        Áp dụng
                    </v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>


    </div>
</template>

<script>
export default {
    name: 'SkillSelectorDialog',
    props: ['dialog'],
    emits: ['update:dialog', 'skill-applied'],
    data() {
        return {
            selectedGroup: null,
            appliedSkill: null,
            skillGroups: [
                {
                    "KyNang_MonHocID": 1,
                    "MonHocID": 46,
                    "NhomKyNang": "Nhận biết",
                    "IsDeleted": false,
                    "CreateUser": "NA0000022",
                    "CreateTime": "2025-12-03T15:14:04.407",
                    "UpdateUser": "NA0000022",
                    "UpdateTime": "2025-12-03T15:24:16.633"
                },
                {
                    "KyNang_MonHocID": 2,
                    "MonHocID": 46,
                    "NhomKyNang": "Nâng cao",
                    "IsDeleted": false,
                    "CreateUser": "NA0000022",
                    "CreateTime": "2025-12-03T15:35:59.477",
                    "UpdateUser": null,
                    "UpdateTime": null
                }
            ],
            skillDetails: [
                {
                    "KyNang_MonHoc_ChiTietID": 1,
                    "KyNang_MonHocID": 1,
                    "TenKyNang": "Kĩ năng tính toánn",
                    "MoTaKyNang": "Tính toán với sự chính xác tối đaa",
                    "IsDeleted": false,
                    "CreateUser": "NA0000022",
                    "CreateTime": "2025-12-03T15:31:28.537",
                    "UpdateUser": "NA0000022",
                    "UpdateTime": "2025-12-03T15:34:47.523",
                    "NhomKyNang": null
                }
            ],
            skillSelected: []
        };
    },
    mounted() {
        this.GET_EL_KyNang_MonHoc_Get()
    },
    watch: {
        selectedGroup: function (val) {
            if (val) {
                this.skillDetails = []
                this.skillSelected = []
                this.GET_EL_KyNang_MonHoc_ChiTiet_Get()
            }
        }
    },
    methods: {
        getGroupColor(groupName) {
            const colors = {
                'Nhận biết': 'blue',
                'Nâng cao': 'purple',
                'Thông hiểu': 'green',
                'Vận dụng': 'orange'
            };
            return colors[groupName] || 'primary';
        },

        formatDate(dateString) {
            if (!dateString) return 'N/A';
            const date = new Date(dateString);
            return date.toLocaleDateString('vi-VN', {
                year: 'numeric',
                month: '2-digit',
                day: '2-digit',
                hour: '2-digit',
                minute: '2-digit'
            });
        },

        closeDialog() {
            this.dialog = false;
            this.selectedGroup = null;
        },

        applySkill() {
            // Emit event để component cha có thể nhận giá trị
            console.log('this.skillSelected', this.skillSelected)
            this.$emit('skill-applied', this.skillSelected);
            this.$emit('update:dialog', false);
            this.selectedGroup = null;
            this.skillDetails = []
            this.skillSelected = []
        },
        GET_EL_KyNang_MonHoc_Get() {
            ajaxCALL('lms/EL_KyNang_MonHoc_Get', { MonHocID: vueData.assignment.MonHocID }, res => {
                this.skillGroup = res.data
            })
        },
        GET_EL_KyNang_MonHoc_ChiTiet_Get() {
            ajaxCALL('lms/EL_KyNang_MonHoc_ChiTiet_Get', { KyNang_MonHocID: this.selectedGroup.KyNang_MonHocID }, res => {
                this.skillDetails = res.data
            })
        }
    }
}
</script>