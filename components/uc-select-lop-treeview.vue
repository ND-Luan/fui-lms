<template>
	<v-treeview v-model:selected="selected" :items="treeItems" select-strategy="classic" item-value="id" return-object
		selectable open-on-click
		 @update:modelValue ="onActiveUpdate" />
	</v-treeview>
</template>

<script>
	export default {
		props: [],
		data() {
			return {
				DSNienKhoa: null,
				nienKhoaNow: null,
				DSLop: null,
				selected: null,
				treeItems: [
	
				],
				selected: [], // ID đã chọn
				open: [] // ID đã mở rộng
			}
		},
		mounted() {
			this.NienKhoa_Get()
		},
		computed: {},
		watch: {},
		methods: {
			onActiveUpdate(val) {
				
					vueData.lopselected = val
				
					this.$emit('lop-selected', val);
				
			},
			async NienKhoa_Get() {
				this.isLoading = true
				let res = await new Promise((resolve, reject) => {
					ajaxCALL('lms/NienKhoa_Get', {}, res => {
						resolve(res)
					}, err => {
						reject(err)
					})
				})
				if (res.data.length > 0) {
					this.DSNienKhoa = res.data
					this.nienKhoaNow = res.data.filter(item => item.IsActive == 1)[0].NienKhoa
					let res1 = await new Promise((resolve, reject) => {
						ajaxCALL('lms/Lop_Get_ByNienKhoa', {
							NienKhoa: this.nienKhoaNow
						}, res1 => {
							resolve(res1)
						}, err1 => {
							reject(err1)
						})
					})
					if (res1.data.length > 0) {
						this.DSLop = res1.data
						this.convertLopToTreeView(this.DSLop)
					}
				}
				this.isLoading = false
			},
			convertLopToTreeView(danhSachLop) {
				const tree = [];
	
				// Helper: Xác định cấp từ KhoiID
				const getCapHoc = (khoi) => {
					if (khoi >= 1 && khoi <= 5) return { id: 'cap_1', name: 'Cấp 1' };
					if (khoi >= 6 && khoi <= 9) return { id: 'cap_2', name: 'Cấp 2' };
					if (khoi >= 10 && khoi <= 12) return { id: 'cap_3', name: 'Cấp 3' };
					return { id: 'cap_khac', name: 'Khác' };
				};
	
				// Cấu trúc tạm để gom nhóm
				const capMap = {};
	
				for (const lop of danhSachLop) {
					const khoi = lop.KhoiID;
					const cap = getCapHoc(khoi);
					const capKey = cap.id;
					const khoiKey = `khoi_${khoi}`;
	
					// Nếu chưa có cấp → tạo
					if (!capMap[capKey]) {
						capMap[capKey] = {
							id: cap.id,
							title: cap.name,
							children: {}
						};
					}
	
					// Nếu chưa có khối trong cấp → tạo
					if (!capMap[capKey].children[khoiKey]) {
						capMap[capKey].children[khoiKey] = {
							id: khoiKey,
							title: `Khối ${khoi}`,
							children: []
						};
					}
	
					// Thêm lớp vào khối
					capMap[capKey].children[khoiKey].children.push({
						id: `lop_${lop.LopID}`,
						title: lop.TenLop,
						LopID: lop.LopID,
						raw: lop // lưu lại object gốc nếu cần dùng sau
					});
				}
	
				// Convert map → array
				for (const capKey in capMap) {
					const cap = capMap[capKey];
					cap.children = Object.values(cap.children);
					tree.push(cap);
				}
				this.treeItems = tree
				return tree;
			}
	
	
		},
	}
</script>