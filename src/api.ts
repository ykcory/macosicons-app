import { Body, fetch } from "@tauri-apps/api/http";

interface GetListHttpData {
  query: string;
  page: number;
}

export interface Hits {
  appName: string;
  approved: boolean;
  timeStamp: number;
  usersName: string;
  icnsUrl: string;
  lowResPngUrl: string;
  category: string;
  downloads: number;
  objectID: string;
}

interface GetListHttpResponse {
  hits: Hits[];
  page: number; // 当前页
  nbHits: number; // 总数
  nbPages: number; // 总页数
}

export const getListHttp = (data: GetListHttpData) => {
  const query = {
    "x-algolia-agent": "Algolia for JavaScript (4.14.2); Browser",
  };

  const headers = {
    "X-Algolia-Api-Key": "0ba04276e457028f3e11e38696eab32c",
    "X-Algolia-Application-Id": "P1TXH7ZFB3",
  };

  const body = {
    hitsPerPage: 28,
    filters: "approved:true",
    ...data,
  };

  return fetch<GetListHttpResponse>(
    "https://p1txh7zfb3-3.algolianet.com/1/indexes/macOSicons-date/query",
    {
      method: "POST",
      headers,
      query,
      body: Body.json(body),
    },
  );
};
