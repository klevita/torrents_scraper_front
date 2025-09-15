import { installQuasarPlugin } from '@quasar/quasar-app-extension-testing-unit-vitest';
import { mount } from '@vue/test-utils';
import { describe, expect, it, vi } from 'vitest';
import IndexPage from '../../../src/pages/IndexPage.vue';
import PostCard from '../../../src/components/PostCard.vue';
import ErrorNotFound from '../../../src/pages/ErrorNotFound.vue';
import MainLayout from '../../../src/components/MainLayout.vue';

installQuasarPlugin();

vi.mock('../../../src/api/services/posts-service', () => ({
  getPosts: vi.fn(),
}));

const mockedPost = {
  id: 1,
  rutracker_id: '1',
  link: 'https://quasar.dev/start/quasar-cli/',
  title: 'Пример 1',
  seeds: 100,
  leaches: 20,
  size: '2.1Gb',
};

describe('components', () => {
  it('IndexPage mounts', () => {
    const wrapper = mount(IndexPage);
    expect(wrapper.exists()).toBe(true);
  });
  it('MainLayout mounts', () => {
    const wrapper = mount(MainLayout);
    expect(wrapper.exists()).toBe(true);
  });
  it('PostCard mounts', () => {
    const wrapper = mount(PostCard, {
      props: {
        post: mockedPost,
      },
    });

    expect(wrapper.exists()).toBe(true);
  });
  it('ErrorNotFound mounts', () => {
    const wrapper = mount(ErrorNotFound);

    expect(wrapper.exists()).toBe(true);
  });
});
