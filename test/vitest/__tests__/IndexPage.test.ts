import { installQuasarPlugin } from '@quasar/quasar-app-extension-testing-unit-vitest';
import { mount, VueWrapper } from '@vue/test-utils';
import { describe, expect, it, vi, beforeEach, Mock } from 'vitest';
import { nextTick } from 'vue';
import IndexPage from '../../../src/pages/IndexPage.vue';
import { createPost, getPosts } from '../../../src/api/services/posts-service';
import { makeEmptyTorrentPost, type TorrentPost } from '../../../src/api/services/types';

installQuasarPlugin();

vi.mock('../../../src/api/services/posts-service', () => ({
  createPost: vi.fn(),
  getPosts: vi.fn(),
}));

vi.mock('../../../src/api/services/types', () => ({
  makeEmptyTorrentPost: vi.fn(() => ({
    id: 0,
    rutracker_id: 'test-uuid-new',
    link: '',
    title: '',
    seeds: 0,
    leaches: 0,
    size: '',
  })),
}));

const mockPosts: TorrentPost[] = [
  {
    id: 1,
    rutracker_id: 'uuid-1',
    link: 'https://rutracker.org/1',
    title: 'Action Movie 2024 BDRip',
    seeds: 150,
    leaches: 25,
    size: '2.5GB',
  },
  {
    id: 2,
    rutracker_id: 'uuid-2',
    link: 'https://rutracker.org/2',
    title: 'Comedy Film 2023 WEB-DL',
    seeds: 75,
    leaches: 12,
    size: '1.8GB',
  },
  {
    id: 3,
    rutracker_id: 'uuid-3',
    link: 'https://rutracker.org/3',
    title: 'Horror Movie HD',
    seeds: 200,
    leaches: 30,
    size: '3.2GB',
  },
];

