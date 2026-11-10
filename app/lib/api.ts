export type Profile = {
  email: string;
  name: string;
  role: "admin";
  status: string;
};

export type Member = {
  email: string;
  name: string;
  role: "admin";
  status: string;
  createdAt: string | null;
  activatedAt: string | null;
};

export type Waiver = {
  id: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  phone: string;
  entityName: string;
  accepted: boolean;
  signedAt: string | null;
  createdAt: string | null;
  source: string;
  notificationEmailSent: boolean;
  hasSignature: boolean;
  signatureUrl?: string;
};

const API_URL = process.env.NEXT_PUBLIC_WAIVER_API_URL || "";

export async function postApi<T>(
  body: Record<string, unknown>,
  token = "",
): Promise<T> {
  if (!API_URL) throw new Error("The waiver API is not configured.");
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (token) headers.Authorization = `Bearer ${token}`;
  const response = await fetch(API_URL, {
    method: "POST",
    headers,
    cache: "no-store",
    body: JSON.stringify(body),
  });
  const payload = (await response.json().catch(() => ({}))) as T & {
    ok?: boolean;
    error?: string;
  };
  if (!response.ok || payload.ok === false) {
    throw new Error(payload.error || "Could not reach the waiver API.");
  }
  return payload;
}

export async function requestAdminCode(email: string) {
  return postApi<{ message?: string }>({ action: "requestAdminCode", email });
}

export async function verifyAdminCode(email: string, code: string) {
  return postApi<{ token: string; email: string; message?: string }>({
    action: "verifyAdminCode",
    email,
    code,
  });
}
