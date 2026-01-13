import { base } from "./context";
import {
  listBookmarks,
  createBookmark,
  updateBookmark,
  deleteBookmark,
  refetchBookmark,
  listGroups,
  createGroup,
  updateGroup,
  deleteGroup,
  exportBookmarks,
} from "./procedures/bookmarks";
import { deleteAccount } from "./procedures/user";
import {
  generateToken,
  listTokens,
  revokeToken,
} from "./procedures/api-tokens";
import {
  extensionSaveBookmark,
  extensionGetGroups,
} from "./procedures/extension";

export const router = base.router({
  bookmark: {
    list: listBookmarks,
    create: createBookmark,
    update: updateBookmark,
    delete: deleteBookmark,
    refetch: refetchBookmark,
    export: exportBookmarks,
  },
  group: {
    list: listGroups,
    create: createGroup,
    update: updateGroup,
    delete: deleteGroup,
  },
  user: {
    delete: deleteAccount,
  },
  apiToken: {
    generate: generateToken,
    list: listTokens,
    revoke: revokeToken,
  },
  extension: {
    saveBookmark: extensionSaveBookmark,
    getGroups: extensionGetGroups,
  },
});

export type Router = typeof router;
