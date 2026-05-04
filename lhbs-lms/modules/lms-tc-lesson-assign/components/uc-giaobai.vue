<template>
	<v-container fluid>
		<!-- Tabs -->
		<v-tabs v-model="tab" bg-color="grey-lighten-4">
			<v-tab v-for="item in tabs" :key="item">{{ item }}</v-tab>
		</v-tabs>

		<!-- Bộ lọc -->
		<v-row class="my-4" align="center" no-gutters>
			<v-col cols="12" md="2" class="pa-2">
				<v-select label="Bộ môn" :items="boMonList" v-model="filter.boMon" density="comfortable"></v-select>
			</v-col>
			<v-col cols="12" md="2" class="pa-2">
				<v-select label="Trạng thái" :items="trangThaiList" v-model="filter.trangThai" density="comfortable">
				</v-select>
			</v-col>
			<v-col cols="12" md="2" class="pa-2">
				<v-select label="Loại bài" :items="loaiBaiList" v-model="filter.loaiBai" density="comfortable">
				</v-select>
			</v-col>
			<v-col cols="12" md="2" class="pa-2">
				<v-btn color="orange" variant="outlined" @click="resetFilter">Đặt lại</v-btn>
			</v-col>
			<v-spacer></v-spacer>
			<v-col cols="12" md="2" class="pa-2 text-right">
				<v-btn color="orange" dark @click="dialogGiaoBai = true">Giao bài</v-btn>
			</v-col>
		</v-row>

		<!-- Bảng -->
		<v-data-table :headers="headers" :items="items" class="elevation-1" density="comfortable">
			<!-- Cột trạng thái -->
			<template v-slot:item.trangThai="{ item }">
				<v-chip v-if="item.trangThai === 'Chưa diễn ra'" color="orange" text-color="white" size="small">
					{{ item.trangThai }}
				</v-chip>
				<v-chip v-else-if="item.trangThai === 'Đang diễn ra'" color="green" text-color="white" size="small">
					{{ item.trangThai }}
				</v-chip>
				<v-chip v-else color="red" text-color="white" size="small">
					{{ item.trangThai }}
				</v-chip>
			</template>

			<!-- Cột thao tác -->
			<template v-slot:item.thaoTac="{ item }">
				<v-icon size="small" class="me-2" @click="editItem(item)">mdi-pencil</v-icon>
				<v-icon size="small" class="me-2" @click="deleteItem(item)">mdi-delete</v-icon>
				<v-btn v-if="item.trangThai === 'Đã kết thúc'" variant="text" color="primary" size="small">
					Công bố điểm
				</v-btn>
			</template>
		</v-data-table>

		<!-- Dialog Giao bài -->
		<v-dialog v-model="dialogGiaoBai" max-width="600px">
			<v-card>
				<v-card-title class="text-h6">Giao bài</v-card-title>
				<v-card-text>
					<v-form ref="formGiaoBai">
						<v-text-field label="Tên bài" v-model="giaoBai.tenBai" required></v-text-field>
						<v-select label="Bộ môn" :items="boMonList" v-model="giaoBai.boMon" required></v-select>
						<v-select label="Loại bài" :items="loaiBaiList" v-model="giaoBai.phanLoai" required></v-select>
						<v-text-field label="Đối tượng giao" v-model="giaoBai.doiTuongGiao"></v-text-field>
						<v-text-field label="Ngày giao" v-model="giaoBai.ngayGiao" type="datetime-local"></v-text-field>
						<v-text-field label="Thời gian làm bài" v-model="giaoBai.thoiGianLamBai" type="text">
						</v-text-field>
					</v-form>
				</v-card-text>
				<v-card-actions>
					<v-spacer></v-spacer>
					<v-btn text @click="dialogGiaoBai = false">Hủy</v-btn>
					<v-btn color="orange" dark @click="luuGiaoBai">Lưu</v-btn>
				</v-card-actions>
			</v-card>
		</v-dialog>
	</v-container>
</template>

<script>
	export default {
  name: "BaiDaGiao",
  data() {
    return {
      tab: 2,
      tabs: [
        "Thời khóa biểu",
        "Kế hoạch giảng dạy",
        "Bài đã giao",
        "Điểm danh và nhận xét",
        "Danh sách học sinh",
        "Bảng điểm"
      ],
      boMonList: ["Tiếng Anh", "Toán", "Ngữ Văn"],
      trangThaiList: ["Chưa diễn ra", "Đang diễn ra", "Đã kết thúc"],
      loaiBaiList: ["Kiểm tra đánh giá", "Tài liệu trên lớp", "Tài liệu về nhà"],
      filter: {
        boMon: null,
        trangThai: null,
        loaiBai: null
      },
      headers: [
        { title: "STT", key: "stt", width: 50 },
        { title: "Tên bài", key: "tenBai" },
        { title: "Bộ môn", key: "boMon" },
        { title: "Phân loại", key: "phanLoai" },
        { title: "Đối tượng giao", key: "doiTuongGiao" },
        { title: "Ngày giao", key: "ngayGiao" },
        { title: "Thời gian làm bài", key: "thoiGianLamBai" },
        { title: "Trạng thái", key: "trangThai" },
        { title: "Thao tác", key: "thaoTac", sortable: false }
      ],
      items: [
        {
          stt: 1,
          tenBai: "Đề 6 - Tiếng Anh 1 i-Learn Smart Start",
          boMon: "Tiếng Anh",
          phanLoai: "Kiểm tra đánh giá",
          doiTuongGiao: "Cả lớp",
          ngayGiao: "2024-12-12 10:00",
          thoiGianLamBai: "Từ 12/12/2024 12:00 Đến 14/12/2024 12:00",
          trangThai: "Chưa diễn ra"
        }
      ],
      // Dialog
      dialogGiaoBai: false,
      giaoBai: {
        tenBai: "",
        boMon: null,
        phanLoai: null,
        doiTuongGiao: "",
        ngayGiao: "",
        thoiGianLamBai: ""
      }
    };
  },
  methods: {
    resetFilter() {
      this.filter = { boMon: null, trangThai: null, loaiBai: null };
    },
    editItem(item) {
      console.log("Edit", item);
    },
    deleteItem(item) {
      console.log("Delete", item);
    },
    luuGiaoBai() {
      if (!this.giaoBai.tenBai || !this.giaoBai.boMon || !this.giaoBai.phanLoai) {
        alert("Vui lòng nhập đủ thông tin bắt buộc!");
        return;
      }
      const newItem = {
        stt: this.items.length + 1,
        ...this.giaoBai,
        trangThai: "Chưa diễn ra"
      };
      this.items.push(newItem);
      this.dialogGiaoBai = false;
      this.giaoBai = { tenBai: "", boMon: null, phanLoai: null, doiTuongGiao: "", ngayGiao: "", thoiGianLamBai: "" };
    }
  }
}
</script>