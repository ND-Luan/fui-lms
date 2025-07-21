<template>
  <v-sheet rounded="lg">
    <v-list>
      <v-list-subheader>THÊM NỘI DUNG</v-list-subheader>
      <v-list-item
        v-for="component in components"
        :key="component.type"
        link
        @click="$emit('componentSelect', component.type)"
      >
        <template v-slot:prepend>
          <v-icon :icon="component.icon"></v-icon>
        </template>
        <v-list-item-title>{{ component.label }}</v-list-item-title>
      </v-list-item>
    </v-list>
  </v-sheet>
</template>
<script>
export default {
  name: 'uc-component-library',
  props: {
    components: { type: Array, default: () => [] }
  },
  emits: ['componentSelect']
}
</script>