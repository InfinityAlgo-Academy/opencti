import React, { FunctionComponent, useState } from 'react';
import { AutoAwesomeOutlined } from '@mui/icons-material';
import IconButton from '@mui/material/IconButton';
import InputAdornment from '@mui/material/InputAdornment';
import MenuItem from '@mui/material/MenuItem';
import Menu from '@mui/material/Menu';
import { v4 as uuid } from 'uuid';
import { graphql, useMutation } from 'react-relay';
import Dialog from '@mui/material/Dialog';
import { DialogTitle } from '@mui/material';
import DialogContent from '@mui/material/DialogContent';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Select from '@mui/material/Select';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';
import useAI from '../../../../utils/hooks/useAI';
import useEnterpriseEdition from '../../../../utils/hooks/useEnterpriseEdition';
import ResponseDialog from '../../../../utils/ai/ResponseDialog';
import { useFormatter } from '../../../../components/i18n';
import EETooltip from '../entreprise_edition/EETooltip';

// region types
interface TextFieldAskAiProps {
  currentValue: string;
  setFieldValue: (value: string) => void;
  format: 'text' | 'html' | 'markdown';
  variant: 'markdown' | null;
}

const textFieldAskAIFixSpellingMutation = graphql`
  mutation TextFieldAskAIFixSpellingMutation($id: ID!, $content: String!, $format: Format) {
    aiFixSpelling(id: $id, content: $content, format: $format)
  }
`;

const textFieldAskAIMakeShorterMutation = graphql`
  mutation TextFieldAskAIMakeShorterMutation($id: ID!, $content: String!, $format: Format) {
    aiMakeShorter(id: $id, content: $content, format: $format)
  }
`;

const textFieldAskAIMakeLongerMutation = graphql`
  mutation TextFieldAskAIMakeLongerMutation($id: ID!, $content: String!, $format: Format) {
    aiMakeLonger(id: $id, content: $content, format: $format)
  }
`;

const textFieldAskAIChangeToneMutation = graphql`
  mutation TextFieldAskAIChangeToneMutation($id: ID!, $content: String!, $format: Format, $tone: Tone) {
    aiChangeTone(id: $id, content: $content, format: $format, tone: $tone)
  }
`;

const textFieldAskAISummarizeMutation = graphql`
  mutation TextFieldAskAISummarizeMutation($id: ID!, $content: String!, $format: Format) {
    aiSummarize(id: $id, content: $content, format: $format)
  }
`;

const textFieldAskAIExplainMutation = graphql`
  mutation TextFieldAskAIExplainMutation($id: ID!, $content: String!) {
    aiExplain(id: $id, content: $content)
  }
`;

