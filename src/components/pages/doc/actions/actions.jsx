'use client';

import PropTypes from 'prop-types';
import { useState } from 'react';

import Link from 'components/shared/link';
import ArrowBackToTopIcon from 'icons/arrow-back-to-top.inline.svg';
import GitHubIcon from 'icons/github.inline.svg';
import StarIcon from 'icons/docs/star.inline.svg';
import { cn } from 'utils/cn';
import sendGtagEvent from 'utils/send-gtag-event';

import NeonInitModal from '../neon-init-modal';

export const ActionItem = ({
  icon: Icon,
  text,
  url,
  onClick,
  iconClassName,
  tooltip,
  className,
}) => {
  const Tag = url ? Link : 'button';

  return (
    <div className="group relative">
      <Tag
        className={cn(
          'relative flex h-3.5 w-full items-center justify-between rounded-sm text-gray-new-40',
          'transition-colors duration-200 hover:text-black-pure',
          'dark:text-gray-new-70 dark:hover:text-white',
          className
        )}
        to={url}
        target={url ? '_blank' : undefined}
        rel={url ? 'noopener noreferrer' : undefined}
        icon={url ? 'external' : undefined}
        onClick={onClick}
      >
        <div className="flex items-center gap-x-2">
          <Icon className={cn(`size-3.5`, iconClassName)} />
          <span className="text-sm leading-none tracking-extra-tight">{text}</span>
        </div>
      </Tag>
      {tooltip && (
        <span
          className={cn(
            'pointer-events-none absolute top-full left-0 z-10 mt-1.5 whitespace-nowrap',
            'rounded-md bg-gray-new-8 px-2 py-1 text-xs text-white opacity-0',
            'transition-opacity duration-150 group-hover:opacity-100',
            'dark:bg-gray-new-90 dark:text-gray-new-8'
          )}
        >
          {tooltip}
        </span>
      )}
    </div>
  );
};

ActionItem.propTypes = {
  icon: PropTypes.elementType.isRequired,
  text: PropTypes.string.isRequired,
  url: PropTypes.string,
  onClick: PropTypes.func,
  iconClassName: PropTypes.string,
  tooltip: PropTypes.string,
  className: PropTypes.string,
};

const SetUpNeonButton = ({ onClick }) => (
  <ActionItem icon={StarIcon} text="Set up Neon with your AI" onClick={onClick} />
);

SetUpNeonButton.propTypes = {
  onClick: PropTypes.func.isRequired,
};

/* Disabled for now - kept for possible future use
const CopyMCPServerButton = () => {
  const [status, setStatus] = useState('default'); // 'default' | 'copied' | 'failed'
  const mcpServerUrl = 'https://mcp.neon.tech/mcp';

  const getButtonText = () => {
    if (status === 'failed') return 'Failed to copy';
    if (status === 'copied') return 'Copied!';
    return 'Copy MCP Server';
  };

  const copyServerUrl = () => {
    try {
      copyToClipboard(mcpServerUrl);
      setStatus('copied');
      setTimeout(() => {
        setStatus('default');
      }, 2000);
    } catch (error) {
      setStatus('failed');
      setTimeout(() => {
        setStatus('default');
      }, 2000);
    }
  };

  return (
    <ActionItem
      icon={MarkdownIcon}
      text={getButtonText()}
      onClick={status === 'copied' ? undefined : copyServerUrl}
      tooltip="Copy the Neon MCP server URL"
    />
  );
};
*/

const Actions = ({ gitHubPath, withBorder = false, isTemplate = false }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const githubBase = process.env.NEXT_PUBLIC_GITHUB_PATH;

  const gitHubLink = `${githubBase}${gitHubPath}`;
  const backToTop = () => window.scrollTo({ top: 0, behavior: 'smooth' });

  const handleOpenModal = () => {
    setIsModalOpen(true);
    sendGtagEvent('Action Clicked', { text: 'Set up Neon with your AI', tag_name: 'DocsSidebar' });
  };

  const docsActions = <SetUpNeonButton onClick={handleOpenModal} />;

  const templateActions = (
    <>
      <ActionItem
        icon={GitHubIcon}
        text="Suggest edits"
        url={gitHubLink}
        tooltip="Propose changes to this page"
        onClick={() =>
          sendGtagEvent('Action Clicked', { text: 'Suggest edits', tag_name: 'DocsSidebar' })
        }
      />
      <ActionItem
        icon={ArrowBackToTopIcon}
        text="Back to top"
        tooltip="Scroll to the top of the page"
        onClick={backToTop}
      />
    </>
  );

  return (
    <>
      <div
        className={cn(
          'flex flex-col gap-3.5',
          withBorder && 'mt-5 border-t border-gray-new-90 pt-5 dark:border-gray-new-20'
        )}
      >
        {isTemplate ? templateActions : docsActions}
      </div>
      <NeonInitModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </>
  );
};

Actions.propTypes = {
  gitHubPath: PropTypes.string.isRequired,
  withBorder: PropTypes.bool,
  isTemplate: PropTypes.bool,
};

export default Actions;
