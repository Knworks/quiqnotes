import * as assert from 'assert';
import { DEFAULT_SETTINGS } from '../settings';
import { applyTemplateVariables, buildFileName, ensureUniqueFileName } from '../extension';

suite('ノート命名ロジック', () => {
	test('プレースホルダーを置換して大文字小文字を保持したファイル名を生成する', () => {
		const fixedDate = new Date('2025-01-02T03:04:05');
		const fileName = buildFileName(fixedDate, ' My Title ', 'txt', DEFAULT_SETTINGS);

		assert.strictEqual(fileName, '2025-01-02_030405_My-Title.txt');
	});

	test('replaces date_mdy/date_dmy placeholders in file name format', () => {
		const fixedDate = new Date('2025-01-02T03:04:05');
		const settings = { ...DEFAULT_SETTINGS, fileFormat: '{date_mdy}_{date_dmy}.{ext}' };

		const fileName = buildFileName(fixedDate, 'Title', 'txt', settings);

		assert.strictEqual(fileName, '01-02-2025_02-01-2025.txt');
	});

	test('タイトルが空の場合は既定タイトルを使用する', () => {
		const fixedDate = new Date('2025-01-02T03:04:05');
		const fileName = buildFileName(fixedDate, '   ', 'md', DEFAULT_SETTINGS);

		assert.strictEqual(fileName, '2025-01-02_030405_NewNote.md');
	});

	test('入力タイトル内の置換子を展開してファイル名に反映する', () => {
		const fixedDate = new Date('2025-01-02T03:04:05');
		const fileName = buildFileName(fixedDate, '{date}-New Note', 'md', DEFAULT_SETTINGS);

		assert.strictEqual(fileName, '2025-01-02_030405_2025-01-02-New-Note.md');
	});

	test('既存ファイルと衝突する場合は連番を付与する', async () => {
		const existing = new Set<string>(['note.md', 'note-1.md', 'note-2.md']);

		const unique = await ensureUniqueFileName('note.md', async (candidate) => existing.has(candidate));

		assert.strictEqual(unique, 'note-3.md');
	});

	test('テンプレート本文の置換を行う', () => {
		const content = 'Date:{date} MDY:{date_mdy} DMY:{date_dmy} Time:{datetime} Title:{title} Ext:{ext}';
		const replaced = applyTemplateVariables(content, {
			date: '2025-01-02',
			dateMdy: '01-02-2025',
			dateDmy: '02-01-2025',
			datetime: '030405',
			title: 'my-title',
			ext: 'md',
		});

		assert.strictEqual(replaced, 'Date:2025-01-02 MDY:01-02-2025 DMY:02-01-2025 Time:030405 Title:my-title Ext:md');
	});
});
