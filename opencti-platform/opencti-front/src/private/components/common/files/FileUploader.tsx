import React, { FunctionComponent, useRef, useState } from 'react';
import { graphql } from 'react-relay';
import { CloudUploadOutlined } from '@mui/icons-material';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import CircularProgress from '@mui/material/CircularProgress';
import { File } from 'mdi-material-ui';
import { commitMutation, MESSAGING$ } from '../../../../relay/environment';
import { useFormatter } from '../../../../components/i18n';
import { FileUploaderEntityMutation$data } from './__generated__/FileUploaderEntityMutation.graphql';
import { FileUploaderGlobalMutation$data } from './__generated__/FileUploaderGlobalMutation.graphql';
import FileImportMarkingSelectionPopup from './FileImportMarkingSelectionPopup';

const fileUploaderGlobalMutation = graphql`
    mutation FileUploaderGlobalMutation($file: Upload!, $fileMarkings: [String]) {
        uploadImport(file: $file, fileMarkings: $fileMarkings) {
            id
            ...FileLine_file
        }
    }
`;

const fileUploaderEntityMutation = graphql`
    mutation FileUploaderEntityMutation($id: ID!, $file: Upload!, $fileMarkings: [String]) {
        stixCoreObjectEdit(id: $id) {
            importPush(file: $file, fileMarkings: $fileMarkings) {
                id
                ...FileLine_file
                metaData {
                    entity {
                        ... on StixObject {
                            id
                        }
                        ... on StixDomainObject {
                            ...PictureManagementViewer_entity
                        }
                    }
                }
            }
        }
    }
`;

interface FileUploaderProps {
  entityId: string;
  onUploadSuccess: (id?: string) => unknown;
  accept?: string;
  size: 'small' | 'large' | 'medium' | undefined;
  nameInCallback?: boolean;
}

const FileUploader: FunctionComponent<FileUploaderProps> = ({
  entityId,
  onUploadSuccess,
  accept,
  size,
  nameInCallback,
}) => {
  const { t_i18n } = useFormatter();
  const uploadRef = useRef<HTMLInputElement | null>(null);
  const [upload, setUpload] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File>();
  const handleOpenUpload = () => uploadRef.current?.click();

  const closeFileImportMarkingSelectionPopup = () => setSelectedFile(undefined);

  const handleUpload = (fileMarkings: string[]) => {
    if (!selectedFile) return;
    commitMutation({
      mutation: entityId
        ? fileUploaderEntityMutation
        : fileUploaderGlobalMutation,
      variables: { file: selectedFile, fileMarkings, id: entityId },
      optimisticUpdater: () => {
        setUpload(selectedFile.name);
      },
      onCompleted: (
        result:
        | FileUploaderEntityMutation$data
        | FileUploaderGlobalMutation$data,
      ) => {
        if (uploadRef.current?.value) {
          uploadRef.current.value = ''; // Reset the upload input
        }
        setUpload(null);
        MESSAGING$.notifySuccess(t_i18n('File successfully uploaded'));
        const fileId = entityId
          ? (result as FileUploaderEntityMutation$data).stixCoreObjectEdit
            ?.importPush?.id
          : (result as FileUploaderGlobalMutation$data).uploadImport?.id;
        if (nameInCallback) {
          onUploadSuccess(fileId);
        } else {
          onUploadSuccess();
        }
      },
      updater: undefined,
      optimisticResponse: undefined,
      onError: undefined,
      setSubmitting: true,
    });
  };

  const hasSelectedFile = !!selectedFile;

  return (
    <React.Fragment>
      {accept ? (
        <input
          ref={uploadRef}
          type="file"
          style={{ display: 'none' }}
          onChange={({ target: { validity, files } }) => {
            const file = files?.item(0);
            if (file && validity.valid) setSelectedFile(file);
          }}
          accept={accept}
        />
      ) : (
        <input
          ref={uploadRef}
          type="file"
          style={{ display: 'none' }}
          onChange={({ target: { validity, files } }) => {
            const file = files?.item(0);
            if (file && validity.valid) setSelectedFile(file);
          }}
        />
      )}
      {hasSelectedFile && (
        <FileImportMarkingSelectionPopup
          isOpen={hasSelectedFile}
          handleUpload={handleUpload}
          closePopup={closeFileImportMarkingSelectionPopup}
        />
      )}
      {upload ? (
        <Tooltip
          title={`Uploading ${upload}`}
          aria-label={`Uploading ${upload}`}
        >
          <IconButton disabled={true} size={size || 'large'}>
            <CircularProgress
              size={24}
              thickness={2}
              color="primary"
            />
          </IconButton>
        </Tooltip>
      ) : (
        <Tooltip title={t_i18n('Select your file')} aria-label="Select your file">
          <IconButton
            onClick={handleOpenUpload}
            aria-haspopup="true"
            color="primary"
            size={size || 'large'}
          >
            <CloudUploadOutlined />
          </IconButton>
        </Tooltip>
      )}
    </React.Fragment>
  );
};

export default FileUploader;
