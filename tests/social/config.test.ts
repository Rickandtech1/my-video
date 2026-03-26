// tests/social/config.test.ts
import { execSync } from "child_process";
import { loadKey } from "../../src/social/config";

jest.mock("child_process");
const mockExecSync = execSync as jest.MockedFunction<typeof execSync>;

describe("loadKey", () => {
  it("returns trimmed key from keychain", () => {
    mockExecSync.mockReturnValue(Buffer.from("my-secret-key\n"));
    const result = loadKey("MY_SERVICE");
    expect(result).toBe("my-secret-key");
    expect(mockExecSync).toHaveBeenCalledWith(
      expect.stringContaining("MY_SERVICE"),
      expect.any(Object)
    );
  });

  it("throws if key not found", () => {
    mockExecSync.mockImplementation(() => { throw new Error("not found"); });
    expect(() => loadKey("MISSING_KEY")).toThrow(
      "Could not load key MISSING_KEY from Keychain"
    );
  });
});
