import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import styled from 'styled-components';

const MarkdownWrapper = styled.div`
  font-size: 14px;
  line-height: 1.6;
  color: #2b2b2b;
  word-break: break-word;

  p {
    margin-bottom: 0.8em;
    &:last-child {
      margin-bottom: 0;
    }
  }

  h1,
  h2,
  h3,
  h4,
  h5,
  h6 {
    margin-top: 1.2em;
    margin-bottom: 0.5em;
    font-weight: 700;
    line-height: 1.3;
    color: #111827;
  }

  h1 {
    font-size: 1.4em;
    border-bottom: 1px solid #eaecef;
    padding-bottom: 0.3em;
  }
  h2 {
    font-size: 1.25em;
    border-bottom: 1px solid #eaecef;
    padding-bottom: 0.3em;
  }
  h3 {
    font-size: 1.1em;
  }

  ul,
  ol {
    padding-left: 1.5em;
    margin-bottom: 0.8em;
  }

  blockquote {
    margin: 0.8em 0;
    padding: 0.5em 1em;
    color: #555;
    background-color: #f8f9fa;
    border-left: 4px solid #0056b3;
    border-radius: 2px;
  }

  code {
    padding: 0.2em 0.4em;
    margin: 0;
    font-size: 85%;
    background-color: rgba(175, 184, 193, 0.2);
    border-radius: 4px;
    font-family: monospace;
  }

  pre {
    padding: 12px;
    overflow: auto;
    font-size: 85%;
    background-color: #f6f8fa;
    border-radius: 6px;
    margin: 0.8em 0;

    code {
      padding: 0;
      background-color: transparent;
    }
  }

  table {
    border-collapse: collapse;
    width: 100%;
    margin: 0.8em 0;

    th,
    td {
      border: 1px solid #dfe2e5;
      padding: 6px 13px;
      text-align: left;
    }

    th {
      background-color: #f6f8fa;
      font-weight: 600;
    }
  }
`;

export const MarkdownView = ({ content, className }) => {
  if (!content || !content.trim()) {
    return null;
  }

  return (
    <MarkdownWrapper className={className}>
      <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>
    </MarkdownWrapper>
  );
};

export default MarkdownView;
