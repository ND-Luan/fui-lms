<template>
	<v-dialog v-model="vueData.IsShowDialogDuyetAll" max-width="800">
		<v-card>
			<v-card-title>
				Duyệt tất cả lớp
				<v-spacer />
				<v-icon @click="vueData.IsShowDialogDuyetAll = false">mdi-close</v-icon>
			</v-card-title>
			<v-list v-model:selected="DSLop_Selected" select-strategy="leaf">
				<v-list-subheader>
					Danh sách lớp
					<v-spacer />
					<v-checkbox v-model="isCheckAll" label="Chọn tất cả" />
				</v-list-subheader>
				<v-list-item :title="item.TenLop" :key="item.LopID" :value="item.LopID"
					v-for="item in DSLop_NhanXetThangID" active-class="text-primary"
					:disabled="item.TinhTrang !== 2 || lopProgress[item.LopID]?.isProcessing">
					<template v-slot:prepend v-if="lopProgress[item.LopID]?.isProcessing">
						<v-progress-circular indeterminate size="24" width="2" color="primary" class="mr-2" />
					</template>
					<template v-slot:append>
						<v-chip :color="item.MauTinhTrang" size="small" variant="flat">
							{{ item.TenTinhTrang }}
						</v-chip>
					</template>
					<v-list-item-subtitle>
						<template v-if="lopProgress[item.LopID]">
							Đã gửi thông báo: {{ lopProgress[item.LopID].sent }} / {{ lopProgress[item.LopID].total }}
							<span v-if="lopProgress[item.LopID].isCompleted" class="text-success ml-2">✓ Hoàn
								thành</span>
						</template>
						<template v-else-if="item.TinhTrang !== 2">
							<span class="text-warning">Lớp chưa sẵn sàng để duyệt</span>
						</template>
						<template v-else>
							Chưa xử lý
						</template>
					</v-list-item-subtitle>
				</v-list-item>
			</v-list>
			<v-card-actions>
				<v-spacer />
				<v-btn @click="vueData.IsShowDialogDuyetAll = false" text="Đóng" :disabled="isProcessing" />
				<v-btn @click="onSubmit" :text="textDone" color="primary" variant="outlined" :loading="isProcessing" />
			</v-card-actions>
		</v-card>
	</v-dialog>
</template>

