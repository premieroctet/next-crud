/* eslint-disable */
/* tslint:disable */
/*
 * ---------------------------------------------------------------
 * ## THIS FILE WAS GENERATED VIA SWAGGER-TYPESCRIPT-API        ##
 * ##                                                           ##
 * ## AUTHOR: acacode                                           ##
 * ## SOURCE: https://github.com/acacode/swagger-typescript-api ##
 * ---------------------------------------------------------------
 */

export interface User {
  id?: number;
  username?: string;
  posts?: Post[];
}

export interface Post {
  id?: number;
  title?: string;
  content?: string;
  user?: User;
}

export interface CreateUser {
  username: string | null;
  posts?: PostCreateManyWithoutUserInput;
}

export interface UpdateUser {
  username?: string | null;
  posts?: PostUpdateManyWithoutUserInput;
}

export interface CreatePost {
  title: string | null;
  content: string | null;
  user: UserCreateOneWithoutPostsInput;
}

export interface UpdatePost {
  title?: string | null;
  content?: string | null;
  user?: UserUpdateOneRequiredWithoutPostsInput;
}

export interface PostCreateManyWithoutUserInput {
  create?:
    | PostCreateWithoutUserInput
    | PostCreateWithoutUserInput[]
    | (PostCreateWithoutUserInput & PostCreateWithoutUserInput[]);
  connect?: PostWhereUniqueInput | PostWhereUniqueInput[] | (PostWhereUniqueInput & PostWhereUniqueInput[]);
  connectOrCreate?:
    | PostCreateOrConnectWithoutuserInput
    | PostCreateOrConnectWithoutuserInput[]
    | (PostCreateOrConnectWithoutuserInput & PostCreateOrConnectWithoutuserInput[]);
}

export interface PostCreateWithoutUserInput {
  title?: string;
  content?: string;
}

export interface PostWhereUniqueInput {
  id?: number;
}

export interface PostCreateOrConnectWithoutuserInput {
  where?: PostWhereUniqueInput;
  create?: PostCreateWithoutUserInput;
}

export interface PostUpdateManyWithoutUserInput {
  create?:
    | PostCreateWithoutUserInput
    | PostCreateWithoutUserInput[]
    | (PostCreateWithoutUserInput & PostCreateWithoutUserInput[]);
  connect?: PostWhereUniqueInput | PostWhereUniqueInput[] | (PostWhereUniqueInput & PostWhereUniqueInput[]);
  set?: PostWhereUniqueInput | PostWhereUniqueInput[] | (PostWhereUniqueInput & PostWhereUniqueInput[]);
  disconnect?: PostWhereUniqueInput | PostWhereUniqueInput[] | (PostWhereUniqueInput & PostWhereUniqueInput[]);
  delete?: PostWhereUniqueInput | PostWhereUniqueInput[] | (PostWhereUniqueInput & PostWhereUniqueInput[]);
  update?:
    | PostUpdateWithWhereUniqueWithoutUserInput
    | PostUpdateWithWhereUniqueWithoutUserInput[]
    | (PostUpdateWithWhereUniqueWithoutUserInput & PostUpdateWithWhereUniqueWithoutUserInput[]);
  updateMany?:
    | PostUpdateManyWithWhereWithoutUserInput
    | PostUpdateManyWithWhereWithoutUserInput[]
    | (PostUpdateManyWithWhereWithoutUserInput & PostUpdateManyWithWhereWithoutUserInput[]);
  deleteMany?: PostScalarWhereInput | PostScalarWhereInput[] | (PostScalarWhereInput & PostScalarWhereInput[]);
  upsert?:
    | PostUpsertWithWhereUniqueWithoutUserInput
    | PostUpsertWithWhereUniqueWithoutUserInput[]
    | (PostUpsertWithWhereUniqueWithoutUserInput & PostUpsertWithWhereUniqueWithoutUserInput[]);
  connectOrCreate?:
    | PostCreateOrConnectWithoutuserInput
    | PostCreateOrConnectWithoutuserInput[]
    | (PostCreateOrConnectWithoutuserInput & PostCreateOrConnectWithoutuserInput[]);
}

export interface PostUpdateWithWhereUniqueWithoutUserInput {
  where?: PostWhereUniqueInput;
  data?: PostUpdateWithoutUserInput;
}

export interface PostUpdateWithoutUserInput {
  title?: string | StringFieldUpdateOperationsInput;
  content?: string | StringFieldUpdateOperationsInput;
}

export interface StringFieldUpdateOperationsInput {
  set?: string;
}

export interface PostUpdateManyWithWhereWithoutUserInput {
  where?: PostScalarWhereInput;
  data?: PostUpdateManyMutationInput;
}

