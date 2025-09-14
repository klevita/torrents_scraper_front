import { omit } from 'lodash';
import { coreHTTPClient } from '../clients/core-http-client';
import type { TorrentPost } from './types';

export async function getPosts(): Promise<TorrentPost[]> {
  const resp = await coreHTTPClient.get('posts/');

  return resp.data;
}

export async function deletePost(id: number): Promise<TorrentPost> {
  const resp = await coreHTTPClient.delete('posts/' + id);

  return resp.data;
}

export async function updatePost(post: TorrentPost): Promise<TorrentPost> {
  const resp = await coreHTTPClient.put('posts/' + post.id, omit(post, 'id'));

  return resp.data;
}

export async function createPost(post: Omit<TorrentPost, 'id'>): Promise<TorrentPost> {
  const resp = await coreHTTPClient.post('posts/', post);

  return resp.data;
}

export async function pushPostToTelegram(postId: TorrentPost['id']): Promise<{status: string}> {
  const resp = await coreHTTPClient.post(`send-post/${postId}`);

  return resp.data;
}
