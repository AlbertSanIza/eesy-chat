/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";
import type * as branching from "../branching.js";
import type * as chunks from "../chunks.js";
import type * as get from "../get.js";
import type * as messages from "../messages.js";
import type * as models from "../models.js";
import type * as remove from "../remove.js";
import type * as streaming from "../streaming.js";
import type * as threads from "../threads.js";

/**
 * A utility for referencing Convex functions in your app's API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
declare const fullApi: ApiFromModules<{
  branching: typeof branching;
  chunks: typeof chunks;
  get: typeof get;
  messages: typeof messages;
  models: typeof models;
  remove: typeof remove;
  streaming: typeof streaming;
  threads: typeof threads;
}>;
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;
