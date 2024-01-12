import { describe, expect, it } from 'vitest';

import fs from 'node:fs';
import path from 'node:path';
import Upload from 'graphql-upload/Upload.mjs';
import type { FileUpload } from 'graphql-upload/Upload.mjs';
import { streamToString } from '../../../src/database/file-storage';
import { checkConfigurationImport } from '../../../src/modules/workspace/workspace-domain';

describe('workspace', () => {
  const cases = [
    ['../../data/20233010_octi_dashboard_Custom Dash_invalid_5.11.0_version.json', 'Invalid version of the platform. Please upgrade your OpenCTI. Minimal version required: 5.12.16'],
    ['../../data/20233010_octi_dashboard_Custom Dash_invalid_5.10.5_version.json', 'Invalid version of the platform. Please upgrade your OpenCTI. Minimal version required: 5.12.16'],
    ['../../data/20233010_octi_dashboard_Custom Dash_invalid_4.0.4_version.json', 'Invalid version of the platform. Please upgrade your OpenCTI. Minimal version required: 5.12.16'],
  ];
  it.each(cases)('should verify import version compatibility, given invalid version (%s for error %s)', async (filePath, expectedErrorMessage) => {
    const file = fs.createReadStream(path.resolve(__dirname, filePath));
    const upload = new Upload();
    const fileUpload = {
      filename: 'invalid-version.json',
      mimetype: 'application/json',
      createReadStream: () => file,
      encoding: 'utf8',
    } as unknown as FileUpload;
    upload.promise = new Promise((executor) => { executor(fileUpload); });
    upload.file = fileUpload;
    const readStream = fileUpload.createReadStream();
    const fileContent = await streamToString(readStream);
    const parsedData = JSON.parse(fileContent.toString());
    const check = () => {
      checkConfigurationImport('dashboard', parsedData);
    };
    expect(check).toThrowError(expectedErrorMessage);
  });

  it('should verify import version compatibility, given invalid type', async () => {
    const file = fs.createReadStream(
      path.resolve(
        __dirname,
        '../../data/20233010_octi_dashboard_Custom Dash_invalid_type.json',
      ),
    );
    const upload = new Upload();
    const fileUpload = {
      filename: 'invalid-type.json',
      mimetype: 'application/json',
      createReadStream: () => file,
      encoding: 'utf8',
    } as unknown as FileUpload;
    upload.promise = new Promise((executor) => { executor(fileUpload); });
    upload.file = fileUpload;
    const readStream = fileUpload.createReadStream();
    const fileContent = await streamToString(readStream);
    const parsedData = JSON.parse(fileContent.toString());

    expect(() => checkConfigurationImport('dashboard', parsedData)).toThrowError('Invalid type. Please import OpenCTI dashboard-type only');
  });

  it('should verify import version compatibility, given valid import', async () => {
    const file = fs.createReadStream(
      path.resolve(
        __dirname,
        '../../data/20233010_octi_dashboard_Custom Dash_valid.json',
      ),
    );
    const upload = new Upload();
    const fileUpload = {
      filename: 'valid-version.json',
      mimetype: 'application/json',
      createReadStream: () => file,
      encoding: 'utf8',
    } as unknown as FileUpload;
    upload.promise = new Promise((executor) => { executor(fileUpload); });
    upload.file = fileUpload;
    const readStream = fileUpload.createReadStream();
    const fileContent = await streamToString(readStream);
    const parsedData = JSON.parse(fileContent.toString());

    expect(() => checkConfigurationImport('dashboard', parsedData),).not.toThrowError();
  });
});
