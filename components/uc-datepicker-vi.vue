<template>
  <v-container>
    <!-- Date Picker -->
    <v-date-picker
      v-model="date"
      locale="vi"
      :displayed-month-format="monthYearFormatter"
      :header-value="headerFormatter"
    ></v-date-picker>

    <!-- Display the selected date -->
    <p>Selected Date: {{ formattedDate }}</p>
  </v-container>
</template>

<script>
export default {
  data() {
    return {
      date: null, 
    };
  },
  computed: {
   
    formattedDate() {
      if (!this.date) return ""; 

      if (typeof this.date === "string") {
        const [year, month, day] = this.date.split("-");
        return `${day}/${month}/${year}`;
      }

      if (this.date instanceof Date) {
        const day = String(this.date.getDate()).padStart(2, "0");
        const month = String(this.date.getMonth() + 1).padStart(2, "0");
        const year = this.date.getFullYear();
        return `${day}/${month}/${year}`;
      }

      return ""; 
    },
  },
  methods: {
    headerFormatter(date) {
      const options = { day: "2-digit", month: "2-digit", year: "numeric" };
      return new Date(date).toLocaleDateString("vi-VN", options);
    },
    monthYearFormatter(date) {
      const options = { month: "long", year: "numeric" };
      return new Date(date).toLocaleDateString("vi-VN", options);
    },
  },
}
</script>
