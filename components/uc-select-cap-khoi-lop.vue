<template>
	<!-- Template remains the same -->
	<div>
		<v-card>
			<div class="d-flex align-center">
				<div>
					<v-card-title class="text-primary">Chọn {{ Title }}</v-card-title>
				</div>
				<div class="ml-auto">
					<v-btn class="text-primary" @click="clearFilter">Xoá bộ lọc {{ Title }}</v-btn>
				</div>
			</div>
			<v-card-text>
				<v-row>
					<v-col cols="3" sm="6" md="3" v-if="!hidenienkhoa">
						<v-autocomplete :disabled="DisableNienKhoa" :items="schoolYears" label="Chọn niên khóa"
							item-title="text" item-value="value" v-model="selectedSchoolYear"
							dense clearable hide-details="auto" />
					</v-col>
					<v-col cols="3" sm="6" md="3" v-if="!hidecap">
						<v-autocomplete v-model="CapItem" label="Chọn cấp học" :items="DSCap" item-title="TenCapHoc"
							item-value="CapID" outlined dense clearable hide-details />
					</v-col>
					<v-col cols="3" sm="6" md="3" v-if="!hidekhoi">
						<v-autocomplete :disabled="DisableKhoi" v-model="KhoiItem" label="Chọn khối" :items="DSKhoi"
							item-title="TenKhoiHoc" item-value="KhoiID" outlined dense clearable hide-details />
					</v-col>
					<v-col cols="3" sm="6" md="3" v-if="!hidelop">
						<v-autocomplete :disabled="DisableLop" v-model="LopItem" label="Chọn lớp" :items="DSLop"
							item-title="TenLop" item-value="LopID" outlined dense clearable hide-details />
					</v-col>
				</v-row>
				<v-row>
					<v-col cols="3" sm="6" md="3" v-if="!hidetogiangday">
						<v-autocomplete :disabled="DisableToGiangDay" v-model="ToGiangDayItem" label="Chọn Tổ giàng dạy"
							:items="DSToGiangDay" item-title="ToDayName" item-value="ToGiangDayID" outlined dense clearable
							hide-details />
					</v-col>
					<v-col cols="4" sm="6" md="4" v-if="!hidemon">
						<v-autocomplete :disabled="DisableMon" v-model="MonHocItem" label="Chọn môn học" :items="DSMonHoc"
							item-title="MonHocName" item-value="MonHocID" outlined dense hide-details />
					</v-col>
					<v-col cols="4" sm="6" md="4" v-if="!hidegiaovien">
						<v-autocomplete :disabled="DisableGiaoVien" v-model="GiaoVienItem" label="Chọn giáo viên"
							:items="DSGiaoVien" item-title="HoTenGV" item-value="GiaoVienID" outlined dense
							hide-details />
					</v-col>
				</v-row>
			</v-card-text>
		</v-card>
	</div>
</template>

