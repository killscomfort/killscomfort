export type MusicCategory = "original" | "remix";

export type MusicReleaseLinks = {
  listen?: string;
  spotify?: string;
  appleMusic?: string;
  deezer?: string;
  soundcloud?: string;
};

const SPOTIFY_ARTIST = "https://open.spotify.com/artist/1C0WKJTNpv2Xli0swIcTE8";

export type MusicRelease = {
  title: string;
  releaseDate: string;
  category: MusicCategory;
  featured?: boolean;
  coverUrl: string;
  previewUrl?: string;
  links: MusicReleaseLinks;
};

export const STREAMING_PROFILES = {
  soundcloud: "https://soundcloud.com/killscomfort",
  spotify: SPOTIFY_ARTIST,
  appleMusic: "https://music.apple.com/us/artist/killscomfort/1729676379",
  deezer: "https://www.deezer.com/artist/253786072",
} as const;

export const MUSIC_RELEASES: MusicRelease[] = [
  {
    title: "Dat Thang",
    releaseDate: "2026-03-27",
    category: "original",
    featured: true,
    coverUrl:
      "https://is1-ssl.mzstatic.com/image/thumb/Music211/v4/d8/a9/6c/d8a96c9d-17c7-42bc-7405-842db6dc4717/artwork.jpg/1000x1000bb.jpg",
    previewUrl:
      "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview221/v4/d7/ce/c9/d7cec90f-b1dd-34ba-21c7-45c6299e501d/mzaf_5446410421613724799.plus.aac.p.m4a",
    links: {
      listen: "https://album.link/i/1888990994",
      spotify: "https://open.spotify.com/track/3UXFWiugq28TwbDLDUEi8I",
      appleMusic:
        "https://music.apple.com/us/album/dat-thang/1888990994?i=1888990995",
      deezer: "https://www.deezer.com/album/949342621",
      soundcloud: "https://soundcloud.com/killscomfort/dat-thang-jersey-flip",
    },
  },
  {
    title: "Motion is Faith",
    releaseDate: "2026-02-03",
    category: "original",
    featured: true,
    coverUrl:
      "https://is1-ssl.mzstatic.com/image/thumb/Music211/v4/ee/27/18/ee271829-c074-a332-c9a5-97ef544d21c5/artwork.jpg/1000x1000bb.jpg",
    previewUrl:
      "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview211/v4/41/bf/fb/41bffbbc-74c0-6622-fca9-fda9653bc105/mzaf_16424072541100210585.plus.aac.p.m4a",
    links: {
      listen: "https://album.link/i/1874702610",
      appleMusic:
        "https://music.apple.com/us/album/motion-is-faith/1874702610?i=1874702611",
      deezer: "https://www.deezer.com/album/911452751",
    },
  },
  {
    title: "Good Ol Rub",
    releaseDate: "2025-10-17",
    category: "original",
    featured: true,
    coverUrl:
      "https://is1-ssl.mzstatic.com/image/thumb/Music211/v4/50/fa/c6/50fac600-a9d3-6037-0567-f3c0f10d970f/artwork.jpg/1000x1000bb.jpg",
    previewUrl:
      "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview221/v4/83/cb/e7/83cbe798-e504-70c0-c540-d556bcc0c57e/mzaf_592846234758439.plus.aac.p.m4a",
    links: {
      listen: "https://album.link/i/1845773988",
      appleMusic:
        "https://music.apple.com/us/album/good-ol-rub/1845773988?i=1845773989",
      deezer: "https://www.deezer.com/album/836036462",
    },
  },
  {
    title: "Mi Desengaño KillsTono",
    releaseDate: "2025-07-06",
    category: "remix",
    coverUrl:
      "https://is1-ssl.mzstatic.com/image/thumb/Music221/v4/4c/e2/17/4ce21727-074e-7863-164c-f47d2e21fc0a/artwork.jpg/1000x1000bb.jpg",
    previewUrl:
      "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview221/v4/47/42/9c/47429cc6-f2ae-8d02-c92a-f362cf2b9564/mzaf_13369771219732420683.plus.aac.p.m4a",
    links: {
      listen: "https://album.link/i/1825259381",
      spotify: "https://open.spotify.com/track/5tUtqgFNAJmkxZzpld5XuM",
      appleMusic:
        "https://music.apple.com/us/album/mi-desenga%C3%B1o-killstono/1825259381?i=1825259382",
      deezer: "https://www.deezer.com/album/783715971",
      soundcloud:
        "https://soundcloud.com/killscomfort/mi-desengano-house-remix-kills-x-tono",
    },
  },
  {
    title: "DICKAINTFREEREMIX (getmadmix)",
    releaseDate: "2025-01-24",
    category: "remix",
    coverUrl:
      "https://is1-ssl.mzstatic.com/image/thumb/Music211/v4/55/3e/16/553e161d-ef48-1ce6-c524-cf54856b862a/artwork.jpg/1000x1000bb.jpg",
    previewUrl:
      "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview211/v4/bc/b8/a9/bcb8a976-c6b1-eea9-974e-2b51bf6dfdb6/mzaf_2440976285430052637.plus.aac.p.m4a",
    links: {
      listen: "https://album.link/i/1792653290",
      spotify: "https://open.spotify.com/track/65muY2z79W6PjJ8fh9xToj",
      appleMusic:
        "https://music.apple.com/us/album/dickaintfreeremix-getmadmix/1792653290?i=1792653292",
      deezer: "https://www.deezer.com/album/702455261",
      soundcloud:
        "https://soundcloud.com/killscomfort/thisdickaintfreeremix-getmadmix",
    },
  },
  {
    title: "Man As Machine",
    releaseDate: "2024-12-06",
    category: "original",
    coverUrl:
      "https://is1-ssl.mzstatic.com/image/thumb/Music211/v4/f1/65/e0/f165e014-41cf-9ee8-6266-29a9c3fdb534/artwork.jpg/1000x1000bb.jpg",
    previewUrl:
      "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview221/v4/a0/45/8a/a0458a2c-28fe-6365-894e-2b13165fd66d/mzaf_13017840132552697855.plus.aac.p.m4a",
    links: {
      listen: "https://album.link/i/1783458640",
      appleMusic:
        "https://music.apple.com/us/album/man-as-machine/1783458640?i=1783458641",
      deezer: "https://www.deezer.com/album/678824481",
    },
  },
  {
    title: "Homologation",
    releaseDate: "2024-09-06",
    category: "original",
    coverUrl:
      "https://is1-ssl.mzstatic.com/image/thumb/Music221/v4/22/39/ca/2239cab0-292a-faf8-a152-5e37fe71e28d/artwork.jpg/1000x1000bb.jpg",
    previewUrl:
      "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview221/v4/be/7c/44/be7c4434-0315-187e-097c-8fb7d70f7a1f/mzaf_2884327996418119601.plus.aac.p.m4a",
    links: {
      listen: "https://album.link/i/1766590615",
      spotify: "https://open.spotify.com/track/36eI5VpAp6DV6ro74zo2PV",
      appleMusic:
        "https://music.apple.com/us/album/homologation/1766590615?i=1766590617",
      deezer: "https://www.deezer.com/album/638704241",
    },
  },
  {
    title: "Supervisor",
    releaseDate: "2024-08-08",
    category: "original",
    coverUrl:
      "https://is1-ssl.mzstatic.com/image/thumb/Music211/v4/3a/3e/52/3a3e52bf-ae9e-c922-1aab-92f51cfb05c2/artwork.jpg/1000x1000bb.jpg",
    previewUrl:
      "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview211/v4/b0/d2/2f/b0d22f12-4c57-1bf0-369b-1507f9f93830/mzaf_7685293742251392411.plus.aac.p.m4a",
    links: {
      listen: "https://album.link/i/1762103358",
      appleMusic:
        "https://music.apple.com/us/album/supervisor/1762103358?i=1762103479",
      deezer: "https://www.deezer.com/album/627554281",
    },
  },
  {
    title: "Operator",
    releaseDate: "2024-07-16",
    category: "original",
    coverUrl:
      "https://is1-ssl.mzstatic.com/image/thumb/Music211/v4/a4/16/42/a416426c-c47d-744b-99dd-ce12b776361c/artwork.jpg/1000x1000bb.jpg",
    previewUrl:
      "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview211/v4/96/d1/3f/96d13f3a-a7f5-3805-a448-5d069e93c63a/mzaf_4098659183663401454.plus.aac.p.m4a",
    links: {
      listen: "https://album.link/i/1758625943",
      appleMusic:
        "https://music.apple.com/us/album/operator/1758625943?i=1758625944",
      deezer: "https://www.deezer.com/album/618622051",
    },
  },
  {
    title: "4 12",
    releaseDate: "2024-05-14",
    category: "original",
    coverUrl:
      "https://is1-ssl.mzstatic.com/image/thumb/Music221/v4/2e/9f/38/2e9f3866-25b8-a702-eeec-8e0067914172/artwork.jpg/1000x1000bb.jpg",
    previewUrl:
      "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview221/v4/74/dd/fe/74ddfeb0-bac3-89c7-be36-ddee9f298365/mzaf_14281175054035891465.plus.aac.p.m4a",
    links: {
      listen: "https://album.link/i/1746836681",
      spotify: "https://open.spotify.com/track/0lS4pp7kTEmZZS1GAYJxAR",
      appleMusic:
        "https://music.apple.com/us/album/4-12/1746836681?i=1746836682",
      deezer: "https://www.deezer.com/album/603782042",
    },
  },
  {
    title: "CHUPABIEN.wav",
    releaseDate: "2024-02-07",
    category: "original",
    coverUrl:
      "https://is1-ssl.mzstatic.com/image/thumb/Music126/v4/95/3b/ab/953babba-7c8c-8b5d-7513-ca6c4b0229c9/artwork.jpg/1000x1000bb.jpg",
    previewUrl:
      "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview116/v4/f8/93/2f/f8932fce-5795-f6ae-83a9-219e356fef6a/mzaf_187924517099601971.plus.aac.p.m4a",
    links: {
      listen: "https://album.link/i/1730416415",
      appleMusic:
        "https://music.apple.com/us/album/chupabien-wav/1730416415?i=1730416417",
      deezer: "https://www.deezer.com/album/545631202",
      soundcloud: "https://soundcloud.com/killscomfort/chupabien",
    },
  },
];

