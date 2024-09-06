import { baseUrl } from "./apiConfig";
export const jsonLinkApi = "https://jsonlink.io/api/extract?url=";

const bookmarksApi = {
  getBookmarks: () => fetch(`${baseUrl}/api/info`).then((res) => res.json()),
  getPageInfo: (url: string) =>
    fetch(`${jsonLinkApi}${url}`).then((res) => res.json()),
  createNewBookmark: (newBookmark: any) =>
    fetch(`${baseUrl}/api/info`, {
      method: "POST",
      body: JSON.stringify(newBookmark),
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
    }).then((res) => res.json()),
  getBookmarkById: (id: string) =>
    fetch(`${baseUrl}/api/info/${id}`).then((res) => res.json()),
  updateBookmark: (id: string, updatedBookmark: any) =>
    fetch(`${baseUrl}/api/info/${id}`, {
      method: "PUT",
      body: JSON.stringify(updatedBookmark),
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
    }).then((res) => res.json()),
  deleteBookmark: (id: number) =>
    fetch(`${baseUrl}/api/info/${id}`, {
      method: "DELETE",
    }),
};

export { bookmarksApi };
