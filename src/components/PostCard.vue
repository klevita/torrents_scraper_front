<template>
  <q-card class="post-card" v-if="mode === 'view'">
    <div>{{ post.title }}</div>
    <div class="row justify-between q-my-md">
      <div class="row">
        <div class="q-mr-sm">Сидов: {{ post.seeds }}</div>
        <div>Личей: {{ post.leaches }}</div>
      </div>
      <div class="color-green-12">{{ post.size }}</div>
    </div>
    <div class="row justify-end">
      <q-btn flat round color="primary" icon="mail_outline" @click="pushToTG" />
      <q-btn flat round color="primary" icon="subdirectory_arrow_right" @click="redirectToUrl" />
      <q-btn flat round color="warning" icon="edit" @click="switchMode('edit')" />
      <q-btn flat round color="negative" icon="delete_outline" @click="deleteData()" />
    </div>
  </q-card>
  <q-card v-else class="post-card">
    <q-input label="Заголовок" v-model="tmpPost.title" />
    <q-input label="Ссылка" v-model="tmpPost.link" />
    <q-input label="Размер" v-model="tmpPost.size" />
    <q-input type="number" label="Сиды" v-model="tmpPost.seeds" />
    <q-input type="number" label="Личи" v-model="tmpPost.leaches" />
    <div class="row justify-between q-mt-lg">
      <q-btn @click="updateData()" variant="outline" color="primary">Сохранить</q-btn>
      <q-btn @click="switchMode('view')">Отменить</q-btn>
    </div>
  </q-card>
</template>
<script setup lang="ts">
import { QBtn, QInput, QCard } from 'quasar';
import { deletePost, updatePost, pushPostToTelegram } from '../api/services/posts-service';
import { ref } from 'vue';
import type { TorrentPost } from '../api/services/types';
import { makeEmptyTorrentPost } from '../api/services/types';
import { cloneDeep } from 'lodash';

type Mode = 'edit' | 'view';

const mode = ref<Mode>('view');
const tmpPost = ref<TorrentPost>(makeEmptyTorrentPost());

const props = defineProps<{ post: TorrentPost }>();

const emit = defineEmits<{ update: [void] }>();

function switchMode(newMode: Mode) {
  if (newMode === 'edit') {
    tmpPost.value = cloneDeep(props.post);
  }
  mode.value = newMode;
}

async function updateData() {
  const resp = await updatePost(tmpPost.value);
  if (resp) {
    emit('update');
    switchMode('view');
  }
}

async function pushToTG() {
  const resp = await pushPostToTelegram(props.post.id);
  if (resp) {
    emit('update');
  }
}

async function deleteData() {
  const resp = await deletePost(props.post.id);
  if (resp) {
    emit('update');
  }
}

function redirectToUrl() {
  window.open(props.post.link, '_blank')?.focus();
}
</script>
<style scoped lang="scss">
.post-card {
  padding: 12px 18px;
  background-color: white;
  max-width: 400px;
}
</style>
