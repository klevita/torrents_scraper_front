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
  rutracker_id: '',
  link: '',
  title: '',
  seeds: 0,
  leaches: 0,
  size: '',
});
