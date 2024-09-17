export default async function fetcher<JSON = any>(
  input: RequestInfo,
  init?: RequestInit,
): Promise<JSON> {
  const res: Response = await fetch(input, init)
  const data: JSON = await res.json()
  return data
}
