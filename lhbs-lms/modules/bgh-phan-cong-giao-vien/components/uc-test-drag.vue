<template>
  <v-container>
    <v-row>
      <!-- Danh sách môn học và lớp -->
      <v-col cols="4">
        <h3>Danh sách Môn học - Lớp</h3>
        <div id="subject-classes-list" class="source-list">
          <v-card
            v-for="item in subjectClasses"
            :key="item.LopID + '-' + item.MonHocID"
            class="mb-2"
          >
            <v-card-title class="text-subtitle-1">
              {{ item.MonHocName }} - {{ item.TenLop }}
            </v-card-title>
          </v-card>
        </div>
      </v-col>

      <!-- Danh sách giáo viên -->
      <v-col cols="8">
        <h3>Danh sách Giáo Viên</h3>
        <div id="teachers-list">
          <v-card
            v-for="teacher in teachers"
            :key="teacher.id"
            class="mb-4"
          >
            <v-card-title>{{ teacher.name }}</v-card-title>
            <v-divider></v-divider>
            <!-- Khu vực thả các lớp -->
            <div :id="'teacher-' + teacher.id" class="target-list">
              <div
                v-for="assignment in teacher.assignments"
                :key="assignment.LopID + '-' + assignment.MonHocID"
                class="class-item"
              >
                <div class="d-flex align-center justify-space-between">
                  <span>
                    {{ assignment.MonHocName }} - {{ assignment.TenLop }}
                  </span>
                  <v-btn
                    icon="mdi-close"
                    density="compact"
                    variant="text"
                    color="error"
                    @click="removeAssignment(teacher.id, assignment)"
                  ></v-btn>
                </div>
              </div>
              <div
                v-if="!teacher.assignments.length"
                class="empty-message"
              >
                Kéo môn học và lớp vào đây
              </div>
            </div>
          </v-card>
        </div>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>

export default {
  data() {
    return {
      subjectClasses: [], // Data fetched from API
      teachers: [
        { id: 1, name: "Nguyễn Văn A", assignments: [] },
        { id: 2, name: "Trần Thị B", assignments: [] },
        { id: 3, name: "Phạm Văn C", assignments: [] },
      ],
    };
  },

  mounted() {
    this.fetchSubjectClasses();

    // Initialize Sortable for subject-classes-list
    const sourceList = document.getElementById("subject-classes-list");
    new Sortable(sourceList, {
      group: "shared",
      animation: 150,
      onEnd: this.onDrop,
    });

    // Initialize Sortable for each teacher
    this.teachers.forEach((teacher) => {
      const teacherList = document.getElementById(`teacher-${teacher.id}`);
      new Sortable(teacherList, {
        group: "shared",
        animation: 150,
        onEnd: this.onDrop,
      });
    });
  },

  methods: {
    async fetchSubjectClasses() {
      try {
        let params = {
          CapID :1
        }
        const response = await SearchLMSService.GetMonHocChuaDuocPhanCong(params);
        debugger
        this.subjectClasses = response?.Result;
      } catch (error) {
        console.error("Failed to fetch subject classes:", error);
      }
    },

    onDrop(event) {
      const fromList = event.from.id === "subject-classes-list" ? "source" : "teacher";
      const toList = event.to.id.includes("teacher-") ? "teacher" : "source";

      if (fromList === "source" && toList === "teacher") {
        // Move from source to teacher
        const item = this.subjectClasses.splice(event.oldIndex, 1)[0];
        const teacherId = event.to.id.split("-")[1];
        const teacher = this.teachers.find((t) => t.id === Number(teacherId));

        // Avoid duplicates
        const isDuplicate = teacher.assignments.some(
          (a) =>
            a.LopID === item.LopID && a.MonHocID === item.MonHocID
        );

        if (!isDuplicate) {
          teacher.assignments.splice(event.newIndex, 0, item);
        } else {
          this.subjectClasses.splice(event.oldIndex, 0, item);
        }
      } else if (fromList === "teacher" && toList === "teacher") {
        // Move between teachers
        const fromTeacherId = event.from.id.split("-")[1];
        const toTeacherId = event.to.id.split("-")[1];

        const fromTeacher = this.teachers.find((t) => t.id === Number(fromTeacherId));
        const toTeacher = this.teachers.find((t) => t.id === Number(toTeacherId));

        const item = fromTeacher.assignments.splice(event.oldIndex, 1)[0];
        toTeacher.assignments.splice(event.newIndex, 0, item);
      } else if (fromList === "teacher" && toList === "source") {
        // Move back to source
        const fromTeacherId = event.from.id.split("-")[1];
        const fromTeacher = this.teachers.find((t) => t.id === Number(fromTeacherId));

        const item = fromTeacher.assignments.splice(event.oldIndex, 1)[0];
        this.subjectClasses.splice(event.newIndex, 0, item);
      }

      this.getAllocationList();
    },

    removeAssignment(teacherId, assignment) {
      const teacher = this.teachers.find((t) => t.id === teacherId);
      if (!teacher) return;

      const assignmentIndex = teacher.assignments.findIndex(
        (a) =>
          a.LopID === assignment.LopID && a.MonHocID === assignment.MonHocID
      );
      if (assignmentIndex === -1) return;

      const removedAssignment = teacher.assignments.splice(assignmentIndex, 1)[0];
      this.subjectClasses.push(removedAssignment);

      this.getAllocationList();
    },

    getAllocationList() {
      const allocation = this.teachers.map((teacher) => ({
        teacherName: teacher.name,
        assignments: teacher.assignments.map(
          (a) => `${a.MonHocName} - ${a.TenLop}`
        ),
      }));

      console.log("Phân công hiện tại:", allocation);
    },
  },
}
</script>

<style scoped>
.source-list,
.target-list {
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 5px;
  background-color: #f9f9f9;
  min-height: 150px;
}

.class-item {
  padding: 8px;
  margin: 4px 0;
  background-color: #e3f2fd;
  border: 1px solid #2196f3;
  border-radius: 4px;
}

.empty-message {
  text-align: center;
  color: #666;
  padding: 20px;
}
</style>