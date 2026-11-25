import { S3Client } from "@aws-sdk/client-s3";

/** Every file the site stores lives under this folder in the bucket. */
export const S3_ROOT = "incial-web";

export interface S3Config {
  region: string;
  bucket: string;
  accessKeyId: string;
  secretAccessKey: string;
  /**
   * Where browsers load files from. The bucket is private, so by default the site serves them itself
   * through /media; set S3_PUBLIC_URL (for example a CloudFront address) to load them from there instead.
   */
  publicBase: string;
}

/** Reads the S3 settings; accepts both naming styles for the bucket and secret. Null when not configured. */
export function getS3Config(): S3Config | null {
  const region = process.env.AWS_REGION;
  const bucket = process.env.S3_BUCKET || process.env.AWS_S3_BUCKET;
  const accessKeyId = process.env.AWS_ACCESS_KEY_ID;
  const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY || process.env.AWS_SECRET_KEY;
  if (!region || !bucket || !accessKeyId || !secretAccessKey) return null;
  const publicBase = (process.env.S3_PUBLIC_URL || "/media").replace(/\/+$/, "");
  return { region, bucket, accessKeyId, secretAccessKey, publicBase };
}

let client: S3Client | null = null;

/** One shared client, so connections are reused across requests. */
export function getS3Client(config: S3Config): S3Client {
  client ??= new S3Client({
    region: config.region,
    credentials: { accessKeyId: config.accessKeyId, secretAccessKey: config.secretAccessKey },
  });
  return client;
}

/** The address a browser uses for a stored file. */
export function publicUrlFor(config: S3Config, key: string): string {
  return `${config.publicBase}/${key}`;
}

/**
 * A short, safe explanation of a storage failure for the admin (never includes keys or secrets),
 * so a failed upload says what to fix instead of only "failed".
 */
export function describeStorageError(error: unknown): string {
  const name = error instanceof Error ? error.name : "";
  const code = (error as { code?: string; Code?: string } | null)?.code ?? (error as { Code?: string } | null)?.Code ?? "";
  const reason = name || code;
  switch (reason) {
    case "AccessDenied":
    case "Forbidden":
      return "Amazon S3 refused the upload: the server's AWS user is not allowed to write to the bucket.";
    case "InvalidAccessKeyId":
    case "SignatureDoesNotMatch":
    case "CredentialsProviderError":
      return "Amazon S3 rejected the server's AWS keys (AWS_ACCESS_KEY_ID / AWS_SECRET_ACCESS_KEY).";
    case "NoSuchBucket":
      return "The S3 bucket set in S3_BUCKET does not exist.";
    case "PermanentRedirect":
    case "AuthorizationHeaderMalformed":
      return "The S3 bucket is in a different region than AWS_REGION.";
    case "TimeoutError":
    case "ETIMEDOUT":
    case "ECONNRESET":
    case "ENOTFOUND":
      return "The server could not reach Amazon S3. Please try again.";
    default:
      return reason ? `The upload failed (${reason}).` : "The upload failed.";
  }
}