export interface PostScalarWhereInput {
  AND?: PostScalarWhereInput | PostScalarWhereInput[] | (PostScalarWhereInput & PostScalarWhereInput[]);
  OR?: PostScalarWhereInput | PostScalarWhereInput[] | (PostScalarWhereInput & PostScalarWhereInput[]);
  NOT?: PostScalarWhereInput | PostScalarWhereInput[] | (PostScalarWhereInput & PostScalarWhereInput[]);
  id?: IntFilter | number;
  title?: StringFilter | string;
  content?: StringFilter | string;
  userId?: IntFilter | number;
}

export interface IntFilter {
  equals?: number;
  in?: number[];
  notIn?: number[];
  lt?: number;
  lte?: number;
  gt?: number;
  gte?: number;
  not?: number | NestedIntFilter;
}

export interface NestedIntFilter {
  equals?: number;
  in?: number[];
  notIn?: number[];
  lt?: number;
  lte?: number;
  gt?: number;
  gte?: number;
  not?: number | NestedIntFilter;
}

export interface StringFilter {
  equals?: string;
  in?: string[];
  notIn?: string[];
  lt?: string;
  lte?: string;
  gt?: string;
  gte?: string;
  contains?: string;
  startsWith?: string;
  endsWith?: string;
  not?: string | NestedStringFilter;
}

export interface NestedStringFilter {
  equals?: string;
  in?: string[];
  notIn?: string[];
  lt?: string;
  lte?: string;
  gt?: string;
  gte?: string;
  contains?: string;
  startsWith?: string;
  endsWith?: string;
  not?: string | NestedStringFilter;
}

export interface PostUpdateManyMutationInput {
  title?: string | StringFieldUpdateOperationsInput;
  content?: string | StringFieldUpdateOperationsInput;
}

export interface PostUpsertWithWhereUniqueWithoutUserInput {
  where?: PostWhereUniqueInput;
  update?: PostUpdateWithoutUserInput;
  create?: PostCreateWithoutUserInput;
}

export interface UserCreateOneWithoutPostsInput {
  create?: UserCreateWithoutPostsInput;
  connect?: UserWhereUniqueInput;
  connectOrCreate?: UserCreateOrConnectWithoutpostsInput;
}

export interface UserCreateWithoutPostsInput {
  username?: string;
}

export interface UserWhereUniqueInput {
  id?: number;
}

export interface UserCreateOrConnectWithoutpostsInput {
  where?: UserWhereUniqueInput;
  create?: UserCreateWithoutPostsInput;
}

export interface UserUpdateOneRequiredWithoutPostsInput {
  create?: UserCreateWithoutPostsInput;
  connect?: UserWhereUniqueInput;
  update?: UserUpdateWithoutPostsInput;
  upsert?: UserUpsertWithoutPostsInput;
  connectOrCreate?: UserCreateOrConnectWithoutpostsInput;
}

export interface UserUpdateWithoutPostsInput {
  username?: string | StringFieldUpdateOperationsInput;
}

export interface UserUpsertWithoutPostsInput {
  update?: UserUpdateWithoutPostsInput;
  create?: UserCreateWithoutPostsInput;
}

export interface PaginationData {
  /**
   * Total number of elements in the collection
   * @min 0
   */
  total?: number;

  /**
   * Total number of pages
   * @min 0
   */
  pageCount?: number;

  /**
   * Current page number
   * @min 0
   */
  page?: number;
}

export interface UserPage {
  data?: User[];
  pagination?: PaginationData;
}

export interface PostPage {
  data?: Post[];
  pagination?: PaginationData;
}

export type QueryParamsType = Record<string | number, any>;
export type ResponseFormat = keyof Omit<Body, "body" | "bodyUsed">;

export interface FullRequestParams extends Omit<RequestInit, "body"> {
  /** set parameter to `true` for call `securityWorker` for this request */
  secure?: boolean;
  /** request path */
  path: string;
  /** content type of request body */
  type?: ContentType;
  /** query params */
  query?: QueryParamsType;
  /** format of response (i.e. response.json() -> format: "json") */
  format?: ResponseFormat;
  /** request body */
  body?: unknown;
  /** base url */
  baseUrl?: string;
  /** request cancellation token */
  cancelToken?: CancelToken;
}

export type RequestParams = Omit<FullRequestParams, "body" | "method" | "query" | "path">;

export interface ApiConfig<SecurityDataType = unknown> {
  baseUrl?: string;
  baseApiParams?: Omit<RequestParams, "baseUrl" | "cancelToken" | "signal">;
  securityWorker?: (securityData: SecurityDataType | null) => Promise<RequestParams | void> | RequestParams | void;
  customFetch?: typeof fetch;
}

