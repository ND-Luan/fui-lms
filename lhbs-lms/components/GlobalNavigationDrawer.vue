<template>
	<div>
        <v-navigation-drawer v-if="!isMobile" class="global-nav-drawer" :rail="rail" :width="drawerWidth"
            rail-width="72" permanent>
            <!-- Branding -->
            <div class="pa-4 pb-2">
                <div class="d-flex align-center ga-3" :class="{ 'justify-center': rail }">
                    <v-img src="/_cdn/lhbs-lms/SongNgu_logo.png" :width="rail ? 32 : 40" :height="rail ? 32 : 40"
                        flex="0 0 auto" />
                    <div v-if="!rail" style="overflow: hidden; white-space: nowrap">
                        <div class="text-h6 font-weight-bold" style="line-height: 1.2">LHBS</div>
                        <div class="text-caption text-medium-emphasis" style="line-height: 1.2">Learning management
                            system</div>
                    </div>
                </div>
            </div>

            <!-- Avatar + tên -->
            <div class="global-nav-header">
                <v-avatar size="32" class="global-nav-avatar" color="primary">
                    <v-img v-if="avatarUrl" :src="avatarUrl" />
                    <span v-else>{{ userInitials }}</span>
                </v-avatar>
                <div v-if="!rail" class="global-nav-user">
                    <div class="global-nav-name text-body-2">{{ displayName }}</div>
                    <div class="global-nav-meta text-caption">{{ roleLabel }}</div>
                </div>
            </div>

            <v-divider />

            <!-- Niên khóa -->
            <div v-if="!rail" class="px-4 py-3">
                <v-select v-model="NKItem" :items="DSNK"
                    :item-title="(item) => `${item.NienKhoa} - Học kì ${item.HocKi}`" item-value="NienKhoaID"
                    label="Niên khóa" density="compact" variant="outlined" hide-details return-object />
            </div>

            <v-divider />

            <!-- ── Yêu thích ── -->
            <template v-if="visibleFavorites.length">
                <div v-if="!rail" class="global-nav-section-header" @click="favExpanded = !favExpanded">
                    <span class="global-nav-section-label">
                        <v-icon size="14" color="amber-darken-1">mdi-star</v-icon>
                        Truy cập nhanh
                    </span>
                    <v-icon size="16" color="grey">{{ favExpanded ? 'mdi-chevron-up' : 'mdi-chevron-down' }}</v-icon>
                </div>

                <v-list v-if="favExpanded || rail" class="global-nav-list global-nav-fav-list" density="compact" nav>
                    <v-list-item v-for="fav in visibleFavorites" :key="fav.url" :active="isCurrentRoute(fav.url)"
                        :prepend-icon="fav.icon || 'mdi-bookmark-outline'" color="primary" rounded="lg"
                        class="global-nav-fav-item" @click="navigateTo(fav.url)">
                        <v-list-item-title>{{ fav.name }}</v-list-item-title>
                        <v-list-item-subtitle v-if="fav.groupName" class="global-nav-fav-subtitle">
                            {{ fav.groupName }}
                        </v-list-item-subtitle>

                        <template v-if="!rail" #append>
                            <v-btn icon="mdi-star" color="amber-darken-1" size="x-small" variant="text"
                                title="Bỏ yêu thích" @click.stop="removeFavorite(fav.url)" />
                        </template>
                    </v-list-item>
                </v-list>

                <v-divider />
            </template>

            <!-- ── Menu chính ── -->
            <v-list class="global-nav-list" density="compact" nav>
                <template v-for="item in menuLeft">
                    <!-- Có submenu -->
                    <v-list-group v-if="item.submenu && item.submenu.length" :key="`group-${item.name}`"
                        :value="item.name">
                        <template #activator="{ props }">
                            <v-list-item v-bind="props" :prepend-icon="item.icon || 'mdi-apps'" :title="item.name"
                                :active="isGroupActive(item)" color="primary" rounded="lg" />
                        </template>

                        <v-list-item v-for="child in item.submenu" :key="child.url || child.name"
                            :active="isCurrentRoute(child.url)" color="primary" rounded="lg" class="global-nav-subitem"
                            @click="navigateTo(child.url)">
                            <v-list-item-title>{{ child.name }}</v-list-item-title>

                            <template v-if="!rail" #append>
                                <v-btn :icon="isFavorite(child.url) ? 'mdi-star' : 'mdi-star-outline'"
                                    :color="isFavorite(child.url) ? 'amber-darken-1' : 'grey-lighten-2'" size="x-small"
                                    variant="text"
                                    :title="isFavorite(child.url) ? 'Bỏ yêu thích' : 'Thêm vào yêu thích'"
                                    :class="['global-nav-pin-btn', { 'is-faved': isFavorite(child.url) }]"
                                    @click.stop="toggleFavorite(child, item.icon, item.name)" />
                            </template>
                        </v-list-item>
                    </v-list-group>

                    <!-- Item thường -->
                    <v-list-item v-else :key="`item-${item.url || item.name}`" :active="isCurrentRoute(item.url)"
                        :prepend-icon="item.icon || 'mdi-apps'" :value="item.url" color="primary" rounded="lg"
                        @click="navigateTo(item.url)">
                        <v-list-item-title>{{ item.name }}</v-list-item-title>

                        <template v-if="!rail && item.url" #append>
                            <v-btn :icon="isFavorite(item.url) ? 'mdi-star' : 'mdi-star-outline'"
                                :color="isFavorite(item.url) ? 'amber-darken-1' : 'grey-lighten-1'" size="x-small"
                                variant="text" :title="isFavorite(item.url) ? 'Bỏ yêu thích' : 'Thêm vào yêu thích'"
                                @click.stop="toggleFavorite(item, null, null)" />
                        </template>
                    </v-list-item>
                </template>
            </v-list>

            <template #append>
                <div class="global-nav-footer">
                    <span v-if="!rail" class="text-caption text-medium-emphasis">{{ versionText }}</span>
                </div>
            </template>
        </v-navigation-drawer>

        <!-- ── Mobile drawer ── -->
        <v-navigation-drawer v-if="isMobile" v-model="localMobileDrawer" class="global-nav-drawer" temporary
            :width="drawerWidth">
            <!-- Branding Mobile -->
            <div class="pa-4 pb-2">
                <div class="d-flex align-center ga-3">
                    <v-img src="/_cdn/lhbs-lms/SongNgu_logo.png" width="40" height="40" flex="0 0 auto" />
                    <div>
                        <div class="text-h6 font-weight-bold" style="line-height: 1.2">LHBS</div>
                        <div class="text-caption text-medium-emphasis" style="line-height: 1.2">Learning management
                            system</div>
                    </div>
                </div>
            </div>

            <div class="global-nav-header">
                <v-avatar size="32" class="global-nav-avatar" color="primary">
                    <v-img v-if="avatarUrl" :src="avatarUrl" />
                    <span v-else>{{ userInitials }}</span>
                </v-avatar>
                <div class="global-nav-user">
                    <div class="global-nav-name text-body-2">{{ displayName }}</div>
                    <div class="global-nav-meta text-caption">{{ roleLabel }}</div>
                </div>
            </div>

            <v-divider />

            <!-- Niên khóa Mobile -->
            <div class="px-4 py-3">
                <v-select v-model="NKItem" :items="DSNK"
                    :item-title="(item) => `${item.NienKhoa} - Học kì ${item.HocKi}`" item-value="NienKhoaID"
                    label="Niên khóa" density="compact" variant="outlined" hide-details return-object />
            </div>

            <v-divider />

            <!-- Yêu thích mobile -->
            <template v-if="visibleFavorites.length">
                <div class="global-nav-section-header" @click="favExpanded = !favExpanded">
                    <span class="global-nav-section-label">
                        <v-icon size="14" color="amber-darken-1">mdi-star</v-icon>
                        Yêu thích
                    </span>
                    <v-icon size="16" color="grey">{{ favExpanded ? 'mdi-chevron-up' : 'mdi-chevron-down' }}</v-icon>
                </div>

                <v-list v-if="favExpanded" class="global-nav-list global-nav-fav-list" density="compact" nav>
                    <v-list-item v-for="fav in visibleFavorites" :key="fav.url" :active="isCurrentRoute(fav.url)"
                        :prepend-icon="fav.icon || 'mdi-bookmark-outline'" color="primary" rounded="lg"
                        class="global-nav-fav-item" @click="handleMobileNavigate(fav.url)">
                        <v-list-item-title>{{ fav.name }}</v-list-item-title>
                        <v-list-item-subtitle v-if="fav.groupName" class="global-nav-fav-subtitle">
                            {{ fav.groupName }}
                        </v-list-item-subtitle>

                        <template #append>
                            <v-btn icon="mdi-star" size="x-small" variant="text" color="amber-darken-1"
                                class="global-nav-fav-remove" @click.stop="removeFavorite(fav.url)" />
                        </template>
                    </v-list-item>
                </v-list>

                <v-divider />
            </template>

            <!-- Menu mobile -->
            <v-list class="global-nav-list" density="compact" nav>
                <template v-for="item in menuLeft">
                    <v-list-group v-if="item.submenu && item.submenu.length" :key="`mob-group-${item.name}`"
                        :value="item.name">
                        <template #activator="{ props }">
                            <v-list-item v-bind="props" :prepend-icon="item.icon || 'mdi-apps'" :title="item.name"
                                :active="isGroupActive(item)" color="primary" rounded="lg" />
                        </template>
                        <v-list-item v-for="child in item.submenu" :key="child.url || child.name"
                            :active="isCurrentRoute(child.url)" color="primary" rounded="lg" class="global-nav-subitem"
                            @click="handleMobileNavigate(child.url)">
                            <v-list-item-title>{{ child.name }}</v-list-item-title>
                            <template #append>
                                <v-btn :icon="isFavorite(child.url) ? 'mdi-star' : 'mdi-star-outline'"
                                    :color="isFavorite(child.url) ? 'amber-darken-1' : 'grey-lighten-2'" size="x-small"
                                    variant="text"
                                    :class="['global-nav-pin-btn', { 'is-faved': isFavorite(child.url) }]"
                                    @click.stop="toggleFavorite(child, item.icon, item.name)" />
                            </template>
                        </v-list-item>
                    </v-list-group>

                    <v-list-item v-else :key="`mob-item-${item.url || item.name}`" :active="isCurrentRoute(item.url)"
                        :prepend-icon="item.icon || 'mdi-apps'" :value="item.url" color="primary" rounded="lg"
                        @click="handleMobileNavigate(item.url)">
                        <v-list-item-title>{{ item.name }}</v-list-item-title>
                        <template v-if="item.url" #append>
                            <v-btn :icon="isFavorite(item.url) ? 'mdi-star' : 'mdi-star-outline'"
                                :color="isFavorite(item.url) ? 'amber-darken-1' : 'grey-lighten-2'" size="x-small"
                                variant="text" :class="['global-nav-pin-btn', { 'is-faved': isFavorite(item.url) }]"
                                @click.stop="toggleFavorite(item, null, null)" />
                        </template>
                    </v-list-item>
                </template>
            </v-list>
        </v-navigation-drawer>
    </div>
