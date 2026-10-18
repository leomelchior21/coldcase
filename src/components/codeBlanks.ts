import { Decoration, EditorView, MatchDecorator, ViewPlugin, WidgetType } from '@codemirror/view';

class AnswerBlank extends WidgetType {
  constructor(readonly name: string) { super(); }
  eq(other: AnswerBlank) { return this.name === other.name; }
  toDOM(view: EditorView) {
    const field = document.createElement('span');
    const calculation = this.name === 'result';
    field.className = `code-answer-blank ${calculation ? 'calculation-blank' : ''}`;
    field.dataset.variable = this.name;
    field.setAttribute('role', 'button');
    field.setAttribute('aria-label', calculation ? 'Enter calculation for result' : `Enter value for ${this.name}`);
    field.title = calculation ? 'Click here and type your calculation' : 'Click here and type the clue value';
    field.tabIndex = 0;
    const label = document.createElement('span');
    label.setAttribute('aria-hidden', 'true');
    label.textContent = calculation ? 'your calculation' : 'value';
    field.append(label);
    const activate = (event: Event) => {
      event.preventDefault();
      // Earlier edits move this decoration; resolve its current position on activation.
      view.dispatch({ selection: { anchor: view.posAtDOM(field) }, scrollIntoView: true });
      view.focus();
    };
    field.addEventListener('mousedown', activate);
    field.addEventListener('click', activate);
    field.addEventListener('keydown', event => {
      if (event.key === 'Enter' || event.key === ' ') activate(event);
    });
    return field;
  }
  ignoreEvent() { return true; }
}

// A visual affordance only: neither the label nor an answer enters saved code.
const blanks = new MatchDecorator({
  regexp: /^(?:int\s+)?([A-Za-z_]\w*)\s*=\s*;?\s*$/gm,
  decorate(add, from, _to, match) {
    const position = from + match[0].indexOf('=') + 1;
    add(position, position, Decoration.widget({ widget: new AnswerBlank(match[1]), side: 1 }));
  },
});

export const glowingAnswers = ViewPlugin.fromClass(class {
  decorations;
  constructor(view: EditorView) { this.decorations = blanks.createDeco(view); }
  update(update: import('@codemirror/view').ViewUpdate) { this.decorations = blanks.updateDeco(update, this.decorations); }
}, { decorations: plugin => plugin.decorations });
