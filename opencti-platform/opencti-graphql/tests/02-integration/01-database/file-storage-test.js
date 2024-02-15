import { expect, it, describe } from 'vitest';
import { head } from 'ramda';
import { deleteFile, downloadFile, loadFile } from '../../../src/database/file-storage';
import { execChildPython } from '../../../src/python/pythonBridge';
import { ADMIN_USER, testContext, API_TOKEN, API_URI, PYTHON_PATH } from '../../utils/testQuery';
import { elLoadById } from '../../../src/database/engine';
import { allFilesForPaths, paginatedForPathWithEnrichment } from '../../../src/modules/internal/document/document-domain';
import { utcDate } from '../../../src/utils/format';

const streamConverter = (stream) => {
  return new Promise((resolve) => {
    let data = '';
    stream.on('data', (chunk) => {
      data += chunk.toString();
    });
    stream.on('end', () => resolve(data));
  });
};

const exportFileName = '(ExportFileStix)_Malware-Paradise Ransomware_all.json';
const exportFileId = (malware) => `export/Malware/${malware.id}/${exportFileName}`;
const importFileId = `import/global/${exportFileName}`;

describe('File storage file listing', () => {
  it('should file upload succeed', async () => {
    const malware = await elLoadById(testContext, ADMIN_USER, 'malware--faa5b705-cf44-4e50-8472-29e5fec43c3c');
    const importOpts = [API_URI, API_TOKEN, malware.id, exportFileName];
    // local exporter create an export and also upload the file as an import
    const execution = await execChildPython(testContext, ADMIN_USER, PYTHON_PATH, 'local_exporter.py', importOpts);
    expect(execution).not.toBeNull();
    expect(execution.status).toEqual('success');
  });
  it('should paginate file listing', async () => {
    const malware = await elLoadById(testContext, ADMIN_USER, 'malware--faa5b705-cf44-4e50-8472-29e5fec43c3c');
    let list = await paginatedForPathWithEnrichment(testContext, ADMIN_USER, `export/Malware/${malware.id}`, malware.id, { first: 25 });
    expect(list).not.toBeNull();
    expect(list.edges.length).toEqual(1);
    let file = head(list.edges).node;
    expect(file.id).toEqual(exportFileId(malware));
    expect(file.name).toEqual(exportFileName);
    expect(file.size).toEqual(10700);
    expect(file.metaData).not.toBeNull();
    expect(file.metaData.encoding).toEqual('7bit');
    expect(file.metaData.filename).toEqual(exportFileName.replace(/\s/g, '%20'));
    expect(file.metaData.mimetype).toEqual('application/json');
    list = await paginatedForPathWithEnrichment(testContext, ADMIN_USER, 'import/global', undefined, { first: 25 });
    expect(list).not.toBeNull();
    expect(list.edges.length).toEqual(1);
    file = head(list.edges).node;
    expect(file.id).toEqual(importFileId);
    expect(file.size).toEqual(10700);
    expect(file.name).toEqual(exportFileName);
  });
  it('should all file listing', async () => {
    const malware = await elLoadById(testContext, ADMIN_USER, 'malware--faa5b705-cf44-4e50-8472-29e5fec43c3c');
    const paths = [`export/Malware/${malware.id}`];
    // Global search
    let files = await allFilesForPaths(testContext, ADMIN_USER, paths);
    expect(files.length).toEqual(1);
    // Mime type filtering
    files = await allFilesForPaths(testContext, ADMIN_USER, paths, { prefixMimeTypes: ['application'] });
    expect(files.length).toEqual(1);
    files = await allFilesForPaths(testContext, ADMIN_USER, paths, { prefixMimeTypes: ['image'] });
    expect(files.length).toEqual(0);
    // Entity id filtering
    files = await allFilesForPaths(testContext, ADMIN_USER, ['export/Malware'], { entity_id: malware.id });
    expect(files.length).toEqual(1);
    files = await allFilesForPaths(testContext, ADMIN_USER, ['export/Malware'], { entity_id: 'unknow_id' });
    expect(files.length).toEqual(0);
    // maxFileSize filtering
    files = await allFilesForPaths(testContext, ADMIN_USER, ['export/Malware'], { maxFileSize: 10700 });
    expect(files.length).toEqual(1);
    files = await allFilesForPaths(testContext, ADMIN_USER, ['export/Malware'], { maxFileSize: 1692 });
    expect(files.length).toEqual(0);
    // modifiedSince filtering
    const oneMinuteAgo = utcDate().subtract(5, 'minutes');
    files = await allFilesForPaths(testContext, ADMIN_USER, paths, { modifiedSince: oneMinuteAgo.toISOString() });
    expect(files.length).toEqual(1);
    files = await allFilesForPaths(testContext, ADMIN_USER, paths, { modifiedSince: utcDate().toISOString() });
    expect(files.length).toEqual(0);
    // excludedPaths filtering
    files = await allFilesForPaths(testContext, ADMIN_USER, ['export']);
    expect(files.length).toEqual(1);
    files = await allFilesForPaths(testContext, ADMIN_USER, ['export'], { excludedPaths: ['export/Malware'] });
    expect(files.length).toEqual(0);
  });
  it('should file download', async () => {
    const malware = await elLoadById(testContext, ADMIN_USER, 'malware--faa5b705-cf44-4e50-8472-29e5fec43c3c');
    const fileStream = await downloadFile(exportFileId(malware));
    expect(fileStream).not.toBeNull();
    const data = await streamConverter(fileStream);
    expect(data).not.toBeNull();
    const jsonData = JSON.parse(data);
    expect(jsonData).not.toBeNull();
    expect(jsonData.objects.length).toEqual(9);
    const user = head(jsonData.objects);
    expect(user.name).toEqual('Paradise Ransomware');
  });
  it('should load file', async () => {
    const malware = await elLoadById(testContext, ADMIN_USER, 'malware--faa5b705-cf44-4e50-8472-29e5fec43c3c');
    const file = await loadFile(ADMIN_USER, exportFileId(malware));
    expect(file).not.toBeNull();
    expect(file.id).toEqual(exportFileId(malware));
    expect(file.name).toEqual(exportFileName);
    expect(file.size).toEqual(10700);
  });
  it('should delete file', async () => {
    const malware = await elLoadById(testContext, ADMIN_USER, 'malware--faa5b705-cf44-4e50-8472-29e5fec43c3c');
    let deleted = await deleteFile(testContext, ADMIN_USER, exportFileId(malware));
    expect(deleted).toBeTruthy();
    deleted = await deleteFile(testContext, ADMIN_USER, importFileId);
    expect(deleted).toBeTruthy();
  });
});
