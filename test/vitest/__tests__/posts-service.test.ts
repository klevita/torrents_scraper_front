import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';
import { getPosts, deletePost, updatePost, createPost, pushPostToTelegram } from '../../../src/api/services/posts-service';
import { coreHTTPClient } from '../../../src/api/clients/core-http-client';
import type { TorrentPost } from '../../../src/api/services/types';

vi.mock('../../../src/api/clients/core-http-client');

const mockedClient = vi.mocked(coreHTTPClient);

const mockPost: TorrentPost = {
  id: 1,
  rutracker_id: 'test-uuid-123',
  link: 'https://rutracker.org/forum/viewtopic.php?t=123456',
  title: 'Test Movie [2024] BDRip 1080p',
  seeds: 150,
  leaches: 25,
  size: '2.5GB',
};

const mockPostWithoutId: Omit<TorrentPost, 'id'> = {
  rutracker_id: 'test-uuid-456',
  link: 'https://rutracker.org/forum/viewtopic.php?t=789012',
  title: 'Another Test Movie [2024] WEB-DL 720p',
  seeds: 75,
  leaches: 12,
  size: '1.8GB',
};

describe('posts-service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  describe('getPosts', () => {
    it('should fetch all posts successfully', async () => {
      const mockResponse = {
        data: [mockPost, { ...mockPost, id: 2, title: 'Another Post' }],
      };
      mockedClient.get.mockResolvedValue(mockResponse);

      const result = await getPosts();

      expect(mockedClient.get).toHaveBeenCalledWith('posts/');
      expect(result).toEqual(mockResponse.data);
      expect(result).toHaveLength(2);
    });

    it('should return empty array when no posts exist', async () => {
      const mockResponse = { data: [] };
      mockedClient.get.mockResolvedValue(mockResponse);

      const result = await getPosts();

      expect(mockedClient.get).toHaveBeenCalledWith('posts/');
      expect(result).toEqual([]);
    });

    it('should throw error when API call fails', async () => {
      const mockError = new Error('Network error');
      mockedClient.get.mockRejectedValue(mockError);

      await expect(getPosts()).rejects.toThrow('Network error');
      expect(mockedClient.get).toHaveBeenCalledWith('posts/');
    });
  });

  describe('deletePost', () => {
    it('should delete post successfully', async () => {
      const mockResponse = { data: mockPost };
      mockedClient.delete.mockResolvedValue(mockResponse);

      const result = await deletePost(1);

      expect(mockedClient.delete).toHaveBeenCalledWith('posts/1');
      expect(result).toEqual(mockPost);
    });

    it('should handle delete with different post ID', async () => {
      const postId = 999;
      const mockResponse = { data: { ...mockPost, id: postId } };
      mockedClient.delete.mockResolvedValue(mockResponse);

      const result = await deletePost(postId);

      expect(mockedClient.delete).toHaveBeenCalledWith('posts/999');
      expect(result.id).toBe(postId);
    });

    it('should throw error when delete fails', async () => {
      const mockError = new Error('Delete failed');
      mockedClient.delete.mockRejectedValue(mockError);

      await expect(deletePost(1)).rejects.toThrow('Delete failed');
      expect(mockedClient.delete).toHaveBeenCalledWith('posts/1');
    });

    it('should handle 404 error for non-existent post', async () => {
      const mockError = new Error('Post not found');
      mockedClient.delete.mockRejectedValue(mockError);

      await expect(deletePost(999)).rejects.toThrow('Post not found');
      expect(mockedClient.delete).toHaveBeenCalledWith('posts/999');
    });
  });

  describe('updatePost', () => {
    it('should update post successfully', async () => {
      const updatedPost = { ...mockPost, title: 'Updated Title', seeds: 200 };
      const mockResponse = { data: updatedPost };
      mockedClient.put.mockResolvedValue(mockResponse);

      const result = await updatePost(updatedPost);

      expect(mockedClient.put).toHaveBeenCalledWith('posts/1', {
        rutracker_id: mockPost.rutracker_id,
        link: mockPost.link,
        title: 'Updated Title',
        seeds: 200,
        leaches: mockPost.leaches,
        size: mockPost.size,
      });
      expect(result).toEqual(updatedPost);
    });

    it('should omit id from request body', async () => {
      const mockResponse = { data: mockPost };
      mockedClient.put.mockResolvedValue(mockResponse);

      await updatePost(mockPost);

      const [, requestBody] = mockedClient.put.mock.calls[0];
      expect(requestBody).not.toHaveProperty('id');
      expect(Object.keys(requestBody)).toEqual([
        'rutracker_id',
        'link',
        'title',
        'seeds',
        'leaches',
        'size'
      ]);
    });

    it('should handle partial updates correctly', async () => {
      const partialUpdate = { ...mockPost, seeds: 300, leaches: 50 };
      const mockResponse = { data: partialUpdate };
      mockedClient.put.mockResolvedValue(mockResponse);

      const result = await updatePost(partialUpdate);

      expect(mockedClient.put).toHaveBeenCalledWith('posts/1', {
        rutracker_id: mockPost.rutracker_id,
        link: mockPost.link,
        title: mockPost.title,
        seeds: 300,
        leaches: 50,
        size: mockPost.size,
      });
      expect(result.seeds).toBe(300);
      expect(result.leaches).toBe(50);
    });

    it('should throw error when update fails', async () => {
      const mockError = new Error('Update failed');
      mockedClient.put.mockRejectedValue(mockError);

      await expect(updatePost(mockPost)).rejects.toThrow('Update failed');
      expect(mockedClient.put).toHaveBeenCalledWith('posts/1', expect.any(Object));
    });
  });

  describe('createPost', () => {
    it('should create new post successfully', async () => {
      const newPost = { ...mockPostWithoutId, id: 3 };
      const mockResponse = { data: newPost };
      mockedClient.post.mockResolvedValue(mockResponse);

      const result = await createPost(mockPostWithoutId);

      expect(mockedClient.post).toHaveBeenCalledWith('posts/', mockPostWithoutId);
      expect(result).toEqual(newPost);
      expect(result.id).toBe(3);
    });

    it('should handle creation with all required fields', async () => {
      const mockResponse = { data: { ...mockPostWithoutId, id: 5 } };
      mockedClient.post.mockResolvedValue(mockResponse);

      const result = await createPost(mockPostWithoutId);

      expect(mockedClient.post).toHaveBeenCalledWith('posts/', {
        rutracker_id: mockPostWithoutId.rutracker_id,
        link: mockPostWithoutId.link,
        title: mockPostWithoutId.title,
        seeds: mockPostWithoutId.seeds,
        leaches: mockPostWithoutId.leaches,
        size: mockPostWithoutId.size,
      });
      expect(result.rutracker_id).toBe(mockPostWithoutId.rutracker_id);
    });

    it('should throw error when creation fails', async () => {
      const mockError = new Error('Creation failed');
      mockedClient.post.mockRejectedValue(mockError);

      await expect(createPost(mockPostWithoutId)).rejects.toThrow('Creation failed');
      expect(mockedClient.post).toHaveBeenCalledWith('posts/', mockPostWithoutId);
    });

    it('should handle validation errors', async () => {
      const invalidPost = { ...mockPostWithoutId, title: '' };
      const mockError = new Error('Validation failed');
      mockedClient.post.mockRejectedValue(mockError);

      await expect(createPost(invalidPost)).rejects.toThrow('Validation failed');
      expect(mockedClient.post).toHaveBeenCalledWith('posts/', invalidPost);
    });
  });

  describe('pushPostToTelegram', () => {
    it('should push post to Telegram successfully', async () => {
      const mockResponse = { data: { status: 'success' } };
      mockedClient.post.mockResolvedValue(mockResponse);

      const result = await pushPostToTelegram(1);

      expect(mockedClient.post).toHaveBeenCalledWith('send-post/1');
      expect(result).toEqual({ status: 'success' });
    });

    it('should handle different post IDs', async () => {
      const postId = 42;
      const mockResponse = { data: { status: 'sent' } };
      mockedClient.post.mockResolvedValue(mockResponse);

      const result = await pushPostToTelegram(postId);

      expect(mockedClient.post).toHaveBeenCalledWith('send-post/42');
      expect(result.status).toBe('sent');
    });

    it('should handle Telegram API errors', async () => {
      const mockResponse = { data: { status: 'failed', error: 'Chat not found' } };
      mockedClient.post.mockResolvedValue(mockResponse);

      const result = await pushPostToTelegram(1);

      expect(mockedClient.post).toHaveBeenCalledWith('send-post/1');
      expect(result.status).toBe('failed');
    });

    it('should throw error when Telegram push fails', async () => {
      const mockError = new Error('Telegram service unavailable');
      mockedClient.post.mockRejectedValue(mockError);

      await expect(pushPostToTelegram(1)).rejects.toThrow('Telegram service unavailable');
      expect(mockedClient.post).toHaveBeenCalledWith('send-post/1');
    });

    it('should handle large post IDs', async () => {
      const largeId = 999999999;
      const mockResponse = { data: { status: 'queued' } };
      mockedClient.post.mockResolvedValue(mockResponse);

      const result = await pushPostToTelegram(largeId);

      expect(mockedClient.post).toHaveBeenCalledWith(`send-post/${largeId}`);
      expect(result.status).toBe('queued');
    });
  });

  describe('Error handling', () => {
    it('should handle network timeouts', async () => {
      const timeoutError = new Error('Request timeout');
      mockedClient.get.mockRejectedValue(timeoutError);

      await expect(getPosts()).rejects.toThrow('Request timeout');
    });

    it('should handle server errors (500)', async () => {
      const serverError = new Error('Internal Server Error');
      mockedClient.post.mockRejectedValue(serverError);

      await expect(createPost(mockPostWithoutId)).rejects.toThrow('Internal Server Error');
    });

    it('should handle authentication errors', async () => {
      const authError = new Error('Unauthorized');
      mockedClient.delete.mockRejectedValue(authError);

      await expect(deletePost(1)).rejects.toThrow('Unauthorized');
    });
  });

  describe('API endpoints', () => {
    it('should call correct endpoints for all methods', async () => {
      const mockResponse = { data: mockPost };
      mockedClient.get.mockResolvedValue({ data: [mockPost] });
      mockedClient.post.mockResolvedValue(mockResponse);
      mockedClient.put.mockResolvedValue(mockResponse);
      mockedClient.delete.mockResolvedValue(mockResponse);

      await getPosts();
      await createPost(mockPostWithoutId);
      await updatePost(mockPost);
      await deletePost(1);
      await pushPostToTelegram(1);

      expect(mockedClient.get).toHaveBeenCalledWith('posts/');
      expect(mockedClient.post).toHaveBeenCalledWith('posts/', mockPostWithoutId);
      expect(mockedClient.put).toHaveBeenCalledWith('posts/1', expect.any(Object));
      expect(mockedClient.delete).toHaveBeenCalledWith('posts/1');
      expect(mockedClient.post).toHaveBeenCalledWith('send-post/1');
    });
  });
});