import { installQuasarPlugin } from '@quasar/quasar-app-extension-testing-unit-vitest';
import { mount, VueWrapper } from '@vue/test-utils';
import { describe, expect, it, vi, beforeEach, Mock } from 'vitest';
import PostCard from '../../../src/components/PostCard.vue';
import { deletePost, updatePost, pushPostToTelegram } from '../../../src/api/services/posts-service';
import type { TorrentPost } from '../../../src/api/services/types';

installQuasarPlugin();

vi.mock('../../../src/api/services/posts-service', () => ({
  deletePost: vi.fn(),
  updatePost: vi.fn(),
  pushPostToTelegram: vi.fn(),
}));

const mockPost: TorrentPost = {
  id: 1,
  rutracker_id: 'test-uuid',
  link: 'https://example.com',
  title: 'Test Torrent',
  seeds: 50,
  leaches: 10,
  size: '1.5GB',
};

describe('PostCard Component', () => {
  let wrapper: VueWrapper<any>;

  beforeEach(() => {
    vi.clearAllMocks();
    wrapper = mount(PostCard, {
      props: {
        post: mockPost,
      },
    });
  });

  describe('Component mounting and props', () => {
    it('mounts successfully', () => {
      expect(wrapper.exists()).toBe(true);
    });

    it('displays post data correctly in view mode', () => {
      expect(wrapper.text()).toContain('Test Torrent');
      expect(wrapper.text()).toContain('Сидов: 50');
      expect(wrapper.text()).toContain('Личей: 10');
      expect(wrapper.text()).toContain('1.5GB');
    });

    it('receives post prop correctly', () => {
      expect(wrapper.props().post).toEqual(mockPost);
    });
  });

  describe('Reactive refs', () => {
    it('initializes mode ref as "view"', () => {
      expect(wrapper.vm.mode).toBe('view');
    });

    it('initializes tmpPost ref with empty post', () => {
      expect(wrapper.vm.tmpPost).toBeDefined();
      expect(typeof wrapper.vm.tmpPost.id).toBe('number');
      expect(typeof wrapper.vm.tmpPost.rutracker_id).toBe('string');
    });
  });

  describe('switchMode function', () => {
    it('switches to edit mode and copies post data to tmpPost', async () => {
      await wrapper.vm.switchMode('edit');

      expect(wrapper.vm.mode).toBe('edit');
      expect(wrapper.vm.tmpPost).toEqual(mockPost);
    });

    it('switches to view mode without copying data', async () => {
      wrapper.vm.mode = 'edit';
      const originalTmpPost = wrapper.vm.tmpPost;

      await wrapper.vm.switchMode('view');

      expect(wrapper.vm.mode).toBe('view');
      expect(wrapper.vm.tmpPost).toBe(originalTmpPost);
    });

    it('renders edit form when mode is edit', async () => {
      await wrapper.vm.switchMode('edit');
      await wrapper.vm.$nextTick();

      expect(wrapper.find('.q-field__label').exists()).toBe(true);
      expect(wrapper.findAll('input')).toHaveLength(5); // 5 input fields in edit mode
    });
  });

  describe('updateData function', () => {
    it('calls updatePost service and emits update event on success', async () => {
      const mockResponse = { ...mockPost, title: 'Updated Title' };
      (updatePost as Mock).mockResolvedValue(mockResponse);

      const updateSpy = vi.fn();
      wrapper = mount(PostCard, {
        props: { post: mockPost },
        listeners: { update: updateSpy }
      });

      await wrapper.vm.updateData();

      expect(updatePost).toHaveBeenCalledWith(wrapper.vm.tmpPost);
      expect(wrapper.emitted().update).toBeTruthy();
      expect(wrapper.vm.mode).toBe('view');
    });

    it('does not emit update event when updatePost fails', async () => {
      (updatePost as Mock).mockResolvedValue(null);

      await wrapper.vm.updateData();

      expect(updatePost).toHaveBeenCalled();
      expect(wrapper.emitted().update).toBeFalsy();
    });
  });

  describe('pushToTG function', () => {
    it('calls pushPostToTelegram service and emits update event on success', async () => {
      const mockResponse = { status: 'success' };
      (pushPostToTelegram as Mock).mockResolvedValue(mockResponse);

      await wrapper.vm.pushToTG();

      expect(pushPostToTelegram).toHaveBeenCalledWith(mockPost.id);
      expect(wrapper.emitted().update).toBeTruthy();
    });

    it('does not emit update event when pushPostToTelegram fails', async () => {
      (pushPostToTelegram as Mock).mockResolvedValue(null);

      await wrapper.vm.pushToTG();

      expect(pushPostToTelegram).toHaveBeenCalled();
      expect(wrapper.emitted().update).toBeFalsy();
    });
  });

  describe('deleteData function', () => {
    it('calls deletePost service and emits update event on success', async () => {
      const mockResponse = mockPost;
      (deletePost as Mock).mockResolvedValue(mockResponse);

      await wrapper.vm.deleteData();

      expect(deletePost).toHaveBeenCalledWith(mockPost.id);
      expect(wrapper.emitted().update).toBeTruthy();
    });

    it('does not emit update event when deletePost fails', async () => {
      (deletePost as Mock).mockResolvedValue(null);

      await wrapper.vm.deleteData();

      expect(deletePost).toHaveBeenCalled();
      expect(wrapper.emitted().update).toBeFalsy();
    });
  });

  describe('redirectToUrl function', () => {
    it('calls window.open with correct parameters', () => {
      const mockWindowOpen = vi.fn().mockReturnValue({ focus: vi.fn() });
      vi.stubGlobal('window', { open: mockWindowOpen });

      wrapper.vm.redirectToUrl();

      expect(mockWindowOpen).toHaveBeenCalledWith(mockPost.link, '_blank');
    });

    it('calls focus on opened window', () => {
      const mockFocus = vi.fn();
      const mockWindowOpen = vi.fn().mockReturnValue({ focus: mockFocus });
      vi.stubGlobal('window', { open: mockWindowOpen });

      wrapper.vm.redirectToUrl();

      expect(mockFocus).toHaveBeenCalled();
    });

    it('handles null return from window.open', () => {
      const mockWindowOpen = vi.fn().mockReturnValue(null);
      vi.stubGlobal('window', { open: mockWindowOpen });

      expect(() => wrapper.vm.redirectToUrl()).not.toThrow();
    });
  });

  describe('Component interactions', () => {
    it('calls pushToTG method correctly', async () => {
      const pushToTGSpy = vi.spyOn(wrapper.vm, 'pushToTG');
      (pushPostToTelegram as Mock).mockResolvedValue({ status: 'success' });

      await wrapper.vm.pushToTG();

      expect(pushToTGSpy).toHaveBeenCalled();
      expect(pushPostToTelegram).toHaveBeenCalledWith(mockPost.id);
    });

    it('calls redirectToUrl method correctly', async () => {
      const mockWindowOpen = vi.fn().mockReturnValue({ focus: vi.fn() });
      vi.stubGlobal('window', { open: mockWindowOpen });

      await wrapper.vm.redirectToUrl();

      expect(mockWindowOpen).toHaveBeenCalledWith(mockPost.link, '_blank');
    });

    it('switches to edit mode correctly', async () => {
      expect(wrapper.vm.mode).toBe('view');

      await wrapper.vm.switchMode('edit');

      expect(wrapper.vm.mode).toBe('edit');
      expect(wrapper.vm.tmpPost).toEqual(mockPost);
    });

    it('calls deleteData method correctly', async () => {
      const deleteSpy = vi.spyOn(wrapper.vm, 'deleteData');
      (deletePost as Mock).mockResolvedValue(mockPost);

      await wrapper.vm.deleteData();

      expect(deleteSpy).toHaveBeenCalled();
      expect(deletePost).toHaveBeenCalledWith(mockPost.id);
    });

    it('calls updateData method correctly', async () => {
      await wrapper.vm.switchMode('edit');
      const updateSpy = vi.spyOn(wrapper.vm, 'updateData');
      (updatePost as Mock).mockResolvedValue(mockPost);

      await wrapper.vm.updateData();

      expect(updateSpy).toHaveBeenCalled();
      expect(updatePost).toHaveBeenCalledWith(wrapper.vm.tmpPost);
    });

    it('switches from edit to view mode correctly', async () => {
      await wrapper.vm.switchMode('edit');
      expect(wrapper.vm.mode).toBe('edit');

      await wrapper.vm.switchMode('view');

      expect(wrapper.vm.mode).toBe('view');
    });
  });

  describe('Event emissions', () => {
    it('emits update event with correct signature', async () => {
      (updatePost as Mock).mockResolvedValue(mockPost);

      await wrapper.vm.updateData();

      const updateEvents = wrapper.emitted().update;
      expect(updateEvents).toBeTruthy();
      expect(updateEvents![0]).toEqual([]);
    });
  });
});