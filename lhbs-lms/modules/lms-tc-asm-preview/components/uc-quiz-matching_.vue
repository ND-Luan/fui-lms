<template>
	<div class="d-flex ga-12 w-100 justify-center">
		<!-- Khu vực thả (drop zone) -->
		<div class="d-flex">
			<div class="drop-zones">
				<div v-for="item in columnA" :key="item?.id" class="drop-zone pa-4" @drop="onDrop($event, item)"
					@dragover.prevent @dragenter.prevent :animation="150">
					<div class="d-flex" :class="item.dropArray?.length == 1 ? 'justify-center' : ''">
						<div class="jigsaw2">
							<span class="r"></span>
							<span class="text">{{ item?.text }}</span>
						</div>

						<vuedraggable v-model="item.dropArray" item-key="id"
							@start="(element) => onStartColumnA(element, item)"
							@end="(element) => endDragColumnA(element, item)">
							<template #item="{ element }">
								<div class="w-100 d-flex">
									<div class="jigsaw1">
										<span class="l"></span>
										<span class="text">{{ element?.text }}</span>
									</div>
								</div>
							</template>
						</vuedraggable>
					</div>
				</div>
			</div>
		</div>

		<div class="drop-zones">
			<vuedraggable v-model="columnB" item-key="id" @start="(element) => onStart($event, element)"
				@end="(element) => endDrag($event, element)" :animation="150" :sort="false">
				<template #item="{ element }">
					<div class="d-flex drop-zone-columnB pa-4">
						<div class="jigsaw1">
							<span class="l"></span>
							<span class="text">{{ element?.text }}</span>
						</div>
					</div>
				</template>
			</vuedraggable>
		</div>
	</div>
</template>

<script>
export default {
	components: {
		vuedraggable
	},
	data() {
		return {
			selectedItem: {},
			selectedItemWrap: {},
			isDropPlace: false,
			isDropWrap: false,

			columnA: [
				{ id: "a1761712087414", text: "A" },
				{ id: "a1761712088000", text: "B" },
				{ id: "a1761712088491", text: "C" },
				{ id: "a1761712088968", text: "D" },
			],

			columnB: [
				{ id: "b1761712087414", text: "AB" },
				{ id: "b1761712088000", text: "BC" },
				{ id: "b1761712088491", text: "CD" },
				{ id: "b1761712088968", text: "DE" },
			],

			correctPairs: [
				{ from: "a1761712087414", to: "b1761712087414" },
				{ from: "a1761712088000", to: "b1761712088000" },
				{ from: "a1761712088491", to: "b1761712088491" },
				{ from: "a1761712088968", to: "b1761712088968" },
			],
		};
	},

	methods: {
		onDrop(e, itemOfColumnA) {
			this.isDropPlace = true;
			const itemSelected = this.selectedItem.item.__draggable_context.element;

			if (!itemOfColumnA.dropArray || itemOfColumnA.dropArray.length === 0) {
				itemOfColumnA.dropArray = [itemSelected]
			} else {
				itemOfColumnA.dropArray.push(itemSelected);
				this.selectedItemWrap = Object.assign({}, itemOfColumnA.dropArray[0]);
				itemOfColumnA.dropArray.splice(0, 1);
			}
		},

		endDrag(e, leftItem) {
			if (!this.isDropPlace) return;

			if (Object.keys(this.selectedItemWrap).length !== 0) {
				this.columnB[leftItem.oldIndex] = this.selectedItemWrap
			} else {
				this.columnB.splice(leftItem.oldIndex, 1);
			}

			this.isDropPlace = false;
			this.selectedItem = {};
			this.selectedItemWrap = {};
		},

		onStart(e, leftItem) {
			this.selectedItem = leftItem;
		},

		onStartColumnA(element, item) {
			this.selectedItem = element;
		},

		endDragColumnA(element, item) {
			if (!this.isDropPlace) return;

			if (item.dropArray.length === 1) {
				item.dropArray = [this.selectedItemWrap]
			} else {
				item.dropArray = []
			}

			this.selectedItem = {};
			this.selectedItemWrap = {};
			this.isDropPlace = false;
		},
	},
}
</script>