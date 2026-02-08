import { EMAIL_CONFIRMED_URL, RESET_PASSWORD_URL } from "@/features/auth/utils/auth-urls";

export type ParsedAuthSession = {
  accessToken: string;
  refreshToken: string;
  type?: string | null;
};

function appendParams(target: URLSearchParams, source: URLSearchParams) {
  source.forEach((value, key) => {
    target.set(key, value);
  });
}

function getAllParams(url: string) {
  const [urlWithoutHash, rawHash = ""] = url.split("#");
  const query = urlWithoutHash.includes("?")
    ? urlWithoutHash.split("?")[1] ?? ""
    : "";

  const queryParams = new URLSearchParams(query);
  const hashParams = new URLSearchParams(rawHash);

  const merged = new URLSearchParams();
  appendParams(merged, queryParams);
  appendParams(merged, hashParams);

  return merged;
}

export function isSupportedAuthUrl(url: string) {
  return url.startsWith(RESET_PASSWORD_URL) || url.startsWith(EMAIL_CONFIRMED_URL);
}

export function parseAuthSessionFromUrl(url: string): ParsedAuthSession | null {
  const params = getAllParams(url);

  const accessToken = params.get("access_token");
  const refreshToken = params.get("refresh_token");

  if (!accessToken || !refreshToken) {
    return null;
  }

  return {
    accessToken,
    refreshToken,
    type: params.get("type"),
  };
}
