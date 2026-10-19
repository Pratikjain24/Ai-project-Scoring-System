// =========================================================================
// PROJECTX-RAY AI - CLOUD OBJECT STORAGE & PRESIGNED URLS TEST SUITE
// AWS S3, MinIO, Cloudflare R2, Local Disk HMAC, & Ephemeral Container Defense
// =========================================================================

import { describe, it, before, after } from 'node:test';
import assert from 'node:assert';
import http from 'node:http';
import { app } from '../server';
import { StorageService } from '../services/storageService';
import { S3StorageDriver } from '../storage/s3Driver';
import { LocalStorageDriver } from '../storage/localDriver';
import { MemoryStorageDriver } from '../storage/memoryDriver';
import { signToken } from '../services/tokenService';
import { db } from '../db/database';

describe('Phase 15: Cloud Object Storage Architecture (S3, MinIO, R2, Local HMAC)', () => {
  let server: http.Server;
  let baseUrl: string;

  const adminToken = signToken({
    userId: 'admin_test_user',
    email: 'admin@projectxray.ai',
    role: 'ADMIN',
  });
  const adminHeaders = {
    Authorization: `Bearer ${adminToken}`,
    'Content-Type': 'application/json',
  };

  const studentToken = signToken({
    userId: 'student_test_user',
    email: 'student@mit.edu',
    role: 'STUDENT',
  });
  const studentHeaders = {
    Authorization: `Bearer ${studentToken}`,
    'Content-Type': 'application/json',
  };

  before(async () => {
    server = http.createServer(app);
    await new Promise<void>((resolve) => server.listen(0, resolve));
    const port = (server.address() as any).port;
    baseUrl = `http://127.0.0.1:${port}`;
  });

  after(async () => {
    // Reset driver to local
    StorageService.setDriver(new LocalStorageDriver());
    await new Promise<void>((resolve) => server.close(resolve));
  });

  // -----------------------------------------------------------------------
  // 1. StorageService.validateUpload & Path Traversal Sanitization
  // -----------------------------------------------------------------------
  it('1. StorageService.validateUpload enforces extension whitelist and sanitizes path traversal', () => {
    // Valid upload
    const valid = StorageService.validateUpload('final_presentation.pdf', 1024 * 1024);
    assert.strictEqual(valid.isValid, true);
    assert.strictEqual(valid.sanitizedFilename, 'final_presentation.pdf');
    assert.strictEqual(valid.extension, '.pdf');

    // Path traversal attempt: ../../../etc/passwd.pdf
    const traversal = StorageService.validateUpload('../../../etc/passwd.pdf', 1024);
    assert.strictEqual(traversal.isValid, true);
    assert.strictEqual(traversal.sanitizedFilename, 'passwd.pdf');

    // Executable binary rejection (.exe)
    const exe = StorageService.validateUpload('payload.exe', 1024, 'application/x-msdownload');
    assert.strictEqual(exe.isValid, false);
    assert.match(exe.error!, /not supported/i);

    // MIME type executable rejection
    const dangerousMime = StorageService.validateUpload('innocent.pdf', 1024, 'application/x-msdownload');
    assert.strictEqual(dangerousMime.isValid, false);
    assert.match(dangerousMime.error!, /prohibited/i);

    // Oversized upload
    const oversized = StorageService.validateUpload('huge_dump.zip', 600 * 1024 * 1024);
    assert.strictEqual(oversized.isValid, false);
    assert.match(oversized.error!, /exceeds maximum permitted limit/i);
  });

  // -----------------------------------------------------------------------
  // 2. LocalStorageDriver: Path Confinement & HMAC Presigned Tokens
  // -----------------------------------------------------------------------
  it('2. LocalStorageDriver enforces sandbox confinement and cryptographically verifies HMAC tokens', async () => {
    const localDriver = new LocalStorageDriver({ signingSecret: 'test-secret-123' });

    // Resolves valid path
    const validPath = localDriver.resolvePath('evaluations/eval_01/doc.pdf');
    assert.ok(validPath.includes('evaluations'));

    // Rejects path traversal escaping sandbox
    assert.throws(() => {
      localDriver.resolvePath('../../etc/shadow');
    }, /Security Violation/);

    // Generates HMAC Presigned URL
    const presigned = await localDriver.createPresignedUploadUrl('evaluations/eval_01/report.pdf', {
      contentType: 'application/pdf',
      expiresInSeconds: 300,
    });

    assert.ok(presigned.uploadUrl.includes('/api/storage/file/'));
    assert.ok(presigned.uploadUrl.includes('token='));
    assert.ok(presigned.uploadUrl.includes('expires='));
    assert.strictEqual(presigned.method, 'PUT');

    // Validates correct token
    const urlObj = new URL(presigned.uploadUrl);
    const token = urlObj.searchParams.get('token')!;
    const expires = parseInt(urlObj.searchParams.get('expires')!, 10);
    const isValidToken = localDriver.verifyToken('upload', 'evaluations/eval_01/report.pdf', expires, token);
    assert.strictEqual(isValidToken, true);

    // Rejects forged token
    const isForgedValid = localDriver.verifyToken('upload', 'evaluations/eval_01/report.pdf', expires, 'deadbeef1234');
    assert.strictEqual(isForgedValid, false);

    // Rejects expired token
    const isExpiredValid = localDriver.verifyToken('upload', 'evaluations/eval_01/report.pdf', Date.now() - 1000, token);
    assert.strictEqual(isExpiredValid, false);
  });

  // -----------------------------------------------------------------------
  // 3. S3StorageDriver: AWS SigV4 Presigned URL Generation (S3, MinIO, R2)
  // -----------------------------------------------------------------------
  it('3. S3StorageDriver generates authentic AWS SigV4 Presigned URLs for AWS S3, MinIO, and Cloudflare R2', async () => {
    // AWS S3 Driver
    const s3Driver = new S3StorageDriver({
      bucket: 'test-eval-bucket',
      region: 'us-west-2',
      accessKeyId: 'AKIAIOSFODNN7EXAMPLE',
      secretAccessKey: 'wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY',
      driverType: 's3',
    });

    const s3Presigned = await s3Driver.createPresignedUploadUrl('evaluations/eval_02/code.zip', {
      contentType: 'application/zip',
      expiresInSeconds: 900,
    });

    assert.ok(s3Presigned.uploadUrl.startsWith('https://test-eval-bucket.s3.us-west-2.amazonaws.com/evaluations/eval_02/code.zip?'));
    assert.ok(s3Presigned.uploadUrl.includes('X-Amz-Algorithm=AWS4-HMAC-SHA256'));
    assert.ok(s3Presigned.uploadUrl.includes('X-Amz-Credential=AKIAIOSFODNN7EXAMPLE'));
    assert.ok(s3Presigned.uploadUrl.includes('X-Amz-Expires=900'));
    assert.ok(s3Presigned.uploadUrl.includes('X-Amz-Signature='));
    assert.strictEqual(s3Presigned.driver, 's3');

    // MinIO Driver (with custom endpoint & path-style access)
    const minioDriver = new S3StorageDriver({
      bucket: 'minio-bucket',
      region: 'us-east-1',
      endpoint: 'http://localhost:9000',
      accessKeyId: 'minioadmin',
      secretAccessKey: 'minioadmin',
      forcePathStyle: true,
      driverType: 'minio',
    });

    const minioPresigned = await minioDriver.createPresignedDownloadUrl('models/weights.onnx', 600);
    assert.ok(minioPresigned.startsWith('http://localhost:9000/minio-bucket/models/weights.onnx?'));
    assert.ok(minioPresigned.includes('X-Amz-Algorithm=AWS4-HMAC-SHA256'));
    assert.ok(minioPresigned.includes('X-Amz-Credential=minioadmin'));

    // Cloudflare R2 Driver
    const r2Driver = new S3StorageDriver({
      bucket: 'r2-bucket',
      region: 'auto',
      endpoint: 'https://testaccount.r2.cloudflarestorage.com',
      accessKeyId: 'r2_access_key',
      secretAccessKey: 'r2_secret_key',
      forcePathStyle: true,
      driverType: 'r2',
    });

    const r2Presigned = await r2Driver.createPresignedUploadUrl('recordings/pitch.mp4');
    assert.ok(r2Presigned.uploadUrl.startsWith('https://testaccount.r2.cloudflarestorage.com/r2-bucket/recordings/pitch.mp4?'));
    assert.strictEqual(r2Presigned.driver, 'r2');
  });

  // -----------------------------------------------------------------------
  // 4. MemoryStorageDriver & Key Sanitization
  // -----------------------------------------------------------------------
  it('4. MemoryStorageDriver supports instant in-memory CRUD operations and key sanitization', async () => {
    const memoryDriver = new MemoryStorageDriver();

    // Save
    const testData = Buffer.from('Quantum Teleportation Project Proposal', 'utf8');
    const saved = await memoryDriver.save('proposals/proposal_01.pdf', testData, {
      filename: 'proposal_01.pdf',
      mimeType: 'application/pdf',
    });
    assert.strictEqual(saved.key, 'proposals/proposal_01.pdf');
    assert.strictEqual(saved.sizeBytes, testData.length);
    assert.ok(saved.checksumSha256.length === 64);

    // Exists
    const exists = await memoryDriver.exists('proposals/proposal_01.pdf');
    assert.strictEqual(exists, true);

    // Get
    const fetched = await memoryDriver.get('proposals/proposal_01.pdf');
    assert.strictEqual(fetched.data.toString('utf8'), 'Quantum Teleportation Project Proposal');

    // List
    const list = await memoryDriver.list('proposals/');
    assert.strictEqual(list.length, 1);

    // Delete
    const deleted = await memoryDriver.delete('proposals/proposal_01.pdf');
    assert.strictEqual(deleted, true);
    assert.strictEqual(await memoryDriver.exists('proposals/proposal_01.pdf'), false);

    // Sanitization test in StorageService
    const cleanKey = StorageService.sanitizeKey('../../../uploads/../secret.txt');
    assert.ok(!cleanKey.includes('..'));
  });

  // -----------------------------------------------------------------------
  // 5. Database Registry Integration (stored_files)
  // -----------------------------------------------------------------------
  it('5. StorageService records stored files and SHA-256 checksums in SQLite registry', async () => {
    // Switch to memory driver for isolated test
    const memDriver = new MemoryStorageDriver();
    StorageService.setDriver(memDriver);

    const content = 'Hardware Microcontroller Firmware v1.0.4';
    const key = StorageService.generateObjectKey('eval_hardware_99', 'firmware.bin');

    const meta = await StorageService.saveFile(key, content, {
      filename: 'firmware.bin',
      mimeType: 'application/octet-stream',
      evaluationId: 'eval_hardware_99',
      projectId: 'embedded-iot-hub',
    });

    assert.strictEqual(meta.key, key);
    assert.strictEqual(meta.sizeBytes, Buffer.byteLength(content));

    // Verify database record
    const record = StorageService.getStoredFileByKey(key);
    assert.ok(record !== null);
    assert.strictEqual(record.fileKey, key);
    assert.strictEqual(record.originalFilename, 'firmware.bin');
    assert.strictEqual(record.evaluationId, 'eval_hardware_99');
    assert.strictEqual(record.projectId, 'embedded-iot-hub');
    assert.strictEqual(record.checksumSha256, meta.checksumSha256);

    // Query list
    const fileList = StorageService.listStoredFiles('eval_hardware_99');
    assert.ok(fileList.length >= 1);
    assert.strictEqual(fileList[0].fileKey, key);

    // Delete
    await StorageService.deleteFile(key);
    const afterDelete = StorageService.getStoredFileByKey(key);
    assert.strictEqual(afterDelete, null);
  });

  // -----------------------------------------------------------------------
  // 6. REST API: POST /api/storage/presigned-upload
  // -----------------------------------------------------------------------
  it('6. POST /api/storage/presigned-upload generates presigned upload URLs with validation', async () => {
    // Switch to Local driver for HTTP tests
    const localDriver = new LocalStorageDriver();
    StorageService.setDriver(localDriver);

    // Valid presigned upload request
    const res = await fetch(`${baseUrl}/api/storage/presigned-upload`, {
      method: 'POST',
      headers: studentHeaders,
      body: JSON.stringify({
        filename: 'architecture_diagram.pdf',
        contentType: 'application/pdf',
        evaluationId: 'eval_arch_test',
        projectId: 'smart-road-vision',
        expiresInSeconds: 600,
      }),
    });

    const body = await res.json();
    assert.strictEqual(res.status, 200);
    assert.strictEqual(body.success, true);
    assert.ok(body.data.uploadUrl);
    assert.ok(body.data.key.includes('eval_arch_test'));
    assert.strictEqual(body.data.method, 'PUT');
    assert.strictEqual(body.data.expiresInSeconds, 600);

    // Rejection of invalid extension
    const invalidRes = await fetch(`${baseUrl}/api/storage/presigned-upload`, {
      method: 'POST',
      headers: studentHeaders,
      body: JSON.stringify({
        filename: 'malicious_installer.exe',
        contentType: 'application/x-msdownload',
      }),
    });

    assert.strictEqual(invalidRes.status, 400);

    // Rejection without authentication
    const unauthRes = await fetch(`${baseUrl}/api/storage/presigned-upload`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        filename: 'notes.txt',
      }),
    });

    assert.strictEqual(unauthRes.status, 401);
  });

  // -----------------------------------------------------------------------
  // 7. REST API: GET /api/storage/presigned-download/:key
  // -----------------------------------------------------------------------
  it('7. GET /api/storage/presigned-download/:key generates temporary download URL', async () => {
    const key = 'evaluations/eval_arch_test/test_doc.pdf';

    const res = await fetch(`${baseUrl}/api/storage/presigned-download/${encodeURIComponent(key)}?expiresInSeconds=300`, {
      headers: studentHeaders,
    });

    const body = await res.json();
    assert.strictEqual(res.status, 200);
    assert.strictEqual(body.success, true);
    assert.ok(body.data.downloadUrl);
    assert.strictEqual(body.data.key, key);
  });

  // -----------------------------------------------------------------------
  // 8. REST API: Local File Serving & Presigned HMAC Verification
  // -----------------------------------------------------------------------
  it('8. /api/storage/file/:key serves content with valid HMAC and rejects forged/expired tokens', async () => {
    const localDriver = new LocalStorageDriver();
    StorageService.setDriver(localDriver);

    // Save test file
    const key = `evaluations/test_${Date.now()}/readme.txt`;
    await localDriver.save(key, Buffer.from('ProjectX-Ray AI File Content', 'utf8'), {
      mimeType: 'text/plain',
    });

    // Valid presigned download URL
    const presignedDownloadUrl = await localDriver.createPresignedDownloadUrl(key, 300);
    const url = new URL(presignedDownloadUrl);
    const pathWithQuery = `${url.pathname}${url.search}`;

    // Request with valid presigned token (No Authorization header needed!)
    const downloadRes = await fetch(`${baseUrl}${pathWithQuery}`);
    assert.strictEqual(downloadRes.status, 200);
    const text = await downloadRes.text();
    assert.strictEqual(text, 'ProjectX-Ray AI File Content');

    // Request with forged token
    const forgedPath = pathWithQuery.replace(/token=[a-f0-9]+/, 'token=0000000000000000');
    const forgedRes = await fetch(`${baseUrl}${forgedPath}`);
    assert.strictEqual(forgedRes.status, 403);
    const forgedBody = await forgedRes.json();
    assert.strictEqual(forgedBody.error.code, 'INVALID_STORAGE_TOKEN');

    // Clean up
    await localDriver.delete(key);
  });

  // -----------------------------------------------------------------------
  // 9. REST API: POST /api/storage/upload (Proxy Base64 Payload)
  // -----------------------------------------------------------------------
  it('9. POST /api/storage/upload ingests base64 binary payload and registers file', async () => {
    const sampleText = 'Autonomous Vehicle Sensor Benchmark Report';
    const base64Data = Buffer.from(sampleText).toString('base64');

    const res = await fetch(`${baseUrl}/api/storage/upload`, {
      method: 'POST',
      headers: studentHeaders,
      body: JSON.stringify({
        fileName: 'benchmark_report.pdf',
        mimeType: 'application/pdf',
        fileBase64: base64Data,
        evaluationId: 'eval_sensor_bench',
        projectId: 'smart-road-vision',
      }),
    });

    const body = await res.json();
    assert.strictEqual(res.status, 201);
    assert.strictEqual(body.success, true);
    assert.ok(body.data.key);
    assert.strictEqual(body.data.sizeBytes, Buffer.byteLength(sampleText));
    assert.ok(body.data.checksumSha256);

    // Verify stored file metadata endpoint
    const metaRes = await fetch(`${baseUrl}/api/storage/metadata/${encodeURIComponent(body.data.key)}`, {
      headers: studentHeaders,
    });

    const metaBody = await metaRes.json();
    assert.strictEqual(metaRes.status, 200);
    assert.strictEqual(metaBody.data.record.originalFilename, 'benchmark_report.pdf');

    // Clean up
    await StorageService.deleteFile(body.data.key);
  });

  // -----------------------------------------------------------------------
  // 10. Admin Storage Status & Driver Switch Telemetry
  // -----------------------------------------------------------------------
  it('10. Admin endpoints report storage status and dynamically switch storage drivers', async () => {
    // GET /api/admin/storage/status
    const statusRes = await fetch(`${baseUrl}/api/admin/storage/status`, {
      headers: adminHeaders,
    });

    const statusBody = await statusRes.json();
    assert.strictEqual(statusRes.status, 200);
    assert.strictEqual(statusBody.success, true);
    assert.ok(statusBody.data.activeDriver);
    assert.strictEqual(typeof statusBody.data.registeredFilesCount, 'number');

    // POST /api/admin/storage/switch-driver (Switch to S3/MinIO driver)
    const switchRes = await fetch(`${baseUrl}/api/admin/storage/switch-driver`, {
      method: 'POST',
      headers: adminHeaders,
      body: JSON.stringify({
        driver: 's3',
        config: {
          bucket: 'production-s3-jury-bucket',
          region: 'eu-central-1',
          accessKeyId: 'AKIA_PRODUCTION_KEY',
          secretAccessKey: 'SECRET_PRODUCTION_KEY',
        },
      }),
    });

    const switchBody = await switchRes.json();
    assert.strictEqual(switchRes.status, 200);
    assert.strictEqual(switchBody.success, true);
    assert.strictEqual(StorageService.getDriver().name, 's3');

    // Switch back to local driver
    await fetch(`${baseUrl}/api/admin/storage/switch-driver`, {
      method: 'POST',
      headers: adminHeaders,
      body: JSON.stringify({ driver: 'local' }),
    });

    assert.strictEqual(StorageService.getDriver().name, 'local');
  });
});