export const SOUNDCLOUD_MIXES: MusicRelease[] = [
  {
    title: "SortofDeity",
    releaseDate: "2026-04-10",
    category: "remix",
    coverUrl:
      "https://i1.sndcdn.com/artworks-F69xcZ1y3VCp1zIS-bV50Dg-t500x500.png",
    links: {
      soundcloud: "https://soundcloud.com/killscomfort/sortofdeity-final",
      listen: "https://soundcloud.com/killscomfort/sortofdeity-final",
    },
  },
  {
    title: "Dat Thang Jersey Flip",
    releaseDate: "2026-03-25",
    category: "remix",
    coverUrl:
      "https://i1.sndcdn.com/artworks-6ZjNxBbOvtN6y9ZT-K0lOUw-t500x500.png",
    links: {
      soundcloud: "https://soundcloud.com/killscomfort/dat-thang-jersey-flip",
      listen: "https://soundcloud.com/killscomfort/dat-thang-jersey-flip",
    },
  },
  {
    title: "Ghetto Mashup 1",
    releaseDate: "2026-02-19",
    category: "remix",
    coverUrl:
      "https://i1.sndcdn.com/artworks-8xgt194yOlzUKqQ2-MDykkg-t500x500.png",
    links: {
      soundcloud: "https://soundcloud.com/killscomfort/ghetto-mashup",
      listen: "https://soundcloud.com/killscomfort/ghetto-mashup",
    },
  },
  {
    title: "Mi Desengaño House Remix Kills x Tono",
    releaseDate: "2025-06-07",
    category: "remix",
    coverUrl:
      "https://i1.sndcdn.com/artworks-ShCWeOpMGTZxNHWm-GdrpBw-t500x500.png",
    links: {
      soundcloud:
        "https://soundcloud.com/killscomfort/mi-desengano-house-remix-kills-x-tono",
      listen:
        "https://soundcloud.com/killscomfort/mi-desengano-house-remix-kills-x-tono",
    },
  },
  {
    title: "THISDICKAINTFREEREMIX (getmadmix)",
    releaseDate: "2025-02-11",
    category: "remix",
    coverUrl:
      "https://i1.sndcdn.com/artworks-HtzICFxKLdMXKEEA-Bj6UjQ-t500x500.png",
    links: {
      soundcloud:
        "https://soundcloud.com/killscomfort/thisdickaintfreeremix-getmadmix",
      listen:
        "https://soundcloud.com/killscomfort/thisdickaintfreeremix-getmadmix",
    },
  },
  {
    title: "Lanez House Remix Kills X Tono",
    releaseDate: "2024-09-13",
    category: "remix",
    coverUrl:
      "https://i1.sndcdn.com/artworks-AzlABryeQez65W1f-v1zUnA-t500x500.jpg",
    links: {
      soundcloud:
        "https://soundcloud.com/killscomfort/lanez-house-remix-kills-x-tono",
      listen:
        "https://soundcloud.com/killscomfort/lanez-house-remix-kills-x-tono",
    },
  },
  {
    title: "CHUPABIEN.wav",
    releaseDate: "2024-02-07",
    category: "remix",
    coverUrl:
      "https://i1.sndcdn.com/artworks-uzxS5Cs3WMKAtNT3-9ktCIA-t500x500.jpg",
    links: {
      soundcloud: "https://soundcloud.com/killscomfort/chupabien",
      listen: "https://soundcloud.com/killscomfort/chupabien",
    },
  },
];

export const FEATURED_RELEASES = MUSIC_RELEASES.filter((r) => r.featured);

export function getLatestRelease(): MusicRelease {
  return [...MUSIC_RELEASES].sort(
    (a, b) =>
      new Date(b.releaseDate).getTime() - new Date(a.releaseDate).getTime()
  )[0];
}

export function releasesByCategory(category: MusicCategory) {
  return MUSIC_RELEASES.filter((r) => r.category === category);
}

function releaseKey(release: MusicRelease) {
  return (
    release.links.soundcloud ??
    release.links.listen ??
    release.links.spotify ??
    release.title
  );
}

export function remixReleases(): MusicRelease[] {
  const seen = new Set<string>();

  return [...SOUNDCLOUD_MIXES, ...releasesByCategory("remix")]
    .sort(
      (a, b) =>
        new Date(b.releaseDate).getTime() - new Date(a.releaseDate).getTime()
    )
    .filter((release) => {
      const key = releaseKey(release);
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
}
