const BASE_URL =
  import.meta.env.VITE_API_URL;

export async function api<T>(
  url: string,
  options?: RequestInit
): Promise<T> {

  const token =
    localStorage.getItem("token");

  const response =
    await fetch(
      `${BASE_URL}${url}`,
      {
        ...options,

        headers: {

          Authorization:
            token
              ? `Bearer ${token}`
              : "",

          ...(options?.body instanceof FormData
            ? {}
            : {
                "Content-Type":
                  "application/json",
              }),

          ...(options?.headers || {}),

        },

      }
    );

  if (!response.ok) {

  if (
    response.status === 401
  ) {

    localStorage.removeItem(
      "token"
    );

    localStorage.removeItem(
      "user"
    );

    if (
      window.location.pathname !==
      "/login"
    ) {

      window.location.href =
        "/login";

    }

    throw new Error(
      "Session expired."
    );

  }

  let message =
    "Something went wrong.";

  try {

    const data =
      await response.json();

    message =
      data.message ||
      message;

  } catch {}

  throw new Error(message);

}

  if (response.status === 204) {

    return undefined as T;

  }

  return response.json();

}