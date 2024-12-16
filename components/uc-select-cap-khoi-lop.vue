<template>
	<div>
		<v-card>
			<v-card-title class="text-primary">Chọn {{Title}}</v-card-title>
			<v-card-text>
				<v-row>
					<v-col cols="3" sm="6" md="3" v-if="!HideNienKhoa">
						<v-select :disabled=DisableNienKhoa :items="schoolYears" label="Chọn niên khóa" item-title="text" item-value="value"
							v-model="selectedSchoolYear" outlined dense hide-details>
						</v-select>
					</v-col>
					<v-col cols="3" sm="6" md="3">
						<v-select v-model="CapItem" label="Chọn cấp" :items="DSCap" :item-title="'TenCapHoc'"
							item-value="CapID" outlined dense hide-details></v-select>
					</v-col>
					<v-col cols="3" sm="6" md="3" v-if="!HideKhoi">
						<v-select :disabled=DisableKhoi v-model="KhoiItem" label="Chọn khối" :items="DSKhoi"
							:item-title="'TenKhoiHoc'" item-value="KhoiID" outlined dense hide-details></v-select>
					</v-col>
					<v-col cols="3" sm="6" md="3" v-if="!HideLop">
						<v-select :disabled=DisableLop v-model="LopItem" label="Chọn lớp" :items="DSLop"
							item-title="TenLop" item-value="LopID" outlined dense hide-details></v-select>
					</v-col>
					

					<!-- <v-col cols="1">
						<v-btn @click="onSearch" color="primary">Tìm kiếm</v-btn>
					</v-col> -->
				</v-row>
				<v-row>

					<v-col cols="3" sm="6" md="3" v-if="!HideKhoi">
						<v-select :disabled=DisableToGiangDay v-model="ToGiangDayItem" label="Chọn Tổ giàng dạy" :items="DSToGiangDay"
							:item-title="'ToDayName'" item-value="ToGiangDayID" outlined dense hide-details></v-select>
					</v-col>
					<v-col cols="4" sm="6" md="4" v-if="!HideGiaoVien">
						<v-select :disabled=DisableGiaoVien v-model="GiaoVienItem" label="Chọn giáo viên "
							:items="DSGiaoVien" item-title="HoTenGV" item-value="GiaoVienID" outlined dense
							hide-details></v-select>
					</v-col>
					<v-col cols="4" sm="6" md="4" v-if="!HideMon">
						<v-select :disabled=DisableMon v-model="MonHocID" label="Chọn môn học" :items="DSMonHoc"
							item-title="MonHocName" item-value="MonHocID" outlined dense hide-details></v-select>
					</v-col>
				</v-row>
			</v-card-text>
		</v-card>
	</div>
</template>

