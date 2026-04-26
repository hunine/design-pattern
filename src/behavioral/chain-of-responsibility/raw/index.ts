// RAW: A request handler with all validation steps crammed into one function.
// Adding a new check means editing this function. Steps can't be reordered,
// skipped, or reused independently. The function grows without bound.

interface Request {
  user: string;
  password: string;
  role: string;
  data: string;
  cached: boolean;
}

function handleRequest(request: Request): string {
  // Step 1: authentication
  if (request.user !== "admin" || request.password !== "secret") {
    return "Rejected: invalid credentials";
  }

  // Step 2: authorization
  if (request.role !== "admin" && request.role !== "editor") {
    return "Rejected: insufficient permissions";
  }

  // Step 3: cache check
  if (request.cached) {
    return `Cache hit: returning cached data for "${request.data}"`;
  }

  // Step 4: throttle check
  const requestsThisMinute = 5; // pretend we track this somewhere
  if (requestsThisMinute > 100) {
    return "Rejected: rate limit exceeded";
  }

  // Step 5: actual processing
  return `Processing request for data: "${request.data}"`;
}

console.log(handleRequest({ user: "guest", password: "wrong", role: "viewer", data: "orders", cached: false }));
console.log(handleRequest({ user: "admin", password: "secret", role: "viewer", data: "orders", cached: false }));
console.log(handleRequest({ user: "admin", password: "secret", role: "editor", data: "orders", cached: true }));
console.log(handleRequest({ user: "admin", password: "secret", role: "admin",  data: "orders", cached: false }));