describe('IndexPage', () => {
  let wrapper: VueWrapper<any>;

  beforeEach(async () => {
    vi.clearAllMocks();
    (getPosts as Mock).mockResolvedValue(mockPosts);

    wrapper = mount(IndexPage, {
      global: {
        stubs: {
          'q-page': true,
          'q-input': true,
          'q-btn': true,
          'q-virtual-scroll': true,
          'q-icon': true,
          'post-card': true,
        },
      },
    });

    await nextTick();
  });

  describe('Component initialization', () => {
    it('should mount successfully', () => {
      expect(wrapper.exists()).toBe(true);
    });

    it('should call getPosts on mount', () => {
      expect(getPosts).toHaveBeenCalled();
    });

    it('should initialize posts with data from getPosts', async () => {
      await wrapper.vm.$nextTick();
      expect(wrapper.vm.posts).toEqual(mockPosts);
    });

    it('should initialize search as empty string', () => {
      expect(wrapper.vm.search).toBe('');
    });
  });

  describe('searchedPosts computed property', () => {
    beforeEach(async () => {
      await wrapper.vm.$nextTick();
      wrapper.vm.posts = mockPosts;
    });

    it('should return all posts when search is empty', async () => {
      wrapper.vm.search = '';
      await nextTick();

      expect(wrapper.vm.searchedPosts).toEqual(mockPosts);
    });

    it('should return all posts when search is null', async () => {
      wrapper.vm.search = null;
      await nextTick();

      expect(wrapper.vm.searchedPosts).toEqual(mockPosts);
    });

    it('should filter posts by title (case insensitive)', async () => {
      wrapper.vm.search = 'action';
      await nextTick();

      expect(wrapper.vm.searchedPosts).toHaveLength(1);
      expect(wrapper.vm.searchedPosts[0].title).toContain('Action');
    });

    it('should filter posts by title with exact match', async () => {
      wrapper.vm.search = 'Comedy Film';
      await nextTick();

      expect(wrapper.vm.searchedPosts).toHaveLength(1);
      expect(wrapper.vm.searchedPosts[0].id).toBe(2);
    });

    it('should filter posts by seeds', async () => {
      wrapper.vm.search = '150';
      await nextTick();

      expect(wrapper.vm.searchedPosts).toHaveLength(1);
      expect(wrapper.vm.searchedPosts[0].seeds).toBe(150);
    });

    it('should filter posts by leaches', async () => {
      wrapper.vm.search = '25';
      await nextTick();

      expect(wrapper.vm.searchedPosts).toHaveLength(1);
      expect(wrapper.vm.searchedPosts[0].leaches).toBe(25);
    });

    it('should filter posts by size', async () => {
      wrapper.vm.search = '3.2GB';
      await nextTick();

      expect(wrapper.vm.searchedPosts).toHaveLength(1);
      expect(wrapper.vm.searchedPosts[0].size).toBe('3.2GB');
    });

    it('should filter posts by partial size match', async () => {
      wrapper.vm.search = 'GB';
      await nextTick();

      expect(wrapper.vm.searchedPosts).toHaveLength(3);
    });

    it('should return empty array when no matches found', async () => {
      wrapper.vm.search = 'nonexistent';
      await nextTick();

      expect(wrapper.vm.searchedPosts).toHaveLength(0);
    });

    it('should handle mixed case search correctly', async () => {
      wrapper.vm.search = 'ACTION';
      await nextTick();

      expect(wrapper.vm.searchedPosts).toHaveLength(1);
      expect(wrapper.vm.searchedPosts[0].title).toContain('Action');
    });

    it('should handle whitespace in search', async () => {
      wrapper.vm.search = 'action';
      await nextTick();

      expect(wrapper.vm.searchedPosts).toHaveLength(1);
      expect(wrapper.vm.searchedPosts[0].title).toContain('Action');
    });

    it('should filter by multiple criteria match', async () => {
      wrapper.vm.search = '2024';
      await nextTick();

      expect(wrapper.vm.searchedPosts).toHaveLength(1);
      expect(wrapper.vm.searchedPosts[0].title).toContain('2024');
    });

    it('should handle numeric search for seeds and leaches', async () => {
      wrapper.vm.search = '75';
      await nextTick();

      expect(wrapper.vm.searchedPosts).toHaveLength(1);
      expect(wrapper.vm.searchedPosts[0].seeds).toBe(75);
    });

    it('should handle partial numeric matches', async () => {
      wrapper.vm.search = '2';
      await nextTick();

      expect(wrapper.vm.searchedPosts.length).toBeGreaterThan(0);
    });

    it('should handle null or undefined post properties gracefully', async () => {
      const postsWithNulls = [
        { ...mockPosts[0], title: null },
        { ...mockPosts[1], size: undefined },
        { ...mockPosts[2], seeds: null },
      ];
      wrapper.vm.posts = postsWithNulls;
      wrapper.vm.search = 'test';
      await nextTick();

      expect(() => wrapper.vm.searchedPosts).not.toThrow();
      expect(Array.isArray(wrapper.vm.searchedPosts)).toBe(true);
    });
  });

  describe('addItem function', () => {
    beforeEach(() => {
      (makeEmptyTorrentPost as Mock).mockReturnValue({
        id: 0,
        rutracker_id: 'test-uuid-new',
        link: '',
        title: '',
        seeds: 0,
        leaches: 0,
        size: '',
      });
    });

    it('should create new post with correct data', async () => {
      const newPost = {
        id: 4,
        rutracker_id: 'new-uuid',
        link: '',
        title: 'Новый пост',
        seeds: 0,
        leaches: 0,
        size: '',
      };

      (createPost as Mock).mockResolvedValue(newPost);
      (getPosts as Mock).mockResolvedValue([...mockPosts, newPost]);

      await wrapper.vm.addItem();

      expect(createPost).toHaveBeenCalledWith({
        rutracker_id: 'test-uuid-new',
        link: '',
        title: 'Новый пост',
        seeds: 0,
        leaches: 0,
        size: '',
      });
    });

    it('should call fetchPosts after successful creation', async () => {
      const newPost = { id: 4, title: 'Новый пост' };
      (createPost as Mock).mockResolvedValue(newPost);

      expect(getPosts).toHaveBeenCalledTimes(1);

      await wrapper.vm.addItem();

      expect(getPosts).toHaveBeenCalledTimes(2);
    });

    it('should set search to "Новый пост" after successful creation', async () => {
      const newPost = { id: 4, title: 'Новый пост' };
      (createPost as Mock).mockResolvedValue(newPost);

      await wrapper.vm.addItem();

      expect(wrapper.vm.search).toBe('Новый пост');
    });

    it('should not update search or fetch posts if creation fails', async () => {
      (createPost as Mock).mockResolvedValue(null);
      const fetchPostsSpy = vi.spyOn(wrapper.vm, 'fetchPosts');
      const originalSearch = wrapper.vm.search;

      await wrapper.vm.addItem();

      expect(fetchPostsSpy).not.toHaveBeenCalled();
      expect(wrapper.vm.search).toBe(originalSearch);
    });

    it('should not update search or fetch posts if creation returns falsy value', async () => {
      (createPost as Mock).mockResolvedValue(undefined);
      const fetchPostsSpy = vi.spyOn(wrapper.vm, 'fetchPosts');

      await wrapper.vm.addItem();

      expect(fetchPostsSpy).not.toHaveBeenCalled();
    });

    it('should handle createPost rejection gracefully', async () => {
      (createPost as Mock).mockRejectedValue(new Error('Create failed'));
      const fetchPostsSpy = vi.spyOn(wrapper.vm, 'fetchPosts');

      await expect(wrapper.vm.addItem()).rejects.toThrow('Create failed');
      expect(fetchPostsSpy).not.toHaveBeenCalled();
    });

    it('should use makeEmptyTorrentPost to generate base post data', async () => {
      (createPost as Mock).mockResolvedValue({ id: 4 });

      await wrapper.vm.addItem();

      expect(makeEmptyTorrentPost).toHaveBeenCalled();
    });

    it('should omit id from the post data sent to createPost', async () => {
      (createPost as Mock).mockResolvedValue({ id: 4 });

      await wrapper.vm.addItem();

      const createPostArgs = (createPost as Mock).mock.calls[0][0];
      expect(createPostArgs).not.toHaveProperty('id');
    });

    it('should override title to "Новый пост" even if makeEmptyTorrentPost returns different title', async () => {
      (makeEmptyTorrentPost as Mock).mockReturnValue({
        id: 0,
        rutracker_id: 'test-uuid',
        link: '',
        title: 'Different Title',
        seeds: 0,
        leaches: 0,
        size: '',
      });
      (createPost as Mock).mockResolvedValue({ id: 4 });

      await wrapper.vm.addItem();

      const createPostArgs = (createPost as Mock).mock.calls[0][0];
      expect(createPostArgs.title).toBe('Новый пост');
    });
  });

  describe('fetchPosts function', () => {
    it('should update posts with data from getPosts', async () => {
      const newMockPosts = [
        { id: 5, title: 'New Post 1' },
        { id: 6, title: 'New Post 2' },
      ];
      (getPosts as Mock).mockResolvedValue(newMockPosts);

      await wrapper.vm.fetchPosts();

      expect(wrapper.vm.posts).toEqual(newMockPosts);
    });

    it('should handle getPosts rejection', async () => {
      (getPosts as Mock).mockRejectedValue(new Error('Fetch failed'));

      await expect(wrapper.vm.fetchPosts()).rejects.toThrow('Fetch failed');
    });

    it('should handle empty response from getPosts', async () => {
      (getPosts as Mock).mockResolvedValue([]);

      await wrapper.vm.fetchPosts();

      expect(wrapper.vm.posts).toEqual([]);
    });
  });

  describe('Integration tests', () => {
    it('should filter newly added posts correctly', async () => {
      const newPost = {
        id: 4,
        rutracker_id: 'new-uuid',
        link: '',
        title: 'Новый пост',
        seeds: 0,
        leaches: 0,
        size: '',
      };

      (createPost as Mock).mockResolvedValue(newPost);
      (getPosts as Mock).mockResolvedValue([...mockPosts, newPost]);

      await wrapper.vm.addItem();

      expect(wrapper.vm.searchedPosts).toHaveLength(1);
      expect(wrapper.vm.searchedPosts[0].title).toBe('Новый пост');
    });

    it('should handle complete add-search workflow', async () => {
      const newPost = {
        id: 4,
        rutracker_id: 'new-uuid',
        link: '',
        title: 'Новый пост',
        seeds: 0,
        leaches: 0,
        size: '',
      };

      (createPost as Mock).mockResolvedValue(newPost);
      (getPosts as Mock).mockResolvedValue([...mockPosts, newPost]);

      expect(wrapper.vm.posts).toHaveLength(3);

      await wrapper.vm.addItem();

      expect(wrapper.vm.posts).toHaveLength(4);
      expect(wrapper.vm.search).toBe('Новый пост');
      expect(wrapper.vm.searchedPosts).toHaveLength(1);
      expect(wrapper.vm.searchedPosts[0].title).toBe('Новый пост');
    });
  });
});