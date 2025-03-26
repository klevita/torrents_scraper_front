<template>
  <q-page class="row items-center justify-evenly">
    <div class="posts-container">
      <q-input class="q-mb-md" filled color="primary" label="Поиск" v-model="search"
        ><template v-slot:prepend>
          <q-icon name="search" />
        </template>
      </q-input>
      <q-virtual-scroll style="height: 80vh" :items="searchedPosts" separator v-slot="{ item }">
        <post-card class="q-my-sm" :key="item.id" :post="item" @update="fetchPosts" />
      </q-virtual-scroll>
    </div>
    <!-- <div class="posts-container">
      <template v-for="(post, i) in posts">
        <post-card v-if="posts[i]" :key="post.id" v-model="posts[i]" @update="fetchPosts" />
      </template>
    </div> -->
    <!-- <div class="posts-actions"></div> -->
  </q-page>
</template>

<script lang="ts" setup>
import { computed, onMounted, ref } from 'vue';
import PostCard from '../components/PostCard.vue';
import { getPosts } from '../api/services/posts-service';
import type { TorrentPost } from '../api/services/types';

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

onMounted(fetchPosts);
</script>
<style scoped lang="scss">
.posts-container {
  min-width: 415px;
}
</style>
