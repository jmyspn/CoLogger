// The only data module components import from.
//
// There is ONE data flow in CoLogger: page → this file → one backend.
//
//   VITE_USE_MOCK_API=false          → httpApi.js → Express API → PostgreSQL
//   anything else, INCLUDING UNSET   → mockApi.js → this browser's localStorage
//
// The choice is made once, at build time, so the two backends never run side
// by side or compete. Pages never hold their own copies of collections or
// items: they ask for what the URL names (/collections/2, /items/4) and show
// exactly what comes back.
//
// Demo mode is the default so that a build with a forgotten variable shows a
// visible "Demo mode" notice instead of a site that silently fails on every
// request. Both modules are imported statically because top-level await (for
// a dynamic import) does not build with Vite's default browser target.

import * as mockApi from './mockApi.js'
import * as httpApi from './httpApi.js'

export { ApiError, isNotFound, SESSION_EXPIRED_EVENT } from './errors.js'

export const USING_MOCK_API = import.meta.env.VITE_USE_MOCK_API !== 'false'

const implementation = USING_MOCK_API ? mockApi : httpApi

export const {
  register,
  login,
  logout,
  getCurrentUser,
  listCollections,
  getCollection,
  createCollection,
  updateCollection,
  deleteCollection,
  listCollectionItems,
  createItem,
  getItem,
  updateItem,
  setItemFavorite,
  deleteItem,
  getDashboard,
  searchItems,
  listFavorites,
} = implementation
