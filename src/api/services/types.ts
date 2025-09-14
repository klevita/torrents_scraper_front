import { v4 as uuidv4 } from 'uuid';

export interface TorrentPost {
  id: number;
  rutracker_id: string;
  link: string;
  title: string;
  seeds: number;
  leaches: number;
  size: string;
}

export const makeEmptyTorrentPost: () => TorrentPost = () => ({
  id: 0,
  rutracker_id:  uuidv4(),
  link: '',
  title: '',
  seeds: 0,
  leaches: 0,
  size: '',
});