<script>
	export default {
	
	    props: {
	        modelValue: {
	            type: Object,
	            required: true
	        },
	        yearNow: {
	            type: Number,
	            required: false,
	            default: new Date().getFullYear(),
	        },
	        pastYears: {
	            type: Number,
	            required: false,
	            default: 10,
	        },
	        futureYears: {
	            type: Number,
	            required: false,
	            default: 10,
	        },
	    },
	    data() {
	        return {
	            "Title": "",
	            "CapItem": null,
	            "KhoiItem": null,
	            "LopItem": null,
	            "MonItem": null,
	            "ToGiangDayItem": null,
	            "GiaoVienItem": null,
	
	
	            "DSCap": [],
	            "DSKhoi": [],
	            "DSLop": [],
	            "DSMonHoc": [],
	            "DSGiaoVien": [],
	            "DSNienKhoa": [],
	            "DSToGiangDay": [],
	
	
	
	            "CapID": null,
	            "KhoiID": null,
	            "LopID": null,
	            "MonHocID": null,
	            "GiaoVienID": null,
	
	            "DisableKhoi": true,
	            "DisableLop": true,
	            "DisableMon": false,
	            "DisableGiaoVien": false,
	            "DisableNienKhoa": false,
	            "DisableToGiangDay": false,
	
	            "HideKhoi": false,
	            "HideLop": false,
	            "HideMon": false,
	            "HideGiaoVien": false,
	            "HideNienKhoa": false,
	
	
	            input: this.modelValue,
	            selectedSchoolYear: null, // Giá trị niên khóa được chọn
	
	        }
	    },
	    mounted() {
			this.resetDataStorage()
	        this.getCap() //Lấy cấp học
	        this.getGiaoVien() //Lấy GiaoVien
			this.getToGiangDay()
			this.getMonHoc()
	
	    },
	    computed: {
	        schoolYears() {
	            return this.generateSchoolYears();
	        },
	    },
	    watch: {
	        CapItem: function (newValue, oldValue) {
	            console.log('Item changed:', newValue);
	            if (newValue != oldValue) {
	                this.DSKhoi = []
	                this.DSLop = []
	                this.DSMonHoc = []
	                this.KhoiID = null
	                this.LopID = null
	                this.MonID = null
	                this.DisableKhoi = false
	                this.DisableLop = true
	                this.DisableMon = false
	                this.KhoiItem = null
	                this.LopItem = null
	                this.MonItem = null
	                sessionStorage.setItem('CapIDSelected', newValue);
	
	                this.getKhoiHocByCapID(newValue) //Lấy khối học
					this.getMonHoc(CapID =newValue )
	
	
	            }
	
	
	        },
	        KhoiItem: function (newValue, oldValue) {
	            console.log('Item changed:', newValue);
	            if (newValue != oldValue) {
	                this.getLopHocbyKhoiID(newValue) //Lấy khối học
	
	                sessionStorage.setItem('KhoiIDSelected', newValue);
	
	                this.DSLop = []
	
	                this.LopID = null
	
	                this.DisableLop = false
	                this.LopItem = null
	                this.MonItem = null
	
	
	
	            }
	
	
	        },
			LopItem: function (newValue, oldValue) {
	            console.log('Item changed:', newValue);
				debugger
	            if (newValue != oldValue) {
	                // this.getLopHocbyKhoiID(newValue) //Lấy khối học
					debugger
	                sessionStorage.setItem('LopIDSelected', newValue);
	
	
	            }
	
	
	        },
			ToGiangDayItem: function (newValue, oldValue) {
			console.log('Item changed:', newValue);
			if (newValue != oldValue) {
			// this.getLopHocbyKhoiID(newValue) //Lấy khối học
			this.getGiaoVienByToGiangDay(GiaoVienID = null,ToGiangDay =newValue )
			sessionStorage.setItem('ToGiangDayIDSelected', newValue);
			
			
			}
			
			
			},
	        MonHocItem: function (newValue, oldValue) {
	            console.log('Item changed:', newValue);
	            if (newValue != oldValue) {
	                // this.getLopHocbyKhoiID(newValue) //Lấy khối học
	
	                sessionStorage.setItem('MonHocIDSelected', newValue);
	
	
	            }
	
	
	        },
            selectedSchoolYear: function (newValue, oldValue) {
                console.log('Item changed:', newValue);
                if (newValue != oldValue) {
                // this.getLopHocbyKhoiID(newValue) //Lấy khối học
                sessionStorage.setItem('NienKhoaSelected', newValue);
                
                
                }
                
                
                },
	
	        GiaoVienItem: function (newValue, oldValue) {
	            console.log('Item changed:', newValue);
	            if (newValue != oldValue) {
	                // this.getGiaoVien() //sửa hàm này nếu muốn lấy giáo viên theo id mỗi khi select giáo viên
	
	                sessionStorage.setItem('GiaoVienIDSelected', newValue);
	                // this.DSLop = []
	                // this.DSMonHoc = []
	
	                // this.LopID = null
	                // this.MonID = null
	
	                // this.DisableLop = false
	                // this.DisableMon = true
	                // this.LopItem = null
	                // this.MonItem = null
	
	
	
	            }
	
	
	        },
	        input(val) {
	            if (val) {
	                this.$emit('update:modelValue', val)
	            } else {
	                this.$emit('update:modelValue', '')
	            }
	        }
	
	    },
	    methods: {
	        generateSchoolYears() {
	            const schoolYears = [];
	            for (let i = this.pastYears; i >= -this.futureYears; i--) {
	                const year = this.yearNow - i;
	                schoolYears.push({
	                    text: `${year}`, // Dùng để hiển thị
	                    value: year, // Dùng làm giá trị
	                });
	                // const startYear = this.yearNow - i;
	                // const endYear = startYear + 1;
	                // schoolYears.push({
	                // text: `${startYear}-${endYear}`, // Dùng để hiển thị
	                // value: `${startYear}-${endYear}`, // Dùng làm giá trị
	                // });
	            }
	            return schoolYears;
	        },
	        async getCap() {
	            return new Promise(async (resolve) => {
	
	                const res = await SearchLMSService.GetCapHoc()
	
	                if (res) {
	                    this.DSCap = res?.Result
	                    sessionStorage.setItem('ListCapHoc', JSON.stringify(this.DSCap));
	
	                    resolve()
	                } else {
	                    resolve(null) // Trả về mảng rỗng nếu không có dữ liệu
	                }
	            })
	        },
            async getKhoiHocByCapID(id) {
            return new Promise(async (resolve) => {
            let params = {
            CapID: id
            }
            const res = await SearchLMSService.GetKhoiHocbyCapHocID(params)
            
            if (res) {
            this.DSKhoi = res?.Result
            sessionStorage.setItem('ListKhoiHoc', JSON.stringify(this.DSKhoi));
            
            resolve()
            } else {
            resolve(null) // Trả về mảng rỗng nếu không có dữ liệu
            }
            })
            },
	        async getLopHocbyKhoiID(id) {
	            return new Promise(async (resolve) => {
	                let params = {
	                    KhoiID: id
	                }
	                const res = await SearchLMSService.GetLopHocbyKhoiID(params)
	
	                if (res) {
	                    this.DSLop = res?.Result
	                    sessionStorage.setItem('ListLop', JSON.stringify(this.DSLop));
	
	                    resolve()
	                } else {
	                    resolve(null) // Trả về mảng rỗng nếu không có dữ liệu
	                }
	            })
	        },
			
	       async getGiaoVien(GiaoVienID = null) {
				return new Promise(async (resolve) => {
				let res;
				let params = {};
				
				// Kiểm tra từng tham số để thêm vào params
				if (GiaoVienID) params.GiaoVienID = GiaoVienID;
				
				
				// Gọi API
				if (Object.keys(params).length > 0) {
				res = await SearchLMSService.GetGiaoVienByID(params);
				} else {
				res = await SearchLMSService.GetGiaoVienByID();
				}
				// Xử lý kết quả trả về
				if (res) {
				this.DSGiaoVien = res?.Result;
				sessionStorage.setItem('ListGiaoVien', JSON.stringify(this.DSGiaoVien));
				resolve();
				} else {
				resolve(null); // Trả về null nếu không có dữ liệu
				}
				});
			},
			async getGiaoVienByToGiangDay(GiaoVienID = null, ToGiangDayID = null) {
				return new Promise(async (resolve) => {
				let res;
				let params = {};
				
				// Kiểm tra từng tham số để thêm vào params
				if (GiaoVienID) params.GiaoVienID = GiaoVienID;
				if (ToGiangDayID) params.ToGiangDayID = ToGiangDayID;

				
				// Gọi API
				if (Object.keys(params).length > 0) {
				res = await SearchLMSService.GiaoVienByToGiangDayID_Get(params);
				} else {
				res = await SearchLMSService.GiaoVienByToGiangDayID_Get();
				}
				
				// Xử lý kết quả trả về
				if (res) {
				this.DSGiaoVien = res?.Result;
				sessionStorage.setItem('ListGiaoVien', JSON.stringify(this.DSGiaoVien));
				resolve();
				} else {
				resolve(null); // Trả về null nếu không có dữ liệu
				}
				});
			},
			async getToBoMon(CapID = null) {
				return new Promise(async (resolve) => {
				let res;
				let params = {};
				
				// Kiểm tra từng tham số để thêm vào params
				if (CapID) params.CapID = CapID;
				
				
				// Gọi API
				if (Object.keys(params).length > 0) {
				res = await SearchLMSService.GetToBoMonByID(params);
				} else {
				res = await SearchLMSService.GetToBoMonByID();
				}
				
				// Xử lý kết quả trả về
				if (res) {
				this.DSMonHoc = res?.Result;
				sessionStorage.setItem('ListMonHoc', JSON.stringify(this.DSMonHoc));
				resolve();
				} else {
				resolve(null); // Trả về null nếu không có dữ liệu
				}
				});
			},
			async getMonHoc(CapID = null, LopID = null, NienKhoa = null) {
				return new Promise(async (resolve) => {
					let res;
					let params = {};
					
					// Kiểm tra từng tham số để thêm vào params
					if (CapID) params.CapID = CapID;
					if (LopID) params.LopID = LopID;
					if (NienKhoa) params.NienKhoa = NienKhoa;
					
					// Gọi API
					if (Object.keys(params).length > 0) {
						res = await SearchLMSService.GetMonHocByID(params);
					} else {
						res = await SearchLMSService.GetMonHocByID();
					}
					
					// Xử lý kết quả trả về
					if (res) {
						this.DSMonHoc = res?.Result;
						
						sessionStorage.setItem('ListMonHoc', JSON.stringify(this.DSMonHoc));
					resolve();
					} else {
					resolve(null); // Trả về null nếu không có dữ liệu
					}
				});
			},

			async getToGiangDay(CapID = null) {
				return new Promise(async (resolve) => {
					let res;
					let params = {};
					
					// Kiểm tra từng tham số để thêm vào params
					if (CapID) params.CapID = CapID;
					
					// Gọi API
					if (Object.keys(params).length > 0) {
						res = await SearchLMSService.GetToBoMonByID(params);
					} else {
						res = await SearchLMSService.GetToBoMonByID();
					}
					
					// Xử lý kết quả trả về
					if (res) {
						this.DSToGiangDay = res?.Result;
						
						sessionStorage.setItem('ListToGiangDay', JSON.stringify(this.DSToGiangDay));
					resolve();
					} else {
					resolve(null); // Trả về null nếu không có dữ liệu
					}
				});
			},
			resetDataStorage()
			{
				sessionStorage.clear();
			}

	
	
	    },
	}
</script>