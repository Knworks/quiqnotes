import * as assert from 'assert';
import * as path from 'path';
import * as vscode from 'vscode';
import { buildTemplateFileName, confirmTemplateDeletion, validateTemplateCreation } from '../extension';

suite('テンプレート CRUD ロジック', () => {
	test('拡張子は常に .txt を付与する', () => {
		const name = buildTemplateFileName(' meeting-notes ');
		assert.strictEqual(name, 'meeting-notes.txt');

		const withExt = buildTemplateFileName('agenda.md');
		assert.strictEqual(withExt, 'agenda.txt');
	});

	test('同名テンプレートが存在する場合は作成できない', async () => {
		const folder = vscode.Uri.file(path.join(process.cwd(), 'templates'));
		const existsTarget = vscode.Uri.joinPath(folder, 'agenda.txt');

		const result = await validateTemplateCreation(folder, 'agenda', async (uri) => uri.toString() === existsTarget.toString());

		assert.deepStrictEqual(result, { error: 'exists' });
	});

	test('削除確認でキャンセルすると処理しない', async () => {
		let prompt = '';
		const confirmed = await confirmTemplateDeletion('agenda', async (message) => {
			prompt = message;
			return false;
		});

		assert.strictEqual(confirmed, false);
		assert.ok(prompt.length > 0);
	});
});
