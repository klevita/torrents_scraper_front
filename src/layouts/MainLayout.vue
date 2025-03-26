<template>
  <q-layout view="lHh Lpr lFf">
    <q-header elevated>
      <q-toolbar>
        <q-toolbar-title> Quasar App </q-toolbar-title>

        <div>Quasar v{{ $q.version }}</div>
      </q-toolbar>
    </q-header>

    <q-page-container class="bg-grey-12">
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script lang="ts" setup></script>
