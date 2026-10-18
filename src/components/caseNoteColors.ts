import { Decoration, MatchDecorator, ViewPlugin, type EditorView, type ViewUpdate } from '@codemirror/view';

/** Color the guidance without changing the comments students save or execute. */
export function caseNoteColors(variableNames: string[]) {
  const names = new Set([...variableNames, 'result']);
  const comments = new MatchDecorator({
    regexp: /^\s*(?:#|\/\/)[^\n]*/gm,
    decorate(add, from, to, match) {
      const line = match[0];
      const instruction = line.replace(/^\s*(?:#|\/\/)\s*/, '');
      // Entire instructions connect the declaration and clue value to editor colors.
      if (/^Create the variable\b/.test(instruction)) {
        add(from, to, Decoration.mark({ class: 'note-variable' }));
      } else if (/^(?:The |Brian was |Set it to )/.test(instruction)) {
        add(from, to, Decoration.mark({ class: 'note-value' }));
      }
      // Keep names, numbers and operations recognizable in the calculation guidance too.
      for (const token of line.matchAll(/\b[A-Za-z_]\w*\b|\b\d+\b/g)) {
        const word = token[0];
        const color = names.has(word) ? 'variable'
          : /^\d+$/.test(word) ? 'value'
          : /^(?:Divide|Multiply|Subtract|Add|subtract|print|Console|WriteLine)$/.test(word) ? 'operation'
          : null;
        if (color) add(from + token.index!, from + token.index! + word.length, Decoration.mark({ class: `note-${color}` }));
      }
    },
  });
  return ViewPlugin.fromClass(class {
    decorations;
    constructor(view: EditorView) { this.decorations = comments.createDeco(view); }
    update(update: ViewUpdate) { this.decorations = comments.updateDeco(update, this.decorations); }
  }, { decorations: plugin => plugin.decorations });
}
