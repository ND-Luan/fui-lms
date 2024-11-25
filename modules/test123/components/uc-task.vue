<template>
	<div v-for="item in randomData" :key="item.id">
      <p>ID: {{ item.id }}</p>
      <p>Name: {{ item.name }}</p>
      <p>Age: {{ item.age }}</p>
    </div>
</template>

<script>
	export default {
		props: [],
		data() {
			return {
              randomData: this.generateRandomData(5) // Generate 5 random objects

      }
		},
		mounted() {},
		computed: {},
		watch: {},
		methods: {
      generateRandomData(count) {
      const data = [];
      for (let i = 0; i < count; i++) {
        data.push({
          id: i + 1,
          name: `Name-${Math.random().toString(36).substring(7)}`, // Random string
          age: Math.floor(Math.random() * 50) + 20 // Random age between 20 and 70
        });
      }
      return data;
    }
    },
	}
</script>