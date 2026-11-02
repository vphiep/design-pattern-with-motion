'use client';

import { motion } from 'framer-motion';
import { Copy, Check } from 'lucide-react';
import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils/cn';
import { useLocale } from './LocaleProvider';
import type { CodeLanguage } from '@/lib/courses/types';

interface CodeBlockProps {
  code: string;
  language?: CodeLanguage;
  caption?: string;
  filename?: string;
  className?: string;
  showCopy?: boolean;
  highlightLines?: [number, number] | null;
  onLineHover?: (line: number | null) => void;
}

/**
 * Syntax-highlighted code block (Java by default). Uses Shiki on mount to produce HTML.
 * The container manages its own light/dark Shiki theme via CSS variables.
 */
export function CodeBlock({
  code,
  language = 'java',
  caption,
  filename,
  className,
  showCopy = true,
  highlightLines = null,
  onLineHover
}: CodeBlockProps) {
  const { ui } = useLocale();
  const [html, setHtml] = useState<string>('');
  const [copied, setCopied] = useState(false);
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const root = document.documentElement;
    setIsDark(root.classList.contains('dark'));
    const observer = new MutationObserver(() => {
      setIsDark(root.classList.contains('dark'));
    });
    observer.observe(root, { attributes: true, attributeFilter: ['class'] });
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    let cancelled = false;
    import('shiki').then(({ codeToHtml }) => {
      if (cancelled) return;
      return codeToHtml(code, {
        lang: language,
        theme: isDark ? 'github-dark' : 'github-light',
        transformers: [
          {
            pre(node) {
              node.properties.style = `background: transparent; padding: 0; margin: 0;`;
            },
            line(node, line) {
              const [a, b] = highlightLines ?? [0, -1];
              if (line >= a && line <= b) {
                const prev = (node.properties.class as string) || '';
                node.properties.class = `${prev} line-highlight`.trim();
              }
              node.properties['data-line'] = String(line);
            }
          }
        ]
      }).then((out) => {
        if (!cancelled) setHtml(out);
      });
    });
    return () => {
      cancelled = true;
    };
  }, [code, language, isDark, highlightLines]);

  const onCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      /* ignore */
    }
  };

  return (
    <figure
      className={cn(
        'relative border-hairline bg-surface',
        'shadow-editorial dark:shadow-editorial-dark',
        className
      )}
    >
      {(filename || caption) && (
        <figcaption className="flex items-center justify-between border-b border-border-soft px-4 py-2">
          <span className="caption">{filename ?? `example.${language}`}</span>
          {caption && <span className="text-xs text-text-soft">{caption}</span>}
        </figcaption>
      )}

      <div className="relative">
        {html ? (
          <div
            className={cn(
              'overflow-x-auto p-4 text-sm leading-relaxed',
              'font-mono [&_pre]:!bg-transparent [&_code]:font-mono'
            )}
            onMouseOver={(e) => {
              if (!onLineHover) return;
              const t = (e.target as HTMLElement).closest('[data-line]');
              if (t) onLineHover(Number(t.getAttribute('data-line')));
            }}
            onMouseLeave={() => onLineHover?.(null)}
            dangerouslySetInnerHTML={{ __html: html }}
          />
        ) : (
          <pre className="overflow-x-auto p-4 font-mono text-sm leading-relaxed text-text">
            {code}
          </pre>
        )}

        {showCopy && (
          <motion.button
            type="button"
            onClick={onCopy}
            whileHover={{ y: -1 }}
            whileTap={{ scale: 0.94 }}
            transition={{ duration: 0.18 }}
            className={cn(
              'absolute right-3 top-3 inline-flex items-center gap-1.5 border-hairline bg-bg',
              'px-2 py-1 text-xs text-text-muted transition-colors duration-200',
              copied ? 'border-accent bg-accent text-bg animate-bounce-subtle' : 'hover:bg-accent hover:text-bg'
            )}
            aria-label={ui.codeBlock.copyAria}
          >
            <motion.span
              key={copied ? 'check' : 'copy'}
              initial={{ opacity: 0, y: -2 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex"
            >
              {copied ? <Check size={12} /> : <Copy size={12} />}
            </motion.span>
            <span className="font-mono uppercase tracking-widest">
              {copied ? ui.codeBlock.copied : ui.codeBlock.copy}
            </span>
          </motion.button>
        )}
      </div>
    </figure>
  );
}
