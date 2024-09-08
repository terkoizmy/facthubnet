/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * Generated by convex@1.14.1.
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";
import type * as bookmarks from "../bookmarks.js";
import type * as category from "../category.js";
import type * as clerkWebhook from "../clerkWebhook.js";
import type * as comments from "../comments.js";
import type * as follow from "../follow.js";
import type * as images from "../images.js";
import type * as newsArticle from "../newsArticle.js";
import type * as profile from "../profile.js";
import type * as recommendations from "../recommendations.js";
import type * as search from "../search.js";
import type * as uploadFile from "../uploadFile.js";
import type * as user from "../user.js";
import type * as votes from "../votes.js";

/**
 * A utility for referencing Convex functions in your app's API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
declare const fullApi: ApiFromModules<{
  bookmarks: typeof bookmarks;
  category: typeof category;
  clerkWebhook: typeof clerkWebhook;
  comments: typeof comments;
  follow: typeof follow;
  images: typeof images;
  newsArticle: typeof newsArticle;
  profile: typeof profile;
  recommendations: typeof recommendations;
  search: typeof search;
  uploadFile: typeof uploadFile;
  user: typeof user;
  votes: typeof votes;
}>;
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;
