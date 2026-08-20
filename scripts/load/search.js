import http from "k6/http";
import { check, sleep } from "k6";

export const options = { scenarios: { search: { executor: "constant-arrival-rate", rate: 25, timeUnit: "1s", duration: "30s", preAllocatedVUs: 20, maxVUs: 100 } }, thresholds: { http_req_duration: ["p(95)<800"], http_req_failed: ["rate<0.01"] } };
export default function searchScenario() { const response = http.get(`${__ENV.BASE_URL ?? "http://localhost:3000"}/api/search?type=apartment&maxRent=2500&verified=true`); check(response, { "status 200": (value) => value.status === 200, "envelope ok": (value) => value.json("ok") === true }); sleep(.1); }
