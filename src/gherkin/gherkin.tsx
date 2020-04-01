import * as React from "react";
import * as ReactDOM from "react-dom";
import * as SDK from "azure-devops-extension-sdk";
import { IWorkItemFormService, WorkItemTrackingServiceIds } from "azure-devops-extension-api/WorkItemTracking";
import MonacoEditor from 'react-monaco-editor';
import * as monacoEditor from 'monaco-editor/esm/vs/editor/editor.api';

const Gherkin = () => {

  const [gherkin, setGherkin] = React.useState("");
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {

    async function init() {
      await SDK.init({loaded: false});
      setLoading(false);
      await SDK.notifyLoadSucceeded();
    }

    init();

  },[])

  const onEditorDidMount = async (editor: monacoEditor.editor.IStandaloneCodeEditor, monaco: typeof monacoEditor) => {

    const workItemFormService = await SDK.getService<IWorkItemFormService>(
      WorkItemTrackingServiceIds.WorkItemFormService
    );

    // The WIF field. Note: NOT the same thing as the Input Field Name
    // Todo: initially create this!
    const gherkin: any = await workItemFormService.getFieldValue("GherkinField"); 

    setGherkin(gherkin);
  }

  const onEditorWillMount = (monaco: typeof monacoEditor) => {

    const language = 'gherkin';
    const theme = 'gherkin-theme';

    monaco.languages.register({ id: language });

    monaco.languages.setMonarchTokensProvider(language, {
      tokenizer: {
        root: [
          { regex: /^(\s)*Feature/, action: { token: "keyword" } },
          { regex: /^(\s)*Background/, action: { token: "keyword" } },
          { regex: /^(\s)*ScenarioOutline/, action: { token: "keyword" } },
          { regex: /^(\s)*ScenarioTemplate/, action: { token: "keyword" } },
          { regex: /^(\s)*Scenario/, action: { token: "keyword" } },
          { regex: /^(\s)*Examples/, action: { token: "keyword" } },
          { regex: /^(\s)*Rule/, action: { token: "keyword" } },
          { regex: /^(\s)*Given/, action: { token: "keyword" } },
          { regex: /^(\s)*When/, action: { token: "keyword" } },
          { regex: /^(\s)*Then/, action: { token: "keyword" } },
          { regex: /^(\s)*And/, action: { token: "keyword" } },
          { regex: /^(\s)*But/, action: { token: "keyword" } },
          { regex: /('[a-zA-Z0-9\s--_]+')/, action: { token: "string" } },
          { regex: /(#).*$/, action: { token: 'comment' } },
        ]
      }
    });

    monaco.editor.defineTheme(theme, {
      base: 'vs',
      inherit: true,
      rules: [],
      colors: {}
    });

    monaco.languages.setLanguageConfiguration(language, {
      comments: {
        lineComment: '#'
      },
      indentationRules: {
        increaseIndentPattern: /^(\s)*(Given|When|Then)/,
        decreaseIndentPattern: /^(\s)*(Given|When|Then)/,
      }
    });

    monaco.languages.registerCompletionItemProvider(language, {
      provideCompletionItems: (model: monacoEditor.editor.ITextModel, position: monacoEditor.Position): monacoEditor.languages.ProviderResult<monacoEditor.languages.CompletionList> => {

        const word = model.getWordUntilPosition(position);

        const range = {
          startLineNumber: position.lineNumber,
          endLineNumber: position.lineNumber,
          startColumn: word.startColumn,
          endColumn: word.endColumn
        };

        return {
          suggestions: [{
            label: "Feature",
            kind: monacoEditor.languages.CompletionItemKind.Keyword,
            insertText: "Feature ",
            range: range
          },
          {
            label: "Background",
            kind: monacoEditor.languages.CompletionItemKind.Keyword,
            insertText: "Background ",
            range: range
          },
          {
            label: "Scenario",
            kind: monacoEditor.languages.CompletionItemKind.Keyword,
            insertText: "Scenario ",
            range: range
          },{
            label: "ScenarioOutline",
            kind: monacoEditor.languages.CompletionItemKind.Keyword,
            insertText: "ScenarioOutline ",
            range: range
          },
          {
            label: "ScenarioTemplate",
            kind: monacoEditor.languages.CompletionItemKind.Keyword,
            insertText: "ScenarioTemplate ",
            range: range
          },
          {
            label: "Examples",
            kind: monacoEditor.languages.CompletionItemKind.Keyword,
            insertText: "Examples ",
            range: range
          },
          {
            label: "Rule",
            kind: monacoEditor.languages.CompletionItemKind.Keyword,
            insertText: "Rule ",
            range: range
          }, {
            label: "Given",
            kind: monacoEditor.languages.CompletionItemKind.Keyword,
            insertText: "Given ",
            range: range
          },
          {
            label: "When",
            kind: monacoEditor.languages.CompletionItemKind.Keyword,
            insertText: "When ",
            range: range
          },
          {
            label: "Then",
            kind: monacoEditor.languages.CompletionItemKind.Keyword,
            insertText: "Then ",
            range: range
          },
          {
            label: "And",
            kind: monacoEditor.languages.CompletionItemKind.Keyword,
            insertText: "And ",
            range: range
          }, {
            label: "But",
            kind: monacoEditor.languages.CompletionItemKind.Keyword,
            insertText: "But ",
            range: range
          },
          {
            label: "Datatable", 
            kind: monacoEditor.languages.CompletionItemKind.Snippet,
            insertText: "Examples:\n    | column | column |\n    |    x   |    x   |\n    |    x   |    x   |",
            range: range
          }]
        };
      }
    });

  }

  const onEditorChange = async (value: string, event: monacoEditor.editor.IModelContentChangedEvent) => {

    setGherkin(value);

    const workItemFormService = await SDK.getService<IWorkItemFormService>(
      WorkItemTrackingServiceIds.WorkItemFormService
    );

    var fieldName = SDK.getConfiguration().witInputs["GherkinFieldName"];

    await workItemFormService.setFieldValue(fieldName, value);
  }

  if(loading) return null;

  return (
    <React.Fragment> 
      <MonacoEditor
        height="600"
        theme="gherkin-theme"
        options={{ selectOnLineNumbers: true }}     
        language="gherkin"
        editorWillMount={onEditorWillMount}
        editorDidMount={onEditorDidMount}
        onChange={onEditorChange}
        value={gherkin}
      />
    </React.Fragment> 
  );
};


ReactDOM.render(<Gherkin />, document.getElementById("root"));
