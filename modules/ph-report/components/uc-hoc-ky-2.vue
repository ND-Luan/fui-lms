<template>
	<div>
		<v-divider></v-divider>
		<v-list class="pt-0" style="overflow: auto; height: calc(100dvh - 213px); padding-bottom: 42px;">
			<!-- Giao diện dành cho cấp 1 -->
			<div v-if="vueData.HocSinhSelected?.CapID === 1">
				<v-tabs id="Tab_C1" v-model="tab" align-tabs="center" grow>
					<v-tab :id="hocKy.id" :value="hocKy.id" :key="hocKy.id" v-for="hocKy in DSHocKy">
						<div class="d-flex justify-center align-center">
							<img src="/_cdn/lhbs-lms/icon_hk.png" height="25" class="mr-2" />
							<p class="font-weight-medium">{{ hocKy.name }}</p>
						</div>
					</v-tab>
				</v-tabs>
				<keep-alive>
					<v-tabs-window v-model="tab">
						<v-tabs-window-item v-for="hocKy in DSHocKy" :key="hocKy.id" :value="hocKy.id">
							<v-card>
								<v-divider></v-divider>
								<v-expansion-panels v-model="GroupPanel" flat multiple variant="accordion">
									<!-- Kiến thức - Kĩ năng -->
									<v-expansion-panel key="1">
										<v-expansion-panel-title class="bg-blue-lighten-5 group-panel"
											expand-icon="mdi-menu-down">
											<div class="d-flex align-center ga-4">
												<v-img src="/_cdn/lhbs-lms/kienthuc_ki_nang_icon.png" height="30"
													width="30"></v-img>
												<p>{{ $t('message.Skill_Knowledge') }}</p>
											</div>
										</v-expansion-panel-title>
										<v-expansion-panel-text>
											<v-divider></v-divider>
											<v-row :no-gutters="true" class="font-weight-medium rounded-t py-2">
												<v-col cols="7">
													<p class="ml-2 text-body-2 font-weight-bold">Môn học</p>
												</v-col>
												<v-col cols="2">
													<p class=" text-center text-body-2 font-weight-bold">Mức đạt</p>
												</v-col>
												<v-col cols="3">
													<p class="text-center text-body-2 font-weight-bold">Điểm</p>
												</v-col>
											</v-row>

											<v-expansion-panels v-model="panelC1_KT_KN" multiple="" variant="accordion">
												<v-expansion-panel v-for="(value, key) in groupKTKN"
													:key="value + '_' + key">
													<!-- :style="{'background-color': DSMonHoc.find(x => x.MonHocName === key)?.Color ?? ''}" -->
													<v-expansion-panel-title class="px-2">
														<v-row :no-gutters="true">
															<v-col cols="7" class="pa-2">
																<v-chip class="font-weight-medium chip-ellipsis"
																	:color="DSMonHoc.find(x => x.MonHocName === key || (key == 'Giáo dục thể chất' && x.MonHocName == 'Thể dục'))?.Color ?? '#000000'">
																	<v-icon small class="mr-1"
																		:style="{ color: DSMonHoc.find(x => x.MonHocName === key || (key == 'Giáo dục thể chất' && x.MonHocName == 'Thể dục'))?.Color ?? '#000000' }">
																		{{DSMonHoc.find(x => x.MonHocName === key ||
																			(key == 'Giáo dục thể chất' &&
																				x.MonHocName == 'Thể dục'))?.Icon ||
																			'mdi-book-open'}}
																	</v-icon>
																	{{ key }}
																</v-chip>
															</v-col>
															<v-col class="d-flex justify-center pa-2" cols="3">
																<v-chip class="font-weight-bold"
																	:color="getColorMucDoDanhGia(value[Object.keys(value).find(it => it.endsWith('M'))])"
																	size="small" variant="outlined"
																	:class="'bg-' + getBgColorMucDoDanhGia(value[Object.keys(value).find(it => it.endsWith('M'))])"
																	v-if="value[Object.keys(value).find(it => it.endsWith('M'))]">
																	{{value[Object.keys(value).find(it =>
																		it.endsWith('M'))] ?? '-'}}
																</v-chip>
																<v-chip color="green" size="small" variant="outlined"
																	v-if="value[Object.keys(value).find(it => it.endsWith('S'))] && List_MonHoc_Change.includes(key)">
																	<template v-for="i in 5" :key="i">
																		<v-icon size="small" icon="mdi-star"
																			:color="i <= (value[Object.keys(value).find(it => it.endsWith('S'))] || 0) ? 'amber' : 'grey'" />
																	</template>
																</v-chip>
															</v-col>
															<v-col class="d-flex justify-center pa-2" cols="2">
																<v-chip class="font-weight-bold" color="green"
																	size="small" variant="outlined"
																	style="background-color: #E8F5E9"
																	v-if="value[Object.keys(value).find(it => it.endsWith('D'))] && !List_MonHoc_Change.includes(key)">
																	{{value[Object.keys(value).find(it =>
																		it.endsWith('D'))] ?? '-'}}
																</v-chip>
															</v-col>
														</v-row>
													</v-expansion-panel-title>
													<v-expansion-panel-text>
														<v-list-item
															v-if="value[Object.keys(value).find(it => it.endsWith('NX'))]">
															<v-list-item-title
																class="text-body-2 mb-2 font-weight-medium">
																<v-icon class="mr-2" color="orange">mdi-pencil</v-icon>
																Nhận xét
															</v-list-item-title>
															<!-- <v-list-item-subtitle
																class="text-black text-body-2 font-weight-medium"
																style="-webkit-line-clamp: unset; opacity: 1 !important; line-height: 1.425 !important;">
																<v-card color="#FFF9C4">
																	<v-card-text>
																		{{value[Object.keys(value).find(it =>
																		it.endsWith('NX'))] ?? '-'}}
																	</v-card-text>
																</v-card>
															</v-list-item-subtitle> -->
															<v-list-item-subtitle
																class="text-black text-body-2 font-weight-medium"
																style="-webkit-line-clamp: unset; opacity: 1 !important; line-height: 1.425 !important;">

																<div class="note-wrapper">
																	<!-- Cây ghim -->
																	<div class="pin-icon">📌</div>

																	<!-- Tờ giấy -->
																	<v-card class="note-paper" flat>
																		<v-card-text>
																			{{value[Object.keys(value).find(it =>
																				it.endsWith('NX'))] ?? '-'}}
																		</v-card-text>
																	</v-card>
																</div>
															</v-list-item-subtitle>
														</v-list-item>
														<uc-empty v-if="isCheckEmpty(Object.keys(value), value)" />
													</v-expansion-panel-text>
													<v-divider></v-divider>
												</v-expansion-panel>
											</v-expansion-panels>
										</v-expansion-panel-text>
									</v-expansion-panel>
									<!-- Năng lực chung -->
									<v-expansion-panel key="2">
										<v-expansion-panel-title class="bg-red-lighten-5 group-panel"
											expand-icon="mdi-menu-down">
											<div class="d-flex align-center ga-4">
												<v-img src="/_cdn/lhbs-lms/nang_luc_chung_icon.png" height="30"
													width="30"></v-img>
												<p>{{ $t('message.Common_Ability') }}</p>
											</div>
										</v-expansion-panel-title>
										<v-expansion-panel-text>
											<v-row class="font-weight-medium rounded-t py-2" :no-gutters="true">
												<v-col cols="8">
													<p class="ml-4"></p>
												</v-col>
												<v-col cols="2">
													<p class="text-center text-body-2 font-weight-bold">Mức đạt</p>
												</v-col>
												<v-col cols="1">
												</v-col>
											</v-row>
											<v-expansion-panels v-model="panelC1_NLC" multiple="" variant="accordion">
												<v-expansion-panel v-for="(value, key) in groupNLC" :key="key">
													<!-- :style="{'background-color': DSMonHoc.find(x => x.MonHocName === key)?.Color ?? ''}" -->
													<v-expansion-panel-title class="px-2">
														<v-row :no-gutters="true">
															<v-col cols="9" class="pa-2">
																<v-chip class="font-weight-medium chip-ellipsis"
																	:color="DSMonHoc.find(x => x.MonHocName === key)?.Color ?? '#000000'">
																	<v-icon small class="mr-1"
																		:style="{ color: DSMonHoc.find(x => x.MonHocName === key)?.Color ?? '#000000' }">
																		{{DSMonHoc.find(x => x.MonHocName ===
																			key)?.Icon || 'mdi-book-open'}}
																	</v-icon>
																	{{ key }}
																</v-chip>
															</v-col>
															<v-col class="d-flex justify-center" cols="3">
																<v-chip class="font-weight-bold"
																	:class="'bg-' + getBgColorMucDoDanhGia(value[Object.keys(value).find(it => !it.endsWith('NX'))])"
																	:color="getColorMucDoDanhGia(value[Object.keys(value).find(it => !it.endsWith('NX'))])"
																	size="small" variant="outlined"
																	v-if="value[Object.keys(value).find(it => !it.endsWith('NX'))]">
																	{{value[Object.keys(value).find(it =>
																		!it.endsWith('NX'))] ?? '-'}}
																</v-chip>
															</v-col>
														</v-row>
													</v-expansion-panel-title>
													<v-expansion-panel-text>
														<v-list-item
															v-if="value[Object.keys(value).find(it => it.endsWith('NX'))]">
															<v-list-item-title
																class="text-body-2 mb-2 font-weight-medium">
																<v-icon class="mr-2" color="orange">mdi-pencil</v-icon>
																Nhận xét
															</v-list-item-title>
															<v-list-item-subtitle
																class="text-black text-body-2 font-weight-medium"
																style="-webkit-line-clamp: unset; opacity: 1 !important; line-height: 1.425 !important;">

																<div class="note-wrapper">
																	<!-- Cây ghim -->
																	<div class="pin-icon">📌</div>

																	<!-- Tờ giấy -->
																	<v-card class="note-paper" flat>
																		<v-card-text>
																			{{value[Object.keys(value).find(it =>
																				it.endsWith('NX'))] ?? '-'}}
																		</v-card-text>
																	</v-card>
																</div>
															</v-list-item-subtitle>
														</v-list-item>

														<uc-empty v-if="isCheckEmpty(Object.keys(value), value)" />
													</v-expansion-panel-text>
													<v-divider></v-divider>
												</v-expansion-panel>
											</v-expansion-panels>
										</v-expansion-panel-text>
									</v-expansion-panel>
									<!-- Phẩm chất -->
									<v-expansion-panel key="3">
										<v-expansion-panel-title class="bg-yellow-lighten-5 group-panel"
											expand-icon="mdi-menu-down">
											<div class="d-flex align-center ga-4">
												<v-img src="/_cdn/lhbs-lms/pham_chat_icon.png" height="30"
													width="30"></v-img>
												<p>{{ $t('message.Quality') }}</p>
											</div>
										</v-expansion-panel-title>
										<v-expansion-panel-text>
											<v-row class="font-weight-medium rounded-t py-2" :no-gutters="true">
												<v-col cols="8">
													<p class="ml-4"></p>
												</v-col>
												<v-col cols="2">
													<p class=" text-center text-body-2 font-weight-bold">Mức đạt</p>
												</v-col>
												<v-col cols="1">
													<p class="ml-4 text-center"></p>
												</v-col>
											</v-row>
											<v-expansion-panels v-model="panelC1_PC" multiple variant="accordion">
												<v-expansion-panel v-for="(value, key) in groupPC" :key="key">
													<!-- :style="{'background-color': DSMonHoc.find(x => x.MonHocName === key)?.Color ?? ''}" -->
													<v-expansion-panel-title class="px-2">
														<v-row :no-gutters="true">
															<v-col cols="9" class="pa-2">
																<v-chip class="font-weight-medium chip-ellipsis"
																	:color="DSMonHoc.find(x => x.MonHocName === key)?.Color ?? '#000000'">
																	<v-icon small class="mr-1"
																		:style="{ color: DSMonHoc.find(x => x.MonHocName === key)?.Color ?? '#000000' }">
																		{{DSMonHoc.find(x => x.MonHocName ===
																			key)?.Icon || 'mdi-book-open'}}
																	</v-icon>
																	{{ key }}
																</v-chip>
															</v-col>
															<v-col class="d-flex justify-center" cols="3">
																<v-chip class="font-weight-bold"
																	:class="'bg-' + getBgColorMucDoDanhGia(value[Object.keys(value).find(it => !it.endsWith('NX'))])"
																	:color="getColorMucDoDanhGia(value[Object.keys(value).find(it => !it.endsWith('NX'))])"
																	size="small" variant="outlined"
																	v-if="value[Object.keys(value).find(it => !it.endsWith('NX'))]">
																	{{value[Object.keys(value).find(it =>
																		!it.endsWith('NX'))] ?? '-'}}
																</v-chip>
															</v-col>
														</v-row>
													</v-expansion-panel-title>
													<v-expansion-panel-text>
														<v-list-item
															v-if="value[Object.keys(value).find(it => it.endsWith('NX'))]">
															<v-list-item-title
																class="text-body-2 mb-2 font-weight-medium">
																<v-icon class="mr-2" color="orange">mdi-pencil</v-icon>
																Nhận xét
															</v-list-item-title>
															<v-list-item-subtitle
																class="text-black text-body-2 font-weight-medium"
																style="-webkit-line-clamp: unset; opacity: 1 !important; line-height: 1.425 !important;">

																<div class="note-wrapper">
																	<!-- Cây ghim -->
																	<div class="pin-icon">📌</div>

																	<!-- Tờ giấy -->
																	<v-card class="note-paper" flat>
																		<v-card-text>
																			{{value[Object.keys(value).find(it =>
																				it.endsWith('NX'))] ?? '-'}}
																		</v-card-text>
																	</v-card>
																</div>
															</v-list-item-subtitle>
														</v-list-item>

														<uc-empty v-if="isCheckEmpty(Object.keys(value), value)" />
													</v-expansion-panel-text>
													<v-divider></v-divider>
												</v-expansion-panel>
											</v-expansion-panels>
										</v-expansion-panel-text>
									</v-expansion-panel>
									<!-- Năng lực riêng -->
									<v-expansion-panel key="4">
										<v-expansion-panel-title class="bg-brown-lighten-5 group-panel"
											expand-icon="mdi-menu-down">
											<div class="d-flex align-center ga-4">
												<v-img src="/_cdn/lhbs-lms/nang_luc_rieng.png" height="30"
													width="30"></v-img>
												<p>{{ $t('message.Personal_Ability') }}</p>
											</div>
										</v-expansion-panel-title>
										<v-expansion-panel-text>
											<v-row class="font-weight-medium rounded-t py-2" :no-gutters="true">
												<v-col cols="8">
													<p class="ml-4"></p>
												</v-col>
												<v-col cols="2">
													<p class=" text-center text-body-2 font-weight-bold">Mức đạt</p>
												</v-col>
												<v-col cols="1">
													<p class="ml-4 text-center"></p>
												</v-col>
											</v-row>
											<v-expansion-panels v-model="panelC1_NLR" multiple variant="accordion">
												<v-expansion-panel v-for="(value, key) in groupNLR" :key="key">
													<!-- :style="{'background-color': DSMonHoc.find(x => x.MonHocName === key)?.Color ?? ''}" -->
													<v-expansion-panel-title class="px-2">
														<v-row :no-gutters="true">
															<v-col cols="9" class="pa-2">
																<v-chip class="font-weight-medium chip-ellipsis"
																	:color="DSMonHoc.find(x => x.MonHocName === key)?.Color ?? '#000000'">
																	<v-icon small class="mr-1"
																		:style="{ color: DSMonHoc.find(x => x.MonHocName === key)?.Color ?? '#000000' }">
																		{{DSMonHoc.find(x => x.MonHocName ===
																			key)?.Icon || 'mdi-book-open'}}
																	</v-icon>
																	{{ key }}
																</v-chip>
															</v-col>
															<v-col class="d-flex justify-center" cols="3">
																<v-chip class="font-weight-bold"
																	:class="'bg-' + getBgColorMucDoDanhGia(value[Object.keys(value).find(it => !it.endsWith('NX'))])"
																	:color="getColorMucDoDanhGia(value[Object.keys(value).find(it => !it.endsWith('NX'))])"
																	size="small" variant="outlined"
																	v-if="value[Object.keys(value).find(it => !it.endsWith('NX'))]">
																	{{value[Object.keys(value).find(it =>
																		!it.endsWith('NX'))] ?? '-'}}
																</v-chip>
															</v-col>
															<v-col class="d-flex justify-center" cols="2"> </v-col>
														</v-row>
													</v-expansion-panel-title>
													<v-expansion-panel-text>
														<v-list-item
															v-if="value[Object.keys(value).find(it => it.endsWith('NX'))]">
															<v-list-item-title
																class="text-body-2 mb-2 font-weight-medium">
																<v-icon class="mr-2" color="orange">mdi-pencil</v-icon>
																Nhận xét
															</v-list-item-title>
															<v-list-item-subtitle
																class="text-black text-body-2 font-weight-medium"
																style="-webkit-line-clamp: unset; opacity: 1 !important; line-height: 1.425 !important;">

																<div class="note-wrapper">
																	<!-- Cây ghim -->
																	<div class="pin-icon">📌</div>

																	<!-- Tờ giấy -->
																	<v-card class="note-paper" flat>
																		<v-card-text>
																			{{value[Object.keys(value).find(it =>
																				it.endsWith('NX'))] ?? '-'}}
																		</v-card-text>
																	</v-card>
																</div>
															</v-list-item-subtitle>
														</v-list-item>
														<uc-empty v-if="isCheckEmpty(Object.keys(value), value)" />
													</v-expansion-panel-text>
													<v-divider></v-divider>
												</v-expansion-panel>
											</v-expansion-panels>
										</v-expansion-panel-text>
									</v-expansion-panel>
								</v-expansion-panels>
							</v-card>

							<v-divider></v-divider>
							<!-- Chuyên cần -->
							<v-card>
								<v-row class="ma-0">
									<v-col cols="12" class="pb-0 text-primary"
										style="font-size: .9375rem; font-weight: 500;">
										<v-icon>mdi-star-check</v-icon>
										CHUYÊN CẦN
									</v-col>
									<v-col cols="12">
										<v-row class="ma-0">
											<v-col cols="6" lg="4" md="4" sm="6" class="pl-4 pt-0 pb-0">
												<strong class=" text-subtitle-2">Vắng không phép:</strong>
												<v-chip color="indigo" text-color="white" class="font-weight-medium "
													size="small">
													{{ ChuyenCan_KQCN_C1?.khongphep ?? '-' }}
												</v-chip>
											</v-col>
											<v-col cols="6" lg="4" md="4" sm="6" class="pl-4  pt-0 pb-0">
												<strong class="mr-2 text-subtitle-2">Vắng có phép:</strong>
												<v-chip color="indigo" text-color="white" class="font-weight-medium "
													size="small">
													{{ ChuyenCan_KQCN_C1?.cophep ?? '-' }}
												</v-chip>
											</v-col>
											<v-col cols="6" lg="4" md="4" sm="6" class="pl-4  pt-0 pb-0">
												<strong class="mr-2 text-subtitle-2">Đi trễ:</strong>
												<v-chip color="indigo" text-color="white" class="font-weight-medium "
													size="small">
													{{ ChuyenCan_KQCN_C1?.ditre ?? '-' }}
												</v-chip>
											</v-col>
										</v-row>
									</v-col>
									<v-col cols="12" class="pb-0 text-h6 text-success" v-if="tab === 4">
										<v-icon>mdi-trophy</v-icon>
										KẾT QUẢ CUỐI NĂM
									</v-col>
									<v-col cols="12" v-if="tab === 4">
										<v-list-item>
											<v-list-item-title>
												<strong class="mr-2 text-subtitle-2">
													Hoàn thành chương trình lớp:
												</strong>
												<v-chip color="primary">
													{{ ChuyenCan_KQCN_C1?.khoiid }}
												</v-chip>
											</v-list-item-title>
										</v-list-item>
										<v-list-item>
											<v-list-item-title>
												<strong class="mr-2 text-subtitle-2">
													Khen thưởng:
												</strong>
												{{ ChuyenCan_KQCN_C1?.khenthuong || '-' }}
											</v-list-item-title>
										</v-list-item>
										<v-list-item>
											<v-list-item-title>
												<strong class="mr-2 text-subtitle-2">
													Rèn luyện trong hè:
												</strong>
												{{ ChuyenCan_KQCN_C1?.renluyenhe ?? '-' }}
											</v-list-item-title>
										</v-list-item>
									</v-col>
								</v-row>
							</v-card>

						</v-tabs-window-item>
					</v-tabs-window>
				</keep-alive>
			</div>
			<!-- Giao diện dành cho cấp 2 - cấp 3 -->
			<div v-if="vueData.HocSinhSelected?.CapID === 2 || vueData.HocSinhSelected?.CapID === 3">
				<!-- UI cho desktop -->
				<div v-if="!vueData.isLowScreen">
					<v-expansion-panels selected-class='bg-primary' variant="default" multiple>
						<v-expansion-panel v-for="item in DSHocKy" class="mb-2 px-2 pt-2">
							<v-expansion-panel-title expand-icon="mdi-menu-down"
								style=" padding: 12px; border-radius: 5px;" class="bg-primary">
								<div class="d-flex  align-center w-100">
									<img src="/_cdn/lhbs-lms/icon_hk.png" height="25" class="mr-2" />
									<p class="font-weight-medium text-button">{{ item.name }}</p>
								</div>
							</v-expansion-panel-title>
							<v-expansion-panel-text>
								<div v-if="item.id == 1">
									<v-data-table class="table-bordered" :items="dataHK_1_C2_C3.Diem" :headers="headers"
										:hide-default-footer="-1" :items-per-page="-1">
										<template v-slot:item.TenMon="{ item }">
											<v-icon class="mr-2"
												:color="DSMonHoc.find(x => x.MonHocName === item.TenMon)?.Color">
												{{DSMonHoc.find(x => x.MonHocName === item.TenMon)?.Icon ||
													'mdi-book-open'}}
											</v-icon>
											{{ item.TenMon }}
										</template>
									</v-data-table>
									<div class="d-flex flex-column px-2">
										<v-row style="border: thin solid #e0e0e0; border-radius: 5px;" class="ma-0">
											<!-- <v-col cols="12">
												<v-icon color="blue" class="mr-1">mdi-chart-bar</v-icon>
												<strong class="mr-2 text-subtitle-2">Điểm trung bình HK1:</strong>
												<v-chip color="indigo" text-color="white" class="font-weight-medium ">
													{{ dataHK_1_C2_C3.TongKet?.dtb ?? '-' }}
												</v-chip>
											</v-col> -->
											<v-col cols="12">
												<v-icon color="green" class="mr-1">mdi-school</v-icon>
												<strong class="mr-2 text-subtitle-2">Kết quả học tập HK1:</strong>
												<v-chip color="green" text-color="white" class="font-weight-medium">
													{{ dataHK_1_C2_C3.TongKet?.hocluc ?? '-' }}
												</v-chip>
											</v-col>
											<v-col cols="12">
												<v-icon color="deep-purple" class="mr-1">mdi-emoticon</v-icon>
												<strong class="mr-2 text-subtitle-2">Kết quả rèn luyện HK1:</strong>
												<v-chip color="orange" text-color="white" class="font-weight-medium">
													{{ dataHK_1_C2_C3.TongKet?.hanhkiem ?? '-' }}
												</v-chip>

											</v-col>
											<!-- <v-col cols="12">
												<v-icon color="amber darken-2" class="mr-1">mdi-trophy</v-icon>
												<strong class="mr-2 text-subtitle-2">Danh hiệu HK1:</strong>
												<v-chip color="amber" text-color="brown" class="font-weight-medium">
													{{ dataHK_1_C2_C3.TongKet?.danhhieu ?? '-' }}
												</v-chip>
											</v-col> -->
										</v-row>
									</div>
								</div>
								<div v-if="item.id == 2">
									<v-data-table :items="dataHK_2_C2_C3.Diem" :headers="headers"
										:hide-default-footer="-1" :items-per-page="-1">
										<template v-slot:item.TenMon="{ item }">
											<v-icon class="mr-2"
												:color="DSMonHoc.find(x => x.MonHocName === item.TenMon)?.Color">
												{{DSMonHoc.find(x => x.MonHocName === item.TenMon)?.Icon ||
													'mdi-book-open'}}
											</v-icon>
											{{ item.TenMon }}
										</template>
									</v-data-table>
									<v-row style="border: thin solid #e0e0e0; border-radius: 5px;" class="ma-0">
										<!-- <v-col cols="12">
											<v-icon color="blue" class="mr-1">mdi-chart-bar</v-icon>
											<strong class="mr-2 text-subtitle-2">Điểm trung bình HK2:</strong>
											<v-chip color="indigo" text-color="white" class="font-weight-medium">
												{{ dataHK_2_C2_C3.TongKet?.dtb ?? '-' }}
											</v-chip>
										</v-col> -->
										<v-col cols="12">
											<v-icon color="green" class="mr-1">mdi-school</v-icon>
											<strong class="mr-2 text-subtitle-2">Kết quả học tập HK2:</strong>
											<v-chip color="green" text-color="white" class="font-weight-medium">
												{{ dataHK_2_C2_C3.TongKet?.hocluc ?? '-' }}
											</v-chip>
										</v-col>
										<v-col cols="12">
											<v-icon color="deep-purple" class="mr-1">mdi-emoticon</v-icon>
											<strong class="mr-2 text-subtitle-2">Kết quả rèn luyện HK2:</strong>
											<v-chip color="orange" text-color="white" class="font-weight-medium">
												{{ dataHK_2_C2_C3.TongKet?.hanhkiem ?? '-' }}
											</v-chip>

										</v-col>
										<!-- <v-col cols="12">
											<v-icon color="amber darken-2" class="mr-1">mdi-trophy</v-icon>
											<strong class="mr-2 text-subtitle-2">Danh hiệu HK2:</strong>
											<v-chip color="amber" text-color="brown" class="font-weight-medium">
												{{ dataHK_2_C2_C3.TongKet?.danhhieu ?? '-' }}
											</v-chip>
										</v-col> -->
									</v-row>
								</div>
								<div v-if="item.id == 3">
									<v-data-table :items="dataCN_C2_C3.Diem" :headers="headersCaNam"
										:hide-default-footer="-1" :items-per-page="-1">
										<template v-slot:item.TenMon="{ item }">
											<v-icon class="mr-2"
												:color="DSMonHoc.find(x => x.MonHocName === item.TenMon)?.Color">
												{{DSMonHoc.find(x => x.MonHocName === item.TenMon)?.Icon ||
													'mdi-book-open'}}
											</v-icon>
											{{ item.TenMon }}
										</template>
									</v-data-table>
									<v-row style="border: thin solid #e0e0e0; border-radius: 5px;" class="ma-0">
										<!-- <v-col cols="12">
											<v-icon color="blue" class="mr-1">mdi-chart-bar</v-icon>
											<strong class="mr-2 text-subtitle-2">Điểm trung bình Cả năm:</strong>
											<v-chip color="indigo" text-color="white" class="font-weight-medium">
												{{ dataCN_C2_C3.TongKet?.dtb ?? '-' }}
											</v-chip>
										</v-col> -->
										<v-col cols="12">
											<v-icon color="green" class="mr-1">mdi-school</v-icon>
											<strong class="mr-2 text-subtitle-2">Kết quả học tập Cả năm:</strong>
											<v-chip color="green" text-color="white" class="font-weight-medium">
												{{ dataCN_C2_C3.TongKet?.hocluc ?? '-' }}
											</v-chip>
										</v-col>
										<v-col cols="12">
											<v-icon color="deep-purple" class="mr-1">mdi-emoticon</v-icon>
											<strong class="mr-2 text-subtitle-2">Kết quả rèn luyện Cả năm:</strong>
											<v-chip color="orange" text-color="white" class="font-weight-medium">
												{{ dataCN_C2_C3.TongKet?.hanhkiem ?? '-' }}
											</v-chip>

										</v-col>
										<v-col cols="12">
											<v-icon color="amber darken-2" class="mr-1">mdi-trophy</v-icon>
											<strong class="mr-2 text-subtitle-2">Danh hiệu Cả năm:</strong>
											<v-chip color="amber" text-color="brown" class="font-weight-medium">
												{{ dataCN_C2_C3.TongKet?.danhhieu ?? '-' }}
											</v-chip>
										</v-col>
									</v-row>
								</div>
							</v-expansion-panel-text>
						</v-expansion-panel>
					</v-expansion-panels>
				</div>
				<!-- UI cho mobile -->
				<div v-else>
					<v-tabs v-model="tab" align-tabs="center" grow fixed-tabs>
						<v-tab :value="hocKy.id" :key="hocKy.id" v-for="hocKy in DSHocKy">
							<div class="d-flex justify-center align-center">
								<img src="/_cdn/lhbs-lms/icon_hk.png" height="25" class="mr-2" />
								<p class="font-weight-medium">{{ hocKy.name }}</p>
							</div>
						</v-tab>
					</v-tabs>
					<v-tabs-window v-model="tab">
						<v-tabs-window-item v-for="hocKy in DSHocKy" :key="hocKy.id" :value="hocKy.id">
							<v-expansion-panels v-model="panelC2_C3" flat selected-class='bg-primary'
								variant="accordion" multiple>
								<v-expansion-panel v-for="item in dataHK_1_C2_C3.Diem" v-if="hocKy.id === 1">
									<v-expansion-panel-title expand-icon="mdi-menu-down"
										style="background-color: #e7f1ff8c; padding: 12px; border-radius: 0;">
										<!-- <img src="/_cdn/lhbs-lms/icon_hk.png" height="25" class="mr-2" /> -->
										<div class="d-flex justify-space-between align-center w-100">
											<div class="d-flex ga-2 align-center">
												<v-icon small class="mr-1"
													:style="{ color: DSMonHoc.find(x => x.MonHocName === item.TenMon)?.Color ?? '#000000' }">
													{{DSMonHoc.find(x => x.MonHocName === item.TenMon)?.Icon ||
														'mdi-book-open'}}
												</v-icon>
												<p class="font-weight-medium">{{ item.TenMon }}</p>
											</div>
											<v-chip class="vChip-full-width-content" color="#1d581e" size="small"
												variant="flat" style="min-width: 90px">
												<div class="d-flex justify-space-between w-100">
													<span>ĐTB: </span>
													<span>{{ item.dtb }}</span>
												</div>
											</v-chip>
										</div>
									</v-expansion-panel-title>
									<v-expansion-panel-text>
										<v-list style="padding: 0">
											<v-list-item title="Điểm KT thường xuyên" v-if="item.ktthuongxuyen">
												<template #append>
													<v-chip color="primary">{{ item.ktthuongxuyen ?? '-' }}</v-chip>
												</template>
												<template #prepend>
													<v-icon size="small" class="mb-1 me-1"
														color="primary">mdi-calendar-check</v-icon>
												</template>
											</v-list-item>
											<v-list-item title="Điểm KT giữa kì" v-if="item.ktgiuaki">
												<template #append>
													<v-chip color="primary">{{ item.ktgiuaki ?? '-' }}</v-chip>
												</template>
												<template #prepend>
													<v-icon size="small" class="mb-1 me-1"
														color="primary">mdi-file-document-edit</v-icon>
												</template>
											</v-list-item>
											<v-list-item title="Điểm KT cuối kì" v-if="item.ktcuoiki">
												<template #append>
													<v-chip color="primary">{{ item.ktcuoiki ?? '-' }}</v-chip>
												</template>
												<template #prepend>
													<v-icon size="small" class="mb-1 me-1"
														color="primary">mdi-school</v-icon>
												</template>
											</v-list-item>
										</v-list>
									</v-expansion-panel-text>
								</v-expansion-panel>
								<v-expansion-panel v-for="item in dataHK_2_C2_C3.Diem" v-if="hocKy.id === 2">
									<v-expansion-panel-title expand-icon="mdi-menu-down"
										style="background-color: #e7f1ff; padding: 12px; border-radius: 0;">
										<!-- <img src="/_cdn/lhbs-lms/icon_hk.png" height="25" class="mr-2" /> -->
										<div class="d-flex justify-space-between align-center w-100">
											<div class="d-flex ga-2 align-center">
												<v-icon small class="mr-1"
													:style="{ color: DSMonHoc.find(x => x.MonHocName === item.TenMon)?.Color ?? '#000000' }">
													{{DSMonHoc.find(x => x.MonHocName === item.TenMon)?.Icon ||
														'mdi-book-open'}}
												</v-icon>
												<p class="font-weight-medium">{{ item.TenMon }}</p>
											</div>
											<v-chip class="vChip-full-width-content" color="#1d581e" variant="flat"
												style="min-width: 90px">
												<div class="d-flex justify-space-between w-100">
													<span>ĐTB: </span>
													<span>{{ item.dtb }}</span>
												</div>
											</v-chip>
										</div>
									</v-expansion-panel-title>
									<v-expansion-panel-text>
										<v-list style="padding: 0">
											<v-list-item title="Điểm KT thường xuyên" v-if="item.ktthuongxuyen">
												<template #append>
													<v-chip color="primary">{{ item.ktthuongxuyen ?? '-' }}</v-chip>
												</template>
												<template #prepend>
													<v-icon size="small" class="mb-1 me-1"
														color="primary">mdi-calendar-check</v-icon>
												</template>
											</v-list-item>
											<v-list-item title="Điểm KT giữa kì" v-if="item.ktgiuaki">
												<template #append>
													<v-chip color="primary">{{ item.ktgiuaki ?? '-' }}</v-chip>
												</template>
												<template #prepend>
													<v-icon size="small" class="mb-1 me-1"
														color="primary">mdi-file-document-edit</v-icon>
												</template>
											</v-list-item>
											<v-list-item title="Điểm KT cuối kì" v-if="item.ktcuoiki">
												<template #append>
													<v-chip color="primary">{{ item.ktcuoiki ?? '-' }}</v-chip>
												</template>
												<template #prepend>
													<v-icon size="small" class="mb-1 me-1"
														color="primary">mdi-school</v-icon>
												</template>
											</v-list-item>
										</v-list>
									</v-expansion-panel-text>
								</v-expansion-panel>
								<v-expansion-panel readonly :expandIcon="null" :expanded="false"
									v-for="item in dataCN_C2_C3.Diem" v-if="hocKy.id === 3" variant="accordion">
									<v-expansion-panel-title
										style="background-color: #e7f1ff; padding: 12px; border-radius: 0;">
										<!-- <img src="/_cdn/lhbs-lms/icon_hk.png" height="25" class="mr-2" /> -->
										<div class="d-flex justify-space-between align-center w-100">
											<div class="d-flex ga-2 align-center">
												<v-icon small class="mr-1"
													:style="{ color: DSMonHoc.find(x => x.MonHocName === item.TenMon)?.Color ?? '#000000' }">
													{{DSMonHoc.find(x => x.MonHocName === item.TenMon)?.Icon ||
														'mdi-book-open'}}
												</v-icon>
												<p class="font-weight-medium">{{ item.TenMon }}</p>
											</div>

											<v-chip class="vChip-full-width-content" color="#1d581e" variant="flat"
												style="min-width: 90px">
												<div class="d-flex justify-space-between w-100">
													<span>ĐTB: </span>
													<span>{{ item.dtb }}</span>
												</div>
											</v-chip>
										</div>
										<template #actions></template>
									</v-expansion-panel-title>
									<v-expansion-panel-text>
										<v-list style="padding: 0">
											<v-list-item title="Điểm KT thường xuyên" v-if="item.ktthuongxuyen">
												<template #append>
													<v-chip color="primary">{{ item.ktthuongxuyen ?? '-' }}</v-chip>
												</template>
												<template #prepend>
													<v-icon size="small" class="mb-1 me-1"
														color="primary">mdi-calendar-check</v-icon>
												</template>
											</v-list-item>
											<v-list-item title="Điểm KT giữa kì" v-if="item.ktgiuaki">
												<template #append>
													<v-chip color="primary">{{ item.ktgiuaki ?? '-' }}</v-chip>
												</template>
												<template #prepend>
													<v-icon size="small" class="mb-1 me-1"
														color="primary">mdi-file-document-edit</v-icon>
												</template>
											</v-list-item>
											<v-list-item title="Điểm KT cuối kì" v-if="item.ktcuoiki">
												<template #append>
													<v-chip color="primary">{{ item.ktcuoiki ?? '-' }}</v-chip>
												</template>
												<template #prepend>
													<v-icon size="small" class="mb-1 me-1"
														color="primary">mdi-school</v-icon>
												</template>
											</v-list-item>
										</v-list>
									</v-expansion-panel-text>
								</v-expansion-panel>
							</v-expansion-panels>
							<div v-if="hocKy.id === 1">
								<v-divider></v-divider>
								<v-card>
									<v-row class="pa-3 ma-0">
										<!-- <v-col cols="12" sm="6" md="3">
											<v-icon color="blue" class="mr-1">mdi-chart-bar</v-icon>
											<strong class="mr-2">Điểm trung bình HK1:</strong>
											<v-chip color="indigo" text-color="white" class="font-weight-medium">
												{{ dataHK_1_C2_C3.TongKet?.dtb ?? '-' }}
											</v-chip>
										</v-col> -->
										<v-col cols="12" sm="6" md="3">
											<v-icon color="green" class="mr-1">mdi-school</v-icon>
											<strong class="mr-2">Kết quả học tập HK1:</strong>
											<v-chip color="green" text-color="white" class="font-weight-medium">
												{{ dataHK_1_C2_C3.TongKet?.hocluc ?? '-' }}
											</v-chip>
										</v-col>
										<v-col cols="12" sm="6" md="3">
											<v-icon color="deep-purple" class="mr-1">mdi-emoticon</v-icon>
											<strong class="mr-2">Kết quả rèn luyện HK1:</strong>
											<v-chip color="orange" text-color="white" class="font-weight-medium">
												{{ dataHK_1_C2_C3.TongKet?.hanhkiem ?? '-' }}
											</v-chip>

										</v-col>
										<!-- <v-col cols="12" sm="6" md="3">
											<v-icon color="amber darken-2" class="mr-1">mdi-trophy</v-icon>
											<strong class="mr-2">Danh hiệu HK1:</strong>
											<v-chip color="amber" text-color="brown" class="font-weight-medium">
												{{ dataHK_1_C2_C3.TongKet?.danhhieu ?? '-' }}
											</v-chip>
										</v-col> -->
									</v-row>
								</v-card>
							</div>
							<div v-if="hocKy.id === 2">
								<v-divider></v-divider>
								<v-card>
									<v-row class="pa-3 ma-0">
										<!-- <v-col cols="12" sm="6" md="3">
											<v-icon color="blue" class="mr-1">mdi-chart-bar</v-icon>
											<strong class="mr-2">Điểm trung bình HK2:</strong>
											<v-chip color="indigo" text-color="white" class="font-weight-medium">
												{{ dataHK_2_C2_C3.TongKet?.dtb ?? '-' }}
											</v-chip>
										</v-col> -->
										<v-col cols="12" sm="6" md="3">
											<v-icon color="green" class="mr-1">mdi-school</v-icon>
											<strong class="mr-2">Kết quả học tập HK2:</strong>
											<v-chip color="green" text-color="white" class="font-weight-medium">
												{{ dataHK_2_C2_C3.TongKet?.hocluc ?? '-' }}
											</v-chip>
										</v-col>
										<v-col cols="12" sm="6" md="3">
											<v-icon color="deep-purple" class="mr-1">mdi-emoticon</v-icon>
											<strong class="mr-2">Kết quả rèn luyện HK2:</strong>
											<v-chip color="orange" text-color="white" class="font-weight-medium">
												{{ dataHK_2_C2_C3.TongKet?.hanhkiem ?? '-' }}
											</v-chip>

										</v-col>
										<!-- <v-col cols="12" sm="6" md="3">
											<v-icon color="amber darken-2" class="mr-1">mdi-trophy</v-icon>
											<strong class="mr-2">Danh hiệu HK2:</strong>
											<v-chip color="amber" text-color="brown" class="font-weight-medium">
												{{ dataHK_2_C2_C3.TongKet?.danhhieu ?? '-' }}
											</v-chip>
										</v-col> -->
									</v-row>
								</v-card>
							</div>
							<div v-if="hocKy.id === 3">
								<v-divider></v-divider>
								<v-card>
									<v-row class="pa-3 ma-0">
										<!-- <v-col cols="12" sm="6" md="3">
											<v-icon color="blue" class="mr-1">mdi-chart-bar</v-icon>
											<strong class="mr-2">Điểm trung bình Cả năm:</strong>
											<v-chip color="indigo" text-color="white" class="font-weight-medium">
												{{ dataCN_C2_C3.TongKet?.dtb ?? '-' }}
											</v-chip>
										</v-col> -->
										<v-col cols="12" sm="6" md="3">
											<v-icon color="green" class="mr-1">mdi-school</v-icon>
											<strong class="mr-2">Kết quả học tập Cả năm:</strong>
											<v-chip color="green" text-color="white" class="font-weight-medium">
												{{ dataCN_C2_C3.TongKet?.hocluc ?? '-' }}
											</v-chip>
										</v-col>
										<v-col cols="12" sm="6" md="3">
											<v-icon color="deep-purple" class="mr-1">mdi-emoticon</v-icon>
											<strong class="mr-2">Kết quả rèn luyện Cả năm:</strong>
											<v-chip color="orange" text-color="white" class="font-weight-medium">
												{{ dataCN_C2_C3.TongKet?.hanhkiem ?? '-' }}
											</v-chip>

										</v-col>
										<v-col cols="12" sm="6" md="3">
											<v-icon color="amber darken-2" class="mr-1">mdi-trophy</v-icon>
											<strong class="mr-2">Danh hiệu Cả năm:</strong>
											<v-chip color="deep-orange-lighten-1" class="font-weight-medium">
												{{ dataCN_C2_C3.TongKet?.danhhieu ?? '-' }}
											</v-chip>
										</v-col>
									</v-row>
								</v-card>
							</div>
						</v-tabs-window-item>
					</v-tabs-window>
				</div>
			</div>
		</v-list>
	</div>
