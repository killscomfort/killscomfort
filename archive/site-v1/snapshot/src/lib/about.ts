import { SITE } from "./constants";

export const FOUNDER_BIO = `${SITE.founder} is a Miami-born ${SITE.founderRoles} and ${SITE.founderEducation}, building a movement from the streets and the studio — years learning the craft behind the boards, grounded in raw energy, real culture, and music as service.`;

/** First-person intro for the homepage artist section */
export const FOUNDER_INTRO = `Miami-born DJ, producer, and sound engineer—and a proud SAE Institute alum. I've spent years behind the boards, building ${SITE.name} through the streets and the studio with raw energy, genuine culture, and music that brings people together.`;

export const ABOUT_HERO_IMAGE = "/about/FINALS-1.png";
export const HOME_HERO_IMAGE = "/about/FINALS-9.png";
export const HOME_ARTIST_IMAGE = "/about/greg-about.png";

/** Curated brand photos — full set lives in /public/about */
export const ABOUT_GALLERY_IMAGES = [
  "/about/FINALS-2.png",
  "/about/FINALS-5.png",
  "/about/FINALS-10.png",
  "/about/FINALS-14.png",
  "/about/FINALS-18.png",
  "/about/FINALS-22.png",
  "/about/FINALS-28.png",
  "/about/FINALS-33.png",
  "/about/FINALS-38.png",
  "/about/FINALS-42.png",
  "/about/FINALS-45.png",
  "/about/FINALS-47.png",
] as const;
