<template>
	<div>
		<!-- Thanh filter -->
		<div class="filter-bar">
			<v-text-field v-model="search" label="Tìm kiếm theo tên học viên" density="compact" hide-details
				variant="outlined" class="mr-2"></v-text-field>

			<v-select v-model="statusFilter" :items="statusOptions" label="Trạng thái nộp bài" density="compact"
				hide-details variant="outlined" class="mr-2"></v-select>

			<v-btn color="orange" @click="resetFilter">Đặt lại</v-btn>
		</div>

		<!-- Nút hành động -->
		<div class="action-bar">
			<div class="max-score">Điểm tối đa: 10 điểm</div>
			<div>
				<v-btn color="orange" class="mr-2">Công bố điểm</v-btn>
				<v-btn outlined color="orange">Import bảng điểm</v-btn>
			</div>
		</div>

		<!-- Bảng -->
		<v-data-table :headers="headers" :items="filteredStudents" :search="search" class="custom-table elevation-1">
			<!-- Cột trạng thái -->
			<template v-slot:item.status="{ item }">
				<v-chip :color="item.status === 'Đã nộp bài' ? 'success' : 'grey'" size="small" variant="flat">
					{{ item.status }}
				</v-chip>
			</template>

			<!-- Cột hành động -->
			<template v-slot:item.actions="{ item }">
				<v-btn size="small" color="blue" variant="flat">Xem bài làm</v-btn>
			</template>
		</v-data-table>
	</div>
</template>

<script>
	export default {
  name: "DanhSachHocSinh",
  data() {
    return {
      search: "",
      statusFilter: null,
      statusOptions: ["Đã nộp bài", "Chưa nộp bài"],
      headers: [
        { title: "STT", key: "stt" },
        { title: "Mã Học Sinh", key: "code" },
        { title: "Họ Và Tên", key: "name" },
        { title: "Số Điện Thoại", key: "phone" },
        { title: "Trạng Thái Nộp Bài", key: "status" },
        { title: "Điểm Chấm Tự Động", key: "autoScore" },
        { title: "Điểm GV Chấm", key: "teacherScore" },
        { title: "", key: "actions", sortable: false },
      ],
      students: [
        {
          stt: 1,
          code: "<Mã học sinh>",
          name: "Nguyễn Hoàng Minh Anh",
          phone: "<Số điện thoại>",
          status: "Đã nộp bài",
          autoScore: 7,
          teacherScore: 7,
        },
        {
          stt: 2,
          code: "<Mã học sinh>",
          name: "Nguyễn Hoàng Minh Anh",
          phone: "<Số điện thoại>",
          status: "Đã nộp bài",
          autoScore: 2,
          teacherScore: "N/A",
        },
        {
          stt: 3,
          code: "<Mã học sinh>",
          name: "Nguyễn Hoàng Minh Anh",
          phone: "<Số điện thoại>",
          status: "Đã nộp bài",
          autoScore: 5,
          teacherScore: 5,
        },
        {
          stt: 4,
          code: "<Mã học sinh>",
          name: "Nguyễn Hoàng Minh Anh",
          phone: "<Số điện thoại>",
          status: "Chưa nộp bài",
          autoScore: 4,
          teacherScore: 4,
        },
        {
          stt: 5,
          code: "<Mã học sinh>",
          name: "Nguyễn Hoàng Minh Anh",
          phone: "<Số điện thoại>",
          status: "Đã nộp bài",
          autoScore: 9,
          teacherScore: 9,
        },
      ],
    };
  },
  computed: {
    filteredStudents() {
      if (!this.statusFilter) return this.students;
      return this.students.filter(
        (s) => s.status === this.statusFilter
      );
    },
  },
  methods: {
    resetFilter() {
      this.search = "";
      this.statusFilter = null;
    },
  },
}
</script>

<style >
	.filter-bar {
		display: flex;
		align-items: center;
		margin-bottom: 16px;
	}

	.action-bar {
		display: flex;
		justify-content: space-between;
		margin-bottom: 16px;
	}

	.max-score {
		font-weight: bold;
		align-self: center;
	}

	/* Style header bảng */
	::v-deep(.custom-table thead th) {
		background-color: #0094ff !important;
		color: white !important;
		font-weight: bold;
	}
</style>