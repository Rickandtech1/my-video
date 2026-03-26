// tests/social/config.test.ts
import { execFileSync } from "child_process";
import * as config from "../../src/social/config";

jest.mock("child_process");
const mockExecFileSync = execFileSync as jest.MockedFunction<typeof execFileSync>;

describe("loadKey", () => {
  it("returns trimmed key from keychain", () => {
    mockExecFileSync.mockReturnValue("my-secret-key\n");
    const result = config.loadKey("MY_SERVICE");
    expect(result).toBe("my-secret-key");
    expect(mockExecFileSync).toHaveBeenCalledWith(
      "security",
      expect.arrayContaining(["MY_SERVICE"]),
      expect.any(Object)
    );
  });

  it("throws if key not found", () => {
    mockExecFileSync.mockImplementation(() => { throw new Error("not found"); });
    expect(() => config.loadKey("MISSING_KEY")).toThrow(
      "Could not load key MISSING_KEY from Keychain"
    );
  });

  it("throws if key is empty", () => {
    mockExecFileSync.mockReturnValue("   ");
    expect(() => config.loadKey("EMPTY_KEY")).toThrow("exists in Keychain but is empty");
  });
});

describe("loadConfig", () => {
  it("loads all 4 keys and returns correct Config shape", () => {
    // execFileSync is already mocked at the module level; configure it to return
    // a value derived from the service name argument so we can assert each field.
    mockExecFileSync.mockImplementation((_cmd, args) => {
      const argsArr = args as string[];
      const svcIndex = argsArr.indexOf("-s");
      const name = svcIndex !== -1 ? argsArr[svcIndex + 1] : "UNKNOWN";
      return `val-${name}\n`;
    });
    const result = config.loadConfig();
    expect(result.composioApiKey).toBe("val-COMPOSIO_API_KEY");
    expect(result.anthropicApiKey).toBe("val-ANTHROPIC_API_KEY");
    expect(result.gmailAppPassword).toBe("val-GMAIL_APP_PASSWORD");
    expect(result.gmailUser).toBe("val-GMAIL_USER");
    mockExecFileSync.mockReset();
  });
});
