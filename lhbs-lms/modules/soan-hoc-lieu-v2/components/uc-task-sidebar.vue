<template>
	<v-card variant="flat">
    <v-list v-model:opened="openedGroups" density="compact" nav>
      <v-list-item prepend-icon="mdi-menu" title="Tasks">
        <template v-slot:append>
          <v-btn icon="mdi-dots-horizontal" size="small" variant="text" />
        </template>
      </v-list-item>

      <v-list-item prepend-icon="mdi-account-outline" title="Owned" color="primary" active link>
        <template v-slot:append>
          <span>6</span>
        </template>
      </v-list-item>

      <v-list-item prepend-icon="mdi-bookmark-outline" title="Subscribed" link />

      <v-list-item prepend-icon="mdi-history" title="Activities" link />

      <v-list-subheader>Quick Access</v-list-subheader>

      <v-list-group value="quick-access">
        <template v-slot:activator="{ props }">
          <v-list-item
            v-bind="props"
            title="Quick Access"
          >
          </v-list-item>
        </template>

        <v-list-item title="All Tasks" link />
        <v-list-item title="Created" link />
        <v-list-item title="Assigned" link />
        <v-list-item title="Completed" link />
      </v-list-group>

      <v-list-group value="task-list">
        <template v-slot:activator="{ props }">
          <v-list-item
            v-bind="props"
            title="Task List"
            prepend-icon="mdi-format-list-checks"
          >
            <template v-slot:append>
              <v-btn icon="mdi-plus" size="small" variant="text" />
            </template>
          </v-list-item>
        </template>

        <v-list-item title="OKR" prepend-icon="mdi-checkbox-marked-outline" link />
      </v-list-group>

      <v-list-item
        title="New Group"
        prepend-icon="mdi-plus"
        link
      />
    </v-list>
  </v-card>
</template>

<script>
	export default {
		props: [],
  data() {
    return {
      openedGroups: ['quick-access', 'task-list'],
    }
  },
	}
</script>