<script>
	export default {
	    props: ['DSLop', 'ThangObj'],
	    data() {
	        return {
	            vueData,
	            isCheckAll: false,
	            DSLop_Selected: [],
	            DSLop_NhanXetThangID: [], // Danh sách lớp kèm thông tin tình trạng
	            lopProgress: {}, // { LopID: { sent: 0, total: 0, isProcessing: false, isCompleted: false } }
	            isProcessing: false
	        }
	    },
	    mounted() {
	        this.loadDSLop()
	    },
	    computed: {
	        textDone: function () {
	            let str = 'Duyệt '
	            if (this.DSLop_Selected.length > 0) str += this.DSLop_Selected.length + ' lớp'
	            return str
	        }
	    },
	    watch: {
	        isCheckAll: function (isCheck) {
	            if (isCheck) {
	                // Chỉ chọn các lớp có TinhTrang = 2
	                this.DSLop_Selected = this.DSLop_NhanXetThangID
	                    .filter(x => x.TinhTrang === 2)
	                    .map(x => x.LopID)
	            }
	            else {
	                this.DSLop_Selected = []
	            }
	        },
	        'vueData.IsShowDialogDuyetAll': function (newVal) {
	            if (newVal) {
	                this.loadDSLop()
	            }
	        }
	    },
	    methods: {
	        async loadDSLop() {
	            // Load danh sách lớp kèm tình trạng
	            this.DSLop_NhanXetThangID = await this.getDSNhanXetThang()
	        },
	        async onSubmit() {
	            // Lọc chỉ các lớp có TinhTrang = 2
	            const validSelection = this.DSLop_Selected.filter(lopID => {
	                const lop = this.DSLop_NhanXetThangID.find(x => x.LopID === lopID)
	                return lop && lop.TinhTrang === 2
	            })
	
	            if (validSelection.length === 0) {
	                Vue.$toast.warning("Bạn chưa chọn lớp hợp lệ để duyệt")
	                return
	            }
	
	            // Reset progress
	            this.lopProgress = {}
	            this.isProcessing = true
	
	            try {
	                // Lọc chỉ các lớp được chọn và có TinhTrang = 2
	                const DSLop_CanDuyet = this.DSLop_NhanXetThangID.filter(x =>
	                    validSelection.includes(x.LopID) && x.TinhTrang === 2
	                )
	
	                for (var item of DSLop_CanDuyet) {
	                    // Khởi tạo progress cho lớp này
	                    this.lopProgress[item.LopID] = {
	                        sent: 0,
	                        total: 0,
	                        isProcessing: true,
	                        isCompleted: false
	                    }
	
	                    // Lấy danh sách học sinh
	                    const DSHocSinh = await this.getNhanXetThang_ByLop_NhanXetThangID(item.LopID, item.Lop_NhanXetThangID)
	
	                    // Cập nhật tổng số học sinh
	                    this.lopProgress[item.LopID].total = DSHocSinh.length
	
	                    // Xử lý từng học sinh
	                    for (var hocSinh of DSHocSinh) {
	                        const plainText_HS = processBeforePushME(hocSinh)
	                        // console.log("plt", hocSinh.HocSinhID, plainText_HS)
	                        await this.apiPostNotificationToME(hocSinh.HocSinhID, plainText_HS)
	                        // Cập nhật số lượng đã gửi
	                        this.lopProgress[item.LopID].sent++
	                    }
	
	                    // Đánh dấu hoàn thành
	                    this.lopProgress[item.LopID].isProcessing = false
	                    this.lopProgress[item.LopID].isCompleted = true
	
	                    // Cập nhật trạng thái duyệt
	                    await this.apiUpdateTinhTrang_Duyet(item.Lop_NhanXetThangID)
	                }
	
	                Vue.$toast.success(`Duyệt ${validSelection.length} lớp thành công`)

	                // Reload lại danh sách để cập nhật tình trạng mới
	                vueData.IsShowDialogDuyetAll = false
	                this.$emit('done')
	            } catch (error) {
	                Vue.$toast.error(`Có lỗi xảy ra: ${error.message}`)
	            } finally {
	                this.isProcessing = false
	            }
	        },
	        async getNhanXetThang_ByLop_NhanXetThangID(LopID, Lop_NhanXetThangID) {
	            return await ajaxCALLPromise("lms/NhanXetThang_Get", {
	                LopID,
	                Lop_NhanXetThangID
	            })
	        },
	        async getDSNhanXetThang() {
	            let arr = []
	            const dsLop = this.DSLop || []

	            for (var lop of dsLop) {
	                const DSNXT = await ajaxCALLPromise("lms/NhanXetThang_Lop_Get", {
	                    LopID: lop.LopID,
	                    NienKhoa: vueData.NienKhoa
	                })
	                const filterDS_NXT = DSNXT.find(x =>
	                    x.Thang === this.ThangObj.Thang
	                    && x.Nam === this.ThangObj.Nam
	                    && x.NienKhoa === this.ThangObj.NienKhoa
	                )
	                if (filterDS_NXT) {
	                    filterDS_NXT.TenLop = lop.TenLop
	                    arr.push(filterDS_NXT)
	                }
	            }
	            return arr
	        },
	        async apiUpdateTinhTrang_Duyet(Lop_NhanXetThangID) {
	            return ajaxCALLPromise("lms/NhanXetThang_Upd_TinhTrang", {
	                TinhTrang: 4,
	                Lop_NhanXetThangID
	            })
	        },
	        async apiPostNotificationToME(HocSinhID, NoiDung) {
	            return await ajaxCALLPromise("student/LMS_SendMessageToME", {
	                HocSinhID, NoiDung
	            })
	        },
	        processBeforePushME(item) {
	            return buildPushMEText(item, parseInt(vueData.CapID), vueData.NienKhoa, this.ThangObj)
	        },
	    },
	}
</script>