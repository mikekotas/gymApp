<template>
  <q-dialog ref="dialogRef" persistent>
    <q-card style="min-width: 350px">
      <q-card-section>
        <div class="text-h6">Update Available</div>
      </q-card-section>

      <q-card-section>
        <p>Version {{ updateInfo.versionName }} is available.</p>
        <p v-html="updateInfo.updateMessage"></p>
        <p v-if="updateInfo.forceUpdate" class="text-negative">
          This update is required to continue using the app.
        </p>
      </q-card-section>

      <q-card-actions align="right">
        <q-btn v-if="!updateInfo.forceUpdate" flat label="Later" color="negative" @click="onCancelClick" />
        <q-btn flat label="Update Now" color="primary" @click="onOkClick" />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup>
import { defineProps, defineEmits, ref } from 'vue';

const props = defineProps({
  updateInfo: {
    type: Object,
    required: true
  }
});

const emit = defineEmits(['ok', 'cancel']);
const dialogRef = ref(null);

const show = () => {
  dialogRef.value?.show();
};

const hide = () => {
  dialogRef.value?.hide();
};

const onOkClick = () => {
  emit('ok');
  hide();
};

const onCancelClick = () => {
  emit('cancel');
  hide();
};

defineExpose({ show, hide });
</script>
