import { test } from "@cross/test";
import { assertEquals } from "@std/assert";

import { add } from "./mod.ts";

test("dummy", () => {
  assertEquals(add(1, 2), 3);
});