export interface HttpResponse<D extends unknown, E extends unknown = unknown> extends Response {
  data: D;
  error: E;
}

type CancelToken = Symbol | string | number;

export enum ContentType {
  Json = "application/json",
  FormData = "multipart/form-data",
  UrlEncoded = "application/x-www-form-urlencoded",
}

export class HttpClient<SecurityDataType = unknown> {
  public baseUrl: string = "http://localhost:3000/api";
  private securityData: SecurityDataType | null = null;
  private securityWorker?: ApiConfig<SecurityDataType>["securityWorker"];
  private abortControllers = new Map<CancelToken, AbortController>();
  private customFetch = (...fetchParams: Parameters<typeof fetch>) => fetch(...fetchParams);

  private baseApiParams: RequestParams = {
    credentials: "same-origin",
    headers: {},
    redirect: "follow",
    referrerPolicy: "no-referrer",
  };

  constructor(apiConfig: ApiConfig<SecurityDataType> = {}) {
    Object.assign(this, apiConfig);
  }

  public setSecurityData = (data: SecurityDataType | null) => {
    this.securityData = data;
  };

  private encodeQueryParam(key: string, value: any) {
    const encodedKey = encodeURIComponent(key);
    return `${encodedKey}=${encodeURIComponent(typeof value === "number" ? value : `${value}`)}`;
  }

  private addQueryParam(query: QueryParamsType, key: string) {
    return this.encodeQueryParam(key, query[key]);
  }

  private addArrayQueryParam(query: QueryParamsType, key: string) {
    const value = query[key];
    return value.map((v: any) => this.encodeQueryParam(key, v)).join("&");
  }

  protected toQueryString(rawQuery?: QueryParamsType): string {
    const query = rawQuery || {};
    const keys = Object.keys(query).filter((key) => "undefined" !== typeof query[key]);
    return keys
      .map((key) => (Array.isArray(query[key]) ? this.addArrayQueryParam(query, key) : this.addQueryParam(query, key)))
      .join("&");
  }

  protected addQueryParams(rawQuery?: QueryParamsType): string {
    const queryString = this.toQueryString(rawQuery);
    return queryString ? `?${queryString}` : "";
  }

  private contentFormatters: Record<ContentType, (input: any) => any> = {
    [ContentType.Json]: (input: any) =>
      input !== null && (typeof input === "object" || typeof input === "string") ? JSON.stringify(input) : input,
    [ContentType.FormData]: (input: any) =>
      Object.keys(input || {}).reduce((formData, key) => {
        const property = input[key];
        formData.append(
          key,
          property instanceof Blob
            ? property
            : typeof property === "object" && property !== null
            ? JSON.stringify(property)
            : `${property}`,
        );
        return formData;
      }, new FormData()),
    [ContentType.UrlEncoded]: (input: any) => this.toQueryString(input),
  };

  private mergeRequestParams(params1: RequestParams, params2?: RequestParams): RequestParams {
    return {
      ...this.baseApiParams,
      ...params1,
      ...(params2 || {}),
      headers: {
        ...(this.baseApiParams.headers || {}),
        ...(params1.headers || {}),
        ...((params2 && params2.headers) || {}),
      },
    };
  }

  private createAbortSignal = (cancelToken: CancelToken): AbortSignal | undefined => {
    if (this.abortControllers.has(cancelToken)) {
      const abortController = this.abortControllers.get(cancelToken);
      if (abortController) {
        return abortController.signal;
      }
      return void 0;
    }

    const abortController = new AbortController();
    this.abortControllers.set(cancelToken, abortController);
    return abortController.signal;
  };

  public abortRequest = (cancelToken: CancelToken) => {
    const abortController = this.abortControllers.get(cancelToken);

    if (abortController) {
      abortController.abort();
      this.abortControllers.delete(cancelToken);
    }
  };

