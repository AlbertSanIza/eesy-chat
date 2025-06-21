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
import type * as create from "../create.js";
import type * as eleven from "../eleven.js";
import type * as get from "../get.js";
import type * as init from "../init.js";
import type * as remove from "../remove.js";
import type * as streaming from "../streaming.js";
import type * as update from "../update.js";

/**
 * A utility for referencing Convex functions in your app's API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
declare const fullApi: ApiFromModules<{
  create: typeof create;
  eleven: typeof eleven;
  get: typeof get;
  init: typeof init;
  remove: typeof remove;
  streaming: typeof streaming;
  update: typeof update;
}>;
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;
