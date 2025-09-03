<template>
	<v-dialog max-width="500">
		<template v-slot:activator="{ props: activatorProps }">
			<v-btn v-bind="activatorProps" prepend-icon="mdi-plus-circle-outline" variant="tonal" size="small">
				Tạo nội dung
			</v-btn>
		</template>

		<template v-slot:default="{ isActive }">
			<v-card>
				<v-card-title class="d-flex align-center">
					Tạo nội dung
					<v-spacer />
					<v-icon @click="isActive.value = false">mdi-close</v-icon>
				</v-card-title>
				<v-card-text>
					<v-form ref="form">
						<v-row>
							<v-col cols="12">
								<!-- Thông tin Khối - Môn (bên trái) -->
								<div class="d-flex align-center">
									<v-avatar :color="getSubjectColor(group.MonHocName)" size="40" class="mr-4">
										<v-icon color="white">{{ getSubjectIcon(group.MonHocName) }}</v-icon>
									</v-avatar>
									<div>
										<div class="text-overline">{{ group.TenKhoi }}</div>
										<div class="text-h6">{{ group.MonHocName }}</div>
									</div>
								</div>
							</v-col>
							<v-col cols="12">
								<v-select :items="typeItems" item-title='text' item-value='value' v-model="form.type"
									label="Chọn loại" />
							</v-col>
							<v-col cols="12">
								<v-select :items="DSTuan" item-title='Tuan_HienThi' item-value='TuanHocID'
									v-model="form.TuanHocID" label="Chọn tuần học" />
							</v-col>
							<v-col cols="12">
								<v-text-field v-model="form.Chuong" label="Chương" :rules="[v => !!v || 'Vui lòng nhập chương']" required />
							</v-col>
							<v-col cols="12">
								<v-text-field v-model="form.Title" label="Tiêu đề" required :rules="[v => !!v || 'Vui lòng nhập tiêu đề']"/>
							</v-col>
							<v-col cols="12">
								<v-text-field v-if="form.type == 1" v-model="form.Description" label="Mô tả"  />
								<v-text-field v-else v-model="form.Instructions" label="Hướng dẫn" />
							</v-col>

						</v-row>
					</v-form>
				</v-card-text>
				<v-card-actions>
					<v-spacer />
					<v-btn @click="isActive.value = false" text="Đóng" />
					<v-btn @click="handleSubmit(isActive)" color="primary" variant="elevated" text="Tạo" />
				</v-card-actions>
			</v-card>
		</template>
	</v-dialog>
	<FWindowCustom :win-data="vueData.winData" v-model:dialogOpen="vueData.isOpenWindowCustom"></FWindowCustom>
</template>

<script>
	export default {
		props: {
			khoiid: Number,
			monhocid: Number,
			group: Object
		},
		data() {
			return {
				form: {
					Title: "",
					Instructions: "",
					Description: "",
					TuanHocID: null,
					Chuong: "",
					type: 1
				},
				typeItems: [
					{ text: 'Tạo bài học', value: 1 },
					{ text: 'Tạo bài tập', value: 0 }
				],
				vueData,
			}
		},
		mounted() { },
		computed: {
			DSTuan: function () {
				this.form.TuanHocID = vueData.DSTuanHoc.find(tuan => tuan.Is_Active)?.TuanHocID 
				return vueData.DSTuanHoc
			}
			
		},
		watch: {},
		methods: {
			clearData(){
			
			this.form.Title= ""
			this.form.Instructions= ""
			this.form.Description= ""
			this.form.TuanHocID= null
			this.form.Chuong= ""
			},
			async handleSubmit(isActive) {
				
				const { valid } = await this.$refs.form.validate()
				
				if (!valid) {
					
				Vue.$toast.error("Vui lòng nhập đầy đủ thông tin", { position: "top" });
				return;
				}
				
				if (valid) {
					if (this.form.type == 0) {
						ajaxCALL('lms/EL_Assignment_Ins', {
							...this.form,
							MonHocID: this.monhocid,
							KhoiID: this.khoiid,
							NienKhoa: vueData.NienKhoa,
							HocKi: 1
						}, res => {
							Vue.$toast.success('Tạo bài tập thành công', { position: "top" })
							this.clearData();
							isActive.value = false
	
							vueData.apiCall3()
	
							openWindow({
								title: "Soạn bài tập",
								url: `/lms_tc_asm_builder?AssignmentID=${res?.data[0].AssignmentID}`,
								id: "WinSoanBaiTap",
								onclose: {
									"EXE": "apiCall3()"
								}
							});
						},
						err => {
						// xử lý khi lỗi
						Vue.$toast.error(err?.response?.data?.Message || 'Có lỗi xảy ra, vui lòng kiểm tra lại dữ liệu nhập vào!', { position: "top" });
						}
						)
					}
					else {
						ajaxCALL('lms/EL_Lesson_Save', {
							...this.form,
							MonHocID: this.monhocid,
							KhoiID: this.khoiid,
							NienKhoa: vueData.NienKhoa,
							HocKi: 1,
							Status: 1
						}, res => {
							Vue.$toast.success('Tạo bài học thành công', { position: "top" })
							isActive.value = false
							this.clearData();
							openWindow({
								title: "Soạn lesson",
								url: `lms_tc_lesson_builder?LessonID=${res?.data[0].LessonID}`,
								id: "WinSoanBaiGiang",
								onclose: {
									"EXE": "apiCall3()"
								}
							});
						},
						err => {
						// xử lý khi lỗi
						Vue.$toast.error(err?.response?.data?.Message || 'Có lỗi xảy ra, vui lòng kiểm tra lại dữ liệu nhập vào!', { position: "top" });
						})
					}
				}
			},
			getSubjectIcon(subjectName) {
				const name = (subjectName || '').toLowerCase();
				if (name.includes('toán')) return 'mdi-calculator-variant';
				if (name.includes('tin học') || name.includes('robotics')) return 'mdi-robot-industrial';
				if (name.includes('văn') || name.includes('việt')) return 'mdi-book-open-page-variant';
				if (name.includes('anh')) return 'mdi-translate';
				if (name.includes('lý')) return 'mdi-atom';
				if (name.includes('hóa')) return 'mdi-flask';
				return 'mdi-school';
			},
			getSubjectColor(subjectName) {
				const name = (subjectName || '').toLowerCase();
				if (name.includes('toán')) return 'blue';
				if (name.includes('tin học') || name.includes('robotics')) return 'teal';
				if (name.includes('văn') || name.includes('việt')) return 'red';
				if (name.includes('anh')) return 'purple';
				if (name.includes('lý')) return 'indigo';
				if (name.includes('hóa')) return 'green';
				return 'grey';
			},
		},
	}
</script>