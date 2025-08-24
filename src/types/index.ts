export interface TemplateConfig {
  name            : string;
  description     : string;
  files           : TemplateFile[];
  dependencies    : Record<string, string>;
  devDependencies : Record<string, string>;
  scripts         : Record<string, string>;
  steps          ?: [];
}

export interface TemplateFile {
  source      : string;
  destination : string;
  condition  ?: string;
}

export interface ProjectOptions {
  stack: string;
}
