<template>
    <v-container>
        <!-- v-date-input with custom formatted date -->
        <v-date-input v-model="date" label="Date input" @update:model-value="formatDate" locale="en"></v-date-input>

        <!-- Display formatted date -->
        <p>Formatted Date: {{ formattedDate }}</p>
    </v-container>
</template>

<script>
    export default {
  data() {
    return {
      date: null, // The model value for v-date-input
      formattedDate: "", // The formatted date as DD/MM/YYYY
    };
  },
  methods: {
    formatDate(newDate) {
      if (!newDate) {
        this.formattedDate = ""; // Clear if the date is unset
        return;
      }

      // Ensure the date is in a valid format
      const dateObj = new Date(newDate);
      if (!isNaN(dateObj)) {
        const day = String(dateObj.getDate()).padStart(2, "0");
        const month = String(dateObj.getMonth() + 1).padStart(2, "0");
        const year = dateObj.getFullYear();
        this.formattedDate = `${day}/${month}/${year}`;
      }
    },
  },
}
</script>