  public request = async <T = any, E = any>({
    body,
    secure,
    path,
    type,
    query,
    format,
    baseUrl,
    cancelToken,
    ...params
  }: FullRequestParams): Promise<HttpResponse<T, E>> => {
    const secureParams =
      ((typeof secure === "boolean" ? secure : this.baseApiParams.secure) &&
        this.securityWorker &&
        (await this.securityWorker(this.securityData))) ||
      {};
    const requestParams = this.mergeRequestParams(params, secureParams);
    const queryString = query && this.toQueryString(query);
    const payloadFormatter = this.contentFormatters[type || ContentType.Json];
    const responseFormat = format || requestParams.format;

    return this.customFetch(`${baseUrl || this.baseUrl || ""}${path}${queryString ? `?${queryString}` : ""}`, {
      ...requestParams,
      headers: {
        ...(type && type !== ContentType.FormData ? { "Content-Type": type } : {}),
        ...(requestParams.headers || {}),
      },
      signal: cancelToken ? this.createAbortSignal(cancelToken) : void 0,
      body: typeof body === "undefined" || body === null ? null : payloadFormatter(body),
    }).then(async (response) => {
      const r = response as HttpResponse<T, E>;
      r.data = null as unknown as T;
      r.error = null as unknown as E;

      const data = !responseFormat
        ? r
        : await response[responseFormat]()
            .then((data) => {
              if (r.ok) {
                r.data = data;
              } else {
                r.error = data;
              }
              return r;
            })
            .catch((e) => {
              r.error = e;
              return r;
            });

      if (cancelToken) {
        this.abortControllers.delete(cancelToken);
      }

      if (!response.ok) throw data;
      return data;
    });
  };
}

/**
 * @title My API CRUD
 * @baseUrl http://localhost:3000/api
 */
export class Api<SecurityDataType extends unknown> extends HttpClient<SecurityDataType> {
  users = {
    /**
     * No description
     *
     * @tags Users
     * @name UsersList
     * @request GET:/users
     */
    usersList: (
      query?: {
        select?: string;
        include?: string;
        limit?: number;
        skip?: number;
        where?: string;
        orderBy?: string;
        page?: number;
        distinct?: string;
      },
      params: RequestParams = {},
    ) =>
      this.request<any[], any>({
        path: `/users`,
        method: "GET",
        query: query,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags Users
     * @name UsersCreate
     * @request POST:/users
     */
    usersCreate: (data: any, query?: { select?: string; include?: string }, params: RequestParams = {}) =>
      this.request<any, any>({
        path: `/users`,
        method: "POST",
        query: query,
        body: data,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags Users
     * @name UsersDetail
     * @request GET:/users/{id}
     */
    usersDetail: (id: string, query?: { select?: string; include?: string }, params: RequestParams = {}) =>
      this.request<any, any>({
        path: `/users/${id}`,
        method: "GET",
        query: query,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags Users
     * @name UsersUpdate
     * @request PUT:/users/{id}
     */
    usersUpdate: (id: string, data: any, query?: { select?: string; include?: string }, params: RequestParams = {}) =>
      this.request<any, any>({
        path: `/users/${id}`,
        method: "PUT",
        query: query,
        body: data,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags Users
     * @name UsersDelete
     * @request DELETE:/users/{id}
     */
    usersDelete: (id: string, query?: { select?: string; include?: string }, params: RequestParams = {}) =>
      this.request<any, any>({
        path: `/users/${id}`,
        method: "DELETE",
        query: query,
        format: "json",
        ...params,
      }),
  };
  posts = {
    /**
     * No description
     *
     * @tags Posts
     * @name PostsList
     * @request GET:/posts
     */
    postsList: (
      query?: {
        select?: string;
        include?: string;
        limit?: number;
        skip?: number;
        where?: string;
        orderBy?: string;
        page?: number;
        distinct?: string;
      },
      params: RequestParams = {},
    ) =>
      this.request<any[], any>({
        path: `/posts`,
        method: "GET",
        query: query,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags Posts
     * @name PostsCreate
     * @request POST:/posts
     */
    postsCreate: (data: any, query?: { select?: string; include?: string }, params: RequestParams = {}) =>
      this.request<any, any>({
        path: `/posts`,
        method: "POST",
        query: query,
        body: data,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags Posts
     * @name PostsDetail
     * @request GET:/posts/{id}
     */
    postsDetail: (id: string, query?: { select?: string; include?: string }, params: RequestParams = {}) =>
      this.request<any, any>({
        path: `/posts/${id}`,
        method: "GET",
        query: query,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags Posts
     * @name PostsUpdate
     * @request PUT:/posts/{id}
     */
    postsUpdate: (id: string, data: any, query?: { select?: string; include?: string }, params: RequestParams = {}) =>
      this.request<any, any>({
        path: `/posts/${id}`,
        method: "PUT",
        query: query,
        body: data,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags Posts
     * @name PostsDelete
     * @request DELETE:/posts/{id}
     */
    postsDelete: (id: string, query?: { select?: string; include?: string }, params: RequestParams = {}) =>
      this.request<any, any>({
        path: `/posts/${id}`,
        method: "DELETE",
        query: query,
        format: "json",
        ...params,
      }),
  };
}