</template>

<script>
	export default {
		name: 'GlobalNavigationDrawer',
    inject: {
        snackbarRef: { from: 'snackbarRef', default: null },
    },

    props: {
        menuLeft: { type: Array, default: () => [] },
        userInfo: { type: Object, default: () => ({}) },
        avatarUrl: { type: String, default: '' },
        roleLabel: { type: String, default: '' },
        schoolName: { type: String, default: '' },
        version: { type: String, default: '' },
        drawerWidth: { type: [Number, String], default: 296 },
        isMobile: { type: Boolean, default: false },
        currentUrl: { type: String, default: '' },
        rail: { type: Boolean, default: false },
        mobileDrawer: { type: Boolean, default: false },
    },

    emits: ['navigate', 'update:mobileDrawer', 'nienkhoa-loaded'],

    data() {
        return {
            localMobileDrawer: false,
            favExpanded: true,
            FAV_MAX: 10,
            favorites: [],
            DSNK: [],
            NKItem: null,
        }
    },

    computed: {
        favStorageKey() {
            const uid = this.userInfo?.UserID || this.userInfo?.UserName || 'guest'
            return `lms_favorites_${uid}`
        },

        displayName() {
            return this.userInfo?.LastName + ' ' + this.userInfo?.FirstName
        },

        userInitials() {
            return this.displayName
                .split(' ')
                .filter(Boolean)
                .slice(-2)
                .map((p) => p[0])
                .join('')
                .toUpperCase()
        },

        versionText() {
            return this.version ? ` ${this.version}` : ''
        },

        visibleFavorites() {
            if (!this.menuLeft?.length) return []
            const allowedUrls = new Set()
            this.menuLeft.forEach((m) => {
                if (m.url) allowedUrls.add(m.url.split('?')[0])
                if (m.submenu?.length) {
                    m.submenu.forEach((s) => {
                        if (s.url) allowedUrls.add(s.url.split('?')[0])
                    })
                }
            })
            return this.favorites.filter((f) => {
                if (!f.url) return false
                return allowedUrls.has(f.url.split('?')[0])
            })
        },
    },

    watch: {
        mobileDrawer(v) {
            this.localMobileDrawer = v
        },
        localMobileDrawer(v) {
            this.$emit('update:mobileDrawer', v)
        },
        favStorageKey(key) {
            this.loadFavorites(key)
        },
        NKItem(v) {
            if (v && vueData.NienKhoaItem?.NienKhoaID && v.NienKhoaID !== vueData.NienKhoaItem.NienKhoaID) {
                // Chỉ reload khi thực sự có sự thay đổi giữa 2 niên khóa khác nhau
                vueData.NienKhoa = v.NienKhoa
                vueData.NienKhoaItem = v
                // location.reload()
            } else if (v) {
                // Nếu là lần đầu khởi tạo (vueData chưa có), chỉ gán giá trị global để dùng
                vueData.NienKhoa = v.NienKhoa
                vueData.NienKhoaItem = v
            }
        },
    },

    mounted() {
        this.loadFavorites(this.favStorageKey)
        this.getNK()
    },

    methods: {
        async getNK() {
            try {
                const res = await fetchPromise('lms/NienKhoa_Get')
                this.DSNK = res || []
                // Set mặc định từ vueData nếu có, ưu tiên theo NienKhoaID
                if (vueData?.NienKhoaItem?.NienKhoaID) {
                    this.NKItem = this.DSNK.find((x) => x.NienKhoaID === vueData.NienKhoaItem.NienKhoaID)
                } else if (vueData?.NienKhoa) {
                    // Fallback nếu chỉ có NienKhoa năm
                    this.NKItem = this.DSNK.find((x) => x.NienKhoa === vueData.NienKhoa && x.HocKi === vueData.NienKhoaItem?.HocKi)
                }

                // Nếu vẫn chưa có NKItem (lần đầu vào hoặc vueData trống), tự động lấy cái IsActive
                if (!this.NKItem) {
                    this.NKItem = this.DSNK.find((x) => x.IsActive)
                }

                // Chờ NKItem watcher chạy xong (set vueData) trước khi báo shell sẵn sàng
                await this.$nextTick()
            } finally {
                // Luôn emit dù thành công hay lỗi — shell sẽ mở iframe sau đây
                this.$emit('nienkhoa-loaded')
            }
        },
        loadFavorites(key) {
            try {
                const raw = localStorage.getItem(key)
                let parsed = raw ? JSON.parse(raw) : []

                // Migration: groupName null nhưng thực ra có group cha
                // → tìm lại trong menuLeft hiện tại
                let needsSave = false
                parsed = parsed.map((fav) => {
                    if (fav.groupName !== null) return fav
                    // Tìm item này thuộc group nào trong menuLeft
                    const parent = this.menuLeft.find((item) => item.submenu?.some((child) => child.url === fav.url))
                    if (parent) {
                        needsSave = true
                        return { ...fav, groupName: parent.name }
                    }
                    return fav
                })

                this.favorites = parsed
                if (needsSave) this.saveFavorites() // ghi đè data đã fix
            } catch {
                this.favorites = []
            }
        },

        saveFavorites() {
            try {
                localStorage.setItem(this.favStorageKey, JSON.stringify(this.favorites))
            } catch {}
        },

        isFavorite(url) {
            return this.favorites.some((f) => f.url === url)
        },

        toggleFavorite(item, parentIcon, parentName) {
            if (this.isFavorite(item.url)) {
                this.removeFavorite(item.url)
            } else {
                this.addFavorite(item, parentIcon, parentName)
            }
        },

        addFavorite(item, parentIcon, parentName) {
            if (!item.url) return
            if (this.favorites.length >= this.FAV_MAX) {
                alert(`Chỉ có thể ghim tối đa ${this.FAV_MAX} trang`)
                return
            }
            if (this.isFavorite(item.url)) return
            this.favorites.push({
                name: item.name,
                url: item.url,
                icon: item.icon || parentIcon || 'mdi-bookmark-outline',
                groupName: parentName || null,
            })
            this.saveFavorites()
        },

        removeFavorite(url) {
            this.favorites = this.favorites.filter((f) => f.url !== url)
            this.saveFavorites()
        },

        isCurrentRoute(url) {
            if (!url) return false
            // Logic cho App Shell: Ưu tiên dùng currentUrl từ props
            const current = this.currentUrl || location.pathname + location.search

            const currentFull = current.replace(/\/$/, '')
            const targetFull = url.replace(/\/$/, '')
            if (url.includes('?')) return targetFull === currentFull
            const targetPath = url.split('?')[0].replace(/\/$/, '')
            const currentPath = current.split('?')[0].replace(/\/$/, '')
            return targetPath === currentPath
        },

        isGroupActive(item) {
            return item.submenu?.some((child) => this.isCurrentRoute(child.url)) || false
        },

        handleMobileNavigate(url) {
            this.navigateTo(url);
            this.localMobileDrawer = false;
        },

        navigateTo(url) {
            if (!url) return
            // Ưu tiên emit để shell xử lý iframe (nếu có)
            this.$emit('navigate', url)

            // Nếu không có shell xử lý iframe, hoặc muốn link thông thường
            // thì mới dùng location.href. Tuy nhiên trong mô hình App Shell,
            // shell sẽ xử lý việc set src cho iframe.
        },
    },
	}
</script>