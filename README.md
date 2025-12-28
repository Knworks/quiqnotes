# Quiq Notes

This is an extension that allows you to quickly create template-based notes from the command palette.

## Quick Start

Adds a new note with simple operations.

![Quick Start1](https://github.com/Knworks/quiqnotes/raw/HEAD/images/quiq_start1.gif)

Adds a new note using a specified template.

![Quick Start2](https://github.com/Knworks/quiqnotes/raw/HEAD/images/quiq_start2.gif)

## Commands & Usage

### `Quiq Notes: Create New Note`

1. Select the target folder in the Explorer. (If no folder is selected, this command cannot be executed.)
2. Run `Quiq Notes: Create New Note` from the Command Palette.
3. Enter a title. (If left empty, the default title is used. Date/time placeholders such as `{date}` are replaced in the file name.)
4. Select a file extension. (This is shown only when extensions are configured. If not configured, `.md` is always used.)
5. Select a template. (Shown only when template files exist. The first entry is `Not applicable`.)
6. The note is created and opened in the editor. (If a file with the same name already exists, a sequential number is appended.)

### `Quiq Notes: Create New Template`

1. Run `Quiq Notes: Create New Template` from the Command Palette. (You must configure the template folder in the settings beforehand.)
2. Enter a template name.
3. The template is created and opened in the editor. (The file extension is always `.txt`.)

### `Quiq Notes: Open Template`

1. Run `Quiq Notes: Open Template` from the Command Palette. (You must configure the template folder in the settings beforehand.)
2. Choose a template from the list and it will be opened in the editor.

### `Quiq Notes: Delete Template`

1. Run `Quiq Notes: Delete Template` from the Command Palette. (You must configure the template folder in the settings beforehand.)
2. Select a template from the list, and confirm deletion by choosing **OK** in the confirmation dialog.

## Settings

| Key | Default | Description |
| --- | --- | --- |
| `quiqNotes.fileName` | `NewNote` | Default title when none is entered. |
| `quiqNotes.fileExtensions` | *(blank)* | Comma-separated extensions (e.g., `md,txt`). Blank uses `.md` and hides the picker. |
| `quiqNotes.fileFormat` | `{date}_{datetime}_{title}.{ext}` | Filename format. Placeholders: `{date}`, `{date_mdy}`, `{date_dmy}`, `{datetime}`, `{title}`, `{ext}`. |
| `quiqNotes.templateFolder` | *(blank)* | Absolute or workspace-relative template folder path. |

## Template Variables

When a template is selected, the template body also supports these placeholders:
`{date}`, `{date_mdy}`, `{date_dmy}`, `{datetime}`, `{title}`, `{ext}`.

The note title input also supports `{date}`, `{date_mdy}`, `{date_dmy}`, `{datetime}` for file name expansion.

## Privacy / Telemetry

This extension does not send any usage data (telemetry).

## License

MIT
