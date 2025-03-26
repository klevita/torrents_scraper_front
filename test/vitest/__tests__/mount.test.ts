import { installQuasarPlugin } from '@quasar/quasar-app-extension-testing-unit-vitest';
import { mount } from '@vue/test-utils';
import { describe, expect, it, vi } from 'vitest';
import IndexPage from '../../../src/pages/IndexPage.vue';
import PostCard from '../../../src/components/PostCard.vue';

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
    // eslint-disable-next-line @typescript-eslint/no-unused-expressions
    expect(wrapper.exists()).to.be.true;
  });
  it('PostCard mounts', () => {
    const wrapper = mount(PostCard, {
      props: {
        post: mockedPost,
      },
    });

    // eslint-disable-next-line @typescript-eslint/no-unused-expressions
    expect(wrapper.exists()).to.be.true;
  });
});
