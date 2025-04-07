<template>
  <q-page class="row items-center justify-evenly">
    <div class="posts-container">
      <div class="row">
        <q-input
          class="q-mb-md col-grow q-mr-md"
          filled
          color="primary"
          label="Поиск"
          v-model="search"
          ><template v-slot:prepend>
            <q-icon name="search" />
          </template>
        </q-input>
        <div>
          <q-btn @click="addItem" flat padding="14px" size="20px" color="primary" icon="add" />
        </div>
      </div>
      <q-virtual-scroll style="height: 80vh" :items="searchedPosts" separator v-slot="{ item }">
        <post-card class="q-my-sm" :key="item.id" :post="item" @update="fetchPosts" />
      </q-virtual-scroll>
    </div>
  </q-page>
</template>

<script lang="ts" setup>
import { computed, onMounted, ref } from 'vue';
import PostCard from '../components/PostCard.vue';
import { createPost, getPosts } from '../api/services/posts-service';
import { makeEmptyTorrentPost, type TorrentPost } from '../api/services/types';
import { omit } from 'lodash';

const posts = ref<TorrentPost[]>([]);
const search = ref('');

const searchedPosts = computed<TorrentPost[]>(() => {
  if (!search.value) return posts.value;
  return posts.value.filter(
    ({ seeds, leaches, title, size }) =>
      String(seeds).includes(search.value) ||
      String(leaches).includes(search.value) ||
      title.includes(search.value) ||
      size.includes(search.value),
  );
});

async function fetchPosts() {
  posts.value = await getPosts();
}

async function addItem() {
  const resp = await createPost({ ...omit(makeEmptyTorrentPost(), 'id'), title: 'Новый пост' });
  if (resp) {
    await fetchPosts();
    search.value = 'Новый пост';
  }
}

onMounted(fetchPosts);
</script>
<style scoped lang="scss">
.posts-container {
  min-width: 415px;
}
</style>