const TextFieldAskAI: FunctionComponent<TextFieldAskAiProps> = ({ currentValue, setFieldValue, variant, format = 'text' }) => {
  const { t_i18n } = useFormatter();
  const isEnterpriseEdition = useEnterpriseEdition();
  const { enabled, configured } = useAI();
  const [disableResponse, setDisableResponse] = useState(false);
  const [openToneOptions, setOpenToneOptions] = useState(false);
  const [tone, setTone] = useState<'technical' | 'tactical' | 'strategical'>('technical');
  const [isAcceptable, setIsAcceptable] = useState(true);
  const [menuOpen, setMenuOpen] = useState<{ open: boolean; anchorEl: HTMLButtonElement | null; }>({ open: false, anchorEl: null });
  const [busId, setBusId] = useState<string | null>(null);
  const [displayAskAI, setDisplayAskAI] = useState(false);
  const handleOpenMenu = (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    if (isEnterpriseEdition) {
      event.preventDefault();
      setMenuOpen({ open: true, anchorEl: event.currentTarget });
    }
  };
  const handleCloseMenu = () => {
    setMenuOpen({ open: false, anchorEl: null });
  };
  const handleOpenToneOptions = () => {
    handleCloseMenu();
    setOpenToneOptions(true);
  };
  const handleCloseToneOptions = () => setOpenToneOptions(false);
  const handleOpenAskAI = () => setDisplayAskAI(true);
  const handleCloseAskAI = () => setDisplayAskAI(false);
  const [commitMutationFixSpelling] = useMutation(textFieldAskAIFixSpellingMutation);
  const [commitMutationMakeShorter] = useMutation(textFieldAskAIMakeShorterMutation);
  const [commitMutationMakeLonger] = useMutation(textFieldAskAIMakeLongerMutation);
  const [commitMutationChangeTone] = useMutation(textFieldAskAIChangeToneMutation);
  const [commitMutationSummarize] = useMutation(textFieldAskAISummarizeMutation);
  const [commitMutationExplain] = useMutation(textFieldAskAIExplainMutation);
  const handleAskAi = (action: string, canBeAccepted = true) => {
    setDisableResponse(true);
    handleCloseMenu();
    const id = uuid();
    setBusId(id);
    setIsAcceptable(canBeAccepted);
    handleOpenAskAI();
    switch (action) {
      case 'spelling':
        commitMutationFixSpelling({
          variables: {
            id,
            content: currentValue,
            format,
          },
          onCompleted: () => {
            setDisableResponse(false);
          },
        });
        break;
      case 'shorter':
        commitMutationMakeShorter({
          variables: {
            id,
            content: currentValue,
            format,
          },
          onCompleted: () => {
            setDisableResponse(false);
          },
        });
        break;
      case 'longer':
        commitMutationMakeLonger({
          variables: {
            id,
            content: currentValue,
            format,
          },
          onCompleted: () => {
            setDisableResponse(false);
          },
        });
        break;
      case 'tone':
        commitMutationChangeTone({
          variables: {
            id,
            content: currentValue,
            format,
            tone,
          },
          onCompleted: () => {
            setDisableResponse(false);
          },
        });
        break;
      case 'summarize':
        commitMutationSummarize({
          variables: {
            id,
            content: currentValue,
            format,
          },
          onCompleted: () => {
            setDisableResponse(false);
          },
        });
        break;
      case 'explain':
        commitMutationExplain({
          variables: {
            id,
            content: currentValue,
          },
          onCompleted: () => {
            setDisableResponse(false);
          },
        });
        break;
      default:
        // do nothing
    }
  };
  const renderButton = () => {
    return (
      <>
        <EETooltip forAi={true} title={t_i18n('Ask AI')}>
          <IconButton
            size="medium"
            color="secondary"
            onClick={(event) => ((isEnterpriseEdition && enabled && configured) ? handleOpenMenu(event) : null)}
            disabled={currentValue.length < 10}
            style={{ marginRight: -10 }}
          >
            <AutoAwesomeOutlined fontSize='medium'/>
          </IconButton>
        </EETooltip>
        <Menu
          id="menu-appbar"
          anchorEl={menuOpen.anchorEl}
          open={menuOpen.open}
          onClose={handleCloseMenu}
        >
          <MenuItem onClick={() => handleAskAi('spelling')}>
            {t_i18n('Fix spelling & grammar')}
          </MenuItem>
          <MenuItem onClick={() => handleAskAi('shorter')}>
            {t_i18n('Make it shorter')}
          </MenuItem>
          <MenuItem onClick={() => handleAskAi('longer')}>
            {t_i18n('Make it longer')}
          </MenuItem>
          <MenuItem onClick={handleOpenToneOptions}>
            {t_i18n('Change tone')}
          </MenuItem>
          <MenuItem onClick={() => handleAskAi('summarize')}>
            {t_i18n('Summarize')}
          </MenuItem>
          <MenuItem onClick={() => handleAskAi('explain', false)}>
            {t_i18n('Explain')}
          </MenuItem>
        </Menu>
        {busId && (
        <ResponseDialog
          id={busId}
          isDisabled={disableResponse}
          isOpen={displayAskAI}
          handleClose={handleCloseAskAI}
          handleAccept={(value) => {
            setFieldValue(value);
            handleCloseAskAI();
          }}
          handleFollowUp={handleCloseAskAI}
          followUpActions={[{ key: 'retry', label: t_i18n('Retry') }]}
          format={format}
          isAcceptable={isAcceptable}
        />
        )}
        <Dialog
          PaperProps={{ elevation: 1 }}
          open={openToneOptions}
          onClose={handleCloseToneOptions}
          fullWidth={true}
          maxWidth="xs"
        >
          <DialogTitle>{t_i18n('Select options')}</DialogTitle>
          <DialogContent>
            <FormControl style={{ width: '100%' }}>
              <InputLabel id="tone">{t_i18n('Tone')}</InputLabel>
              <Select
                labelId="tone"
                value={tone}
                onChange={(event) => setTone(event.target.value as unknown as 'technical' | 'tactical' | 'strategical')}
                fullWidth={true}
              >
                <MenuItem value="technical">{t_i18n('Technical')}</MenuItem>
                <MenuItem value="tactical">{t_i18n('Tactical')}</MenuItem>
                <MenuItem value="strategical">{t_i18n('Strategical')}</MenuItem>
              </Select>
            </FormControl>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseToneOptions}>
              {t_i18n('Cancel')}
            </Button>
            <Button
              onClick={() => {
                handleCloseToneOptions();
                handleAskAi('tone');
              }}
              color="secondary"
            >
              {t_i18n('Generate')}
            </Button>
          </DialogActions>
        </Dialog>
      </>
    );
  };
  if (variant === 'markdown') {
    return (
      <div style={{ position: 'absolute', top: 15, right: 0 }}>
        {renderButton()}
      </div>
    );
  }
  return (
    <InputAdornment position="end">
      {renderButton()}
    </InputAdornment>
  );
};

export default TextFieldAskAI;
