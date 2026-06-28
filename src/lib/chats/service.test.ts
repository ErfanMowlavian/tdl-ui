import { describe, expect, it } from "vitest";

import { parseChatList } from "@/lib/chats/service";

describe("parseChatList", () => {
  it("returns chats from a valid JSON line", () => {
    const lines = [
      `[{"id":"1001","type":"channel","title":"Mock Channel"},{"id":"1002","type":"group","title":"Mock Group"}]`,
    ];
    const result = parseChatList(lines);
    expect(result).toEqual([
      { id: "1001", type: "channel", title: "Mock Channel" },
      { id: "1002", type: "group", title: "Mock Group" },
    ]);
  });

  it("ignores noise lines and parses the first valid JSON array", () => {
    const lines = [
      "mock: starting chat ls",
      "some random log line",
      `[{"id":"42","type":"user","title":"Real Chat"}]`,
    ];
    const result = parseChatList(lines);
    expect(result).toEqual([{ id: "42", type: "user", title: "Real Chat" }]);
  });

  it("returns [] for no valid JSON", () => {
    const lines = ["not json", "also not json"];
    expect(parseChatList(lines)).toEqual([]);
  });

  it("returns [] for invalid JSON in lines", () => {
    const lines = ["{invalid}"];
    expect(parseChatList(lines)).toEqual([]);
  });

  it("returns [] for empty lines", () => {
    expect(parseChatList([])).toEqual([]);
  });

  it("skips JSON that is not an array", () => {
    const lines = [
      '{"single":"object"}',
      `[{"id":"1","type":"channel","title":"A"}]`,
    ];
    const result = parseChatList(lines);
    expect(result).toEqual([{ id: "1", type: "channel", title: "A" }]);
  });
});
