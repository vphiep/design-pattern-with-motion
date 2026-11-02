'use client';

import { useMemo } from 'react';
import katex from 'katex';
import { cn } from '@/lib/utils/cn';

interface MathFormulaProps {
  formula: string;
  displayMode?: boolean;
  className?: string;
}

export function MathFormula({
  formula,
  displayMode = true,
  className = ''
}: MathFormulaProps) {
  const renderedHtml = useMemo(() => {
    if (!formula) return '';
    try {
      return katex.renderToString(formula, {
        displayMode,
        throwOnError: false,
        output: 'htmlAndMathml'
      });
    } catch {
      return formula;
    }
  }, [formula, displayMode]);

  return (
    <div
      className={cn('katex-math-container overflow-x-auto select-text', className)}
      dangerouslySetInnerHTML={{ __html: renderedHtml }}
    />
  );
}