</template>

<script>
export default {
	props: [],
	data() {
		const { useI18n } = VueI18n
		const { t } = useI18n()
		return {
			panel: [0],
			panelC2_C3: [],
			panelC1_KT_KN: [],
			panelC1_NLC: [],
			panelC1_PC: [],
			panelC1_NLR: [],
			GroupPanel: [0, 1, 2, 3],
			tab: null,
			DSHocKy: [],
			DSMonHocGroup: [
				{
					MonHocGroup: 1,
					Name_VI: t('message.Skill_Knowledge'),
					Name_EN: '',
					icon: '/_cdn/lhbs-lms/kienthuc_ki_nang_icon.png',
					Color: "blue-lighten-5"
				},
				{
					MonHocGroup: 2,
					Name_VI: t('message.Common_Ability'),
					Name_EN: '',
					icon: '/_cdn/lhbs-lms/nang_luc_chung_icon.png',
					Color: "red-lighten-5"
				},
				{
					MonHocGroup: 3,
					Name_VI: t('message.Quality'),
					Name_EN: '',
					icon: '/_cdn/lhbs-lms/pham_chat_icon.png',
					Color: "yellow-lighten-5"
				},
				{
					MonHocGroup: 4,
					Name_VI: t('message.Personal_Ability'),
					Name_EN: '',
					icon: '/_cdn/lhbs-lms/nang_luc_rieng.png',
					Color: "brown-lighten-5"
				},
			],
			DSMonHoc: [],
			DSMonHoc_ByGroup: [],
			MonHocGroup_Obj: {},
			DSMonHoc_NhomDiem: [],
			DSNhomDiem: [],
			MonHocSelected: null,
			IsLoadingPage: false,
			IsLoadingDSHocSinh: false,
			lodash: _,
			vueData,
			IsLanguage: localStorage.getItem('IsLanguage') ? JSON.parse(localStorage.getItem('IsLanguage')) : false,
			List_MonHoc_Change: [
				"STEM",
				"JA-GD Tài chính",
				"AI - Robotics",
				"GDKN-Vận động theo nhạc",
				"GDKN-Cờ vua",
				"GDKN-Ẩm thực nấu ăn"
			],
			groupKTKN: [],
			groupNLR: [],
			groupPC: [],
			groupNLC: [],
			ChuyenCan_KQCN_C1: {},
			dataHK_1_C2_C3: {
				Diem: [],
				TongKet: {}
			},
			dataHK_2_C2_C3: {
				Diem: [],
				TongKet: {}
			},
			dataCN_C2_C3: {
				Diem: [],
				TongKet: {}
			},
			headers: [
				{
					title: "Tên môn",
					value: "TenMon"
				},
				{
					title: "KT thường xuyên",
					value: "ktthuongxuyen",
					align: "end"
				},
				{
					title: "KT giữa kì",
					value: "ktgiuaki",
					align: "end",
				},
				{
					title: "KT cuối kì",
					value: "ktcuoiki",
					align: "end",
				},
				{
					title: "Điểm trung bình",
					value: "dtb",
					align: "end",
					headerProps: {
						class: "bg-light-green-lighten-4",
					},
					cellProps: {
						class: "bg-light-green-lighten-4 font-weight-medium",
						style: "font-size: 15px"
					}
				}
			],
			headersCaNam: [
				{
					title: "Tên môn",
					value: "TenMon"
				},
				{
					title: "Điểm trung bình",
					value: "dtb",
					align: "end",
					headerProps: {
						class: "bg-light-green-lighten-4",
					},
					cellProps: {
						class: "bg-light-green-lighten-4 font-weight-medium",
						style: "font-size: 15px"
					}
				}
			],
			initLoading: false
		}
	},
	async mounted() {
		// this.initLoading = true
		await this.loadDSMonHoc()
		await this.loadCongBoBangDiem()
		// this.initLoading = false
	},
	watch: {
		panelC2_C3: function (v) {
			console.log('v', v)
		},
		'$i18n.locale': function (language) {
			if (language === 'en') this.IsLanguage = true
			else this.IsLanguage = false
			this.updateDSMonHocGroup();
		},
		tab: async function (tab) {
			if (tab) {
				localStorage.setItem('Semester', tab)
				if (vueData.HocSinhSelected.CapID === 1) {
					this.DSMonHoc_NhomDiem = await this.loadHocSinhKQHT(tab)
				}
				this.loadHocSinhKQHT(tab)
			}
		}
	},
	methods: {
		loadCongBoBangDiem() {
			return new Promise(resolve => {
				ajaxCALL('lms/CongBoBangDiem_Get',
					{
						CapID: vueData.HocSinhSelected.CapID,
						NienKhoa: vueData.NienKhoa
					},
					res => {
						const data = res.data
						if (vueData.HocSinhSelected.CapID === 1) {
							this.DSHocKy = data.map(x => {
								let name = ''
								if (x.KyDanhGia === 1) name = "GHKI"
								if (x.KyDanhGia === 2) name = "CHKI"
								if (x.KyDanhGia === 3) name = "GHKII"
								if (x.KyDanhGia === 4) name = "CN"
								return {
									id: x.KyDanhGia,
									name: name
								}
							})
						}
						else {
							this.DSHocKy = [{
								id: 1,
								name: `${this.$t('message.semester')} 1`
							},
							{
								id: 2,
								name: `${this.$t('message.semester')} 2`
							},
							{
								id: 3,
								name: `${this.$t('message.allYear')}`
							}]
						}

						console.log("data.length", data.length)
						this.tab = 2//data.length
						resolve()
					})
			})
		},
		loadDSMonHoc() {
			return new Promise(resolve => {
				ajaxCALL('lms/MonHoc_Get_ByCapID', {
					CapID: vueData.HocSinhSelected.CapID
				}, res => {
					this.DSMonHoc = res.data
					console.log("DsMonHoc", res.data)
					resolve()
				})
			})

		},
		loadHocSinhKQHT(code) {
			if (!vueData.NienKhoa || !code) return
			return new Promise(async resolve => {
				ajaxCALL('diemc3/LMS_GetBangDiem', {
					HocSinhID: vueData.HocSinhSelected.HocSinhID,
					Khoi: vueData.HocSinhSelected.KhoiID,
					NamHoc: vueData.NienKhoa,
					KyDanhGia: code,
				}, res => {
					if (vueData.HocSinhSelected.CapID === 1) {
						const data = res.data[0] ?? {}
						this.groupKTKN = this.fn_groupKTKN(data)
						this.groupNLR = this.fn_groupNLR(data)
						this.groupPC = this.fn_groupPC(data)
						this.groupNLC = this.fn_groupNLC(data)

						this.ChuyenCan_KQCN_C1 = {
							khongphep: data?.khongphep,
							cophep: data?.cophep,
							ditre: data?.ditre,
							khoiid: data?.khoiid,
							khenthuong: data?.khenthuong,
							renluyenhe: data?.renluyenhe,
						}
						//Gọi thêm để lấy điểm còn thiếu từ bên a Chiến
						ajaxCALL('lms/LMS_OutSLL_GetKetQuaHocTap_ByHocSinhID', {
							LopID: vueData.HocSinhSelected.LopID,
							KyDanhGia: this.tab,
							NamHoc: vueData.NienKhoa,
							HocSinhID: vueData.HocSinhSelected.HocSinhID,
						}, res => {
							const data = res.data
							const newData = []
							const uniqueMonHoc = [...new Set(data.map(x => x.MonHocCode))]
							for (var monHocCode of uniqueMonHoc) {
								const obj = {}
								const arrFilterMaCotDiem = data.filter(x => x.MonHocCode === monHocCode)
								for (var maCotDiem of arrFilterMaCotDiem) {
									obj[maCotDiem.MaCotDiem] = maCotDiem.KetQuaDanhGia
								}
								obj.HocSinhID = arrFilterMaCotDiem[0]?.HocSinhID
								obj.MonHocCode = monHocCode
								obj.MonHocName = arrFilterMaCotDiem[0]?.MonHocName
								newData.push(obj)
							}
							const monHocFilter_HocSinh = newData.filter(x => this.List_MonHoc_Change.includes(x.MonHocName))

							console.log("monHocFilter_HocSinh", monHocFilter_HocSinh)
							let DiemSTEM = monHocFilter_HocSinh.find(x => x.MonHocName === 'STEM')?.DiemMonHoc
							let DiemJA = monHocFilter_HocSinh.find(x => x.MonHocName === 'JA-GD Tài chính')?.DiemMonHoc
							let DiemAI = monHocFilter_HocSinh.find(x => x.MonHocName === 'AI - Robotics')?.DiemMonHoc
							let DiemGDKN_VDTN = monHocFilter_HocSinh.find(x => x.MonHocName === 'GDKN-Vận động theo nhạc')?.DiemMonHoc
							let DiemGDKN_CV = monHocFilter_HocSinh.find(x => x.MonHocName === 'GDKN-Cờ vua')?.DiemMonHoc
							let DiemGDKN_ATNA = monHocFilter_HocSinh.find(x => x.MonHocName === 'GDKN-Ẩm thực nấu ăn')?.DiemMonHoc

							let SaoSTEM = monHocFilter_HocSinh.find(x => x.MonHocName === 'STEM')?.QuyDoiSao
							let SaoJA = monHocFilter_HocSinh.find(x => x.MonHocName === 'JA-GD Tài chính')?.QuyDoiSao
							let SaoAI = monHocFilter_HocSinh.find(x => x.MonHocName === 'AI - Robotics')?.QuyDoiSao
							let SaoGDKN_VDTN = monHocFilter_HocSinh.find(x => x.MonHocName === 'GDKN-Vận động theo nhạc')?.QuyDoiSao
							let SaoGDKN_CV = monHocFilter_HocSinh.find(x => x.MonHocName === 'GDKN-Cờ vua')?.QuyDoiSao
							let SaoGDKN_ATNA = monHocFilter_HocSinh.find(x => x.MonHocName === 'GDKN-Ẩm thực nấu ăn')?.QuyDoiSao

							let NhanXet_GDKN_ATNA = monHocFilter_HocSinh.find(x => x.MonHocName === 'GDKN-Ẩm thực nấu ăn')?.NhanXet

							this.groupKTKN = {
								...this.groupKTKN,
								"STEM": {
									// STED: DiemSTEM,
									STES: SaoSTEM,
									STENX: this.groupKTKN['STEM']?.STENX
								},
								"JA-GD Tài chính": {
									// JAD: DiemJA,
									JAS: SaoJA,
									JANX: this.groupKTKN['JA-GD Tài chính']?.JANX
								},
								"AI - Robotics": {
									// AID: DiemAI,
									AIS: SaoAI,
									AINX: this.groupKTKN['AI - Robotics']?.AINX
								},
								"GDKN-Vận động theo nhạc": {
									// KNND: DiemGDKN_VDTN,
									KNNS: SaoGDKN_VDTN,
									KNNNX: this.groupKTKN['GDKN-Vận động theo nhạc']?.KNNNX
								},
								"GDKN-Cờ vua": {
									// KNCD: DiemGDKN_CV,
									KNCS: SaoGDKN_CV,
									KNCNX: this.groupKTKN['GDKN-Cờ vua']?.KNCNX
								},
								"GDKN-Ẩm thực nấu ăn": {
									// KNCD: DiemGDKN_CV,
									KNATNAS: SaoGDKN_ATNA,
									KNATNANX: NhanXet_GDKN_ATNA
								}
							}
							console.log("SaoGDKN_ATNA", SaoGDKN_ATNA)
							console.log("NhanXet_GDKN_ATNA", NhanXet_GDKN_ATNA)
							console.log("this.groupKTKN =>", this.groupKTKN)

							const groupKTKNLength = Object.keys(this.groupKTKN).length
							const groupNLRLength = Object.keys(this.groupNLR).length
							const groupPCLength = Object.keys(this.groupPC).length
							const groupNLCLength = Object.keys(this.groupNLC).length

							// Lấy toàn bộ keys và kèm index gốc
							const keys = Object.keys(this.groupKTKN);
							const validIndexes = keys.reduce((acc, key, index) => {
								const obj = this.groupKTKN[key];
								const nxKey = Object.keys(obj).find(k => k.includes('NX'));
								const nxValue = nxKey ? obj[nxKey] : null;

								if (nxValue !== "" && nxValue !== null && nxValue !== undefined) {
									acc.push(index); // giữ index gốc
								}

								return acc;
							}, []);

							this.panelC1_KT_KN = validIndexes //Array.from({ length: groupKTKNLength }, (_, i) => i)
							this.panelC1_NLR = Array.from({ length: groupNLRLength }, (_, i) => i)
							this.panelC1_PC = Array.from({ length: groupPCLength }, (_, i) => i)
							this.panelC1_NLC = Array.from({ length: groupNLCLength }, (_, i) => i)
						})
					} else {
						this.panelC2_C3 = Array.from({ length: res.data[0].length }, (_, i) => i)
						this.dataHK_1_C2_C3 = {
							Diem: res.data[0],
							TongKet: res.data[1][0] ?? {}
						}
						this.dataHK_2_C2_C3 = {
							Diem: res.data[2],
							TongKet: res.data[3][0] ?? {}
						}
						this.dataCN_C2_C3 = {
							Diem: res.data[4],
							TongKet: res.data[5][0] ?? {}
						}
					}
					resolve()
				})

			})
		},
		updateDSMonHocGroup() {
			this.DSMonHocGroup = [
				{
					MonHocGroup: 1,
					Name_VI: this.$t('message.Skill_Knowledge'),
					Name_EN: '',
					icon: '/_cdn/lhbs-lms/kienthuc_ki_nang_icon.png',
				},
				{
					MonHocGroup: 2,
					Name_VI: this.$t('message.Common_Ability'),
					Name_EN: '',
					icon: '/_cdn/lhbs-lms/nang_luc_chung_icon.png',
				},
				{
					MonHocGroup: 3,
					Name_VI: this.$t('message.Quality'),
					Name_EN: '',
					icon: '/_cdn/lhbs-lms/pham_chat_icon.png',
				},
				{
					MonHocGroup: 4,
					Name_VI: this.$t('message.Personal_Ability'),
					Name_EN: '',
					icon: '/_cdn/lhbs-lms/nang_luc_rieng.png',
				},
			];
		},
		updateDSHocKy() {
			if (vueData.HocSinhSelected.CapID === 1) {
				this.DSHocKy = [
					{
						...this.DSHocKy[0],
						id: 1,
						name: `${this.$t('message.midSesemter')} 1`
					},
					{
						...this.DSHocKy[1],
						id: 2,
						name: `${this.$t('message.finalSesemter')} 2`
					},
					{
						...this.DSHocKy[3],
						id: 3,
						name: `${this.$t('message.midSesemter')} 1`
					},
					{
						...this.DSHocKy[4],
						id: 4,
						name: `${this.$t('message.finalSesemter')} 2`
					}
				]
			}
			else {
				this.DSHocKy = [
					{
						...this.DSHocKy[0],
						name: `${this.$t('message.semester')} 1`

					},
					{
						...this.DSHocKy[1],
						name: `${this.$t('message.semester')} 2`
					}
				]
			}
		},
		fn_groupKTKN({
			TVM, TVD, TVNX, TOM, TOD, TONX, KHM,
			KHD, KHNX, SDM, SDD, SDNX, NNM, NND,
			NNNX, THM, THD, THNX, CNM, CND, CNNX,
			DTM, DTD, DTNX, DDM, DDNX, ANM, ANNX,
			MTM, MTNX, KTM, KTNX, TDM, TDNX, STENX,
			JANX, AINX, KNHNX, KNNNX, KNCNX
		}) {
			let data = {}
			if (vueData.HocSinhSelected.CapID === 1 && [1, 2, 3].includes(vueData.HocSinhSelected.KhoiID)) {
				data = {
					"Tiếng Việt": {
						TVM,
						TVD,
						TVNX
					},
					"Toán": {
						TOM,
						TOD,
						TONX
					},
					"Tự nhiên và Xã hội": {
						KHM,
						KHD,
						KHNX
					},
					// Mẫn sửa Lịch sử/Địa lí => Lịch sử và Địa lí
					"Lịch sử/Địa lí": {
						SDM,
						SDD,
						SDNX
					},
					"Ngoại ngữ": {
						NNM,
						NND,
						NNNX
					},
					"Tin học và Công nghệ (Tin học)": {
						THM,
						THD,
						THNX
					},
					"Tin học và Công nghệ (Công nghệ)": {
						CNM,
						CND,
						CNNX
					},
					// "": { DTM, DTD, DTNX },
					"Đạo đức": {
						DDM,
						DDNX
					},
					// Mẫn sửa Âm nhạc => Nghệ thuật (Âm nhạc)
					"Âm nhạc": {
						ANM,
						ANNX
					},
					// Mẫn sửa Mĩ thuật => Nghệ thuật (Mĩ thuật)
					"Mĩ thuật": {
						MTM,
						MTNX
					},
					"Hoạt động trải nghiệm": {
						KTM,
						KTNX
					},
					//Mẫn sửa Thể dục => Giáo dục thể chất (01/10/2025)
					"Giáo dục thể chất": {
						TDM,
						TDNX
					},
					"STEM": {
						STENX
					},
					"JA-GD Tài chính": {
						JANX
					},
					"AI - Robotics": {
						AINX
					},
					"GDKN - Học tập TK21": {
						KNHNX
					},
					"GDKN-Vận động theo nhạc": {
						KNNNX
					},
					"GDKN-Cờ vua": {
						KNCNX
					}
				}
			} else {
				data = {
					"Tiếng Việt": {
						TVM,
						TVD,
						TVNX
					},
					"Toán": {
						TOM,
						TOD,
						TONX
					},
					"Khoa học": {
						KHM,
						KHD,
						KHNX
					},
					// Mẫn sửa Lịch sử/Địa lí => Lịch sử và Địa lí
					"Lịch sử/Địa lí": {
						SDM,
						SDD,
						SDNX
					},
					"Ngoại ngữ": {
						NNM,
						NND,
						NNNX
					},
					"Tin học và Công nghệ (Tin học)": {
						THM,
						THD,
						THNX
					},
					"Tin học và Công nghệ (Công nghệ)": {
						CNM,
						CND,
						CNNX
					},
					// "": { DTM, DTD, DTNX },
					"Đạo đức": {
						DDM,
						DDNX
					},
					// Mẫn sửa Âm nhạc => Nghệ thuật (Âm nhạc)
					"Âm nhạc": {
						ANM,
						ANNX
					},
					// Mẫn sửa Mĩ thuật => Nghệ thuật (Mĩ thuật)
					"Mĩ thuật": {
						MTM,
						MTNX
					},
					"Hoạt động trải nghiệm": {
						KTM,
						KTNX
					},
					//Mẫn sửa Thể dục => Giáo dục thể chất (01/10/2025)
					"Giáo dục thể chất": {
						TDM,
						TDNX
					},
					"STEM": {
						STENX
					},
					"JA-GD Tài chính": {
						JANX
					},
					"AI - Robotics": {
						AINX
					},
					"GDKN - Học tập TK21": {
						KNHNX
					},
					"GDKN-Vận động theo nhạc": {
						KNNNX
					},
					"GDKN-Cờ vua": {
						KNCNX
					}
				}
			}
			return data
		},
		fn_groupNLC({ NL1, NL2, NL3, NLC1NX, NLC2NX, NLC3NX }) {
			const data = {
				"Năng lực-Tự chủ và tự học": {
					NL1,
					NLC1NX
				},
				"Năng lực-Giao tiếp và hợp tác": {
					NL2,
					NLC2NX
				},
				"Năng lực-Giải quyết vấn đề và sáng tạo": {
					NL3,
					NLC3NX
				}
			}
			return data
		},
		fn_groupPC({ PC1, PC2, PC3, PC4, PC5, PC1NX, PC2NX, PC3NX, PC4NX, PC5NX }) {
			const data = {
				"Phẩm chất-Yêu nước": {
					PC1,
					PC1NX
				},
				"Phẩm chất-Nhân ái": {
					PC2,
					PC2NX
				},
				"Phẩm chất-Chăm chỉ": {
					PC3,
					PC3NX
				},
				"Phẩm chất-Trung thực": {
					PC4,
					PC4NX
				},
				"Phẩm chất-Trách nhiệm": {
					PC5,
					PC5NX
				}
			}
			return data
		},
		fn_groupNLR({
			NLR1, NLR2, NLR3, NLR4, NLR5,
			NLR6, NLR7, NLR1NX, NLR2NX, NLR3NX,
			NLR4NX, NLR5NX, NLR6NX, NLR7NX
		}) {
			data = {
				"Năng lực-Ngôn ngữ": {
					NLR1,
					NLR1NX
				},
				"Năng lực-Tính toán": {
					NLR2,
					NLR2NX
				},
				"Năng lực-Khoa học": {
					NLR3,
					NLR3NX
				},
				"Năng lực-Công nghệ": {
					NLR4,
					NLR4NX
				},
				"Năng lực-Tin học": {
					NLR5,
					NLR5NX
				},
				"Năng lực-Thẩm mĩ": {
					NLR6,
					NLR6NX
				},
				"Năng lực-Thể chất": {
					NLR7,
					NLR7NX
				}
			}
			return data
		},
		getColorChipDiem,
		getColorMucDoDanhGia(MucDoDanhGia) {
			let color = ''
			if (MucDoDanhGia === 'T') color = 'success'
			if (MucDoDanhGia === 'H') color = 'primary'
			if (MucDoDanhGia == 'Đ') color = 'primary'
			if (MucDoDanhGia == 'Ð') color = 'primary' // Thêm IF unicode tránh bị sai
			if (MucDoDanhGia === 'C') color = 'amber'
			return color
		},
		getBgColorMucDoDanhGia(MucDoDanhGia) {
			let color = ''
			if (MucDoDanhGia === 'T') color = 'green-lighten-5'
			if (MucDoDanhGia === 'H') color = 'blue-lighten-5'
			if (MucDoDanhGia == 'Đ') color = 'blue-lighten-5'
			if (MucDoDanhGia == 'Ð') color = 'blue-lighten-5' // Thêm IF unicode tránh bị sai
			if (MucDoDanhGia === 'C') color = 'amber-lighten-3'
			return color
		},
		isCheckEmpty(valueList, value) {
			let flag = false
			if ((value[valueList.find(it => it.endsWith('NX'))] === '')) flag = true
			return flag
		}
	},
}
</script>