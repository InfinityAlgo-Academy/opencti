import { head } from 'ramda';
import { internalLoadById } from '../../../src/database/grakn';
import {
  deleteFile,
  downloadFile,
  extractName,
  filesListing,
  generateFileExportName,
  getMinIOVersion,
  loadFile,
} from '../../../src/database/minio';
import { listenServer, stopServer } from '../../../src/httpServer';
import { execPython3 } from '../../../src/python/pythonBridge';
import { API_TOKEN, API_URI, PYTHON_PATH } from '../../utils/testQuery';
import { elLoadByIds } from '../../../src/database/elasticSearch';

const streamConverter = (stream) => {
  return new Promise((resolve) => {
    let data = '';
    stream.on('data', (chunk) => {
      data += chunk.toString();
    });
    stream.on('end', () => resolve(data));
  });
};

describe('Minio basic and utils', () => {
  it('should minio in correct version', async () => {
    const minioVersion = await getMinIOVersion();
    expect(minioVersion).toEqual(expect.stringContaining('RELEASE.20'));
  });
  it('should simple name correctly generated', async () => {
    let fileName = extractName(null, null, 'test-filename');
    expect(fileName).toEqual('global/test-filename');
    fileName = extractName('Malware', null, 'test-filename');
    expect(fileName).toEqual('malware/lists/test-filename');
    fileName = generateFileExportName('application/json', { name: 'ExportFileStix' });
    expect(fileName).toEqual(expect.stringContaining('_(ExportFileStix)_null.json'));
    fileName = generateFileExportName('application/json', { name: 'ExportFileStix' }, null, 'full');
    expect(fileName).toEqual(expect.stringContaining('_(ExportFileStix)_full.json'));
  });
  it('should entity export name correctly generated', async () => {
    const type = 'Malware';
    const exportType = 'all';
    const connector = { name: 'ExportFileStix' };
    const maxMarking = { definition: 'TLP:RED' };
    const entity = await internalLoadById('malware--faa5b705-cf44-4e50-8472-29e5fec43c3c');
    const fileExportName = generateFileExportName('application/json', connector, entity, type, exportType, maxMarking);
    const expectedName = '_TLP:RED_(ExportFileStix)_Malware-Paradise Ransomware_all.json';
    expect(fileExportName).toEqual(expect.stringContaining(expectedName));
  });
  it('should list export name correctly generated', async () => {
    const type = 'Attack-Pattern';
    const exportType = 'all';
    const connector = { name: 'ExportFileStix' };
    const maxMarking = { definition: 'TLP:RED' };
    const entity = null;
    const fileExportName = generateFileExportName('application/json', connector, entity, type, exportType, maxMarking);
    const expectedName = '_TLP:RED_(ExportFileStix)_Attack-Pattern.json';
    expect(fileExportName).toEqual(expect.stringContaining(expectedName));
  });
});

describe('Minio file listing', () => {
  let malwareId;
  let exportFileName;
  let exportFileId;
  let importFileId;
  let importOpts;
  it('should resolve the malware', async () => {
    const malware = await elLoadByIds('malware--faa5b705-cf44-4e50-8472-29e5fec43c3c');
    malwareId = malware.internal_id;
    exportFileName = '(ExportFileStix)_Malware-Paradise Ransomware_all.json';
    exportFileId = `export/malware/${malwareId}/${exportFileName}`;
    importFileId = `import/global/${exportFileName}`;
    importOpts = [API_URI, API_TOKEN, malwareId, exportFileName];
  });
  it('should file upload succeed', async () => {
    const httpServer = await listenServer();
    // local exporter create an export and also upload the file as an import
    const execution = await execPython3(PYTHON_PATH, 'local_exporter.py', importOpts);
    expect(execution).not.toBeNull();
    expect(execution.status).toEqual('success');
    await stopServer(httpServer);
  });
  it('should file listing', async () => {
    const entity = { id: malwareId };
    let list = await filesListing(25, 'export', 'Malware', entity);
    expect(list).not.toBeNull();
    expect(list.edges.length).toEqual(1);
    let file = head(list.edges).node;
    expect(file.id).toEqual(exportFileId);
    expect(file.name).toEqual(exportFileName);
    expect(file.size).toEqual(8411);
    expect(file.metaData).not.toBeNull();
    expect(file.metaData['content-type']).toEqual('application/octet-stream');
    expect(file.metaData.category).toEqual('export');
    expect(file.metaData.encoding).toEqual('7bit');
    expect(file.metaData.filename).toEqual(exportFileName.replace(/\s/g, '%20'));
    expect(file.metaData.mimetype).toEqual('text/plain');
    list = await filesListing(25, 'import');
    expect(list).not.toBeNull();
    expect(list.edges.length).toEqual(1);
    file = head(list.edges).node;
    expect(file.id).toEqual(importFileId);
    expect(file.size).toEqual(8411);
    expect(file.name).toEqual(exportFileName);
  });
  it('should file download', async () => {
    const fileStream = await downloadFile(exportFileId);
    expect(fileStream).not.toBeNull();
    const data = await streamConverter(fileStream);
    expect(data).not.toBeNull();
    const jsonData = JSON.parse(data);
    expect(jsonData).not.toBeNull();
    expect(jsonData.objects.length).toEqual(8);
    const user = head(jsonData.objects);
    expect(user.name).toEqual('Paradise Ransomware');
  });
  it('should load file', async () => {
    const file = await loadFile(exportFileId);
    expect(file).not.toBeNull();
    expect(file.id).toEqual(exportFileId);
    expect(file.name).toEqual(exportFileName);
    expect(file.size).toEqual(8411);
  });
  it('should delete file', async () => {
    let deleted = await deleteFile({ user_email: 'test@opencti.io' }, exportFileId);
    expect(deleted).toBeTruthy();
    deleted = await deleteFile({ user_email: 'test@opencti.io' }, importFileId);
    expect(deleted).toBeTruthy();
  });
});
