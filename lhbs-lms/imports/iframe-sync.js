/**
 * Helper to sync school year data from App Shell via postMessage
 * Use this in modules that run inside an iframe
 */

window.addEventListener('message', (event) => {
    if (event.origin !== window.location.origin) return;

    const { type, payload } = event.data;

    if (type === 'INIT' || type === 'SCHOOL_YEAR_CHANGED') {
        console.log(`[Iframe] Received ${type}:`, payload);

        // Update global vueData for legacy code
        if (window.vueData) {
            window.vueData.NienKhoa = payload.NienKhoa;
            window.vueData.NienKhoaItem = payload.NienKhoaItem;
        }

        // Dispatch a custom event for Vue components to reactively update
        window.dispatchEvent(new CustomEvent('lms-school-year-changed', { detail: payload }));
    }
});

/**
 * Composition API version for modern components
 * Usage: const { NienKhoa, NienKhoaItem } = useSchoolYearMessage();
 */
function useSchoolYearMessage() {
    const schoolYear = Vue.ref(window.vueData?.NienKhoa);
    const schoolYearItem = Vue.ref(window.vueData?.NienKhoaItem);

    const handleSyncEvent = (e) => {
        schoolYear.value = e.detail.NienKhoa;
        schoolYearItem.value = e.detail.NienKhoaItem;
    };

    Vue.onMounted(() => {
        window.addEventListener('lms-school-year-changed', handleSyncEvent);
    });

    Vue.onUnmounted(() => {
        window.removeEventListener('lms-school-year-changed', handleSyncEvent);
    });

    return { schoolYear, schoolYearItem };
}

// Export to global if needed in no-build env
window.useSchoolYearMessage = useSchoolYearMessage;
