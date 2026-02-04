<template>
	<Global>
		<v-card>
			<v-card-title>{{TitlePage}} • {{TitleCap}}</v-card-title>
			<v-card-text>
				<v-row>
					<v-col cols="3">
						<v-select v-model="LopItem" label="Chọn lớp" :items="DSLop" item-title="TenLop"
							item-value="LopID" return-object />
					</v-col>
					<v-col cols="3">
						<v-select v-model="ThangObj" label="Chọn tháng" :items="DSThang" item-title="Thang_HienThi_VI"
							item-value="Lop_NhanXetThangID" return-object />
					</v-col>
					<v-col class="d-flex ga-2">
						<v-btn text="Làm mới" color="primary" variant="outlined" @click="onRefresh" />
						<v-btn text="Import Excel" color="teal" variant="outlined" @click="onImport" />
						<v-btn text="Lưu tạm" color="blue" variant="outlined" @click="onSave" />
						<v-btn text="Gửi tổ trưởng" color="green" variant="outlined" @click="onSendToTruong" />
					</v-col>
				</v-row>
			</v-card-text>
		</v-card>
		<v-divider />
		<v-data-table :headers :items items-per-page="-1" hide-default-footer style="max-height: calc(100dvh - 200px)">
			<template #item.> </template>
		</v-data-table>
	</Global>
</template>

<script>
	export default {
	    props: [],
	    data() {
	        return {
	            vueData,
	            DSLop: [],
	            DSThang: [],
	            LopItem: null,
	            ThangObj: null,
	            headers: [],
	            items: []
	        }
	    },
	    mounted() {
	        this.getLop()
	    },
	    computed: {
	        TitleCap: function () { return renderText(parseInt(vueData.capid)) },
	        TitlePage: function () { return getTitlePageByURL(window.location.pathname + window.location.search) }
	    },
	    watch: {
	        LopItem: function (LopItem) {
	            if (!LopItem) return
	            this.ThangObj = null
	            this.items = []
	            this.getThang()
	        },
	        ThangObj: function (ThangObj) {
	            if (!ThangObj) return
	            this.items = []
	            this.getNhanXetThang()
	        }
	    },
	    methods: {
	        async getLop() {
	            this.DSLop = await fetchPromise("lms/Lop_Get_By_CapID", {
	                CapID: vueData.CapID,
	                NienKhoa: vueData.NienKhoa
	            })
	        },
	        async getThang() {
	            this.DSThang = await fetchPromise("lms/NhanXetThang_Lop_Get_GV", {
	                NienKhoa: vueData.NienKhoa,
	                LopID: this.LopItem.LopID
	            })
	        },
	        async getNhanXetThang(forceRefresh = false) {
	            this.items = await fetchPromise("lms/NhanXetThang_Get", {
	                Lop_NhanXetThangID: this.ThangObj.Lop_NhanXetThangID,
	                LopID: this.LopItem.LopID
	            }, { forceRefresh })
	            this.headers = this.renderHeader()
	        },
	        onRefresh() {
	            this.getNhanXetThang()
	        },
	        onImport() {
	
	        },
	        onSave() {
	
	        },
	        onSendToTruong() {
	
	        },
	        renderHeader() {
	            const headers = []
	            const headerLuuTam = {
	                title: "",
	                value: "btnLuuTam"
	            }
	            if (vueData.CapID === 1) {
	
	            } else if (vueData.CapID === 2 || vueData.CapID === 3) {
	
	            }
	            return headers
	        }
	    },
	}
</script>