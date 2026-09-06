// ====================================================
// PROJECTX-RAY AI - PHASE 12: URL SECURITY & SSRF DEFENSE
// ====================================================

export class UrlSecurity {
  private static BLOCKED_HOSTNAMES = new Set([
    'localhost',
    '127.0.0.1',
    '0.0.0.0',
    '::1',
    '169.254.169.254', // AWS/GCP Metadata service
    'metadata.google.internal'
  ]);

  /**
   * Validate user-supplied URL against SSRF and illegal protocols
   */
  static validate(urlString: string): { isValid: boolean; normalizedUrl?: string; error?: string } {
    try {
      const parsed = new URL(urlString);

      // Only http and https
      if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
        return {
          isValid: false,
          error: `Unsupported protocol '${parsed.protocol}'. Only HTTP and HTTPS are permitted.`
        };
      }

      const hostname = parsed.hostname.toLowerCase();

      // Check blocked hostnames
      if (this.BLOCKED_HOSTNAMES.has(hostname)) {
        return {
          isValid: false,
          error: `Access to internal host '${hostname}' is strictly blocked.`
        };
      }

      // Check private IPv4 ranges (10.0.0.0/8, 172.16.0.0/12, 192.168.0.0/16)
      if (
        hostname.startsWith('10.') ||
        hostname.startsWith('192.168.') ||
        /^172\.(1[6-9]|2[0-9]|3[0-1])\./.test(hostname)
      ) {
        return {
          isValid: false,
          error: 'Access to private network IP ranges is prohibited.'
        };
      }

      return {
        isValid: true,
        normalizedUrl: parsed.toString()
      };
    } catch {
      return {
        isValid: false,
        error: 'Invalid or malformed URL syntax.'
      };
    }
  }
}
