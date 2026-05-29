<template>
  <div class="uc-action-icon" :style="{ color: color }">
    <svg
      v-if="type === 'like'"
      viewBox="0 0 48 48"
      class="uc-action-icon-svg"
      aria-hidden="true"
    >
      <path
        d="M24 39.2C15.7 33.9 10.8 29.5 8.7 25.3C6.3 20.7 7.5 14.6 12 12.1C16 9.9 20 11.2 24 15.2C28 11.2 32 9.9 36 12.1C40.5 14.6 41.7 20.7 39.3 25.3C37.2 29.5 32.3 33.9 24 39.2Z"
        fill="none"
        stroke="currentColor"
        stroke-width="2.8"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
      <path
        d="M18.5 12.5L22.2 8.8L24.9 12.2L29.6 8.6L31.1 13.5"
        fill="none"
        stroke="currentColor"
        stroke-width="2.3"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
      <path
        d="M34.2 11.4L35 13.7L37.3 14.5L35 15.3L34.2 17.6L33.4 15.3L31.1 14.5L33.4 13.7Z"
        fill="currentColor"
      />
    </svg>

    <svg
      v-else-if="type === 'gallery'"
      viewBox="0 0 48 48"
      class="uc-action-icon-svg"
      aria-hidden="true"
    >
      <path
        d="M13 16.5H31.5C34 16.5 36 18.5 36 21V33C36 35.5 34 37.5 31.5 37.5H13C10.5 37.5 8.5 35.5 8.5 33V21C8.5 18.5 10.5 16.5 13 16.5Z"
        fill="none"
        stroke="currentColor"
        stroke-width="2.6"
        stroke-linejoin="round"
      />
      <path
        d="M16.5 12H35C37.5 12 39.5 14 39.5 16.5V28.5"
        fill="none"
        stroke="currentColor"
        stroke-width="2.2"
        stroke-linecap="round"
        stroke-linejoin="round"
        opacity="0.9"
      />
      <path
        d="M12.5 31.8L19.4 25.2L24.1 29.4L28.1 25.9L32.4 31.8"
        fill="none"
        stroke="currentColor"
        stroke-width="2.3"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
      <circle cx="28.8" cy="22.2" r="2.4" fill="currentColor" />
    </svg>

    <svg
      v-else-if="type === 'share'"
      viewBox="0 0 48 48"
      class="uc-action-icon-svg"
      aria-hidden="true"
    >
      <path
        d="M30.8 10.8L39 18.9L30.8 27"
        fill="none"
        stroke="currentColor"
        stroke-width="2.8"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
      <path
        d="M37.8 18.9H21.5C15.8 18.9 11.2 23.5 11.2 29.2V34.4"
        fill="none"
        stroke="currentColor"
        stroke-width="2.8"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
      <path
        d="M12.8 36.6L10.7 39.2L9 36.3"
        fill="none"
        stroke="currentColor"
        stroke-width="2.3"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
      <circle cx="37.8" cy="18.9" r="1.9" fill="currentColor" />
    </svg>

    <v-icon v-else :color="color" class="uc-action-icon-fallback">
      {{ icon || 'mdi-circle-outline' }}
    </v-icon>
  </div>
</template>
<script>
export default {
  props: {
    type: {
      type: String,
      default: ''
    },
    color: {
      type: String,
      default: 'rgb(232, 194, 105)'
    },
    icon: {
      type: String,
      default: ''
    }
  }
}
</script>