<script>
	export default {
		name: "BaseFilter",
	
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
				default: 5 // Default to show 5 years in the past
			},
			futureYears: {
				type: Number,
				required: false,
				default: 0 // Default to current year
			},
			hidenienkhoa: {
				type: Boolean,
				required: false,
				default: false,
			},
			"hidecap": {
				type: Boolean,
				required: false,
				default: false,
			},
			"hidekhoi": {
				type: Boolean,
				required: false,
				default: false,
			},
			"hidelop": {
				type: Boolean,
				required: false,
				default: false,
			},
			"hidetogiangday": {
			type: Boolean,
			required: false,
			default: false,
			},
			"hidemon": {
				type: Boolean,
				required: false,
				default: false,
			},
			
			"hidegiaovien": {
				type: Boolean,
				required: false,
				default: false,
			},
		},
	
		data() {
			return {
				Title: "",
				CapItem: null,
				KhoiItem: null,
				LopItem: null,
				MonHocItem: null,
				ToGiangDayItem: null,
				GiaoVienItem: null,
	
				DSCap: [],
				DSKhoi: [],
				DSLop: [],
				DSMonHoc: [],
				DSGiaoVien: [],
				DSToGiangDay: [],
	
				DisableKhoi: true,
				DisableLop: true,
				DisableMon: false,
				DisableGiaoVien: false,
				DisableNienKhoa: false,
				DisableToGiangDay: false,
	
				// HideKhoi:this.HideKhoi,
				// HideLop:this.HideLop,
				// HideMon:this.HideMon,
				// HideGiaoVien: this.HideGiaoVien,
				// HideNienKhoa: this.HideNienKhoa,
	
				selectedSchoolYear: this.getCurrentSchoolYear(),
			}
		},
	
		mounted() {
			this.initializeData()
				console.log('hide cap:', this.hidecap);
				console.log('hide Khoi:', this.hidekhoi);
					console.log('hide lop:', this.hidelop);
		},
	
		computed: {
			schoolYears() {
				const currentYear = this.yearNow
				const years = []
	
				// Add past years
				for (let i = this.pastYears; i >= -this.futureYears; i--) {
					const year = currentYear - i
					years.push({
						text: `${year}-${year + 1}`,
						value: year
					})
				}
	
				return years
			},
	
			defaultSchoolYear() {
				return this.getCurrentSchoolYear()
			}
		},
	
		watch: {
		
			CapItem: {
				handler(newValue) {
					
					if (!newValue) {
						this.resetCapDependentData()
						this.updateSessionStorage('Cap', null)
						return
					}
					this.handleCapChange(newValue)
					this.updateSessionStorage('Cap', newValue, this.DSCap.find(x => x.CapID === newValue)?.TenCapHoc)
				}
			},
	
			KhoiItem: {
				handler(newValue) {
					if (!newValue) {
						this.resetKhoiDependentData()
						this.updateSessionStorage('Khoi', null)
						return
					}
					this.getLopHocbyKhoiID(newValue)
					this.updateSessionStorage('Khoi', newValue, this.DSKhoi.find(x => x.KhoiID === newValue)?.TenKhoiHoc)
					this.DisableLop = false
				}
			},
	
			LopItem: {
				handler(newValue) {
					if (!newValue) {
						this.MonHocItem = null
						this.updateSessionStorage('Lop', null)
						return
					}
					this.updateSessionStorage('Lop', newValue, this.DSLop.find(x => x.LopID === newValue)?.TenLop)
				}
			},
	
			ToGiangDayItem: {
				handler(newValue) {
					if (!newValue) {
						this.resetToGiangDayDependentData()
						this.updateSessionStorage('ToGiangDay', null)
						return
					}
					this.handleToGiangDayChange(newValue)
					this.updateSessionStorage('ToGiangDay', newValue, this.DSToGiangDay.find(x => x.ToGiangDayID === newValue)?.ToDayName)
				}
			},
	
			MonHocItem: {
				handler(newValue) {
					if (!newValue) {
						this.resetMonHocDependentData()
						this.updateSessionStorage('MonHoc', null)
						return
					}
					this.updateSessionStorage('MonHoc', newValue, this.DSMonHoc.find(x => x.MonHocID === newValue)?.MonHocName)
				}
			},
	
			GiaoVienItem: {
				handler(newValue) {
					if (!newValue) {
						this.updateSessionStorage('GiaoVien', null)
						return
					}
					if (this.CapItem && this.ToGiangDayItem) {
						this.getMonHoc(this.CapItem, null, this.ToGiangDayItem)
					}
					this.updateSessionStorage('GiaoVien', newValue, this.DSGiaoVien.find(x => x.GiaoVienID === newValue)?.HoTenGV)
				}
			},
	
			selectedSchoolYear: {
				handler(newValue) {
					if (newValue) {
						sessionStorage.setItem('NienKhoaSelected', newValue.toString())
						// Emit the school year in the format "2023-2024"
						this.$emit('school-year-changed', `${newValue}-${newValue + 1}`)
					} else {
						sessionStorage.removeItem('NienKhoaSelected')
					}
					this.emitSessionData()
				},
				immediate: true
			},
	
			// Watch for changes in list data
			DSCap: {
				handler(newValue) {
					if (newValue?.length) {
						sessionStorage.setItem('ListCapHoc', JSON.stringify(newValue))
					}
				}
			},
			DSKhoi: {
				handler(newValue) {
					if (newValue?.length) {
						sessionStorage.setItem('ListKhoiHoc', JSON.stringify(newValue))
					}
				}
			},
			DSLop: {
				handler(newValue) {
					if (newValue?.length) {
						sessionStorage.setItem('ListLop', JSON.stringify(newValue))
					}
				}
			},
			DSMonHoc: {
				handler(newValue) {
					if (newValue?.length) {
						sessionStorage.setItem('ListMonHoc', JSON.stringify(newValue))
					}
				}
			},
			DSGiaoVien: {
				handler(newValue) {
					if (newValue?.length) {
						sessionStorage.setItem('ListGiaoVien', JSON.stringify(newValue))
					}
				}
			},
			DSToGiangDay: {
				handler(newValue) {
					if (newValue?.length) {
						sessionStorage.setItem('ListToGiangDay', JSON.stringify(newValue))
					}
				}
			}
		},
	
		methods: {
			getCurrentSchoolYear() {
				
			const currentDate = new Date()
			const currentMonth = currentDate.getMonth() + 1 // JavaScript months are 0-based
			const currentYear = this.yearNow
			
			// If we're in the later months of the year (e.g., after September),
			// consider it part of the new school year
			if (currentMonth >= 9) {
			return currentYear
			} else {
			return currentYear - 1
			}
			},
			updateSessionStorage(key, id, name) {
				if (id) {
					sessionStorage.setItem(`${key}IDSelected`, id)
					sessionStorage.setItem(`${key}NameSelected`, name)
				} else {
					sessionStorage.removeItem(`${key}IDSelected`)
					sessionStorage.removeItem(`${key}NameSelected`)
				}
				this.emitSessionData()
			},
	
			async emitSessionData() {
				const sessionData = {}
				for (let i = 0; i < sessionStorage.length; i++) {
					const key = sessionStorage.key(i)
					const value = sessionStorage.getItem(key)
					try {
						sessionData[key] = JSON.parse(value)
					} catch {
						sessionData[key] = value
					}
				}
				console.log("event-change")
				await this.$emit('session-data-changed', sessionData)
			},
	
			// ... rest of the methods remain the same ...
			async initializeData() {
				const storedYear = sessionStorage.getItem('NienKhoaSelected')
				this.selectedSchoolYear = storedYear ? parseInt(storedYear) : this.getCurrentSchoolYear()
	
				await Promise.all([
					this.getCap(),
					this.getGiaoVien(),
					this.getToGiangDay(),
					this.getMonHoc()
				])
			},
	
			resetCapDependentData() {
				
				if (!this.ToGiangDayItem || !this.CapItem) {
					this.DSToGiangDay = []
					this.ToGiangDayItem = null
					sessionStorage.removeItem("ToGiangDayIDSelected");
					sessionStorage.removeItem("ToGiangDayNameSelected");
				}
			
				this.DSKhoi = []
				this.DSLop = []
				this.DSToGiangDay = []
				this.DSMonHoc = []
				this.KhoiItem = null
				this.LopItem = null
				this.MonHocItem = null
				this.DisableKhoi = false
				this.DisableLop = true
				this.DisableMon = false
				sessionStorage.removeItem("CapIDSelected");
				sessionStorage.removeItem("CapNameSelected");
				sessionStorage.removeItem("GiaoVienIDSelected");
				sessionStorage.removeItem("GiaoVienNameSelected");
				sessionStorage.removeItem("ListKhoiHoc");
				sessionStorage.removeItem("ListMonHoc");
				sessionStorage.removeItem("MonHocIDSelected");
				sessionStorage.removeItem("MonHocNameSelected");


	
				this.getKhoiHocByCapID()
				this.getMonHoc()
				this.getToGiangDay()
				this.getGiaoVien()

			},
	
			resetKhoiDependentData() {
				this.DSLop = []
				this.LopItem = null
				this.DisableLop = false
			},
	
			resetToGiangDayDependentData() {
				this.DSGiaoVien = []
				this.DSMonHoc = []
				this.GiaoVienItem = null
				this.MonHocItem = null
			},
	
			resetMonHocDependentData() {
				this.MonHocItem = null
			},
	
			async handleCapChange(capId) {
				this.resetCapDependentData()
				
				await Promise.all([
					this.getKhoiHocByCapID(capId),
					this.getToGiangDay(capId),
					this.getMonHoc(capId)
				])
			},
	
			async handleToGiangDayChange(toGiangDayId) {
				if (!this.CapItem) {
					
					const capId = this.DSToGiangDay.find(item => item.ToGiangDayID === toGiangDayId)?.CapID
					if (capId) {
						this.CapItem = capId
					}
				}
	
				if (toGiangDayId && this.CapItem) {
					
					this.resetToGiangDayDependentData()
					await Promise.all([
						this.getGiaoVien(null, toGiangDayId, this.CapItem),
						this.getMonHoc(this.CapItem, null, toGiangDayId)
					])
				}
			},
	
			async clearFilter() {
				sessionStorage.clear()
				this.CapItem = null
				this.KhoiItem = null
				this.LopItem = null
				this.MonHocItem = null
				this.ToGiangDayItem = null
				this.GiaoVienItem = null
				this.selectedSchoolYear = this.getCurrentSchoolYear()
				this.DSCap = []
				this.DSKhoi = []
				this.DSLop = []
				this.DSMonHoc = []
				this.DSGiaoVien = []
				this.DSToGiangDay = []
	
				await this.initializeData()
				this.emitSessionData()
			},
	
			// API calls remain the same
			async getCap() {
				const res = await SearchLMSService.GetCapHoc()
				if (res?.Result) {
					this.DSCap = res.Result
				}
			},
	
			async getKhoiHocByCapID(id) {
				const res = await SearchLMSService.GetKhoiHocbyCapHocID({ CapID: id })
				if (res?.Result) {
					this.DSKhoi = res.Result
				}
			},
	
			async getLopHocbyKhoiID(id) {
				const res = await SearchLMSService.GetLopHocbyKhoiID({ KhoiID: id })
				if (res?.Result) {
					this.DSLop = res.Result
				}
			},
	
	
			async getGiaoVien(GiaoVienID = null, ToGiangDayID = null, CapID = null) {
				const params = {}
				if (GiaoVienID) params.GiaoVienID = GiaoVienID
				if (ToGiangDayID) params.ToGiangDayID = ToGiangDayID
				if (CapID) params.CapID = CapID
	
				const res = await SearchLMSService.GetGiaoVienByID(params)
				if (res?.Result && res.Result !== 'command completed') {
					this.DSGiaoVien = _.uniqBy(res.Result, 'GiaoVienID')
				}
			},
	
			async getToGiangDay(CapID = null) {
				const params = CapID ? { CapID } : {}
				const res = await SearchLMSService.GetToBoMonByID(params)
				if (res?.Result) {
					this.DSToGiangDay = res.Result
				}
			},
	
			async getMonHoc(CapID = null, LopID = null, ToGiangDayID = null) {
				const params = {}
				if (CapID) params.CapID = CapID
				if (LopID) params.LopID = LopID
				if (ToGiangDayID) params.ToGiangDayID = ToGiangDayID
	
				const res = await SearchLMSService.GetMonHocByID(params)
				if (res?.Result) {
					this.DSMonHoc = res.Result
				}
			}
		}
	}
</script>

<style scoped>
	.filter-container {
		margin-bottom: 1rem;
	}

	.filter-row {
		display: flex;
		flex-wrap: wrap;
		margin: -0.5rem;
	}

	.filter-col {
		padding: 0.5rem;
	}

	@media (max-width: 600px) {
		.filter-col {
			flex: 0 0 100%;
		}
	}
</style>