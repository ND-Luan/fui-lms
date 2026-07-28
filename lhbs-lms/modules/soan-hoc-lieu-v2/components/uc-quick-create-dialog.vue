<template>
	<v-dialog
    :model-value="value"
    max-width="860"
    persistent
    v-on:update:model-value="$emit('input', $event)"
  >
    <v-card rounded="lg">
      <v-card-title class="d-flex align-start pa-6 pb-3">
        <div>
          <div class="text-h6 font-weight-bold">Quick Create</div>
          <div class="text-body-2 text-medium-emphasis mt-1">Add a checklist or project</div>
        </div>

        <v-spacer />

        <v-btn
          icon="mdi-close"
          variant="text"
          size="small"
          v-on:click="close"
        />
      </v-card-title>

      <v-card-text class="pa-6 pt-3">
        <v-btn-toggle
          v-model="activeTab"
          color="primary"
          mandatory
          divided
          class="mb-6"
          variant="outlined"
        >
          <v-btn value="checklist" prepend-icon="mdi-check-circle-outline" class="text-none">
            Checklist
          </v-btn>
          <v-btn value="project" prepend-icon="mdi-folder-plus-outline" class="text-none">
            Project
          </v-btn>
        </v-btn-toggle>

        <div v-if="activeTab === 'project'">
          <v-row dense>
            <v-col cols="12" md="3" class="d-flex align-center">
              <v-icon class="mr-3">mdi-folder-outline</v-icon>
              <span class="text-body-2 text-medium-emphasis">Name</span>
            </v-col>

            <v-col cols="12" md="9">
              <v-text-field
                v-model="projectForm.name"
                label="Project name"
                variant="outlined"
                density="comfortable"
                hide-details
              />
            </v-col>

            <v-col cols="12" md="3" class="d-flex align-center">
              <v-icon class="mr-3">mdi-text-box-outline</v-icon>
              <span class="text-body-2 text-medium-emphasis">Description</span>
            </v-col>

            <v-col cols="12" md="9">
              <v-textarea
                v-model="projectForm.description"
                label="Description"
                variant="outlined"
                density="comfortable"
                rows="2"
                hide-details
              />
            </v-col>

            <v-col cols="12" md="3" class="d-flex align-center">
              <v-icon class="mr-3">mdi-shape-outline</v-icon>
              <span class="text-body-2 text-medium-emphasis">Type</span>
            </v-col>

            <v-col cols="12" md="9">
              <v-btn-toggle
                v-model="projectForm.type"
                color="primary"
                mandatory
                divided
                variant="outlined"
              >
                <v-btn value="personal" prepend-icon="mdi-account-outline" class="text-none">
                  Personal
                </v-btn>
                <v-btn value="standard" prepend-icon="mdi-folder-outline" class="text-none">
                  Standard project
                </v-btn>
              </v-btn-toggle>
            </v-col>

            <v-col cols="12" md="3" class="d-flex align-center">
              <v-icon class="mr-3">mdi-calendar-range</v-icon>
              <span class="text-body-2 text-medium-emphasis">Time</span>
            </v-col>

            <v-col cols="12" md="4">
              <v-text-field
                v-model="projectForm.startDate"
                label="Start"
                type="date"
                prepend-inner-icon="mdi-calendar-start"
                variant="outlined"
                density="comfortable"
                hide-details
              />
            </v-col>

            <v-col cols="12" md="5">
              <v-text-field
                v-model="projectForm.endDate"
                label="End"
                type="date"
                prepend-inner-icon="mdi-calendar-end"
                variant="outlined"
                density="comfortable"
                hide-details
                :disabled="projectForm.type === 'personal'"
              />
            </v-col>
          </v-row>
        </div>

        <div v-else>
          <v-row dense>
            <v-col cols="12" md="3" class="d-flex align-center">
              <v-icon class="mr-3">mdi-folder-outline</v-icon>
              <span class="text-body-2 text-medium-emphasis">Project</span>
            </v-col>

            <v-col cols="12" md="9">
              <v-select
                v-model="taskForm.taskGroupID"
                :items="projectOptions"
                item-title="title"
                item-value="value"
                label="Project"
                variant="outlined"
                density="comfortable"
                hide-details
              >
                <template v-slot:selection="{ item }">
                  <div class="d-flex align-center">
                    <v-icon size="small" class="mr-2">{{ item.raw.icon }}</v-icon>
                    <span class="mr-2">{{ item.raw.name }}</span>
                    <v-chip size="x-small" color="primary" variant="tonal">
                      {{ item.raw.typeText }}
                    </v-chip>
                  </div>
                </template>

                <template v-slot:item="{ props, item }">
                  <v-list-item
                    v-bind="props"
                    :title="item.raw.name"
                    :subtitle="item.raw.description"
                  >
                    <template v-slot:prepend>
                      <v-icon>{{ item.raw.icon }}</v-icon>
                    </template>

                    <template v-slot:append>
                      <v-chip size="x-small" color="primary" variant="tonal">
                        {{ item.raw.typeText }}
                      </v-chip>
                    </template>
                  </v-list-item>
                </template>
              </v-select>
            </v-col>

            <v-col cols="12" md="3" class="d-flex align-center">
              <v-icon class="mr-3">mdi-check-circle-outline</v-icon>
              <span class="text-body-2 text-medium-emphasis">Checklist</span>
            </v-col>

            <v-col cols="12" md="9">
              <v-textarea
                v-model="taskForm.description"
                label="Checklist"
                variant="outlined"
                density="comfortable"
                rows="2"
                hide-details
              />
            </v-col>

            <v-col cols="12" md="3" class="d-flex align-center">
              <v-icon class="mr-3">mdi-calendar-range</v-icon>
              <span class="text-body-2 text-medium-emphasis">Time</span>
            </v-col>

            <v-col cols="12" md="4">
              <v-text-field
                v-model="taskForm.startDate"
                label="Start"
                type="date"
                prepend-inner-icon="mdi-calendar-start"
                variant="outlined"
                density="comfortable"
                hide-details
              />
            </v-col>

            <v-col cols="12" md="5">
              <v-text-field
                v-model="taskForm.endDate"
                label="End"
                type="date"
                prepend-inner-icon="mdi-calendar-end"
                variant="outlined"
                density="comfortable"
                hide-details
              />
            </v-col>

            <v-col v-if="selectedProjectIsPersonal" cols="12" md="3" class="d-flex align-center">
              <v-icon class="mr-3">mdi-chart-box-outline</v-icon>
              <span class="text-body-2 text-medium-emphasis">Report</span>
            </v-col>

            <v-col v-if="selectedProjectIsPersonal" cols="12" md="3">
              <v-text-field
                v-model="taskForm.quantity"
                label="Quantity"
                type="number"
                variant="outlined"
                density="comfortable"
                hide-details
              />
            </v-col>

            <v-col v-if="selectedProjectIsPersonal" cols="12" md="3">
              <v-text-field
                v-model="taskForm.sup_departmentId"
                label="Support unit"
                variant="outlined"
                density="comfortable"
                hide-details
              />
            </v-col>

            <v-col v-if="selectedProjectIsPersonal" cols="12" md="3">
              <v-text-field
                v-model="taskForm.duration"
                label="Duration"
                suffix="min"
                type="number"
                variant="outlined"
                density="comfortable"
                hide-details
              />
            </v-col>
          </v-row>
        </div>
      </v-card-text>

      <v-card-actions class="pa-6 pt-2">
        <v-spacer />
        <v-btn
          variant="text"
          class="text-none"
          v-on:click="close"
        >
          Cancel
        </v-btn>

        <v-btn
          color="primary"
          variant="flat"
          class="text-none px-6"
          :loading="loading"
          :disabled="!canSubmit"
          v-on:click="submit"
        >
          Create
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
	export default {
		props: {
    value: {
      type: Boolean,
      default: false,
    },
    projects: {
      type: Array,
      default() {
        return []
      },
    },
    loading: {
      type: Boolean,
      default: false,
    },
  },
  emits: ['input', 'create-project', 'create-task'],
  data() {
    const today = new Date().toISOString().slice(0, 10)

    return {
      activeTab: 'checklist',
      projectForm: {
        name: '',
        description: '',
        type: 'personal',
        startDate: today,
        endDate: '',
      },
      taskForm: {
        taskGroupID: null,
        description: '',
        startDate: today,
        endDate: today,
        quantity: 1,
        sup_departmentId: 'IRC',
        duration: 200,
      },
    }
  },
  computed: {
    projectOptions() {
      return this.projects.map((project) => ({
        title: project.name + (project.endDate ? ' - Project' : ' - Personal'),
        name: project.name,
        description: project.description || '',
        typeText: project.endDate ? 'Project' : 'Personal',
        icon: project.endDate ? 'mdi-folder-outline' : 'mdi-account-outline',
        value: project.id,
      }))
    },
    selectedProject() {
      return this.projects.find((project) => project.id === this.taskForm.taskGroupID)
    },
    selectedProjectIsPersonal() {
      return this.selectedProject && !this.selectedProject.endDate
    },
    canSubmit() {
      if (this.activeTab === 'project') {
        if (this.projectForm.type === 'personal') {
          return Boolean(this.projectForm.name && this.projectForm.startDate)
        }

        return Boolean(this.projectForm.name && this.projectForm.startDate && this.projectForm.endDate)
      }

      return Boolean(this.taskForm.taskGroupID && this.taskForm.description)
    },
  },
  methods: {
    close() {
      this.$emit('input', false)
    },
    submit() {
      if (this.activeTab === 'project') {
        this.$emit('create-project', { ...this.projectForm })
        return
      }

      this.$emit('create-task', { ...this.taskForm })
    },
  },
	}
</script>