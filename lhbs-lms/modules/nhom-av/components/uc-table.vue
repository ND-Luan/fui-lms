<template>
	<div>
		<v-data-table :items="items" :headers="headers">
			<template v-slot:item.index="{ index }">
				{{ index + 1 }}
			</template>
		</v-data-table>
	</div>
</template>

<script>
	export default {
  data() {
    return {
      headers: [
        { text: 'STT', value: 'index' },
        { text: 'Name', value: 'name' },
        { text: 'Species', value: 'species' },
        { text: 'Diet', value: 'diet' },
        { text: 'Habitat', value: 'habitat' },
      ],
      items: [
        {
          id: 1,
          name: 'African Elephant',
          species: 'Loxodonta africana',
          diet: 'Herbivore',
          habitat: 'Savanna, Forests',
        }
      ]
    };
  }
}
</script>