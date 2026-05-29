<template>
	<v-navigation-drawer v-model="drawerModel" :location="$vuetify.display.mobile ? 'bottom' : undefined"
		:temporary="true" :persistent="true" width="480" style="min-height:100dvh;">
		<v-card style="height:100%;display:flex;flex-direction:column;" flat="">
			<v-window v-model="step" style="flex:1;overflow:hidden;">

				<!-- Step 0: Welcome -->
				<v-window-item :value="0" style="min-height:calc(100dvh - 56px)">
					<div class="d-flex flex-column align-center justify-center ga-5 pa-8" style="height:100%;">
						<v-img src="/_cdn/lhbs-lms/lhbs_logo.jpg" height="52" position="left" max-width="200">
							<template #placeholder="">
								<div class="d-flex align-center justify-center fill-height">
									<v-progress-circular color="grey-lighten-4" indeterminate="">
									</v-progress-circular>
								</div>
							</template>
						</v-img>
						<v-icon size="88" color="primary" class="mt-2">mdi-school-outline</v-icon>
						<p class="text-h6 text-primary font-weight-bold text-center">
							{{ $t('message.WelcomeTeacherDashboard') }}
						</p>
						<p class="text-body-2 text-medium-emphasis text-center" style="max-width:340px;">
							{{ $t('message.WelcomeTeacherDesc') }}
						</p>
					</div>
				</v-window-item>

				<!-- Step 1: Language -->
				<v-window-item :value="1" style="min-height:calc(100dvh - 56px)">
					<uc-chon-ngon-ngu :isonbroading="true">
					</uc-chon-ngon-ngu></v-window-item>

				<!-- Step 2: Overview -->
				<v-window-item :value="2" style="min-height:calc(100dvh - 56px)">
					<div class="d-flex flex-column ga-4 pa-6" style="height:100%;overflow-y:auto;">
						<p class="text-h6 text-primary font-weight-bold">{{ $t('message.DashboardOverview') }}</p>
						<p class="text-body-2 text-medium-emphasis">{{ $t('message.DashboardSections') }}</p>

						<v-card variant="tonal" color="teal" class="pa-3 rounded-lg">
							<div class="d-flex align-center ga-3">
								<v-icon color="teal" size="28">mdi-view-list-outline</v-icon>
								<div>
									<div class="text-subtitle-2 font-weight-bold">{{ $t('message.LeftSidebarTitle') }}
									</div>
									<div class="text-caption text-medium-emphasis">{{ $t('message.LeftSidebarDesc') }}
									</div>
								</div>
							</div>
						</v-card>

						<v-card variant="tonal" color="primary" class="pa-3 rounded-lg">
							<div class="d-flex align-center ga-3">
								<v-icon color="primary" size="28">mdi-table</v-icon>
								<div>
									<div class="text-subtitle-2 font-weight-bold">{{ $t('message.CenterAreaTitle') }}
									</div>
									<div class="text-caption text-medium-emphasis">{{ $t('message.CenterAreaDesc') }}
									</div>
								</div>
							</div>
						</v-card>

						<v-card variant="tonal" color="deep-orange" class="pa-3 rounded-lg">
							<div class="d-flex align-center ga-3">
								<v-icon color="deep-orange" size="28">mdi-check-circle-outline</v-icon>
								<div>
									<div class="text-subtitle-2 font-weight-bold">{{ $t('message.RightSidebarTitle') }}
									</div>
									<div class="text-caption text-medium-emphasis">{{ $t('message.RightSidebarDesc') }}
									</div>
								</div>
							</div>
						</v-card>

						<v-divider class="my-1">

							<v-btn color="primary" @click="$emit('start-tour'); $emit('done')">
								<v-icon start="">mdi-map-marker-path</v-icon>{{ $t('message.StartDetailedGuide') }}
							</v-btn>
							<v-btn variant="text" color="grey" @click="$emit('done')">{{ $t('message.SkipExploreMyself')
								}}</v-btn>
						</v-divider>
					</div>
				</v-window-item>

			</v-window>

			<v-card-actions style="flex-shrink:0;border-top:1px solid rgba(0,0,0,0.08);">
				<v-btn v-if="step > 0" variant="outlined" @click="step--">
					<v-icon start="">mdi-chevron-left</v-icon>{{ $t('message.back') }}
				</v-btn>
				<v-spacer>
					<v-btn v-if="step < 2" color="primary" @click="step++">
						{{ $t('message.next') }}<v-icon end="">mdi-chevron-right</v-icon>
					</v-btn>
				</v-spacer></v-card-actions>
		</v-card>
	</v-navigation-drawer>
</template>

<script>
	export default {
		name: 'uc-onboarding',
		props: { modelValue: Boolean },
		emits: ['update:modelValue', 'done', 'start-tour'],
		data() {
			return { step: 0 }
		},
	computed: {
		drawerModel: {
			get() { return this.modelValue },
			set(v) { this.$emit('update:modelValue', v) },
		},
	},
	watch: {
		modelValue(v) { if (v) this.step = 0 },
	},
	}
</script>