<template>
	<div>
    <div class="d-flex align-center mb-4">
      <v-icon size="small" color="blue-grey-lighten-1" class="mr-4">mdi-account-plus-outline</v-icon>
      <v-autocomplete
        v-model="selectedMemberId"
        :items="memberOptions"
        item-title="title"
        item-value="value"
        label="Assign member"
        density="compact"
        variant="outlined"
        hide-details
        clearable
        :loading="searchLoading"
        class="mr-2"
        v-on:update:search="searchMembers"
      />
      <v-btn
        color="primary"
        variant="flat"
        size="small"
        class="text-none"
        :loading="loading"
        :disabled="!selectedMemberId"
        v-on:click="$emit('assign', selectedMemberId)"
      >
        Assign
      </v-btn>
    </div>

    <v-alert
      v-if="error"
      type="error"
      variant="tonal"
      density="compact"
      class="mb-4"
    >
      {{ error }}
    </v-alert>
  </div>
</template>

<script>
	export default {
		props: {
    project: {
      type: Object,
      default: null,
    },
    members: {
      type: Array,
      default() {
        return []
      },
    },
    currentUserId: {
      type: String,
      default: '',
    },
    preferProjectMembers: {
      type: Boolean,
      default: true,
    },
    loading: {
      type: Boolean,
      default: false,
    },
    error: {
      type: String,
      default: '',
    },
  },
  emits: ['assign'],
  data() {
    return {
      selectedMemberId: '',
      searchText: '',
      lastSearchText: '',
      searchCache: {},
      searchLoading: false,
      searchResults: [],
      searchTimer: null,
      employeeSearchEndpoint: 'https://tapi.lhu.edu.vn/work/Basic_NhanVienSearch',
    }
  },
  computed: {
    hasProjectMembers() {
      return this.preferProjectMembers && Boolean(this.members.length)
    },
    memberOptions() {
      if (this.hasProjectMembers) {
        return this.members.map((member) => ({
          title: member.userId + (member.role ? ' - ' + member.role : ''),
          value: member.userId,
        }))
      }

      return this.searchResults.map((member) => ({
        title: member.HoTen || member.NhanVienID,
        value: member.NhanVienID,
      }))
    },
  },
  watch: {
    currentUserId: {
      immediate: true,
      handler(value) {
        this.selectedMemberId = value || ''
      },
    },
  },
  beforeUnmount() {
    this.clearSearchTimer()
  },
  methods: {
    searchMembers(value) {
      const searchText = (value || '').trim()
      this.searchText = searchText
      if (this.hasProjectMembers) return

      this.clearSearchTimer()
      if (!searchText || searchText.length < 2) {
        this.searchResults = []
        return
      }

      if (this.searchCache[searchText]) {
        this.searchResults = this.searchCache[searchText]
        this.lastSearchText = searchText
        return
      }

      if (searchText === this.lastSearchText) return

      this.searchTimer = setTimeout(() => {
        if (searchText === this.lastSearchText) return

        this.searchLoading = true
        callAPI({
          API: this.employeeSearchEndpoint,
          METHOD: 'POST',
          IN: {
            TextSearch: searchText,
          },
        }, (result) => {
          const rows = result && result.data ? result.data : result
          const normalizedRows = this.normalizeRows(rows)
          this.searchCache = {
            ...this.searchCache,
            [searchText]: normalizedRows,
          }
          this.searchResults = normalizedRows
          this.lastSearchText = searchText
          this.searchLoading = false
        }, () => {
          this.searchResults = []
          this.searchLoading = false
        })
      }, 600)
    },
    clearSearchTimer() {
      if (!this.searchTimer) return
      clearTimeout(this.searchTimer)
      this.searchTimer = null
    },
    normalizeRows(rows) {
      if (Array.isArray(rows)) return rows
      if (!rows || typeof rows !== 'object') return []
      return Object.keys(rows).map((key) => rows[key]).filter(Boolean)
    },
  },
	}
</script>