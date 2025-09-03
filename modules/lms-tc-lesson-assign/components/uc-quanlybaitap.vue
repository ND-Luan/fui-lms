<template>
	<div>
		<!-- Thông tin bài tập -->
		<!-- Thông tin bài tập -->
		<v-card class="mb-4" elevation="2" color="blue-grey-lighten-5">
			<v-card-title class="text-h6 font-weight-bold d-flex align-center">
				<v-icon color="primary" class="mr-2">mdi-book-open-page-variant</v-icon>
				{{ assignmentDetail.title }}
			</v-card-title>

			<v-card-subtitle class="text-body-2 mb-2">
				{{ assignmentDetail.description }}
			</v-card-subtitle>

			<v-divider></v-divider>

			<v-card-text class="text-body-2 d-flex flex-wrap">
				<div class="mr-4">
					<v-icon size="18" color="primary" class="mr-1">mdi-calendar-range</v-icon>
					Học kỳ: <strong>{{ assignmentDetail.semester || '-' }}</strong>
				</div>
				<div class="mr-4">
					<v-icon size="18" color="primary" class="mr-1">mdi-school</v-icon>
					Niên khóa: <strong>{{ assignmentDetail.schoolYear || '-' }}</strong>
				</div>

			</v-card-text>
		</v-card>

		<!-- Thanh lọc dữ liệu -->
		<v-row class="filter-bar py-2" align="center" dense>
			<v-col cols="12" sm="4" md="3">
				<v-text-field v-model="searchClass" label="Tìm kiếm lớp" prepend-inner-icon="mdi-magnify"
					density="comfortable" hide-details variant="outlined" clearable></v-text-field>
			</v-col>

			<v-col cols="12" sm="4" md="3">
				<v-select v-model="statusFilter" :items="statusOptions" label="Trạng thái"
					prepend-inner-icon="mdi-filter-variant" density="comfortable" hide-details variant="outlined"
					clearable></v-select>
			</v-col>

			<v-col cols="12" sm="4" md="2">
				<v-btn color="error" variant="elevated" block @click="resetFilter">
					<v-icon left>mdi-refresh</v-icon>
					Đặt lại
				</v-btn>
			</v-col>
		</v-row>

		<!-- Bảng danh sách lớp -->
		<v-data-table :headers="classHeaders" :items="filteredClasses" :search="searchClass"
			class="custom-table elevation-2" no-data-text="Không có dữ liệu">
			<!-- Đã nộp / Tổng -->

    <template #item.submitted="{ value }">
      <strong>{{ value }}</strong>
    </template>
    
    <template #item.seen="{ value }">
      <strong>{{ value }}</strong>
    </template>

			<!-- Trạng thái -->
			<template v-slot:item.status="{ item }">
				<v-chip :color="item.status === 'Đang mở' ? 'green' : 'grey'" text-color="white" size="small">
					{{ item.status }}
				</v-chip>
			</template>


		</v-data-table>
	</div>
</template>

<script>
	export default {
	  name: "ChiTietBaiTap",
	  props: {
	    databaitapdagiao: {
	      type: Array,
	      default: () => []
	    }
	  },
	  data() {
	    return {
	
	      assignmentDetail: { title: "", description: "" },
	      searchClass: "",
	      statusFilter: null,
	      statusOptions: ["Đang mở", "Đã đóng"],
	      classes: []
	     
	    };
	  },
	  mounted() {
	    this.setData(this.databaitapdagiao);
	  },
	  methods: {
	    setData(data) {
	
	      if (Array.isArray(data) && data.length >= 2) {
	        const assignment = data[0][0] || {};
	        this.assignmentDetail.title = assignment.Title || "";
	        this.assignmentDetail.description = assignment.Instructions || "";
	        this.assignmentDetail.semester = assignment.HocKi || "";
	        this.assignmentDetail.schoolYear = assignment.NienKhoa || "";
	
	        this.classes = (data[1] || []).map((c, idx) => ({
	          stt: idx + 1,
	          class: c.TenLop,
	          semester: assignment.HocKi || "",
	          dueDate: c.DueDate
	            ? new Date(c.DueDate).toLocaleString("vi-VN")
	            : "",
	
	          submitted: `${c.SubmittedCount}/${c.TotalStudents}`,
	          seen: `${c.CompletedCount}/${c.TotalStudents}`,
	          status: new Date(c.DueDate) > new Date() ? "Đang mở" : "Đã đóng"
	        }));
	      }
	    },
	    resetFilter() {
	      this.searchClass = "";
	      this.statusFilter = null;
	    },
	    viewClassDetail(item) {
	      alert(`Xem chi tiết lớp: ${item.class}`);
	    }
	  },
	  computed: {
	    filteredClasses() {
	      let result = this.classes;
	      if (this.statusFilter) {
	        result = result.filter(c => c.status === this.statusFilter);
	      }
	      if (this.searchClass) {
	        result = result.filter(c =>
	          c.class.toLowerCase().includes(this.searchClass.toLowerCase())
	        );
	      }
	      return result;
	    },
	    classHeaders() {
	      return [
	        { title: "STT", key: "stt", align: "center" },
	        { title: "Tên lớp", key: "class", align: "center" },
	        { title: "Học kì", key: "semester", align: "center" },
	        { title: "Ngày hết hạn", key: "dueDate", align: "center" },
	        {
	          title: vueData.resourceType === "ASSIGNMENT"
	            ? "Đã nộp / Tổng"
	            : "Đã xem / Tổng",
	          key: vueData.resourceType === "ASSIGNMENT"
	            ? "submitted"
	            : "seen",
	          align: "center"
	        },
	        { title: "Trạng thái", key: "status", align: "center" }
	      ];
	    }
	
	  },
	  watch: {
	    databaitapdagiao(newVal) {
	      this.setData(newVal);
	    }
	  }
	}
</script>


<style>
	.filter-bar {
		display: flex;
		align-items: center;
		margin-bottom: 16px;
	}

	/* Style header bảng */
	::v-deep(.custom-table thead th) {
		background-color: #1976d2 !important;
		color: white !important;
		font-weight: bold;
		text-align: center;
	}
</style>