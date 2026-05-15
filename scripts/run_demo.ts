import { HarnessService } from "../src/services/harnessService.js";

const service = new HarnessService();
console.log(JSON.stringify(service.snapshot(), null, 2));
