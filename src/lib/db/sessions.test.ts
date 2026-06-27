import { beforeEach, describe, expect, it } from "vitest";

import { createMemoryDb } from "@/lib/db";
import { SessionRepository } from "@/lib/db/sessions";

describe("SessionRepository", () => {
  let repo: SessionRepository;

  beforeEach(() => {
    repo = new SessionRepository(createMemoryDb());
  });

  it("upserts and retrieves a session", () => {
    repo.upsert({ namespace: "work", status: "connected", now: 1000 });
    const session = repo.get("work");
    expect(session?.namespace).toBe("work");
    expect(session?.status).toBe("connected");
  });

  it("preserves created_at across updates", () => {
    repo.upsert({ namespace: "work", status: "connected", now: 1000 });
    repo.upsert({ namespace: "work", status: "disconnected", now: 2000 });

    const session = repo.get("work");
    expect(session?.createdAt).toBe(1000);
    expect(session?.updatedAt).toBe(2000);
    expect(session?.status).toBe("disconnected");
    expect(repo.list()).toHaveLength(1);
  });

  it("lists sessions oldest first and removes them", () => {
    repo.upsert({ namespace: "a", status: "connected", now: 1 });
    repo.upsert({ namespace: "b", status: "connected", now: 2 });
    expect(repo.list().map((s) => s.namespace)).toEqual(["a", "b"]);

    repo.remove("a");
    expect(repo.list().map((s) => s.namespace)).toEqual(["b"]);
  });
});
