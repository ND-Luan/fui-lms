<template>
	<v-container>
		<v-row>
			<v-col cols="4">
				<h3>{{ sourceTitle }}</h3>
				<div id="source-items-list" class="source-list">
					<v-card v-for="item in sourceItems" :key="item.uniqueId" class="mb-2">
						<v-card-title class="text-subtitle-1">
							{{ item.displayTitle }}
						</v-card-title>
					</v-card>
				</div>
			</v-col>

			<v-col cols="8">
				<h3>{{ targetTitle }}</h3>
				<div id="target-items-list">
					<v-card v-for="target in targetItems" :key="target.uniqueId" class="mb-4">
						<v-card-title>{{ target.displayTitle }}</v-card-title>
						<v-divider></v-divider>
						<div :id="'target-' + target.uniqueId" class="target-list">
							<div v-for="assignment in target.assignments"
								:key="assignment[sourceDisplayFields.uniqueKey]" class="assignment-item">
								<div class="d-flex align-center justify-space-between">
									<span>{{ assignment.displayTitle }}</span>
									<v-btn icon="mdi-close" density="compact" variant="text" color="error"
										@click="removeAssignment(target.uniqueId, assignment)"></v-btn>
								</div>
							</div>
							<div v-if="!target.assignments.length" class="empty-message">
								{{ emptyStateMessage }}
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
  name: 'DraggableAssignment',

  props: {
    // Data cho source list
    sourceData: {
      type: Array,
      required: true
    },
    // Data cho target list
    targetData: {
      type: Array,
      required: true
    },
    // Các field để hiển thị từ source data
    sourceDisplayFields: {
      type: Object,
      default: () => ({
        title: '', // field name để hiển thị title
        uniqueKey: '', // field name để làm key
      })
    },
    // Các field để hiển thị từ target data
    targetDisplayFields: {
      type: Object,
      default: () => ({
        title: '', // field name để hiển thị title
        uniqueKey: '', // field name để làm key
        assignments: '', // field name chứa assignments
      })
    },
    sourceTitle: {
      type: String,
      default: 'Source List'
    },
    targetTitle: {
      type: String,
      default: 'Target List'
    },
    emptyStateMessage: {
      type: String,
      default: 'Drag items here'
    }
  },

  data() {
    return {
      sourceItems: [],
      targetItems: [],
      sortableInstances: [] // Lưu trữ instances của Sortable để cleanup
    }
  },

  mounted() {
    this.initializeData();
    this.initializeSortable();
  },

  beforeDestroy() {
    // Cleanup sortable instances
    this.sortableInstances.forEach(instance => instance.destroy());
  },

  watch: {
    sourceData: {
      handler: 'initializeData',
      deep: true
    },
    targetData: {
      handler: 'initializeData',
      deep: true
    }
  },

  methods: {
    initializeData() {
      // Clone và format source data
      this.sourceItems = this.sourceData.map(item => ({
        ...item,
        displayTitle: item[this.sourceDisplayFields.title],
        uniqueId: item[this.sourceDisplayFields.uniqueKey]
      }));

      // Clone và format target data
      this.targetItems = this.targetData.map(item => ({
        ...item,
        displayTitle: item[this.targetDisplayFields.title],
        uniqueId: item[this.targetDisplayFields.uniqueKey],
        assignments: item[this.targetDisplayFields.assignments] || []
      }));
    },

    initializeSortable() {
      // Cleanup existing instances
      this.sortableInstances.forEach(instance => instance.destroy());
      this.sortableInstances = [];

      // Initialize source list
      const sourceList = new Sortable(document.getElementById("source-items-list"), {
        group: "shared",
        animation: 150,
        onEnd: this.handleDrop
      });
      this.sortableInstances.push(sourceList);

      // Initialize each target list
      this.targetItems.forEach((item) => {
        const targetList = new Sortable(document.getElementById(`target-${item.uniqueId}`), {
          group: "shared",
          animation: 150,
          onEnd: this.handleDrop
        });
        this.sortableInstances.push(targetList);
      });
    },

    handleDrop(event) {
      const fromList = event.from.id === "source-items-list" ? "source" : "target";
      const toList = event.to.id.includes("target-") ? "target" : "source";

      if (fromList === "source" && toList === "target") {
        this.handleSourceToTarget(event);
      } else if (fromList === "target" && toList === "target") {
        this.handleTargetToTarget(event);
      } else if (fromList === "target" && toList === "source") {
        this.handleTargetToSource(event);
      }

      this.emitCurrentAssignments();
    },

    handleSourceToTarget(event) {
      const item = this.sourceItems.splice(event.oldIndex, 1)[0];
      const targetId = event.to.id.split("-")[1];
      const target = this.targetItems.find((t) => t.uniqueId === targetId);

      const isDuplicate = target.assignments.some(
        (a) => a[this.sourceDisplayFields.uniqueKey] === item[this.sourceDisplayFields.uniqueKey]
      );

      if (!isDuplicate) {
        target.assignments.splice(event.newIndex, 0, item);
      } else {
        this.sourceItems.splice(event.oldIndex, 0, item);
      }
    },

    handleTargetToTarget(event) {
      const fromTargetId = event.from.id.split("-")[1];
      const toTargetId = event.to.id.split("-")[1];

      const fromTarget = this.targetItems.find((t) => t.uniqueId === fromTargetId);
      const toTarget = this.targetItems.find((t) => t.uniqueId === toTargetId);

      const item = fromTarget.assignments.splice(event.oldIndex, 1)[0];
      toTarget.assignments.splice(event.newIndex, 0, item);
    },

    handleTargetToSource(event) {
      const fromTargetId = event.from.id.split("-")[1];
      const fromTarget = this.targetItems.find((t) => t.uniqueId === fromTargetId);

      const item = fromTarget.assignments.splice(event.oldIndex, 1)[0];
      this.sourceItems.splice(event.newIndex, 0, item);
    },

    removeAssignment(targetId, assignment) {
      const target = this.targetItems.find((t) => t.uniqueId === targetId);
      if (!target) return;

      const assignmentIndex = target.assignments.findIndex(
        (a) => a[this.sourceDisplayFields.uniqueKey] === assignment[this.sourceDisplayFields.uniqueKey]
      );
      
      if (assignmentIndex === -1) return;

      const removedAssignment = target.assignments.splice(assignmentIndex, 1)[0];
      this.sourceItems.push(removedAssignment);

      this.emitCurrentAssignments();
    },

    emitCurrentAssignments() {
      const currentAssignments = this.targetItems.map((target) => ({
        targetId: target.uniqueId,
        targetTitle: target.displayTitle,
        assignments: target.assignments
      }));

      this.$emit('update:assignments', currentAssignments);
      this.$emit('assignment-changed', currentAssignments);
    }
  }
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

	.assignment-item {
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